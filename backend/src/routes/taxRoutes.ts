import { Router } from 'express';
import { getTaxRecords, assessTax, payTax, deleteTaxRecord } from '../controllers/taxController.js';
import { requireAuth, requireStaffOrAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Citizen Search
router.get('/', getTaxRecords);

// Payment (Protected by auth)
router.post('/:id/pay', requireAuth, payTax);

// Administrative Tax Actions (Strict RBAC)
router.post('/assess', requireAuth, requireStaffOrAdmin, assessTax);
router.delete('/:id', requireAuth, requireStaffOrAdmin, deleteTaxRecord);

export default router;
