import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  FileText, 
  AlertCircle, 
  CreditCard, 
  Languages, 
  Landmark,
  User as UserIcon,
  PhoneCall,
  LogOut,
  Layers,
  Bell,
  Phone,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';
import { MobileTab } from '../../types';

interface CitizenLayoutProps {
  children: React.ReactNode;
}

export const CitizenLayout: React.FC<CitizenLayoutProps> = ({ children }) => {
  const { 
    language, 
    toggleLanguage, 
    t, 
    mobileTab, 
    setMobileTab, 
    panchayatInfo,
    currentUser,
    notices,
    schemes,
    taxRecords,
    logout,
    setShowAuthModal,
    setAuthType,
    setAppMode,
    refreshData,
    showToast
  } = useApp();

  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refreshData();
    setTimeout(() => {
      setIsSyncing(false);
      showToast(language === 'mr' ? 'ग्रामपंचायतीचा ताजा डेटा लोड झाला!' : 'Live data synced from Gram Panchayat!');
    }, 600);
  };

  const navItems: { id: MobileTab; labelMr: string; labelEn: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', labelMr: 'मुख्यपृष्ठ', labelEn: 'Home', icon: Home },
    { id: 'certificates', labelMr: 'दाखले व नाहरकत', labelEn: 'Certificates', icon: FileText },
    { id: 'grievances', labelMr: 'तक्रार निवारण', labelEn: 'Grievance', icon: AlertCircle },
    { id: 'tax', labelMr: 'कर भरणा', labelEn: 'Tax Pay', icon: CreditCard },
    { id: 'schemes', labelMr: 'शासकीय योजना', labelEn: 'Schemes', icon: Layers },
    { id: 'notices', labelMr: 'सूचना फलक', labelEn: 'Notices', icon: Bell },
    { id: 'directory', labelMr: 'ग्राम डिरेक्टरी', labelEn: 'Directory', icon: Phone },
    { id: 'profile', labelMr: 'माझे खाते', labelEn: 'Profile', icon: UserIcon },
  ];

  // 5 main tabs for mobile bottom bar
  const mobileNavItems = [
    { id: 'home' as MobileTab, labelMr: 'मुख्य', labelEn: 'Home', icon: Home },
    { id: 'certificates' as MobileTab, labelMr: 'दाखले', labelEn: 'Certificates', icon: FileText },
    { id: 'grievances' as MobileTab, labelMr: 'तक्रारी', labelEn: 'Grievance', icon: AlertCircle },
    { id: 'tax' as MobileTab, labelMr: 'कर भरणा', labelEn: 'Tax Pay', icon: CreditCard },
    { id: 'profile' as MobileTab, labelMr: 'खाते', labelEn: 'Profile', icon: UserIcon },
  ];

  const currentGpName = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const currentTaluka = currentUser?.taluka || panchayatInfo.talukaMr;
  const currentDistrict = currentUser?.district || panchayatInfo.districtMr;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* 🌟 1. Top Government Header Strip (Responsive for Desktop & Mobile) */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-gov-navy via-slate-900 to-gov-navy text-white shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          {/* Left: Branding & Village Name */}
          <div 
            onClick={() => setAppMode('home')}
            className="flex items-center space-x-3.5 min-w-0 cursor-pointer group"
            title="Go to Public Portal"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border border-white/30 shrink-0 overflow-hidden ring-2 ring-emerald-500/30 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="आपली ग्रामपंचायत" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <span className="hidden md:block text-[10px] uppercase font-bold tracking-widest text-amber-400 font-serif">
                {language === 'mr' ? 'महाराष्ट्र शासन • ग्रामीण नागरिक ई-सेवा' : 'Government of Maharashtra • Citizen Portal'}
              </span>
              <h1 className="font-black text-sm md:text-xl leading-tight text-white truncate">
                {currentGpName}
              </h1>
              <p className="text-[11px] text-slate-300 truncate">
                {language === 'mr' 
                  ? `तालुका: ${currentTaluka}, जिल्हा: ${currentDistrict}` 
                  : `Taluka: ${currentTaluka}, Dist: ${currentDistrict}`}
              </p>
            </div>
          </div>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = mobileTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setMobileTab(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? item.labelMr : item.labelEn}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Back to Public Portal Button */}
            <button
              onClick={() => setAppMode('home')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-100 font-bold rounded-xl text-xs border border-white/20 transition-all active:scale-95 shadow-xs"
              title={language === 'mr' ? 'शासकीय मुख्य पोर्टलवर परत जा' : 'Return to Public Portal'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold">
                {language === 'mr' ? 'मागे / मुख्य' : 'Back'}
              </span>
            </button>

            {/* Official ERP Desk Switcher for Promoted / Staff Users */}
            {currentUser && currentUser.role !== 'citizen' && (
              <button
                onClick={() => setAppMode('panchayat-desktop')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md border border-amber-300/60 transition-all active:scale-95"
                title={language === 'mr' ? 'प्रशासकीय ERP कक्षात जा' : 'Go to Official Administrative ERP'}
              >
                <Landmark className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline font-black">
                  {language === 'mr' ? '🏛️ प्रशासकीय कक्ष' : '🏛️ Official ERP'}
                </span>
              </button>
            )}

            {/* User Profile Badge */}
            <button
              onClick={() => {
                if (currentUser) {
                  setMobileTab('profile');
                } else {
                  setAuthType('citizen');
                  setShowAuthModal(true);
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 rounded-xl text-xs font-bold text-amber-300 border border-amber-500/40 transition-all"
              title="Citizen Profile"
            >
              <UserIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[120px]">
                {currentUser ? currentUser.name.split(' ')[0] : (language === 'mr' ? 'लॉगिन' : 'Login')}
              </span>
            </button>

            {/* Live Data Sync Button */}
            <button
              onClick={handleManualSync}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                isSyncing
                  ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
                  : 'bg-white/10 hover:bg-white/20 text-emerald-400 border-emerald-500/30'
              }`}
              title={language === 'mr' ? 'ग्रामपंचायतीकडील ताजा डेटा रीफ्रेश करा' : 'Sync live data from Gram Panchayat'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-300' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline">
                {language === 'mr' ? (isSyncing ? 'सिंक होत आहे...' : 'लाईव्ह सिंक') : (isSyncing ? 'Syncing...' : 'Live Sync')}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl text-xs font-bold text-white border border-white/20 transition-all flex items-center gap-1"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
            </button>

            {/* Desktop Emergency Helpline Button */}
            <a
              href={`tel:${panchayatInfo.helplineNumber}`}
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl text-xs font-bold text-white shadow transition-all"
              title="Emergency Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'हेल्पलाईन' : 'Help'}</span>
            </a>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white rounded-xl border border-red-500/30 text-xs flex items-center transition-all"
              title={language === 'mr' ? 'लॉगआउट करा' : 'Log Out'}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Secondary Navigation Bar (For tablet / small desktop) */}
        <div className="hidden md:flex lg:hidden bg-slate-950/80 px-4 py-2 border-t border-white/10 overflow-x-auto space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = mobileTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMobileTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? item.labelMr : item.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Live Notification Dynamic Marquee Ticker */}
        {(() => {
          const gpNotices = notices.filter(n => matchGramPanchayat(n.gramPanchayat, currentGpName));
          const gpSchemes = schemes.filter(s => matchGramPanchayat(s.gramPanchayat, currentGpName));
          const gpTaxes = taxRecords.filter(t => matchGramPanchayat(t.gramPanchayat, currentGpName));

          const announcementItems: string[] = [];

          // 1. Important / High-Priority notices from Gram Panchayat
          if (gpNotices.length > 0) {
            gpNotices.forEach(n => {
              const title = language === 'mr' ? n.titleMr : (n.titleEn || n.titleMr);
              const venueStr = n.venue ? ` (${n.venue}${n.time ? ` • ${n.time}` : ''})` : '';
              announcementItems.push(`${n.type === 'GramSabha' ? '🏛️ ' : '📌 '}${title}${venueStr}`);
            });
          }

          // 2. Schemes expiring soon or with deadlines
          if (gpSchemes.length > 0) {
            gpSchemes.forEach(s => {
              if (s.deadline) {
                announcementItems.push(
                  language === 'mr'
                    ? `⚠️ ${s.nameMr} - अर्ज करण्याची अंतिम मुदत: ${s.deadline}!`
                    : `⚠️ ${s.nameEn || s.nameMr} - Application Deadline: ${s.deadline}!`
                );
              } else {
                announcementItems.push(
                  language === 'mr'
                    ? `📢 ${s.nameMr}: ${s.benefitMr}`
                    : `📢 ${s.nameEn || s.nameMr}: ${s.benefitEn || s.benefitMr}`
                );
              }
            });
          }

          // 3. Tax Rebate Announcement if active tax demands exist for this GP
          if (gpTaxes.length > 0) {
            const hasUnpaid = gpTaxes.some(t => !t.isPaid);
            if (hasUnpaid) {
              announcementItems.push(
                language === 'mr'
                  ? '💰 घरपट्टी व पाणीपट्टी ऑनलाइन भरा आणि मिळवा १०% त्वरित सवलत!'
                  : '💰 Pay Property & Water Tax online to get instant 10% rebate!'
              );
            }
          }

          // 4. Default clean fallback when GP has not published notices or schemes
          if (announcementItems.length === 0) {
            announcementItems.push(
              language === 'mr'
                ? `डिजिटल ${currentGpName} ई-सेवा पोर्टल • २५+ ऑनलाइन नागरिक दाखले, तक्रार निवारण व कर भरणा सेवा उपलब्ध.`
                : `Digital ${currentGpName} E-Services Portal • 25+ online citizen certificates and grievance redressal services.`
            );
          }

          const hasUrgent = gpNotices.some(n => n.isHighPriority || n.type === 'GramSabha') || gpSchemes.some(s => Boolean(s.deadline));

          return (
            <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between overflow-hidden shadow-inner">
              <div className="max-w-7xl mx-auto w-full flex items-center space-x-2 truncate">
                <span className={`${hasUrgent ? 'bg-red-600 animate-pulse' : 'bg-slate-900'} text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase shrink-0`}>
                  {hasUrgent 
                    ? (language === 'mr' ? 'महत्त्वाची सूचना' : 'ANNOUNCEMENT')
                    : (language === 'mr' ? 'डिजिटल सेवा' : 'DIGITAL GP')}
                </span>
                <span className="truncate">
                  {announcementItems.join('  •  ')}
                </span>
              </div>
            </div>
          );
        })()}
      </header>

      {/* 🌟 2. Main Content Container (Widescreen Max-W-7XL on Desktop) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 pb-24 md:pb-12 animate-fade-in">
        {children}
      </main>

      {/* 🌟 3. Mobile Sticky Bottom Navigation (Visible ONLY on Mobile < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-2xl px-2 py-1 flex justify-around items-center">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = mobileTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMobileTab(item.id)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-orange-600 font-extrabold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 font-bold">
                {language === 'mr' ? item.labelMr : item.labelEn}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 🌟 4. Desktop Professional Government Footer (Visible on Desktop >= 768px) */}
      <footer className="hidden md:block bg-slate-900 text-white border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Landmark className="w-6 h-6 text-amber-400" />
              <span className="font-extrabold text-base text-white">{currentGpName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'mr'
                ? 'महाराष्ट्र शासन ग्रामीण ई-प्रशासन प्रणाली अंतर्गत ग्रामस्थांना सर्व दाखले, कर संकलन व पारदर्शक सेवा एकाच डिजिटल पोर्टलवर उपलब्ध.'
                : 'Digital E-Governance portal of Government of Maharashtra providing online certificates, tax collection and village services.'}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              {language === 'mr' ? 'नागरिक सेवा (Services)' : 'Citizen Services'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><button onClick={() => setMobileTab('certificates')} className="hover:text-amber-300">रहिवासी व जन्म दाखले (Certificates)</button></li>
              <li><button onClick={() => setMobileTab('tax')} className="hover:text-amber-300">घरपट्टी व पाणीपट्टी भरणा (Tax Pay)</button></li>
              <li><button onClick={() => setMobileTab('grievances')} className="hover:text-amber-300">तक्रार निवारण कक्ष (Grievances)</button></li>
              <li><button onClick={() => setMobileTab('schemes')} className="hover:text-amber-300">लाडकी बहीण व PM योजना (Govt Schemes)</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              {language === 'mr' ? 'संपर्क व पत्ता (Contact)' : 'Address & Helpline'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ग्रामपंचायत कार्यालय, {currentGpName},<br />
              ता. {currentTaluka}, जि. {currentDistrict}, महाराष्ट्र.<br />
              <strong className="text-amber-300 block mt-2">📞 हेल्पलाईन: {panchayatInfo.helplineNumber}</strong>
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              {language === 'mr' ? 'सुरक्षा व खात्री' : 'Security & Trust'}
            </h4>
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>२५६-बिट एन्क्रिप्टेड आणि डिजिटल स्वाक्षरीसह अधिकृत प्रमाणपत्रे.</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-4 border-t border-white/10 text-center text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between">
          <p>© 2026 {currentGpName} • {currentTaluka}, {currentDistrict}. All Rights Reserved.</p>
          <p className="text-slate-400 mt-2 md:mt-0">Digital Maharashtra & Panchayat E-Governance Initiative</p>
        </div>
      </footer>
    </div>
  );
};
