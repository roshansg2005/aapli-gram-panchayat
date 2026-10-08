"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contentController_js_1 = require("../controllers/contentController.js");
const citizenServicesController_js_1 = require("../controllers/citizenServicesController.js");
const router = (0, express_1.Router)();
// 1. 📜 Notices & Public Announcements
router.get('/notices', contentController_js_1.getNotices);
router.post('/notices', contentController_js_1.addNotice);
// 2. 🏗️ Village Development Projects & Budgets
router.get('/projects', contentController_js_1.getProjects);
router.post('/projects', contentController_js_1.addProject);
// 3. 🏛️ Government Schemes & DBT Applications
router.get('/schemes', contentController_js_1.getSchemes);
router.post('/schemes', contentController_js_1.addScheme);
router.get('/schemes/applications', contentController_js_1.getSchemeApplications);
router.post('/schemes/apply', contentController_js_1.applyForScheme);
router.put('/schemes/applications/:id/status', contentController_js_1.updateSchemeApplicationStatus);
// 4. 💧 Water Supply Timing (आज पाणी कधी सुटणार?)
router.get('/water-schedule', citizenServicesController_js_1.getWaterSchedule);
router.post('/water-schedule', citizenServicesController_js_1.updateWaterSchedule);
// 5. ⚡ Electricity & MSEDCL Outage Alerts
router.get('/electricity-alerts', citizenServicesController_js_1.getElectricityAlerts);
// 6. 🌾 APMC Mandi Market Prices (आजचे बाजारभाव)
router.get('/apmc-rates', citizenServicesController_js_1.getApmcRates);
// 7. 🚨 Emergency Village Directory (आपत्कालीन संपर्क)
router.get('/emergency-directory', citizenServicesController_js_1.getEmergencyDirectory);
// 8. 📢 Digital Dawandi (डिजिटल दवंडी)
router.get('/dawandi', citizenServicesController_js_1.getDigitalDawandi);
router.post('/dawandi', citizenServicesController_js_1.broadcastDawandi);
// 9. 🏘️ Gram Sabha Public Agenda Demands (ग्रामसभा जन-मागणी)
router.get('/gramsabha-demands', citizenServicesController_js_1.getGramSabhaDemands);
router.post('/gramsabha-demands', citizenServicesController_js_1.submitGramSabhaDemand);
// 10. 🔐 Citizen Document Locker (माझे दस्तऐवज लॉकर)
router.get('/locker', citizenServicesController_js_1.getCitizenLocker);
exports.default = router;
