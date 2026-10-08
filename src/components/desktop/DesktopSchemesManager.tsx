import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GovtScheme } from '../../types';
import { 
  Layers, 
  Search, 
  CheckCircle2, 
  Clock, 
  Users, 
  HeartHandshake, 
  Download, 
  Sparkles,
  PlusCircle,
  X,
  FileCheck,
  UserCheck,
  Building2,
  FileText
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const DesktopSchemesManager: React.FC = () => {
  const { 
    language, 
    t, 
    schemes, 
    addScheme,
    schemeApplications, 
    applyForScheme, 
    updateSchemeApplicationStatus, 
    showToast, 
    currentUser, 
    panchayatInfo 
  } = useApp();

  const currentGp = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const gpSchemes = currentGp ? schemes.filter(s => matchGramPanchayat(s.gramPanchayat, currentGp)) : schemes;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<GovtScheme>(gpSchemes[0] || ({} as GovtScheme));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateSchemeModal, setShowCreateSchemeModal] = useState(false);

  React.useEffect(() => {
    if (gpSchemes.length > 0) {
      if (!selectedScheme || !selectedScheme.id || !gpSchemes.some(s => s.id === selectedScheme.id)) {
        setSelectedScheme(gpSchemes[0]);
      }
    }
  }, [gpSchemes]);

  // Form state for adding beneficiary
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantAadhaar, setApplicantAadhaar] = useState('');
  const [wardNo, setWardNo] = useState('Ward 1');
  const [benefitAmount, setBenefitAmount] = useState(1500);

  // Form state for creating new scheme
  const [newSchemeNameMr, setNewSchemeNameMr] = useState('');
  const [newSchemeCategory, setNewSchemeCategory] = useState<'Women & Child' | 'Farmers' | 'Housing' | 'Senior Citizens' | 'Health' | 'Youth'>('Women & Child');
  const [newSchemeBenefitMr, setNewSchemeBenefitMr] = useState('');
  const [newSchemeEligibility, setNewSchemeEligibility] = useState('');
  const [newSchemeDocs, setNewSchemeDocs] = useState('आधार कार्ड, रहिवासी दाखला, बँक पासबुक');
  const [newSchemeDept, setNewSchemeDept] = useState('ग्रामविकास विभाग, महाराष्ट्र शासन');
  const [newSchemeDeadline, setNewSchemeDeadline] = useState('');

  // Filter applications for current GP and selected scheme
  const gpApplications = schemeApplications.filter(a => 
    matchGramPanchayat(a.gramPanchayat, currentGp)
  );

  const selectedSchemeApplications = gpApplications.filter(a => 
    a.schemeId === selectedScheme.id || 
    a.schemeNameMr === selectedScheme.nameMr || 
    a.schemeNameEn === selectedScheme.nameEn
  );

  const filteredBeneficiaries = selectedSchemeApplications.filter(ben => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (ben.applicantName || ben.name || '').toLowerCase().includes(q) ||
      (ben.applicantPhone || ben.phone || '').includes(q) ||
      (ben.applicantAadhaar || ben.aadhaar || '').includes(q) ||
      (ben.wardNo || ben.ward || '').toLowerCase().includes(q)
    );
  });

  const handleVerifyBeneficiary = (id: string) => {
    updateSchemeApplicationStatus(id, 'sanctioned', 'linked');
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone) {
      showToast(language === 'mr' ? 'कृपया नाव आणि फोन नंबर भरा!' : 'Please fill name and phone!');
      return;
    }

    const success = await applyForScheme({
      schemeId: selectedScheme.id,
      schemeNameMr: selectedScheme.nameMr,
      schemeNameEn: selectedScheme.nameEn,
      applicantName,
      applicantPhone,
      applicantAadhaar: applicantAadhaar || 'XXXX-XXXX-XXXX',
      wardNo,
      benefitAmount: benefitAmount || 1500,
      gramPanchayat: currentGp,
      taluka: currentUser?.taluka || panchayatInfo.talukaMr,
      district: currentUser?.district || panchayatInfo.districtMr
    });

    if (success) {
      setApplicantName('');
      setApplicantPhone('');
      setApplicantAadhaar('');
      setShowAddModal(false);
    }
  };

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeNameMr || !newSchemeBenefitMr) {
      showToast(language === 'mr' ? 'कृपया योजनेचे नाव व लाभाचा तपशील भरा!' : 'Please fill scheme name and benefit details!');
      return;
    }

    const eligibilityArray = newSchemeEligibility.split('\n').map(s => s.trim()).filter(Boolean);
    const docsArray = newSchemeDocs.split(',').map(s => s.trim()).filter(Boolean);

    const success = await addScheme({
      nameMr: newSchemeNameMr,
      nameEn: newSchemeNameMr,
      category: newSchemeCategory,
      benefitMr: newSchemeBenefitMr,
      benefitEn: newSchemeBenefitMr,
      eligibilityMr: eligibilityArray.length > 0 ? eligibilityArray : ['ग्रामपंचायत कार्यक्षेत्रातील पात्र नागरिक'],
      eligibilityEn: eligibilityArray.length > 0 ? eligibilityArray : ['Eligible citizens residing in GP jurisdiction'],
      documentsMr: docsArray.length > 0 ? docsArray : ['आधार कार्ड', 'रहिवासी दाखला'],
      documentsEn: docsArray.length > 0 ? docsArray : ['Aadhaar Card', 'Residence Proof'],
      departmentMr: newSchemeDept,
      departmentEn: newSchemeDept,
      deadline: newSchemeDeadline || null,
      iconName: 'ShieldCheck'
    });

    if (success) {
      setNewSchemeNameMr('');
      setNewSchemeBenefitMr('');
      setNewSchemeEligibility('');
      setNewSchemeDeadline('');
      setShowCreateSchemeModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar with Create Scheme button */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-sm text-slate-900">
            {language === 'mr' ? `शासकीय योजना व DBT लाभार्थी कक्ष - ${currentGp}` : `Govt Schemes & DBT Beneficiaries - ${currentGp}`}
          </h3>
          <span className="text-xs text-slate-500">
            {language === 'mr' ? 'थेट बँक हस्तांतरण (DBT) व लाभार्थी मंजुरी व्यवस्थापन' : 'Direct Benefit Transfer & beneficiary sanction desk'}
          </span>
        </div>

        <button
          onClick={() => setShowCreateSchemeModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4 text-purple-200" />
          {language === 'mr' ? 'नवीन शासकीय योजना जोडा' : 'Add New Scheme'}
        </button>
      </div>

      {/* Scheme Cards and Desk / Empty State */}
      {schemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800">
            {language === 'mr' ? 'या ग्रामपंचायतीसाठी अद्याप कोणतीही शासकीय योजना जोडलेली नाही' : 'No government schemes added yet for this Gram Panchayat'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'mr' 
              ? 'ग्रामस्थांसाठी नवीन शासकीय योजना किंवा DBT थेट बँक हस्तांतरण योजना सुरू करण्यासाठी वरील "+ नवीन शासकीय योजना जोडा" बटणावर क्लिक करा.' 
              : 'Click "+ Add New Scheme" above to register and publish a new government or DBT scheme for citizens.'}
          </p>
          <button
            onClick={() => setShowCreateSchemeModal(true)}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            {language === 'mr' ? 'पहिली शासकीय योजना जोडा' : 'Add First Scheme'}
          </button>
        </div>
      ) : (
        <>
          {/* Scheme Selection Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {schemes.map((scheme) => {
              const schemeCount = gpApplications.filter(a => 
                a.schemeId === scheme.id || 
                a.schemeNameMr === scheme.nameMr || 
                a.schemeNameEn === scheme.nameEn
              ).length;

              return (
                <div
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedScheme?.id === scheme.id
                      ? 'bg-purple-900 text-white border-purple-700 shadow-md ring-2 ring-purple-500/30'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedScheme?.id === scheme.id ? 'bg-purple-700 text-purple-200' : 'bg-purple-50 text-purple-700'
                  }`}>
                    {scheme.category}
                  </span>
                  <h4 className="font-bold text-xs mt-1.5 leading-snug line-clamp-1">
                    {language === 'mr' ? scheme.nameMr : scheme.nameEn}
                  </h4>
                  <div className="flex items-center justify-between text-xs mt-3">
                    <span className="opacity-80">{language === 'mr' ? 'एकूण लाभार्थी:' : 'Beneficiaries:'}</span>
                    <span className="font-extrabold text-sm text-amber-300">{schemeCount}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Scheme Beneficiary Desk */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 block">
                  {selectedScheme?.category || 'योजना'} • {language === 'mr' ? (selectedScheme?.departmentMr || '') : (selectedScheme?.departmentEn || '')}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                  {language === 'mr' ? (selectedScheme?.nameMr || 'योजना') : (selectedScheme?.nameEn || 'Scheme')} - {currentGp}
                </h3>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder={language === 'mr' ? 'नाव, फोन किंवा आधार शोधा...' : 'Search beneficiary...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <button
                  onClick={() => {
                    setBenefitAmount(1500);
                    setShowAddModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {language === 'mr' ? 'लाभार्थी नोंदवा' : 'Add Beneficiary'}
                </button>
              </div>
            </div>

            {/* Beneficiaries Table */}
            {filteredBeneficiaries.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-700">
                  {language === 'mr' ? 'या योजनेसाठी अद्याप कोणतेही लाभार्थी नाहीत' : 'No beneficiaries found for this scheme'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {language === 'mr' ? 'नवीन अर्जदार नोंदवण्यासाठी "लाभार्थी नोंदवा" बटणावर क्लिक करा.' : 'Click "Add Beneficiary" to register new recipients.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-4">{language === 'mr' ? 'लाभार्थ्याचे नाव' : 'Beneficiary Name'}</th>
                      <th className="py-2.5 px-4">{language === 'mr' ? 'मोबाइल / आधार' : 'Phone / Aadhaar'}</th>
                      <th className="py-2.5 px-4">{language === 'mr' ? 'वॉर्ड' : 'Ward'}</th>
                      <th className="py-2.5 px-4">{language === 'mr' ? 'लाभाची रक्कम' : 'Amount'}</th>
                      <th className="py-2.5 px-4">{language === 'mr' ? 'मंजुरी / DBT तारीख' : 'Sanction Date'}</th>
                      <th className="py-2.5 px-4">{language === 'mr' ? 'स्थिती' : 'Status'}</th>
                      <th className="py-2.5 px-4 text-right">{language === 'mr' ? 'कृती' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredBeneficiaries.map((ben) => {
                      const name = ben.applicantName || ben.name || 'ग्रामस्थ लाभार्थी';
                      const phone = ben.applicantPhone || ben.phone || '-';
                      const aadhaar = ben.applicantAadhaar || ben.aadhaar || '-';
                      const ward = ben.wardNo || ben.ward || 'Ward 1';
                      const amount = ben.benefitAmount || ben.amount || 1500;
                      const isSanctioned = (ben.status || '').toLowerCase() === 'sanctioned';
                      const dbtDate = ben.sanctionedDate || ben.dbtDate || (isSanctioned ? '2026-09-01' : '-');

                      return (
                        <tr key={ben.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {name}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            <div>{phone}</div>
                            <div className="text-[10px] text-slate-400">{aadhaar}</div>
                          </td>
                          <td className="py-3 px-4">
                            {ward}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-700">
                            ₹ {amount.toLocaleString('en-IN')}/-
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {dbtDate}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              isSanctioned
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {isSanctioned ? (language === 'mr' ? 'मंजूर (Sanctioned)' : 'Sanctioned') : (language === 'mr' ? 'छाननी प्रलंबित' : 'Pending Verification')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isSanctioned ? (
                              <button
                                onClick={() => handleVerifyBeneficiary(ben.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1 active:scale-95 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {language === 'mr' ? 'मंजूर करा' : 'Sanction'}
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {language === 'mr' ? 'DBT लिंक' : 'DBT Linked'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddBeneficiary} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'mr' ? 'नवीन लाभार्थी नोंदणी' : 'Register New Beneficiary'}
                </h3>
                <span className="text-xs text-purple-700 font-medium">
                  {language === 'mr' ? selectedScheme.nameMr : selectedScheme.nameEn}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'लाभार्थ्याचे पूर्ण नाव *' : 'Beneficiary Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. सुवर्णा ज्ञानेश्वर मोरे"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'मोबाइल क्रमांक *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'आधार क्रमांक' : 'Aadhaar Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="XXXX-XXXX-1234"
                    value={applicantAadhaar}
                    onChange={(e) => setApplicantAadhaar(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'वॉर्ड क्रमांक' : 'Ward'}
                  </label>
                  <select
                    value={wardNo}
                    onChange={(e) => setWardNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Ward 1">वॉर्ड १ (Ward 1)</option>
                    <option value="Ward 2">वॉर्ड २ (Ward 2)</option>
                    <option value="Ward 3">वॉर्ड ३ (Ward 3)</option>
                    <option value="Ward 4">वॉर्ड ४ (Ward 4)</option>
                    <option value="Ward 5">वॉर्ड ५ (Ward 5)</option>
                    <option value="Ward 6">वॉर्ड ६ (Ward 6)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'लाभाची रक्कम (₹)' : 'Benefit Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    value={benefitAmount}
                    onChange={(e) => setBenefitAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-[11px] text-purple-900">
                📍 <strong>{currentGp}</strong> ग्रामपंचायतीच्या लाभार्थी नोंदवहीत ही नोंद थेट सुरक्षित ठेवली जाईल.
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                {language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md"
              >
                {language === 'mr' ? 'लाभार्थी जतन करा' : 'Save Beneficiary'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create New Scheme Modal */}
      {showCreateSchemeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateScheme} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'mr' ? 'नवीन शासकीय कल्याणकारी योजना जोडा' : 'Add New Govt Welfare Scheme'}
                </h3>
                <span className="text-xs text-slate-500">
                  {language === 'mr' ? 'योजनेचा तपशील, पात्रता व कागदपत्रांची माहिती' : 'Scheme details, eligibility and required documents'}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateSchemeModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'योजनेचे नाव *' : 'Scheme Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. मुख्यमंत्री समृद्ध ग्राम योजना"
                  value={newSchemeNameMr}
                  onChange={(e) => setNewSchemeNameMr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'प्रवर्ग (Category)' : 'Category'}
                  </label>
                  <select
                    value={newSchemeCategory}
                    onChange={(e) => setNewSchemeCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Women & Child">महिला व बालके (Women & Child)</option>
                    <option value="Farmers">शेतकरी कल्याण (Farmers)</option>
                    <option value="Housing">घरकुल / निवारा (Housing)</option>
                    <option value="Senior Citizens">ज्येष्ठ नागरिक / निराधार (Senior Citizens)</option>
                    <option value="Health">आरोग्य व पोषण (Health)</option>
                    <option value="Youth">युवक व स्वयंरोजगार (Youth)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'शासकीय विभाग' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={newSchemeDept}
                    onChange={(e) => setNewSchemeDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'लाभाचे स्वरूप (Benefit Summary) *' : 'Benefit Summary *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. ₹ ५०,०००/- थेट अनुदान व व्यवसाय साहित्य"
                  value={newSchemeBenefitMr}
                  onChange={(e) => setNewSchemeBenefitMr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'पात्रता अटी (प्रत्येक ओळीवर एक अट लिहा)' : 'Eligibility Criteria (one per line)'}
                </label>
                <textarea
                  rows={3}
                  placeholder="उदा.&#10;१. ग्रामपंचायतीचा स्थानिक रहिवासी असावा&#10;२. वार्षिक उत्पन्न ₹ २ लाखांपेक्षा कमी असावे"
                  value={newSchemeEligibility}
                  onChange={(e) => setNewSchemeEligibility(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'आवश्यक कागदपत्रे (स्वल्पविरामाने वेगळी करा)' : 'Required Documents (comma separated)'}
                </label>
                <input
                  type="text"
                  placeholder="आधार कार्ड, रहिवासी दाखला, उत्पन्न प्रमाणपत्र, बँक पासबुक"
                  value={newSchemeDocs}
                  onChange={(e) => setNewSchemeDocs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'अंतिम मुदत / अर्ज करण्याची शेवटची तारीख (ऐच्छिक)' : 'Application Deadline (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="उदा. ३० सप्टेंबर २०२६ किंवा 10 दिवसात"
                  value={newSchemeDeadline}
                  onChange={(e) => setNewSchemeDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateSchemeModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                {language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md"
              >
                {language === 'mr' ? 'योजना प्रसिद्ध करा' : 'Publish Scheme'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
