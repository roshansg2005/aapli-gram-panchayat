import { Router } from 'express';
import { 
  handleIncomingCall, 
  processSpeech, 
  getVoiceCallLogs, 
  getVoiceKnowledge 
} from './voiceCallController.js';
import { requireAuth, requireStaffOrAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// 1. Incoming Call Webhook (Telephony Providers: Twilio / Exotel / MSG91)
router.post('/incoming', handleIncomingCall);
router.get('/incoming', handleIncomingCall);

// 2. Process Spoken Marathi Query & Deterministic Safe Action Webhook
router.post('/process-speech', processSpeech);
router.post('/query', processSpeech);

// 3. Knowledge Base & Document Checklists
router.get('/knowledge', getVoiceKnowledge);

// 4. Voice Call Logs & Audit Trail (Strictly Protected: Staff / BDO / Admin Only)
router.get('/logs', requireAuth, requireStaffOrAdmin, getVoiceCallLogs);

export default router;
