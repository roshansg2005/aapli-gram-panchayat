import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Grievance, GrievanceStatus } from '../../types';
import { 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Filter,
  MessageSquare,
  ChevronRight,
  Send,
  Eye,
  Layers,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const DesktopGrievanceDesk: React.FC = () => {
  const { 
    language, 
    t, 
    currentUser,
    grievances, 
    updateGrievance, 
    showToast,
    triggerConfetti 
  } = useApp();

  const currentGp = currentUser?.gramPanchayat;
  const gpGrievances = currentGp ? grievances.filter(g => matchGramPanchayat(g.gramPanchayat, currentGp)) : grievances;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrv, setSelectedGrv] = useState<Grievance | null>(gpGrievances[0] || null);

  // Field officer assignment state
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [resolutionRemarks, setResolutionRemarks] = useState('');

  const officersList = [
    { name: 'पाणीपुरवठा विभाग अधिकारी', role: 'पाणीपुरवठा विभाग', phone: '१८००-१२०-८०४०' },
    { name: 'इलेक्ट्रिकल व दिवाबत्ती विभाग', role: 'इलेक्ट्रिकल व पथदिवे', phone: '१८००-१२०-८०४०' },
    { name: 'स्वच्छता व कचरा व्यवस्थापन', role: 'स्वच्छता व घनकचरा', phone: '१८००-१२०-८०४०' },
    { name: 'बांधकाम व रस्ते शाखा', role: 'रस्ते व बांधकाम', phone: '१८००-१२०-८०४०' },
  ];

  const filteredGrievances = gpGrievances.filter(g => {
    const matchesCat = selectedCategory === 'all' || g.category === selectedCategory;
    const matchesSearch = 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.ticketNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAssignOfficer = (officer: typeof officersList[0]) => {
    if (!selectedGrv) return;
    updateGrievance(selectedGrv.id, {
      status: 'assigned',
      assignedOfficer: `${officer.name} (${officer.role})`,
      assignedOfficerPhone: officer.phone
    });
    setSelectedGrv(prev => prev ? {
      ...prev,
      status: 'assigned',
      assignedOfficer: `${officer.name} (${officer.role})`,
      assignedOfficerPhone: officer.phone
    } : null);
  };

  const handleResolveGrievance = () => {
    if (!selectedGrv) return;
    const remarks = resolutionRemarks || (language === 'mr' ? 'समस्येचे प्रत्यक्ष जागेवर जाऊन निवारण करण्यात आले आहे.' : 'Issue resolved on site.');
    
    updateGrievance(selectedGrv.id, {
      status: 'resolved',
      resolutionRemarks: remarks,
      resolutionPhotoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80'
    });

    setSelectedGrv(prev => prev ? {
      ...prev,
      status: 'resolved',
      resolutionRemarks: remarks,
      resolutionPhotoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
      resolvedDate: new Date().toISOString().split('T')[0]
    } : null);

    setResolutionRemarks('');
    triggerConfetti();
  };

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'water': return language === 'mr' ? 'पाणीपुरवठा' : 'Water Supply';
      case 'streetlight': return language === 'mr' ? 'पथदिवे' : 'Streetlights';
      case 'sanitation': return language === 'mr' ? 'कचरा व स्वच्छता' : 'Sanitation';
      case 'roads': return language === 'mr' ? 'रस्ते व गटार' : 'Roads & Drains';
      case 'encroachment': return language === 'mr' ? 'अतिक्रमण' : 'Encroachment';
      case 'health': return language === 'mr' ? 'धुरफवारणी व आरोग्य' : 'Health & Fogging';
      case 'other': return language === 'mr' ? 'इतर तक्रार / समस्या' : 'Other Complaint';
      default: return cat;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'mr' ? 'तक्रार क्र., विषय किंवा नागरिकाचे नाव शोधा...' : 'Search ticket no, title, citizen name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
          >
            <option value="all">{language === 'mr' ? 'सर्व विभाग' : 'All Categories'}</option>
            <option value="water">{language === 'mr' ? 'पाणीपुरवठा' : 'Water Supply'}</option>
            <option value="streetlight">{language === 'mr' ? 'पथदिवे' : 'Streetlights'}</option>
            <option value="sanitation">{language === 'mr' ? 'कचरा व स्वच्छता' : 'Sanitation'}</option>
            <option value="roads">{language === 'mr' ? 'रस्ते व गटार' : 'Roads & Drains'}</option>
            <option value="encroachment">{language === 'mr' ? 'अतिक्रमण' : 'Encroachment'}</option>
            <option value="health">{language === 'mr' ? 'धुरफवारणी व आरोग्य' : 'Health & Fogging'}</option>
            <option value="other">{language === 'mr' ? 'इतर तक्रार' : 'Other Complaints'}</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {language === 'mr' ? 'सक्रिय तक्रारी:' : 'Active Tickets:'} <strong className="text-slate-900">{filteredGrievances.length}</strong>
        </span>
      </div>

      {/* Two Column Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left Column: Tickets List (5 cols) */}
        <div className="col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-700 flex justify-between">
            <span>{language === 'mr' ? 'तक्रारींची यादी' : 'Complaints Feed'}</span>
            <span>{language === 'mr' ? 'स्थिती' : 'Status'}</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredGrievances.map((grv) => {
              const isSelected = selectedGrv?.id === grv.id;

              return (
                <div
                  key={grv.id}
                  onClick={() => setSelectedGrv(grv)}
                  className={`p-3.5 cursor-pointer transition-colors text-xs ${
                    isSelected 
                      ? 'bg-orange-50/80 border-l-4 border-orange-600' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      #{grv.ticketNo}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      grv.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      grv.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      grv.status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {grv.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 mt-1 line-clamp-1">
                    {grv.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>📍 {grv.wardNo}</span>
                    <span>{grv.citizenName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Triage & Action Workspace (7 cols) */}
        {selectedGrv ? (
          <div className="col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-gov-navy text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-mono text-amber-400 block">
                  TICKET #{selectedGrv.ticketNo} • {selectedGrv.submittedDate}
                </span>
                <h3 className="font-bold text-sm mt-0.5 max-w-md truncate">
                  {selectedGrv.title}
                </h3>
              </div>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                selectedGrv.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
              }`}>
                {selectedGrv.status}
              </span>
            </div>

            {/* Ticket Content */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {/* Citizen Details Card */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block">{language === 'mr' ? 'तक्रारदार नागरिक:' : 'Citizen Name:'}</span>
                  <span className="font-bold text-slate-800">{selectedGrv.citizenName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">{language === 'mr' ? 'संपर्क क्रमांक:' : 'Contact Phone:'}</span>
                  <a href={`tel:${selectedGrv.citizenPhone}`} className="font-bold text-orange-600 flex items-center gap-1 hover:underline">
                    <Phone className="w-3 h-3" />
                    {selectedGrv.citizenPhone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">{language === 'mr' ? 'वॉर्ड व लोकेशन:' : 'Ward & Location:'}</span>
                  <span className="font-bold text-slate-800">{selectedGrv.wardNo} • {selectedGrv.locationDetails}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">{language === 'mr' ? 'विभाग:' : 'Department:'}</span>
                  <span className="font-bold text-blue-700">{getCategoryName(selectedGrv.category)}</span>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <h4 className="font-bold text-slate-800 mb-1">{language === 'mr' ? 'तक्रारीचा सविस्तर तपशील:' : 'Issue Description:'}</h4>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedGrv.description}
                </p>
              </div>

              {/* Photo Evidence */}
              {selectedGrv.photoUrl && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">{language === 'mr' ? 'नागरिकाने जोडलेला फोटो पुरावा:' : 'Uploaded Issue Photo:'}</h4>
                  <img
                    src={selectedGrv.photoUrl}
                    alt="Citizen proof"
                    className="w-full h-44 object-cover rounded-xl border border-slate-300"
                  />
                </div>
              )}

              {/* Officer Assignment Action */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-600" />
                  {language === 'mr' ? 'वॉर्ड अधिकारी नियुक्ती (Assign Field Supervisor):' : 'Assign Field Supervisor:'}
                </h4>

                {selectedGrv.assignedOfficer ? (
                  <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">✓ नियुक्त अधिकारी: {selectedGrv.assignedOfficer}</span>
                      <span className="text-[11px] text-purple-700">फोन: {selectedGrv.assignedOfficerPhone}</span>
                    </div>
                    <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-bold">
                      ASSIGNED
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {officersList.map((officer) => (
                      <button
                        key={officer.name}
                        onClick={() => handleAssignOfficer(officer)}
                        className="p-2 bg-white hover:bg-purple-50 border border-slate-300 hover:border-purple-400 rounded-lg text-left transition-all text-xs"
                      >
                        <div className="font-bold text-slate-900">{officer.name}</div>
                        <div className="text-[10px] text-slate-500">{officer.role}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Resolution Status if Resolved */}
              {selectedGrv.status === 'resolved' && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{language === 'mr' ? 'तक्रार निवारण पूर्ण झाले आहे!' : 'Grievance Resolved Successfully!'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    {selectedGrv.resolutionRemarks}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Resolution Action Bar */}
            {selectedGrv.status !== 'resolved' && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={language === 'mr' ? 'निवारण शेरा टाका (उदा. दुरुस्ती पूर्ण झाली, दिवे सुरू केले)...' : 'Enter resolution remarks...'}
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleResolveGrievance}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    {language === 'mr' ? 'निवारण पूर्ण करा' : 'Mark Resolved'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
