import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GramNotice } from '../../types';
import { 
  Calendar, 
  PlusCircle, 
  Bell, 
  MapPin, 
  Clock, 
  FileText, 
  Printer, 
  Download, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const DesktopGramSabha: React.FC = () => {
  const { language, t, notices, addNotice, showToast, panchayatInfo, currentUser } = useApp();

  const currentGp = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const [showAddModal, setShowAddModal] = useState(false);
  const [titleMr, setTitleMr] = useState('');
  const [descriptionMr, setDescriptionMr] = useState('');
  const [type, setType] = useState<GramNotice['type']>('GramSabha');
  const [venue, setVenue] = useState(`ग्रामपंचायत मध्यवर्ती सभागृह, ${currentGp}`);
  const [time, setTime] = useState('सकाळी १०:३० वाजता');
  const [isHighPriority, setIsHighPriority] = useState(true);

  const gpNotices = currentGp 
    ? notices.filter(n => matchGramPanchayat(n.gramPanchayat, currentGp))
    : notices;

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleMr || !descriptionMr) return;

    addNotice({
      titleMr,
      titleEn: titleMr,
      type,
      descriptionMr,
      descriptionEn: descriptionMr,
      venue,
      time,
      isHighPriority,
      gramPanchayat: currentGp
    });

    setTitleMr('');
    setDescriptionMr('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900">
            {language === 'mr' ? `ग्रामसभा, जाहीर सूचना व ठराव नोंदवही - ${currentGp}` : `Gram Sabha, Public Notices & Resolutions - ${currentGp}`}
          </h3>
          <span className="text-xs text-slate-500">
            {language === 'mr' ? 'ग्रामसभेचे इतिवृत्त, विषयपत्रिका व मंजूर ठराव' : 'Agendas, minutes and passed resolutions'}
          </span>
        </div>

        <button
          onClick={() => {
            setVenue(`ग्रामपंचायत मध्यवर्ती सभागृह, ${currentGp}`);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4 text-amber-200" />
          {language === 'mr' ? 'नवीन सूचना / ग्रामसभा जाहीर करा' : 'Publish Notice / Sabha'}
        </button>
      </div>

      {/* Notices List */}
      {gpNotices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800">
            {language === 'mr' ? 'या ग्रामपंचायतीसाठी कोणतीही सूचना प्रसिद्ध झालेली नाही' : 'No notices published yet for this Gram Panchayat'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'mr' ? 'नवीन ग्रामसभा बैठक किंवा सार्वजनिक सूचना प्रसिद्ध करण्यासाठी वरील बटणावर क्लिक करा.' : 'Click the button above to publish a new Gram Sabha or official public announcement.'}
          </p>
          <button
            onClick={() => {
              setVenue(`ग्रामपंचायत मध्यवर्ती सभागृह, ${currentGp}`);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            {language === 'mr' ? 'पहिली सूचना प्रसिद्ध करा' : 'Publish First Notice'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {gpNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    notice.type === 'GramSabha' ? 'bg-orange-100 text-orange-800' :
                    notice.type === 'TaxNotice' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {notice.type}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">📅 {notice.date}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {language === 'mr' ? notice.titleMr : notice.titleEn}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {language === 'mr' ? notice.descriptionMr : notice.descriptionEn}
                </p>

                {notice.venue && (
                  <div className="text-xs text-slate-700 flex flex-col space-y-1 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                    <div className="flex items-center gap-1 font-semibold text-amber-950">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>{notice.venue}</span>
                    </div>
                    {notice.time && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{notice.time}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'mr' ? 'नागरिक ॲपवर लाइव्ह प्रसिद्ध' : 'Published on Citizen App'}
                </span>

                <button
                  onClick={() => showToast(language === 'mr' ? 'ठराव प्रत डाउनलोड केली!' : 'Resolution downloaded!')}
                  className="text-orange-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  {language === 'mr' ? 'ठराव प्रत' : 'Download'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateNotice} className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3.5">
            <h3 className="font-bold text-base text-slate-900">
              {language === 'mr' ? 'नवीन सूचना / ग्रामसभा जाहीर करा' : 'Publish Gram Sabha or Notice'}
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">{language === 'mr' ? 'प्रकार (Type)' : 'Type'}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as GramNotice['type'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="GramSabha">विशेष ग्रामसभा बैठक (Gram Sabha)</option>
                  <option value="TaxNotice">कर सवलत / भरणा सूचना (Tax Notice)</option>
                  <option value="Tender">जाहीर निविदा सूचना (E-Tender)</option>
                  <option value="Resolution">मंजूर विकास ठराव (Resolution)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">{language === 'mr' ? 'सूचनेचा विषय / शीर्षक' : 'Title'}</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. वार्षिक अंदाजपत्रक मंजुरी विशेष ग्रामसभा"
                  value={titleMr}
                  onChange={(e) => setTitleMr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{language === 'mr' ? 'सविस्तर तपशील' : 'Description'}</label>
                <textarea
                  rows={3}
                  required
                  placeholder="नागरिकांसाठी जाहीर सूचना तपशील..."
                  value={descriptionMr}
                  onChange={(e) => setDescriptionMr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              {type === 'GramSabha' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">{language === 'mr' ? 'स्थळ' : 'Venue'}</label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{language === 'mr' ? 'वेळ' : 'Time'}</label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <input
                  type="checkbox"
                  id="urgentNoticeCheck"
                  checked={isHighPriority}
                  onChange={(e) => setIsHighPriority(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <label htmlFor="urgentNoticeCheck" className="text-[11px] font-bold text-slate-800 cursor-pointer">
                  {language === 'mr' ? '🔴 महत्त्वाची सूचना (नागरिक ॲपवर शीर्ष पट्टीवर Announcement Ticker मध्ये ठळक दाखवा)' : '🔴 High Priority (Highlight in Citizen Announcement Ticker)'}
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-slate-100 rounded-lg text-xs font-semibold"
              >
                {language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold"
              >
                {language === 'mr' ? 'प्रसिद्ध करा' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
