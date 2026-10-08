import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Bell, 
  PhoneCall, 
  ExternalLink,
  Zap,
  ArrowRight,
  HardDrive,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileAppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppDownloadModal: React.FC<MobileAppDownloadModalProps> = ({ isOpen, onClose }) => {
  const { language } = useApp();
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Direct APK download link (hosted directly on our server - NO Play Store required)
  const apkDownloadPath = '/apk/Aapli_Grampanchayat.apk';
  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://aapligrampanchayat.gov.in';
  const directApkUrl = `${currentHost}${apkDownloadPath}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(directApkUrl)}&color=0f172a&bgcolor=ffffff`;

  const handleDownloadApk = () => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = apkDownloadPath;
    link.setAttribute('download', 'Aapli_Grampanchayat.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadStarted(false);
    }, 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directApkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = language === 'mr'
      ? `🏛️ आपली ग्रामपंचायत अधिकृत मोबाईल ॲप (Android) थेट डाऊनलोड करा:\n${directApkUrl}\n\nसर्व दाखले, घरपट्टी-पाणीपट्टी व तक्रारी आता मोबाईलवर!`
      : `🏛️ Download the Official Aapli Gram Panchayat Android App directly:\n${directApkUrl}\n\nAll certificates, tax records & grievances on your phone!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Gradient */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-13 h-13 rounded-2xl bg-white p-1 flex items-center justify-center border border-white/40 shadow-md overflow-hidden ring-2 ring-emerald-400/40">
              <img src="/logo.png" alt="Aapli Grampanchayat App" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/40 text-emerald-100 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/30">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {language === 'mr' ? 'अधिकृत नागरिक मोबाईल ॲप' : 'Official Citizen Mobile App'}
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-0.5">
                {language === 'mr' ? 'आपली ग्रामपंचायत ॲप डाउनलोड करा' : 'Download Aapli Gram Panchayat App'}
              </h2>
            </div>
          </div>
          <p className="text-emerald-100 text-xs md:text-sm font-medium max-w-lg">
            {language === 'mr' 
              ? 'सर्व ग्रामपंचायत दाखले, कर भरणा, तक्रारी व योजना आता थेट तुमच्या मोबाईलवर!' 
              : 'All Gram Panchayat certificates, tax payments, grievances & schemes directly on your mobile!'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* QR Code & Direct Download Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {/* Left: QR Code */}
            <div className="flex flex-col items-center text-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-white rounded-xl shadow-inner border border-slate-100 mb-2">
                <img 
                  src={qrCodeUrl} 
                  alt="Scan to Download Mobile App" 
                  className="w-36 h-36 object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback to SVG placeholder if offline
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'mr' ? 'मोबाईल कॅमेऱ्याने QR स्कॅन करा' : 'Scan QR with phone camera'}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {language === 'mr' ? 'थेट मोबाईलवर इन्स्टॉल करण्यासाठी' : 'To download directly on your phone'}
              </p>
            </div>

            {/* Right: Direct Download Buttons */}
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {language === 'mr' ? 'Android APK डाऊनलोड' : 'Android APK Download'}
                </span>
                <button
                  onClick={handleDownloadApk}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloadStarted
                      ? (language === 'mr' ? '⬇️ डाऊनलोड सुरू झाले आहे...' : '⬇️ Downloading APK...')
                      : (language === 'mr' ? 'Android APK डाऊनलोड करा (v1.2)' : 'Download Android APK (v1.2)')}
                  </span>
                </button>
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-0.5">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-slate-400" /> ५८ MB • Android 8.0+
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <ShieldCheck className="w-3 h-3" /> 100% Verified Safe
                  </span>
                </div>
              </div>

              {/* Share & Copy Link Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  title="Share APK Link on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'mr' ? 'WhatsApp वर शेअर करा' : 'Share on WhatsApp'}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  title="Copy Direct APK Download Link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedLink ? (language === 'mr' ? 'कॉपी झाले!' : 'Copied!') : (language === 'mr' ? 'लिंक कॉपी' : 'Copy Link')}</span>
                </button>
              </div>

              {/* Install PWA / Web App Option */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {language === 'mr' ? 'होम स्क्रीनवर जोडा (PWA)' : 'Add to Home Screen (PWA)'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {language === 'mr' ? 'कोणत्याही डाऊनलोडशिवाय त्वरित वापरा' : 'Instant use without file download'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    alert(language === 'mr' 
                      ? '💡 आपल्या मोबाईल ब्राऊझरच्या Menu (३ ठिपके) वर क्लिक करा आणि "Add to Home screen" किंवा "Install App" निवडा!' 
                      : '💡 Click browser Menu (3 dots) and choose "Add to Home screen" or "Install App"!');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  {language === 'mr' ? 'माहिती' : 'How?'}
                </button>
              </div>
            </div>
          </div>

          {/* Key Features Grid */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              {language === 'mr' ? '📱 मोबाईल ॲपची प्रमुख वैशिष्ट्ये' : '📱 Mobile App Key Features'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-800">{language === 'mr' ? '१०-सेकंद OTP' : 'Instant OTP'}</div>
                <div className="text-[10px] text-slate-500">{language === 'mr' ? 'सोपे व सुरक्षित लॉगिन' : 'Fast & Secure Login'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-800">{language === 'mr' ? 'डिजिटल दाखले' : 'Digital Certs'}</div>
                <div className="text-[10px] text-slate-500">{language === 'mr' ? 'QR सह PDF डाऊनलोड' : 'QR Verified PDFs'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-800">{language === 'mr' ? 'SMS व अलर्ट' : 'SMS Alerts'}</div>
                <div className="text-[10px] text-slate-500">{language === 'mr' ? 'ग्रामसभा व नोटीस' : 'Sabha & Tax Notices'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-800">{language === 'mr' ? 'AI व्हॉइस कॉल' : 'Voice AI'}</div>
                <div className="text-[10px] text-slate-500">{language === 'mr' ? '२४/७ मराठी मदत' : '24/7 Marathi Helper'}</div>
              </div>
            </div>
          </div>

          {/* 3-Step Install Guide */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
            <h4 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-700" />
              {language === 'mr' ? '📲 मोबाईलवर ॲप कसे इन्स्टॉल करावे? (३ सोप्या पायऱ्या)' : '📲 How to install the App on Mobile? (3 Simple Steps)'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-amber-950 font-medium pt-1">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">१</span>
                <span>{language === 'mr' ? 'वरील "Download APK" बटनावर किंवा QR स्कॅनवर क्लिक करा.' : 'Click "Download APK" button or scan the QR code.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">२</span>
                <span>{language === 'mr' ? 'ब्राऊझरमध्ये विचारल्यास "Download Anyway / Install" वर टॅप करा.' : 'Tap "Download Anyway / Install" if prompted.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">३</span>
                <span>{language === 'mr' ? 'ॲप उघडा आणि मोबाईल नंबर + OTP ने सुरक्षित लॉगिन करा!' : 'Open the app & login with your Mobile + OTP!'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{language === 'mr' ? 'महाराष्ट्र शासन मान्यताप्राप्त डिजिटल प्लॅटफॉर्म' : 'Govt of Maharashtra E-Governance Verified'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all"
          >
            {language === 'mr' ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
