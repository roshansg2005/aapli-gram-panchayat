"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatToE164 = formatToE164;
exports.formatTo12Digits = formatTo12Digits;
exports.sendSms = sendSms;
exports.sendOtpSms = sendOtpSms;
exports.sendCertificateStatusSms = sendCertificateStatusSms;
exports.sendGrievanceUpdateSms = sendGrievanceUpdateSms;
exports.sendTaxReceiptSms = sendTaxReceiptSms;
const twilio_1 = __importDefault(require("twilio"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Ensure environment variables are loaded
dotenv_1.default.config();
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
// MSG91 Configuration
const msg91AuthKey = process.env.MSG91_AUTH_KEY;
const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;
const msg91SenderId = process.env.MSG91_SENDER_ID || 'APLGRP';
// Twilio Configuration
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromPhone = process.env.TWILIO_PHONE_NUMBER;
let twilioClient = null;
if (msg91AuthKey) {
    console.log('✅ MSG91 SMS Gateway configured as primary provider.');
}
if (twilioAccountSid && twilioAuthToken && twilioAccountSid.startsWith('AC')) {
    try {
        twilioClient = (0, twilio_1.default)(twilioAccountSid, twilioAuthToken);
        console.log('✅ Twilio SMS Gateway initialized as fallback provider.');
    }
    catch (err) {
        console.warn('⚠️ Twilio initialization error:', err);
    }
}
if (!msg91AuthKey && !twilioClient) {
    console.log('ℹ️ SMS Gateway credentials pending. Running in simulated/fallback mode.');
}
/**
 * Format any Indian phone number to E.164 standard (+91XXXXXXXXXX) or 12 digits (91XXXXXXXXXX)
 */
function formatToE164(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `+91${digits}`;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
        return `+${digits}`;
    }
    if (phone.startsWith('+')) {
        return phone;
    }
    return `+91${digits.slice(-10)}`;
}
function formatTo12Digits(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `91${digits}`;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
        return digits;
    }
    return `91${digits.slice(-10)}`;
}
/**
 * Send OTP via MSG91 SendOTP API (v5)
 */
async function sendMsg91OtpApi(toPhone, otp) {
    if (!msg91AuthKey)
        return null;
    const mobile12 = formatTo12Digits(toPhone);
    try {
        // MSG91 OTP API URL
        const url = new URL('https://control.msg91.com/api/v5/otp');
        url.searchParams.append('mobile', mobile12);
        url.searchParams.append('otp', otp);
        url.searchParams.append('authkey', msg91AuthKey);
        if (msg91TemplateId) {
            url.searchParams.append('template_id', msg91TemplateId);
        }
        if (msg91SenderId) {
            url.searchParams.append('sender', msg91SenderId);
        }
        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authkey': msg91AuthKey,
            },
        });
        const data = await response.json().catch(() => ({}));
        console.log(`📱 [MSG91 OTP Response] Status: ${response.status} | Data:`, data);
        if (response.ok || (data && (data.type === 'success' || data.message?.toLowerCase?.()?.includes('success')))) {
            return {
                success: true,
                provider: 'msg91',
                messageId: data?.request_id || data?.message_id || 'msg91-ok',
                simulated: false,
            };
        }
        else {
            console.warn(`⚠️ [MSG91 Error] ${data?.message || response.statusText}`);
            return {
                success: false,
                provider: 'msg91',
                simulated: false,
                error: data?.message || `MSG91 Error ${response.status}`,
            };
        }
    }
    catch (err) {
        console.warn(`⚠️ [MSG91 Request Exception] ${err.message}`);
        return {
            success: false,
            provider: 'msg91',
            simulated: false,
            error: err.message,
        };
    }
}
/**
 * Send generic SMS via MSG91 Flow API
 */
async function sendMsg91FlowApi(toPhone, body) {
    if (!msg91AuthKey || !msg91TemplateId)
        return null;
    const mobile12 = formatTo12Digits(toPhone);
    try {
        const response = await fetch('https://control.msg91.com/api/v5/flow/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authkey': msg91AuthKey,
            },
            body: JSON.stringify({
                template_id: msg91TemplateId,
                short_url: '0',
                recipients: [
                    {
                        mobiles: mobile12,
                        message: body,
                    },
                ],
            }),
        });
        const data = await response.json().catch(() => ({}));
        console.log(`📱 [MSG91 Flow Response] Status: ${response.status} | Data:`, data);
        if (response.ok || data?.type === 'success') {
            return {
                success: true,
                provider: 'msg91',
                messageId: data?.message || 'msg91-flow-ok',
                simulated: false,
            };
        }
    }
    catch (err) {
        console.warn(`⚠️ [MSG91 Flow Error] ${err.message}`);
    }
    return null;
}
/**
 * Send SMS with multi-provider failover (MSG91 -> Twilio -> Graceful Simulation)
 */
