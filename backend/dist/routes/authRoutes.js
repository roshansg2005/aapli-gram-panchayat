"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
// Public Authentication Endpoints
router.get('/check-phone', authController_js_1.checkPhoneExists);
router.post('/send-otp', authController_js_1.sendOtp);
router.post('/verify-otp', authController_js_1.verifyOtp);
router.post('/register-citizen', authController_js_1.registerCitizen);
router.post('/register-staff', authController_js_1.registerStaff);
router.post('/login', authController_js_1.login);
router.post('/admin/login', authController_js_1.adminLogin);
router.get('/check-role-availability', authController_js_1.checkRoleAvailability);
// 🛡️ Privacy Protected: Staff & Admin Only (Restricted User List)
router.get('/users', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, authController_js_1.getUsers);
router.post('/users', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, authController_js_1.createUser);
router.delete('/users/:id', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, authController_js_1.deleteUser);
router.post('/promote-user', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, authController_js_1.promoteUser);
router.put('/users/:id/promote', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, authController_js_1.promoteUser);
// 🔐 User Profile & Password Management (Authenticated User)
router.put('/profile', authMiddleware_js_1.requireAuth, authController_js_1.updateProfile);
router.put('/users/:id', authMiddleware_js_1.requireAuth, authController_js_1.updateProfile);
router.post('/change-password', authMiddleware_js_1.requireAuth, authController_js_1.changePassword);
router.put('/users/:id/password', authMiddleware_js_1.requireAuth, authController_js_1.changePassword);
exports.default = router;
