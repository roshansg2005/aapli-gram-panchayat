"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taxController_js_1 = require("../controllers/taxController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
// Public / Citizen Search
router.get('/', taxController_js_1.getTaxRecords);
// Payment (Protected by auth)
router.post('/:id/pay', authMiddleware_js_1.requireAuth, taxController_js_1.payTax);
// Administrative Tax Actions (Strict RBAC)
router.post('/assess', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, taxController_js_1.assessTax);
router.delete('/:id', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, taxController_js_1.deleteTaxRecord);
exports.default = router;
