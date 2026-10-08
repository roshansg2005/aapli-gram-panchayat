"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchLocations = exports.getPanchayats = exports.getTalukas = exports.getDistricts = void 0;
const db_js_1 = require("../config/db.js");
const getDistricts = (req, res) => {
    try {
        const districts = db_js_1.db.prepare('SELECT code, name_en, name_mr FROM districts ORDER BY name_en ASC').all();
        res.json({
            success: true,
            count: districts.length,
            data: districts
        });
    }
    catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch districts' });
    }
};
exports.getDistricts = getDistricts;
const getTalukas = (req, res) => {
    try {
        const { districtCode } = req.query;
        let talukas;
        if (districtCode) {
            talukas = db_js_1.db.prepare('SELECT code, district_code, name_en, name_mr FROM talukas WHERE district_code = ? ORDER BY name_en ASC').all(districtCode);
        }
        else {
            talukas = db_js_1.db.prepare('SELECT code, district_code, name_en, name_mr FROM talukas ORDER BY name_en ASC').all();
        }
        res.json({
            success: true,
            count: talukas.length,
            data: talukas
        });
    }
    catch (error) {
        console.error('Error fetching talukas:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch talukas' });
    }
};
exports.getTalukas = getTalukas;
const getPanchayats = (req, res) => {
    try {
        const { talukaCode, subdistrictCode, blockCode, districtCode, search, limit = 500 } = req.query;
        const tCode = talukaCode || subdistrictCode || blockCode;
        let panchayats;
        if (tCode) {
            panchayats = db_js_1.db.prepare('SELECT code, subdistrict_code, district_code, name_en, name_mr, wards_json FROM gram_panchayats WHERE subdistrict_code = ? ORDER BY name_en ASC LIMIT ?').all(tCode, Number(limit));
        }
        else if (districtCode) {
            panchayats = db_js_1.db.prepare('SELECT code, subdistrict_code, district_code, name_en, name_mr, wards_json FROM gram_panchayats WHERE district_code = ? ORDER BY name_en ASC LIMIT ?').all(districtCode, Number(limit));
        }
        else if (search) {
            const q = `%${search}%`;
            panchayats = db_js_1.db.prepare('SELECT code, subdistrict_code, district_code, name_en, name_mr, wards_json FROM gram_panchayats WHERE name_en LIKE ? OR name_mr LIKE ? ORDER BY name_en ASC LIMIT ?').all(q, q, Number(limit));
        }
        else {
            panchayats = db_js_1.db.prepare('SELECT code, subdistrict_code, district_code, name_en, name_mr, wards_json FROM gram_panchayats ORDER BY name_en ASC LIMIT ?').all(Number(limit));
        }
        const formatted = panchayats.map((p) => ({
            ...p,
            wards: p.wards_json ? JSON.parse(p.wards_json) : ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4']
        }));
        res.json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    }
    catch (error) {
        console.error('Error fetching gram panchayats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch gram panchayats' });
    }
};
exports.getPanchayats = getPanchayats;
const searchLocations = (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            res.json({ success: true, data: [] });
            return;
        }
        const term = `%${q}%`;
        const results = db_js_1.db.prepare(`
      SELECT 
        gp.code AS gp_code,
        gp.subdistrict_code AS taluka_code,
        gp.district_code AS district_code,
        gp.name_en AS gp_name_en,
        gp.name_mr AS gp_name_mr,
        t.name_en AS taluka_name_en,
        t.name_mr AS taluka_name_mr,
        d.name_en AS district_name_en,
        d.name_mr AS district_name_mr
      FROM gram_panchayats gp
      LEFT JOIN talukas t ON gp.subdistrict_code = t.code
      LEFT JOIN districts d ON gp.district_code = d.code
      WHERE gp.name_en LIKE ? OR gp.name_mr LIKE ? OR t.name_en LIKE ?
      LIMIT 50
    `).all(term, term, term);
        res.json({
            success: true,
            count: results.length,
            data: results
        });
    }
    catch (error) {
        console.error('Error searching locations:', error);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
};
exports.searchLocations = searchLocations;
