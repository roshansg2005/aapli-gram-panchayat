import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users2, 
  MapPin, 
  Receipt, 
  AlertTriangle, 
  HardHat, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Home, 
  Droplets, 
  Sparkles, 
  Send, 
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

export const DesktopWardMemberDesk: React.FC = () => {
  const { language, panchayatInfo, currentUser, grievances, taxRecords, projects } = useApp();

  const [selectedWard, setSelectedWard] = useState<string>(currentUser?.wardNo || 'Ward 1');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalCost, setProposalCost] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [proposalSuccess, setProposalSuccess] = useState(false);

  const [wardProposals, setWardProposals] = useState<Array<{ id: string; ward: string; title: string; cost: number; desc: string; date: string; status: 'submitted' | 'approved' }>>([
    {
      id: 'prop-01',
      ward: 'Ward 1',
      title: 'गणपती मंदिर ते मुख्य रस्ता पेव्हर ब्लॉक व सौर पथदिवे बसवणे',
      cost: 250000,
      desc: 'पावसाळ्यात चिखल होत असल्याने नागरिकांच्या सोयीसाठी पेव्हर ब्लॉक व ३ नवीन सौर पथदिवे आवश्यक.',
      date: '2026-09-01',
      status: 'approved'
    },
    {
      id: 'prop-02',
      ward: 'Ward 2',
      title: 'आंबेडकर नगर गल्ली क्र. २ भूमिगत गटार पाईपलाईन जोडणी',
      cost: 180000,
      desc: 'सांडपाण्याचा निचरा होण्यासाठी २५० मीटर भूमिगत पाईपलाईन टाकणे.',
      date: '2026-09-03',
      status: 'submitted'
    }
  ]);

  // Ward Filtered Data
  const currentWardGrievances = grievances.filter(g => !g.wardNo || g.wardNo === selectedWard || g.wardNo.includes(selectedWard.replace('Ward ', '')));
  const currentWardTaxes = taxRecords.filter(t => !t.wardNo || t.wardNo === selectedWard || t.wardNo.includes(selectedWard.replace('Ward ', '')));
  const paidWardTaxes = currentWardTaxes.filter(t => t.isPaid);
  const wardTaxTotal = currentWardTaxes.reduce((sum, t) => sum + (t.finalAmount || 0), 0);
  const wardTaxCollected = paidWardTaxes.reduce((sum, t) => sum + (t.finalAmount || 0), 0);
  const taxCollectionPercent = wardTaxTotal > 0 ? Math.round((wardTaxCollected / wardTaxTotal) * 100) : 0;

  const currentWardProposals = wardProposals.filter(p => p.ward === selectedWard);

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle || !proposalCost) return;

    const newProp = {
      id: `prop-${Date.now()}`,
      ward: selectedWard,
      title: proposalTitle,
      cost: Number(proposalCost),
      desc: proposalDesc,
      date: new Date().toISOString().split('T')[0],
      status: 'submitted' as const
    };

    setWardProposals([newProp, ...wardProposals]);
    setProposalTitle('');
    setProposalCost('');
    setProposalDesc('');
    setShowProposalModal(false);
    setProposalSuccess(true);
    setTimeout(() => setProposalSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs p-3 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
            <Users2 className="w-full h-full text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
                {language === 'mr' ? 'ग्रामपंचायत सदस्य / वॉर्ड प्रतिनिधी कार्यकक्ष' : 'Ward Member Desk'}
              </span>
              <span className="text-[10px] font-bold bg-amber-900/40 text-amber-200 px-2.5 py-0.5 rounded-full">
                {currentUser?.name || 'माननीय सदस्य'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">
              {language === 'mr' ? `${selectedWard} (प्रभाग कार्यप्रणाली)` : `${selectedWard} Operations & Citizen Redressal`}
            </h2>
            <p className="text-xs text-amber-100 mt-0.5">
              {currentUser?.gramPanchayat || panchayatInfo.nameMr} • {language === 'mr' ? 'आपल्या प्रभागातील विकासकामे, कर वसुली व नागरिकांच्या तक्रारींचे निवारण' : 'Ward infrastructure works & citizen services'}
            </p>
          </div>
        </div>

        {/* Ward Switcher */}
        <div className="bg-white/10 p-2 rounded-2xl border border-white/20 flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-amber-100">{language === 'mr' ? 'प्रभाग निवडा:' : 'Select Ward:'}</span>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="Ward 1">Ward 1 (प्रभाग १ - गणपती चौक)</option>
            <option value="Ward 2">Ward 2 (प्रभाग २ - मारुती मंदिर परिसर)</option>
            <option value="Ward 3">Ward 3 (प्रभाग ३ - शिवाजी नगर)</option>
            <option value="Ward 4">Ward 4 (प्रभाग ४ - आंबेडकर नगर)</option>
            <option value="Ward 5">Ward 5 (प्रभाग ५ - बाजार पेठ)</option>
            <option value="Ward 6">Ward 6 (प्रभाग ६ - नवीन वस्ती)</option>
          </select>
        </div>
      </div>

      {proposalSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{language === 'mr' ? 'नवीन विकास कामाचा प्रस्ताव ग्रामपंचायतीकडे मंजुरीसाठी यशस्वीरीत्या सादर केला!' : 'Ward development proposal submitted successfully!'}</span>
        </div>
      )}

      {/* Ward Snapshot Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{language === 'mr' ? 'एकूण घरे / मिळकती' : 'Ward Properties'}</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900">{currentWardTaxes.length || 48} घरे</p>
          <span className="text-[10px] text-slate-400 block">{selectedWard} कार्यक्षेत्र</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{language === 'mr' ? 'प्रभाग कर वसुली' : 'Ward Tax Rate'}</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-700">{taxCollectionPercent}%</p>
          <span className="text-[10px] text-slate-400 block">₹ {wardTaxCollected.toLocaleString('en-IN')} / ₹ {wardTaxTotal.toLocaleString('en-IN')}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{language === 'mr' ? 'प्रभागातील तक्रारी' : 'Ward Grievances'}</span>
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-red-700">{currentWardGrievances.length} नोंद</p>
          <span className="text-[10px] text-slate-400 block">{currentWardGrievances.filter(g => g.status === 'resolved').length} सोडवल्या</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{language === 'mr' ? 'सादर केलेले प्रस्ताव' : 'Work Proposals'}</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-700">{currentWardProposals.length} कामे</p>
          <span className="text-[10px] text-slate-400 block">१५ वा वित्त आयोग निधी</span>
        </div>
      </div>

      {/* Main 2-Column Section: Ward Grievances & Ward Infrastructure Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Ward Grievances Redressal & Member Endorsement */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>{language === 'mr' ? `${selectedWard} मधील नागरिकांच्या तक्रारी` : `Citizen Grievances in ${selectedWard}`}</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">({currentWardGrievances.length})</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {currentWardGrievances.length > 0 ? (
              currentWardGrievances.map((g) => (
                <div key={g.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      #{g.ticketNo}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      g.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      g.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {g.status === 'resolved' ? 'निकाली' : g.status === 'in_progress' ? 'प्रगतीपथावर' : 'प्रलंबित'}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900">{g.title}</h4>
                  <p className="text-[11px] text-slate-600">{g.description}</p>
                  
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>नागरिक: <strong>{g.citizenName}</strong> ({g.citizenPhone})</span>
                    <button 
                      onClick={() => alert(language === 'mr' ? `तक्रार #${g.ticketNo} वर सदस्यांची शिफारस नोंदवली!` : `Endorsed ticket #${g.ticketNo}`)}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <ThumbsUp className="w-3 h-3 text-amber-700" />
                      <span>{language === 'mr' ? 'सदस्य शिफारस करा' : 'Endorse to Gram Sevak'}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-600">{language === 'mr' ? 'या वॉर्डमध्ये कोणतीही प्रलंबित तक्रार नाही.' : 'No pending grievances in this ward.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Ward Infrastructure Proposals (प्रभाग विकासकामे प्रस्ताव) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-600" />
                <span>{language === 'mr' ? 'प्रभाग विकासकामे व नवीन प्रस्ताव' : 'Ward Infrastructure Proposals'}</span>
              </h3>
              <p className="text-[11px] text-slate-500">{selectedWard} मधील रस्त्याची, गटार व दिवाबत्तीची कामे</p>
            </div>
            <button
              onClick={() => setShowProposalModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? '+ नवीन प्रस्ताव' : '+ Propose Work'}</span>
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {currentWardProposals.map((p) => (
              <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-xs text-slate-900 flex-1">{p.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                    p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.status === 'approved' ? 'मंजूर (Approved)' : 'ग्रामसभा विचाराधीन'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{p.desc}</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">तारीख: {p.date}</span>
                  <span className="font-extrabold text-emerald-700">अपेक्षित खर्च: ₹ {p.cost.toLocaleString('en-IN')}/-</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: CREATE NEW WARD PROPOSAL */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-600" />
                <span>{language === 'mr' ? `${selectedWard} साठी नवीन विकासकामाचा प्रस्ताव` : `Propose New Work for ${selectedWard}`}</span>
              </h3>
              <button onClick={() => setShowProposalModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'कामाचे शीर्षक / नाव' : 'Work Title'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. गणपती मंदिर ते मारुती चौक सिमेंट काँक्रीट रस्ता"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'अपेक्षित अंदाजित खर्च (₹)' : 'Estimated Cost (₹)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  placeholder="250000"
                  value={proposalCost}
                  onChange={(e) => setProposalCost(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'कामाचे कारण व आवश्यकता' : 'Description & Justification'}
                </label>
                <textarea
                  rows={3}
                  placeholder="या गल्लीतील नागरिकांना पावसाळ्यात येण्या-जाण्यासाठी रस्ता आवश्यक आहे..."
                  value={proposalDesc}
                  onChange={(e) => setProposalDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'ग्रामसभेकडे प्रस्ताव पाठवा' : 'Submit Proposal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
