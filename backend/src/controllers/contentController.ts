import { Request, Response } from 'express';
import { db } from '../config/db.js';

// ==================== NOTICES / NOTIFICATIONS ====================

export const getNotices = (req: Request, res: Response): void => {
  try {
    const { gramPanchayat, taluka } = req.query;
    let query = 'SELECT * FROM notices WHERE 1=1';
    const params: any[] = [];

    if (gramPanchayat) {
      query += ' AND (gram_panchayat LIKE ? OR gram_panchayat = ?)';
      params.push(`%${gramPanchayat}%`, gramPanchayat);
    }

    if (taluka) {
      query += ' AND (taluka LIKE ? OR taluka = ?)';
      params.push(`%${taluka}%`, taluka);
    }

    query += ' ORDER BY date DESC';
    const notices = db.prepare(query).all(...params);
    const formatted = notices.map((n: any) => ({
      id: n.id,
      type: n.type,
      titleMr: n.title_mr,
      titleEn: n.title_en,
      descriptionMr: n.description_mr,
      descriptionEn: n.description_en,
      date: n.date,
      time: n.time,
      venue: n.venue,
      gramPanchayat: n.gram_panchayat || '',
      taluka: n.taluka || '',
      district: n.district || '',
      isHighPriority: Boolean(n.is_urgent),
      attachmentUrl: n.attachment_url
    }));
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notices' });
  }
};

