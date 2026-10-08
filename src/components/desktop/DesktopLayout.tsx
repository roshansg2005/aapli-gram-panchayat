import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  FileCheck2, 
  AlertTriangle, 
  Receipt, 
  Layers, 
  HardHat, 
  Calendar, 
  Users2, 
  Languages, 
  Landmark,
  ShieldCheck, 
  ShieldAlert, 
  LogOut, 
  Lock, 
  ArrowLeft, 
  Edit3, 
  X, 
  Save, 
  Upload, 
  Trash2, 
  Camera, 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  Smartphone,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { DesktopTab, UserRole } from '../../types';
import { getRoleConfig, MASTER_SIDEBAR_LINKS } from '../../config/rolePermissions';
import { formatUserName } from '../../utils/nameLocalization';
import { formatGramPanchayat } from '../../utils/jurisdiction';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

const STAFF_PRESET_AVATARS = [
  {
    nameMr: 'गटविकास अधिकारी (BDO)',
    nameEn: 'Block Development Officer (BDO)',
    role: 'taluka_bdo' as UserRole,
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'ग्रामविकास अधिकारी / ग्रामसेवक',
    nameEn: 'Gram Sevak / Sachiv',
    role: 'gram_sevak' as UserRole,
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'सरपंच (लोकप्रतिनिधी)',
    nameEn: 'Sarpanch',
    role: 'sarpanch' as UserRole,
    url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'उपसरपंच (वॉर्ड समन्वयक)',
    nameEn: 'Up-Sarpanch',
    role: 'upsarpanch' as UserRole,
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'ग्रामपंचायत सदस्य (वॉर्ड प्रतिनिधी)',
    nameEn: 'Ward Member (Sadasya)',
    role: 'sadasya' as UserRole,
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'कर वसुली लिपिक / संगणक परिचालक',
    nameEn: 'Tax Clerk / Operator',
    role: 'tax_clerk' as UserRole,
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
  }
];

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  const { 
    language, 
    toggleLanguage, 
    t, 
    desktopTab, 
    setDesktopTab, 
    setAppMode, 
    certificates, 
    grievances, 
    panchayatInfo,
    currentUser,
    updateUserProfile,
    changeUserPassword,
    setShowAuthModal,
    setAuthType,
    logout
  } = useApp();

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [staffForm, setStaffForm] = useState({
    name: '',
    phone: '',
    email: '',
    designation: '',
    employeeCode: '',
    password: '',
    address: '',
    wardNo: '',
    gramPanchayat: '',
    taluka: '',
    district: '',
    avatarUrl: ''
  });

  const openStaffModal = () => {
    if (currentUser) {
      setStaffForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        designation: currentUser.designation || 'ग्रामविकास अधिकारी (Gram Sevak)',
        employeeCode: currentUser.employeeCode || '',
        password: '',
        address: currentUser.address || '',
        wardNo: currentUser.wardNo || 'Head Office',
        gramPanchayat: currentUser.gramPanchayat || panchayatInfo.nameMr,
        taluka: currentUser.taluka || panchayatInfo.talukaMr,
        district: currentUser.district || panchayatInfo.districtMr,
        avatarUrl: currentUser.avatarUrl || ''
      });
    }
    setShowStaffModal(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'mr' ? 'फोटोची साईझ ५ MB पेक्षा कमी असावी.' : 'Photo size must be less than 5 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStaffForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStaffProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.phone.trim()) {
      alert(language === 'mr' ? 'नाव आणि मोबाईल नंबर आवश्यक आहे.' : 'Name and phone are required.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        name: staffForm.name.trim(),
        phone: staffForm.phone.trim(),
        email: staffForm.email.trim() || undefined,
        designation: staffForm.designation.trim() || undefined,
        employeeCode: staffForm.employeeCode.trim() || undefined,
        address: staffForm.address.trim() || undefined,
        wardNo: staffForm.wardNo.trim() || undefined,
        gramPanchayat: staffForm.gramPanchayat.trim() || undefined,
        taluka: staffForm.taluka.trim() || undefined,
        district: staffForm.district.trim() || undefined,
        avatarUrl: staffForm.avatarUrl || undefined
      });

      if (staffForm.password.trim().length >= 4) {
        await changeUserPassword(staffForm.password.trim());
      }

      setShowStaffModal(false);
    } catch (err) {
      console.error('Failed to update staff profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isStaff = currentUser && currentUser.role !== 'citizen';

  // 🔒 STRICT ROLE-BASED ACCESS CONTROL (RBAC) GUARD
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-red-500/30 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              {language === 'mr' ? 'प्रशासकीय सुरक्षा निर्बंध' : 'Administrative Access Restricted'}
            </span>
            <h2 className="text-xl font-black text-white mt-3">
              {language === 'mr' ? 'अनधिकृत प्रवेश (Staff Access Only)' : 'Unauthorized Staff Access'}
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {language === 'mr'
                ? 'हे ग्रामपंचायत प्रशासकीय ERP पोर्टल फक्त अधिकृत ग्रामविकास अधिकारी, सरपंच व कर्मचाऱ्यांसाठी आहे. नागरिकांना या डेस्कटॉप कार्यप्रणालीचा थेट ॲक्सेस नाही.'
                : 'This Panchayat ERP is restricted strictly to authorized Gram Sevak, Sarpanch and Panchayat officers. Citizens do not have direct access to staff workstations.'}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                setAuthType('panchayat');
                setShowAuthModal(true);
              }}
              className="w-full py-3 bg-gradient-to-r from-blue-700 to-gov-navy hover:from-blue-800 hover:to-slate-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>{language === 'mr' ? 'ग्रामपंचायत अधिकारी लॉगिन करा' : 'Panchayat Staff Login'}</span>
            </button>

            <button
              onClick={() => setAppMode('citizen-mobile')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'mr' ? 'नागरिक मोबाइल पोर्टलवर जा' : 'Go to Citizen Mobile Portal'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingCertsCount = certificates.filter(c => c.status === 'pending' || c.status === 'under_scrutiny').length;
  const pendingGrvCount = grievances.filter(g => g.status !== 'resolved').length;

  const userRole = (currentUser?.role || 'staff') as UserRole;
  const roleConfig = getRoleConfig(userRole);
  const allowedTabs = roleConfig.allowedTabs;

  // Auto-switch to role default tab if current tab is not accessible
  React.useEffect(() => {
    if (!allowedTabs.includes(desktopTab)) {
      setDesktopTab(roleConfig.defaultTab);
    }
  }, [userRole, desktopTab, allowedTabs, roleConfig.defaultTab, setDesktopTab]);

  const allSidebarLinks = MASTER_SIDEBAR_LINKS.map(link => {
    let badge: number | undefined;
    let badgeColor: string | undefined;
    let labelMr = link.labelMr;
    let labelEn = link.labelEn;

    if (link.id === 'admin_users') {
      if (userRole === 'admin') {
        labelMr = 'युझर व्यवस्थापन (User Mgt)';
        labelEn = 'User Management';
      } else if (userRole === 'taluka_bdo') {
        labelMr = 'सरपंच व ग्रामसेवक नियुक्ती';
        labelEn = 'Appoint Sarpanch & Secretary';
      } else {
        labelMr = 'नागरिक व कर्मचारी नोंदणी';
        labelEn = 'Citizen & Staff Registration';
      }
    }

    if (link.id === 'certificates') {
      badge = pendingCertsCount;
      badgeColor = 'bg-amber-500 text-slate-950';
    } else if (link.id === 'grievances') {
      badge = pendingGrvCount;
      badgeColor = 'bg-red-500 text-white';
    }

    return {
      ...link,
      labelMr,
      labelEn,
      badge,
      badgeColor
    };
  });

  // Order sidebar links strictly as per the user's role configuration
  const visibleSidebarLinks = allowedTabs
    .map(tabId => allSidebarLinks.find(link => link.id === tabId))
    .filter((link): link is typeof allSidebarLinks[0] => Boolean(link));

  const roleMeta = {
    label: language === 'mr' ? roleConfig.roleTitleMr : roleConfig.roleTitleEn,
    color: roleConfig.color,
    icon: roleConfig.icon
  };
  const RoleIcon = roleConfig.icon;

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-gov-darknavy text-slate-200 flex flex-col shrink-0 border-r border-slate-800 shadow-xl">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800/80 bg-gov-navy/50 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-lg border border-white/20 shrink-0 overflow-hidden ring-1 ring-emerald-500/30">
            <img src="/logo.png" alt="आपली ग्रामपंचायत" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm text-amber-400 leading-tight truncate">
              {currentUser?.gramPanchayat || (language === 'mr' ? panchayatInfo.nameMr : panchayatInfo.nameEn)}
            </h2>
            <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
              {currentUser?.taluka ? `ता. ${currentUser.taluka}, जि. ${currentUser.district}` : 'प्रशासकीय ERP पोर्टल'}
            </span>
          </div>
        </div>

        {/* User / Officer Profile Card with Designation Tag */}
        <div className="p-3 mx-3 my-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between group hover:border-amber-500/50 transition-all relative">
          <div 
            onClick={openStaffModal}
            className="flex items-center space-x-2.5 min-w-0 cursor-pointer flex-1"
            title="Click to edit officer profile"
          >
            <div className="relative shrink-0">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover border border-amber-400/60"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'GP'}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                <Edit3 className="w-2.5 h-2.5" />
              </div>
            </div>

            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                {formatUserName(currentUser?.name, language) || panchayatInfo.gramSevakName}
              </h4>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 truncate ${roleMeta.color}`}>
                {roleMeta.label}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0 ml-1">
            <button
              onClick={openStaffModal}
              className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white"
              title={language === 'mr' ? 'प्रोफाईल संपादित करा' : 'Edit Profile'}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Items Filtered Strictly by User Role */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-2 py-1 mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400/90 font-serif">
              {language === 'mr' ? roleConfig.sectionHeaderMr : roleConfig.sectionHeaderEn}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {visibleSidebarLinks.length} {language === 'mr' ? 'कक्ष' : 'Tabs'}
            </span>
          </div>

          {visibleSidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = desktopTab === link.id;

            return (
              <button
                key={link.id}
                onClick={() => setDesktopTab(link.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                  <span className="text-left leading-tight">
                    {language === 'mr' ? link.labelMr : link.labelEn}
                  </span>
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${link.badgeColor || 'bg-slate-700 text-white'}`}>
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <button
            onClick={logout}
            className="w-full py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'mr' ? 'अधिकारी लॉगआउट (Log Out)' : 'Officer Log Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Desktop App Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {language === 'mr' 
                    ? allSidebarLinks.find(l => l.id === desktopTab)?.labelMr 
                    : allSidebarLinks.find(l => l.id === desktopTab)?.labelEn}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${roleMeta.color.replace('/30', '/10').replace('text-slate-200', 'text-slate-700')}`}>
                  <RoleIcon className="w-3 h-3" />
                  <span>{roleMeta.label}</span>
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {formatGramPanchayat(currentUser?.gramPanchayat, language) || (language === 'mr' ? 'सर्व ग्रामपंचायती' : 'All Gram Panchayats')}
                {currentUser?.taluka ? `, ता. ${currentUser.taluka}, जि. ${currentUser.district}` : `, ता. ${panchayatInfo.talukaMr}, जि. ${panchayatInfo.districtMr}`} | FY 2026-27
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Switch to Citizen Mobile View */}
            <button
              onClick={() => setAppMode('citizen-mobile')}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300 rounded-lg text-xs font-bold transition-all shadow-xs"
              title={language === 'mr' ? 'नागरिक सेवा मोबाइल पोर्टलवर जा' : 'Switch to Citizen View'}
            >
              <Smartphone className="w-3.5 h-3.5 text-orange-600" />
              <span>{language === 'mr' ? 'नागरिक दृश्य' : 'Citizen View'}</span>
            </button>

            {/* Officer Profile Badge & Edit Trigger */}
            <button
              onClick={openStaffModal}
              className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="Click to edit profile details"
            >
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="avatar" className="w-5 h-5 rounded-full object-cover border border-amber-500" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-700" />
              )}
              <span>{formatUserName(currentUser.name, language)}</span>
              <Edit3 className="w-3 h-3 text-amber-600 ml-1" />
            </button>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200"
            >
              <Languages className="w-3.5 h-3.5 text-orange-600" />
              <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
            </button>

            {/* Quick Status Pill */}
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'mr' ? 'प्रणाली ऑनलाइन' : 'System Online'}</span>
            </div>

            {/* Logout Trigger */}
            <button
              onClick={logout}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Logout to Gateway"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'लॉगआउट' : 'Log Out'}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Workstation Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-50 animate-fade-in">
          {children}
        </main>
      </div>

      {/* ================= STAFF PROFILE EDIT MODAL ================= */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-gov-darknavy via-gov-navy to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-300">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {language === 'mr' ? 'ग्रामपंचायत अधिकारी / कर्मचारी प्रोफाईल संपादित करा' : 'Edit Staff Officer Profile'}
                  </h3>
                  <span className="text-[11px] text-slate-300 block">
                    {staffForm.gramPanchayat || panchayatInfo.nameMr} ERP Workstation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowStaffModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStaffProfile} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Photo Upload Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block text-xs">
                  {language === 'mr' ? '📸 अधिकारी / कर्मचारी फोटो (Staff Photo / Avatar)' : '📸 Staff Photo / Avatar'}
                </label>

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {staffForm.avatarUrl ? (
                      <img
                        src={staffForm.avatarUrl}
                        alt="Staff Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xl">
                        {staffForm.name.charAt(0) || 'GP'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{language === 'mr' ? 'फोटो अपलोड करा' : 'Upload Officer Photo'}</span>
                      </button>

                      {staffForm.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setStaffForm(prev => ({ ...prev, avatarUrl: '' }))}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-bold text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'mr' ? 'काढा' : 'Remove'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {language === 'mr' ? 'अधिकृत ओळखपत्रासाठी योग्य पासपोर्ट फोटो निवडा (कमाल ५MB).' : 'Select official portrait photo (Max 5MB).'}
                    </p>
                  </div>
                </div>

                {/* Preset Indian Staff Avatars */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-700 block mb-1.5 font-bold">
                    {language === 'mr' ? '🇮🇳 भारतीय अधिकारी व प्रतिनिधी अवतार निवडा:' : '🇮🇳 Select Indian Staff / Officer Avatar:'}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {STAFF_PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setStaffForm(prev => ({ ...prev, avatarUrl: av.url }))}
                        className={`flex items-center space-x-2 p-1.5 rounded-xl border text-left transition-all ${
                          staffForm.avatarUrl === av.url 
                            ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-400/40' 
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <img 
                          src={av.url} 
                          alt={av.nameEn} 
                          className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-800 truncate block leading-tight">
                            {language === 'mr' ? av.nameMr : av.nameEn}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Staff Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5 text-xs">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  {language === 'mr' ? 'अधिकारी / कर्मचारी माहिती' : 'Officer Details'}
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'अधिकारी नाव (Full Name) *' : 'Officer Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={staffForm.name}
                      onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                      placeholder="उदा. श्री. आर. के. पाटील"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'पदनाम (Designation) *' : 'Designation *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={staffForm.designation}
                      onChange={e => setStaffForm({ ...staffForm, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                      placeholder="उदा. ग्रामविकास अधिकारी / सरपंच"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'मोबाईल क्र. (Mobile) *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={staffForm.phone}
                      onChange={e => setStaffForm({ ...staffForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-slate-800"
                      placeholder="98XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'कर्मचारी कोड (Employee Code)' : 'Employee Code'}
                    </label>
                    <input
                      type="text"
                      value={staffForm.employeeCode}
                      onChange={e => setStaffForm({ ...staffForm, employeeCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono font-bold text-slate-800"
                      placeholder="उदा. STF-GHUL-01"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'कार्यालयीन ईमेल (Official Email)' : 'Official Email'}
                  </label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800"
                    placeholder="gramsevak.panchayat@gov.in"
                  />
                </div>

                {/* Password Setting for Daily Web Login */}
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-700" />
                      <span>{language === 'mr' ? 'वेब लॉगिन पासवर्ड (Web Login Password)' : 'Web Login Password'}</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {currentUser?.hasPassword 
                        ? (language === 'mr' ? '✅ पासवर्ड सेट आहे' : '✅ Password set') 
                        : (language === 'mr' ? '⚠️ पासवर्ड सेट नाही' : '⚠️ Password not set')}
                    </span>
                  </div>

                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPasswordInput ? 'text' : 'password'}
                      minLength={4}
                      value={staffForm.password}
                      onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                      className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 bg-white"
                      placeholder={language === 'mr' ? 'नवीन पासवर्ड प्रविष्ट करा (किमान ४ अक्षरे)' : 'Enter new login password (min 4 chars)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInput(!showPasswordInput)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {language === 'mr'
                      ? '💡 हा पासवर्ड वापरून तुम्ही ग्रामपंचायत पोर्टलवर दररोज मोबाईल + पासवर्डने OTP शिवाय थेट लॉगिन करू शकता.'
                      : '💡 You can use this password to log in daily on the portal without waiting for SMS OTP.'}
                  </p>
                </div>
              </div>

              {/* Office & Address Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {language === 'mr' ? 'कार्यालय पत्ता व कार्यक्षेत्र (Office & Jurisdiction)' : 'Office & Jurisdiction'}
                </h4>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'कार्यालयीन पत्ता / विभाग (Office Address / Department)' : 'Office Address / Department'}
                  </label>
                  <textarea
                    rows={2}
                    value={staffForm.address}
                    onChange={e => setStaffForm({ ...staffForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800"
                    placeholder="उदा. मुख्य ग्रामपंचायत कार्यालय, प्रशासकीय इमारत, मेन चौक"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1 text-[10px]">
                      {language === 'mr' ? 'ग्रामपंचायत' : 'Gram Panchayat'}
                    </label>
                    <input
                      type="text"
                      value={staffForm.gramPanchayat}
                      onChange={e => setStaffForm({ ...staffForm, gramPanchayat: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[11px] text-slate-800 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1 text-[10px]">
                      {language === 'mr' ? 'तालुका' : 'Taluka'}
                    </label>
                    <input
                      type="text"
                      value={staffForm.taluka}
                      onChange={e => setStaffForm({ ...staffForm, taluka: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[11px] text-slate-800 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1 text-[10px]">
                      {language === 'mr' ? 'जिल्हा' : 'District'}
                    </label>
                    <input
                      type="text"
                      value={staffForm.district}
                      onChange={e => setStaffForm({ ...staffForm, district: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[11px] text-slate-800 bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-700 to-gov-navy hover:from-blue-800 hover:to-slate-900 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <span className="animate-pulse">{language === 'mr' ? 'जतन करत आहे...' : 'Saving...'}</span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-amber-300" />
                      <span>{language === 'mr' ? '💾 अधिकारी माहिती जतन करा' : 'Save Staff Profile'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
