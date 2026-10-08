import { Router } from 'express';
import { 
  getCertificates, 
  applyCertificate, 
  updateCertificateStatus,
  getCertificateTypes,
  createCertificateType,
  updateCertificateType,
  deleteCertificateType
} from '../controllers/certificateController.js';
import { requireAuth, requireStaffOrAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Certificate Applications
router.get('/', getCertificates);
router.post('/apply', applyCertificate);
router.put('/:id/status', requireAuth, requireStaffOrAdmin, updateCertificateStatus);

// Dynamic Certificate Services & Fee Tariffs (Staff / Admin Only)
router.get('/types', getCertificateTypes);
router.post('/types', requireAuth, requireStaffOrAdmin, createCertificateType);
router.put('/types/:id', requireAuth, requireStaffOrAdmin, updateCertificateType);
router.delete('/types/:id', requireAuth, requireStaffOrAdmin, deleteCertificateType);

export default router;