async function sendSms(toPhone, body) {
    const formattedPhone = formatToE164(toPhone);
    // 1. Try MSG91 first if configured
    if (msg91AuthKey && msg91TemplateId) {
        const msg91Result = await sendMsg91FlowApi(toPhone, body);
        if (msg91Result && msg91Result.success) {
            console.log(`📱 [MSG91 SMS Sent] To: ${formattedPhone}`);
            return msg91Result;
        }
    }
    // 2. Try Twilio
    if (twilioClient && twilioFromPhone) {
        try {
            const message = await twilioClient.messages.create({
                body,
                from: twilioFromPhone,
                to: formattedPhone,
            });
            console.log(`📱 [Twilio SMS Sent] To: ${formattedPhone} | SID: ${message.sid}`);
            return {
                success: true,
                provider: 'twilio',
                messageId: message.sid,
                simulated: false,
            };
        }
        catch (err) {
            console.warn(`⚠️ [Twilio SMS Note] Failed to deliver SMS to ${formattedPhone}: ${err.message}`);
            if (err.code === 21608) {
                console.warn(`💡 Tip: On a Twilio Trial account, ${formattedPhone} must be added to 'Verified Caller IDs' in Twilio Console.`);
            }
        }
    }
    // 3. Fallback / Simulation
    console.log(`📲 [Simulated SMS] To: ${formattedPhone} | Content: ${body}`);
    return {
        success: true,
        provider: 'simulated',
        simulated: true,
    };
}
/**
 * Send OTP SMS for Citizen / Official Authentication (Supports MSG91 SendOTP API)
 */
async function sendOtpSms(toPhone, otp, lang = 'mr') {
    const formattedPhone = formatToE164(toPhone);
    // 1. If MSG91 is configured, send via MSG91 OTP API
    if (msg91AuthKey) {
        const msg91Res = await sendMsg91OtpApi(toPhone, otp);
        if (msg91Res && msg91Res.success) {
            console.log(`📱 [MSG91 OTP SMS Delivered] To: ${formattedPhone} | OTP: ${otp}`);
            return msg91Res;
        }
    }
    // 2. Fallback to Twilio / standard SMS dispatcher
    const messageBody = lang === 'mr'
        ? `आपली ग्रामपंचायत: आपला पडताळणी OTP ${otp} आहे. हा OTP कोणाशीही शेअर करू नका. (Aapli Gram Panchayat OTP: ${otp})`
        : `Aapli Gram Panchayat: Your login verification OTP is ${otp}. Please do not share it with anyone.`;
    return sendSms(toPhone, messageBody);
}
/**
 * Send Certificate Status Update SMS
 */
async function sendCertificateStatusSms(toPhone, applicantName, certificateType, status, gramPanchayat = 'घुलेवाडी') {
    let statusMr = 'मंजूर करण्यात आला आहे';
    if (status === 'rejected')
        statusMr = 'नामंजूर झाला आहे';
    if (status === 'in_progress')
        statusMr = 'प्रक्रियेत आहे';
    const messageBody = `ग्रामपंचायत ${gramPanchayat}: नमस्कार ${applicantName}, आपला ${certificateType} अर्ज ${statusMr}. तपशील पाहण्यासाठी आपली ग्रामपंचायत ॲप उघडा.`;
    return sendSms(toPhone, messageBody);
}
/**
 * Send Grievance Resolution SMS
 */
async function sendGrievanceUpdateSms(toPhone, complaintId, status, gramPanchayat = 'घुलेवाडी') {
    const messageBody = `ग्रामपंचायत ${gramPanchayat}: आपली तक्रार क्र. ${complaintId} चे निवारण करण्यात आले आहे (${status}). सहकार्याबद्दल धन्यवाद.`;
    return sendSms(toPhone, messageBody);
}
/**
 * Send Tax Payment Receipt SMS
 */
async function sendTaxReceiptSms(toPhone, ownerName, propertyNo, amount, receiptNo, gramPanchayat = 'घुलेवाडी') {
    const messageBody = `ग्रामपंचायत ${gramPanchayat}: धन्यवाद ${ownerName}, मिळकत क्र. ${propertyNo} साठी ₹${amount} कर भरणा यशस्वी झाला. पावती क्र: ${receiptNo}.`;
    return sendSms(toPhone, messageBody);
}
