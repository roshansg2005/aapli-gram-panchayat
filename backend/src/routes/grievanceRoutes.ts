import { Router } from 'express';
import { getGrievances, createGrievance, updateGrievance } from '../controllers/grievanceController.js';

const router = Router();

router.get('/', getGrievances);
router.post('/create', createGrievance);
router.put('/:id', updateGrievance);

export default router;
