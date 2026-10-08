"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const grievanceController_js_1 = require("../controllers/grievanceController.js");
const router = (0, express_1.Router)();
router.get('/', grievanceController_js_1.getGrievances);
router.post('/create', grievanceController_js_1.createGrievance);
router.put('/:id', grievanceController_js_1.updateGrievance);
exports.default = router;
