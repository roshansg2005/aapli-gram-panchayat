import { Router } from 'express';
import { 
  registerCitizen, 
  registerStaff, 
  login, 
  adminLogin, 
  createUser, 
  deleteUser, 
  getUsers, 
  sendOtp, 
  verifyOtp, 
  updateProfile,
  changePassword,
  promoteUser,
  checkRoleAvailability,
  checkPhoneExists
} from '../controllers/authController.js';
import { requireAuth, requireStaffOrAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public Authentication Endpoints
router.get('/check-phone', checkPhoneExists);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register-citizen', registerCitizen);
router.post('/register-staff', registerStaff);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/check-role-availability', checkRoleAvailability);

// 🛡️ Privacy Protected: Staff & Admin Only (Restricted User List)
router.get('/users', requireAuth, requireStaffOrAdmin, getUsers);
router.post('/users', requireAuth, requireStaffOrAdmin, createUser);
router.delete('/users/:id', requireAuth, requireStaffOrAdmin, deleteUser);
router.post('/promote-user', requireAuth, requireStaffOrAdmin, promoteUser);
router.put('/users/:id/promote', requireAuth, requireStaffOrAdmin, promoteUser);

// 🔐 User Profile & Password Management (Authenticated User)
router.put('/profile', requireAuth, updateProfile);
router.put('/users/:id', requireAuth, updateProfile);
router.post('/change-password', requireAuth, changePassword);
router.put('/users/:id/password', requireAuth, changePassword);

export default router;
