import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { sendCertificateStatusSms } from '../utils/smsService.js';

export const getCertificates = (req: Request, res: Response): void => {
  try {
    const { phone, status, gramPanchayat, taluka } = req.query;
    let query = 'SELECT * FROM certificates';
    const params: any[] = [];
    const conditions: string[] = [];

    // 🛡️ Multi-Tenant & IDOR Data Scoping
    if (req.user) {
      if (req.user.role === 'citizen' && req.user.phone) {
        const last10 = req.user.phone.replace(/\D/g, '').slice(-10);
        conditions.push('applicant_phone LIKE ?');
        params.push(`%${last10}%`);
      } else if (['sarpanch', 'upsarpanch', 'gram_sevak', 'sadasya', 'clerk'].includes(req.user.role) && req.user.gramPanchayat) {
        conditions.push('(gram_panchayat LIKE ? OR gram_panchayat = ?)');
        params.push(`%${req.user.gramPanchayat}%`, req.user.gramPanchayat);
      } else if (req.user.role === 'taluka_bdo' && req.user.taluka) {
        conditions.push('(taluka LIKE ? OR taluka = ?)');
        params.push(`%${req.user.taluka}%`, req.user.taluka);
      }
    }

    if (phone && (!req.user || req.user.role !== 'citizen')) {
      conditions.push('applicant_phone LIKE ?');
      params.push(`%${phone}%`);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (gramPanchayat && (!req.user || ['admin', 'taluka_bdo'].includes(req.user.role))) {
      conditions.push('(gram_panchayat LIKE ? OR gram_panchayat = ?)');
      params.push(`%${gramPanchayat}%`, gramPanchayat);
    }
    if (taluka && (!req.user || req.user.role === 'admin')) {
      conditions.push('(taluka LIKE ? OR taluka = ?)');
      params.push(`%${taluka}%`, taluka);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY applied_date DESC';

    const certs = db.prepare(query).all(...params);
    res.json({
      success: true,
      count: certs.length,
      data: certs.map(formatCert)
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
  }
};

export const applyCertificate = (req: Request, res: Response): void => {
  try {
    const {
      type,
      applicantName,
      applicantPhone,
      applicantAadhaar,
      wardNo = 'Ward 1',
      houseNo,
      gramPanchayat = '',
      taluka = '',
      district = '',
      reason = 'शासकीय व शैक्षणिक कामासाठी',
      details = {}
    } = req.body;

    if (!type || !applicantName || !applicantPhone || !houseNo) {
      res.status(400).json({ success: false, message: 'Missing mandatory certificate fields' });
      return;
    }

    const id = `cert-${Date.now()}`;
    const year = new Date().getFullYear();
    const randNo = Math.floor(1000 + Math.random() * 9000);
    const applicationNo = `GP-${year}-${randNo}`;
    const appliedDate = new Date().toISOString().split('T')[0];
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '{}');

    db.prepare(`
      INSERT INTO certificates (
        id, application_no, type, applicant_name, applicant_phone, applicant_aadhaar, 
        ward_no, house_no, gram_panchayat, taluka, district, reason, status, applied_date, details
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(id, applicationNo, type, applicantName, applicantPhone, applicantAadhaar || null, wardNo, houseNo, gramPanchayat, taluka, district, reason, appliedDate, detailsStr);

    const newCert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id);
    res.status(201).json({
      success: true,
      message: 'Certificate application submitted successfully',
      data: formatCert(newCert)
    });
  } catch (error) {
    console.error('Error submitting certificate:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
};

export const updateCertificateStatus = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, remarks, approvedBy } = req.body;
    const idStr = String(id);

    const currentCert: any = db.prepare('SELECT * FROM certificates WHERE id = ?').get(idStr);
    if (!currentCert) {
      res.status(404).json({ success: false, message: 'Certificate application not found' });
      return;
    }

    let digitalSig = currentCert.digital_signature;
    let qrCode = currentCert.qr_code;
    let certNumber = currentCert.certificate_number;
    let processedDate = currentCert.processed_date;

    if (status === 'approved') {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const distCode = (currentCert.district || 'MAHA').slice(0, 3).toUpperCase();
      const talCode = (currentCert.taluka || 'TAL').slice(0, 3).toUpperCase();
      certNumber = certNumber || `MH-${distCode}-${talCode}-${year}-${(currentCert.type || 'CERT').slice(0, 3).toUpperCase()}-${rand}`;
      digitalSig = `DS-MAHA-GP-${idStr.toUpperCase()}`;
      qrCode = `GP-CERT-VERIFIED-${idStr.toUpperCase()}`;
      processedDate = new Date().toISOString().split('T')[0];
    }

    db.prepare(`
      UPDATE certificates SET 
        status = ?, remarks = ?, approved_by = ?, digital_signature = ?, qr_code = ?, certificate_number = ?, processed_date = ?
      WHERE id = ?
    `).run(status, remarks || null, approvedBy || null, digitalSig, qrCode, certNumber || null, processedDate || null, idStr);

    const updated = db.prepare('SELECT * FROM certificates WHERE id = ?').get(idStr);

    // Dispatch SMS notification to applicant
    if (currentCert.applicant_phone) {
      sendCertificateStatusSms(
        currentCert.applicant_phone,
        currentCert.applicant_name || 'नागरिक',
        currentCert.type || 'दाखला',
        status as any,
        currentCert.gram_panchayat || 'घुलेवाडी'
      ).catch(err => console.warn('⚠️ Twilio certificate SMS dispatch note:', err));
    }

    res.json({
      success: true,
      message: `Certificate marked as ${status}`,
      data: formatCert(updated)
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ success: false, message: 'Failed to update certificate' });
  }
};

// Certificate Type & Fee Tariff Controllers
export const getCertificateTypes = (req: Request, res: Response): void => {
  try {
    const { gramPanchayat, includeInactive } = req.query;
    let query = 'SELECT * FROM certificate_types';
    const params: any[] = [];
    const conditions: string[] = [];

    if (!includeInactive || includeInactive === 'false') {
      conditions.push('is_active = 1');
    }

    if (gramPanchayat) {
      conditions.push('gram_panchayat = ?');
      params.push(gramPanchayat);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at ASC, id ASC';

    const types = db.prepare(query).all(...params);
    res.json({
      success: true,
      count: types.length,
      data: types.map(formatCertType)
    });
  } catch (error) {
    console.error('Error fetching certificate types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificate types' });
  }
};

export const createCertificateType = (req: Request, res: Response): void => {
  try {
    const {
      code,
      nameMr,
      nameEn,
      fee = 0,
      deliveryDays = 2,
      descriptionMr = '',
      descriptionEn = '',
      requiredDocumentsMr = '',
      requiredDocumentsEn = '',
      gramPanchayat = null
    } = req.body;

    if (!nameMr || !nameEn) {
      res.status(400).json({ success: false, message: 'Marathi and English names are required' });
      return;
    }

    const cleanCode = (code || nameEn.toLowerCase().replace(/[^a-z0-9]/g, '_') || `cert_${Date.now()}`).trim();
    const id = `ct-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    db.prepare(`
      INSERT INTO certificate_types (
        id, code, gram_panchayat, name_mr, name_en, fee, delivery_days, 
        description_mr, description_en, required_documents_mr, required_documents_en, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      id,
      cleanCode,
      gramPanchayat || null,
      nameMr,
      nameEn,
      Number(fee) || 0,
      Number(deliveryDays) || 1,
      descriptionMr || null,
      descriptionEn || null,
      requiredDocumentsMr || null,
      requiredDocumentsEn || null
    );

    const created = db.prepare('SELECT * FROM certificate_types WHERE id = ?').get(id);
    res.status(201).json({
      success: true,
      message: 'Certificate type created successfully',
      data: formatCertType(created)
    });
  } catch (error) {
    console.error('Error creating certificate type:', error);
    res.status(500).json({ success: false, message: 'Failed to create certificate type' });
  }
};

export const updateCertificateType = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const {
      nameMr,
      nameEn,
      fee,
      deliveryDays,
      descriptionMr,
      descriptionEn,
      requiredDocumentsMr,
      requiredDocumentsEn,
      isActive
    } = req.body;

    const existing: any = db.prepare('SELECT * FROM certificate_types WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Certificate type not found' });
      return;
    }

    const updatedNameMr = nameMr !== undefined ? nameMr : existing.name_mr;
    const updatedNameEn = nameEn !== undefined ? nameEn : existing.name_en;
    const updatedFee = fee !== undefined ? Number(fee) : existing.fee;
    const updatedDeliveryDays = deliveryDays !== undefined ? Number(deliveryDays) : existing.delivery_days;
    const updatedDescMr = descriptionMr !== undefined ? descriptionMr : existing.description_mr;
    const updatedDescEn = descriptionEn !== undefined ? descriptionEn : existing.description_en;
    const updatedDocsMr = requiredDocumentsMr !== undefined ? requiredDocumentsMr : existing.required_documents_mr;
    const updatedDocsEn = requiredDocumentsEn !== undefined ? requiredDocumentsEn : existing.required_documents_en;
    const updatedIsActive = isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active;

    db.prepare(`
      UPDATE certificate_types SET
        name_mr = ?,
        name_en = ?,
        fee = ?,
        delivery_days = ?,
        description_mr = ?,
        description_en = ?,
        required_documents_mr = ?,
        required_documents_en = ?,
        is_active = ?
      WHERE id = ?
    `).run(
      updatedNameMr,
      updatedNameEn,
      updatedFee,
      updatedDeliveryDays,
      updatedDescMr,
      updatedDescEn,
      updatedDocsMr,
      updatedDocsEn,
      updatedIsActive,
      id
    );

    const updated = db.prepare('SELECT * FROM certificate_types WHERE id = ?').get(id);
    res.json({
      success: true,
      message: 'Certificate type updated successfully',
      data: formatCertType(updated)
    });
  } catch (error) {
    console.error('Error updating certificate type:', error);
    res.status(500).json({ success: false, message: 'Failed to update certificate type' });
  }
};

export const deleteCertificateType = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM certificate_types WHERE id = ?').run(id);
    res.json({ success: true, message: 'Certificate service removed successfully' });
  } catch (error) {
    console.error('Error deleting certificate type:', error);
    res.status(500).json({ success: false, message: 'Failed to delete certificate type' });
  }
};

function formatCert(c: any) {
  if (!c) return null;
  let parsedDetails = {};
  if (c.details) {
    try {
      parsedDetails = typeof c.details === 'string' ? JSON.parse(c.details) : c.details;
    } catch {
      parsedDetails = {};
    }
  }

  return {
    id: c.id,
    applicationNo: c.application_no,
    type: c.type,
    applicantName: c.applicant_name,
    applicantPhone: c.applicant_phone,
    applicantAadhaar: c.applicant_aadhaar,
    wardNo: c.ward_no,
    houseNo: c.house_no,
    gramPanchayat: c.gram_panchayat,
    taluka: c.taluka,
    district: c.district,
    reason: c.reason,
    status: c.status,
    appliedDate: c.applied_date,
    remarks: c.remarks,
    approvedBy: c.approved_by,
    processedDate: c.processed_date,
    certificateNumber: c.certificate_number,
    digitalSignature: c.digital_signature,
    qrCode: c.qr_code,
    documentUrl: c.document_url,
    details: parsedDetails
  };
}

function formatCertType(ct: any) {
  if (!ct) return null;
  return {
    id: ct.id,
    code: ct.code,
    gramPanchayat: ct.gram_panchayat,
    nameMr: ct.name_mr,
    nameEn: ct.name_en,
    fee: Number(ct.fee) || 0,
    deliveryDays: Number(ct.delivery_days) || 1,
    descriptionMr: ct.description_mr,
    descriptionEn: ct.description_en,
    requiredDocumentsMr: ct.required_documents_mr,
    requiredDocumentsEn: ct.required_documents_en,
    isActive: Boolean(ct.is_active),
    createdAt: ct.created_at
  };
}