export const addNotice = (req: Request, res: Response): void => {
  try {
    const {
      type = 'GramSabha',
      titleMr,
      titleEn,
      descriptionMr,
      descriptionEn,
      time,
      venue,
      gramPanchayat = '',
      taluka = '',
      district = '',
      isHighPriority
    } = req.body;

    const id = `not-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO notices (
        id, type, title_mr, title_en, description_mr, description_en,
        date, time, venue, gram_panchayat, taluka, district, is_urgent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, type, titleMr, titleEn || titleMr, descriptionMr || '', descriptionEn || descriptionMr || '',
      date, time || 'सकाळी १०:०० वाजता', venue || `ग्रामपंचायत सभागृह, ${gramPanchayat || 'कार्यालय'}`,
      gramPanchayat, taluka, district, isHighPriority ? 1 : 0
    );

    res.status(201).json({
      success: true,
      message: 'सूचना यशस्वीरीत्या प्रसिद्ध करण्यात आली!',
      data: { id, titleMr, date, gramPanchayat }
    });
  } catch (error) {
    console.error('Error adding notice:', error);
    res.status(500).json({ success: false, message: 'Failed to add notice' });
  }
};

// ==================== DEVELOPMENT PROJECTS ====================

export const getProjects = (req: Request, res: Response): void => {
  try {
    const { gramPanchayat, taluka } = req.query;
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params: any[] = [];

    if (gramPanchayat) {
      query += ' AND (gram_panchayat LIKE ? OR gram_panchayat = ?)';
      params.push(`%${gramPanchayat}%`, gramPanchayat);
    }

    if (taluka) {
      query += ' AND (taluka LIKE ? OR taluka = ?)';
      params.push(`%${taluka}%`, taluka);
    }

    query += ' ORDER BY start_date DESC';
    const projects = db.prepare(query).all(...params);
    const formatted = projects.map((p: any) => ({
      id: p.id,
      titleMr: p.name_mr,
      titleEn: p.name_en,
      wardNo: p.ward_no || 'Ward 1',
      gramPanchayat: p.gram_panchayat || '',
      taluka: p.taluka || '',
      district: p.district || '',
      allocatedBudget: Number(p.sanctioned_amount) || 0,
      spentBudget: Number(p.spent_amount) || 0,
      progressPercentage: Number(p.progress_percentage) || 0,
      status: p.status || 'in_progress',
      contractor: p.contractor_name || 'ग्रामपंचायत बांधकाम समिती',
      startDate: p.start_date || '2026-04-01',
      targetEndDate: p.target_date || '2026-12-31',
      photos: []
    }));
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

export const addProject = (req: Request, res: Response): void => {
  try {
    const {
      titleMr,
      titleEn,
      wardNo = 'Ward 1',
      gramPanchayat = '',
      taluka = '',
      district = '',
      allocatedBudget = 0,
      spentBudget = 0,
      contractor = '',
      startDate,
      targetEndDate
    } = req.body;

    const id = `prj-${Date.now()}`;
    const start = startDate || new Date().toISOString().split('T')[0];
    const target = targetEndDate || '2026-12-31';

    db.prepare(`
      INSERT INTO projects (
        id, name_mr, name_en, ward_no, gram_panchayat, taluka, district,
        sanctioned_amount, spent_amount, contractor_name, start_date, target_date, progress_percentage, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 10, 'in_progress')
    `).run(
      id, titleMr, titleEn || titleMr, wardNo, gramPanchayat, taluka, district,
      Number(allocatedBudget) || 0, Number(spentBudget) || 0, contractor, start, target
    );

    res.status(201).json({
      success: true,
      message: 'विकासकाम प्रकल्प यशस्वीरीत्या नोंदवला गेला!',
      data: { id, titleMr, gramPanchayat }
    });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ success: false, message: 'Failed to add project' });
  }
};

// ==================== DYNAMIC GOVT SCHEMES ====================

export const getSchemes = (req: Request, res: Response): void => {
  try {
    const { gramPanchayat, taluka, category } = req.query;
    let query = 'SELECT * FROM schemes WHERE is_active = 1';
    const params: any[] = [];

    if (gramPanchayat) {
      query += ' AND (gram_panchayat LIKE ? OR gram_panchayat = ?)';
      params.push(`%${gramPanchayat}%`, gramPanchayat);
    }

    if (taluka) {
      query += ' AND (taluka LIKE ? OR taluka = ?)';
      params.push(`%${taluka}%`, taluka);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';
    const schemes = db.prepare(query).all(...params);
    const formatted = schemes.map((s: any) => ({
      id: s.id,
      nameMr: s.name_mr,
      nameEn: s.name_en,
      category: s.category,
      benefitMr: s.benefit_mr,
      benefitEn: s.benefit_en,
      eligibilityMr: typeof s.eligibility_mr === 'string' ? JSON.parse(s.eligibility_mr) : (s.eligibility_mr || []),
      eligibilityEn: typeof s.eligibility_en === 'string' ? JSON.parse(s.eligibility_en) : (s.eligibility_en || []),
      documentsMr: typeof s.documents_mr === 'string' ? JSON.parse(s.documents_mr) : (s.documents_mr || []),
      documentsEn: typeof s.documents_en === 'string' ? JSON.parse(s.documents_en) : (s.documents_en || []),
      departmentMr: s.department_mr || '',
      departmentEn: s.department_en || '',
      deadline: s.deadline,
      gramPanchayat: s.gram_panchayat || '',
      iconName: s.icon_name || 'ShieldCheck',
      applicationCount: 0
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schemes' });
  }
};

export const addScheme = (req: Request, res: Response): void => {
  try {
    const {
      nameMr,
      nameEn,
      category = 'Women & Child',
      benefitMr,
      benefitEn,
      eligibilityMr = [],
      eligibilityEn = [],
      documentsMr = [],
      documentsEn = [],
      departmentMr = '',
      departmentEn = '',
      gramPanchayat = '',
      taluka = '',
      district = '',
      iconName = 'ShieldCheck'
    } = req.body;

    const id = `sch-${Date.now()}`;

    db.prepare(`
      INSERT INTO schemes (
        id, name_mr, name_en, category, benefit_mr, benefit_en,
        eligibility_mr, eligibility_en, documents_mr, documents_en,
        department_mr, department_en, gram_panchayat, taluka, district, icon_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, nameMr, nameEn || nameMr, category, benefitMr, benefitEn || benefitMr,
      JSON.stringify(eligibilityMr), JSON.stringify(eligibilityEn),
      JSON.stringify(documentsMr), JSON.stringify(documentsEn),
      departmentMr, departmentEn, gramPanchayat, taluka, district, iconName
    );

    res.status(201).json({
      success: true,
      message: 'नवीन शासकीय योजना यशस्वीरीत्या जोडली गेली!',
      data: { id, nameMr, category, gramPanchayat }
    });
  } catch (error) {
    console.error('Error adding scheme:', error);
    res.status(500).json({ success: false, message: 'Failed to add scheme' });
  }
};

// ==================== SCHEMES APPLICATIONS & BENEFICIARIES ====================

