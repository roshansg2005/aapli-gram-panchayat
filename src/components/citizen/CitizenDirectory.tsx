import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  PhoneCall, 
  Mail, 
  ShieldCheck, 
  Landmark, 
  MapPin, 
  Clock,
  HeartPulse,
  Award
} from 'lucide-react';

export const CitizenDirectory: React.FC = () => {
  const { language, t, officials, panchayatInfo } = useApp();

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gov-navy to-slate-800 rounded-xl p-3.5 text-white shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white/10 rounded-lg">
            <Users className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="font-bold text-sm">{t('directoryHeading')}</h2>
            <p className="text-[11px] text-slate-300">{t('directorySub')}</p>
          </div>
        </div>
      </div>

      {/* Panchayat Office Info Card */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2 text-xs">
        <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-orange-600">
          <Landmark className="w-4 h-4" />
          {language === 'mr' ? panchayatInfo.nameMr : panchayatInfo.nameEn}
        </h3>
        
        <div className="space-y-1 text-slate-600 text-[11px]">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {language === 'mr'
                ? `मु. पो. ${panchayatInfo.nameMr || 'ग्रामपंचायत'}, ता. ${panchayatInfo.talukaMr}, जि. ${panchayatInfo.districtMr} - ${panchayatInfo.pincode}`
                : `At Post ${panchayatInfo.nameEn || 'Gram Panchayat'}, Tal. ${panchayatInfo.talukaEn}, Dist. ${panchayatInfo.districtEn} - ${panchayatInfo.pincode}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{language === 'mr' ? panchayatInfo.officeHoursMr : panchayatInfo.officeHoursEn}</span>
          </div>
        </div>
      </div>

      {/* Emergency Quick Action Numbers */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`tel:${panchayatInfo.ambulanceNumber}`}
          className="bg-red-50 border border-red-200 p-2.5 rounded-xl flex items-center justify-between text-red-900 hover:bg-red-100 transition-colors"
        >
          <div>
            <span className="text-[10px] font-bold uppercase text-red-600 block">
              {language === 'mr' ? 'रुग्णवाहिका' : 'Ambulance'}
            </span>
            <span className="font-extrabold text-sm">{panchayatInfo.ambulanceNumber}</span>
          </div>
          <HeartPulse className="w-5 h-5 text-red-600" />
        </a>

        <a
          href={`tel:${panchayatInfo.policePatilNumber}`}
          className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl flex items-center justify-between text-blue-900 hover:bg-blue-100 transition-colors"
        >
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-600 block">
              {language === 'mr' ? 'पोलीस पाटील' : 'Police Patil'}
            </span>
            <span className="font-extrabold text-xs truncate max-w-[90px]">{panchayatInfo.policePatilNumber}</span>
          </div>
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </a>
      </div>

      {/* Officials List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-800">
          {language === 'mr' ? 'लोकप्रतिनिधी व प्रशासकीय अधिकारी' : 'Representatives & Officers'}
        </h3>

        {officials.map((official) => (
          <div
            key={official.id}
            className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:border-slate-300"
          >
            <div className="flex items-center space-x-3">
              <img
                src={official.photoUrl}
                alt={official.nameEn}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30"
              />
              <div>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {language === 'mr' ? official.designationMr : official.designationEn}
                </span>
                <h4 className="font-bold text-xs text-slate-900 mt-1">
                  {language === 'mr' ? official.nameMr : official.nameEn}
                </h4>
                {official.wardNo && (
                  <span className="text-[10px] text-slate-500 block">
                    📍 {official.wardNo}
                  </span>
                )}
              </div>
            </div>

            <a
              href={`tel:${official.phone}`}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-full shadow-sm active:scale-90 transition-all"
              title="Call Official"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
