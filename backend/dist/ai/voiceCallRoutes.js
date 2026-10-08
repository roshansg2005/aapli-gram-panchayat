"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voiceCallController_js_1 = require("./voiceCallController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
// 1. Incoming Call Webhook (Telephony Providers: Twilio / Exotel / MSG91)
router.post('/incoming', voiceCallController_js_1.handleIncomingCall);
router.get('/incoming', voiceCallController_js_1.handleIncomingCall);
// 2. Process Spoken Marathi Query & Deterministic Safe Action Webhook
router.post('/process-speech', voiceCallController_js_1.processSpeech);
router.post('/query', voiceCallController_js_1.processSpeech);
// 3. Knowledge Base & Document Checklists
router.get('/knowledge', voiceCallController_js_1.getVoiceKnowledge);
// 4. Voice Call Logs & Audit Trail (Strictly Protected: Staff / BDO / Admin Only)
router.get('/logs', authMiddleware_js_1.requireAuth, authMiddleware_js_1.requireStaffOrAdmin, voiceCallController_js_1.getVoiceCallLogs);
exports.default = router;
