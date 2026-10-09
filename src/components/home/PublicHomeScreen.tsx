import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Landmark, 
  Search, 
  FileText, 
  CreditCard, 
  AlertCircle, 
  Award, 
  Calendar, 
  PhoneCall, 
  ShieldCheck, 
  Smartphone, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  Users, 
  Layers, 
  Home as HomeIcon, 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  HeartHandshake, 
  Building2, 
  Globe, 
  Download, 
  LogIn, 
  UserCheck, 
  HelpCircle, 
  Clock, 
  Eye, 
  X,
  Volume2,
  Sliders,
  Check,
  Building,
  Activity,
  Flame,
  Droplets,
  Zap,
  Wheat,
  GraduationCap,
  Baby,
  Smile
} from 'lucide-react';
import { MobileAppDownloadModal } from '../common/MobileAppDownloadModal';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const PublicHomeScreen: React.FC = () => {
  const { 
    language, 
    toggleLanguage, 
    t, 
    setAppMode, 
    setMobileTab, 
    setDesktopTab, 
    currentUser, 
    panchayatInfo,
    certificates,
    taxRecords,
    grievances,
    schemes,
    notices,
    projects,
    officials,
    setShowAuthModal,
    setAuthType,
    setAuthMode
  } = useApp();

  // Accessibility state
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'larger'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [showAppDownloadModal, setShowAppDownloadModal] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('all');
  const [activePersona, setActivePersona] = useState<'farmers' | 'women' | 'youth' | 'seniors'>('farmers');
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);

  // Apply font size class to body / container
  useEffect(() => {
    const root = document.documentElement;
    if (fontSizeLevel === 'larger') {
      root.style.fontSize = '17px';
    } else if (fontSizeLevel === 'large') {
      root.style.fontSize = '16px';
    } else {
      root.style.fontSize = '15px';
    }
  }, [fontSizeLevel]);

  // Current GP Details
  const currentGpName = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const currentTaluka = currentUser?.taluka || panchayatInfo.talukaMr;
  const currentDistrict = currentUser?.district || panchayatInfo.districtMr;

  // Filter notices for ticker
  const latestNotices = notices.slice(0, 3);

  // Quick Action Handler
  const handleServiceClick = (targetTab: string, requiresAuth: boolean = true) => {
    if (currentUser) {
      if (currentUser.role === 'citizen') {
        setAppMode('citizen-mobile');
        setMobileTab(targetTab as any);
      } else {
        setAppMode('panchayat-desktop');
        setDesktopTab(targetTab === 'tax' ? 'tax' : targetTab === 'certificates' ? 'certificates' : 'dashboard' as any);
      }
    } else {
      // If not logged in, prompt citizen authentication
      setAuthType('citizen');
      setAuthMode('login');
      setShowAuthModal(true);
    }
  };

  // Switch directly to login gateway
  const openCitizenLogin = () => {
    setAuthType('citizen');
    setAuthMode('login');
    setAppMode('gateway');
  };

  const openStaffLogin = () => {
    setAuthType('panchayat');
    setAuthMode('login');
    setAppMode('gateway');
  };

  // Search Items List
  const searchableServices = [
    { titleMr: 'जन्म दाखला (Birth Certificate)', titleEn: 'Birth Certificate', category: 'certificates', tab: 'certificates', descMr: 'QR कोड अधिकृत डिजिटल जन्म दाखल्यासाठी अर्ज व डाउनलोड.' },
    { titleMr: 'मृत्यू दाखला (Death Certificate)', titleEn: 'Death Certificate', category: 'certificates', tab: 'certificates', descMr: 'शासकीय मृत्यू नोंदणी प्रमाणपत्र.' },
    { titleMr: 'विवाह नोंदणी दाखला (Marriage Certificate)', titleEn: 'Marriage Certificate', category: 'certificates', tab: 'certificates', descMr: 'ग्रामपंचायत विवाह नोंदणी दाखला.' },
    { titleMr: 'नमुना ८ घरपट्टी उतारा (Property Assessment Copy)', titleEn: 'Sample 8 Tax Copy', category: 'tax', tab: 'tax', descMr: 'मालमत्ता नोंदणी व अधिकृत घरपट्टी उतारा.' },
    { titleMr: 'रहिवासी दाखला (Residence Certificate)', titleEn: 'Residence Certificate', category: 'certificates', tab: 'certificates', descMr: 'स्थानिक वास्तव्याचा अधिकृत दाखला.' },
    { titleMr: 'घरपट्टी कर भरणा (Property Tax Payment)', titleEn: 'Property Tax Payment', category: 'tax', tab: 'tax', descMr: 'घरपट्टी ऑनलाइन भरा व डिजिटल पावती मिळवा.' },
    { titleMr: 'पाणीपट्टी कर भरणा (Water Tax Payment)', titleEn: 'Water Tax Payment', category: 'tax', tab: 'tax', descMr: 'वार्षिक नळ जोडणी पाणीपट्टी भरणा.' },
    { titleMr: 'लाडकी बहीण योजना (Ladki Bahin Scheme)', titleEn: 'Ladki Bahin Yojana', category: 'schemes', tab: 'schemes', descMr: 'महिलांसाठी मासिक ₹१,५०० थेट DBT बँक हस्तांतरण.' },
    { titleMr: 'शेतकरी सन्मान व कृषी योजना (Farmer Welfare)', titleEn: 'Farmer Welfare Schemes', category: 'schemes', tab: 'schemes', descMr: 'पीक विमा, ठिबक सिंचन व सौर कृषी पंप अनुदान.' },
    { titleMr: 'तक्रार नोंदणी (Lodge Grievance)', titleEn: 'Lodge Grievance', category: 'grievance', tab: 'grievances', descMr: 'पिण्याचे पाणी, रस्ते, पथदिवे तक्रार २४-४८ तासांत निवारण.' },
    { titleMr: 'ग्रामसभा व जाहीर सूचना (Gram Sabha Notices)', titleEn: 'Gram Sabha Notices', category: 'gramsabha', tab: 'notices', descMr: 'आगामी ग्रामसभा अजेंडा, ठराव व प्रसिद्धीपत्रके.' },
    { titleMr: 'गाव पदाधिकारी संपर्क (Village Directory)', titleEn: 'Village Directory', category: 'directory', tab: 'directory', descMr: 'सरपंच, उपसरपंच, ग्रामसेवक व तलाठी फोन नंबर.' },
  ];

  const filteredSearchResults = searchableServices.filter(item => {
    const matchesQuery = item.titleMr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.descMr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = searchCategory === 'all' || item.category === searchCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${highContrast ? 'bg-black text-amber-300' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 🇮🇳 1. OFFICIAL GIGW TOP BAR (India Flag Accent + Government of India / Maharashtra + Accessibility) */}
      <div className="w-full bg-[#1b1e22] text-slate-300 border-b border-slate-700/80 text-[11px] font-medium">
        {/* Subtle Tricolor Ribbon Stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Official Government of Maharashtra & India Portal Link */}
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <span className="text-amber-400">🇮🇳</span> 
              <span>{language === 'mr' ? 'महाराष्ट्र शासन • ग्रामविकास विभाग | भारत सरकार' : 'Govt of Maharashtra • Rural Development | Govt of India'}</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <a 
              href="https://www.india.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors"
              title="National Portal of India"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>{language === 'mr' ? 'राष्ट्रीय महापोर्टल (india.gov.in)' : 'National Portal of India (india.gov.in)'}</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
          </div>

          {/* Right: GIGW Accessibility Suite & Language Switcher */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* Emergency Helpline quick pill */}
            <div className="hidden sm:flex items-center gap-1.5 bg-red-950/80 text-red-200 border border-red-700/50 px-2 py-0.5 rounded text-[10px] font-bold">
              <PhoneCall className="w-2.5 h-2.5 text-red-400 animate-pulse" />
              <span>{language === 'mr' ? 'आपत्कालीन: ११२ / १०८' : 'Helpline: 112 / 108'}</span>
            </div>

            {/* Accessibility Font Size Resizer */}
            <div className="flex items-center bg-slate-800 rounded px-1 py-0.5 border border-slate-700">
              <button 
                onClick={() => setFontSizeLevel('normal')}
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${fontSizeLevel === 'normal' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:text-white'}`}
                title="Normal Font Size"
              >
                A
              </button>
              <button 
                onClick={() => setFontSizeLevel('large')}
                className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${fontSizeLevel === 'large' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:text-white'}`}
                title="Large Font Size"
              >
                A+
              </button>
              <button 
                onClick={() => setFontSizeLevel('larger')}
                className={`px-1.5 py-0.2 rounded text-[12px] font-extrabold ${fontSizeLevel === 'larger' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:text-white'}`}
                title="Extra Large Font Size"
              >
                A++
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
              title="High Contrast / Screen Reader Friendly"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">{highContrast ? 'सामान्य (Normal)' : 'कॉन्ट्रास्ट (Contrast)'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold border border-amber-500/40 transition-all text-[11px]"
              title="Change Language"
            >
              <Globe className="w-3 h-3" />
              <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🏛️ 2. MAIN HEADER & BRAND NAVIGATION */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-md transition-colors ${highContrast ? 'bg-black/95 border-amber-500' : 'bg-white/95 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setAppMode('home')}>
            <div className="relative">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-700 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Landmark className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[8px] font-black px-1 py-0.2 rounded-full border border-white">
                महा-ई
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-full border border-orange-200/60">
                  {language === 'mr' ? 'आपली ग्रामपंचायत' : 'Aapli Gram Panchayat'}
                </span>
                <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">
                  • {currentGpName} ({currentTaluka}, {currentDistrict})
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
                {language === 'mr' ? 'डिजिटल नागरिक सेवा व ई-प्रशासन महापोर्टल' : 'Digital Citizen Services & E-Governance Gateway'}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {language === 'mr' ? 'ग्रामीण महाराष्ट्र डिजिटल परिवर्तन उपक्रम • ई-पंचायत मिशन' : 'Rural Maharashtra Digital Transformation • e-Panchayat Mission'}
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Login Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 📱 Mobile App Download Button */}
            <button
              onClick={() => setShowAppDownloadModal(true)}
              className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              title="Download Android APK"
            >
              <Smartphone className="w-4 h-4 text-emerald-200" />
              <span>{language === 'mr' ? 'मोबाईल ॲप' : 'Mobile App'}</span>
              <span className="text-[9px] bg-black/20 px-1 py-0.2 rounded font-extrabold">APK</span>
            </button>

            {/* Authentication Buttons / Profile Chip */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => {
                    if (currentUser.role === 'citizen') {
                      setAppMode('citizen-mobile');
                    } else {
                      setAppMode('panchayat-desktop');
                    }
                  }}
                  className="flex items-center gap-2 bg-amber-50 border border-amber-300/80 hover:bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm group"
                  title="Open Dashboard"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-amber-800">{currentUser.name}</p>
                    <p className="text-[10px] text-amber-700 font-semibold uppercase">
                      {currentUser.role === 'citizen' ? 'नागरिक कक्ष (Citizen)' : 'प्रशासकीय कक्ष (ERP)'}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* 1. Citizen Login */}
                <button
                  onClick={openCitizenLogin}
                  className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-extrabold shadow-md shadow-orange-600/25 active:scale-95 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'नागरिक लॉगिन / OTP' : 'Citizen Login'}</span>
                </button>

                {/* 2. Staff/Panchayat Login */}
                <button
                  onClick={openStaffLogin}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 hover:text-white text-xs font-bold border border-slate-700 active:scale-95 transition-all"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === 'mr' ? 'प्रशासन (Staff)' : 'Staff Login'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Notices Ticker Strip (India.gov.in News Ticker style) */}
        {latestNotices.length > 0 && (
          <div className="bg-amber-500/10 border-t border-amber-500/20 py-1.5 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                <Flame className="w-3 h-3 text-yellow-200" />
                {language === 'mr' ? 'महत्त्वाची सूचना' : 'Announcement'}
              </span>
              <div className="truncate text-slate-800 font-medium flex items-center gap-4">
                {latestNotices.map((n, idx) => (
                  <span key={n.id || idx} className="truncate cursor-pointer hover:text-orange-700" onClick={() => handleServiceClick('notices')}>
                    📢 {language === 'mr' ? n.titleMr : (n.titleEn || n.titleMr)} ({n.date})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 🚀 3. HERO SECTION (India.gov.in Inspired Single-Window Search & Portal Gateway) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 text-white py-12 sm:py-16 px-4 sm:px-6">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 mb-6 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'mr' ? 'स्थानिक स्वराज्य संस्था • ई-पंचायत डिजिटल अभियान' : 'Local Governance • e-Panchayat Digital Mission'}</span>
            <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
              LIVE
            </span>
          </div>

          {/* Main Hero Headline */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            {language === 'mr' ? (
              <>
                डिजिटल ग्रामपंचायत, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">सशक्त नागरिक,</span> समृद्ध गाव
              </>
            ) : (
              <>
                Digital Gram Panchayat, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">Empowered Citizens,</span> Prosperous Village
              </>
            )}
          </h2>

          <p className="mt-4 text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {language === 'mr' 
              ? 'जन्म-मृत्यू दाखले, घरपट्टी-पाणीपट्टी कर भरणा, शासकीय योजना व २४ ते ४८ तासांत तक्रार निवारण – आता ग्रामपंचायतीच्या सर्व सेवा एकाच महापोर्टलवर!'
              : 'Birth/Death certificates, property tax payments, welfare schemes, and grievance redressal in 24-48 hours – all village services at one single window!'}
          </p>

          {/* 🔍 Categorized Smart Search Bar (India.gov.in Style) */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="bg-white p-2 rounded-2xl shadow-2xl shadow-black/40 border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
              
              {/* Category Selector */}
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border-none outline-none cursor-pointer"
              >
                <option value="all">{language === 'mr' ? 'सर्व वर्गवारी (All Categories)' : 'All Categories'}</option>
                <option value="certificates">{language === 'mr' ? '📜 दाखले (Certificates)' : 'Certificates'}</option>
                <option value="tax">{language === 'mr' ? '💳 कर भरणा (Tax)' : 'Tax'}</option>
                <option value="schemes">{language === 'mr' ? '🌾 योजना (Schemes)' : 'Schemes'}</option>
                <option value="grievance">{language === 'mr' ? '🛠️ तक्रारी (Grievances)' : 'Grievances'}</option>
                <option value="gramsabha">{language === 'mr' ? '🗳️ ग्रामसभा (Gram Sabha)' : 'Gram Sabha'}</option>
                <option value="directory">{language === 'mr' ? '📞 संपर्क (Directory)' : 'Directory'}</option>
              </select>

              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchModalOpen(true)}
                  placeholder={language === 'mr' ? 'दाखला, घरपट्टी कर, लाडकी बहीण, ग्रामसभा किंवा सेवा शोधा...' : 'Search certificates, taxes, schemes, notices...'}
                  className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl outline-none"
                />
              </div>

              {/* Search Action Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'शोधा' : 'Search'}</span>
              </button>
            </div>

            {/* Popular Search Tags */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">{language === 'mr' ? 'लोकप्रिय:' : 'Trending:'}</span>
              {['जन्म दाखला', 'घरपट्टी पावती', 'लाडकी बहीण योजना', 'ग्रामसभा नोटीस', 'नमुना ८ उतारा', 'पाणीपट्टी'].map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(tag);
                    setSearchModalOpen(true);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Highlights */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-left">
              <div className="flex items-center justify-between">
                <Building className="w-5 h-5 text-amber-400" />
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">LGD MH</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">२८,०००+</p>
              <p className="text-[11px] text-slate-400">{language === 'mr' ? 'महाराष्ट्रातील ग्रामपंचायती' : 'Gram Panchayats'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-left">
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">VERIFIED</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">१५,४००+</p>
              <p className="text-[11px] text-slate-400">{language === 'mr' ? 'वितरित डिजिटल दाखले' : 'Issued Certificates'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-left">
              <div className="flex items-center justify-between">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">UPI / RTGS</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">₹१.२+ कोटी</p>
              <p className="text-[11px] text-slate-400">{language === 'mr' ? 'ऑनलाइन कर संकलन' : 'Tax Collected'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-left">
              <div className="flex items-center justify-between">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded">24-48 HRS</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">९८.४%</p>
              <p className="text-[11px] text-slate-400">{language === 'mr' ? 'तक्रार निवारण समाधान' : 'Grievance Resolution'}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 📜 4. CORE 6 CITIZEN SERVICES (६ प्रमुख ई-सेवा दालन) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
            {language === 'mr' ? 'नागरिक सेवा केंद्र' : 'Citizen Service Desk'}
          </span>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
            {language === 'mr' ? 'ग्रामपंचायतीच्या प्रमुख डिजिटल ई-सेवा' : 'Key Digital E-Services of Gram Panchayat'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {language === 'mr' 
              ? 'ग्रामस्थांना घरबसल्या शासकीय सेवांचा लाभ मिळावा यासाठी एका क्लिकवर अर्ज व डाउनलोड सुविधा उपलब्ध आहे.' 
              : 'Apply online and download official verified documents with ease.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: डिजिटल दाखले */}
          <div 
            onClick={() => handleServiceClick('certificates')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <FileText className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                  {language === 'mr' ? '📜 डिजिटल दाखले' : 'Digital Certificates'}
                </h4>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  QR कोड अधिकृत
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'mr' 
                  ? 'जन्म दाखला, मृत्यू दाखला, विवाह नोंदणी, नमुना ८ उतारा, व रहिवासी दाखला त्वरित अर्ज व डाउनलोड.' 
                  : 'Apply for Birth, Death, Marriage, Sample 8 and Residence certificates with digital signature.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700">
              <span>{language === 'mr' ? 'दाखल्यासाठी अर्ज करा' : 'Apply for Certificate'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: ऑनलाइन कर भरणा */}
          <div 
            onClick={() => handleServiceClick('tax')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {language === 'mr' ? '💳 ऑनलाइन कर भरणा' : 'Online Tax Payment'}
                </h4>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  UPI / पावती
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'mr' 
                  ? 'घरपट्टी (मालमत्ता कर), पाणीपट्टी व दिवाबत्ती कर ऑनलाइन भरा आणि तात्काळ अधिकृत संगणकीय पावती मिळवा.' 
                  : 'Pay Property Tax and Water Charges securely via UPI or Card and download instant receipt.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
              <span>{language === 'mr' ? 'कर भरा व पावती पहा' : 'Pay Tax & View Receipt'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: २४-४८ तास तक्रार निवारण */}
          <div 
            onClick={() => handleServiceClick('grievances')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-red-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-red-700 transition-colors">
                  {language === 'mr' ? '📢 ई-तक्रार निवारण कक्ष' : 'Grievance Redressal'}
                </h4>
                <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                  २४-४८ तास
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'mr' 
                  ? 'पिण्याचे पाणी, गटारे, रस्ते, पथदिवे यांसंबंधी तक्रार नोंदवा. एसएमएस ट्रॅकिंग व २४ ते ४८ तासांत निवारण.' 
                  : 'Report village issues regarding water, streetlights, or sanitation and track progress live.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-600 group-hover:text-red-700">
              <span>{language === 'mr' ? 'तक्रार नोंदवा / स्थिती तपासा' : 'Lodge Grievance'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: शासकीय योजना व अनुदान */}
          <div 
            onClick={() => handleServiceClick('schemes')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Award className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {language === 'mr' ? '🌾 शासकीय योजना व DBT' : 'Govt Schemes & Subsidies'}
                </h4>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  थेट बँक लाभ
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'mr' 
                  ? 'लाडकी बहीण, शेतकरी सन्मान, PMAY-G घरकुल, जल जीवन मिशन व ठिबक सिंचन योजनांची माहिती व थेट अर्ज.' 
                  : 'Check eligibility and apply for state and central government welfare schemes directly.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
              <span>{language === 'mr' ? 'योजना पहा व अर्ज करा' : 'Explore Schemes'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: ग्रामसभा व जाहीर सूचना */}
          <div 
            onClick={() => handleServiceClick('notices')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                  {language === 'mr' ? '🗳️ ग्रामसभा व ई-सूचना' : 'Gram Sabha & Notices'}
                </h4>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  पारदर्शक निर्णय
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'mr' 
                  ? 'आगामी ग्रामसभेची तारीख, विषयपत्रिका (अजेंडा), मागील सभेचे ठराव आणि ग्रामपंचायतीचे जाहीर प्रकटन.' 
                  : 'Stay informed about Gram Sabha meetings, public notices, decisions, and village resolutions.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600 group-hover:text-purple-700">
              <span>{language === 'mr' ? 'ग्रामसभा सूचना पहा' : 'View Notices'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: गाव पदाधिकारी निर्देशिका */}
          <div 
            onClick={() => handleServiceClick('directory')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {language === 'mr' ? '👥 गाव पदाधिकारी निर्देशिका' : 'Village Officials Directory'}
                </h4>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  थेट संपर्क
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'mr' 
                  ? 'सरपंच, उपसरपंच, ग्रामसेवक, तलाठी, वॉर्ड सदस्य, आशा सेविका, व प्राथमिक आरोग्य केंद्र संपर्क क्रमांक.' 
                  : 'Contact details of Sarpanch, Gram Sevak, Talathi, Ward Members, and Health workers.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600 group-hover:text-teal-700">
              <span>{language === 'mr' ? 'संपर्क सूची उघडा' : 'View Directory'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* 🌾 5. CITIZEN PERSONA SEGMENTS (नागरिक गटानिहाय योजना - Inspired by India.gov.in) */}
      <section className="py-12 bg-slate-100 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              {language === 'mr' ? 'कल्याणकारी योजना कक्ष' : 'Welfare Schemes by Category'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {language === 'mr' ? 'नागरिक गटानिहाय शासकीय योजना व लाभ' : 'Citizen Welfare Schemes & Subsidies'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {language === 'mr' ? 'आपल्या संवर्गानुसार योग्य योजना निवडा व त्वरित लाभ मिळवा' : 'Select your beneficiary category to view tailored schemes'}
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-8">
            {[
              { id: 'farmers', labelMr: '🌾 शेतकरी बांधव', labelEn: 'Farmers', icon: Wheat },
              { id: 'women', labelMr: '👩 महिला व बालविकास', labelEn: 'Women & Child', icon: Baby },
              { id: 'youth', labelMr: '🎓 युवा व विद्यार्थी', labelEn: 'Youth & Education', icon: GraduationCap },
              { id: 'seniors', labelMr: '🧓 ज्येष्ठ नागरिक व निराधार', labelEn: 'Seniors & Pension', icon: Smile },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePersona(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-sm ${
                  activePersona === tab.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                <span>{language === 'mr' ? tab.labelMr : tab.labelEn}</span>
              </button>
            ))}
          </div>

          {/* Persona Content Display */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
            {activePersona === 'farmers' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-amber-700" />
                    {language === 'mr' ? 'पीएम किसान व नमो शेतकरी महासन्मान' : 'PM Kisan & Namo Shetkari'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">वार्षिक ₹१२,००० थेट बँक खात्यात सन्मान निधी वितरण. ई-केवायसी व आधार लिंक पडताळणी.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-emerald-700" />
                    {language === 'mr' ? 'ठिबक सिंचन व तुषार अनुदान' : 'Micro Irrigation Subsidy'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">अल्प व अत्यल्प भूधारक शेतकऱ्यांना सूक्ष्म सिंचनासाठी ८०% पर्यंत थेट शासकीय अनुदान.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <h4 className="font-extrabold text-sm text-blue-950 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-700" />
                    {language === 'mr' ? 'कुसुम सौर कृषी पंप योजना' : 'KUSUM Solar Agri Pump'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">शेतात सिंचनासाठी ९०% ते ९५% अनुदानावर ३ ते ७.५ एच.पी. सौर कृषी पंप जोडणी.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activePersona === 'women' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-pink-50/70 border border-pink-200">
                  <h4 className="font-extrabold text-sm text-pink-950 flex items-center gap-2">
                    <Baby className="w-4 h-4 text-pink-700" />
                    {language === 'mr' ? 'मुख्यमंत्री माझी लाडकी बहीण योजना' : 'Mukhyamantri Ladki Bahin'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">पात्र महिलांच्या बँक खात्यात दरमहा ₹१,५०० थेट DBT वितरण व सन्मान निधी.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-pink-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200">
                  <h4 className="font-extrabold text-sm text-purple-950 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-700" />
                    {language === 'mr' ? 'महिला आर्थिक विकास महामंडळ बचत गट' : 'MAVIM Self Help Groups'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">गावपातळीवर महिला बचत गटांना बिनव्याजी फिरता निधी व उद्योग कर्ज सहाय्य.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-purple-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-700" />
                    {language === 'mr' ? 'सुकन्या समृद्धी व पोषण अभियान' : 'Sukanya Samriddhi & Poshan'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">मुलींच्या शिक्षणासाठी उच्च व्याजदराची बचत योजना व बालपोषण आहार सहाय्य.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activePersona === 'youth' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                  <h4 className="font-extrabold text-sm text-indigo-950 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-700" />
                    {language === 'mr' ? 'स्वाधार शिष्यवृत्ती व उच्च शिक्षण' : 'Swadhar Scholarship'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">महाविद्यालयात शिक्षण घेणाऱ्या ग्रामीण विद्यार्थ्यांना वसतिगृह व भोजन भत्ता सहाय्य.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200">
                  <h4 className="font-extrabold text-sm text-teal-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    {language === 'mr' ? 'मुख्यमंत्री रोजगार निर्मिती (CMEGP)' : 'CMEGP Self Employment'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">ग्रामीण भागात नवीन उद्योग सुरू करणाऱ्या तरुणांना ₹५० लाखांपर्यंत अनुदानित कर्ज.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-teal-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <h4 className="font-extrabold text-sm text-blue-950 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-700" />
                    {language === 'mr' ? 'डिजिटल साक्षरता व कौशल्य विकास' : 'Digital Literacy & Skill Center'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">ग्रामपंचायत ई-सेवा केंद्र व स्पर्धा परीक्षा मार्गदर्शन कक्षाची मोफत सोय.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activePersona === 'seniors' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-200">
                  <h4 className="font-extrabold text-sm text-orange-950 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-orange-700" />
                    {language === 'mr' ? 'संजय गांधी निराधार पेन्शन योजना' : 'Sanjay Gandhi Niradhar'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">निराधार वृद्ध, दिव्यांग व विधवा नागरिकांना दरमहा नियमित शासकीय आर्थिक साहाय्य.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-orange-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-amber-700" />
                    {language === 'mr' ? 'श्रावण बाळ सेवा राज्य निवृत्तीवेतन' : 'Shravan Bal State Pension'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">६५ वर्षे व त्यावरील दारिद्र्य रेषेखालील ज्येष्ठ नागरिकांना दरमहा थेट पेन्शन वितरण.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200">
                  <h4 className="font-extrabold text-sm text-purple-950 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-700" />
                    {language === 'mr' ? 'दिव्यांग कल्याण व कृत्रिम अवयव सहाय्य' : 'Divyang Welfare & Aids'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2">दिव्यांग बांधवांना व्हीलचेअर, ट्रायसिकल, श्रवणयंत्र आणि ५% ग्रामपंचायत निधी लाभ.</p>
                  <button onClick={() => handleServiceClick('schemes')} className="mt-4 text-xs font-bold text-purple-700 hover:underline flex items-center gap-1">
                    {language === 'mr' ? 'तपशील व अर्ज' : 'View Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🏛️ 6. NATIONAL & STATE DIGITAL GOVERNANCE ECOSYSTEM (India.gov.in & Maharashtra Govt Network) */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
            {language === 'mr' ? 'शासकीय डिजिटल महानेटवर्क' : 'National Digital Ecosystem'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {language === 'mr' ? 'अधिकृत केंद्र व राज्य शासन डिजिटल व्यासपीठे' : 'Official Central & State Portals Network'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {language === 'mr' 
              ? 'आपली ग्रामपंचायत महापोर्टल भारत सरकार आणि महाराष्ट्र शासनाच्या ई-प्रशासन मानकांशी जोडलेले आहे.' 
              : 'Direct integration with national and state government e-governance systems.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <a
            href="https://www.india.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
              🇮🇳
            </div>
            <h5 className="font-extrabold text-xs text-slate-900 mt-2">National Portal</h5>
            <p className="text-[10px] text-slate-500">india.gov.in</p>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-600 mt-2" />
          </a>

          <a
            href="https://aaplesarkar.mahaonline.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
              🚩
            </div>
            <h5 className="font-extrabold text-xs text-slate-900 mt-2">आपले सरकार</h5>
            <p className="text-[10px] text-slate-500">mahaonline.gov.in</p>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-orange-600 mt-2" />
          </a>

          <a
            href="https://egramswaraj.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
              🏛️
            </div>
            <h5 className="font-extrabold text-xs text-slate-900 mt-2">eGramSwaraj</h5>
            <p className="text-[10px] text-slate-500">पंचायती राज मंत्रालय</p>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 mt-2" />
          </a>

          <a
            href="https://www.digilocker.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
              📂
            </div>
            <h5 className="font-extrabold text-xs text-slate-900 mt-2">DigiLocker</h5>
            <p className="text-[10px] text-slate-500">कागदपत्रे साठवणूक</p>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 mt-2" />
          </a>

          <a
            href="https://www.digitalindia.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
              🌐
            </div>
            <h5 className="font-extrabold text-xs text-slate-900 mt-2">Digital India</h5>
            <p className="text-[10px] text-slate-500">डिजिटल भारत</p>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 mt-2" />
          </a>

          <a
            href="https://www.mygov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-500 hover:shadow-lg transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
              🤝
            </div>
            <h5 className="font-extrabold text-xs text-slate-900 mt-2">MyGov India</h5>
            <p className="text-[10px] text-slate-500">जनसहभाग व्यासपीठ</p>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-red-600 mt-2" />
          </a>

        </div>
      </section>

      {/* 📱 7. DOWNLOAD MOBILE APP BANNER */}
      <section className="py-10 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full border border-white/20">
              {language === 'mr' ? 'अधिकृत अँड्रॉइड ॲप्लिकेशन' : 'Official Android APK'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-2">
              {language === 'mr' ? 'आपली ग्रामपंचायत मोबाईल ॲप आजच डाऊनलोड करा!' : 'Download Aapli Gram Panchayat Mobile App!'}
            </h3>
            <p className="text-xs text-orange-100 mt-1 max-w-xl">
              {language === 'mr' 
                ? 'दाखले डाउनलोड, कर भरणा, तक्रार नोंदणी व थेट नोटीस अलर्ट्स – सर्व सुविधा आता आपल्या स्मार्टफोनमध्ये.' 
                : 'Get instant certificates, pay taxes, lodge grievances, and receive village alerts directly on your phone.'}
            </p>
          </div>

          <button
            onClick={() => setShowAppDownloadModal(true)}
            className="px-6 py-3 bg-slate-950 hover:bg-black text-amber-300 font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl flex items-center gap-2 border border-amber-400/40 active:scale-95 transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{language === 'mr' ? '📱 मोफत APK डाऊनलोड करा' : 'Download Free APK'}</span>
          </button>
        </div>
      </section>

      {/* 🏛️ 8. OFFICIAL GIGW & NIC COMPLIANT GOVERNMENT FOOTER */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 pt-12 pb-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
            {/* Col 1: Identity */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-black text-white">आपली ग्रामपंचायत</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                ग्रामविकास व पंचायत राज विभाग, महाराष्ट्र शासन यांच्या मार्गदर्शनाखाली विकसित ई-प्रशासन महापोर्टल.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SSL सुरक्षित व STQC मानकानुसार</span>
              </div>
            </div>

            {/* Col 2: Citizen Services */}
            <div>
              <h5 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3">नागरिक ई-सेवा</h5>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => handleServiceClick('certificates')} className="hover:text-amber-400 transition-colors">📜 जन्म, मृत्यू व विवाह दाखले</button></li>
                <li><button onClick={() => handleServiceClick('tax')} className="hover:text-amber-400 transition-colors">💳 घरपट्टी व पाणीपट्टी कर भरणा</button></li>
                <li><button onClick={() => handleServiceClick('schemes')} className="hover:text-amber-400 transition-colors">🌾 लाडकी बहीण व शासकीय योजना</button></li>
                <li><button onClick={() => handleServiceClick('grievances')} className="hover:text-amber-400 transition-colors">📢 २४-४८ तास तक्रार निवारण</button></li>
                <li><button onClick={() => handleServiceClick('notices')} className="hover:text-amber-400 transition-colors">🗳️ ई-ग्रामसभा व जाहीर सूचना</button></li>
              </ul>
            </div>

            {/* Col 3: Government Links */}
            <div>
              <h5 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3">महत्त्वाचे शासकीय दुवे</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center gap-1">National Portal (india.gov.in) <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li><a href="https://aaplesarkar.mahaonline.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center gap-1">आपले सरकार महापोर्टल <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li><a href="https://egramswaraj.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center gap-1">eGramSwaraj पोर्टल <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li><a href="https://www.digilocker.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center gap-1">DigiLocker प्रणाली <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li><a href="https://rdd.maharashtra.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center gap-1">ग्रामविकास विभाग, महाराष्ट्र <ExternalLink className="w-2.5 h-2.5" /></a></li>
              </ul>
            </div>

            {/* Col 4: Helplines & Support */}
            <div>
              <h5 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3">आपत्कालीन व मदत कक्ष</h5>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">📞 <span className="text-slate-300 font-bold">११२</span> - राष्ट्रीय आपत्कालीन सेवा</li>
                <li className="flex items-center gap-2">🚑 <span className="text-slate-300 font-bold">१०८</span> - मोफत रुग्णवाहिका</li>
                <li className="flex items-center gap-2">👩 <span className="text-slate-300 font-bold">१०९१</span> - महिला सुरक्षा हेल्पलाईन</li>
                <li className="flex items-center gap-2">🧒 <span className="text-slate-300 font-bold">१०९८</span> - बाल हेल्पलाईन (Childline)</li>
                <li className="flex items-center gap-2">🐍 <span className="text-slate-300 font-bold">१९२६</span> - वनविभाग व सर्पमित्र मदत</li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & GIGW Compliance Bar */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
            <p>© २०२६ आपली ग्रामपंचायत (Aapli Gram Panchayat) • सर्व हक्क राखीव. भारत सरकार व महाराष्ट्र शासन मार्गदर्शक तत्त्वांचे पालन.</p>
            <div className="flex items-center space-x-4">
              <span className="hover:text-slate-300 cursor-pointer">गोपनीयता धोरण (Privacy)</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">वापर अटी (Terms)</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">सुलभता धोरण (Accessibility)</span>
            </div>
          </div>

        </div>
      </footer>

      {/* 🔍 LIVE SEARCH MODAL */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-20 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[80vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-600" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  {language === 'mr' ? 'ग्रामपंचायत ई-सेवा शोध' : 'Search Gram Panchayat Services'}
                </h4>
              </div>
              <button 
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input inside modal */}
            <div className="py-4">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="उदा. जन्म दाखला, घरपट्टी कर, लाडकी बहीण, तक्रार..."
                className="w-full px-4 py-3 bg-slate-100 rounded-2xl text-xs text-slate-900 outline-none border border-slate-200 focus:border-amber-500"
              />
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredSearchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  कोणतीही सेवा आढळली नाही. कृपया दुसरा शब्द शोधा.
                </div>
              ) : (
                filteredSearchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchModalOpen(false);
                      handleServiceClick(item.tab);
                    }}
                    className="p-3 rounded-2xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900 group-hover:text-amber-800">{item.titleMr}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.descMr}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* 📱 Mobile App Download Modal */}
      <MobileAppDownloadModal
        isOpen={showAppDownloadModal}
        onClose={() => setShowAppDownloadModal(false)}
      />

    </div>
  );
};
