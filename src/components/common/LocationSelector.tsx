import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  maharashtraGeoData 
} from '../../data/maharashtraGeoData';
import { api, DistrictItem, TalukaItem, PanchayatItem } from '../../api/apiClient';
import { MapPin, Search, CheckCircle, Database, Check, Building } from 'lucide-react';

import { 
  formatGramPanchayat, 
  formatTaluka, 
  formatDistrict 
} from '../../utils/jurisdiction';

interface LocationSelectorProps {
  selectedState?: string;
  selectedDistrict?: string;
  selectedTaluka?: string;
  selectedGramPanchayat?: string;
  selectedWard?: string;
  level?: 'taluka' | 'gramPanchayat' | 'ward'; // 'taluka' for BDO, 'gramPanchayat' for Sarpanch/Staff/Citizen
  showWard?: boolean; // Default false (omit 5. Ward / Area)
  onChange: (data: {
    state: string;
    district: string;
    taluka: string;
    gramPanchayat: string;
    ward: string;
  }) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedState = 'Maharashtra',
  selectedDistrict = 'Pune',
  selectedTaluka = 'Haveli',
  selectedGramPanchayat = '',
  selectedWard = 'Ward 1',
  level = 'gramPanchayat',
  showWard = false,
  onChange
}) => {
  const { language } = useApp();

  // Fallback data
  const currentStateObj = maharashtraGeoData.find(s => s.id === 'MH') || maharashtraGeoData[0];
  const fallbackDistricts = currentStateObj.districts;

  const [districts, setDistricts] = useState<any[]>(fallbackDistricts);
  const [talukas, setTalukas] = useState<any[]>(fallbackDistricts[0].talukas);
  const [panchayats, setPanchayats] = useState<any[]>([]);
  const [wards, setWards] = useState<string[]>([
    'Ward 1', 
    'Ward 2', 
    'Ward 3', 
    'Ward 4'
  ]);

  const [selectedDistCode, setSelectedDistCode] = useState<string>('466');
  const [selectedTalCode, setSelectedTalCode] = useState<string>('4248');
  const [selectedPanCode, setSelectedPanCode] = useState<string>('');
  const [currentWard, setCurrentWard] = useState<string>(selectedWard || 'Ward 1');

  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingGps, setIsLoadingGps] = useState<boolean>(false);

  // Load districts on mount
  useEffect(() => {
    async function initLocationData() {
      try {
        const dbDistricts = await api.getDistricts();
        if (dbDistricts && dbDistricts.length > 0) {
          setIsDbConnected(true);
          const mapped = dbDistricts.map(d => ({
            id: d.code,
            code: d.code,
            nameEn: d.name_en,
            nameMr: d.name_mr
          }));
          setDistricts(mapped);

          // Find Pune or matching selected district
          const targetDist = mapped.find(d => 
            d.nameEn.toLowerCase() === selectedDistrict.toLowerCase() || 
            (d.nameMr && d.nameMr.includes(selectedDistrict))
          ) || mapped[0];
          setSelectedDistCode(targetDist.code);

          // Load talukas for this district
          const dbTalukas = await api.getTalukas(targetDist.code);
          if (dbTalukas && dbTalukas.length > 0) {
            const mappedTal = dbTalukas.map(t => ({
              id: t.code,
              code: t.code,
              nameEn: t.name_en,
              nameMr: t.name_mr,
              districtCode: t.district_code
            }));
            setTalukas(mappedTal);

            const targetTal = mappedTal.find(t => 
              t.nameEn.toLowerCase() === selectedTaluka.toLowerCase() || 
              (t.nameMr && t.nameMr.includes(selectedTaluka))
            ) || mappedTal[0];
            setSelectedTalCode(targetTal.code);

            if (level === 'taluka') {
              triggerParentChange(targetDist, targetTal, null, '');
            } else {
              // Load Gram Panchayats for this Taluka
              setIsLoadingGps(true);
              const dbPanchayats = await api.getPanchayats(targetTal.code);
              setIsLoadingGps(false);
              if (dbPanchayats && dbPanchayats.length > 0) {
                const mappedPan = dbPanchayats.map(p => ({
                  id: p.code,
                  code: p.code,
                  nameEn: p.name_en,
                  nameMr: p.name_mr || p.name_en,
                  wards: p.wards && p.wards.length > 0 ? p.wards : ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4']
                }));
                setPanchayats(mappedPan);

                const targetPan = mappedPan.find(p => 
                  p.nameEn.toLowerCase() === selectedGramPanchayat.toLowerCase() || 
                  (p.nameMr && p.nameMr.includes(selectedGramPanchayat))
                ) || mappedPan[0];

                setSelectedPanCode(targetPan.code);
                triggerParentChange(targetDist, targetTal, targetPan, 'Ward 1');
              }
            }
          }
        }
      } catch (e) {
        console.error('Error loading initial locations:', e);
      }
    }
    initLocationData();
  }, [level]);

  const loadTalukasForDist = async (dCode: string) => {
    try {
      const dbTalukas = await api.getTalukas(dCode);
      const distObj = districts.find(d => d.code === dCode || d.id === dCode);
      if (dbTalukas && dbTalukas.length > 0) {
        const mapped = dbTalukas.map(t => ({
          id: t.code,
          code: t.code,
          nameEn: t.name_en,
          nameMr: t.name_mr,
          districtCode: t.district_code
        }));
        setTalukas(mapped);
        if (mapped.length > 0) {
          setSelectedTalCode(mapped[0].code);
          if (level === 'taluka') {
            triggerParentChange(distObj, mapped[0], null, '');
          } else {
            loadPanchayatsForTaluka(mapped[0].code, distObj, mapped[0]);
          }
        }
      } else {
        setTalukas([]);
        setPanchayats([]);
      }
    } catch (e) {
      console.error('Error in loadTalukasForDist:', e);
    }
  };

  const loadPanchayatsForTaluka = async (tCode: string, dObj?: any, tObj?: any) => {
    if (level === 'taluka') return;
    try {
      setIsLoadingGps(true);
      const dbPanchayats = await api.getPanchayats(tCode);
      setIsLoadingGps(false);

      const distObj = dObj || districts.find(d => d.code === selectedDistCode);
      const talObj = tObj || talukas.find(t => t.code === tCode);

      if (dbPanchayats && dbPanchayats.length > 0) {
        const mappedPan = dbPanchayats.map(p => ({
          id: p.code,
          code: p.code,
          nameEn: p.name_en,
          nameMr: p.name_mr || p.name_en,
          wards: p.wards && p.wards.length > 0 ? p.wards : ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4']
        }));
        setPanchayats(mappedPan);
        setSelectedPanCode(mappedPan[0].code);
        setWards(mappedPan[0].wards);
        setCurrentWard(mappedPan[0].wards[0]);
        triggerParentChange(distObj, talObj, mappedPan[0], mappedPan[0].wards[0]);
      } else {
        setPanchayats([]);
      }
    } catch (e) {
      setIsLoadingGps(false);
      console.error('Error in loadPanchayatsForTaluka:', e);
    }
  };

  const triggerParentChange = (distObj: any, talObj: any, pObj: any, wardName: string) => {
    const rawGpName = pObj 
      ? (language === 'mr' ? (pObj.nameMr || pObj.nameEn) : (pObj.nameEn || pObj.nameMr))
      : '';
    const cleanGp = formatGramPanchayat(rawGpName, language);
    const cleanDist = formatDistrict(distObj ? (distObj.nameEn || distObj.nameMr) : selectedDistrict || 'Pune', language);
    const cleanTal = formatTaluka(talObj ? (talObj.nameEn || talObj.nameMr) : selectedTaluka || 'Haveli', language);

    onChange({
      state: 'Maharashtra',
      district: cleanDist,
      taluka: cleanTal,
      gramPanchayat: cleanGp,
      ward: wardName || 'Ward 1'
    });
  };

  const handleDistrictChange = (dCode: string) => {
    setSelectedDistCode(dCode);
    loadTalukasForDist(dCode);
  };

  const handleTalukaChange = (tCode: string) => {
    setSelectedTalCode(tCode);
    if (level === 'taluka') {
      const distObj = districts.find(d => d.code === selectedDistCode);
      const talObj = talukas.find(t => t.code === tCode);
      triggerParentChange(distObj, talObj, null, '');
    } else {
      loadPanchayatsForTaluka(tCode);
    }
  };

  const handlePanchayatChange = (pCode: string) => {
    setSelectedPanCode(pCode);
    const foundPan = panchayats.find(p => p.code === pCode || p.id === pCode);
    const panWards = foundPan?.wards || ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'];
    setWards(panWards);
    setCurrentWard(panWards[0]);

    const distObj = districts.find(d => d.code === selectedDistCode);
    const talObj = talukas.find(t => t.code === selectedTalCode);
    triggerParentChange(distObj, talObj, foundPan, panWards[0]);
  };

  const handleWardChange = (w: string) => {
    setCurrentWard(w);
    const foundPan = panchayats.find(p => p.code === selectedPanCode || p.id === selectedPanCode);
    const distObj = districts.find(d => d.code === selectedDistCode);
    const talObj = talukas.find(t => t.code === selectedTalCode);
    triggerParentChange(distObj, talObj, foundPan, w);
  };

  // Live search handler across all 28,097 panchayats
  const handleLiveSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length >= 2) {
      const results = await api.searchLocations(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // User clicked a search result (e.g. घुलेवाडी in संगमनेर, अहिल्यानगर)
  const selectSearchResult = async (item: any) => {
    setSearchQuery('');
    setSearchResults([]);

    // 1. Set and load district
    if (item.district_code) {
      setSelectedDistCode(item.district_code);
      const dbTalukas = await api.getTalukas(item.district_code);
      if (dbTalukas && dbTalukas.length > 0) {
        const mappedTal = dbTalukas.map(t => ({
          id: t.code,
          code: t.code,
          nameEn: t.name_en,
          nameMr: t.name_mr,
          districtCode: t.district_code
        }));
        setTalukas(mappedTal);
      }
    }

    // 2. Set and load taluka
    if (item.taluka_code) {
      setSelectedTalCode(item.taluka_code);
      if (level !== 'taluka') {
        const dbPanchayats = await api.getPanchayats(item.taluka_code);
        if (dbPanchayats && dbPanchayats.length > 0) {
          const mappedPan = dbPanchayats.map(p => ({
            id: p.code,
            code: p.code,
            nameEn: p.name_en,
            nameMr: p.name_mr || p.name_en,
            wards: p.wards && p.wards.length > 0 ? p.wards : ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4']
          }));
          setPanchayats(mappedPan);
        }
      }
    }

    // 3. Set Gram Panchayat
    if (item.gp_code && level !== 'taluka') {
      setSelectedPanCode(item.gp_code);
    }

    const chosenGpName = level === 'taluka' ? '' : formatGramPanchayat(item.gp_name_mr || item.gp_name_en, language);
    const chosenDistrict = formatDistrict(item.district_name_mr || item.district_name_en || 'Pune', language);
    const chosenTaluka = formatTaluka(item.taluka_name_mr || item.taluka_name_en || 'Haveli', language);

    onChange({
      state: 'Maharashtra',
      district: chosenDistrict,
      taluka: chosenTaluka,
      gramPanchayat: chosenGpName,
      ward: 'Ward 1'
    });
  };

  const currentSelectedPan = panchayats.find(p => p.code === selectedPanCode) || panchayats[0];
  const currentTalObj = talukas.find(t => t.code === selectedTalCode) || talukas[0];
  const currentDistObj = districts.find(d => d.code === selectedDistCode) || districts[0];

  return (
    <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          {level === 'taluka'
            ? (language === 'mr' ? 'तालुका कार्यक्षेत्र निवडा (State -> District -> Taluka)' : 'Select Taluka Jurisdiction')
            : (language === 'mr' ? 'प्रशासकीय स्थान व ग्रामपंचायत निवडा' : 'Select Administrative Location')}
        </span>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
          <Database className="w-2.5 h-2.5" />
          <span>{level === 'taluka' ? 'तालुका स्तरावर' : 'LGD Live DB (२८,०९७ GP)'}</span>
        </span>
      </div>

      {/* 🔍 Quick Search across Panchayats (only if not taluka-level) */}
      {level !== 'taluka' && (
        <div className="relative">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={language === 'mr' ? '⚡ महाराष्ट्रातील २८,०९७ ग्रामपंचायतींमधून थेट शोधा...' : '⚡ Search directly across 28,097 Maharashtra Panchayats...'}
              value={searchQuery}
              onChange={(e) => handleLiveSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm font-medium"
            />
          </div>

          {/* Live Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
              <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'mr' ? `${searchResults.length} ग्रामपंचायती सापडल्या:` : `Found ${searchResults.length} Gram Panchayats:`}
              </div>
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(res)}
                  className="w-full p-2.5 text-left hover:bg-orange-50 transition-colors text-xs flex items-center justify-between group"
                >
                  <div>
                    <strong className="block text-slate-900 font-bold group-hover:text-orange-600">
                      {language === 'mr' ? (res.gp_name_mr || res.gp_name_en) : (res.gp_name_en || res.gp_name_mr)}
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      {language === 'mr' 
                        ? `तालुका: ${res.taluka_name_mr || res.taluka_name_en}, जिल्हा: ${res.district_name_mr || res.district_name_en}` 
                        : `Taluka: ${res.taluka_name_en}, District: ${res.district_name_en}`}
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-700 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {language === 'mr' ? 'निवडा' : 'Select'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Location Pill */}
      {(selectedGramPanchayat || level === 'taluka') && (
        <div className="p-2 bg-orange-50/80 rounded-xl border border-orange-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-orange-600 shrink-0" />
            <div>
              <span className="text-[10px] text-orange-800 font-bold block">
                {level === 'taluka'
                  ? (language === 'mr' ? 'निवडलेले तालुका कार्यक्षेत्र:' : 'Selected Taluka Jurisdiction:')
                  : (language === 'mr' ? 'सध्या निवडलेली ग्रामपंचायत:' : 'Selected Gram Panchayat:')}
              </span>
              <strong className="text-slate-900 font-extrabold">
                {level === 'taluka'
                  ? `ता. ${currentTalObj ? (currentTalObj.nameMr || currentTalObj.nameEn) : selectedTaluka}, जि. ${currentDistObj ? (currentDistObj.nameMr || currentDistObj.nameEn) : selectedDistrict}`
                  : (selectedGramPanchayat || (currentSelectedPan ? (currentSelectedPan.nameMr || currentSelectedPan.nameEn) : ''))}
              </strong>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            {language === 'mr' ? 'सक्रिय' : 'Active'}
          </span>
        </div>
      )}

      {/* Row 1: State & District Dropdowns */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
            {language === 'mr' ? '१. राज्य (State)' : '1. State'} <span className="text-red-500">*</span>
          </label>
          <select 
            disabled
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed"
          >
            <option value="MH">{language === 'mr' ? 'महाराष्ट्र' : 'Maharashtra'}</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
            {language === 'mr' ? '२. जिल्हा (District)' : '2. District'} ({districts.length}) <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDistCode}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none truncate"
          >
            {districts.map(dist => (
              <option key={dist.code || dist.id} value={dist.code || dist.id}>
                {language === 'mr' ? (dist.nameMr || dist.nameEn) : dist.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Taluka & (Optional) Gram Panchayat Dropdowns */}
      <div className={level === 'taluka' ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-2'}>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
            {language === 'mr' ? '३. तालुका (Taluka)' : '3. Taluka'} ({talukas.length}) <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedTalCode}
            onChange={(e) => handleTalukaChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none truncate"
          >
            {talukas.map(tal => (
              <option key={tal.code || tal.id} value={tal.code || tal.id}>
                {language === 'mr' ? (tal.nameMr || tal.nameEn) : tal.nameEn}
              </option>
            ))}
          </select>
        </div>

        {level !== 'taluka' && (
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
              {language === 'mr' ? '४. ग्रामपंचायत' : '4. Gram Panchayat'} {isLoadingGps ? '(लोडिंग...)' : `(${panchayats.length})`} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPanCode}
              onChange={(e) => handlePanchayatChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-orange-300 bg-orange-50/50 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none truncate"
            >
              {panchayats.length > 0 ? (
                panchayats.map(pan => (
                  <option key={pan.code || pan.id} value={pan.code || pan.id}>
                    {language === 'mr' ? (pan.nameMr || pan.nameEn) : pan.nameEn}
                  </option>
                ))
              ) : (
                <option value="">{isLoadingGps ? 'लोड होत आहे...' : 'ग्रामपंचायत उपलब्ध नाही'}</option>
              )}
            </select>
          </div>
        )}
      </div>

      {/* Row 3: Ward (Shown if showWard === true or level === 'ward') */}
      {(showWard || level === 'ward') && (
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
            {language === 'mr' ? '५. वॉर्ड / प्रभाग (Ward / Area)' : '5. Ward / Area'} <span className="text-red-500">*</span>
          </label>
          <select
            value={currentWard}
            onChange={(e) => handleWardChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            {wards.map((ward, idx) => (
              <option key={idx} value={ward}>
                {ward}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
