import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Smartphone, 
  Monitor, 
  Languages, 
  Sparkles, 
  Frame, 
  Maximize2,
  CheckCircle2,
  Landmark,
  Layers,
  ChevronDown,
  X
} from 'lucide-react';

export const DeviceSwitcherHeader: React.FC = () => {
  const { 
    language, 
    toggleLanguage, 
    appMode, 
    setAppMode, 
    mobileFrameMode, 
    setMobileFrameMode,
    isMobileScreen,
    toast,
    currentUser,
    setShowAuthModal,
    setAuthType 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is on an actual mobile device, render a compact discreet trigger or collapsible floating badge
  if (isMobileScreen) {
    return (
      <>
        {/* Compact Floating Device Switcher Pill for Mobile */}
        <div className="fixed top-2 right-2 z-50 no-print">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-900/90 backdrop-blur-md text-amber-400 rounded-full shadow-lg border border-amber-500/30 active:scale-95 transition-all flex items-center gap-1 text-[10px] font-bold"
            title="Switch View / Portal"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Quick Mobile Drawer / Popover */}
          {mobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-700 text-white text-xs space-y-1.5 animate-slide-down">
              <div className="flex items-center justify-between px-2 py-1 border-b border-white/10">
                <span className="font-bold text-[11px] text-amber-400">पोर्टल व व्ह्यू बदला</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  setAppMode('citizen-mobile');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 font-semibold ${
                  appMode === 'citizen-mobile' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>📱 {language === 'mr' ? 'नागरिक मोबाइल ॲप' : 'Citizen Mobile App'}</span>
              </button>

              <button
                onClick={() => {
                  setAppMode('panchayat-desktop');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 font-semibold ${
                  appMode === 'panchayat-desktop' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>🖥️ {language === 'mr' ? 'ग्रामपंचायत ERP' : 'Panchayat Desktop ERP'}</span>
              </button>

              <button
                onClick={() => {
                  setAppMode('gateway');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 font-semibold ${
                  appMode === 'gateway' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>🚪 {language === 'mr' ? 'मुख्य प्रवेशद्वार (Gateway)' : 'Portal Gateway'}</span>
              </button>

              <div className="pt-1 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    toggleLanguage();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[11px] font-bold text-amber-300 flex items-center gap-1"
                >
                  <Languages className="w-3 h-3" />
                  <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-md text-[11px] font-bold"
                >
                  {currentUser ? `👤 ${currentUser.name.split(' ')[0]}` : (language === 'mr' ? 'लॉगिन' : 'Login')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-amber-500/40 flex items-center space-x-2 text-xs font-bold animate-slide-up no-print max-w-[90vw]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{toast}</span>
          </div>
        )}
      </>
    );
  }

  // Desktop Screen: Full Top Toolbar
  return (
    <>
      {/* Floating Mode Switcher Top Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800 shadow-md sticky top-0 z-50 no-print">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAppMode('gateway')}
            className="flex items-center space-x-1.5 font-extrabold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>आपली ग्रामपंचायत डिजिटल प्लॅटफॉर्म</span>
          </button>

          <span className="text-slate-600">|</span>

          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setAppMode('gateway')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-bold transition-all ${
                appMode === 'gateway'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? '🚪 मुख्य पोर्टल (Gateway)' : '🚪 Portal Gateway'}</span>
            </button>

            <button
              onClick={() => setAppMode('citizen-mobile')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-bold transition-all ${
                appMode === 'citizen-mobile'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? '📱 नागरिक मोबाइल' : '📱 Citizen Mobile'}</span>
            </button>

            <button
              onClick={() => setAppMode('panchayat-desktop')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-bold transition-all ${
                appMode === 'panchayat-desktop'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? '🖥️ प्रशासन ERP' : '🖥️ Panchayat ERP'}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Mobile Frame Toggle, Auth Button & Language Switch */}
        <div className="flex items-center space-x-2">
          {/* User Sign In / Profile Button */}
          <button
            onClick={() => {
              setAuthType(appMode === 'citizen-mobile' ? 'citizen' : 'panchayat');
              setShowAuthModal(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg font-bold border border-amber-500/40 transition-all text-xs"
          >
            <span>{currentUser ? `👤 ${currentUser.name.split(' ')[0]}` : (language === 'mr' ? '🔑 लॉगिन / नोंदणी' : '🔑 Sign In')}</span>
          </button>

          {appMode === 'citizen-mobile' && (
            <button
              onClick={() => setMobileFrameMode(!mobileFrameMode)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                mobileFrameMode 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Toggle Mobile Bezel Simulator"
            >
              {mobileFrameMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Frame className="w-3.5 h-3.5" />}
              <span>{mobileFrameMode ? (language === 'mr' ? 'पूर्ण स्क्रीन' : 'Full Screen') : (language === 'mr' ? 'फोन फ्रेम' : 'Phone Frame')}</span>
            </button>
          )}

          {/* Language Switch */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg font-bold border border-slate-700 transition-all text-xs"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
          </button>
        </div>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-amber-500/40 flex items-center space-x-2 text-xs font-bold animate-slide-up no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </>
  );
};
