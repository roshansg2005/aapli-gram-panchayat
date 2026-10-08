import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CertificateType, CertificateApplication } from '../../types';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  Eye, 
  FileCheck, 
  User, 
  Phone, 
  Home, 
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Inbox
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const CitizenCertificates: React.FC = () => {
  const { 
    language, 
    t, 
    certificates, 
    certificateTypes,
    addCertificate, 
    setViewingCertificate,
    currentUser,
    panchayatInfo 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'apply' | 'my-certs'>('apply');
  const [selectedType, setSelectedType] = useState<string>('residence');

  // Set initial selectedType once certificateTypes are loaded
  React.useEffect(() => {
    if (certificateTypes.length > 0 && !certificateTypes.some(ct => ct.code === selectedType || ct.id === selectedType)) {
      setSelectedType(certificateTypes[0].code || certificateTypes[0].id);
    }
  }, [certificateTypes]);

  // Form State initialized with logged-in citizen
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantAadhaar, setApplicantAadhaar] = useState(currentUser?.aadhaar || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '');
  const [wardNo, setWardNo] = useState(currentUser?.wardNo || 'Ward 1');
  const [houseNo, setHouseNo] = useState(currentUser?.houseNo || '');
  const [reason, setReason] = useState('');
  const [customField1, setCustomField1] = useState('');
  const [customField2, setCustomField2] = useState('');
  const [attachedDocName, setAttachedDocName] = useState<string | null>(null);

  const currentGpName = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const currentTaluka = currentUser?.taluka || panchayatInfo.talukaMr;
  const currentDistrict = currentUser?.district || panchayatInfo.districtMr;

  // Filter only this citizen's applications in current Gram Panchayat
  const myApplications = certificates.filter(c => 
    matchGramPanchayat(c.gramPanchayat, currentGpName) &&
    (!currentUser?.phone || c.applicantPhone === currentUser?.phone || (currentUser?.name && c.applicantName.toLowerCase() === currentUser.name.toLowerCase()))
  );

  // Sync if user switches
  React.useEffect(() => {
    if (currentUser) {
      setApplicantName(currentUser.name);
      if (currentUser.phone) setApplicantPhone(currentUser.phone);
      if (currentUser.aadhaar) setApplicantAadhaar(currentUser.aadhaar);
      if (currentUser.wardNo) setWardNo(currentUser.wardNo);
      if (currentUser.houseNo) setHouseNo(currentUser.houseNo);
    }
  }, [currentUser]);

  const selectedCertConfig = certificateTypes.find(ct => ct.code === selectedType || ct.id === selectedType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || !houseNo) {
      alert(language === 'mr' ? 'कृपया सर्व आवश्यक माहिती भरा.' : 'Please fill all mandatory fields.');
      return;
    }

    const details: Record<string, string> = {
      houseNo,
      wardNo,
    };

    if (selectedType === 'residence') {
      if (customField1) details.residentSince = customField1;
      details.permanentAddress = `घर क्र. ${houseNo}, ${wardNo}, ${currentGpName}`;
    } else if (selectedType === 'birth') {
      if (customField1) details.childName = customField1;
      if (customField2) details.dob = customField2;
      details.birthPlace = `प्राथमिक आरोग्य केंद्र, ${currentGpName}`;
    } else if (selectedType === 'income') {
      if (customField1) details.annualIncome = `₹ ${customField1}/-`;
      if (customField2) details.sourceOfIncome = customField2;
    } else if (customField1) {
      details.customInfo = customField1;
    }

    if (attachedDocName) {
      details.attachedDocument = attachedDocName;
    }

    addCertificate({
      type: selectedType,
      applicantName,
      applicantAadhaar: applicantAadhaar || 'XXXX-XXXX-XXXX',
      applicantPhone,
      wardNo,
      houseNo,
      gramPanchayat: currentGpName,
      taluka: currentTaluka,
      district: currentDistrict,
      reason: reason || (language === 'mr' ? 'शासकीय कामकाजासाठी' : 'Official purpose'),
      details
    });

    // Reset Form & switch to my applications
    setApplicantName(currentUser?.name || '');
    setApplicantPhone(currentUser?.phone || '');
    setHouseNo(currentUser?.houseNo || '');
    setReason('');
    setCustomField1('');
    setCustomField2('');
    setActiveSubTab('my-certs');
  };

  const getStatusBadge = (status: CertificateApplication['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {t('statusApproved')}
          </span>
        );
      case 'under_scrutiny':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-600" />
            {t('statusUnderScrutiny')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            {t('statusRejected')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            {t('statusPending')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-4 text-white shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white/10 rounded-xl">
            <FileText className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base">{t('certificatesHeading')}</h2>
            <p className="text-[11px] text-blue-100">{currentGpName} • {t('certificatesSub')}</p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-slate-200 p-1 rounded-xl text-xs">
        <button
          onClick={() => setActiveSubTab('apply')}
          className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'apply'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {t('applyNewCertificate')}
        </button>
        <button
          onClick={() => setActiveSubTab('my-certs')}
          className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'my-certs'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          {t('myApplications')} ({myApplications.length})
        </button>
      </div>

      {/* Tab 1: Apply New Form */}
      {activeSubTab === 'apply' ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          {/* Certificate Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              {t('selectCertificateType')} <span className="text-red-500">*</span>
            </label>
            {certificateTypes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {certificateTypes.map((item) => {
                  const itemKey = item.code || item.id;
                  const isSelected = selectedType === itemKey || selectedType === item.id || selectedType === item.code;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedType(item.code || item.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80'
                      }`}
                    >
                      <strong className={`block text-xs ${isSelected ? 'text-blue-900 font-extrabold' : 'text-slate-800 font-bold'}`}>
                        {language === 'mr' ? item.nameMr : item.nameEn}
                      </strong>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span className="font-semibold text-emerald-600">
                          {item.fee === 0 ? (language === 'mr' ? 'मोफत' : 'Free') : `₹ ${item.fee}`}
                        </span>
                        <span>{item.deliveryDays} {language === 'mr' ? 'दिवस' : 'Days'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">
                  {language === 'mr' ? 'या ग्रामपंचायतीने अद्याप कोणत्याही दाखल्याची सेवा सक्रिय केलेली नाही.' : 'No certificate services published by this Gram Panchayat yet.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'mr' ? 'ग्रामपंचायतीने सेवा सुरू केल्यावर येथे दाखले अर्ज उपलब्ध होतील.' : 'Certificate application options will appear once enabled by Gram Panchayat.'}
                </p>
              </div>
            )}

            {/* Selected Certificate Info & Document Checklist */}
            {selectedCertConfig && (
              <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-950 space-y-1">
                {selectedCertConfig.descriptionMr && (
                  <p className="font-medium text-slate-700">
                    ℹ️ {language === 'mr' ? selectedCertConfig.descriptionMr : (selectedCertConfig.descriptionEn || selectedCertConfig.descriptionMr)}
                  </p>
                )}
                {selectedCertConfig.requiredDocumentsMr && (
                  <div className="flex items-start gap-1.5 text-blue-900 font-semibold pt-0.5">
                    <span className="shrink-0 text-blue-600">📋 {language === 'mr' ? 'आवश्यक कागदपत्रे:' : 'Required Docs:'}</span>
                    <span>
                      {language === 'mr' ? selectedCertConfig.requiredDocumentsMr : (selectedCertConfig.requiredDocumentsEn || selectedCertConfig.requiredDocumentsMr)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('applicantName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="उदा. ज्ञानेश्वर संभाजी मोरे"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('applicantPhone')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('applicantAadhaar')}
                </label>
                <input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={applicantAadhaar}
                  onChange={(e) => setApplicantAadhaar(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('wardNumber')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={wardNo}
                  onChange={(e) => setWardNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Ward 1">वॉर्ड क्र. १ (गणपती चौक)</option>
                  <option value="Ward 2">वॉर्ड क्र. २ (मारुती मंदिर)</option>
                  <option value="Ward 3">वॉर्ड क्र. ३ (बाजारपेठ)</option>
                  <option value="Ward 4">वॉर्ड क्र. ४ (आंबेडकर नगर)</option>
                  <option value="Ward 5">वॉर्ड क्र. ५ (गावठाण)</option>
                  <option value="Ward 6">वॉर्ड क्र. ६ (नवीन वस्ती)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('houseNumber')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder={language === 'mr' ? 'उदा. १२/अ किंवा घर क्र. ४५' : 'e.g. 12/A or House 45'}
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic fields */}
            {selectedType === 'residence' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'गावात किती वर्षांपासून वास्तव्य आहे?' : 'Years residing in village?'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'mr' ? 'उदा. २५ वर्षे / जन्मापासून' : 'e.g. 25 years / Since birth'}
                  value={customField1}
                  onChange={(e) => setCustomField1(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {selectedType === 'income' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'वार्षिक उत्पन्न (₹)' : 'Annual Income (₹)'}
                  </label>
                  <input
                    type="number"
                    placeholder="60000"
                    value={customField1}
                    onChange={(e) => setCustomField1(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'उत्पन्नाचे साधन' : 'Source of Income'}
                  </label>
                  <input
                    type="text"
                    placeholder="शेती / मजुरी"
                    value={customField2}
                    onChange={(e) => setCustomField2(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('applicationReason')}
              </label>
              <textarea
                rows={2}
                placeholder={language === 'mr' ? 'दाखला कशासाठी आवश्यक आहे? (उदा. शिष्यवृत्ती, वीज जोडणी, बँक काम)' : 'Purpose of certificate'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Document Proof Attachment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('uploadProof')}
              </label>
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-3 text-center bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAttachedDocName(file.name);
                    }
                  }}
                />
                <p className="text-xs text-slate-700 font-medium">
                  📎 {attachedDocName || (language === 'mr' ? 'कागदपत्र / फोटो निवडा (क्लिक करा)' : 'Click to select document or photo')}
                </p>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {attachedDocName 
                    ? (language === 'mr' ? '✓ कागदपत्र जोडले आहे (बदलण्यासाठी क्लिक करा)' : '✓ File attached (click to change)')
                    : (language === 'mr' ? 'आधार कार्ड, कर पावती किंवा रेशन कार्ड प्रत' : 'Aadhaar card, tax receipt or ration card copy')}
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {t('submitApplication')}
          </button>
        </form>
      ) : (
        /* Tab 2: My Applications List & Certificate Downloads */
        <div className="space-y-3">
          {myApplications.length > 0 ? (
            myApplications.map((cert) => {
              const certTypeInfo = certificateTypes.find(ct => ct.code === cert.type || ct.id === cert.type);
              const isApproved = cert.status === 'approved';

              return (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5 transition-all hover:border-slate-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded block w-fit">
                        #{cert.applicationNo}
                      </span>
                      <h4 className="font-bold text-xs md:text-sm text-slate-900 mt-1">
                        {certTypeInfo 
                          ? (language === 'mr' ? certTypeInfo.nameMr : certTypeInfo.nameEn)
                          : cert.type}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {cert.applicantName} ({cert.houseNo || 'घर क्र. नाही'}, {cert.wardNo})
                      </p>
                    </div>
                    {getStatusBadge(cert.status)}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>{language === 'mr' ? 'सादर दिनांक:' : 'Applied Date:'}</span>
                      <span className="font-medium text-slate-800">{cert.appliedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'mr' ? 'कारण:' : 'Reason:'}</span>
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">{cert.reason}</span>
                    </div>
                    {cert.processedDate && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>{language === 'mr' ? 'मंजूर दिनांक:' : 'Approved On:'}</span>
                        <span>{cert.processedDate}</span>
                      </div>
                    )}
                  </div>

                  {isApproved && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setViewingCertificate(cert)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'mr' ? 'दाखला पहा व प्रिंट करा' : 'View & Print'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-500 space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">
                {language === 'mr' ? 'आपण अद्याप कोणताही दाखल्याचा अर्ज केलेला नाही' : 'No applications submitted yet'}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'mr' ? 'नवीन दाखल्यासाठी वर दिलेल्या "नवीन दाखला अर्ज करा" बटणावर क्लिक करा.' : 'Click "Apply New" above to request a certificate.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
