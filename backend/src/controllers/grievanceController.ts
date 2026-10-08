import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { sendGrievanceUpdateSms } from '../utils/smsService.js';

export const getGrievances = (req: Request, res: Response): void => {
  try {
    const { phone, status, category, gramPanchayat, taluka } = req.query;
    let query = 'SELECT * FROM grievances';
    const params: any[] = [];
    const conditions: string[] = [];

    if (phone) {
      conditions.push('citizen_phone LIKE ?');
      params.push(`%${phone}%`);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (gramPanchayat) {
      conditions.push('(gram_panchayat LIKE ? OR gram_panchayat = ?)');
      params.push(`%${gramPanchayat}%`, gramPanchayat);
    }
    if (taluka) {
      conditions.push('(taluka LIKE ? OR taluka = ?)');
      params.push(`%${taluka}%`, taluka);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY lodged_date DESC';

    const records = db.prepare(query).all(...params);
    res.json({
      success: true,
      count: records.length,
      data: records.map(formatGrievance)
    });
  } catch (error) {
    console.error('Error fetching grievances:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch grievances' });
  }
};

export const createGrievance = (req: Request, res: Response): void => {
  try {
    const {
      category,
      title,
      description,
      citizenName,
      citizenPhone,
      wardNo = 'Ward 1',
      locationDetails,
      gramPanchayat = '',
      taluka = '',
      district = '',
      photoUrl
    } = req.body;

    if (!category || !title || !citizenName || !citizenPhone) {
      res.status(400).json({ success: false, message: 'Category, title, citizen name and phone are required' });
      return;
    }

    const id = `grv-${Date.now()}`;
    const randNo = Math.floor(100 + Math.random() * 900);
    const year = new Date().getFullYear();
    const gpPrefix = (gramPanchayat || 'GP').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'MAHA';
    const tokenNo = `GRV-${gpPrefix}-${year}-${randNo}`;
    const lodgedDate = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO grievances (id, token_no, category, title, description, citizen_name, citizen_phone, ward_no, location_details, gram_panchayat, taluka, district, status, lodged_date, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
    `).run(id, tokenNo, category, title, description || null, citizenName, citizenPhone, wardNo, locationDetails || null, gramPanchayat, taluka, district, lodgedDate, photoUrl || null);

    const created = db.prepare('SELECT * FROM grievances WHERE id = ?').get(id);
    res.status(201).json({
      success: true,
      message: 'Grievance ticket raised successfully',
      data: formatGrievance(created)
    });
  } catch (error) {
    console.error('Error creating grievance:', error);
    res.status(500).json({ success: false, message: 'Failed to submit grievance' });
  }
};

export const updateGrievance = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, assignedOfficer, resolutionNotes } = req.body;

    let resDate = null;
    if (status === 'resolved') {
      resDate = new Date().toISOString().split('T')[0];
    }

    const currentGrievance: any = db.prepare('SELECT * FROM grievances WHERE id = ?').get(id);

    db.prepare(`
      UPDATE grievances SET
        status = ?, assigned_officer = ?, resolution_notes = ?, resolution_date = ?
      WHERE id = ?
    `).run(status, assignedOfficer || null, resolutionNotes || null, resDate, id);

    const updated = db.prepare('SELECT * FROM grievances WHERE id = ?').get(id);

    // Dispatch Twilio SMS notification to citizen
    if (currentGrievance && currentGrievance.citizen_phone) {
      sendGrievanceUpdateSms(
        currentGrievance.citizen_phone,
        currentGrievance.token_no || id,
        status === 'resolved' ? 'निवारण झाले' : status,
        currentGrievance.gram_panchayat || 'घुलेवाडी'
      ).catch(err => console.warn('⚠️ Twilio grievance SMS dispatch note:', err));
    }

    res.json({
      success: true,
      message: `Grievance ticket status updated to ${status}`,
      data: formatGrievance(updated)
    });
  } catch (error) {
    console.error('Error updating grievance:', error);
    res.status(500).json({ success: false, message: 'Failed to update grievance' });
  }
};

function formatGrievance(g: any) {
  if (!g) return null;
  return {
    id: g.id,
    tokenNo: g.token_no,
    category: g.category,
    title: g.title,
    description: g.description,
    citizenName: g.citizen_name,
    citizenPhone: g.citizen_phone,
    wardNo: g.ward_no,
    locationDetails: g.location_details,
    gramPanchayat: g.gram_panchayat,
    taluka: g.taluka,
    district: g.district,
    status: g.status,
    lodgedDate: g.lodged_date,
    photoUrl: g.photo_url,
    assignedOfficer: g.assigned_officer,
    resolutionNotes: g.resolution_notes,
    resolutionDate: g.resolution_date
  };
}
