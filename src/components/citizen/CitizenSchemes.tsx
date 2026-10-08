import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GovtScheme } from '../../types';
import { 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  HeartHandshake, 
  Home, 
  Sprout, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Send,
  UserCheck,
  Clock,
  X
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const CitizenSchemes: React.FC = () => {
  const { 
    language, 
    t, 
    schemes, 
    schemeApplications, 
    applyForScheme, 
    showToast, 
    triggerConfetti, 
    currentUser, 
    panchayatInfo 
  } = useApp();

  const currentGp = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const gpSchemes = currentGp ? schemes.filter(s => matchGramPanchayat(s.gramPanchayat, currentGp)) : schemes;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);
  
  // Eligibility Quiz Modal state
  const [quizScheme, setQuizScheme] = useState<GovtScheme | null>(null);
  const [quizAge, setQuizAge] = useState<number>(30);
  const [quizIncome, setQuizIncome] = useState<number>(150000);
  const [quizLandOwner, setQuizLandOwner] = useState<boolean>(true);
  const [quizResult, setQuizResult] = useState<boolean | null>(null);

  // Apply Modal state
  const [applyingScheme, setApplyingScheme] = useState<GovtScheme | null>(null);
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '');
  const [applicantAadhaar, setApplicantAadhaar] = useState(currentUser?.aadhaar || '');
  const [wardNo, setWardNo] = useState(currentUser?.wardNo || 'Ward 1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['All', 'Women & Child', 'Farmers', 'Housing', 'Senior Citizens'];

  const filteredSchemes = selectedCategory === 'All' 
    ? gpSchemes 
    : gpSchemes.filter(s => s.category === selectedCategory);

  // User's own applications strictly in current Gram Panchayat
  const myApplications = schemeApplications.filter(a => 
    matchGramPanchayat(a.gramPanchayat, currentGp) &&
    ((currentUser?.phone && (a.applicantPhone === currentUser.phone || a.phone === currentUser.phone)) ||
     (currentUser?.name && (a.applicantName?.toLowerCase() === currentUser.name.toLowerCase() || a.name?.toLowerCase() === currentUser.name.toLowerCase())))
  );

  const getSchemeIcon = (name: string) => {
    switch (name) {
      case 'HeartHandshake': return HeartHandshake;
      case 'Home': return Home;
      case 'Sprout': return Sprout;
      default: return ShieldCheck;
    }
  };

  const openApplyModal = (scheme: GovtScheme) => {
    setApplyingScheme(scheme);
    setApplicantName(currentUser?.name || '');
    setApplicantPhone(currentUser?.phone || '');
    setApplicantAadhaar(currentUser?.aadhaar || '');
    setWardNo(currentUser?.wardNo || 'Ward 1');
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingScheme) return;
    if (!applicantName || !applicantPhone) {
      showToast(language === 'mr' ? 'कृपया पूर्ण नाव व फोन भरा!' : 'Please fill full name and phone!');
      return;
    }

    setIsSubmitting(true);
    const success = await applyForScheme({
      schemeId: applyingScheme.id,
      schemeNameMr: applyingScheme.nameMr,
      schemeNameEn: applyingScheme.nameEn,
      applicantName,
      applicantPhone,
      applicantAadhaar: applicantAadhaar || 'XXXX-XXXX-XXXX',
      wardNo,
      benefitAmount: 1500,
      gramPanchayat: currentGp,
      taluka: currentUser?.taluka || panchayatInfo.talukaMr,
      district: currentUser?.district || panchayatInfo.districtMr
    });

    setIsSubmitting(false);
    if (success) {
      setApplyingScheme(null);
    }
  };

  const runEligibilityCheck = () => {
    if (!quizScheme) return;
    let eligible = true;
    if (quizScheme.category === 'Women & Child') {
      eligible = quizAge >= 18 && quizAge <= 65 && quizIncome <= 250000;
    } else if (quizScheme.category === 'Farmers') {
      eligible = quizLandOwner;
    } else if (quizScheme.category === 'Senior Citizens') {
      eligible = quizAge >= 60 || quizIncome <= 100000;
    } else if (quizScheme.category === 'Housing') {
      eligible = quizIncome <= 300000;
    }
    setQuizResult(eligible);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-xl p-3.5 text-white shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white/10 rounded-lg">
            <Layers className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h2 className="font-bold text-sm">{t('schemesHeading')}</h2>
            <p className="text-[11px] text-purple-100">{t('schemesSub')} - {currentGp}</p>
          </div>
        </div>
      </div>

      {/* My Applications Status Badge Banner (if any) */}
      {myApplications.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
          <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-purple-700" />
            {language === 'mr' ? 'आपले शासकीय योजना अर्ज' : 'Your Scheme Applications'} ({myApplications.length})
          </h4>
          <div className="space-y-1.5">
            {myApplications.map((app) => (
              <div key={app.id} className="bg-white p-2.5 rounded-lg border border-purple-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{app.schemeNameMr || app.schemeName}</span>
                  <span className="text-[10px] text-slate-500">
                    {language === 'mr' ? 'लाभाची रक्कम:' : 'Benefit:'} ₹ {app.benefitAmount || app.amount || 1500}/-
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  (app.status || '').toLowerCase() === 'sanctioned'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {(app.status || '').toLowerCase() === 'sanctioned' 
                    ? (language === 'mr' ? '✓ मंजूर (DBT लिंक)' : 'Sanctioned (DBT Linked)') 
                    : (language === 'mr' ? 'छाननी सुरू' : 'Pending Verification')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'All' && (language === 'mr' ? 'सर्व योजना' : 'All Schemes')}
            {cat === 'Women & Child' && (language === 'mr' ? 'महिला व बालके' : 'Women & Child')}
            {cat === 'Farmers' && (language === 'mr' ? 'शेतकरी' : 'Farmers')}
            {cat === 'Housing' && (language === 'mr' ? 'घरकुल' : 'Housing')}
            {cat === 'Senior Citizens' && (language === 'mr' ? 'ज्येष्ठ नागरिक' : 'Senior Citizens')}
          </button>
        ))}
      </div>

      {/* Schemes Accordion List */}
      {filteredSchemes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800">
            {language === 'mr' ? 'या ग्रामपंचायतीसाठी सद्यस्थितीत कोणतीही शासकीय योजना प्रसिद्ध झालेली नाही' : 'No government schemes available currently for this Gram Panchayat'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'mr' 
              ? 'ग्रामपंचायतीकडून नवीन शासकीय योजना किंवा DBT योजना जाहीर केल्यावर येथे अर्ज उपलब्ध होतील.' 
              : 'New government schemes will appear here once announced by the Gram Panchayat.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchemes.map((scheme) => {
            const Icon = getSchemeIcon(scheme.iconName);
            const isExpanded = expandedSchemeId === scheme.id;
            const myAppForThis = myApplications.find(a => 
              a.schemeId === scheme.id || 
              a.schemeNameMr === scheme.nameMr || 
              a.schemeNameEn === scheme.nameEn
            );

            return (
              <div
                key={scheme.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                <div 
                  onClick={() => setExpandedSchemeId(isExpanded ? null : scheme.id)}
                  className="p-3.5 flex items-start justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {scheme.category}
                        </span>
                        {myAppForThis && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            {language === 'mr' ? 'अर्ज केला आहे' : 'Applied'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 mt-1">
                        {language === 'mr' ? scheme.nameMr : scheme.nameEn}
                      </h3>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        ★ {language === 'mr' ? scheme.benefitMr : scheme.benefitEn}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs animate-fade-in">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                        {t('schemeEligibility')}
                      </h4>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
                        {(language === 'mr' ? scheme.eligibilityMr : scheme.eligibilityEn).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        {t('requiredDocuments')}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(language === 'mr' ? scheme.documentsMr : scheme.documentsEn).map((doc, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                            ✓ {doc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions: Eligibility Checker & Direct Apply */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setQuizScheme(scheme);
                          setQuizResult(null);
                        }}
                        className="flex-1 py-2 bg-white border border-purple-300 hover:bg-purple-50 text-purple-800 font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                        {t('checkEligibility')}
                      </button>
                      <button
                        onClick={() => openApplyModal(scheme)}
                        className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        {myAppForThis ? (language === 'mr' ? 'पुन्हा अर्ज करा' : 'Re-apply') : t('applyForScheme')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Direct Apply Modal */}
      {applyingScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleSubmitApplication} className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'mr' ? 'शासकीय योजनेसाठी अर्ज करा' : 'Apply for Govt Scheme'}
                </h3>
                <span className="text-[11px] text-purple-700 font-bold">
                  {language === 'mr' ? applyingScheme.nameMr : applyingScheme.nameEn}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setApplyingScheme(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div>
                <label className="block text-[11px] font-bold mb-1">
                  {language === 'mr' ? 'अर्जदाराचे पूर्ण नाव *' : 'Applicant Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="उदा. सुनीता रमेश पाटील"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1">
                    {language === 'mr' ? 'मोबाइल क्रमांक *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1">
                    {language === 'mr' ? 'आधार क्रमांक' : 'Aadhaar'}
                  </label>
                  <input
                    type="text"
                    value={applicantAadhaar}
                    onChange={(e) => setApplicantAadhaar(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">
                  {language === 'mr' ? 'वॉर्ड क्रमांक' : 'Ward'}
                </label>
                <select
                  value={wardNo}
                  onChange={(e) => setWardNo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                >
                  <option value="Ward 1">वॉर्ड १ (Ward 1)</option>
                  <option value="Ward 2">वॉर्ड २ (Ward 2)</option>
                  <option value="Ward 3">वॉर्ड ३ (Ward 3)</option>
                  <option value="Ward 4">वॉर्ड ४ (Ward 4)</option>
                  <option value="Ward 5">वॉर्ड ५ (Ward 5)</option>
                  <option value="Ward 6">वॉर्ड ६ (Ward 6)</option>
                </select>
              </div>

              <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200 text-[11px] text-purple-900">
                🏛️ ग्रामपंचायत: <strong>{currentGp}</strong><br />
                ★ लाभ: <strong>{language === 'mr' ? applyingScheme.benefitMr : applyingScheme.benefitEn}</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApplyingScheme(null)}
                className="flex-1 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700"
              >
                {language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (language === 'mr' ? 'सादर करत आहे...' : 'Submitting...') : (language === 'mr' ? 'अर्ज सादर करा' : 'Submit Application')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Eligibility Quiz Modal */}
      {quizScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl space-y-3 relative border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 pr-6">
              {language === 'mr' ? 'पात्रता चाचणी:' : 'Eligibility Checker:'} {language === 'mr' ? quizScheme.nameMr : quizScheme.nameEn}
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700 pt-1">
              <div>
                <label className="block text-[11px] font-semibold mb-1">
                  {language === 'mr' ? 'आपले वय (Years):' : 'Your Age (Years):'} {quizAge}
                </label>
                <input
                  type="range"
                  min="18"
                  max="80"
                  value={quizAge}
                  onChange={(e) => setQuizAge(Number(e.target.value))}
                  className="w-full accent-purple-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">
                  {language === 'mr' ? 'वार्षिक कौटुंबिक उत्पन्न:' : 'Annual Family Income:'} ₹ {quizIncome.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="10000"
                  value={quizIncome}
                  onChange={(e) => setQuizIncome(Number(e.target.value))}
                  className="w-full accent-purple-700"
                />
              </div>

              {quizScheme.category === 'Farmers' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="landOwner"
                    checked={quizLandOwner}
                    onChange={(e) => setQuizLandOwner(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <label htmlFor="landOwner" className="text-xs">
                    {language === 'mr' ? 'स्वतःच्या नावावर शेतजमीन आहे (७/१२)' : 'Hold land in your name (7/12)'}
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={runEligibilityCheck}
              className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg"
            >
              {language === 'mr' ? 'तपासा (Check Now)' : 'Check Now'}
            </button>

            {quizResult !== null && (
              <div className={`p-3 rounded-lg text-center text-xs font-bold ${
                quizResult ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
              }`}>
                {quizResult 
                  ? (language === 'mr' ? '🎉 अभिनंदन! आपण या योजनेसाठी पात्र आहात.' : '🎉 Congratulations! You are eligible for this scheme.')
                  : (language === 'mr' ? '⚠️ दिलेल्या माहितीनुसार आपण अटी पूर्ण करत नाही.' : '⚠️ You do not meet the primary criteria for this scheme.')}
              </div>
            )}

            <button
              onClick={() => setQuizScheme(null)}
              className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              {language === 'mr' ? 'बंद करा' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
