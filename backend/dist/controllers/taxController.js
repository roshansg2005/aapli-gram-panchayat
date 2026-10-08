"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaxRecord = exports.payTax = exports.assessTax = exports.getTaxRecords = void 0;
const db_js_1 = require("../config/db.js");
const smsService_js_1 = require("../utils/smsService.js");
const getTaxRecords = (req, res) => {
    try {
        const { gramPanchayat, taluka, propertyNo, ownerName, wardNo } = req.query;
        let query = 'SELECT * FROM tax_records WHERE 1=1';
        const params = [];
        if (gramPanchayat) {
            query += ' AND (gram_panchayat LIKE ? OR gram_panchayat = ?)';
            params.push(`%${gramPanchayat}%`, gramPanchayat);
        }
        if (taluka) {
            query += ' AND (taluka LIKE ? OR taluka = ?)';
            params.push(`%${taluka}%`, taluka);
        }
        if (propertyNo) {
            query += ' AND property_no LIKE ?';
            params.push(`%${propertyNo}%`);
        }
        if (ownerName) {
            query += ' AND owner_name LIKE ?';
            params.push(`%${ownerName}%`);
        }
        if (wardNo) {
            query += ' AND ward_no = ?';
            params.push(wardNo);
        }
        query += ' ORDER BY property_no ASC';
        const records = db_js_1.db.prepare(query).all(...params);
        res.json({
            success: true,
            count: records.length,
            data: records.map(formatTax)
        });
    }
    catch (error) {
        console.error('Error fetching tax records:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tax records' });
    }
};
exports.getTaxRecords = getTaxRecords;
const assessTax = (req, res) => {
    try {
        const { propertyNo, ownerName, wardNo = 'Ward 1', gramPanchayat = 'ग्रामपंचायत', taluka = '', district = '', taxType = 'all', propertyTax = 0, waterTax = 0, healthCess = 0, lightTax = 0, rebate = 0 } = req.body;
        if (!propertyNo || !ownerName) {
            res.status(400).json({ success: false, message: 'मालमत्ता क्रमांक व मिळकतधारकाचे नाव आवश्यक आहे' });
            return;
        }
        const pTax = Math.max(0, Number(propertyTax) || 0);
        const wTax = Math.max(0, Number(waterTax) || 0);
        const hCess = Math.max(0, Number(healthCess) || 0);
        const lTax = Math.max(0, Number(lightTax) || 0);
        const totalTax = pTax + wTax + hCess + lTax;
        const finalRebate = Math.max(0, Number(rebate) || Math.round(totalTax * 0.1));
        const finalAmount = Math.max(0, totalTax - finalRebate);
        const id = `tax-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        // Check if assessment already exists for this property in this GP
        const existing = db_js_1.db.prepare('SELECT id FROM tax_records WHERE property_no = ? AND (gram_panchayat IS NULL OR gram_panchayat = \'\' OR gram_panchayat = ?)').get(propertyNo, gramPanchayat);
        if (existing) {
            // Update existing assessment
            db_js_1.db.prepare(`
        UPDATE tax_records SET
          owner_name = ?, ward_no = ?, gram_panchayat = ?, taluka = ?, district = ?, tax_type = ?,
          property_tax = ?, water_tax = ?, health_cess = ?, light_tax = ?,
          total_tax = ?, rebate = ?, final_amount = ?
        WHERE id = ?
      `).run(ownerName, wardNo, gramPanchayat, taluka, district, taxType, pTax, wTax, hCess, lTax, totalTax, finalRebate, finalAmount, existing.id);
            const updated = db_js_1.db.prepare('SELECT * FROM tax_records WHERE id = ?').get(existing.id);
            res.json({
                success: true,
                message: 'कर आकारणी यशस्वीरीत्या अद्ययावत केली गेली!',
                data: formatTax(updated)
            });
            return;
        }
        db_js_1.db.prepare(`
      INSERT INTO tax_records (
        id, property_no, owner_name, ward_no, gram_panchayat, taluka, district, tax_type,
        property_tax, water_tax, health_cess, light_tax, total_tax, rebate, final_amount,
        is_paid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(id, propertyNo, ownerName, wardNo, gramPanchayat, taluka, district, taxType, pTax, wTax, hCess, lTax, totalTax, finalRebate, finalAmount);
        const created = db_js_1.db.prepare('SELECT * FROM tax_records WHERE id = ?').get(id);
        res.status(201).json({
            success: true,
            message: 'नवीन कर आकारणी / मागणी नोंदणी यशस्वी!',
            data: formatTax(created)
        });
    }
    catch (error) {
        console.error('Error assessing tax:', error);
        res.status(500).json({ success: false, message: 'कर आकारणी नोंद करताना त्रुटी आली' });
    }
};
exports.assessTax = assessTax;
const payTax = (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod = 'UPI / Online' } = req.body;
        // Search by ID or PropertyNo
        const record = db_js_1.db.prepare('SELECT * FROM tax_records WHERE id = ? OR property_no = ?').get(id, id);
        if (!record) {
            res.status(404).json({ success: false, message: 'Property tax assessment not found' });
            return;
        }
        const paidDate = new Date().toISOString().split('T')[0];
        const gpPrefix = (record.gram_panchayat || 'GP').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'MAHA';
        const receiptNo = `RCPT-${new Date().getFullYear()}-${gpPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
        const txnId = `TXN-${paymentMethod.includes('Cash') ? 'CASH' : 'UPI'}-${Date.now()}`;
        db_js_1.db.prepare(`
      UPDATE tax_records SET
        is_paid = 1, paid_date = ?, receipt_no = ?, payment_method = ?, transaction_id = ?
      WHERE id = ?
    `).run(paidDate, receiptNo, paymentMethod, txnId, record.id);
        const updated = db_js_1.db.prepare('SELECT * FROM tax_records WHERE id = ?').get(record.id);
        // Look up owner phone from request or users table
        const targetPhone = req.body.phone || db_js_1.db.prepare('SELECT phone FROM users WHERE name = ? OR house_no = ?').get(record.owner_name, record.property_no)?.phone;
        if (targetPhone) {
            (0, smsService_js_1.sendTaxReceiptSms)(targetPhone, record.owner_name || 'नागरिक', record.property_no, record.final_amount || 0, receiptNo, record.gram_panchayat || 'घुलेवाडी').catch(err => console.warn('⚠️ Twilio tax receipt SMS dispatch note:', err));
        }
        res.json({
            success: true,
            message: 'कर भरणा यशस्वीरीत्या पूर्ण झाला! अधिकृत डिजिटल पावती तयार झाली.',
            data: formatTax(updated)
        });
    }
    catch (error) {
        console.error('Error paying tax:', error);
        res.status(500).json({ success: false, message: 'Failed to process tax payment' });
    }
};
exports.payTax = payTax;
const deleteTaxRecord = (req, res) => {
    try {
        const { id } = req.params;
        db_js_1.db.prepare('DELETE FROM tax_records WHERE id = ? OR property_no = ?').run(id, id);
        res.json({ success: true, message: 'कर आकारणी नोंद यशस्वीरीत्या हटवली!' });
    }
    catch (error) {
        console.error('Error deleting tax record:', error);
        res.status(500).json({ success: false, message: 'Failed to delete tax record' });
    }
};
exports.deleteTaxRecord = deleteTaxRecord;
function formatTax(t) {
    if (!t)
        return null;
    return {
        id: t.id,
        propertyNo: t.property_no,
        ownerName: t.owner_name,
        guardianName: t.guardian_name || '',
        wardNo: t.ward_no || 'Ward 1',
        gramPanchayat: t.gram_panchayat || '',
        taluka: t.taluka || '',
        district: t.district || '',
        taxType: t.tax_type || 'all',
        propertyTax: Number(t.property_tax) || 0,
        waterTax: Number(t.water_tax) || 0,
        healthCess: Number(t.health_cess) || 0,
        sanitationTax: Number(t.health_cess) || 0,
        lightTax: Number(t.light_tax) || 0,
        lightingTax: Number(t.light_tax) || 0,
        totalTax: Number(t.total_tax) || 0,
        rebate: Number(t.rebate) || 0,
        discount: Number(t.rebate) || 0,
        finalAmount: Number(t.final_amount) || 0,
        isPaid: Boolean(t.is_paid),
        paidDate: t.paid_date,
        lastPaymentDate: t.paid_date,
        receiptNo: t.receipt_no,
        paymentMethod: t.payment_method,
        paymentMode: t.payment_method?.includes('Cash') ? 'Cash' : 'UPI',
        transactionId: t.transaction_id
    };
}
