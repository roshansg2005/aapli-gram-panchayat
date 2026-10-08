import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DevelopmentProject } from '../../types';
import { 
  HardHat, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Building, 
  Image as ImageIcon,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const DesktopDevelopmentWorks: React.FC = () => {
  const { language, t, projects, addProject, updateProject, showToast, currentUser, panchayatInfo } = useApp();

  const currentGp = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const [showAddModal, setShowAddModal] = useState(false);
  const [titleMr, setTitleMr] = useState('');
  const [wardNo, setWardNo] = useState('Ward 1');
  const [allocatedBudget, setAllocatedBudget] = useState(1500000);
  const [contractor, setContractor] = useState('');

  const gpProjects = currentGp
    ? projects.filter(p => matchGramPanchayat(p.gramPanchayat, currentGp))
    : projects;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleMr || !contractor) return;

    addProject({
      titleMr,
      titleEn: titleMr,
      wardNo,
      allocatedBudget,
      spentBudget: 0,
      progressPercentage: 10,
      status: 'in_progress',
      contractor,
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: '2026-12-31',
      gramPanchayat: currentGp,
      photos: ['https://images.unsplash.com/photo-1541888946425-d0fbb18015f6?w=600&auto=format&fit=crop&q=80']
    });

    setTitleMr('');
    setContractor('');
    setShowAddModal(false);
  };

  const handleUpdateProgress = (proj: DevelopmentProject) => {
    const newProgress = Math.min(100, proj.progressPercentage + 25);
    updateProject(proj.id, {
      progressPercentage: newProgress,
      status: newProgress === 100 ? 'completed' : 'in_progress',
      spentBudget: Math.round((proj.allocatedBudget * newProgress) / 100)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with New Project Button */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900">
            {language === 'mr' ? `गाव विकासकामे व १५ वा वित्त आयोग निधी ट्रॅकर - ${currentGp}` : `Village Infrastructure Works & 15th Finance Grants - ${currentGp}`}
          </h3>
          <span className="text-xs text-slate-500">
            {language === 'mr' ? 'मंजूर कामे, कंत्राटदार व प्रगती अहवाल' : 'Approved civil projects and fund tracking'}
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4 text-amber-200" />
          {language === 'mr' ? 'नवीन विकासकाम जोडा' : 'Add New Work'}
        </button>
      </div>

      {/* Projects Grid */}
      {gpProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <HardHat className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800">
            {language === 'mr' ? 'या ग्रामपंचायतीत सद्यस्थितीत कोणतेही विकासकाम नोंदवलेले नाही' : 'No development projects registered yet for this Gram Panchayat'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'mr' ? 'रस्ते, पाणीपुरवठा, पथदिवे किंवा इमारत बांधकाम प्रकल्प नोंदवण्यासाठी वरील बटणावर क्लिक करा.' : 'Click the button above to register civil works, roads, lighting, or water projects.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            {language === 'mr' ? 'पहिले विकासकाम जोडा' : 'Add First Project'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {gpProjects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col space-y-3 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                  📍 {proj.wardNo}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug">
                  {language === 'mr' ? proj.titleMr : proj.titleEn}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'mr' ? 'कंत्राटदार:' : 'Contractor:'} <strong className="text-slate-700">{proj.contractor}</strong>
                </p>
              </div>

              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                proj.status === 'completed' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {proj.status === 'completed' ? (language === 'mr' ? 'काम पूर्ण' : 'Completed') : (language === 'mr' ? 'काम सुरू' : 'In Progress')}
              </span>
            </div>

            {/* Photos */}
            {proj.photos && proj.photos.length > 0 && (
              <div className="flex items-center space-x-2">
                {proj.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt="work preview"
                    className="w-24 h-16 object-cover rounded-lg border border-slate-200"
                  />
                ))}
              </div>
            )}

            {/* Financials & Progress Bar */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'mr' ? 'मंजूर निधी:' : 'Allocated Budget:'}</span>
                <span className="font-bold text-slate-900">₹ {proj.allocatedBudget.toLocaleString('en-IN')}/-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'mr' ? 'वितरित / खर्च निधी:' : 'Disbursed Budget:'}</span>
                <span className="font-bold text-emerald-700">₹ {proj.spentBudget.toLocaleString('en-IN')}/-</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>{language === 'mr' ? 'प्रत्यक्ष भौतिक प्रगती:' : 'Physical Progress:'}</span>
                  <span className="text-orange-600">{proj.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${proj.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Update Progress Button */}
            {proj.progressPercentage < 100 && (
              <button
                onClick={() => handleUpdateProgress(proj)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                {language === 'mr' ? 'प्रगती +२५% वाढवा (Update Milestone)' : 'Update Milestone (+25%)'}
              </button>
            )}
          </div>
        ))}
      </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateProject} className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3.5">
            <h3 className="font-bold text-base text-slate-900">
              {language === 'mr' ? 'नवीन गाव विकासकाम नोंदवा' : 'Add New Village Infrastructure Project'}
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">{language === 'mr' ? 'कामाचे नाव / शीर्षक' : 'Project Title'}</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. वॉर्ड क्र. २ मध्ये सिमेंट काँक्रीट रस्ता"
                  value={titleMr}
                  onChange={(e) => setTitleMr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">{language === 'mr' ? 'वॉर्ड क्रमांक' : 'Ward'}</label>
                  <select
                    value={wardNo}
                    onChange={(e) => setWardNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Ward 1">Ward 1</option>
                    <option value="Ward 2">Ward 2</option>
                    <option value="Ward 3">Ward 3</option>
                    <option value="Ward 4">Ward 4</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">{language === 'mr' ? 'मंजूर निधी (₹)' : 'Budget (₹)'}</label>
                  <input
                    type="number"
                    value={allocatedBudget}
                    onChange={(e) => setAllocatedBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">{language === 'mr' ? 'कंत्राटदाराचे नाव' : 'Contractor Name'}</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. मे. समर्थ कन्स्ट्रक्शन"
                  value={contractor}
                  onChange={(e) => setContractor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
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
                {language === 'mr' ? 'मंजूर करा' : 'Save Project'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
