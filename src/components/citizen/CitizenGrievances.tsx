import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { GrievanceCategory, Grievance } from '../../types';
import { 
  AlertCircle, 
  PlusCircle, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Image as ImageIcon, 
  ChevronRight, 
  ShieldCheck, 
  Droplets, 
  Lightbulb, 
  Trash2, 
  Construction, 
  Sparkles,
  Inbox,
  HelpCircle,
  UploadCloud,
  X,
  FileImage
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const CitizenGrievances: React.FC = () => {
  const { 
    language, 
    grievances, 
    addGrievance,
    currentUser,
    panchayatInfo 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'lodge' | 'my-complaints'>('lodge');

  const currentGpName = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const currentTaluka = currentUser?.taluka || panchayatInfo.talukaMr;
  const currentDistrict = currentUser?.district || panchayatInfo.districtMr;

  // Form State
  const [category, setCategory] = useState<GrievanceCategory>('water');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wardNo, setWardNo] = useState(currentUser?.wardNo || 'Ward 1');
  const [locationDetails, setLocationDetails] = useState('');
  const [citizenName, setCitizenName] = useState(currentUser?.name || '');
  const [citizenPhone, setCitizenPhone] = useState(currentUser?.phone || '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (currentUser) {
      setCitizenName(currentUser.name);
      setCitizenPhone(currentUser.phone);
      if (currentUser.wardNo) setWardNo(currentUser.wardNo);
    }
  }, [currentUser]);

  // Filter only this citizen's grievances in current Gram Panchayat
  const myGrievances = grievances.filter(g => 
    matchGramPanchayat(g.gramPanchayat, currentGpName) &&
    (!currentUser?.phone || g.citizenPhone === currentUser.phone || (currentUser?.name && g.citizenName.toLowerCase() === currentUser.name.toLowerCase()))
  );

  const categories: { id: GrievanceCategory; labelMr: string; labelEn: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'water', labelMr: 'पाणीपुरवठा व गळती', labelEn: 'Water Supply & Leakage', icon: Droplets },
    { id: 'streetlight', labelMr: 'पथदिवे व वीज समस्या', labelEn: 'Streetlights & Poles', icon: Lightbulb },
    { id: 'sanitation', labelMr: 'कचरा व स्वच्छता', labelEn: 'Garbage & Sanitation', icon: Trash2 },
    { id: 'roads', labelMr: 'रस्ते खड्डे व गटारे', labelEn: 'Roads, Potholes & Drains', icon: Construction },
    { id: 'encroachment', labelMr: 'अतिक्रमण व रस्ता अडथळा', labelEn: 'Encroachments', icon: AlertCircle },
    { id: 'health', labelMr: 'धुरफवारणी व आरोग्य', labelEn: 'Health & Fogging', icon: ShieldCheck },
    { id: 'other', labelMr: 'इतर तक्रार / समस्या', labelEn: 'Other Complaints', icon: HelpCircle },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'mr' ? 'कृपया ५MB पेक्षा लहान फोटो निवडा.' : 'Please select an image smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
          setPhotoFileName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    setPhotoFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !citizenName || !citizenPhone || !locationDetails) {
      alert(language === 'mr' ? 'कृपया सर्व आवश्यक माहिती भरा.' : 'Please fill all mandatory fields.');
      return;
    }

    addGrievance({
      category,
      title,
      description,
      wardNo,
      locationDetails,
      gramPanchayat: currentGpName,
      taluka: currentTaluka,
      district: currentDistrict,
      citizenName,
      citizenPhone,
      photoUrl: photoUrl || undefined
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setLocationDetails('');
    setPhotoUrl(null);
    setPhotoFileName('');
    setActiveSubTab('my-complaints');
  };

  const getStatusBadge = (status: Grievance['status']) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {language === 'mr' ? 'निवारण झाले' : 'Resolved'}
          </span>
        );
      case 'in_progress':
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-300">
            <Clock className="w-3 h-3 text-blue-600" />
            {language === 'mr' ? 'प्रक्रिया सुरू' : 'In Progress'}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-300">
            <AlertCircle className="w-3 h-3 text-red-600" />
            {language === 'mr' ? 'नाकारली' : 'Rejected'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            {language === 'mr' ? 'दाखल' : 'Submitted'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-700 rounded-2xl p-4 text-white shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white/10 rounded-xl">
            <AlertCircle className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base">{language === 'mr' ? 'तक्रार निवारण कक्ष' : 'Citizen Grievance Redressal'}</h2>
            <p className="text-[11px] text-orange-100">{currentGpName} • {language === 'mr' ? 'गावातील समस्या थेट ग्रामपंचायतीकडे नोंदवा' : 'Report local issues directly'}</p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('lodge')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'lodge'
              ? 'bg-white text-orange-700 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {language === 'mr' ? 'नवीन तक्रार नोंदवा' : 'Lodge Grievance'}
        </button>
        <button
          onClick={() => setActiveSubTab('my-complaints')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'my-complaints'
              ? 'bg-white text-orange-700 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {language === 'mr' ? 'माझ्या तक्रारी' : 'My Complaints'} ({myGrievances.length})
        </button>
      </div>

      {/* Tab 1: Lodge Grievance Form */}
      {activeSubTab === 'lodge' ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              {language === 'mr' ? 'तक्रारीचा प्रकार निवडा' : 'Select Category'} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/80 ring-2 ring-orange-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs ${isSelected ? 'font-black text-orange-950' : 'font-semibold text-slate-700'}`}>
                      {language === 'mr' ? cat.labelMr : cat.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'तक्रारीचा मुख्य विषय' : 'Grievance Title'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={category === 'other' ? (language === 'mr' ? 'उदा. सार्वजनिक जागेची स्वच्छता / इतर समस्या' : 'e.g. Public place cleaning or other local issue') : 'उदा. मारुती मंदिर चौकातील ४ पथदिवे बंद आहेत'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'तक्रारीचे सविस्तर वर्णन' : 'Description'} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder={language === 'mr' ? 'तक्रारीचे सविस्तर वर्णन, अडचण व माहिती येथे लिहा...' : 'Provide complete description of the issue...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'वॉर्ड क्रमांक' : 'Ward Number'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={wardNo}
                  onChange={(e) => setWardNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
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
                  {language === 'mr' ? 'समस्येचे अचूक ठिकाण' : 'Exact Location'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="उदा. प्राथमिक शाळेजवळ, घर क्र. १२ शेजारी"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'तक्रारदाराचे नाव' : 'Citizen Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'मोबाइल क्रमांक' : 'Mobile Number'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Photo Attachment & Upload Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>{language === 'mr' ? 'समस्येचा फोटो जोडा (ऐच्छिक)' : 'Attach Issue Photo (Optional)'}</span>
                <span className="text-[10px] text-slate-400 font-normal">JPG, PNG, WebP (Max 5MB)</span>
              </label>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {photoUrl ? (
                /* Photo Preview Card */
                <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <img 
                      src={photoUrl} 
                      alt="Grievance proof" 
                      className="w-14 h-14 rounded-xl object-cover border border-emerald-400 shrink-0 shadow-xs" 
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-emerald-950 block truncate">
                        {photoFileName || (language === 'mr' ? 'तक्रारीचा फोटो जोडला आहे' : 'Grievance_Proof.jpg')}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {language === 'mr' ? 'फोटो यशस्वीरीत्या संलग्न केला' : 'Photo Attached Successfully'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all"
                    >
                      {language === 'mr' ? 'बदला' : 'Change'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all"
                      title={language === 'mr' ? 'फोटो काढा' : 'Remove Photo'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Drop Area */
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-4 text-center bg-slate-50/70 hover:bg-orange-50/40 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-orange-700">
                      {language === 'mr' ? '📷 फोटो निवडा किंवा कॅमेऱ्याने फोटो काढा' : '📷 Choose Photo or Take with Camera'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {language === 'mr' ? 'मोबाईल गॅलरी किंवा कॉम्प्युटरमधून फोटो अपलोड करा' : 'Upload photo evidence of the issue directly'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{language === 'mr' ? 'तक्रार दाखल करा' : 'Submit Grievance'}</span>
          </button>
        </form>
      ) : (
        /* Tab 2: My Grievances List */
        <div className="space-y-3">
          {myGrievances.length > 0 ? (
            myGrievances.map((grv) => (
              <div
                key={grv.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5 transition-all hover:border-slate-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        #{grv.ticketNo}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                        {grv.category}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs md:text-sm text-slate-900 mt-1">
                      {grv.title}
                    </h4>
                  </div>
                  {getStatusBadge(grv.status)}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
                  {grv.description}
                </p>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>📍 {grv.locationDetails} ({grv.wardNo})</span>
                  <span>{grv.submittedDate}</span>
                </div>

                {grv.assignedOfficer && (
                  <div className="bg-blue-50 p-2.5 rounded-xl text-xs text-blue-900 flex items-center justify-between border border-blue-200">
                    <span className="font-medium">नियुक्त अधिकारी: <strong>{grv.assignedOfficer}</strong></span>
                    {grv.assignedOfficerPhone && (
                      <a href={`tel:${grv.assignedOfficerPhone}`} className="text-blue-700 font-bold underline">
                        कॉल करा
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-500 space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">
                {language === 'mr' ? 'आपली कोणतीही प्रलंबित तक्रार नाही' : 'No active grievances registered'}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'mr' ? 'गावातील कोणत्याही समस्येसाठी वरील "नवीन तक्रार नोंदवा" टॅब वापरा.' : 'Use "Lodge Grievance" above to report an issue.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
