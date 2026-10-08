"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificateController_js_1 = require("../controllers/certificateController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
// Certificate Applications
router.get('/', certificateController_js_1.getCertificates);
router.post('/apply', certificateController_js_1.applyCertificate);
router.put('/:id/status', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, certificateController_js_1.updateCertificateStatus);
// Dynamic Certificate Services & Fee Tariffs (Staff / Admin Only)
router.get('/types', certificateController_js_1.getCertificateTypes);
router.post('/types', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, certificateController_js_1.createCertificateType);
router.put('/types/:id', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, certificateController_js_1.updateCertificateType);
router.delete('/types/:id', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, certificateController_js_1.deleteCertificateType);
exports.default = router;
