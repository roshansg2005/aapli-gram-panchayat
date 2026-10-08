import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Landmark, 
  Home, 
  Award,
  Building,
  UserCheck,
  Search,
  Filter,
  CreditCard,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { 
  matchGramPanchayat, 
  matchTaluka, 
  formatGramPanchayat, 
  formatTaluka, 
  formatDistrict, 
  getCanonicalLocationKey 
} from '../../utils/jurisdiction';
import { formatUserName, formatDesignation } from '../../utils/nameLocalization';

export const DesktopVillageDirectory: React.FC = () => {
  const { language, t, officials, panchayatInfo, currentUser, users } = useApp();

  const [activeTab, setActiveTab] = useState<'citizens' | 'officials' | 'wards'>('citizens');
  const [searchCitizen, setSearchCitizen] = useState<string>('');

  // Operator Authority Tier
  const isSuperAdmin = currentUser?.role === 'admin';
  const isTalukaBDO = currentUser?.role === 'taluka_bdo';
  const isPanchayatLeader = ['sarpanch', 'upsarpanch', 'gram_sevak', 'sadasya', 'tax_clerk', 'staff'].includes(currentUser?.role || '');

  const userDistrict = currentUser?.district || 'अहिल्यानगर';
  const userTaluka = currentUser?.taluka || 'संगमनेर';
  const userGp = currentUser?.gramPanchayat && !currentUser.gramPanchayat.includes('सर्व') ? currentUser.gramPanchayat : '';

  // Extract unique bilingual Gram Panchayats from users
  const availableGps = useMemo(() => {
    const map = new Map<string, { key: string; label: string; raw: string }>();
    users.forEach(u => {
      if (!u.gramPanchayat || u.gramPanchayat.includes('सर्व ग्रामपंचायती')) return;
      if (isTalukaBDO && !matchTaluka(u.taluka, userTaluka)) return;
      const key = getCanonicalLocationKey(u.gramPanchayat);
      if (key && !map.has(key)) {
        map.set(key, {
          key,
          label: formatGramPanchayat(u.gramPanchayat, language),
          raw: u.gramPanchayat
        });
      }
    });
    return Array.from(map.values());
  }, [users, language, isTalukaBDO, userTaluka]);

  // Selected GP filter state (Defaults to userGp for Sarpanch, 'all' for Super Admin / BDO)
  const [selectedGpFilter, setSelectedGpFilter] = useState<string>(
    isPanchayatLeader && userGp ? userGp : 'all'
  );

  // Active Display Location
  const activeGpName = useMemo(() => {
    if (selectedGpFilter !== 'all') {
      return formatGramPanchayat(selectedGpFilter, language);
    }
    if (isPanchayatLeader && userGp) {
      return formatGramPanchayat(userGp, language);
    }
    return language === 'mr' ? 'सर्व समाविष्ट ग्रामपंचायती (महाराष्ट्र)' : 'All Gram Panchayats (Maharashtra)';
  }, [selectedGpFilter, isPanchayatLeader, userGp, language]);

  const activeTaluka = useMemo(() => {
    return formatTaluka(isTalukaBDO ? userTaluka : (currentUser?.taluka || 'संगमनेर'), language);
  }, [isTalukaBDO, userTaluka, currentUser, language]);

  const activeDistrict = useMemo(() => {
    return formatDistrict(currentUser?.district || 'अहिल्यानगर', language);
  }, [currentUser, language]);

  // Registered Citizens strictly scoped to the active GP filter & role
  const registeredCitizens = useMemo(() => {
    return users.filter(u => {
      if (u.role !== 'citizen') return false;
      if (isTalukaBDO && !matchTaluka(u.taluka, userTaluka)) return false;
      if (selectedGpFilter !== 'all') return matchGramPanchayat(u.gramPanchayat, selectedGpFilter);
      if (isPanchayatLeader && userGp) return matchGramPanchayat(u.gramPanchayat, userGp);
      return true;
    });
  }, [users, selectedGpFilter, isTalukaBDO, userTaluka, isPanchayatLeader, userGp]);

  const filteredCitizens = useMemo(() => {
    if (!searchCitizen) return registeredCitizens;
    const q = searchCitizen.toLowerCase();
    return registeredCitizens.filter(c => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.aadhaar && c.aadhaar.includes(q)) ||
        (c.houseNo && c.houseNo.toLowerCase().includes(q)) ||
        (c.wardNo && c.wardNo.toLowerCase().includes(q)) ||
        (c.gramPanchayat && c.gramPanchayat.toLowerCase().includes(q))
      );
    });
  }, [registeredCitizens, searchCitizen]);

  // Officials & Staff based on active GP scope
  const displayOfficials = useMemo(() => {
    const staffFromUsers = users.filter(u => {
      if (u.role === 'citizen') return false;
      if (isTalukaBDO && !matchTaluka(u.taluka, userTaluka)) return false;
      if (selectedGpFilter !== 'all') return matchGramPanchayat(u.gramPanchayat, selectedGpFilter);
      if (isPanchayatLeader && userGp) return matchGramPanchayat(u.gramPanchayat, userGp);
      return true;
    }).map(s => ({
      id: s.id,
      nameMr: s.name,
      nameEn: s.name,
      designationMr: s.designation || (s.role === 'sarpanch' ? 'सरपंच (Sarpanch)' : s.role === 'gram_sevak' ? 'ग्रामविकास अधिकारी (Gram Sevak)' : s.role === 'taluka_bdo' ? 'गटविकास अधिकारी (BDO)' : 'कर्मचारी'),
      designationEn: s.designation || (s.role === 'sarpanch' ? 'Sarpanch' : s.role === 'gram_sevak' ? 'Gram Sevak' : s.role === 'taluka_bdo' ? 'BDO' : 'Staff'),
      phone: s.phone,
      email: s.email,
      wardNo: s.wardNo,
      photoUrl: s.avatarUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
      roleType: (s.role === 'sarpanch' || s.role === 'upsarpanch' || s.role === 'sadasya') ? 'elected' as const : 'administration' as const,
      gramPanchayat: s.gramPanchayat
    }));

    return staffFromUsers.length > 0 ? staffFromUsers : officials;
  }, [users, selectedGpFilter, isTalukaBDO, userTaluka, isPanchayatLeader, userGp, officials]);

  // Ward Demographics
  const wardsData = useMemo(() => {
    const totalWards = 6;
    return Array.from({ length: totalWards }, (_, i) => {
      const wNum = i + 1;
      const wardName = `Ward ${wNum}`;
      const wardCitizens = registeredCitizens.filter(c => 
        (c.wardNo && (c.wardNo.includes(`${wNum}`) || c.wardNo.toLowerCase().includes(`ward ${wNum}`)))
      );
      const wardStaff = displayOfficials.find(o => 
        o.wardNo && (o.wardNo.includes(`${wNum}`) || o.wardNo.toLowerCase().includes(`ward ${wNum}`))
      );
      
      const estimatedPop = wardCitizens.length > 0 ? wardCitizens.length * 5 : 850;
      const households = wardCitizens.length > 0 ? wardCitizens.length : 180;

      return {
        wardNo: wardName,
        areaName: `${activeGpName} - ${language === 'mr' ? 'प्रभाग क्र.' : 'Ward No.'} ${wNum}`,
        population: estimatedPop,
        households: households,
        member: wardStaff?.nameMr || (language === 'mr' ? `प्रभाग सदस्य (वॉर्ड ${wNum})` : `Ward Representative (${wNum})`)
      };
    });
  }, [registeredCitizens, displayOfficials, activeGpName, language]);

  const totalCalculatedPop = useMemo(() => {
    return registeredCitizens.length > 0 ? registeredCitizens.length * 5 : (selectedGpFilter === 'all' ? 14500 : 8500);
  }, [registeredCitizens, selectedGpFilter]);

  return (
    <div className="space-y-6">
      {/* Village Profile Header Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-3 text-white flex items-center justify-center shadow-lg shrink-0">
            <Landmark className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                {language === 'mr' ? 'ग्रामपंचायत कार्यक्षेत्र प्रोफाइल' : 'Panchayat Jurisdiction Profile'}
              </span>
              {selectedGpFilter !== 'all' && (
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {language === 'mr' ? 'स्थानिक GP' : 'Local GP'}
                </span>
              )}
            </div>
            <h3 className="font-black text-xl text-slate-900 mt-1">
              {activeGpName}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'mr' 
                ? `तालुका: ${activeTaluka} • जिल्हा: ${activeDistrict} • पिनकोड: ${panchayatInfo.pincode}` 
                : `Taluka: ${activeTaluka} • Dist: ${activeDistrict} • Pincode: ${panchayatInfo.pincode}`}
            </p>
          </div>
        </div>

        {/* GP Selector & Stats */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 w-full lg:w-auto justify-between lg:justify-end">
          {/* GP Filter Dropdown for Super Admin & BDO */}
          {(isSuperAdmin || isTalukaBDO) && availableGps.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-orange-500" />
              <select
                value={selectedGpFilter}
                onChange={(e) => setSelectedGpFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">🏡 {language === 'mr' ? 'सर्व ग्रामपंचायती (All GPs)' : 'All Gram Panchayats'}</option>
                {availableGps.map(g => (
                  <option key={g.key} value={g.key}>{g.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold">{language === 'mr' ? 'नोंदणीकृत नागरिक' : 'Registered Citizens'}</span>
            <span className="font-black text-lg text-orange-600">{registeredCitizens.length}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold">{language === 'mr' ? 'अंदाजे लोकसंख्या' : 'Population'}</span>
            <span className="font-extrabold text-sm text-slate-900">{totalCalculatedPop.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold">{language === 'mr' ? 'एकूण वॉर्ड' : 'Wards'}</span>
            <span className="font-extrabold text-sm text-emerald-600">6</span>
          </div>
        </div>
      </div>

      {/* Directory Sub-Tabs */}
      <div className="flex space-x-3 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('citizens')}
          className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'citizens'
              ? 'border-orange-600 text-orange-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{language === 'mr' ? 'नोंदणीकृत नागरिक यादी' : 'Registered Citizens'} ({registeredCitizens.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('officials')}
          className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'officials'
              ? 'border-orange-600 text-orange-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'mr' ? 'प्रशासकीय अधिकारी व लोकप्रतिनिधी' : 'Officials & Staff'} ({displayOfficials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wards')}
          className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'wards'
              ? 'border-orange-600 text-orange-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>{language === 'mr' ? 'वॉर्ड रचना व सदस्य' : 'Ward Demographics'}</span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'citizens' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Search bar for citizens */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'mr' ? 'नागरिकाचे नाव, फोन, आधार किंवा GP द्वारे शोधा...' : 'Search by name, phone, aadhaar or GP...'}
                value={searchCitizen}
                onChange={(e) => setSearchCitizen(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <span className="text-xs text-slate-500 font-medium">
              {filteredCitizens.length} {language === 'mr' ? 'नागरिक नोंद सापडली' : 'records found'}
            </span>
          </div>

          {filteredCitizens.length === 0 ? (
            <div className="p-12 text-center space-y-2 text-slate-500">
              <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-sm text-slate-700">
                {language === 'mr' ? 'या कार्यक्षेत्रात कोणतेही नागरिक आढळले नाहीत' : 'No registered citizens found in this jurisdiction'}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'mr' ? 'कृपया वरील फिल्टर तपासा किंवा नवीन नागरिक नोंदणी करा.' : 'Please check your filter or register new citizen accounts.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">नागरिकाचे नाव (Citizen Name)</th>
                    <th className="px-4 py-3">मोबाइल क्रमांक (Mobile)</th>
                    <th className="px-4 py-3">आधार क्रमांक (Aadhaar)</th>
                    <th className="px-4 py-3">वॉर्ड व घर क्र. (Ward / House)</th>
                    <th className="px-4 py-3">ग्रामपंचायत (Gram Panchayat)</th>
                    <th className="px-4 py-3 text-center">स्थिती (Status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCitizens.map((citizen) => (
                    <tr key={citizen.id} className="hover:bg-orange-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {citizen.name.charAt(0)}
                          </div>
                          <div>
                            <strong className="block text-slate-900 font-bold">{formatUserName(citizen.name, language)}</strong>
                            <span className="text-[10px] text-slate-400">{citizen.email || 'Email not added'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {citizen.phone}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {citizen.aadhaar || 'XXXX-XXXX-9999'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800">{citizen.houseNo || '-'}</span>
                        <span className="text-slate-400 block text-[10px]">{citizen.wardNo || 'Ward 1'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                          <span>{formatGramPanchayat(citizen.gramPanchayat, language) || activeGpName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {[formatTaluka(citizen.taluka, language), formatDistrict(citizen.district, language)].filter(Boolean).join(' • ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          प्रमाणित (Verified)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'officials' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayOfficials.map((official) => (
            <div
              key={official.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center space-x-3.5 hover:shadow-md transition-shadow"
            >
              <img
                src={official.photoUrl}
                alt={official.nameEn}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700 truncate block">
                  {formatDesignation(language === 'mr' ? official.designationMr : official.designationEn, language)}
                </span>
                <h4 className="font-bold text-xs text-slate-900 mt-1 truncate">
                  {formatUserName(official.nameMr || official.nameEn, language)}
                </h4>
                {official.gramPanchayat && (
                  <span className="text-[10px] text-orange-600 font-semibold block truncate">
                    📍 {formatGramPanchayat(official.gramPanchayat, language)}
                  </span>
                )}
                <a
                  href={`tel:${official.phone}`}
                  className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1 hover:underline"
                >
                  <Phone className="w-3 h-3" />
                  {official.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">वॉर्ड क्र. (Ward)</th>
                <th className="px-4 py-3">परिसराचे नाव (Area Name)</th>
                <th className="px-4 py-3">लोकसंख्या (Population)</th>
                <th className="px-4 py-3">एकूण घरे (Households)</th>
                <th className="px-4 py-3">ग्रामपंचायत सदस्य (Ward Member)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wardsData.map((ward, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-orange-600">{ward.wardNo}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{ward.areaName}</td>
                  <td className="px-4 py-3 text-slate-600">{ward.population.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-slate-600">{ward.households}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{formatUserName(ward.member, language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
