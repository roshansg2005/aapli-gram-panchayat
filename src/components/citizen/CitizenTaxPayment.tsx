import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyTaxRecord } from '../../types';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  QrCode, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  Receipt, 
  X, 
  Copy, 
  Info,
  Home,
  Building,
  Droplets
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const CitizenTaxPayment: React.FC = () => {
  const { 
    language, 
    taxRecords, 
    payTaxRecord, 
    setViewingReceipt,
    currentUser,
    panchayatInfo 
  } = useApp();

  const currentGpName = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedRecord, setSearchedRecord] = useState<PropertyTaxRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [payingRecord, setPayingRecord] = useState<PropertyTaxRecord | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // 1. Citizen's Own Assigned Tax Record (assigned specifically by Gram Panchayat)
  const myTaxRecord = currentUser ? taxRecords.find(r => 
    matchGramPanchayat(r.gramPanchayat, currentGpName) &&
    ((currentUser.houseNo && r.propertyNo.toLowerCase() === currentUser.houseNo.toLowerCase()) ||
     (currentUser.name && r.ownerName.toLowerCase().includes(currentUser.name.toLowerCase())))
  ) || null : null;

  // 2. Real-time Search Handler for Looking up other properties
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchedRecord(null);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    const found = taxRecords.find(r => 
      matchGramPanchayat(r.gramPanchayat, currentGpName) &&
      (r.propertyNo.toLowerCase() === query ||
       r.propertyNo.toLowerCase().includes(query) || 
       r.ownerName.toLowerCase().includes(query))
    );

    setSearchedRecord(found || null);
  };

  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    const query = val.trim().toLowerCase();
    if (!query) {
      setSearchedRecord(null);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    const found = taxRecords.find(r => 
      matchGramPanchayat(r.gramPanchayat, currentGpName) &&
      (r.propertyNo.toLowerCase() === query ||
       r.propertyNo.toLowerCase().includes(query) || 
       r.ownerName.toLowerCase().includes(query))
    );
    setSearchedRecord(found || null);
  };

  const handleExecutePayment = () => {
    if (!payingRecord) return;
    setPaymentProcessing(true);

    setTimeout(() => {
      const updated = payTaxRecord(payingRecord.propertyNo, 'UPI');
      setPaymentProcessing(false);
      setShowPaymentModal(false);
      if (updated) {
        if (searchedRecord && searchedRecord.id === updated.id) {
          setSearchedRecord(updated);
        }
        setViewingReceipt(updated);
      }
    }, 1200);
  };

  const renderTaxBillCard = (record: PropertyTaxRecord, isMyBill: boolean = false) => {
    return (
      <div key={record.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                मिळकत क्र. #{record.propertyNo}
              </span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {record.wardNo}
              </span>
              {isMyBill && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {language === 'mr' ? 'आपली मिळकत' : 'Your Property'}
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-sm md:text-base text-slate-900 mt-1">
              {record.ownerName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {record.gramPanchayat || currentGpName} • {record.wardNo}
            </p>
          </div>

          {record.isPaid ? (
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'mr' ? 'कर भरला आहे' : 'Paid'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-300">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              {language === 'mr' ? 'थकबाकी' : 'Unpaid'}
            </span>
          )}
        </div>

        {/* Itemized Tax Breakdown Table */}
        <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs">
          {/* Property Tax Row */}
          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              {language === 'mr' ? 'घरपट्टी (इमारत कर)' : 'Property Tax'}
            </span>
            {record.propertyTax > 0 ? (
              <span className="font-bold text-slate-900">₹ {record.propertyTax}</span>
            ) : (
              <span className="text-slate-400 font-medium bg-slate-200/60 px-2 py-0.5 rounded text-[10px]">
                {language === 'mr' ? 'लागू नाही' : 'Not Applicable'}
              </span>
            )}
          </div>

          {/* Water Tax Row */}
          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              {language === 'mr' ? 'पाणीपट्टी (नळ जोडणी कर)' : 'Water Tax'}
            </span>
            {record.waterTax > 0 ? (
              <span className="font-bold text-slate-900">₹ {record.waterTax}</span>
            ) : (
              <span className="text-slate-400 font-medium bg-slate-200/60 px-2 py-0.5 rounded text-[10px]">
                {language === 'mr' ? 'लागू नाही' : 'Not Applicable'}
              </span>
            )}
          </div>

          {/* Sanitation Cess Row */}
          {record.sanitationTax > 0 && (
            <div className="flex justify-between items-center text-slate-600">
              <span>{language === 'mr' ? 'आरोग्य व स्वच्छता उपकर' : 'Sanitation Cess'}</span>
              <span className="font-bold text-slate-900">₹ {record.sanitationTax}</span>
            </div>
          )}

          {/* Lighting Cess Row */}
          {record.lightingTax > 0 && (
            <div className="flex justify-between items-center text-slate-600">
              <span>{language === 'mr' ? 'दिवाबत्ती उपकर' : 'Lighting Cess'}</span>
              <span className="font-bold text-slate-900">₹ {record.lightingTax}</span>
            </div>
          )}

          {/* 10% Rebate Discount */}
          {record.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold pt-1 border-t border-slate-200">
              <span>{language === 'mr' ? 'सवलत (१०% त्वरित भरणा)' : 'Early Bird Discount (10%)'}</span>
              <span>- ₹ {record.discount}</span>
            </div>
          )}

          {/* Final Amount */}
          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-200">
            <span>{language === 'mr' ? 'एकूण देय रक्कम' : 'Total Payable'}</span>
            <span className="text-emerald-700">₹ {record.finalAmount}/-</span>
          </div>
        </div>

        {/* Action Button */}
        {record.isPaid ? (
          <button
            onClick={() => setViewingReceipt(record)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Receipt className="w-4 h-4 text-emerald-200" />
            <span>{language === 'mr' ? 'अधिकृत कर पावती पहा व डाउनलोड करा' : 'View & Download Receipt'}</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setPayingRecord(record);
              setShowPaymentModal(true);
            }}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{language === 'mr' ? 'UPI / QR द्वारे त्वरित कर भरा' : 'Pay Now via UPI'} (₹ {record.finalAmount})</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-4 text-white shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white/10 rounded-xl">
            <CreditCard className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base">{language === 'mr' ? 'घरपट्टी / पाणीपट्टी कर भरणा' : 'Property & Water Tax Payment'}</h2>
            <p className="text-[11px] text-emerald-100">{currentGpName} • {language === 'mr' ? '१०% सवलतीसह ऑनलाइन कर भरा' : 'Pay taxes online with 10% rebate'}</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Citizen's Own Assigned Tax Record */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-4 bg-emerald-600 rounded-full" />
          {language === 'mr' ? 'माझी मिळकत कर आकारणी' : 'My Property Tax Assessment'}
        </h3>

        {myTaxRecord ? (
          renderTaxBillCard(myTaxRecord, true)
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
              <Home className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-slate-800">
              {language === 'mr' ? 'आपल्या नावावर कोणतीही कर मागणी प्रलंबित नाही' : 'No tax demand assessed for your account yet'}
            </h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              {language === 'mr' 
                ? 'ग्रामपंचायतीकडून आपल्या मिळकतीची चालू वर्षाची कर मागणी निश्चित झाल्यावर येथे उपलब्ध होईल.' 
                : 'Tax bills will appear here once assessed and assigned by the Gram Panchayat office.'}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: Search & Pay for Any Property */}
      <div className="space-y-3 pt-2">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-4 bg-blue-600 rounded-full" />
          {language === 'mr' ? 'इतर मिळकत कर शोध व भरणा' : 'Search & Pay for Other Property'}
        </h3>

        {/* Property Search Bar */}
        <form onSubmit={handleSearch} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'mr' ? 'घर / मिळकत क्रमांक किंवा नाव टाका (उदा. GHU-W2-205, थोरात)' : 'Enter House / Property No. or Name'}
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            {language === 'mr' ? 'शोधा' : 'Search'}
          </button>
        </form>

        {/* Search Results Display */}
        {hasSearched && (
          <div>
            {searchedRecord ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 px-1">
                  {language === 'mr' ? 'शोधलेले कर देयक:' : 'Searched Tax Record:'}
                </span>
                {renderTaxBillCard(searchedRecord, false)}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-2 animate-fade-in">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto">
                  <Info className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-800">
                  {language === 'mr' 
                    ? `मिळकत क्र. "${searchQuery}" साठी ${currentGpName} मध्ये कोणतीही कर मागणी आढळली नाही` 
                    : `No tax demand found for property "${searchQuery}" in ${currentGpName}`}
                </h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  {language === 'mr'
                    ? 'कृपया योग्य घर / मिळकत क्रमांक टाका किंवा ग्रामपंचायतीने कर मागणी निश्चित केली असल्याची खात्री करा.'
                    : 'Please enter a valid property number or verify that Gram Panchayat has issued a tax demand.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentModal && payingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                {language === 'mr' ? 'ऑनलाइन कर भरणा (UPI Gateway)' : 'Online Tax Payment'}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[11px] text-slate-500 block">{currentGpName}</span>
                <span className="text-2xl font-black text-emerald-700">₹ {payingRecord.finalAmount}/-</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">✓ १०% सवलतीसह अंतिम रक्कम</span>
              </div>

              <div className="w-40 h-40 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 p-2">
                <QrCode className="w-32 h-32 text-slate-800" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Google Pay / PhonePe / Paytm स्कॅन करा</p>
            </div>

            <button
              onClick={handleExecutePayment}
              disabled={paymentProcessing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>{paymentProcessing ? 'भरणा प्रक्रिया सुरू आहे...' : '₹ ' + payingRecord.finalAmount + ' यशस्वी भरणा प्रमाणित करा'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

