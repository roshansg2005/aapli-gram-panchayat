import React from 'react';
import { useApp } from '../../context/AppContext';
import { CertificateApplication } from '../../types';
import { Printer, Download, X, CheckCircle2, QrCode, ShieldCheck, Landmark } from 'lucide-react';

export const CertificateViewerModal: React.FC = () => {
  const { 
    language, 
    viewingCertificate, 
    setViewingCertificate, 
    certificateTypes,
    panchayatInfo 
  } = useApp();

  if (!viewingCertificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const getCertTitle = (type: string) => {
    const matched = certificateTypes.find(ct => ct.code === type || ct.id === type);
    if (matched) {
      return { mr: matched.nameMr, en: matched.nameEn.toUpperCase() };
    }
    switch (type) {
      case 'residence': return { mr: 'रहिवासी दाखला', en: 'RESIDENCE CERTIFICATE' };
      case 'birth': return { mr: 'जन्म नोंदणी प्रमाणपत्र', en: 'BIRTH CERTIFICATE' };
      case 'death': return { mr: 'मृत्यू नोंदणी प्रमाणपत्र', en: 'DEATH CERTIFICATE' };
      case 'income': return { mr: 'उत्पन्न / निराधार दाखला', en: 'INCOME CERTIFICATE' };
      case 'nodues': return { mr: 'थकबाकी नसलेबाबत दाखला (ना-हरकत)', en: 'NO DUES CERTIFICATE' };
      case 'property8a': return { mr: 'नमुना ८अ मिळकत उतारा दाखला', en: 'NAMUNA 8A PROPERTY EXTRACT' };
      case 'toiletsubsidy': return { mr: 'स्वच्छ भारत शौचालय बांधकाम दाखला', en: 'TOILET SUBSIDY CERTIFICATE' };
      case 'marriage': return { mr: 'विवाह नोंदणी प्रमाणपत्र', en: 'MARRIAGE REGISTRATION CERTIFICATE' };
      default: return { mr: type, en: type.toUpperCase() };
    }
  };

  const titleObj = getCertTitle(viewingCertificate.type);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-300 relative flex flex-col my-6">
        {/* Modal Top Control Strip */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{language === 'mr' ? 'अधिकृत डिजिटल दाखला (Official Certificate)' : 'Official Digital Certificate'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'प्रिंट / PDF सेव्ह' : 'Print / Save PDF'}</span>
            </button>
            <button
              onClick={() => setViewingCertificate(null)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Certificate Body */}
        <div className="p-8 bg-[#fffef9] border-8 border-double border-amber-800/40 m-4 rounded-xl text-slate-900 printable-certificate relative selection:bg-none">
          {/* Watermark Emblem */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Landmark className="w-96 h-96 text-slate-900" />
          </div>

          {/* Government Header */}
          <div className="text-center border-b-2 border-amber-900/30 pb-4 space-y-1">
            <div className="flex items-center justify-center space-x-3 mb-1">
              <div className="w-12 h-12 rounded-full bg-amber-600/10 border border-amber-600/30 flex items-center justify-center p-2 text-amber-900">
                <Landmark className="w-full h-full" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest block font-serif">
              महाराष्ट्र शासन • ग्रामविकास विभाग (GOVERNMENT OF MAHARASHTRA)
            </span>
            <h2 className="text-xl font-black text-amber-950 font-serif">
              {panchayatInfo.nameMr}
            </h2>
            <p className="text-xs text-slate-700 font-semibold font-serif">
              ता. {panchayatInfo.talukaMr}, जि. {panchayatInfo.districtMr} - {panchayatInfo.pincode}
            </p>
          </div>

          {/* Certificate Number & Date Strip */}
          <div className="flex justify-between items-center py-2.5 text-[11px] font-mono border-b border-slate-200">
            <div>
              <span className="text-slate-500">दाखला क्र. / Cert No: </span>
              <strong className="text-amber-900 font-bold">
                {viewingCertificate.certificateNumber || 
                 `MH-${(viewingCertificate.district || panchayatInfo.districtMr || 'MAHA').slice(0, 3).toUpperCase()}-${(viewingCertificate.taluka || panchayatInfo.talukaMr || 'TAL').slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${(viewingCertificate.type || 'CERT').slice(0, 3).toUpperCase()}-${viewingCertificate.id ? viewingCertificate.id.slice(-4).toUpperCase() : '101'}`}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">दिनांक / Date: </span>
              <strong className="text-slate-800">{viewingCertificate.processedDate || viewingCertificate.appliedDate || new Date().toISOString().split('T')[0]}</strong>
            </div>
          </div>

          {/* Title Box */}
          <div className="text-center my-5">
            <span className="inline-block px-6 py-1.5 bg-amber-100/70 border border-amber-800/40 rounded-full text-base font-black text-amber-950 font-serif tracking-wider shadow-sm">
              {titleObj.mr}
            </span>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">
              {titleObj.en}
            </div>
          </div>

          {/* Certificate Content Text */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-800 font-serif px-2">
            <p className="text-justify indent-8">
              दाखला देण्यात येतो की, <strong>{viewingCertificate.applicantName}</strong> (आधार क्र. <strong>{viewingCertificate.applicantAadhaar || 'XXXX-XXXX-XXXX'}</strong>) हे <strong>{viewingCertificate.gramPanchayat || panchayatInfo.nameMr}</strong> चे हद्दीतील <strong>{viewingCertificate.wardNo}</strong>, घर क्रमांक <strong>{viewingCertificate.houseNo || '-'}</strong> येथे वास्तव्यास आहेत.
            </p>

            {viewingCertificate.type === 'residence' && (
              <p className="text-justify">
                ग्रामपंचायतीच्या नमुना ८ व कर निर्धारणी रजिस्टर नोंदीनुसार, सदर व्यक्ती गावात <strong>{viewingCertificate.details?.residentSince ? `${viewingCertificate.details.residentSince}` : 'कायमस्वरूपी'}</strong> नियमित वास्तव्य करत असून त्यांचे वर्तन चांगले आहे.
              </p>
            )}

            {viewingCertificate.type === 'income' && (
              <p className="text-justify">
                स्थानिक चौकशीनुसार व उपलब्ध नोंदीनुसार अर्जदाराचे सर्व मार्गांनी मिळणारे वार्षिक कौटुंबिक उत्पन्न <strong>{viewingCertificate.details?.annualIncome || 'सक्षम महसूल प्राधिकरणाने प्रमाणित केल्यानुसार'}</strong> आहे.
              </p>
            )}

            {viewingCertificate.type === 'nodues' && (
              <p className="text-justify">
                अर्जदाराच्या नावावर असलेल्या मिळकत क्र. <strong>{viewingCertificate.houseNo || '-'}</strong> चे चालू आर्थिक वर्षाचे सर्व घरपट्टी व पाणीपट्टी कर भरलेले असून ग्रामपंचायतीची कोणतीही थकबाकी शिल्लक नाही.
              </p>
            )}

            <p className="text-justify">
              सदर दाखला अर्जदाराच्या विनंतीवरून <strong>"{viewingCertificate.reason || 'शासकीय व वैयक्तिक कामासाठी'}"</strong> या प्रयोजनासाठी देण्यात येत आहे.
            </p>
          </div>

          {/* Verification QR & Signatures Footer */}
          <div className="mt-8 pt-4 border-t-2 border-amber-900/30 flex items-end justify-between">
            {/* QR Code */}
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-sm">
                <svg viewBox="0 0 100 100" className="w-16 h-16">
                  <rect x="5" y="5" width="25" height="25" fill="#78350f" />
                  <rect x="10" y="10" width="15" height="15" fill="#fffef9" />
                  <rect x="13" y="13" width="9" height="9" fill="#78350f" />
                  <rect x="70" y="5" width="25" height="25" fill="#78350f" />
                  <rect x="75" y="10" width="15" height="15" fill="#fffef9" />
                  <rect x="78" y="13" width="9" height="9" fill="#78350f" />
                  <rect x="5" y="70" width="25" height="25" fill="#78350f" />
                  <rect x="10" y="75" width="15" height="15" fill="#fffef9" />
                  <rect x="13" y="78" width="9" height="9" fill="#78350f" />
                  <rect x="35" y="20" width="12" height="12" fill="#78350f" />
                  <rect x="55" y="40" width="15" height="15" fill="#78350f" />
                  <rect x="40" y="65" width="20" height="10" fill="#78350f" />
                  <rect x="75" y="75" width="15" height="15" fill="#78350f" />
                </svg>
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                <span className="font-bold text-emerald-800 block">✓ DIGITALLY VERIFIED</span>
                <span>Scan for authenticity</span>
              </div>
            </div>

            {/* Official Digital Signatures */}
            <div className="flex space-x-6 text-center text-xs font-serif">
              <div>
                <div className="w-28 h-10 border-b border-dashed border-slate-400 flex items-center justify-center text-blue-900 font-mono text-[10px] italic">
                  [Digitally Signed]
                </div>
                <strong className="block text-slate-900 mt-1">{panchayatInfo.gramSevakName}</strong>
                <span className="text-[10px] text-slate-600">ग्रामविकास अधिकारी</span>
              </div>

              <div>
                <div className="w-28 h-10 border-b border-dashed border-slate-400 flex items-center justify-center text-amber-900 font-mono text-[10px] italic">
                  [Digitally Signed]
                </div>
                <strong className="block text-slate-900 mt-1">{panchayatInfo.sarpanchName}</strong>
                <span className="text-[10px] text-slate-600">सरपंच, {panchayatInfo.nameMr}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[9px] text-slate-400 font-mono mt-4 pt-2 border-t border-slate-100">
            This is a computer generated digitally signed document as per IT Act 2000. No physical signature required.
          </div>
        </div>
      </div>
    </div>
  );
};
