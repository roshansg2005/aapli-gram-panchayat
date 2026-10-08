import { Router } from 'express';
import { getDistricts, getTalukas, getPanchayats, searchLocations } from '../controllers/geoController.js';

const router = Router();

router.get('/districts', getDistricts);
router.get('/talukas', getTalukas);
router.get('/panchayats', getPanchayats);
router.get('/search', searchLocations);

export default router;
