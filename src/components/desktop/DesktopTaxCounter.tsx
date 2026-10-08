import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyTaxRecord } from '../../types';
import { 
  Receipt, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  PlusCircle, 
  Coins, 
  CreditCard, 
  Download, 
  Sparkles,
  DollarSign,
  X,
  Building,
  Droplets,
  Zap,
  Layers,
  Check,
  Trash2
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const DesktopTaxCounter: React.FC = () => {
  const { 
    language, 
    t, 
    taxRecords, 
    addTaxAssessment,
    payTaxRecord, 
    deleteTaxAssessment,
    setViewingReceipt,
    currentUser,
    panchayatInfo 
  } = useApp();

  const currentGp = currentUser?.gramPanchayat || panchayatInfo.nameMr;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for New Tax Assessment
  const [propertyNo, setPropertyNo] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [wardNo, setWardNo] = useState('Ward 1');
  const [taxPreset, setTaxPreset] = useState<'all' | 'property_only' | 'water_only' | 'custom'>('all');
  const [propertyTax, setPropertyTax] = useState<number>(1200);
  const [waterTax, setWaterTax] = useState<number>(600);
  const [healthCess, setHealthCess] = useState<number>(200);
  const [lightTax, setLightTax] = useState<number>(150);
  const [customRebate, setCustomRebate] = useState<number | null>(null);

  const subtotal = propertyTax + waterTax + healthCess + lightTax;
  const calculatedDiscount = customRebate !== null ? customRebate : Math.round(subtotal * 0.1);
  const finalPayable = Math.max(0, subtotal - calculatedDiscount);

  // Handle Preset Changes
  const handlePresetSelect = (preset: 'all' | 'property_only' | 'water_only' | 'custom') => {
    setTaxPreset(preset);
    if (preset === 'property_only') {
      setPropertyTax(1200);
      setWaterTax(0);
      setHealthCess(0);
      setLightTax(0);
    } else if (preset === 'water_only') {
      setPropertyTax(0);
      setWaterTax(600);
      setHealthCess(0);
      setLightTax(0);
    } else if (preset === 'all') {
      setPropertyTax(1400);
      setWaterTax(600);
      setHealthCess(200);
      setLightTax(150);
    }
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyNo || !ownerName) return;

    await addTaxAssessment({
      propertyNo: propertyNo.trim().toUpperCase(),
      ownerName: ownerName.trim(),
      wardNo,
      gramPanchayat: currentGp,
      taxType: taxPreset,
      propertyTax,
      waterTax,
      healthCess,
      lightTax,
      rebate: calculatedDiscount
    });

    setPropertyNo('');
    setOwnerName('');
    setShowAddModal(false);
  };

  // Filter records specifically for current Gram Panchayat
  const gpRecords = currentGp 
    ? taxRecords.filter(r => matchGramPanchayat(r.gramPanchayat, currentGp))
    : taxRecords;

  const filteredRecords = gpRecords.filter(r => {
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'paid' && r.isPaid) || 
      (filterStatus === 'unpaid' && !r.isPaid);
    
    const matchesSearch = 
      r.propertyNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.wardNo.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalDemand = gpRecords.reduce((sum, r) => sum + r.finalAmount, 0);
  const totalCollected = gpRecords.filter(r => r.isPaid).reduce((sum, r) => sum + r.finalAmount, 0);
  const totalOutstanding = totalDemand - totalCollected;

  const handleCounterCollection = (record: PropertyTaxRecord) => {
    const updated = payTaxRecord(record.propertyNo, 'Cash');
    if (updated) {
      setViewingReceipt(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Financial Overview Cards & Action Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">{language === 'mr' ? 'एकूण कर मागणी (Demand)' : 'Total Tax Demand'}</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">₹ {totalDemand.toLocaleString('en-IN')}/-</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">{language === 'mr' ? 'जमा झालेला कर (Collected)' : 'Total Collected'}</span>
            <h3 className="text-xl font-extrabold text-emerald-700 mt-1">₹ {totalCollected.toLocaleString('en-IN')}/-</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">{language === 'mr' ? 'बाकी कर (Outstanding)' : 'Total Outstanding'}</span>
            <h3 className="text-xl font-extrabold text-red-600 mt-1">₹ {totalOutstanding.toLocaleString('en-IN')}/-</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Filter & Action Header */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'mr' ? 'मिळकत क्र., मालकाचे नाव शोधा...' : 'Search property no, owner name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'all' ? 'bg-white text-emerald-800 font-bold shadow-sm' : 'text-slate-600'
                }`}
              >
                {language === 'mr' ? 'सर्व' : 'All'}
              </button>
              <button
                onClick={() => setFilterStatus('unpaid')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'unpaid' ? 'bg-white text-red-700 font-bold shadow-sm' : 'text-slate-600'
                }`}
              >
                {language === 'mr' ? 'थकबाकी' : 'Unpaid'}
              </button>
              <button
                onClick={() => setFilterStatus('paid')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'paid' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-slate-600'
                }`}
              >
                {language === 'mr' ? 'भरले' : 'Paid'}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 font-medium">
              {language === 'mr' ? 'नोंदी:' : 'Records:'} <strong className="text-slate-900">{filteredRecords.length}</strong>
            </span>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-amber-200" />
              <span>{language === 'mr' ? '+ नवीन कर आकारणी / मागणी नोंदवा' : '+ Add Tax Assessment'}</span>
            </button>
          </div>
        </div>

        {/* Data Table or Empty State */}
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">{language === 'mr' ? 'मिळकत क्र.' : 'Property No'}</th>
                  <th className="py-3 px-4">{language === 'mr' ? 'मालकाचे नाव' : 'Owner Name'}</th>
                  <th className="py-3 px-4">{language === 'mr' ? 'वॉर्ड' : 'Ward'}</th>
                  <th className="py-3 px-4">{language === 'mr' ? 'कर प्रकार' : 'Tax Type'}</th>
                  <th className="py-3 px-4">{language === 'mr' ? 'घरपट्टी' : 'House Tax'}</th>
                  <th className="py-3 px-4">{language === 'mr' ? 'पाणीपट्टी' : 'Water Tax'}</th>
                  <th className="py-3 px-4">{language === 'mr' ? 'एकूण देय' : 'Total Due'}</th>
                  <th className="py-3 px-4">{language === 'mr' ? 'स्थिती' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{language === 'mr' ? 'कृती / पावती' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((rec) => {
                  const hasProperty = rec.propertyTax > 0;
                  const hasWater = rec.waterTax > 0;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {rec.propertyNo}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {rec.ownerName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {rec.wardNo}
                      </td>
                      <td className="py-3 px-4">
                        {hasProperty && hasWater ? (
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
                            सर्व कर (All)
                          </span>
                        ) : hasProperty ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
                            फक्त घरपट्टी
                          </span>
                        ) : hasWater ? (
                          <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-200">
                            फक्त पाणीपट्टी
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                            सानुकूल
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {rec.propertyTax > 0 ? `₹ ${rec.propertyTax}` : <span className="text-slate-400 font-mono">-</span>}
                      </td>
                      <td className="py-3 px-4">
                        {rec.waterTax > 0 ? `₹ ${rec.waterTax}` : <span className="text-slate-400 font-mono">-</span>}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        ₹ {rec.finalAmount}/-
                      </td>
                      <td className="py-3 px-4">
                        {rec.isPaid ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {rec.paymentMode || 'UPI'} भरले
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            थकबाकी
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.isPaid ? (
                            <button
                              onClick={() => setViewingReceipt(rec)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              {language === 'mr' ? 'पावती' : 'Receipt'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCounterCollection(rec)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1 active:scale-95"
                            >
                              <Coins className="w-3.5 h-3.5 text-amber-300" />
                              {language === 'mr' ? 'रोख पावती फाडा' : 'Collect Cash'}
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (confirm(language === 'mr' ? `खरोखर मिळकत क्र. ${rec.propertyNo} ची कर आकारणी नोंद हटवायची आहे का?` : `Are you sure you want to delete tax record for property ${rec.propertyNo}?`)) {
                                await deleteTaxAssessment(rec.id);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition-all active:scale-95"
                            title={language === 'mr' ? 'कर नोंद हटवा' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Receipt className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              {language === 'mr' ? 'या ग्रामपंचायतीसाठी कर आकारणी नोंद झालेली नाही' : 'No tax assessments in this Gram Panchayat yet'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {language === 'mr' 
                ? 'ग्रामपंचायत कार्यक्षेत्रातील मिळकतींसाठी घरपट्टी, पाणीपट्टी किंवा सर्व करांची मागणी नोंदवण्यासाठी खालील बटण दाबा.'
                : 'Click below to create official tax demands (Property Tax, Water Tax, or All Taxes) for village properties.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-amber-200" />
              <span>{language === 'mr' ? 'पहिली कर आकारणी करा' : 'Create First Tax Assessment'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 🌟 Add New Tax Assessment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                  {currentGp}
                </span>
                <h3 className="font-black text-base text-slate-900 mt-1">
                  {language === 'mr' ? 'नवीन कर आकारणी / मागणी नोंदवा' : 'Issue New Tax Assessment Demand'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-4 text-xs">
              {/* Property No & Owner Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'मालमत्ता / घर क्र.*' : 'Property / House No*'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. 101, GHUL-45"
                    value={propertyNo}
                    onChange={(e) => setPropertyNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'मिळकतधारकाचे नाव*' : 'Owner Name*'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. ज्ञानेश्वर संभाजी मोरे"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Ward */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'वॉर्ड क्रमांक' : 'Ward'}
                </label>
                <select
                  value={wardNo}
                  onChange={(e) => setWardNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Ward 1">Ward 1 (वॉर्ड १)</option>
                  <option value="Ward 2">Ward 2 (वॉर्ड २)</option>
                  <option value="Ward 3">Ward 3 (वॉर्ड ३)</option>
                  <option value="Ward 4">Ward 4 (वॉर्ड ४)</option>
                  <option value="Ward 5">Ward 5 (वॉर्ड ५)</option>
                  <option value="Ward 6">Ward 6 (वॉर्ड ६)</option>
                </select>
              </div>

              {/* Tax Type Preset Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {language === 'mr' ? 'कर प्रकार निवडा (Tax Category)' : 'Select Applicable Taxes'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetSelect('property_only')}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all ${
                      taxPreset === 'property_only'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-4 h-4 mx-auto mb-0.5 text-blue-600" />
                    {language === 'mr' ? 'फक्त घरपट्टी' : 'Property Tax Only'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetSelect('water_only')}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all ${
                      taxPreset === 'water_only'
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-800 ring-2 ring-cyan-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Droplets className="w-4 h-4 mx-auto mb-0.5 text-cyan-600" />
                    {language === 'mr' ? 'फक्त पाणीपट्टी' : 'Water Tax Only'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetSelect('all')}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all ${
                      taxPreset === 'all'
                        ? 'bg-purple-50 border-purple-500 text-purple-800 ring-2 ring-purple-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-4 h-4 mx-auto mb-0.5 text-purple-600" />
                    {language === 'mr' ? 'सर्व कर (All)' : 'All Taxes'}
                  </button>
                </div>
              </div>

              {/* Itemized Tax Breakdown Inputs */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      {language === 'mr' ? 'घरपट्टी (इमारत कर ₹)' : 'Property Tax (₹)'}
                    </label>
                    <input
                      type="number"
                      value={propertyTax}
                      onChange={(e) => {
                        setPropertyTax(Number(e.target.value));
                        setTaxPreset('custom');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      {language === 'mr' ? 'पाणीपट्टी (नळ कर ₹)' : 'Water Tax (₹)'}
                    </label>
                    <input
                      type="number"
                      value={waterTax}
                      onChange={(e) => {
                        setWaterTax(Number(e.target.value));
                        setTaxPreset('custom');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      {language === 'mr' ? 'आरोग्य / स्वच्छता कर (₹)' : 'Sanitation Cess (₹)'}
                    </label>
                    <input
                      type="number"
                      value={healthCess}
                      onChange={(e) => {
                        setHealthCess(Number(e.target.value));
                        setTaxPreset('custom');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      {language === 'mr' ? 'दिवाबत्ती कर (₹)' : 'Light Tax (₹)'}
                    </label>
                    <input
                      type="number"
                      value={lightTax}
                      onChange={(e) => {
                        setLightTax(Number(e.target.value));
                        setTaxPreset('custom');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Subtotal and Rebate Summary */}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-700">
                  <span>{language === 'mr' ? 'एकूण कर बेरीज:' : 'Gross Total:'} ₹ {subtotal}</span>
                  <span className="text-emerald-700">{language === 'mr' ? '१०% सवलत:' : '10% Rebate:'} - ₹ {calculatedDiscount}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>{language === 'mr' ? 'अंतिम मागणी रक्कम:' : 'Net Final Amount:'}</span>
                  <span className="text-emerald-700">₹ {finalPayable}/-</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
                >
                  {language === 'mr' ? 'कर आकारणी सेव्ह करा' : 'Save Tax Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

