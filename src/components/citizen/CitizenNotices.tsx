import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Calendar, 
  FileText, 
  MapPin, 
  Clock, 
  Download, 
  AlertCircle, 
  Sparkles,
  Share2
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const CitizenNotices: React.FC = () => {
  const { language, t, notices, showToast, currentUser, panchayatInfo } = useApp();
  const currentGpName = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const [activeFilter, setActiveFilter] = useState<'All' | 'GramSabha' | 'TaxNotice' | 'Tender'>('All');

  const gpNotices = currentGpName ? notices.filter(n => matchGramPanchayat(n.gramPanchayat, currentGpName)) : notices;

  const filteredNotices = activeFilter === 'All'
    ? gpNotices
    : gpNotices.filter(n => n.type === activeFilter);

  const handleShare = (title: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Aapli Gram Panchayat Notice',
        text: title,
        url: window.location.href
      }).catch(() => {});
    } else {
      showToast(language === 'mr' ? 'सूचना कॉपी केली गेली!' : 'Notice copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-gov-navy rounded-xl p-3.5 text-white shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white/10 rounded-lg">
            <Bell className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="font-bold text-sm">{t('noticesHeading')}</h2>
            <p className="text-[11px] text-slate-300">{t('noticesSub')}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveFilter('All')}
          className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
            activeFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          {language === 'mr' ? 'सर्व सूचना' : 'All Notices'}
        </button>
        <button
          onClick={() => setActiveFilter('GramSabha')}
          className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
            activeFilter === 'GramSabha' ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          {language === 'mr' ? 'ग्रामसभा बैठका' : 'Gram Sabha'}
        </button>
        <button
          onClick={() => setActiveFilter('TaxNotice')}
          className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
            activeFilter === 'TaxNotice' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          {language === 'mr' ? 'कर सवलत सूचना' : 'Tax Rebate'}
        </button>
        <button
          onClick={() => setActiveFilter('Tender')}
          className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
            activeFilter === 'Tender' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          {language === 'mr' ? 'निविदा व ठराव' : 'Tenders & Works'}
        </button>
      </div>

      {/* Notice Cards */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-slate-700">
            {language === 'mr' ? 'सध्या कोणतीही सूचना उपलब्ध नाही' : 'No notices currently available'}
          </h4>
          <p className="text-[11px] text-slate-500">
            {language === 'mr' ? 'ग्रामपंचायतीकडून नवीन सूचना किंवा ग्रामसभा कार्यक्रम जाहीर झाल्यावर येथे दिसेल.' : 'New announcements or Gram Sabha notices will appear here once published.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-xl p-4 border shadow-sm space-y-2.5 transition-all ${
                notice.isHighPriority 
                  ? 'border-orange-400 ring-2 ring-orange-500/10' 
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  notice.type === 'GramSabha' 
                    ? 'bg-orange-100 text-orange-800' 
                    : notice.type === 'TaxNotice' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {notice.type}
                </span>
                <span className="text-[10px] text-slate-400">
                  📅 {notice.date}
                </span>
              </div>

              <h3 className="font-bold text-xs text-slate-900 leading-snug">
                {language === 'mr' ? notice.titleMr : notice.titleEn}
              </h3>

              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {language === 'mr' ? notice.descriptionMr : notice.descriptionEn}
              </p>

              {notice.venue && (
                <div className="text-[11px] text-slate-700 flex flex-col space-y-1 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                  <div className="flex items-center gap-1 font-semibold text-amber-900">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>{notice.venue}</span>
                  </div>
                  {notice.time && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{notice.time}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <button
                  onClick={() => handleShare(language === 'mr' ? notice.titleMr : notice.titleEn)}
                  className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  {language === 'mr' ? 'शेअर करा' : 'Share'}
                </button>

                <button
                  onClick={() => showToast(language === 'mr' ? 'अधिकृत नोटीस PDF डाउनलोड केली जात आहे...' : 'Downloading notice PDF...')}
                  className="text-[11px] text-orange-600 font-bold flex items-center gap-1 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  {language === 'mr' ? 'PDF डाउनलोड' : 'Download PDF'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
