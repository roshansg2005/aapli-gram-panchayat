import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CertificateApplication, CertificateTypeConfig } from '../../types';
import { 
  FileCheck2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer, 
  ShieldCheck, 
  QrCode, 
  User, 
  FileText, 
  Send,
  Eye,
  Check,
  X,
  Sparkles,
  Plus,
  IndianRupee,
  Edit3,
  Calendar,
  Layers,
  FilePlus2,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const DesktopCertificates: React.FC = () => {
  const { 
    language, 
    t, 
    currentUser,
    panchayatInfo,
    certificates, 
    certificateTypes,
    addCertificateType,
    updateCertificateType,
    deleteCertificateType,
    updateCertificateStatus, 
    setViewingCertificate,
    triggerConfetti 
  } = useApp();

  const currentGp = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const gpCertificates = currentGp ? certificates.filter(c => matchGramPanchayat(c.gramPanchayat, currentGp)) : certificates;

  // Top Sub Tabs
  const [activeTab, setActiveTab] = useState<'scrutiny' | 'tariffs'>('scrutiny');

  // Scrutiny State
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string>(gpCertificates[0]?.id || '');
  const [officerRemarks, setOfficerRemarks] = useState('');

  // Tariff Manager State
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<CertificateTypeConfig | null>(null);

  // New Type Form State
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeNameMr, setNewTypeNameMr] = useState('');
  const [newTypeNameEn, setNewTypeNameEn] = useState('');
  const [newTypeFee, setNewTypeFee] = useState<number>(20);
  const [newTypeDays, setNewTypeDays] = useState<number>(3);
  const [newTypeDescMr, setNewTypeDescMr] = useState('');
  const [newTypeDocsMr, setNewTypeDocsMr] = useState('');
  const [isSubmittingType, setIsSubmittingType] = useState(false);

  // Edit Tariff Form State
  const [editFee, setEditFee] = useState<number>(0);
  const [editDays, setEditDays] = useState<number>(1);
  const [editNameMr, setEditNameMr] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editDocsMr, setEditDocsMr] = useState('');

  const selectedApp = gpCertificates.find(c => c.id === selectedAppId) || gpCertificates[0];

  const filteredApplications = gpCertificates.filter(app => {
    const matchesFilter = selectedStatusFilter === 'all' || app.status === selectedStatusFilter;
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.houseNo && app.houseNo.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = gpCertificates.filter(c => c.status === 'pending' || c.status === 'under_scrutiny').length;

  const handleApprove = (app: CertificateApplication) => {
    updateCertificateStatus(
      app.id, 
      'approved', 
      officerRemarks || (language === 'mr' ? 'कागदपत्रे तपासली असून सर्व माहिती योग्य आहे.' : 'Documents verified and found correct.')
    );
    triggerConfetti();
    setOfficerRemarks('');
  };

  const handleReject = (app: CertificateApplication) => {
    const reason = prompt(language === 'mr' ? 'कृपया अर्ज नाकारण्याचे कारण टाका:' : 'Please enter rejection reason:');
    if (reason) {
      updateCertificateStatus(app.id, 'rejected', reason);
    }
  };

  const handleMarkScrutiny = (app: CertificateApplication) => {
    updateCertificateStatus(app.id, 'under_scrutiny', 'कागदपत्रांची ग्रामपंचायत कार्यालयात प्रत्यक्ष पडताळणी सुरू आहे.');
  };

  const handleOpenEditModal = (ct: CertificateTypeConfig) => {
    setEditingType(ct);
    setEditFee(ct.fee);
    setEditDays(ct.deliveryDays);
    setEditNameMr(ct.nameMr);
    setEditNameEn(ct.nameEn);
    setEditDocsMr(ct.requiredDocumentsMr || '');
  };

  const handleSaveEditType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    setIsSubmittingType(true);
    await updateCertificateType(editingType.id, {
      nameMr: editNameMr,
      nameEn: editNameEn,
      fee: Number(editFee) || 0,
      deliveryDays: Number(editDays) || 1,
      requiredDocumentsMr: editDocsMr
    });
    setIsSubmittingType(false);
    setEditingType(null);
  };

  const handleCreateNewType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeNameMr || !newTypeNameEn) {
      alert(language === 'mr' ? 'कृपया मराठी व इंग्रजी नाव टाका.' : 'Please enter Marathi and English names.');
      return;
    }
    setIsSubmittingType(true);
    const code = newTypeCode.trim() || newTypeNameEn.toLowerCase().replace(/[^a-z0-9]/g, '_');
    await addCertificateType({
      code,
      nameMr: newTypeNameMr,
      nameEn: newTypeNameEn,
      fee: Number(newTypeFee) || 0,
      deliveryDays: Number(newTypeDays) || 1,
      descriptionMr: newTypeDescMr || `${newTypeNameMr} - ग्रामपंचायत अधिकृत दाखला`,
      descriptionEn: `${newTypeNameEn} - Gram Panchayat Official Certificate`,
      requiredDocumentsMr: newTypeDocsMr || 'आधार कार्ड, कर पावती',
      requiredDocumentsEn: 'Aadhaar Card, Tax Receipt',
      gramPanchayat: currentGp
    });
    setIsSubmittingType(false);
    setShowAddTypeModal(false);
    // Reset Form
    setNewTypeCode('');
    setNewTypeNameMr('');
    setNewTypeNameEn('');
    setNewTypeFee(20);
    setNewTypeDays(3);
    setNewTypeDescMr('');
    setNewTypeDocsMr('');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Header & Tab Navigation */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('scrutiny')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'scrutiny'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{language === 'mr' ? 'दाखले अर्ज छाननी व स्वाक्षरी' : 'Applications & Scrutiny'}</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                activeTab === 'scrutiny' ? 'bg-white text-blue-700' : 'bg-amber-500 text-slate-950'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tariffs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tariffs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <IndianRupee className="w-4 h-4 text-amber-300" />
            <span>{language === 'mr' ? 'दाखले प्रकार व शासकीय शुल्क दरपत्रक' : 'Certificate Tariff & Services'}</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
              activeTab === 'tariffs' ? 'bg-white text-blue-700' : 'bg-slate-300 text-slate-800'
            }`}>
              {certificateTypes.length}
            </span>
          </button>
        </div>

        {activeTab === 'tariffs' && (
          <button
            onClick={() => setShowAddTypeModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'mr' ? '+ नवीन दाखला प्रकार जोडा' : '+ Add Certificate Type'}</span>
          </button>
        )}
      </div>

      {/* VIEW 1: SCRUTINY & APPROVAL DESK */}
      {activeTab === 'scrutiny' && (
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Search and Filters Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={language === 'mr' ? 'अर्ज क्रमांक, नाव किंवा घर क्र. शोधा...' : 'Search application no, name, house no...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {['all', 'pending', 'under_scrutiny', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                      selectedStatusFilter === status
                        ? 'bg-white text-blue-700 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status === 'all' ? (language === 'mr' ? 'सर्व अर्ज' : 'All') :
                     status === 'pending' ? (language === 'mr' ? 'प्रलंबित' : 'Pending') :
                     status === 'under_scrutiny' ? (language === 'mr' ? 'छाननी सुरू' : 'Scrutiny') :
                     status === 'approved' ? (language === 'mr' ? 'मंजूर' : 'Approved') :
                     (language === 'mr' ? 'नाकारले' : 'Rejected')}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-medium text-slate-500">
              {language === 'mr' ? 'एकूण अर्ज:' : 'Total:'} <strong className="text-slate-800">{filteredApplications.length}</strong>
            </div>
          </div>

          {/* Two Pane Split View */}
          <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
            {/* Left Column: Applications Master List */}
            <div className="col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between items-center">
                <span>{language === 'mr' ? 'प्राप्त अर्ज यादी' : 'Applications List'}</span>
                <span className="text-[11px] text-slate-500">{filteredApplications.length} दाखले</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => {
                    const isSelected = selectedApp?.id === app.id;
                    const certTypeObj = certificateTypes.find(ct => ct.code === app.type || ct.id === app.type);
                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                          isSelected 
                            ? 'bg-blue-50/90 border-blue-400 shadow-xs' 
                            : 'bg-white hover:bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            #{app.applicationNo}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            app.status === 'under_scrutiny' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 mt-1.5">
                          {certTypeObj ? (language === 'mr' ? certTypeObj.nameMr : certTypeObj.nameEn) : app.type}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                          <span className="font-medium text-slate-800">{app.applicantName}</span>
                          <span>घर क्र. {app.houseNo || '-'}</span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
                          <span>{app.wardNo}</span>
                          <span>{app.appliedDate}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    {language === 'mr' ? 'कोणतेही अर्ज उपलब्ध नाहीत.' : 'No applications found.'}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Scrutiny & Approval Detail Pane */}
            {selectedApp ? (
              <div className="col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                {/* Detail Header */}
                <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between shrink-0">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono bg-white/20 text-white px-2 py-0.5 rounded font-bold">
                        #{selectedApp.applicationNo}
                      </span>
                      <span className="text-xs text-blue-200">{selectedApp.appliedDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {(() => {
                        const ct = certificateTypes.find(c => c.code === selectedApp.type || c.id === selectedApp.type);
                        return ct ? (language === 'mr' ? ct.nameMr : ct.nameEn) : selectedApp.type;
                      })()}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-blue-200 block">सध्याची स्थिती</span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                      selectedApp.status === 'approved' ? 'bg-emerald-500 text-white' :
                      selectedApp.status === 'under_scrutiny' ? 'bg-blue-500 text-white' :
                      selectedApp.status === 'rejected' ? 'bg-red-500 text-white' :
                      'bg-amber-400 text-slate-950'
                    }`}>
                      {selectedApp.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Scrutiny Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Applicant Details Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === 'mr' ? 'अर्जदाराची वैयक्तिक माहिती' : 'Applicant Information'}</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px] block">{language === 'mr' ? 'पूर्ण नाव' : 'Full Name'}</span>
                        <strong className="text-slate-800">{selectedApp.applicantName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">{language === 'mr' ? 'मोबाईल क्र.' : 'Phone'}</span>
                        <strong className="text-slate-800">{selectedApp.applicantPhone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">{language === 'mr' ? 'आधार क्रमांक' : 'Aadhaar'}</span>
                        <strong className="text-slate-800">{selectedApp.applicantAadhaar || 'XXXX-XXXX-XXXX'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">{language === 'mr' ? 'पत्ता / घर क्र.' : 'House & Ward'}</span>
                        <strong className="text-slate-800">घर क्र. {selectedApp.houseNo || '-'}, {selectedApp.wardNo}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Application Purpose / Reason */}
                  <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-xs">
                    <span className="font-bold text-amber-900 block mb-1">
                      {language === 'mr' ? '📌 अर्ज करण्याचे कारण / तपशील:' : '📌 Application Reason:'}
                    </span>
                    <p className="text-slate-700">{selectedApp.reason || 'शासकीय व शैक्षणिक कामासाठी'}</p>
                  </div>

                  {/* Dynamic Certificate Form Details */}
                  {selectedApp.details && Object.keys(selectedApp.details).length > 0 && (
                    <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-xs space-y-2">
                      <span className="font-bold text-blue-900 block">
                        📋 {language === 'mr' ? 'अर्जातील विशिष्ट माहिती तपशील:' : 'Submitted Form Specifics:'}
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-slate-800">
                        {selectedApp.details.residentSince && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">{language === 'mr' ? 'वास्तव्य कालावधी' : 'Residing Since'}</span>
                            <strong>{selectedApp.details.residentSince}</strong>
                          </div>
                        )}
                        {selectedApp.details.childName && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">{language === 'mr' ? 'बालकाचे नाव' : 'Child Name'}</span>
                            <strong>{selectedApp.details.childName}</strong>
                          </div>
                        )}
                        {selectedApp.details.dob && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">{language === 'mr' ? 'जन्म तारीख' : 'Date of Birth'}</span>
                            <strong>{selectedApp.details.dob}</strong>
                          </div>
                        )}
                        {selectedApp.details.annualIncome && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">{language === 'mr' ? 'वार्षिक उत्पन्न' : 'Annual Income'}</span>
                            <strong className="text-emerald-700">{selectedApp.details.annualIncome}</strong>
                          </div>
                        )}
                        {selectedApp.details.sourceOfIncome && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">{language === 'mr' ? 'उत्पन्नाचे साधन' : 'Income Source'}</span>
                            <strong>{selectedApp.details.sourceOfIncome}</strong>
                          </div>
                        )}
                        {selectedApp.details.customInfo && (
                          <div className="col-span-2">
                            <span className="text-[10px] text-slate-500 block">{language === 'mr' ? 'इतर माहिती' : 'Additional Info'}</span>
                            <strong>{selectedApp.details.customInfo}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attached Documents Verification */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      {language === 'mr' ? 'कागदपत्रे पडताळणी (Document Scrutiny)' : 'Document Verification'}
                    </span>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-200">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {selectedApp.details?.attachedDocument || `${selectedApp.applicantName.replace(/\s+/g, '_')}_ID_Proof.pdf`}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">✓ E-KYC Identity Verified</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert(language === 'mr' ? `कागदपत्र तपासले: ${selectedApp.details?.attachedDocument || 'ओळख पुरावा'} संलग्न आहे.` : 'Document verified!')}
                        className="px-3 py-1 bg-white border border-blue-300 rounded text-blue-700 font-bold hover:bg-blue-50"
                      >
                        {language === 'mr' ? 'पहा (View)' : 'View'}
                      </button>
                    </div>
                  </div>

                  {/* Official Certificate Number if Approved */}
                  {selectedApp.status === 'approved' && selectedApp.certificateNumber && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                            ✓ {language === 'mr' ? 'डिजिटल स्वाक्षरीत दाखला क्रमांक' : 'Digitally Signed Certificate No'}
                          </span>
                          <span className="text-sm font-mono font-extrabold text-emerald-900">
                            {selectedApp.certificateNumber}
                          </span>
                        </div>
                        <QrCode className="w-8 h-8 text-emerald-700" />
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        {language === 'mr' ? 'मंजूर अधिकारी:' : 'Processed By:'} <strong>{selectedApp.processedBy}</strong> | {selectedApp.processedDate}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Scrutiny Action Toolbar */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between gap-3">
                  {selectedApp.status === 'approved' ? (
                    <button
                      onClick={() => setViewingCertificate(selectedApp)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <Printer className="w-4 h-4 text-amber-300" />
                      {language === 'mr' ? 'अधिकृत दाखला पहा / प्रिंट करा (View & Print Certificate)' : 'View & Print Official Certificate'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleReject(selectedApp)}
                        className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <X className="w-4 h-4" />
                        {language === 'mr' ? 'फेटाळा' : 'Reject'}
                      </button>

                      <button
                        onClick={() => handleMarkScrutiny(selectedApp)}
                        className="py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Clock className="w-4 h-4" />
                        {language === 'mr' ? 'छाननी सुरू' : 'Scrutiny'}
                      </button>

                      <button
                        onClick={() => handleApprove(selectedApp)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        {language === 'mr' ? 'डिजिटल स्वाक्षरीने मंजूर करा' : 'Approve & Digitally Sign'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* VIEW 2: CERTIFICATE SERVICES & FEE TARIFF MANAGER */}
      {activeTab === 'tariffs' && (
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-amber-300" />
                <span>{language === 'mr' ? 'ग्रामपंचायत दाखले सेवा व शासकीय शुल्क दरपत्रक' : 'Official Certificate Tariff & Service Register'}</span>
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                {currentGp} • {language === 'mr' ? 'येथून आपण सर्व दाखल्यांचे शासकीय शुल्क (₹) व वितरणाचा कालावधी (दिवस) बदलू शकता व नवीन दाखला तयार करू शकता.' : 'Configure official fees (₹), delivery SLA (days), or allocate new certificate types.'}
              </p>
            </div>
            <button
              onClick={() => setShowAddTypeModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl shadow flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'mr' ? '+ नवीन दाखला प्रकार जोडा' : '+ New Certificate'}</span>
            </button>
          </div>

          {/* Certificate Types Grid / Table */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800 flex justify-between items-center">
              <span>{language === 'mr' ? 'सक्रिय दाखले व दर सूची' : 'Active Certificate Tariff Schedule'} ({certificateTypes.length})</span>
              <span className="text-[11px] text-slate-500">{language === 'mr' ? 'नागरिकांच्या अर्जावर हेच शुल्क लागू होईल' : 'This fee tariff applies dynamically to citizen applications'}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {certificateTypes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {certificateTypes.map((ct) => {
                  return (
                    <div
                      key={ct.id}
                      className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {ct.code}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ct.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {ct.isActive ? (language === 'mr' ? 'सक्रिय' : 'Active') : (language === 'mr' ? 'निष्क्रिय' : 'Inactive')}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900 mt-2">
                          {language === 'mr' ? ct.nameMr : ct.nameEn}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {language === 'mr' ? ct.nameEn : ct.nameMr}
                        </p>

                        {ct.descriptionMr && (
                          <p className="text-[11px] text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-lg line-clamp-2">
                            {language === 'mr' ? ct.descriptionMr : (ct.descriptionEn || ct.descriptionMr)}
                          </p>
                        )}

                        {ct.requiredDocumentsMr && (
                          <div className="text-[10px] text-blue-900 font-semibold mt-2">
                            <span className="text-blue-600">📋 {language === 'mr' ? 'आवश्यक कागदपत्रे:' : 'Docs:'} </span>
                            {language === 'mr' ? ct.requiredDocumentsMr : (ct.requiredDocumentsEn || ct.requiredDocumentsMr)}
                          </div>
                        )}
                      </div>

                      {/* Fee and Delivery Days Bar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">{language === 'mr' ? 'शासकीय शुल्क' : 'Fee'}</span>
                          <span className="text-sm font-extrabold text-emerald-700">
                            {ct.fee === 0 ? (language === 'mr' ? 'मोफत (Free)' : 'Free') : `₹ ${ct.fee}`}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block">{language === 'mr' ? 'कालावधी' : 'Timeline'}</span>
                          <span className="text-xs font-bold text-slate-800">
                            {ct.deliveryDays} {language === 'mr' ? 'दिवस' : 'Days'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(ct)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-blue-200 transition-all active:scale-95"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{language === 'mr' ? 'बदला' : 'Edit'}</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(language === 'mr' ? `खरोखर हा "${ct.nameMr}" दाखला प्रकार काढून टाकायचा आहे का?` : `Are you sure you want to delete ${ct.nameEn}?`)) {
                                await deleteCertificateType(ct.id);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200 transition-all active:scale-95"
                            title={language === 'mr' ? 'दाखला प्रकार हटवा' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              ) : (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">
                    {language === 'mr' ? 'या ग्रामपंचायतीसाठी कोणतेही दाखले निश्चित केलेले नाहीत' : 'No certificate services defined yet'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {language === 'mr'
                      ? 'ग्रामपंचायत कार्यक्षेत्रात नागरिकांना द्यायच्या दाखल्यांचे प्रकार, शासकीय शुल्क आणि वितरणाचा कालावधी निश्चित करण्यासाठी खालील बटण दाबा.'
                      : 'Click below to configure official certificate services and allocate fee tariffs.'}
                  </p>
                  <button
                    onClick={() => setShowAddTypeModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'mr' ? '+ नवीन दाखला प्रकार जोडा' : '+ Add First Certificate'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW CERTIFICATE TYPE */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <FilePlus2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">
                    {language === 'mr' ? 'नवीन दाखला प्रकार व शुल्क निश्चित करा' : 'Add New Certificate Service'}
                  </h3>
                  <p className="text-[11px] text-slate-500">{currentGp}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewType} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'दाखल्याचे नाव (मराठीत)' : 'Certificate Name (Marathi)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. विज जोडणी नाहरकत दाखला"
                    value={newTypeNameMr}
                    onChange={(e) => setNewTypeNameMr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'दाखल्याचे नाव (English)' : 'Certificate Name (English)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electricity NOC"
                    value={newTypeNameEn}
                    onChange={(e) => setNewTypeNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'शासकीय शुल्क (₹)' : 'Official Fee (₹)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="20 (0 for Free)"
                    value={newTypeFee}
                    onChange={(e) => setNewTypeFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">0 टाकल्यास नागरिकांना "मोफत" दिसेल</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'वितरण कालावधी (दिवस)' : 'Delivery SLA (Days)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="3"
                    value={newTypeDays}
                    onChange={(e) => setNewTypeDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'आवश्यक कागदपत्रे यादी' : 'Required Documents Checklist'}
                </label>
                <input
                  type="text"
                  placeholder="उदा. आधार कार्ड, चालू घरपट्टी पावती, अर्ज"
                  value={newTypeDocsMr}
                  onChange={(e) => setNewTypeDocsMr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'उद्देश व माहिती (वर्णन)' : 'Description / Purpose'}
                </label>
                <textarea
                  rows={2}
                  placeholder="दाखल्याचा उद्देश व नियम माहिती..."
                  value={newTypeDescMr}
                  onChange={(e) => setNewTypeDescMr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTypeModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingType}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all"
                >
                  {isSubmittingType ? (language === 'mr' ? 'जतन करत आहे...' : 'Saving...') : (language === 'mr' ? 'दाखला प्रकार जोडा' : 'Save Certificate Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CERTIFICATE FEE & SLA */}
      {editingType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">
                    {language === 'mr' ? 'दाखला शुल्क व कालावधी बदला' : 'Edit Certificate Fee & SLA'}
                  </h3>
                  <p className="text-[11px] text-slate-500">{editingType.code}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingType(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditType} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'दाखल्याचे नाव (मराठी)' : 'Name (Marathi)'}
                </label>
                <input
                  type="text"
                  required
                  value={editNameMr}
                  onChange={(e) => setEditNameMr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'दाखल्याचे नाव (English)' : 'Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'शासकीय शुल्क (₹)' : 'Fee (₹)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editFee}
                    onChange={(e) => setEditFee(Number(e.target.value))}  
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-emerald-700 text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">0 = मोफत (Free)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'वितरण कालावधी (दिवस)' : 'Delivery (Days)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editDays}
                    onChange={(e) => setEditDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'आवश्यक कागदपत्रे यादी' : 'Required Documents'}
                </label>
                <input
                  type="text"
                  value={editDocsMr}
                  onChange={(e) => setEditDocsMr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingType(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingType}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all"
                >
                  {isSubmittingType ? (language === 'mr' ? 'अपडेट होत आहे...' : 'Saving...') : (language === 'mr' ? 'शुल्क अपडेट करा' : 'Update Tariff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
