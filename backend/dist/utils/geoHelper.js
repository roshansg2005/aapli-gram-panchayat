"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGpBilingualAliases = getGpBilingualAliases;
exports.getTalukaBilingualAliases = getTalukaBilingualAliases;
function getGpBilingualAliases(db, gpName) {
    if (!gpName || typeof gpName !== 'string')
        return [];
    const clean = gpName.replace(/^(?:ग्रामपंचायत|ग्राम पंचायत|Gram\s*Panchayat)\s*/gi, '').trim();
    const aliases = new Set([gpName, clean]);
    // Strip parentheses if any: e.g. "ग्रामपंचायत घुलेवाडी (Ghulewadi)"
    const bracketMatch = gpName.match(/\(([^)]+)\)/);
    if (bracketMatch && bracketMatch[1]) {
        aliases.add(bracketMatch[1].trim());
        aliases.add(gpName.replace(/\([^)]+\)/, '').trim());
    }
    // Look up database gram_panchayats table for matching row
    try {
        const row = db.prepare('SELECT name_en, name_mr FROM gram_panchayats WHERE name_en LIKE ? OR name_mr LIKE ? LIMIT 1').get(`%${clean}%`, `%${clean}%`);
        if (row) {
            if (row.name_en)
                aliases.add(row.name_en);
            if (row.name_mr)
                aliases.add(row.name_mr);
        }
    }
    catch (e) {
        // ignore
    }
    return Array.from(aliases).filter(Boolean);
}
function getTalukaBilingualAliases(db, talukaName) {
    if (!talukaName || typeof talukaName !== 'string')
        return [];
    const clean = talukaName.replace(/^(?:तालुका|ता\.|Taluka)\s*/gi, '').trim();
    const aliases = new Set([talukaName, clean]);
    try {
        const row = db.prepare('SELECT name_en, name_mr FROM talukas WHERE name_en LIKE ? OR name_mr LIKE ? LIMIT 1').get(`%${clean}%`, `%${clean}%`);
        if (row) {
            if (row.name_en)
                aliases.add(row.name_en);
            if (row.name_mr)
                aliases.add(row.name_mr);
        }
    }
    catch (e) {
        // ignore
    }
    return Array.from(aliases).filter(Boolean);
}
