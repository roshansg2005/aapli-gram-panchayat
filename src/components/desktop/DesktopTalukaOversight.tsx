import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Landmark, 
  TrendingUp, 
  Users, 
  FileCheck, 
  AlertTriangle, 
  Receipt, 
  Send, 
  CheckCircle2, 
  Clock, 
  Search, 
  Award, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  BarChart3,
  Calendar,
  Filter,
  Eye,
  Megaphone
} from 'lucide-react';

interface VillagePerformance {
  name: string;
  population: number;
  taxCollectionRate: number;
  certSlaCompliance: number;
  grievanceResolutionRate: number;
  activeProjects: number;
  sanctionedBudget: number;
  spentBudget: number;
  rank: number;
}

export const DesktopTalukaOversight: React.FC = () => {
  const { language, panchayatInfo, currentUser, certificates, grievances, taxRecords, schemes, projects } = useApp();

  const currentTaluka = currentUser?.taluka || panchayatInfo.talukaMr || 'संगमनेर';
  const currentDistrict = currentUser?.district || panchayatInfo.districtMr || 'अहिल्यानगर';

  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastSubject, setBroadcastSubject] = useState<string>('');
  const [showBroadcastSuccess, setShowBroadcastSuccess] = useState<boolean>(false);
  const [circulars, setCirculars] = useState<Array<{ id: string; date: string; subject: string; message: string; sender: string }>>([
    {
      id: 'cir-01',
      date: '2026-09-05',
      subject: '१५ व्या वित्त आयोगाचा वार्षिक लेखा परीक्षण (Audit) अहवाल सादर करणेबाबत',
      message: 'तालुक्यातील सर्व ग्रामपंचायतींनी १५ व्या वित्त आयोगाच्या निधी विनियोगाचा हिशोब व उपयोगिता प्रमाणपत्र (UC) १५ सप्टेंबरपूर्वी पंचायत समितीकडे सादर करावे.',
      sender: 'गटविकास अधिकारी (BDO), पंचायत समिती'
    },
    {
      id: 'cir-02',
      date: '2026-09-02',
      subject: 'स्वच्छ भारत अभियान अंतर्गत हागणदारीमुक्त प्लस (ODF+) गाव तपासणी मोहीम',
      message: 'तालुक्यातील सर्व सरपंचांनी व ग्रामसेवकांनी गावातील सांडपाणी व घनकचरा व्यवस्थापन प्रकल्पांचे काम वेगाने पूर्ण करावे.',
      sender: 'तालुका समन्वयक, स्वच्छ भारत मिशन'
    }
  ]);

  // Mock aggregated performance data across villages under this Taluka
  const villagesData: VillagePerformance[] = [
    { name: 'घुलेवाडी (Ghulewadi)', population: 14500, taxCollectionRate: 88, certSlaCompliance: 96, grievanceResolutionRate: 92, activeProjects: 4, sanctionedBudget: 3500000, spentBudget: 2800000, rank: 1 },
    { name: 'साकूर (Sakur)', population: 11200, taxCollectionRate: 84, certSlaCompliance: 94, grievanceResolutionRate: 88, activeProjects: 3, sanctionedBudget: 2800000, spentBudget: 2100000, rank: 2 },
    { name: 'निमगाव जाळी (Nimgaon Jali)', population: 9800, taxCollectionRate: 81, certSlaCompliance: 91, grievanceResolutionRate: 85, activeProjects: 3, sanctionedBudget: 2400000, spentBudget: 1900000, rank: 3 },
    { name: 'धांदरफळ (Dhandarphal)', population: 8600, taxCollectionRate: 79, certSlaCompliance: 89, grievanceResolutionRate: 82, activeProjects: 2, sanctionedBudget: 1900000, spentBudget: 1400000, rank: 4 },
    { name: 'जोर्वे (Jorve)', population: 7400, taxCollectionRate: 76, certSlaCompliance: 87, grievanceResolutionRate: 80, activeProjects: 2, sanctionedBudget: 1600000, spentBudget: 1100000, rank: 5 },
    { name: 'आश्वी बुद्रुक (Ashwi Bk)', population: 12100, taxCollectionRate: 74, certSlaCompliance: 85, grievanceResolutionRate: 78, activeProjects: 3, sanctionedBudget: 2900000, spentBudget: 2050000, rank: 6 },
    { name: 'चास (Chas)', population: 6800, taxCollectionRate: 72, certSlaCompliance: 83, grievanceResolutionRate: 76, activeProjects: 2, sanctionedBudget: 1400000, spentBudget: 950000, rank: 7 },
  ];

  const handleSendCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject || !broadcastMessage) return;

    const newCir = {
      id: `cir-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      subject: broadcastSubject,
      message: broadcastMessage,
      sender: currentUser?.name ? `${currentUser.name} (${currentUser.designation || 'BDO'})` : 'गटविकास अधिकारी (BDO)'
    };

    setCirculars([newCir, ...circulars]);
    setBroadcastSubject('');
    setBroadcastMessage('');
    setShowBroadcastSuccess(true);
    setTimeout(() => setShowBroadcastSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Taluka Command Center Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-blue-700/40 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-3 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
              <Building2 className="w-full h-full text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {language === 'mr' ? 'तालुका पंचायत समिती नियंत्रण कक्ष' : 'Taluka Panchayat Samiti Oversight Hub'}
                </span>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-200 px-2.5 py-0.5 rounded-full">
                  गटविकास अधिकारी (BDO Dashboard)
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                {language === 'mr' ? `तालुका: ${currentTaluka} • जिल्हा: ${currentDistrict}` : `Taluka: ${currentTaluka} • District: ${currentDistrict}`}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'mr' ? 'तालुक्यातील सर्व ग्रामपंचायतींचे कामकाज, कर संकलन, विकासकामे व दाखले नियंत्रण' : 'Supervising all Gram Panchayats across the Taluka'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] text-slate-300 block">{language === 'mr' ? 'एकूण ग्रामपंचायती' : 'Total Gram Panchayats'}</span>
              <span className="text-lg font-black text-amber-300">७८ गावे</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Taluka Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{language === 'mr' ? 'सरासरी कर वसुली' : 'Avg Tax Collection'}</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-700">७९.४%</p>
          <span className="text-[10px] text-slate-400 block">चालू आर्थिक वर्ष २०२६-२७</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{language === 'mr' ? 'दाखले SLA वेळेत पूर्तता' : 'Certificates SLA Rate'}</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-blue-700">९१.२%</p>
          <span className="text-[10px] text-slate-400 block">सरासरी २.१ दिवसांत वितरण</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{language === 'mr' ? 'तक्रार निवारण दर' : 'Grievance Resolution'}</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-purple-700">८४.५%</p>
          <span className="text-[10px] text-slate-400 block">१,४२० पैकी १,२०० तक्रारी निकाली</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{language === 'mr' ? 'विकास निधी विनियोग' : 'Fund Utilization'}</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-700">₹ १६.५ कोटी</p>
          <span className="text-[10px] text-slate-400 block">१५ वा वित्त आयोग + DPDC</span>
        </div>
      </div>

      {/* Village Performance Scorecard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{language === 'mr' ? 'तालुक्यातील ग्रामपंचायतींची कामगिरी व क्रमवारी (Village Scorecard)' : 'Gram Panchayat Performance Ranking'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'mr' ? 'कर वसुली, दाखले वाटप व विकासकामांच्या आधारे तालुकास्तरीय मूल्यांकन' : 'Comparative performance index based on key indicators'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'mr' ? 'गाव शोधा...' : 'Search village...'}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3"># क्रमांक</th>
                <th className="p-3">ग्रामपंचायत (गाव)</th>
                <th className="p-3">लोकसंख्या</th>
                <th className="p-3">कर संकलन %</th>
                <th className="p-3">दाखले SLA %</th>
                <th className="p-3">तक्रार निवारण %</th>
                <th className="p-3">विकास निधी खर्च</th>
                <th className="p-3 text-center">स्थिती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {villagesData.map((v) => (
                <tr key={v.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-black ${
                      v.rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      v.rank === 2 ? 'bg-slate-200 text-slate-700' :
                      v.rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {v.rank}
                    </span>
                  </td>
                  <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-blue-600" />
                    <span>{v.name}</span>
                  </td>
                  <td className="p-3 text-slate-600">{v.population.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700">{v.taxCollectionRate}%</span>
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${v.taxCollectionRate}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-blue-700">{v.certSlaCompliance}%</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-purple-700">{v.grievanceResolutionRate}%</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-slate-800">₹ {(v.spentBudget / 100000).toFixed(1)} लाख</span>
                    <span className="text-[10px] text-slate-400 block">मंजूर: ₹ {(v.sanctionedBudget / 100000).toFixed(1)}L</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      v.rank <= 3 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {v.rank <= 3 ? 'उत्कृष्ट (A Grade)' : 'चांगली (B Grade)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Directives & Circulars Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form: Issue Official Directive */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'mr' ? 'तालुकास्तरीय अधिकृत परिपत्रक / आदेश जारी करा' : 'Issue Taluka Directive / Circular'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'mr' ? 'तालुक्यातील सर्व सरपंचांना व ग्रामसेवकांना तत्काळ सूचना पाठवा' : 'Broadcast official directives to all Gram Panchayats'}
              </p>
            </div>
          </div>

          {showBroadcastSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'mr' ? 'परिपत्रक सर्व ग्रामपंचायतींच्या डॅशबोर्डवर यशस्वीरीत्या प्रसिद्ध झाले!' : 'Circular broadcasted successfully!'}</span>
            </div>
          )}

          <form onSubmit={handleSendCircular} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'परिपत्रकाचा विषय (Subject)' : 'Subject'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="उदा. ग्रामसभा ठराव व जलजीवन मिशन कामांचा आढावा"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'तपशीलवार आदेश / परिपत्रक संदेश (Message Body)' : 'Detailed Directive / Instructions'} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="सर्व ग्रामसेवकांनी चालू महिन्यातील विकास निधीचा विनियोग अहवाल तातडीने सादर करावा..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>{language === 'mr' ? 'सर्व ग्रामपंचायतींना परिपत्रक जारी करा' : 'Broadcast to All Villages'}</span>
            </button>
          </form>
        </div>

        {/* List of Issued Circulars */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{language === 'mr' ? 'सक्रिय परिपत्रके व आदेश सूची' : 'Issued Circulars & Directives'}</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">({circulars.length})</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {circulars.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">{c.date}</span>
                  <span>{c.sender}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">{c.subject}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{c.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
