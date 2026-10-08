import { Router } from 'express';
import { 
  getNotices, 
  addNotice, 
  getProjects, 
  addProject, 
  getSchemes, 
  addScheme, 
  getSchemeApplications, 
  applyForScheme, 
  updateSchemeApplicationStatus 
} from '../controllers/contentController.js';

import {
  getWaterSchedule,
  updateWaterSchedule,
  getElectricityAlerts,
  getApmcRates,
  getEmergencyDirectory,
  getDigitalDawandi,
  broadcastDawandi,
  getGramSabhaDemands,
  submitGramSabhaDemand,
  getCitizenLocker
} from '../controllers/citizenServicesController.js';

const router = Router();

// 1. 📜 Notices & Public Announcements
router.get('/notices', getNotices);
router.post('/notices', addNotice);

// 2. 🏗️ Village Development Projects & Budgets
router.get('/projects', getProjects);
router.post('/projects', addProject);

// 3. 🏛️ Government Schemes & DBT Applications
router.get('/schemes', getSchemes);
router.post('/schemes', addScheme);
router.get('/schemes/applications', getSchemeApplications);
router.post('/schemes/apply', applyForScheme);
router.put('/schemes/applications/:id/status', updateSchemeApplicationStatus);

// 4. 💧 Water Supply Timing (आज पाणी कधी सुटणार?)
router.get('/water-schedule', getWaterSchedule);
router.post('/water-schedule', updateWaterSchedule);

// 5. ⚡ Electricity & MSEDCL Outage Alerts
router.get('/electricity-alerts', getElectricityAlerts);

// 6. 🌾 APMC Mandi Market Prices (आजचे बाजारभाव)
router.get('/apmc-rates', getApmcRates);

// 7. 🚨 Emergency Village Directory (आपत्कालीन संपर्क)
router.get('/emergency-directory', getEmergencyDirectory);

// 8. 📢 Digital Dawandi (डिजिटल दवंडी)
router.get('/dawandi', getDigitalDawandi);
router.post('/dawandi', broadcastDawandi);

// 9. 🏘️ Gram Sabha Public Agenda Demands (ग्रामसभा जन-मागणी)
router.get('/gramsabha-demands', getGramSabhaDemands);
router.post('/gramsabha-demands', submitGramSabhaDemand);

// 10. 🔐 Citizen Document Locker (माझे दस्तऐवज लॉकर)
router.get('/locker', getCitizenLocker);

export default router;
