"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCitizenLocker = exports.submitGramSabhaDemand = exports.getGramSabhaDemands = exports.broadcastDawandi = exports.getDigitalDawandi = exports.getEmergencyDirectory = exports.getApmcRates = exports.getElectricityAlerts = exports.updateWaterSchedule = exports.getWaterSchedule = void 0;
const db_js_1 = require("../config/db.js");
const auditLog_js_1 = require("../db/auditLog.js");
// ==============================================================================
// 1. 💧 WATER SUPPLY SCHEDULE (आज पाणी कधी सुटणार?)
// ==============================================================================
const getWaterSchedule = (req, res) => {
    try {
        const { gramPanchayat, wardNo } = req.query;
        let query = 'SELECT * FROM water_schedules WHERE 1=1';
        const params = [];
        if (gramPanchayat) {
            query += ' AND (gram_panchayat LIKE ? OR gram_panchayat = ?)';
            params.push(`%${gramPanchayat}%`, gramPanchayat);
        }
        if (wardNo) {
            query += ' AND ward_no = ?';
            params.push(wardNo);
        }
        query += ' ORDER BY ward_no ASC';
        const records = db_js_1.db.prepare(query).all(...params);
        // Fallback seed data for demo villages if empty
        if (records.length === 0 && gramPanchayat) {
            const defaultSchedules = [
                { id: `ws-${Date.now()}-1`, gp: gramPanchayat, ward: 'Ward 1', area: 'गावठाण व बाजारपेठ', morning: '०६:०० ते ०८:०० AM', evening: '०५:०० ते ०७:०० PM', opName: 'सुरेश वाकचौरे', opPhone: '9822301122', status: 'ON_TIME' },
                { id: `ws-${Date.now()}-2`, gp: gramPanchayat, ward: 'Ward 2', area: 'शिवाजी नगर व हनुमान वस्ती', morning: '०८:०० ते १०:०० AM', evening: '०७:०० ते ०८:३० PM', opName: 'सुरेश वाकचौरे', opPhone: '9822301122', status: 'ON_TIME' },
                { id: `ws-${Date.now()}-3`, gp: gramPanchayat, ward: 'Ward 3', area: 'आंबेडकर नगर व मळा परिसर', morning: '१०:०० ते १२:०० PM', evening: 'पाणी नाही', opName: 'दत्तात्रय थोरात', opPhone: '9850123344', status: 'DELAYED' },
            ];
            for (const s of defaultSchedules) {
                db_js_1.db.prepare(`
          INSERT INTO water_schedules (id, gram_panchayat, ward_no, area_name, morning_time, evening_time, status, operator_name, operator_phone)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(s.id, s.gp, s.ward, s.area, s.morning, s.evening, s.status, s.opName, s.opPhone);
            }
            const refreshed = db_js_1.db.prepare(query).all(...params);
            res.json({ success: true, count: refreshed.length, data: refreshed });
            return;
        }
        res.json({ success: true, count: records.length, data: records });
    }
    catch (error) {
        console.error('Error in getWaterSchedule:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch water schedule' });
    }
};
exports.getWaterSchedule = getWaterSchedule;
const updateWaterSchedule = (req, res) => {
    try {
        const { id, gramPanchayat, wardNo, areaName, morningTime, eveningTime, status, operatorName, operatorPhone, notesMr } = req.body;
        const scheduleId = id || `ws-${Date.now()}`;
        db_js_1.db.prepare(`
      INSERT INTO water_schedules (
        id, gram_panchayat, ward_no, area_name, morning_time, evening_time, status, operator_name, operator_phone, notes_mr, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        morning_time = excluded.morning_time,
        evening_time = excluded.evening_time,
        status = excluded.status,
        operator_name = excluded.operator_name,
        operator_phone = excluded.operator_phone,
        notes_mr = excluded.notes_mr,
        updated_at = CURRENT_TIMESTAMP
    `).run(scheduleId, gramPanchayat, wardNo, areaName, morningTime, eveningTime, status, operatorName, operatorPhone, notesMr || '');
        (0, auditLog_js_1.logAuditEvent)({ action: 'WATER_SCHEDULE_UPDATED', resourceType: 'WATER_SCHEDULE', resourceId: scheduleId, req });
        res.json({ success: true, message: 'पाणीपुरवठा वेळापत्रक अद्यतनित केले!' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update water schedule' });
    }
};
exports.updateWaterSchedule = updateWaterSchedule;
// ==============================================================================
// 2. ⚡ ELECTRICITY & MSEDCL OUTAGE ALERTS (महावितरण वीज खंडित सूचना)
// ==============================================================================
const getElectricityAlerts = (req, res) => {
    try {
        const { gramPanchayat } = req.query;
        let query = 'SELECT * FROM electricity_alerts WHERE is_active = 1';
        const params = [];
        if (gramPanchayat) {
            query += ' AND (gram_panchayat LIKE ? OR gram_panchayat = ?)';
            params.push(`%${gramPanchayat}%`, gramPanchayat);
        }
        query += ' ORDER BY created_at DESC';
        const records = db_js_1.db.prepare(query).all(...params);
        if (records.length === 0 && gramPanchayat) {
            const defaultAlert = {
                id: `elec-${Date.now()}`,
                gp: gramPanchayat,
                feeder: 'घुलेवाडी ११ केव्ही फिडर',
                area: 'समस्त गावठाण परिसर',
                type: 'SCHEDULED',
                start: 'गुरुवार सकाळी १०:००',
                end: 'दुपारी ०२:००',
                reason: 'डीपी दुरुस्ती व लाईन मेंटेनन्स काम चालू असल्याने वीज पुरवठा बंद राहील.',
                lineman: 'संजय गायकवाड (वायरमन)',
                phone: '9822456789'
            };
            db_js_1.db.prepare(`
        INSERT INTO electricity_alerts (id, gram_panchayat, feeder_name, area_name, outage_type, start_time, expected_end_time, reason_mr, lineman_name, lineman_phone, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(defaultAlert.id, defaultAlert.gp, defaultAlert.feeder, defaultAlert.area, defaultAlert.type, defaultAlert.start, defaultAlert.end, defaultAlert.reason, defaultAlert.lineman, defaultAlert.phone);
            const refreshed = db_js_1.db.prepare(query).all(...params);
            res.json({ success: true, count: refreshed.length, data: refreshed });
            return;
        }
        res.json({ success: true, count: records.length, data: records });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch electricity alerts' });
    }
};
exports.getElectricityAlerts = getElectricityAlerts;
// ==============================================================================
// 3. 🌾 APMC MANDI MARKET RATES (आजचे कृषी बाजारभाव)
// ==============================================================================
const getApmcRates = (req, res) => {
    try {
        const { marketName, commodity } = req.query;
        let query = 'SELECT * FROM apmc_market_rates WHERE 1=1';
        const params = [];
        if (marketName) {
            query += ' AND market_name LIKE ?';
            params.push(`%${marketName}%`);
        }
        if (commodity) {
            query += ' AND (commodity_name_mr LIKE ? OR commodity_name_en LIKE ?)';
            params.push(`%${commodity}%`, `%${commodity}%`);
        }
        query += ' ORDER BY report_date DESC, modal_price DESC';
        let records = db_js_1.db.prepare(query).all(...params);
        if (records.length === 0) {
            const today = new Date().toISOString().split('T')[0];
            const defaultRates = [
                { id: `apmc-1`, market: 'संगमनेर कृषी उत्पन्न बाजार समिती', commMr: 'कांदा (लाल)', commEn: 'Onion Red', variety: 'स्थानिक', min: 1800, max: 2850, modal: 2400, unit: 'क्विंटल', date: today },
                { id: `apmc-2`, market: 'संगमनेर कृषी उत्पन्न बाजार समिती', commMr: 'टोमॅटो', commEn: 'Tomato', variety: 'हायब्रीड', min: 1200, max: 2100, modal: 1650, unit: 'क्विंटल', date: today },
                { id: `apmc-3`, market: 'अहिल्यानगर मुख्य बाजार समिती', commMr: 'सोयाबीन', commEn: 'Soybean', variety: 'पिवळा', min: 4100, max: 4650, modal: 4400, unit: 'क्विंटल', date: today },
                { id: `apmc-4`, market: 'नाशिक बाजार समिती', commMr: 'डाळिंब', commEn: 'Pomegranate', variety: 'भगवा', min: 4500, max: 9200, modal: 6800, unit: 'क्विंटल', date: today },
                { id: `apmc-5`, market: 'संगमनेर बाजार समिती', commMr: 'दूध (गाय)', commEn: 'Cow Milk', variety: '३.५ फॅट', min: 28, max: 35, modal: 32, unit: 'प्रति लिटर', date: today }
            ];
            for (const r of defaultRates) {
                db_js_1.db.prepare(`
          INSERT OR IGNORE INTO apmc_market_rates (id, market_name, commodity_name_mr, commodity_name_en, variety, min_price, max_price, modal_price, unit, report_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(r.id, r.market, r.commMr, r.commEn, r.variety, r.min, r.max, r.modal, r.unit, r.date);
            }
            records = db_js_1.db.prepare(query).all(...params);
        }
        res.json({ success: true, count: records.length, data: records });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch APMC rates' });
    }
};
exports.getApmcRates = getApmcRates;
// ==============================================================================
// 4. 🚨 EMERGENCY & VILLAGE ESSENTIAL CONTACTS (आपत्कालीन डिरेक्टरी)
// ==============================================================================
const getEmergencyDirectory = (req, res) => {
    try {
        const { gramPanchayat } = req.query;
        let query = 'SELECT * FROM emergency_directory WHERE 1=1';
        const params = [];
        if (gramPanchayat) {
            query += ' AND (gram_panchayat LIKE ? OR gram_panchayat = ?)';
            params.push(`%${gramPanchayat}%`, gramPanchayat);
        }
        query += ' ORDER BY is_emergency_service DESC, category ASC';
        let records = db_js_1.db.prepare(query).all(...params);
        if (records.length === 0 && gramPanchayat) {
            const defaultContacts = [
                { id: `em-1`, gp: gramPanchayat, cat: 'आरोग्य', desig: 'प्राथमिक आरोग्य केंद्र व १०८ रुग्णवाहिका', name: 'डॉ. कदम (वैद्यकीय अधिकारी)', phone: '108', alt: '02425-225108', hours: '२४ तास उपलब्ध', em: 1 },
                { id: `em-2`, gp: gramPanchayat, cat: 'महसूल व पोलीस', desig: 'तलाठी कार्यालय', name: 'श्री. पाटील (तलाठी सजा)', phone: '9822104567', alt: '', hours: '१०:०० ते ०५:००', em: 0 },
                { id: `em-3`, gp: gramPanchayat, cat: 'महसूल व पोलीस', desig: 'पोलीस पाटील', name: 'श्री. घुले (पोलीस पाटील)', phone: '9850234567', alt: '112', hours: '२४ तास उपलब्ध', em: 1 },
                { id: `em-4`, gp: gramPanchayat, cat: 'महिला व बालविकास', desig: 'आशा सेविका (आरोग्य सखी)', name: 'श्रीमती सुनिता शिंदे', phone: '9860345678', alt: '', hours: 'सकाळी ०८:०० ते संध्या. ०८:००', em: 1 },
                { id: `em-5`, gp: gramPanchayat, cat: 'वीज पुरवठा', desig: 'महावितरण वायरमन', name: 'श्री. गायकवाड (लाईनमन)', phone: '9822456789', alt: '1912', hours: '२४ तास इमर्जन्सी', em: 1 },
                { id: `em-6`, gp: gramPanchayat, cat: 'पशुसंवर्धन', desig: 'पशुवैद्यकीय दवाखाना', name: 'डॉ. जगताप (पशुवैद्यकीय अधिकारी)', phone: '9823567890', alt: '', hours: '०९:०० ते ०४:००', em: 0 },
            ];
            for (const c of defaultContacts) {
                db_js_1.db.prepare(`
          INSERT INTO emergency_directory (id, gram_panchayat, category, designation_mr, person_name, phone, alternate_phone, available_hours, is_emergency_service)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(c.id, c.gp, c.cat, c.desig, c.name, c.phone, c.alt, c.hours, c.em);
            }
            records = db_js_1.db.prepare(query).all(...params);
        }
        res.json({ success: true, count: records.length, data: records });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch emergency directory' });
    }
};
exports.getEmergencyDirectory = getEmergencyDirectory;
// ==============================================================================
// 5. 📢 DIGITAL DAWANDI (डिजिटल दवंडी व ध्वनी घोषणा)
// ==============================================================================
const getDigitalDawandi = (req, res) => {
    try {
        const { gramPanchayat } = req.query;
        let query = 'SELECT * FROM digital_dawandi WHERE 1=1';
        const params = [];
        if (gramPanchayat) {
            query += ' AND (gram_panchayat LIKE ? OR gram_panchayat = ?)';
            params.push(`%${gramPanchayat}%`, gramPanchayat);
        }
        query += ' ORDER BY created_at DESC LIMIT 20';
        let records = db_js_1.db.prepare(query).all(...params);
        if (records.length === 0 && gramPanchayat) {
            const defaultDawandi = [
                {
                    id: `daw-${Date.now()}-1`,
                    gp: gramPanchayat,
                    title: '🚨 मोफत आरोग्य तपासणी व नेत्र चिकित्सा शिबिर',
                    text: 'सर्व ग्रामस्थांना कळविण्यात येते की, येत्या रविवारी ग्रामपंचायत सभागृहात जिल्हा रुग्णालयातर्फे मोफत नेत्र व आरोग्य शिबिर आयोजित केले आहे. सर्व ज्येष्ठ नागरिकांनी लाभ घ्यावा.',
                    prio: 'URGENT',
                    byRole: 'सरपंच',
                    byName: 'ग्रामपंचायत प्रशासन'
                },
                {
                    id: `daw-${Date.now()}-2`,
                    gp: gramPanchayat,
                    title: '💧 पाणीपट्टी व घरपट्टी ५% सवलत मुदत',
                    text: 'चालू आर्थिक वर्षाची घरपट्टी ३१ ऑक्टोबर पूर्वी ऑनलाइन किंवा कार्यालयात भरणाऱ्या मिळकतधारकांना ५% विशेष सवलत देण्यात येत आहे.',
                    prio: 'NORMAL',
                    byRole: 'ग्रामसेवक',
                    byName: 'कर संकलन विभाग'
                }
            ];
            for (const d of defaultDawandi) {
                db_js_1.db.prepare(`
          INSERT INTO digital_dawandi (id, gram_panchayat, title_mr, announcement_text, priority_level, issued_by_role, issued_by_name)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(d.id, d.gp, d.title, d.text, d.prio, d.byRole, d.byName);
            }
            records = db_js_1.db.prepare(query).all(...params);
        }
        res.json({ success: true, count: records.length, data: records });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch dawandi announcements' });
    }
};
exports.getDigitalDawandi = getDigitalDawandi;
const broadcastDawandi = (req, res) => {
    try {
        const { gramPanchayat, titleMr, announcementText, priorityLevel = 'NORMAL', issuedByRole, issuedByName } = req.body;
        const id = `daw-${Date.now()}`;
        db_js_1.db.prepare(`
      INSERT INTO digital_dawandi (id, gram_panchayat, title_mr, announcement_text, priority_level, issued_by_role, issued_by_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, gramPanchayat, titleMr, announcementText, priorityLevel, issuedByRole || 'सरपंच/ग्रामसेवक', issuedByName || 'ग्रामपंचायत प्रशासन');
        (0, auditLog_js_1.logAuditEvent)({ action: 'DIGITAL_DAWANDI_BROADCAST', resourceType: 'DAWANDI', resourceId: id, req });
        res.status(201).json({ success: true, message: 'डिजिटल दवंडी गावात यशस्वीरित्या प्रसारित केली!', data: { id, titleMr } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to broadcast dawandi' });
    }
};
exports.broadcastDawandi = broadcastDawandi;
// ==============================================================================
// 6. 🏘️ GRAM SABHA PUBLIC DEMANDS & AGENDA SUBMISSION (ग्रामसभा जन-मागणी)
// ==============================================================================
const getGramSabhaDemands = (req, res) => {
    try {
        const { gramPanchayat, status } = req.query;
        let query = 'SELECT * FROM gramsabha_agenda_demands WHERE 1=1';
        const params = [];
        if (gramPanchayat) {
            query += ' AND (gram_panchayat LIKE ? OR gram_panchayat = ?)';
            params.push(`%${gramPanchayat}%`, gramPanchayat);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        // Citizen Scoping: Citizens see only their own demands or approved public agenda
        if (req.user?.role === 'citizen' && req.user.phone) {
            const last10 = req.user.phone.replace(/\D/g, '').slice(-10);
            query += ' AND (citizen_phone LIKE ? OR status = "ACCEPTED_FOR_AGENDA" OR status = "RESOLVED")';
            params.push(`%${last10}%`);
        }
        query += ' ORDER BY created_at DESC';
        const records = db_js_1.db.prepare(query).all(...params);
        res.json({ success: true, count: records.length, data: records });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch Gram Sabha demands' });
    }
};
exports.getGramSabhaDemands = getGramSabhaDemands;
const submitGramSabhaDemand = (req, res) => {
    try {
        const { gramPanchayat, citizenName, citizenPhone, wardNo, topicTitle, demandDescription, gramsabhaDate } = req.body;
        const id = `gsd-${Date.now()}`;
        const cleanPhone = (citizenPhone || req.user?.phone || '0000000000').replace(/\D/g, '').slice(-10);
        db_js_1.db.prepare(`
      INSERT INTO gramsabha_agenda_demands (
        id, gram_panchayat, citizen_id, citizen_name, citizen_phone, ward_no, topic_title, demand_description, gramsabha_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED')
    `).run(id, gramPanchayat, req.user?.id || `usr-${cleanPhone}`, citizenName, cleanPhone, wardNo || 'Ward 1', topicTitle, demandDescription, gramsabhaDate || null);
        res.status(201).json({
            success: true,
            message: 'आपली ग्रामसभा जन-मागणी यशस्वीरित्या नोंदवली आहे! ग्रामसेवक यावर विचार करून विषय पत्रिकेत समाविष्ट करतील.',
            data: { id, topicTitle }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to submit Gram Sabha demand' });
    }
};
exports.submitGramSabhaDemand = submitGramSabhaDemand;
// ==============================================================================
// 7. 🔐 CITIZEN DIGITAL DOCUMENT LOCKER (माझे दस्तऐवज लॉकर)
// ==============================================================================
const getCitizenLocker = (req, res) => {
    try {
        const { phone } = req.query;
        const userPhone = req.user?.phone || phone;
        if (!userPhone) {
            res.status(400).json({ success: false, message: 'Phone number is required for digital locker' });
            return;
        }
        const last10 = String(userPhone).replace(/\D/g, '').slice(-10);
        // 1. Fetch Approved Certificates
        const certs = db_js_1.db.prepare(`
      SELECT id, type, certificate_number, applicant_name, processed_date, qr_code, gram_panchayat
      FROM certificates 
      WHERE applicant_phone LIKE ? AND status = 'approved'
      ORDER BY processed_date DESC
    `).all(`%${last10}%`);
        // 2. Fetch Paid Tax Receipts
        const taxes = db_js_1.db.prepare(`
      SELECT id, property_no, owner_name, ward_no, final_amount, receipt_no, payment_status, gram_panchayat
      FROM tax_records
      WHERE (owner_name LIKE ? OR property_no LIKE ?) AND payment_status = 'paid'
    `).all(`%${last10}%`, `%${last10}%`);
        // 3. Fetch Stored Locker Documents
        const lockerDocs = db_js_1.db.prepare(`
      SELECT * FROM citizen_document_locker 
      WHERE citizen_phone LIKE ?
      ORDER BY created_at DESC
    `).all(`%${last10}%`);
        res.json({
            success: true,
            data: {
                certificates: certs.map(c => ({
                    id: c.id,
                    type: 'CERTIFICATE',
                    titleMr: `${c.type} प्रमाणपत्र`,
                    docNumber: c.certificate_number || c.id,
                    issuedBy: `ग्रामपंचायत ${c.gram_panchayat || ''}`,
                    issuedDate: c.processed_date || '२०२६',
                    verificationQr: c.qr_code || `GP-VERIFIED-${c.id}`,
                    isTamperProof: true
                })),
                taxReceipts: taxes.map(t => ({
                    id: t.id,
                    type: 'TAX_RECEIPT',
                    titleMr: `घरपट्टी पावती (मालमत्ता क्र. ${t.property_no})`,
                    docNumber: t.receipt_no || `TAX-${t.property_no}`,
                    amountPaid: t.final_amount,
                    issuedBy: `ग्रामपंचायत ${t.gram_panchayat || ''}`,
                    verificationQr: `GP-TAX-PAID-${t.id}`
                })),
                customDocs: lockerDocs
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve digital locker documents' });
    }
};
exports.getCitizenLocker = getCitizenLocker;
