import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { api } from '../../api/apiClient';
import { 
  X, 
  Landmark, 
  Smartphone, 
  Monitor, 
  User as UserIcon, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  Building,
  UserCheck,
  Send,
  Calendar,
  Mail,
  Shield,
  MapPin,
  UserPlus,
  Info,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { LocationSelector } from './LocationSelector';
import { sendFirebaseOtp, verifyFirebaseOtp } from '../../services/firebaseAuthService';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    authType, 
    setAuthType, 
    authMode, 
    setAuthMode, 
    language, 
    t, 
    login, 
    registerCitizen, 
    users 
  } = useApp();

  // Citizen Login State (Strictly 10-Digit Mobile Number + OTP)
  const [citPhone, setCitPhone] = useState('');
  const [citLoginOtp, setCitLoginOtp] = useState('');
  const [citOtpSent, setCitOtpSent] = useState(false);

  // Citizen Registration Fields
  const [regName, setRegName] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regHouseNo, setRegHouseNo] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // Verification state for citizen registration
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [activeVerifyTarget, setActiveVerifyTarget] = useState<'mobile' | 'email' | null>(null);
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Staff Login State (Password or OTP)
  const [staffAuthMethod, setStaffAuthMethod] = useState<'password' | 'otp'>('password');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffLoginOtp, setStaffLoginOtp] = useState('');
  const [staffOtpSent, setStaffOtpSent] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Location selector state for registration
  const [modalLocationData, setModalLocationData] = useState({
    state: 'Maharashtra',
    district: 'अहिल्यानगर',
    taluka: 'संगमनेर',
    gramPanchayat: 'घुलेवाडी',
    ward: 'Ward 1 (गणपती चौक)'
  });

  if (!showAuthModal) return null;

  // 📲 Send OTP for Citizen Login (SMS Gateway)
  const handleSendCitizenLoginOtp = async () => {
    const cleanPhone = citPhone.trim().replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(language === 'mr' ? 'कृपया वैध १०-अंकी मोबाईल क्रमांक प्रविष्ट करा.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setErrorMessage(null);
    setIsSendingOtp(true);

    try {
      const res = await sendFirebaseOtp(cleanPhone);
      setIsSendingOtp(false);

      if (res.success) {
        setCitOtpSent(true);
        setCitLoginOtp('');
        setSuccessBanner(
          language === 'mr' 
            ? `📲 मोबाईल क्रमांक (${cleanPhone}) वर ६-अंकी OTP SMS पाठवला आहे.` 
            : `📲 6-digit OTP SMS has been sent to mobile (${cleanPhone}).`
        );
      } else {
        setErrorMessage(res.error || (language === 'mr' ? 'OTP पाठवणे अयशस्वी झाले.' : 'Failed to send OTP.'));
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMessage(err?.message || (language === 'mr' ? 'OTP त्रुटी आली.' : 'Error sending OTP.'));
    }
  };

  // 📲 Send OTP for Staff Login (SMS Gateway)
  const handleSendStaffLoginOtp = async () => {
    const cleanPhone = staffPhone.trim().replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(language === 'mr' ? 'कृपया अधिकृत १०-अंकी mobile क्रमांक टाका.' : 'Please enter a valid 10-digit official mobile number.');
      return;
    }
    setErrorMessage(null);
    setIsSendingOtp(true);

    try {
      const res = await sendFirebaseOtp(cleanPhone);
      setIsSendingOtp(false);

      if (res.success) {
        setStaffOtpSent(true);
        setStaffLoginOtp('');
        setSuccessBanner(
          language === 'mr'
            ? `📲 अधिकृत मोबाईल क्रमांक (${cleanPhone}) वर ६-अंकी OTP SMS पाठवला आहे.`
            : `📲 6-digit OTP SMS has been sent to official mobile (${cleanPhone}).`
        );
      } else {
        setErrorMessage(res.error || (language === 'mr' ? 'OTP पाठवणे अयशस्वी.' : 'Failed to send OTP.'));
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMessage(err?.message || (language === 'mr' ? 'OTP त्रुटी आली.' : 'Error sending OTP.'));
    }
  };

  // 📲 Send OTP for Citizen Registration Phone Verification (SMS Gateway)
  const handleSendRegMobileOtp = async () => {
    const cleanPhone = regPhone.trim().replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(language === 'mr' ? 'कृपया प्रथम वैध १०-अंकी mobile क्रमांक प्रविष्ट करा.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMessage(null);
    setIsSendingOtp(true);

    try {
      const res = await sendFirebaseOtp(cleanPhone);
      setIsSendingOtp(false);

      if (res.success) {
        setActiveVerifyTarget('mobile');
        setVerifyOtpInput('');
        setSuccessBanner(
          language === 'mr'
            ? `📲 नोंदणीसाठी मोबाईल (${cleanPhone}) वर ६-अंकी OTP SMS पाठवला आहे.`
            : `📲 6-digit OTP SMS sent to mobile (${cleanPhone}) for verification.`
        );
      } else {
        setErrorMessage(res.error || (language === 'mr' ? 'OTP पाठवणे अयशस्वी.' : 'Failed to send OTP.'));
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMessage(err?.message || (language === 'mr' ? 'OTP त्रुटी आली.' : 'Error sending OTP.'));
    }
  };

  // 📲 Send OTP for Citizen Registration Email Verification
  const handleSendRegEmailOtp = async () => {
    if (!regEmail || !regEmail.includes('@') || !regEmail.includes('.')) {
      setErrorMessage(language === 'mr' ? 'कृपया प्रथम वैध ईमेल आयडी प्रविष्ट करा.' : 'Please enter a valid email address.');
      return;
    }
    setErrorMessage(null);
    setIsSendingOtp(true);
    await api.sendOtp(regEmail);
    setIsSendingOtp(false);
    setVerifyOtpInput('');
    setActiveVerifyTarget('email');
    setSuccessBanner(
      language === 'mr'
        ? `📧 ईमेल (${regEmail}) वर ६-अंकी OTP पाठवला आहे.`
        : `📧 6-digit OTP sent to email (${regEmail}).`
    );
  };

  // ✅ Verify OTP for Citizen Registration (Firebase or Email)
  const handleVerifyRegistrationOtp = async () => {
    if (!verifyOtpInput || verifyOtpInput.length < 4) {
      setErrorMessage(language === 'mr' ? 'कृपया प्राप्त OTP टाका.' : 'Please enter OTP code.');
      return;
    }

    setIsVerifying(true);
    let isSuccess = false;
    let err = '';

    if (activeVerifyTarget === 'mobile') {
      const cleanPhone = regPhone.trim().replace(/\D/g, '').slice(-10);
      const res = await verifyFirebaseOtp(verifyOtpInput, cleanPhone);
      isSuccess = res.success;
      err = res.message || '';
    } else {
      const res = await api.verifyOtp(regEmail, verifyOtpInput);
      isSuccess = Boolean(res && res.success);
    }
    setIsVerifying(false);

    if (isSuccess) {
      if (activeVerifyTarget === 'mobile') {
        setIsMobileVerified(true);
      } else {
        setIsEmailVerified(true);
      }
      setActiveVerifyTarget(null);
      setVerifyOtpInput('');
      setSuccessBanner(
        language === 'mr' 
          ? `✅ ${activeVerifyTarget === 'mobile' ? 'मोबाईल क्रमांक' : 'ईमेल आयडी'} यशस्वीरीत्या प्रमाणित झाला!` 
          : `✅ ${activeVerifyTarget === 'mobile' ? 'Mobile number' : 'Email address'} verified successfully!`
      );
    } else {
      setErrorMessage(err || (language === 'mr' ? 'चुकीचा OTP टाकला आहे. कृपया पुन्हा तपासा.' : 'Invalid OTP entered. Please try again.'));
    }
  };

  // 👤 Citizen Login Submit (Strictly 10-Digit Mobile Number + Firebase OTP)
  const handleCitizenLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanPhone = citPhone.trim().replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(language === 'mr' ? 'कृपया १०-अंकी mobile क्रमांक टाका.' : 'Please enter 10-digit mobile number.');
      return;
    }

    if (!citLoginOtp || citLoginOtp.length < 4) {
      setErrorMessage(language === 'mr' ? 'कृपया मोबाईलवर प्राप्त OTP टाका.' : 'Please enter the OTP received on your mobile.');
      return;
    }

    const verifyRes = await verifyFirebaseOtp(citLoginOtp, cleanPhone);
    if (!verifyRes.success) {
      setErrorMessage(verifyRes.message || (language === 'mr' ? 'चुकीचा OTP टाकला आहे.' : 'Invalid OTP entered.'));
      return;
    }

    const success = login(cleanPhone, citLoginOtp, 'citizen');
    if (success) {
      setShowAuthModal(false);
    } else {
      setErrorMessage(language === 'mr' ? 'या मोबाईल क्रमांकावर नागरिक नोंद सापडली नाही. कृपया नोंदणी करा.' : 'Citizen record not found for this mobile. Please register.');
    }
  };

  // 🏢 Staff Login Submit (Password or SMS OTP)
  const handleStaffLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    const cleanIdentifier = staffPhone.trim();
    if (!cleanIdentifier) {
      setErrorMessage(
        language === 'mr' 
          ? 'कृपया अधिकृत १०-अंकी मोबाईल क्रमांक किंवा कर्मचारी कोड प्रविष्ट करा.' 
          : 'Please enter official mobile number or employee code.'
      );
      return;
    }

    setIsLoggingIn(true);

    if (staffAuthMethod === 'password') {
      if (!staffPassword) {
        setIsLoggingIn(false);
        setErrorMessage(language === 'mr' ? 'कृपया आपला पासवर्ड प्रविष्ट करा.' : 'Please enter your password.');
        return;
      }

      try {
        const success = await login(cleanIdentifier, staffPassword, 'staff', true);
        setIsLoggingIn(false);
        if (success) {
          setShowAuthModal(false);
        } else {
          setErrorMessage(
            language === 'mr' 
              ? '⚠️ चुकीचा मोबाईल क्रमांक किंवा पासवर्ड! जर पासवर्ड सेट नसेल तर खालील "SMS OTP लॉगिन" निवडून लॉगिन करा.' 
              : '⚠️ Invalid mobile number or password. If not set, please use SMS OTP login.'
          );
        }
      } catch (err: any) {
        setIsLoggingIn(false);
        setErrorMessage(err?.message || (language === 'mr' ? 'लॉगिन त्रुटी आली.' : 'Login error.'));
      }
      return;
    }

    // OTP Flow
    const cleanPhone = cleanIdentifier.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setIsLoggingIn(false);
      setErrorMessage(language === 'mr' ? 'कृपया अधिकृत १०-अंकी mobile क्रमांक टाका.' : 'Please enter 10-digit official mobile number.');
      return;
    }

    if (!staffLoginOtp || staffLoginOtp.length < 4) {
      setIsLoggingIn(false);
      setErrorMessage(language === 'mr' ? 'कृपया OTP प्रविष्ट करा.' : 'Please enter the OTP.');
      return;
    }

    const verifyRes = await verifyFirebaseOtp(staffLoginOtp, cleanPhone);
    if (!verifyRes.success) {
      setIsLoggingIn(false);
      setErrorMessage(verifyRes.message || (language === 'mr' ? 'चुकीचा OTP टाकला आहे.' : 'Invalid OTP entered.'));
      return;
    }

    const success = await login(cleanPhone, staffLoginOtp, 'staff');
    setIsLoggingIn(false);
    if (success) {
      setShowAuthModal(false);
    } else {
      setErrorMessage(language === 'mr' ? 'या मोबाईल क्रमांकावर अधिकारी नोंद सापडली नाही. कृपया तालुका BDO किंवा सरपंचांशी संपर्क साधा.' : 'Official staff record not found for this mobile number.');
    }
  };

  // 📝 Citizen Registration Submit (Full Information Registration)
  const handleCitizenRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = regPhone.trim().replace(/\D/g, '').slice(-10);

    if (!regName.trim() || !cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(language === 'mr' ? 'कृपया पूर्ण नाव आणि वैध १०-अंकी मोबाईल नंबर भरा.' : 'Please fill Full Name and valid 10-digit Mobile Number.');
      return;
    }

    if (!regHouseNo.trim()) {
      setErrorMessage(language === 'mr' ? 'कृपया घर / मिळकत क्रमांक भरा.' : 'Please fill House / Property Number.');
      return;
    }

    if (!isMobileVerified) {
      setErrorMessage(
        language === 'mr' 
          ? '⚠️ नोंदणी पूर्ण करण्यासाठी कृपया मोबाईल क्रमांकावर प्राप्त OTP द्वारे प्रमाणीकरण (Verify) करा.' 
          : '⚠️ Please verify your Mobile Number with OTP before registering.'
      );
      return;
    }

    registerCitizen({
      name: regName.trim(),
      phone: cleanPhone,
      dob: regDob || undefined,
      email: regEmail ? regEmail.trim() : undefined,
      aadhaar: regAadhaar ? regAadhaar.trim() : undefined,
      state: modalLocationData.state || 'Maharashtra',
      district: modalLocationData.district,
      taluka: modalLocationData.taluka,
      gramPanchayat: modalLocationData.gramPanchayat,
      wardNo: modalLocationData.ward || 'Ward 1',
      houseNo: regHouseNo.trim(),
      address: regAddress ? regAddress.trim() : `${modalLocationData.ward || 'Ward 1'}, ${modalLocationData.gramPanchayat}`
    });

    // Move to Login Screen with prefilled mobile
    setCitPhone(cleanPhone);
    setCitOtpSent(false);
    setAuthMode('login');
    setSuccessBanner(
      language === 'mr' 
        ? `✅ नागरिक खाते तयार झाले! मोबाइल क्र. (${cleanPhone}) वर OTP मागवून लॉगिन करा.` 
        : `✅ Account created! Please login with OTP on mobile (${cleanPhone}).`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Strip */}
        <div className="px-5 py-4 bg-gradient-to-r from-gov-navy via-slate-900 to-gov-navy text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden ring-1 ring-emerald-400/40">
              <img src="/logo.png" alt="आपली ग्रामपंचायत" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-amber-400">
                  {language === 'mr' ? 'आपली ग्रामपंचायत डिजिटल खाते (OTP)' : 'Aapli Gram Panchayat Auth Portal (OTP)'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  {language === 'mr' ? 'सुरक्षित OTP' : 'Secure SMS OTP'}
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                {authType === 'citizen' 
                  ? (language === 'mr' ? 'नागरिक सेवा व कर भरणा महापोर्टल' : 'Citizen E-Services & Tax Payment') 
                  : (language === 'mr' ? 'ग्रामपंचायत कार्यालयीन प्रशासन ERP' : 'Gram Panchayat Administration ERP')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowAuthModal(false)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Switcher: Citizen vs Panchayat Staff */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 border-b border-slate-200 text-xs">
          <button
            onClick={() => {
              setAuthType('citizen');
              setErrorMessage(null);
              setSuccessBanner(null);
            }}
            className={`py-2 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authType === 'citizen'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'नागरिक पोर्टल' : 'Citizen'}</span>
          </button>

          <button
            onClick={() => {
              setAuthType('panchayat');
              setErrorMessage(null);
              setSuccessBanner(null);
            }}
            className={`py-2 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authType === 'panchayat'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'कर्मचारी ERP (Mobile OTP)' : 'Staff ERP (Mobile OTP)'}</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Sub Header / Mode Switcher */}
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-800">
              {authType === 'citizen'
                ? (authMode === 'login' ? (language === 'mr' ? 'नागरिक लॉगिन' : 'Citizen Login') : (language === 'mr' ? 'नवीन नागरिक नोंदणी' : 'Citizen Registration'))
                : (language === 'mr' ? 'ग्रामपंचायत प्रशासन / अधिकारी लॉगिन' : 'Staff & Officer ERP Login')
              }
            </h4>

            {authType === 'citizen' && (
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                  }}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {language === 'mr' ? 'लॉगिन' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage(null);
                  }}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {language === 'mr' ? 'नोंदणी' : 'Register'}
                </button>
              </div>
            )}
          </div>

          {/* Success Banner */}
          {successBanner && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* --- FORMS --- */}
          {authType === 'citizen' ? (
            authMode === 'login' ? (
              /* Citizen Login Form (OTP) */
              <form onSubmit={handleCitizenLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'नोंदणीकृत १०-अंकी मोबाईल क्रमांक' : 'Registered 10-Digit Mobile Number'} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder={language === 'mr' ? 'उदा. 98XXXXXXXX' : 'e.g. 98XXXXXXXX'}
                        value={citPhone}
                        onChange={(e) => setCitPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold font-mono text-slate-900 bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendCitizenLoginOtp}
                      disabled={isSendingOtp}
                      className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      <Send className="w-3 h-3 text-orange-700" />
                      <span>{citOtpSent ? (language === 'mr' ? 'पुन्हा पाठवा' : 'Resend') : (language === 'mr' ? 'OTP पाठवा' : 'Send OTP')}</span>
                    </button>
                  </div>
                </div>

                {citOtpSent && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-amber-950">
                        {language === 'mr' ? '६-अंकी SMS OTP कोड टाका:' : 'Enter 6-Digit SMS OTP:'}
                      </label>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="• • • • • •"
                        value={citLoginOtp}
                        onChange={(e) => setCitLoginOtp(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-sm font-mono tracking-widest text-center font-bold rounded-xl border border-amber-300 bg-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-200" />
                  <span>{language === 'mr' ? 'OTP द्वारे नागरिक पोर्टल उघडा' : 'Login to Citizen Portal'}</span>
                </button>
              </form>
            ) : (
              /* Citizen Register Form with DOB, Email, and Verification */
              <form onSubmit={handleCitizenRegisterSubmit} className="space-y-3.5">
                
                {/* Verification Status */}
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-[11px] text-blue-950">
                  <span className="font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    {language === 'mr' ? 'पडताळणी स्थिती:' : 'Status:'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isMobileVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isMobileVerified ? '✓ मोबाईल प्रमाणित' : '📱 मोबाईल अपूर्ण'}
                    </span>
                  </div>
                </div>

                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'पूर्ण नाव (Full Name)' : 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'mr' ? 'उदा. ज्ञानेश्वर संभाजी मोरे' : 'e.g. Dnyaneshwar Sambhaji More'}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* 2. Date of Birth & Aadhaar */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      {language === 'mr' ? 'जन्मतारीख' : 'Date of Birth'}
                    </label>
                    <input
                      type="date"
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-orange-600" />
                      {language === 'mr' ? 'आधार (१२ अंकी)' : 'Aadhaar'}
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      placeholder="XXXX-XXXX-XXXX"
                      value={regAadhaar}
                      onChange={(e) => setRegAadhaar(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                </div>

                {/* 3. Mobile Number with OTP Verification */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'mr' ? '१० अंकी मोबाइल क्रमांक' : 'Mobile Number'} <span className="text-red-500">*</span>
                    </label>
                    {isMobileVerified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {language === 'mr' ? 'प्रमाणित' : 'Verified'}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="98XXXXXXXX"
                      value={regPhone}
                      onChange={(e) => {
                        setRegPhone(e.target.value.replace(/\D/g, ''));
                        setIsMobileVerified(false);
                      }}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleSendRegMobileOtp}
                      disabled={isSendingOtp || isMobileVerified}
                      className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 border ${
                        isMobileVerified ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-orange-100 hover:bg-orange-200 text-orange-900 border-orange-300'
                      }`}
                    >
                      <Send className="w-3 h-3 text-orange-700" />
                      <span>{isMobileVerified ? (language === 'mr' ? '✓ प्रमाणित' : '✓ Verified') : (language === 'mr' ? 'OTP मिळवा' : 'Get OTP')}</span>
                    </button>
                  </div>
                </div>

                {/* 4. Email (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-orange-600" />
                    {language === 'mr' ? 'ईमेल आयडी (पर्यायी)' : 'Email Address (Optional)'}
                  </label>
                  <input
                    type="email"
                    placeholder="citizen@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Inline OTP verification */}
                {activeVerifyTarget && !isMobileVerified && (
                  <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-400 space-y-2 animate-fade-in shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                      <span>{language === 'mr' ? `प्राप्त OTP टाका (${regPhone}):` : `Enter OTP Received (${regPhone}):`}</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="• • • • • •"
                        value={verifyOtpInput}
                        onChange={(e) => setVerifyOtpInput(e.target.value)}
                        className="w-28 px-2 py-1.5 text-xs font-mono font-bold tracking-widest text-center rounded-lg border border-amber-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyRegistrationOtp}
                        disabled={isVerifying}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'mr' ? 'प्रमाणित करा' : 'Verify'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Location Selector (State -> District -> Taluka -> GP -> Ward) */}
                <div className="pt-1">
                  <LocationSelector
                    level="ward"
                    showWard={true}
                    selectedState={modalLocationData.state}
                    selectedDistrict={modalLocationData.district}
                    selectedTaluka={modalLocationData.taluka}
                    selectedGramPanchayat={modalLocationData.gramPanchayat}
                    selectedWard={modalLocationData.ward}
                    onChange={(data) => {
                      setModalLocationData({
                        state: data.state || 'Maharashtra',
                        district: data.district,
                        taluka: data.taluka,
                        gramPanchayat: data.gramPanchayat,
                        ward: data.ward || 'Ward 1'
                      });
                    }}
                  />
                </div>

                {/* 6. House No & Address */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'mr' ? 'घर क्र. / मिळकत क्र.' : 'House / Property No.'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. ४५"
                      value={regHouseNo}
                      onChange={(e) => setRegHouseNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'mr' ? 'पत्ता / गल्ली' : 'Address'}
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. गणपती गल्ली"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
                >
                  <UserPlus className="w-4 h-4 text-amber-200" />
                  <span>{language === 'mr' ? 'नोंदणी पूर्ण करा व लॉगिनवर जा' : 'Complete Registration & Proceed'}</span>
                </button>
              </form>
            )
          ) : (
            /* Staff Login Form (Strictly Password Login) */
            <form onSubmit={handleStaffLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'mr' ? 'अधिकृत मोबाईल क्रमांक किंवा कर्मचारी कोड' : 'Official Mobile Number or Employee Code'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={language === 'mr' ? 'उदा. 98XXXXXXXX किंवा STF-001' : 'e.g. 98XXXXXXXX or STF-001'}
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'mr' ? 'पासवर्ड (Password)' : 'Password'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showStaffPassword ? 'text' : 'password'}
                    required
                    placeholder={language === 'mr' ? 'आपला पासवर्ड टाका' : 'Enter password'}
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
              >
                {isLoggingIn ? (
                  <span className="animate-pulse">{language === 'mr' ? 'प्रमाणीकरण करत आहे...' : 'Authenticating...'}</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>{language === 'mr' ? '🔐 पासवर्डने ERP उघडा' : 'Login to Staff ERP'}</span>
                  </>
                )}
              </button>

              {/* Information Notice */}
              <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {language === 'mr' 
                    ? 'अधिकारी व कर्मचारी रोजच्या वेब प्रवेशासाठी मोबाईल / कर्मचारी कोड + पासवर्डने थेट लॉगिन करू शकतात.'
                    : 'Staff and officers can log in directly using Mobile Number / Employee Code + Password.'}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
