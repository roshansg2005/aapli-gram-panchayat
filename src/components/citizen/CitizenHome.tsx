import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  AlertCircle, 
  CreditCard, 
  Layers, 
  Calendar, 
  PhoneCall, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Landmark, 
  HeartHandshake, 
  TrendingUp, 
  Award, 
  Users 
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';

export const CitizenHome: React.FC = () => {
  const { 
    language, 
    t, 
    setMobileTab, 
    certificates, 
    grievances, 
    taxRecords, 
    notices, 
    panchayatInfo,
    schemes,
    currentUser 
  } = useApp();

  const currentGpName = currentUser?.gramPanchayat || panchayatInfo.nameMr;
  const currentTaluka = currentUser?.taluka || panchayatInfo.talukaMr;
  const currentDistrict = currentUser?.district || panchayatInfo.districtMr;

  // Filter dynamic citizen records
  const myCerts = certificates.filter(c => 
    (currentUser?.phone && c.applicantPhone === currentUser.phone) || 
    (currentUser?.name && c.applicantName.toLowerCase() === currentUser.name.toLowerCase())
  );
  const myApprovedCerts = myCerts.filter(c => c.status === 'approved').length;
  const myPendingCerts = myCerts.filter(c => c.status === 'pending' || c.status === 'under_scrutiny').length;

  const myGrievances = grievances.filter(g => 
    (currentUser?.phone && g.citizenPhone === currentUser.phone) || 
    (currentUser?.name && g.citizenName.toLowerCase() === currentUser.name.toLowerCase())
  );
  const activeGrievances = myGrievances.filter(g => g.status !== 'resolved').length;
  const gpNotices = notices.filter(n => matchGramPanchayat(n.gramPanchayat, currentGpName));
  const gpSchemes = schemes.filter(s => matchGramPanchayat(s.gramPanchayat, currentGpName));
  const latestNotice = gpNotices[0];

  const quickActionCards = [
    {
      id: 'certificates',
      title: language === 'mr' ? 'दाखले व प्रमाणपत्रे' : 'Certificates & NOC',
      desc: language === 'mr' ? 'रहिवासी, जन्म, उत्पन्न, नाहरकत दाखले' : 'Residence, Birth, Income & NOC',
      icon: FileText,
      color: 'from-blue-600 to-indigo-700',
      tab: 'certificates' as const,
      badge: `${myCerts.length} ${language === 'mr' ? 'अर्ज' : 'Apps'}`
    },
    {
      id: 'tax',
      title: language === 'mr' ? 'घरपट्टी / पाणीपट्टी' : 'Property & Water Tax',
      desc: language === 'mr' ? '१०% सवलतीसह ऑनलाइन कर भरणा' : 'Pay online with 10% rebate',
      icon: CreditCard,
      color: 'from-emerald-600 to-teal-700',
      tab: 'tax' as const,
      badge: language === 'mr' ? '१०% सवलत' : '10% Off'
    },
    {
      id: 'grievances',
      title: language === 'mr' ? 'तक्रार निवारण कक्ष' : 'Grievance Desk',
      desc: language === 'mr' ? 'पाणी, रस्ते, पथदिवे तक्रार नोंदवा' : 'Water, lights & road issues',
      icon: AlertCircle,
      color: 'from-amber-600 to-orange-700',
      tab: 'grievances' as const,
      badge: `${activeGrievances} ${language === 'mr' ? 'सुरू' : 'Active'}`
    },
    {
      id: 'schemes',
      title: language === 'mr' ? 'शासकीय योजना' : 'Govt Schemes',
      desc: gpSchemes.length > 0 
        ? (language === 'mr' ? `${gpSchemes[0].nameMr}` : `${gpSchemes[0].nameEn}`)
        : (language === 'mr' ? 'ग्रामपंचायत शासकीय योजना' : 'Gram Panchayat Schemes'),
      icon: Layers,
      color: 'from-purple-600 to-pink-700',
      tab: 'schemes' as const,
      badge: `${gpSchemes.length} ${language === 'mr' ? 'योजना' : 'Schemes'}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* 🌟 Top Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gov-navy via-slate-800 to-slate-950 p-6 md:p-8 text-white shadow-xl border border-amber-500/20">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'डिजिटल ग्रामपंचायत ई-सेवा' : 'Digital Panchayat E-Services'}</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black leading-tight text-white">
              {currentUser ? (
                language === 'mr' ? `स्वागत आहे, ${currentUser.name}!` : `Welcome, ${currentUser.name}!`
              ) : t('welcomeCitizen')}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {currentGpName}, {language === 'mr' ? `तालुका ${currentTaluka}, जिल्हा ${currentDistrict}` : `Taluka ${currentTaluka}, District ${currentDistrict}`}.
            </p>
          </div>

          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3.5 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Landmark className="w-full h-full" />
          </div>
        </div>

        {/* Quick Stats Grid inside Hero Banner */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6 pt-6 border-t border-white/15 text-center">
          <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-3 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] md:text-xs text-slate-300 block">{t('citizenStatApplications')}</span>
            <span className="text-base md:text-2xl font-extrabold text-amber-400 mt-0.5 block">
              {myPendingCerts} <span className="text-xs font-normal text-slate-300">({myApprovedCerts} मंजूर)</span>
            </span>
          </div>
          <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-3 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] md:text-xs text-slate-300 block">{t('citizenStatGrievances')}</span>
            <span className="text-base md:text-2xl font-extrabold text-orange-400 mt-0.5 block">
              {activeGrievances} <span className="text-xs font-normal text-slate-300">सुरू</span>
            </span>
          </div>
          <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-3 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] md:text-xs text-slate-300 block">{t('citizenStatActiveSchemes')}</span>
            <span className="text-base md:text-2xl font-extrabold text-emerald-400 mt-0.5 block">
              {schemes.length} <span className="text-xs font-normal text-slate-300">योजना</span>
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 4 Core Action Tiles */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-5 bg-orange-600 rounded-full" />
            {t('quickServices')}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {quickActionCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => setMobileTab(card.tab)}
                className="group relative overflow-hidden bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-orange-300 transition-all text-left flex flex-col justify-between active:scale-[0.98]"
              >
                <div className="flex items-start justify-between w-full mb-3">
                  <div className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {card.badge}
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs md:text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 Responsive 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Featured Scheme & Notice */}
        <div className="lg:col-span-7 space-y-6">
          {/* Featured Scheme Banner - Only if schemes are published */}
          {schemes.length > 0 && (
            <div 
              onClick={() => setMobileTab('schemes')}
              className="cursor-pointer bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-800 text-white rounded-3xl p-5 md:p-6 shadow-lg flex items-center justify-between hover:opacity-95 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 flex items-center justify-center p-3 text-white group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-full h-full" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-amber-200">
                    {schemes[0].category || (language === 'mr' ? 'विशेष शासकीय योजना' : 'Special Govt Scheme')}
                  </span>
                  <h4 className="font-black text-sm md:text-lg mt-1.5">
                    {language === 'mr' ? schemes[0].nameMr : schemes[0].nameEn}
                  </h4>
                  <p className="text-xs text-purple-100 mt-0.5">
                    ★ {language === 'mr' ? schemes[0].benefitMr : schemes[0].benefitEn}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-amber-300 shrink-0 group-hover:translate-x-1.5 transition-transform" />
            </div>
          )}

          {/* Latest Gram Sabha & Notices Card */}
          {latestNotice ? (
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  {t('gramSabhaSchedule')}
                </span>
                <button 
                  onClick={() => setMobileTab('notices')}
                  className="text-xs text-orange-600 font-bold flex items-center hover:underline"
                >
                  {language === 'mr' ? 'सर्व सूचना पहा' : 'View All Notices'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-orange-50/70 rounded-2xl p-4 border border-orange-200/80">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-orange-800 uppercase bg-orange-200 px-2.5 py-0.5 rounded-md">
                      {latestNotice.type}
                    </span>
                    <h5 className="font-extrabold text-xs md:text-sm text-slate-900 mt-2">
                      {language === 'mr' ? latestNotice.titleMr : latestNotice.titleEn}
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {language === 'mr' ? latestNotice.descriptionMr : latestNotice.descriptionEn}
                    </p>
                  </div>
                </div>

                {latestNotice.venue && (
                  <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5 pt-2 border-t border-orange-200/60 font-medium">
                    <span className="font-bold text-slate-800">
                      {language === 'mr' ? 'स्थळ:' : 'Venue:'}
                    </span> 
                    {latestNotice.venue} | {latestNotice.time}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-xs text-slate-500">
              <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800">सद्यस्थितीत कोणतीही नवीन सूचना नाही</p>
              <p className="text-[11px] text-slate-400 mt-0.5">ग्रामसभेचे पुढील नियोजन प्रसिद्ध झाल्यावर येथे दिसेल.</p>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): 24/7 Helpline & Quick Directory */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm md:text-base font-black text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                {t('emergencyHelpline')} (24x7)
              </h4>
              <button 
                onClick={() => setMobileTab('directory')}
                className="text-xs text-slate-300 hover:text-white underline font-semibold"
              >
                {t('navDirectory')}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <a 
                href="tel:18001208040"
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl border border-white/10 transition-colors"
              >
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    {language === 'mr' ? 'ग्रामपंचायत हेल्पलाइन कार्यालय' : 'Panchayat Helpline Office'}
                  </span>
                  <span className="font-extrabold text-sm text-white">१८००-१२०-८०४०</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>

              <a 
                href="tel:112"
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl border border-white/10 transition-colors"
              >
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    {language === 'mr' ? 'पोलीस नियंत्रण कक्ष (Police Help)' : 'Police Control Room'}
                  </span>
                  <span className="font-extrabold text-sm text-white">११२ (24x7 Toll Free)</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>

              <a 
                href="tel:108"
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl border border-white/10 transition-colors"
              >
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    {language === 'mr' ? '१०८ रुग्णवाहिका / आपत्कालीन आरोग्य' : '108 Ambulance / Emergency'}
                  </span>
                  <span className="font-extrabold text-sm text-white">१०८ (Toll Free)</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
