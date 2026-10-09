import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { api } from '../../api/apiClient';
import { 
  Landmark, 
  Smartphone, 
  Monitor, 
  User as UserIcon, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Languages, 
  Phone, 
  KeyRound, 
  Building, 
  UserCheck,
  MapPin,
  AlertCircle,
  RefreshCw,
  Send,
  Calendar,
  CreditCard,
  Mail,
  Shield,
  FileCheck,
  Lock,
  Crown,
  Award,
  Info,
  Home,
  UserPlus,
  Eye,
  EyeOff,
  Key,
  Download
} from 'lucide-react';
import { LocationSelector } from '../common/LocationSelector';
import { MobileAppDownloadModal } from '../common/MobileAppDownloadModal';
import { sendFirebaseOtp, verifyFirebaseOtp } from '../../services/firebaseAuthService';

export const AuthGatewayScreen: React.FC = () => {
  const { 
    language, 
    toggleLanguage, 
    t, 
    setAppMode, 
    login, 
    registerCitizen, 
    users, 
    panchayatInfo 
  } = useApp();

  // Active portal tab: 'citizen' or 'panchayat'
  const [activePortal, setActivePortal] = useState<'citizen' | 'panchayat'>('citizen');

  // Citizen Portal mode: 'login' or 'register' (Citizens can login & register; Staff only login with mobile)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Citizen Login State (Strictly 10-Digit Mobile Number + OTP)
  const [citPhone, setCitPhone] = useState('');
  const [citLoginOtp, setCitLoginOtp] = useState('');
  const [citLoginOtpSent, setCitLoginOtpSent] = useState(false);

  // Citizen Register State
  const [citRegName, setCitRegName] = useState('');
  const [citRegDob, setCitRegDob] = useState('');
  const [citRegPhone, setCitRegPhone] = useState('');
  const [citRegEmail, setCitRegEmail] = useState('');
  const [citRegAadhaar, setCitRegAadhaar] = useState('');
  const [citRegHouseNo, setCitRegHouseNo] = useState('');
  const [citRegAddress, setCitRegAddress] = useState('');

  // Mobile OTP Verification State for Registration
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [regVerifyOtpInput, setRegVerifyOtpInput] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showOtpInputModal, setShowOtpInputModal] = useState(false);

  // Location Hierarchy State for Registration
  const [locationData, setLocationData] = useState({
    state: 'Maharashtra',
    district: 'अहिल्यानगर',
    taluka: 'संगमनेर',
    gramPanchayat: 'घुलेवाडी',
    ward: 'Ward 1 (गणपती चौक)'
  });

  // Staff Login State (Password or OTP)
  const [staffAuthMethod, setStaffAuthMethod] = useState<'password' | 'otp'>('password');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffLoginOtp, setStaffLoginOtp] = useState('');
  const [staffLoginOtpSent, setStaffLoginOtpSent] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [showAppDownloadModal, setShowAppDownloadModal] = useState<boolean>(false);

  // 📲 Send OTP for Citizen Login (SMS OTP)
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
        setCitLoginOtpSent(true);
        setCitLoginOtp('');
        setSuccessBanner(
          language === 'mr' 
            ? `📲 सुरक्षित OTP आपल्या मोबाईल क्रमांकावर SMS द्वारे पाठवला आहे. कृपया SMS तपासा.` 
            : `📲 Secure OTP sent to your mobile via SMS. Please check your messages.`
        );
      } else {
        setErrorMessage(res.error || (language === 'mr' ? 'OTP पाठवणे अयशस्वी झाले.' : 'Failed to send OTP.'));
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMessage(err?.message || (language === 'mr' ? 'OTP त्रुटी आली.' : 'Error sending OTP.'));
    }
  };

  // 📲 Send OTP for Citizen Registration Verification (SMS OTP)
  const handleSendRegOtp = async () => {
    const cleanPhone = citRegPhone.trim().replace(/\D/g, '').slice(-10);
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
        setRegVerifyOtpInput('');
        setShowOtpInputModal(true);
        setSuccessBanner(
          language === 'mr'
            ? `📲 सुरक्षित OTP आपल्या मोबाईल क्रमांकावर SMS द्वारे पाठवला आहे.`
            : `📲 Secure OTP sent to your mobile number via SMS.`
        );
      } else {
        setErrorMessage(res.error || (language === 'mr' ? 'OTP पाठवणे अयशस्वी.' : 'Failed to send OTP.'));
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMessage(err?.message || (language === 'mr' ? 'OTP त्रुटी आली.' : 'Error sending OTP.'));
    }
  };

  // ✅ Confirm Registration OTP with SMS OTP
  const handleVerifyRegistrationOtp = async () => {
    if (!regVerifyOtpInput || regVerifyOtpInput.length < 4) {
      setErrorMessage(language === 'mr' ? 'कृपया प्राप्त OTP टाका.' : 'Please enter OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    const res = await verifyFirebaseOtp(regVerifyOtpInput, citRegPhone);
    setIsVerifyingOtp(false);

    if (res && res.success) {
      setIsMobileVerified(true);
      setShowOtpInputModal(false);
      setSuccessBanner(
        language === 'mr' 
          ? '✅ मोबाईल क्रमांक यशस्वीरीत्या प्रमाणित झाला!' 
          : '✅ Mobile number verified successfully!'
      );
    } else {
      setErrorMessage(res.message || (language === 'mr' ? 'चुकीचा OTP टाकला आहे.' : 'Invalid OTP entered.'));
    }
  };

  // 📲 Send OTP for Staff Login (SMS OTP)
  const handleSendStaffLoginOtp = async () => {
    const cleanStaffPhone = staffPhone.trim().replace(/\D/g, '').slice(-10);
    if (!cleanStaffPhone || cleanStaffPhone.length < 10) {
      setErrorMessage(language === 'mr' ? 'कृपया अधिकृत १०-अंकी mobile क्रमांक टाका.' : 'Please enter a valid 10-digit official mobile number.');
      return;
    }
    setErrorMessage(null);
    setIsSendingOtp(true);

    try {
      const res = await sendFirebaseOtp(cleanStaffPhone);
      setIsSendingOtp(false);

      if (res.success) {
        setStaffLoginOtpSent(true);
        setStaffLoginOtp('');
        setSuccessBanner(
          language === 'mr'
            ? `📲 सुरक्षित OTP आपल्या अधिकृत मोबाईल क्रमांकावर SMS द्वारे पाठवला आहे.`
            : `📲 Secure OTP sent to your official mobile via SMS.`
        );
      } else {
        setErrorMessage(res.error || (language === 'mr' ? 'OTP पाठवणे अयशस्वी.' : 'Failed to send OTP.'));
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMessage(err?.message || (language === 'mr' ? 'OTP त्रुटी आली.' : 'Error sending OTP.'));
    }
  };

  // 🔑 Citizen Login Submit (SMS OTP Verification)
  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanPhone = citPhone.trim().replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(language === 'mr' ? 'कृपया वैध १०-अंकी मोबाईल क्रमांक टाका.' : 'Please enter a valid 10-digit mobile number.');
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

    const success = await login(cleanPhone, citLoginOtp);
    if (success) {
      // AppContext login handles routing
    } else {
      setErrorMessage(
        language === 'mr' 
          ? '⚠️ या मोबाईल क्रमांकावर खाते आढळले नाही. कृपया खालील "नवीन नागरिक नोंदणी" वर क्लिक करून खाते तयार करा.' 
          : '⚠️ Account not found for this mobile number. Please click "New Citizen Registration" below to create an account.'
      );
    }
  };

  // 🔑 Staff Login Submit (Password or SMS OTP)
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    const cleanStaffIdentifier = staffPhone.trim();
    if (!cleanStaffIdentifier) {
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
        const success = await login(cleanStaffIdentifier, staffPassword, undefined, true);
        setIsLoggingIn(false);
        if (success) {
          setAppMode('panchayat-desktop');
        } else {
          setErrorMessage(
            language === 'mr' 
              ? '⚠️ चुकीचा मोबाईल क्रमांक किंवा पासवर्ड! जर पासवर्ड सेट नसेल तर खालील "SMS OTP लॉगिन" द्वारे लॉगिन करून प्रोफाईलमध्ये पासवर्ड सेट करा.' 
              : '⚠️ Invalid mobile number or password. If not set, use "SMS OTP Login" and set a password in your profile.'
          );
        }
      } catch (err: any) {
        setIsLoggingIn(false);
        setErrorMessage(err?.message || (language === 'mr' ? 'लॉगिन त्रुटी आली.' : 'Login error.'));
      }
      return;
    }

    // SMS OTP Flow
    const digitsOnly = cleanStaffIdentifier.replace(/\D/g, '').slice(-10);
    if (!digitsOnly || digitsOnly.length < 10) {
      setIsLoggingIn(false);
      setErrorMessage(language === 'mr' ? 'कृपया अधिकृत १०-अंकी mobile क्रमांक टाका.' : 'Please enter a valid 10-digit official mobile number.');
      return;
    }

    if (!staffLoginOtp || staffLoginOtp.length < 4) {
      setIsLoggingIn(false);
      setErrorMessage(language === 'mr' ? 'कृपया OTP प्रविष्ट करा.' : 'Please enter the OTP.');
      return;
    }

    const verifyRes = await verifyFirebaseOtp(staffLoginOtp, digitsOnly);
    if (!verifyRes.success) {
      setIsLoggingIn(false);
      setErrorMessage(verifyRes.message || (language === 'mr' ? 'चुकीचा OTP टाकला आहे.' : 'Invalid OTP entered.'));
      return;
    }

    const success = await login(digitsOnly, staffLoginOtp);
    setIsLoggingIn(false);
    if (success) {
      setAppMode('panchayat-desktop');
    } else {
      setErrorMessage(
        language === 'mr' 
          ? '⚠️ या मोबाईल क्रमांकावर कोणतीही अधिकारी नोंद सापडली नाही. कृपया BDO किंवा सरपंचांनी नोंदवलेला अधिकृत मोबाईल वापरा.' 
          : '⚠️ No official staff record found for this mobile number. Please enter the official mobile registered by BDO or Sarpanch.'
      );
    }
  };

  // 📝 Citizen Register Submit (Full Information Registration)
  const handleCitizenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = citRegPhone.trim().replace(/\D/g, '').slice(-10);

    if (!citRegName.trim() || !cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(language === 'mr' ? 'कृपया पूर्ण नाव आणि वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.' : 'Please enter Full Name and valid 10-digit Mobile Number.');
      return;
    }

    if (!citRegHouseNo.trim()) {
      setErrorMessage(language === 'mr' ? 'कृपया घर / मिळकत क्रमांक प्रविष्ट करा.' : 'Please enter House / Property Number.');
      return;
    }

    if (!isMobileVerified) {
      setErrorMessage(
        language === 'mr' 
          ? '⚠️ नोंदणी पूर्ण करण्यासाठी कृपया मोबाईल क्रमांक OTP द्वारे प्रमाणित (Verify) करा.' 
          : '⚠️ Please verify your mobile number with OTP before registering.'
      );
      return;
    }

    registerCitizen({
      name: citRegName.trim(),
      phone: cleanPhone,
      dob: citRegDob || undefined,
      email: citRegEmail ? citRegEmail.trim() : undefined,
      aadhaar: citRegAadhaar ? citRegAadhaar.trim() : undefined,
      state: locationData.state || 'Maharashtra',
      district: locationData.district,
      taluka: locationData.taluka,
      gramPanchayat: locationData.gramPanchayat,
      wardNo: locationData.ward || 'Ward 1',
      houseNo: citRegHouseNo.trim(),
      address: citRegAddress ? citRegAddress.trim() : `${locationData.ward || 'Ward 1'}, ${locationData.gramPanchayat}`,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });

    // Auto switch to login with phone pre-filled
    setCitPhone(cleanPhone);
    setCitLoginOtpSent(false);
    setAuthMode('login');
    setSuccessBanner(
      language === 'mr' 
        ? `✅ ${citRegName}, आपले नागरिक खाते यशस्वीरीत्या तयार झाले! कृपया आता मोबाईल OTP ने लॉगिन करा.` 
        : `✅ ${citRegName}, your citizen account was created! Please login with Mobile OTP.`
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gov-navy to-slate-900 text-white flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Government Navigation Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-xl border border-white/30 overflow-hidden ring-2 ring-emerald-500/30">
            <img src="/logo.png" alt="आपली ग्रामपंचायत" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {language === 'mr' ? 'महाराष्ट्र शासन • ग्रामविकास विभाग' : 'Govt of Maharashtra • Rural Development'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white mt-0.5">
              {language === 'mr' ? 'आपली ग्रामपंचायत' : 'Aapli Gram Panchayat'}
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              {language === 'mr' ? 'डिजिटल नागरिक सेवा व ई-प्रशासन महापोर्टल' : 'Digital Citizen Services & E-Governance Gateway'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          {/* 🏠 Home Button */}
          <button
            onClick={() => setAppMode('home')}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all active:scale-95 text-amber-300"
            title="Go to Homepage"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'mr' ? 'मुख्य पृष्ठ' : 'Home'}</span>
          </button>

          {/* 📱 Mobile App Download Button (Top Login Header) */}
          <button
            onClick={() => setShowAppDownloadModal(true)}
            className="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 border border-emerald-300/40 text-xs md:text-sm font-extrabold transition-all active:scale-95 group animate-pulse hover:animate-none"
            title="Download Mobile App APK"
          >
            <Smartphone className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">
              {language === 'mr' ? '📱 मोबाईल ॲप डाऊनलोड' : '📱 Download Mobile App'}
            </span>
            <span className="sm:hidden">
              {language === 'mr' ? 'ॲप डाऊनलोड' : 'App'}
            </span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider hidden md:inline border border-white/20">
              APK v1.2
            </span>
          </button>

          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold transition-all active:scale-95"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          
          {/* Top Role Selector Tabs - Public Portals Only */}
          <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200">
            <button
              onClick={() => {
                setActivePortal('citizen');
                setErrorMessage(null);
                setSuccessBanner(null);
              }}
              className={`py-3 px-4 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                activePortal === 'citizen'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{language === 'mr' ? 'नागरिक सेवा पोर्टल (Citizen)' : 'Citizen Portal (Mobile)'}</span>
            </button>

            <button
              onClick={() => {
                setActivePortal('panchayat');
                setErrorMessage(null);
                setSuccessBanner(null);
              }}
              className={`py-3 px-4 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                activePortal === 'panchayat'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>{language === 'mr' ? 'ग्रामपंचायत प्रशासन (Staff ERP)' : 'Panchayat Staff ERP'}</span>
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            {/* Header with Citizen Login / Register Switch */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-900">
                  {activePortal === 'citizen' 
                    ? (authMode === 'login' ? (language === 'mr' ? 'नागरिक OTP लॉगिन' : 'Citizen Login') : (language === 'mr' ? 'नवीन नागरिक नोंदणी' : 'Citizen Registration'))
                    : (language === 'mr' ? 'अधिकारी व कर्मचारी लॉगिन' : 'Staff & Officer Login')
                  }
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activePortal === 'citizen'
                    ? (authMode === 'login' 
                        ? (language === 'mr' ? 'नोंदणीकृत १०-अंकी मोबाईल क्रमांकावर OTP द्वारे सुरक्षित प्रवेश' : 'Secure OTP verification via registered 10-digit Mobile Number')
                        : (language === 'mr' ? 'गावातील नवीन नागरिक व रहिवासी नोंदणी' : 'Register new village resident / citizen profile'))
                    : (language === 'mr' ? 'अधिकारी व कर्मचाऱ्यांसाठी सुरक्षित पासवर्ड लॉगिन' : 'Secure Password Login for Panchayat Officers & Staff')
                  }
                </p>
              </div>

              {/* Toggle only for Citizen portal */}
              {activePortal === 'citizen' ? (
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMessage(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
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
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {language === 'mr' ? 'नोंदणी' : 'Register'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-bold border border-purple-300 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-purple-700" />
                    <span>{language === 'mr' ? 'पासवर्ड प्रवेश' : 'Password Access'}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Notification & Error Alerts */}
            {successBanner && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successBanner}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl text-xs font-medium flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORMS */}
            {activePortal === 'citizen' ? (
              authMode === 'login' ? (
                /* Citizen Login Form */
                <form onSubmit={handleCitizenLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
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
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold font-mono text-slate-900 bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSendCitizenLoginOtp}
                        disabled={isSendingOtp}
                        className="px-3.5 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5 text-orange-700" />
                        <span>{citLoginOtpSent ? (language === 'mr' ? 'पुन्हा पाठवा' : 'Resend') : (language === 'mr' ? 'OTP पाठवा' : 'Send OTP')}</span>
                      </button>
                    </div>
                  </div>

                  {/* OTP Input Section */}
                  {citLoginOtpSent && (
                    <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-amber-900">
                          {language === 'mr' ? 'SMS द्वारे आलेला ६-अंकी OTP टाका:' : 'Enter 6-Digit SMS OTP:'} <span className="text-red-500">*</span>
                        </label>
                      </div>

                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-amber-600 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder={language === 'mr' ? "६-अंकी OTP टाका" : "Enter 6-digit OTP"}
                          value={citLoginOtp}
                          onChange={(e) => setCitLoginOtp(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm font-mono tracking-widest text-center font-bold rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{language === 'mr' ? 'OTP प्रमाणित करा व नागरिक पोर्टल उघडा' : 'Verify OTP & Open Citizen Portal'}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-xs text-orange-700 hover:text-orange-900 font-bold underline"
                    >
                      {language === 'mr' ? 'नवीन नागरिक आहात का? येथे विनामूल्य नोंदणी करा' : 'New Citizen? Click here to register'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Citizen Register Form */
                <form onSubmit={handleCitizenRegister} className="space-y-4">
                  {/* Verification Status Banner */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-950">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="font-bold">
                        {language === 'mr' ? 'नागरिक नोंदणी (OTP पडताळणी)' : 'Citizen Self-Registration (OTP Verified)'}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                      isMobileVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-200/80 text-amber-950'
                    }`}>
                      {isMobileVerified ? '✓ मोबाईल प्रमाणित (Verified)' : '📱 पडताळणी आवश्यक'}
                    </span>
                  </div>

                  {/* 1. Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {language === 'mr' ? 'पूर्ण नाव (Full Name)' : 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'mr' ? 'उदा. ज्ञानेश्वर संभाजी मोरे' : 'e.g. Dnyaneshwar Sambhaji More'}
                      value={citRegName}
                      onChange={(e) => setCitRegName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* 2. Date of Birth & Aadhaar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-600" />
                        {language === 'mr' ? 'जन्मतारीख (Date of Birth)' : 'Date of Birth'}
                      </label>
                      <input
                        type="date"
                        value={citRegDob}
                        onChange={(e) => setCitRegDob(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                        {language === 'mr' ? 'आधार क्रमांक (१२ अंकी)' : 'Aadhaar Number'}
                      </label>
                      <input
                        type="text"
                        maxLength={14}
                        placeholder="XXXX-XXXX-XXXX"
                        value={citRegAadhaar}
                        onChange={(e) => setCitRegAadhaar(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* 3. Mobile Number with OTP Verification & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800">
                          {language === 'mr' ? '१० अंकी मोबाईल क्रमांक' : 'Mobile Number'} <span className="text-red-500">*</span>
                        </label>
                        {isMobileVerified && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {language === 'mr' ? 'प्रमाणित' : 'Verified'}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="98XXXXXXXX"
                            value={citRegPhone}
                            onChange={(e) => {
                              setCitRegPhone(e.target.value.replace(/\D/g, ''));
                              setIsMobileVerified(false);
                            }}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleSendRegOtp}
                          disabled={isSendingOtp || isMobileVerified}
                          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-all ${
                            isMobileVerified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs active:scale-95'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isMobileVerified ? (language === 'mr' ? '✓ प्रमाणित' : '✓ Verified') : (language === 'mr' ? 'OTP मिळवा' : 'Get OTP')}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-orange-600" />
                        {language === 'mr' ? 'ईमेल आयडी (पर्यायी)' : 'Email Address (Optional)'}
                      </label>
                      <input
                        type="email"
                        placeholder="citizen@example.com"
                        value={citRegEmail}
                        onChange={(e) => setCitRegEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* OTP Verification Modal / Inline Card */}
                  {showOtpInputModal && !isMobileVerified && (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">
                          {language === 'mr' ? '६-अंकी SMS OTP टाका:' : 'Enter 6-digit SMS OTP:'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={regVerifyOtpInput}
                          onChange={(e) => setRegVerifyOtpInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-center font-mono font-bold text-sm rounded-xl border border-amber-300 bg-white"
                          placeholder={language === 'mr' ? "६-अंकी SMS OTP टाका" : "Enter 6-digit OTP"}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyRegistrationOtp}
                          disabled={isVerifyingOtp}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                          {language === 'mr' ? 'सत्यापित करा' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. Location Hierarchy Selection (State -> District -> Taluka -> GP -> Ward) */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      {language === 'mr' ? 'आपले गाव व वॉर्ड निवडा (स्थान रचना):' : 'Select Location & Ward:'}
                    </span>

                    <LocationSelector
                      level="ward"
                      showWard={true}
                      selectedState={locationData.state}
                      selectedDistrict={locationData.district}
                      selectedTaluka={locationData.taluka}
                      selectedGramPanchayat={locationData.gramPanchayat}
                      selectedWard={locationData.ward}
                      onChange={(data) => {
                        setLocationData({
                          state: data.state || 'Maharashtra',
                          district: data.district,
                          taluka: data.taluka,
                          gramPanchayat: data.gramPanchayat,
                          ward: data.ward || 'Ward 1'
                        });
                      }}
                    />
                  </div>

                  {/* 5. House No & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {language === 'mr' ? 'घर / मिळकत क्रमांक (House No)' : 'House / Property No.'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={language === 'mr' ? 'उदा. घर क्र. ४५ / मिळकत क्र. १२/अ' : 'e.g. House No. 45'}
                        value={citRegHouseNo}
                        onChange={(e) => setCitRegHouseNo(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {language === 'mr' ? 'निवासी पत्ता / गल्ली' : 'Residential Address'}
                      </label>
                      <input
                        type="text"
                        placeholder={language === 'mr' ? 'उदा. गणपती मंदिर गल्ली' : 'e.g. Near Temple Street'}
                        value={citRegAddress}
                        onChange={(e) => setCitRegAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Invisible Firebase Recaptcha Container */}
                  <div id="citizen-reg-recaptcha"></div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-amber-200" />
                    <span>{language === 'mr' ? 'नागरिक नोंदणी पूर्ण करा' : 'Complete Citizen Registration'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-xs text-slate-600 hover:text-slate-900 font-bold underline"
                    >
                      {language === 'mr' ? 'आधीच नोंदणी केली आहे का? येथे लॉगिन करा' : 'Already registered? Login here'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* Staff Login Form (Strictly Password Login) */
              <form onSubmit={handleStaffLogin} className="space-y-4">
                {/* Mobile / Identifier Input */}
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
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold font-mono text-slate-900 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'mr' ? 'पासवर्ड (Password)' : 'Password'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      required
                      placeholder={language === 'mr' ? 'आपला पासवर्ड टाका' : 'Enter your password'}
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-slate-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  {isLoggingIn ? (
                    <span className="animate-pulse">{language === 'mr' ? 'प्रमाणीकरण करत आहे...' : 'Authenticating...'}</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-blue-300" />
                      <span>
                        {staffAuthMethod === 'password'
                          ? (language === 'mr' ? '🔐 पासवर्ड द्वारे ERP प्रशासन उघडा' : 'Login & Access ERP Desk')
                          : (language === 'mr' ? '📲 OTP सत्यापित करा व ERP उघडा' : 'Verify OTP & Access ERP')}
                      </span>
                    </>
                  )}
                </button>

                {/* Staff Notice */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    {language === 'mr' 
                      ? 'ग्रामपंचायत अधिकारी व पदोन्नत नागरिक रोजच्या कामासाठी मोबाईल + पासवर्डने थेट लॉगिन करू शकतात. प्रथमच लॉगिन करताना OTP वापरा किंवा प्रोफाईलमध्ये पासवर्ड सेट करा.'
                      : 'Officers & promoted citizens can log in daily using Mobile + Password. Use SMS OTP to set or reset your password anytime in Profile.'}
                  </p>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-2">
        <p>© २०२६ आपली ग्रामपंचायत • ग्रामविकास विभाग, महाराष्ट्र शासन</p>
        <p className="text-[11px] text-slate-500">
          डिजिटल इंडिया व ई-पंचायत मिशन अंतर्गत विकसित
        </p>
      </footer>

      {/* 📱 Mobile App Download & QR Scanner Modal */}
      <MobileAppDownloadModal 
        isOpen={showAppDownloadModal} 
        onClose={() => setShowAppDownloadModal(false)} 
      />
    </div>
  );
};
