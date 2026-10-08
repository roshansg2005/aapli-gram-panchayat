import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { 
  CERTIFICATE_REQUIREMENTS, 
  SCHEMES_KNOWLEDGE, 
  GP_GENERAL_INFO 
} from './marathiKnowledgeBase.js';

// Ensure voice_call_logs table exists
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS voice_call_logs (
      id TEXT PRIMARY KEY,
      call_sid TEXT,
      caller_phone TEXT NOT NULL,
      dialed_number TEXT,
      gram_panchayat TEXT,
      query_type TEXT,
      query_transcript TEXT,
      response_speech TEXT,
      resolution_status TEXT,
      worker_forwarded_to TEXT,
      duration_seconds INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (err) {
  console.warn('Voice call logs table check:', err);
}

// In-memory call rate tracker (protects against telephony toll fraud & spam bots)
const callTracker = new Map<string, { count: number; resetAt: number }>();

function checkCallerAbuse(cleanPhone: string): boolean {
  if (!cleanPhone || cleanPhone.length < 10) return false;
  const now = Date.now();
  const record = callTracker.get(cleanPhone);
  if (!record || now > record.resetAt) {
    callTracker.set(cleanPhone, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  record.count += 1;
  return record.count > 6; // Max 6 calls per 15 minutes per phone
}

// Clean phone number (strips +91, 0, whitespace, hyphens)
function cleanPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

// Helper to escape XML characters for TwiML / VoiceXML
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 1️⃣ Incoming Call Webhook (POST /api/voice/incoming)
 * When a keypad phone dials the GP Helpline Number
 */
export const handleIncomingCall = (req: Request, res: Response): void => {
  try {
    const callerRaw = (
      req.body.CallFrom || 
      req.body.From || 
      req.body.caller || 
      req.body.phone || 
      req.body.caller_phone ||
      req.query.CallFrom || 
      req.query.From || 
      req.query.phone ||
      ''
    ).toString();
    const dialedRaw = (
      req.body.CallTo || 
      req.body.To || 
      req.body.dialed || 
      req.query.CallTo || 
      req.query.To || 
      '1800-209-1234'
    ).toString();
    const callSid = (
      req.body.CallSid || 
      req.body.call_id || 
      req.body.Sid || 
      `call_${Date.now()}`
    ).toString();
    const gpName = (req.body.gram_panchayat || req.query.gram_panchayat || GP_GENERAL_INFO.defaultGpNameMr).toString();

    const cleanPhone = cleanPhoneNumber(callerRaw);

    // 🛡️ Gate 5: Caller Rate Limit & Toll Abuse Protection
    if (cleanPhone && checkCallerAbuse(cleanPhone)) {
      const isXml = req.headers['content-type']?.includes('xml') || req.headers.accept?.includes('xml') || req.body.CallSid;
      if (isXml) {
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">आपल्या क्रमांकावरून वारंवार कॉल आले आहेत. कृपया १५ मिनिटांनंतर पुन्हा प्रयत्न करा किंवा थेट कार्यालयात संपर्क साधा.</Say>
  <Hangup/>
</Response>`;
        res.set('Content-Type', 'text/xml; charset=utf-8');
        res.send(twiml);
        return;
      }
      res.status(429).json({ success: false, message: 'Too many calls from this number. Please wait 15 minutes.' });
      return;
    }

    // Initial greeting in Marathi
    const greetingTextMr = `नमस्ते! ${gpName} मध्ये आपले स्वागत आहे. मी आपला AI ग्राम मित्र आहे. कृपया आपला प्रश्न बोला, जसे की दाखला स्थिती, आवश्यक कागदपत्रे किंवा कर माहिती.`;

    const isXmlRequested = req.headers['content-type']?.includes('xml') || 
                           req.headers.accept?.includes('xml') || 
                           req.query.format === 'xml' ||
                           req.body.CallSid; // Standard Twilio/Telephony call

    if (isXmlRequested) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">${escapeXml(greetingTextMr)}</Say>
  <Gather input="speech dtmf" language="hi-IN" action="/api/voice/process-speech" method="POST" speechTimeout="auto" timeout="6">
    <Say voice="Polly.Aditi" language="hi-IN">आपण आता बोलू शकता...</Say>
  </Gather>
  <Say voice="Polly.Aditi" language="hi-IN">आम्हाला आपला आवाज ऐकू आला नाही. कृपया पुन्हा प्रयत्न करा.</Say>
  <Redirect>/api/voice/incoming</Redirect>
</Response>`;
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.send(twiml);
      return;
    }

    // JSON response for direct API / AI Calling integration
    res.json({
      success: true,
      call_sid: callSid,
      caller_phone: cleanPhone,
      dialed_number: dialedRaw,
      gram_panchayat: gpName,
      greeting_mr: greetingTextMr,
      action_url: '/api/voice/process-speech',
      status: 'RINGING_ANSWERED'
    });
  } catch (error: any) {
    console.error('Error in handleIncomingCall:', error);
    res.status(500).json({ error: error.message || 'Internal voice error' });
  }
};

/**
 * 2️⃣ Process Spoken Marathi Query & Take Autonomous Action
 * POST /api/voice/process-speech
 */
export const processSpeech = (req: Request, res: Response): void => {
  try {
    const callerRaw = (
      req.body.CallFrom || 
      req.body.From || 
      req.body.caller_phone || 
      req.body.phone || 
      req.body.caller ||
      req.query.CallFrom || 
      req.query.phone || 
      req.query.From ||
      ''
    ).toString();
    const speechText = (req.body.SpeechResult || req.body.text || req.body.query || req.body.transcript || '').toString().trim();
    const digits = (req.body.Digits || '').toString();
    const callSid = (req.body.CallSid || req.body.call_id || `session_${Date.now()}`).toString();
    const gpName = (req.body.gram_panchayat || GP_GENERAL_INFO.defaultGpNameMr).toString();

    const cleanPhone = cleanPhoneNumber(callerRaw);
    const lowerQuery = speechText.toLowerCase();

    let responseSpeechMr = '';
    let resolutionStatus: 'RESOLVED_BY_AI' | 'FORWARDED_TO_WORKER' | 'NOT_REGISTERED' = 'RESOLVED_BY_AI';
    let forwardWorkerPhone: string | null = null;
    let queryType = 'GENERAL_INFO';

    // ─────────────────────────────────────────────────────────────────
    // STEP A: CHECK FOR WORKER / HUMAN FORWARD REQUEST
    // ─────────────────────────────────────────────────────────────────
    if (
      digits === '9' || 
      lowerQuery.includes('ग्रामसेवक') || 
      lowerQuery.includes('कर्मचारी') || 
      lowerQuery.includes('अधिकारी') || 
      lowerQuery.includes('तक्रार सोडवा') || 
      lowerQuery.includes('human') || 
      lowerQuery.includes('officer') ||
      lowerQuery.includes('थेट बोला')
    ) {
      queryType = 'FORWARD_WORKER';
      resolutionStatus = 'FORWARDED_TO_WORKER';
      forwardWorkerPhone = GP_GENERAL_INFO.gramSevakWorker.phone;
      responseSpeechMr = `आपल्या समस्येसाठी मी आपला कॉल थेट ग्रामसेवक ${GP_GENERAL_INFO.gramSevakWorker.nameMr} यांच्याशी जोडत आहे. कृपया होल्ड करा...`;
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP B: CHECK FOR PERSONAL INQUIRY (वैयक्तिक माहिती)
    // ─────────────────────────────────────────────────────────────────
    
    else if (
      lowerQuery.includes('माझा दाखला') || 
      lowerQuery.includes('माझे प्रमाणपत्र') || 
      lowerQuery.includes('माझी घरपट्टी') || 
      lowerQuery.includes('माझा कर') || 
      lowerQuery.includes('माझी तक्रार') || 
      lowerQuery.includes('माझा अर्ज') || 
      lowerQuery.includes('माझी स्थिती') || 
      lowerQuery.includes('स्टेटस') || 
      lowerQuery.includes('तयार झाला') ||
      lowerQuery.includes('कधी मिळणार') ||
      lowerQuery.includes('मिळाला का')
    ) {
      queryType = 'PERSONAL_INFO';

      if (!cleanPhone || cleanPhone.length < 10) {
        resolutionStatus = 'NOT_REGISTERED';
        responseSpeechMr = `आपला मोबाईल क्रमांक स्पष्ट ओळखता आला नाही. कृपया आपल्या नोंदणीकृत मोबाईलवरून कॉल करा.`;
      } else {
        // Look up citizen in users table
        const user = db.prepare(`
          SELECT * FROM users 
          WHERE phone = ? OR phone LIKE ? 
          LIMIT 1
        `).get(cleanPhone, `%${cleanPhone}%`) as any;

        if (!user) {
          // ❌ Citizen NOT EXISTS in database
          resolutionStatus = 'NOT_REGISTERED';
          responseSpeechMr = `आपला मोबाईल क्रमांक ${cleanPhone} ग्रामपंचायतीत नोंदणीकृत नाही. कृपया आपली ग्रामपंचायत ॲपवर नोंदणी करा किंवा ग्रामपंचायत कार्यालयात नोंदणी करा.`;
        } else {
          // ✅ Citizen EXISTS in database
          const citizenName = user.name || 'नागरिक';

          if (lowerQuery.includes('कर') || lowerQuery.includes('घरपट्टी') || lowerQuery.includes('पाणीपट्टी')) {
            // Check Taxes in tax_records
            const taxRecord = db.prepare(`
              SELECT * FROM tax_records 
              WHERE owner_name LIKE ? OR property_no = ? 
              ORDER BY rowid DESC LIMIT 1
            `).get(`%${citizenName}%`, user.house_no || '') as any;

            if (taxRecord && (taxRecord.is_paid === 0 || taxRecord.is_paid === '0' || !taxRecord.is_paid)) {
              const amount = taxRecord.final_amount || taxRecord.total_tax || 500;
              responseSpeechMr = `नमस्कार ${citizenName}जी! आपल्या घर क्र. ${taxRecord.property_no || user.house_no || 'नोंदणीकृत मालमत्ता'} वर एकूण ${amount} रुपये कर बाकी आहे. ३१ मार्चपूर्वी भरल्यास १०% सवलत मिळेल. आपण ॲपवरून किंवा कार्यालयात कर भरू शकता.`;
            } else if (taxRecord && (taxRecord.is_paid === 1 || taxRecord.is_paid === '1')) {
              responseSpeechMr = `नमस्कार ${citizenName}जी! अभिनंदन, आपल्या मालमत्तेचा चालू वर्षाचा सर्व कर पूर्ण भरलेला आहे. कोणतीही थकबाकी नाही.`;
            } else {
              responseSpeechMr = `नमस्कार ${citizenName}जी! आपल्या घर क्र. ${user.house_no || '४५'} वर चालू वर्षाचा अंदाजे ५०० रुपये कर लागू आहे. ३१ मार्चपूर्वी भरल्यास १०% सवलत मिळेल.`;
            }
          } else if (lowerQuery.includes('तक्रार') || lowerQuery.includes('समस्या')) {
            // Check Grievances
            const grievance = db.prepare(`
              SELECT * FROM grievances 
              WHERE citizen_phone = ? OR citizen_phone LIKE ? 
              ORDER BY rowid DESC LIMIT 1
            `).get(cleanPhone, `%${cleanPhone}%`) as any;

            if (grievance) {
              const statusMr = grievance.status === 'resolved' ? 'निवारण झाले आहे' : 
                               grievance.status === 'in_progress' ? 'काम सुरू आहे' : 'पडताळणीमध्ये आहे';
              responseSpeechMr = `नमस्कार ${citizenName}जी! आपली '${grievance.category || 'नागरी तक्रार'}' सध्या '${statusMr}'. टोकन क्र. ${grievance.token_no || grievance.id}.`;
            } else {
              responseSpeechMr = `नमस्कार ${citizenName}जी! आपल्या मोबाईल क्रमांकावर सध्या कोणतीही सक्रिय तक्रार नोंदवलेली नाही.`;
            }
          } else {
            // Check Certificate Status (Default for "माझा दाखला तयार झाला का?")
            const cert = db.prepare(`
              SELECT * FROM certificates 
              WHERE applicant_phone = ? OR applicant_phone LIKE ? 
              ORDER BY rowid DESC LIMIT 1
            `).get(cleanPhone, `%${cleanPhone}%`) as any;

            if (cert) {
              const certName = cert.type || 'दाखला';
              if (cert.status === 'approved') {
                responseSpeechMr = `होय ${citizenName}जी! आपला '${certName}' ग्रामसेवकांकडून मंजूर झाला आहे आणि डिजिटल स्वाक्षरीसह तयार आहे. आपण आजच ग्रामपंचायत कार्यालयातून घेऊ शकता किंवा ॲपवरून डाउनलोड करू शकता.`;
              } else if (cert.status === 'pending') {
                responseSpeechMr = `नमस्कार ${citizenName}जी! आपला '${certName}' अर्ज सध्या ग्रामसेवक पडताळणीमध्ये प्रलंबित आहे. साधारण १ ते २ दिवसांत मंजुरी मिळेल.`;
              } else if (cert.status === 'rejected') {
                responseSpeechMr = `नमस्कार ${citizenName}जी! आपला '${certName}' अर्ज काही अपूर्ण कागदपत्रांमुळे नामंजूर झाला आहे. कृपया ग्रामपंचायत कार्यालयात संपर्क साधावा.`;
              } else {
                responseSpeechMr = `नमस्कार ${citizenName}जी! आपला '${certName}' अर्ज प्रक्रिया सुरू आहे.`;
              }
            } else {
              responseSpeechMr = `नमस्कार ${citizenName}जी! आपल्या क्रमांकावर सध्या कोणताही प्रलंबित दाखला अर्ज नाही. आपण नवीन दाखल्यासाठी ॲपवरून अर्ज करू शकता.`;
            }
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP C: GENERAL INQUIRY (सार्वजनिक माहिती / कागदपत्रे / योजना)
    // ─────────────────────────────────────────────────────────────────
    else {
      queryType = 'GENERAL_INFO';

      // 1. Check Certificate Required Documents
      const matchedCert = CERTIFICATE_REQUIREMENTS.find(c => 
        c.keywords.some(k => lowerQuery.includes(k))
      );

      if (matchedCert) {
        const docsList = matchedCert.requiredDocumentsMr.map((d, i) => `${i + 1}) ${d}`).join(', ');
        responseSpeechMr = `${matchedCert.titleMr} साठी आवश्यक कागदपत्रे: ${docsList}. हा दाखला साधारण ${matchedCert.deliveryDays} दिवसांत मिळतो आणि शासकीय फी ${matchedCert.fee} रुपये आहे.`;
      } 
      // 2. Check Welfare Schemes
      else if (
        lowerQuery.includes('योजना') || 
        lowerQuery.includes('लाडकी बहीण') || 
        lowerQuery.includes('पीएम किसान') || 
        lowerQuery.includes('घरकुल') || 
        lowerQuery.includes('शेतकरी')
      ) {
        const matchedScheme = SCHEMES_KNOWLEDGE.find(s => 
          s.keywords.some(k => lowerQuery.includes(k))
        );
        if (matchedScheme) {
          responseSpeechMr = `${matchedScheme.nameMr}: लाभ - ${matchedScheme.benefitMr}. पात्रता - ${matchedScheme.eligibilityMr}. आवश्यक कागदपत्रे: ${matchedScheme.documentsMr.join(', ')}.`;
        } else {
          responseSpeechMr = `ग्रामपंचायतीमध्ये लाडकी बहीण योजना, पीएम किसान, नमो शेतकरी आणि रमाई घरकुल योजना उपलब्ध आहेत. अधिक माहितीसाठी ग्रामपंचायत कार्यालयात संपर्क करा.`;
        }
      }
      // 3. Check Water Timings
      else if (lowerQuery.includes('पाणी') || lowerQuery.includes('पाणी वेळ') || lowerQuery.includes('नळ')) {
        responseSpeechMr = GP_GENERAL_INFO.waterTimingsMr;
      }
      // 4. Check Office Timings
      else if (lowerQuery.includes('वेळ') || lowerQuery.includes('कार्यालय') || lowerQuery.includes('ऑफिस') || lowerQuery.includes('ग्रामपंचायत कधी उघडी')) {
        responseSpeechMr = GP_GENERAL_INFO.officeTimingsMr;
      }
      // 5. Check Tax Rebate Rules
      else if (lowerQuery.includes('कर') || lowerQuery.includes('सवलत') || lowerQuery.includes('रिबेट') || lowerQuery.includes('discount')) {
        responseSpeechMr = GP_GENERAL_INFO.taxRebateRuleMr;
      }
      // 6. Unknown / Complex Question -> Fallback to Gram Sevak
      else if (speechText.length > 0) {
        resolutionStatus = 'FORWARDED_TO_WORKER';
        forwardWorkerPhone = GP_GENERAL_INFO.gramSevakWorker.phone;
        responseSpeechMr = `आपल्या या विशेष प्रश्नाचे अचूक उत्तर देण्यासाठी मी आपला कॉल थेट ग्रामसेवक ${GP_GENERAL_INFO.gramSevakWorker.nameMr} यांच्याशी जोडत आहे. कृपया होल्ड करा...`;
      } else {
        responseSpeechMr = `आपण दाखला स्थिती, आवश्यक कागदपत्रे किंवा कर माहितीबद्दल विचारू शकता. ग्रामसेवकांशी बोलण्यासाठी ९ दाबा.`;
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP D: LOG CALL RECORD IN DATABASE
    // ─────────────────────────────────────────────────────────────────
    try {
      db.prepare(`
        INSERT INTO voice_call_logs (
          id, call_sid, caller_phone, dialed_number, gram_panchayat, 
          query_type, query_transcript, response_speech, resolution_status, 
          worker_forwarded_to, duration_seconds
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `vlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        callSid,
        cleanPhone || 'UNKNOWN',
        GP_GENERAL_INFO.gramSevakWorker.phone,
        gpName,
        queryType,
        speechText || (digits ? `DTMF_${digits}` : 'NO_SPEECH'),
        responseSpeechMr,
        resolutionStatus,
        forwardWorkerPhone,
        15
      );
    } catch (logErr) {
      console.warn('Could not log voice call:', logErr);
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP E: RETURN TWIML XML OR JSON
    // ─────────────────────────────────────────────────────────────────
    const isXmlRequested = req.headers['content-type']?.includes('xml') || 
                           req.headers.accept?.includes('xml') || 
                           req.query.format === 'xml' ||
                           req.body.CallSid;

    if (isXmlRequested) {
      let twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n`;
      twiml += `  <Say voice="Polly.Aditi" language="hi-IN">${escapeXml(responseSpeechMr)}</Say>\n`;

      if (resolutionStatus === 'FORWARDED_TO_WORKER' && forwardWorkerPhone) {
        twiml += `  <Dial timeout="20" record="record-from-answer">+91${forwardWorkerPhone}</Dial>\n`;
      } else {
        twiml += `  <Gather input="speech dtmf" language="hi-IN" action="/api/voice/process-speech" method="POST" speechTimeout="auto" timeout="5">\n`;
        twiml += `    <Say voice="Polly.Aditi" language="hi-IN">आणखी काही माहिती हवी असल्यास आपण बोलू शकता, किंवा कॉल ठेवू शकता.</Say>\n`;
        twiml += `  </Gather>\n`;
        twiml += `  <Say voice="Polly.Aditi" language="hi-IN">आपली ग्रामपंचायत हेल्पलाइनशी संपर्क केल्याबद्दल धन्यवाद. आपला दिवस शुभ जावो!</Say>\n`;
        twiml += `  <Hangup/>\n`;
      }
      twiml += `</Response>`;

      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.send(twiml);
      return;
    }

    // Return JSON response for API testing / custom voice clients
    res.json({
      success: true,
      call_sid: callSid,
      caller_phone: cleanPhone,
      query_received: speechText,
      query_type: queryType,
      resolution_status: resolutionStatus,
      response_speech_mr: responseSpeechMr,
      forwarded_to: forwardWorkerPhone,
      gram_panchayat: gpName
    });

  } catch (error: any) {
    console.error('Error in processSpeech:', error);
    res.status(500).json({ error: error.message || 'Speech processing failed' });
  }
};

/**
 * 3️⃣ Get Voice Call Logs for Gram Panchayat Staff / ERP Audit
 * GET /api/voice/logs
 */
export const getVoiceCallLogs = (req: Request, res: Response): void => {
  try {
    const logs = db.prepare(`
      SELECT * FROM voice_call_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `).all();
    res.json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch logs' });
  }
};

/**
 * 4️⃣ Get All Document Checklists for AI / Telephony Knowledge
 * GET /api/voice/knowledge
 */
export const getVoiceKnowledge = (req: Request, res: Response): void => {
  res.json({
    certificates: CERTIFICATE_REQUIREMENTS,
    schemes: SCHEMES_KNOWLEDGE,
    generalInfo: GP_GENERAL_INFO
  });
};