export const getSchemeApplications = (req: Request, res: Response): void => {
  try {
    const { gramPanchayat, taluka, schemeId, phone } = req.query;
    let query = 'SELECT * FROM scheme_applications WHERE 1=1';
    const params: any[] = [];

    if (gramPanchayat) {
      query += ' AND (gram_panchayat LIKE ? OR gram_panchayat = ?)';
      params.push(`%${gramPanchayat}%`, gramPanchayat);
    }

    if (taluka) {
      query += ' AND (taluka LIKE ? OR taluka = ?)';
      params.push(`%${taluka}%`, taluka);
    }

    if (schemeId) {
      query += ' AND scheme_id = ?';
      params.push(schemeId);
    }

    if (phone) {
      query += ' AND applicant_phone LIKE ?';
      params.push(`%${phone}%`);
    }

    query += ' ORDER BY applied_date DESC';
    const records = db.prepare(query).all(...params);

    const formatted = records.map((r: any) => ({
      id: r.id,
      schemeId: r.scheme_id,
      schemeNameMr: r.scheme_name_mr,
      schemeNameEn: r.scheme_name_en,
      applicantName: r.applicant_name,
      name: r.applicant_name,
      applicantPhone: r.applicant_phone,
      phone: r.applicant_phone,
      applicantAadhaar: r.applicant_aadhaar || 'XXXX-XXXX-9999',
      aadhaar: r.applicant_aadhaar || 'XXXX-XXXX-9999',
      wardNo: r.ward_no || 'Ward 1',
      ward: r.ward_no || 'Ward 1',
      gramPanchayat: r.gram_panchayat || '',
      taluka: r.taluka || '',
      district: r.district || '',
      benefitAmount: Number(r.benefit_amount) || 1500,
      amount: Number(r.benefit_amount) || 1500,
      status: r.status === 'sanctioned' ? 'Sanctioned' : 'Pending Verification',
      appliedDate: r.applied_date,
      sanctionedDate: r.sanctioned_date,
      dbtDate: r.sanctioned_date || (r.status === 'sanctioned' ? '2026-09-01' : '-'),
      dbtStatus: r.dbt_status
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching scheme applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scheme applications' });
  }
};

export const applyForScheme = (req: Request, res: Response): void => {
  try {
    const {
      schemeId = 'sch-1',
      schemeNameMr = 'मुख्यमंत्री माझी लाडकी बहीण योजना',
      schemeNameEn = 'Mazi Ladki Bahin Yojana',
      applicantName,
      applicantPhone,
      applicantAadhaar = 'XXXX-XXXX-9999',
      wardNo = 'Ward 1',
      gramPanchayat = '',
      taluka = '',
      district = '',
      benefitAmount = 1500
    } = req.body;

    if (!applicantName || !applicantPhone) {
      res.status(400).json({ success: false, message: 'अर्जदाराचे नाव व फोन नंबर आवश्यक आहे' });
      return;
    }

    const id = `app-sch-${Date.now()}`;
    const appliedDate = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO scheme_applications (
        id, scheme_id, scheme_name_mr, scheme_name_en, applicant_name,
        applicant_phone, applicant_aadhaar, ward_no, gram_panchayat,
        taluka, district, benefit_amount, status, applied_date, dbt_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'pending')
    `).run(
      id, schemeId, schemeNameMr, schemeNameEn, applicantName,
      applicantPhone, applicantAadhaar, wardNo, gramPanchayat,
      taluka, district, Number(benefitAmount) || 1500, appliedDate
    );

    const created = db.prepare('SELECT * FROM scheme_applications WHERE id = ?').get(id);
    res.status(201).json({
      success: true,
      message: 'शासकीय योजनेचा अर्ज यशस्वीरीत्या नोंदवला गेला!',
      data: created
    });
  } catch (error) {
    console.error('Error applying for scheme:', error);
    res.status(500).json({ success: false, message: 'योजना अर्ज करताना त्रुटी आली' });
  }
};

export const updateSchemeApplicationStatus = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status = 'sanctioned', dbtStatus = 'linked' } = req.body;

    const sanctionedDate = status === 'sanctioned' ? new Date().toISOString().split('T')[0] : null;

    db.prepare(`
      UPDATE scheme_applications SET
        status = ?, sanctioned_date = ?, dbt_status = ?
      WHERE id = ?
    `).run(status, sanctionedDate, dbtStatus, id);

    const updated = db.prepare('SELECT * FROM scheme_applications WHERE id = ?').get(id);
    res.json({
      success: true,
      message: 'लाभार्थी अर्ज मंजूर करण्यात आला व DBT प्रणालीशी लिंक केला!',
      data: updated
    });
  } catch (error) {
    console.error('Error updating scheme application:', error);
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
};
