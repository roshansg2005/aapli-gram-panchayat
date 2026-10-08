import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  AlertTriangle, 
  Receipt, 
  HardHat, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Users, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Landmark,
  Inbox
} from 'lucide-react';
import { matchGramPanchayat } from '../../utils/jurisdiction';
import { isTabAllowedForRole } from '../../config/rolePermissions';

export const DesktopDashboard: React.FC = () => {
  const { 
    language, 
    t, 
    currentUser,
    users,
    certificates, 
    grievances, 
    taxRecords, 
    projects, 
    schemes, 
    setDesktopTab, 
    setViewingCertificate 
  } = useApp();

  const currentGp = currentUser?.gramPanchayat;

  // Filter records strictly for this Gram Panchayat
  const gpCertificates = currentGp ? certificates.filter(c => matchGramPanchayat(c.gramPanchayat, currentGp)) : certificates;
  const gpGrievances = currentGp ? grievances.filter(g => matchGramPanchayat(g.gramPanchayat, currentGp)) : grievances;
  const gpTaxRecords = currentGp ? taxRecords.filter(t => matchGramPanchayat(t.gramPanchayat, currentGp)) : taxRecords;
  const gpProjects = currentGp ? projects.filter(p => matchGramPanchayat(p.gramPanchayat, currentGp)) : projects;
  const gpUsers = currentGp ? users.filter(u => matchGramPanchayat(u.gramPanchayat, currentGp)) : users;

  const totalCertificates = gpCertificates.length;
  const pendingCerts = gpCertificates.filter(c => c.status === 'pending' || c.status === 'under_scrutiny');
  const approvedCerts = gpCertificates.filter(c => c.status === 'approved').length;

  const totalGrievances = gpGrievances.length;
  const resolvedGrievances = gpGrievances.filter(g => g.status === 'resolved').length;
  const activeGrievances = gpGrievances.filter(g => g.status !== 'resolved');
  const resolutionRate = totalGrievances > 0 ? Math.round((resolvedGrievances / totalGrievances) * 100) : 100;

  const totalTaxDemand = gpTaxRecords.reduce((sum, r) => sum + (r.finalAmount || 0), 0);
  const totalTaxCollected = gpTaxRecords.filter(r => r.isPaid).reduce((sum, r) => sum + (r.finalAmount || 0), 0);
  const taxCollectionRate = totalTaxDemand > 0 ? Math.round((totalTaxCollected / totalTaxDemand) * 100) : 100;

  const totalProjectsBudget = gpProjects.reduce((sum, p) => sum + (p.allocatedBudget || 0), 0);
  const totalProjectsSpent = gpProjects.reduce((sum, p) => sum + (p.spentBudget || 0), 0);

  const registeredCitizensCount = gpUsers.filter(u => u.role === 'citizen').length;
  const registeredStaffCount = gpUsers.filter(u => u.role !== 'citizen').length;
  const registeredHouseholds = new Set(gpUsers.map(u => u.houseNo).filter(Boolean)).size || registeredCitizensCount;
  const totalGpsCovered = new Set(users.map(u => u.gramPanchayat).filter(Boolean)).size;

  // 🛡️ DEDICATED MASTER ADMIN DASHBOARD VIEW
  if (currentUser?.role === 'admin') {
    const totalUsersCount = users.length;
    const totalStaffCount = users.filter(u => u.role !== 'citizen').length;
    const activeUsersCount = users.filter(u => u.isActive !== false).length;

    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-purple-500/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                {language === 'mr' ? 'मुख्य प्रशासकीय डॅशबोर्ड' : 'Master System Administration'}
              </span>
              <span className="text-xs text-slate-400 font-mono">Total GPs: {totalGpsCovered}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black mt-2 tracking-tight text-white flex items-center gap-2">
              <Landmark className="w-7 h-7 text-amber-400" />
              <span>{language === 'mr' ? 'प्रणाली सर्वंकष संनियंत्रण डॅशबोर्ड' : 'Master System Analytics & Oversight'}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              {language === 'mr' 
                ? 'महाराष्ट्र शासन आपली ग्रामपंचायत डिजिटल महापोर्टल — सर्व ग्रामपंचायतींचे युझर्स, अधिकारी व प्रणाली सांख्यिकी.'
                : 'Centralized administrative controls, user management, and multi-panchayat analytics overview.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDesktopTab('admin_users')}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs md:text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 border border-purple-400/30"
            >
              <Users className="w-4 h-4" />
              <span>{language === 'mr' ? 'युझर व्यवस्थापन (User Management)' : 'Manage Users'}</span>
            </button>
          </div>
        </div>

        {/* 4 Master Admin KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div 
            onClick={() => setDesktopTab('admin_users')}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'mr' ? 'एकूण नोंदणीकृत युझर्स' : 'Total System Users'}
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900">{totalUsersCount}</h3>
              <div className="flex items-center space-x-2 mt-2 text-xs">
                <span className="text-emerald-600 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  {activeUsersCount} {language === 'mr' ? 'सक्रिय खाती' : 'Active'}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-purple-600 font-semibold flex items-center group-hover:underline">
                  {language === 'mr' ? 'व्यवस्थापित करा' : 'Manage'} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Officers & Staff */}
          <div 
            onClick={() => setDesktopTab('admin_users')}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'mr' ? 'अधिकारी व कर्मचारी' : 'Officers & Staff'}
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900">{totalStaffCount}</h3>
              <div className="flex items-center space-x-2 mt-2 text-xs">
                <span className="text-blue-600 font-medium">
                  {language === 'mr' ? 'सरपंच, ग्रामसेवक, लिपिक' : 'Elected & Admin Staff'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Gram Panchayats Covered */}
          <div 
            onClick={() => setDesktopTab('directory')}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'mr' ? 'समाविष्ट ग्रामपंचायती' : 'Covered Gram Panchayats'}
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900">{totalGpsCovered}</h3>
              <div className="flex items-center space-x-2 mt-2 text-xs">
                <span className="text-amber-700 font-medium">
                  {language === 'mr' ? 'महाराष्ट्र राज्य नेटवर्क' : 'Maharashtra State Network'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: System Health */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'mr' ? 'सिस्टीम व DB स्थिती' : 'System & DB Status'}
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1.5 text-sm font-black text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>SQLite DB Active</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Port 5000 API • Port 5173 Web
              </p>
            </div>
          </div>
        </div>

        {/* Master Quick Shortcuts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Recent Registered Users Preview */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  {language === 'mr' ? 'अलीकडील नोंदणीकृत युझर्स (Recent Users)' : 'Recent Registered Users'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'mr' ? 'प्रणालीतील ताज्या नागरिक व अधिकारी खात्यांची यादी' : 'Latest accounts registered in the system'}
                </p>
              </div>
              <button
                onClick={() => setDesktopTab('admin_users')}
                className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1"
              >
                {language === 'mr' ? 'सर्व युझर्स व्यवस्थापन' : 'View All Users'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">{language === 'mr' ? 'युझर नाव' : 'User'}</th>
                    <th className="py-2.5 px-3">{language === 'mr' ? 'पद (Role)' : 'Role'}</th>
                    <th className="py-2.5 px-3">{language === 'mr' ? 'ग्रामपंचायत' : 'Gram Panchayat'}</th>
                    <th className="py-2.5 px-3 text-right">{language === 'mr' ? 'स्थिती' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.slice(0, 5).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <img
                            src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[140px]">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-700 text-xs truncate max-w-[130px] block">
                          {u.gramPanchayat || 'सर्व GP'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          u.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: Admin Controls & Security */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                {language === 'mr' ? 'प्रशासकीय जलद कृती' : 'Admin Quick Controls'}
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setDesktopTab('admin_users')}
                  className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold rounded-xl text-xs flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    {language === 'mr' ? 'नवीन युझर / अधिकारी जोडा' : 'Add New User / Staff'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDesktopTab('directory')}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-amber-600" />
                    {language === 'mr' ? 'ग्रामपंचायत व कर्मचारी निर्देशिका' : 'Village & Staff Directory'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-3xl p-5 shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">🔐 Security Level</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">MAXIMUM</span>
              </div>
              <p className="text-xs text-slate-300">
                {language === 'mr' 
                  ? 'तुम्ही मुख्य सिस्टीम ॲडमिन म्हणून अधिकृत आहात. अनधिकृत प्रवेश बंद आहे.'
                  : 'Authenticated with Master Admin Privileges.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Certificates */}
        <div 
          onClick={() => isTabAllowedForRole('certificates', currentUser?.role) && setDesktopTab('certificates')}
          className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs transition-all group ${
            isTabAllowedForRole('certificates', currentUser?.role) ? 'hover:shadow-md cursor-pointer' : 'opacity-90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'दाखले अर्ज' : 'Certificates'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              {pendingCerts.length} <span className="text-xs font-medium text-slate-500">प्रलंबित / {totalCertificates} एकूण</span>
            </h3>
            <div className="flex items-center space-x-2 mt-2 text-xs">
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {approvedCerts} मंजूर
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-blue-600 font-semibold flex items-center group-hover:underline">
                छाननी करा <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Grievances */}
        <div 
          onClick={() => isTabAllowedForRole('grievances', currentUser?.role) && setDesktopTab('grievances')}
          className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs transition-all group ${
            isTabAllowedForRole('grievances', currentUser?.role) ? 'hover:shadow-md cursor-pointer' : 'opacity-90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'तक्रार निवारण दर' : 'Grievance Resolution'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              {resolutionRate}% <span className="text-xs font-medium text-slate-500">({resolvedGrievances}/{totalGrievances} पूर्ण)</span>
            </h3>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${resolutionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Tax Collection */}
        <div 
          onClick={() => isTabAllowedForRole('tax', currentUser?.role) && setDesktopTab('tax')}
          className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs transition-all group ${
            isTabAllowedForRole('tax', currentUser?.role) ? 'hover:shadow-md cursor-pointer' : 'opacity-90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'कर संकलन (FY 26-27)' : 'Tax Collection'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-700">
              ₹ {totalTaxCollected.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center justify-between text-xs mt-2 text-slate-500">
              <span>मागणी: ₹ {totalTaxDemand.toLocaleString('en-IN')}</span>
              <span className="font-bold text-emerald-600">{taxCollectionRate}% जमा</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Infrastructure Works */}
        <div 
          onClick={() => isTabAllowedForRole('development', currentUser?.role) && setDesktopTab('development')}
          className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs transition-all group ${
            isTabAllowedForRole('development', currentUser?.role) ? 'hover:shadow-md cursor-pointer' : 'opacity-90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'गाव विकास निधी' : 'Development Grants'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              ₹ {(totalProjectsBudget / 100000).toFixed(1)} <span className="text-sm font-medium text-slate-500">लाख निधी</span>
            </h3>
            <div className="flex items-center justify-between text-xs mt-2 text-slate-500">
              <span>खर्च: ₹ {(totalProjectsSpent / 100000).toFixed(1)}L</span>
              <span className="font-bold text-purple-600">{gpProjects.length} विकासकामे</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Actionable Queues & Revenue Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Scrutiny Queue & Open Grievances */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Queue 1: Pending Certificate Scrutiny */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {language === 'mr' ? 'ग्रामसेवक छाननी व स्वाक्षरी प्रलंबित अर्ज' : 'Certificates Awaiting Verification & Digital Signature'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {pendingCerts.length} {language === 'mr' ? 'अर्ज मंजुरीच्या प्रतीक्षेत आहेत' : 'applications in queue'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDesktopTab('certificates')}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                {language === 'mr' ? 'सर्व अर्ज पहा' : 'View All'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingCerts.length > 0 ? (
              <div className="space-y-2.5">
                {pendingCerts.slice(0, 3).map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between hover:bg-white hover:border-blue-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                          #{cert.applicationNo}
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {cert.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1">
                        {cert.applicantName} ({cert.houseNo || 'घर क्र. उपलब्ध नाही'}, {cert.wardNo || 'Ward 1'})
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-md">
                        {cert.reason || 'प्रमाणपत्र मागणी'}
                      </p>
                    </div>

                    <button
                      onClick={() => setDesktopTab('certificates')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all shrink-0"
                    >
                      {language === 'mr' ? 'छाननी करा' : 'Review'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                <span className="font-bold text-slate-700">
                  {language === 'mr' ? 'सद्यस्थितीत कोणतेही प्रलंबित दाखले अर्ज नाहीत!' : 'No pending certificate applications in this Panchayat!'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {language === 'mr' ? 'नागरिकांनी नवीन अर्ज सादर केल्यावर ते तात्काळ येथे दिसतील.' : 'New citizen applications will appear here in real-time.'}
                </span>
              </div>
            )}
          </div>

          {/* Action Queue 2: Grievances Board */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {language === 'mr' ? 'सुरू तक्रारी व वॉर्ड जबाबदारी' : 'Open Citizen Grievances'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {activeGrievances.length} {language === 'mr' ? 'तक्रारींवर कार्यवाही सुरू' : 'active issues'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDesktopTab('grievances')}
                className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1"
              >
                {language === 'mr' ? 'तक्रार कक्ष उघडा' : 'Open Grievance Desk'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeGrievances.length > 0 ? (
              <div className="space-y-2.5">
                {activeGrievances.slice(0, 3).map((grv) => (
                  <div
                    key={grv.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      {grv.photoUrl && (
                        <img
                          src={grv.photoUrl}
                          alt="issue"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-400">#{grv.ticketNo}</span>
                          <span className="text-[10px] font-bold uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                            {grv.category}
                          </span>
                          <span className="text-[10px] text-slate-500">📍 {grv.wardNo}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-0.5">
                          {grv.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {grv.citizenName} ({grv.citizenPhone})
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      grv.status === 'resolved' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {grv.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                <span className="font-bold text-slate-700">
                  {language === 'mr' ? 'सद्यस्थितीत कोणतीही प्रलंबित तक्रार नाही!' : 'No open complaints in this Panchayat!'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {language === 'mr' ? 'ग्रामस्थांनी नोंदवलेल्या सर्व तक्रारींचे निवारण झाले आहे.' : 'All citizen issues have been addressed.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tax Collection Spotlight & Dynamic Village Metrics */}
        <div className="space-y-6">
          {/* Tax Collection Progress Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              {language === 'mr' ? 'कर संकलन प्रगती अहवाल' : 'Tax Collection Progress'}
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{language === 'mr' ? 'घरपट्टी संकलन' : 'Property Tax'}</span>
                  <span className="font-bold text-slate-900">{taxCollectionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${taxCollectionRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{language === 'mr' ? 'पाणीपट्टी संकलन' : 'Water Tax'}</span>
                  <span className="font-bold text-slate-900">{taxCollectionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full transition-all" style={{ width: `${taxCollectionRate}%` }} />
                </div>
              </div>
            </div>

            <button
              onClick={() => setDesktopTab('tax')}
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Receipt className="w-4 h-4 text-emerald-600" />
              {language === 'mr' ? 'कर नोंदवही व पावती काउंटर' : 'Open Tax Ledger & Counter'}
            </button>
          </div>

          {/* Dynamic Village Statistics Box */}
          <div className="bg-gradient-to-br from-gov-navy to-slate-900 text-white rounded-2xl p-5 shadow-md space-y-3">
            <h3 className="font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>{language === 'mr' ? 'ग्रामपंचायत सांख्यिकी' : 'Village Statistics'}</span>
              <span className="text-[10px] text-slate-400 font-mono">LIVE DB</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-300 block">{language === 'mr' ? 'नोंदणीकृत नागरिक' : 'Registered Citizens'}</span>
                <span className="text-base font-bold text-white">{registeredCitizensCount}</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-300 block">{language === 'mr' ? 'नोंदणीकृत कुटुंबे' : 'Households'}</span>
                <span className="text-base font-bold text-white">{registeredHouseholds}</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-300 block">{language === 'mr' ? 'एकूण वॉर्ड' : 'Total Wards'}</span>
                <span className="text-base font-bold text-amber-300">६ वॉर्ड</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-300 block">{language === 'mr' ? 'दाखले अर्ज' : 'Applications'}</span>
                <span className="text-base font-bold text-emerald-300">{totalCertificates}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
