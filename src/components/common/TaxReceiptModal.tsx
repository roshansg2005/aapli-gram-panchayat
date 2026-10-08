import React from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyTaxRecord } from '../../types';
import { Printer, X, CheckCircle2, QrCode, Landmark, Receipt } from 'lucide-react';

export const TaxReceiptModal: React.FC = () => {
  const { 
    language, 
    viewingReceipt, 
    setViewingReceipt, 
    panchayatInfo 
  } = useApp();

  if (!viewingReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-300 relative flex flex-col my-6">
        {/* Modal Header */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>{language === 'mr' ? 'अधिकृत कर पावती (Official Tax Receipt)' : 'Official Tax Receipt'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'प्रिंट पावती' : 'Print Receipt'}</span>
            </button>
            <button
              onClick={() => setViewingReceipt(null)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 bg-white border-4 border-slate-300 m-4 rounded-xl text-slate-900 printable-certificate relative">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-3">
            <h2 className="text-lg font-black text-slate-900">
              {panchayatInfo.nameMr}
            </h2>
            <p className="text-xs text-slate-600">
              ता. {panchayatInfo.talukaMr}, जि. {panchayatInfo.districtMr} - {panchayatInfo.pincode}
            </p>
            <span className="inline-block px-4 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-xs mt-1">
              घरपट्टी व पाणीपट्टी कर वसुली पावती (FY 2026-2027)
            </span>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs py-3 border-b border-slate-200">
            <div>
              <span className="text-slate-500 block">पावती क्र. / Receipt No:</span>
              <strong className="font-mono text-emerald-800 font-bold">
                {viewingReceipt.receiptNo || `RCPT-${new Date().getFullYear()}-${(viewingReceipt.propertyNo || 'TAX').replace(/[^a-zA-Z0-9]/g, '')}`}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">भरणा दिनांक / Date:</span>
              <strong>{viewingReceipt.lastPaymentDate || new Date().toISOString().split('T')[0]}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">मिळकत क्र. / Property No:</span>
              <strong className="font-mono">{viewingReceipt.propertyNo}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">भरणा प्रकार / Mode:</span>
              <strong className="text-emerald-700">{viewingReceipt.paymentMode || 'Online UPI'}</strong>
            </div>
          </div>

          {/* Owner Info */}
          <div className="py-2.5 text-xs border-b border-slate-200 space-y-1">
            <div>
              <span className="text-slate-500">मालकाचे नाव / Owner: </span>
              <strong className="text-slate-900 font-bold">{viewingReceipt.ownerName}</strong>
            </div>
            <div>
              <span className="text-slate-500">पत्ता व वॉर्ड / Address: </span>
              <span>{viewingReceipt.address}, {viewingReceipt.wardNo}</span>
            </div>
          </div>

          {/* Tax Breakdown Table */}
          <div className="py-3">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="py-1.5 px-2">अ.क्र.</th>
                  <th className="py-1.5 px-2">कराचा तपशील (Particulars)</th>
                  <th className="py-1.5 px-2 text-right">रक्कम (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-1.5 px-2">१</td>
                  <td className="py-1.5 px-2">घरपट्टी कर (House Property Tax)</td>
                  <td className="py-1.5 px-2 text-right">₹ {viewingReceipt.propertyTax}.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2">२</td>
                  <td className="py-1.5 px-2">पाणीपट्टी कर (Water Supply Cess)</td>
                  <td className="py-1.5 px-2 text-right">₹ {viewingReceipt.waterTax}.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2">३</td>
                  <td className="py-1.5 px-2">आरोग्य व स्वच्छता कर (Sanitation)</td>
                  <td className="py-1.5 px-2 text-right">₹ {viewingReceipt.sanitationTax}.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2">४</td>
                  <td className="py-1.5 px-2">दिवाबत्ती कर (Street Lighting)</td>
                  <td className="py-1.5 px-2 text-right">₹ {viewingReceipt.lightingTax}.00</td>
                </tr>
                {viewingReceipt.discount > 0 && (
                  <tr className="text-emerald-700 font-semibold">
                    <td className="py-1.5 px-2">५</td>
                    <td className="py-1.5 px-2">मुदतीतील १०% विशेष सवलत (Rebate)</td>
                    <td className="py-1.5 px-2 text-right">- ₹ {viewingReceipt.discount}.00</td>
                  </tr>
                )}
                <tr className="font-extrabold text-sm border-t-2 border-slate-800 bg-slate-50">
                  <td colSpan={2} className="py-2 px-2">एकूण जमा रक्कम (Total Amount Paid):</td>
                  <td className="py-2 px-2 text-right text-emerald-800">₹ {viewingReceipt.finalAmount}.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Paid Stamp & Signatures */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="border-2 border-emerald-600 text-emerald-700 font-black text-sm uppercase px-3 py-1 rounded tracking-widest transform -rotate-6">
              ✓ PAID (भरणा पूर्ण)
            </div>

            <div className="text-center text-xs">
              <div className="w-24 h-6 border-b border-slate-400 mx-auto mb-1 flex items-center justify-center font-mono text-[9px] text-slate-400">
                [GP Cashier]
              </div>
              <strong className="block text-[11px]">कर वसुली लिपिक / ग्रामसेवक</strong>
              <span className="text-[10px] text-slate-500">{panchayatInfo.nameMr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
