import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatUserName } from '../../utils/nameLocalization';
import { formatGramPanchayat, formatTaluka, formatDistrict } from '../../utils/jurisdiction';
import { LocationSelector } from '../common/LocationSelector';
import { 
  User as UserIcon, 
  Phone, 
  Mail,
  CreditCard, 
  Home, 
  MapPin, 
  FileText, 
  AlertCircle, 
  Receipt, 
  LogOut, 
  UserCheck, 
  Sparkles,
  ChevronRight,
  Download,
  CheckCircle2,
  Clock,
  Camera,
  Edit3,
  X,
  Save,
  Trash2,
  Building, 
  Upload, 
  Calendar,
  Crown,
  Building2,
  ArrowRight,
  Lock,
  Key,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

const PRESET_AVATARS = [
  {
    nameMr: 'शेतकरी / ज्येष्ठ नागरिक',
    nameEn: 'Farmer / Senior Citizen',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'ग्रामस्थ नागरिक',
    nameEn: 'Rural Citizen',
    url: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'तरुण नागरिक',
    nameEn: 'Youth Citizen',
    url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'महिला / गृहिणी (साडी)',
    nameEn: 'Indian Woman in Saree',
    url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'ग्रामस्थ महिला',
    nameEn: 'Rural Indian Woman',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'तरुणी / विद्यार्थिनी',
    nameEn: 'Young Woman Citizen',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'आशा सेविका / आरोग्य',
    nameEn: 'Asha Health Worker',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'
  },
  {
    nameMr: 'कॉलेज तरुण',
    nameEn: 'College Youth',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
  }
];

export const CitizenProfile: React.FC = () => {
  const { 
    language, 
    t, 
    currentUser, 
    updateUserProfile,
    changeUserPassword,
    setAppMode,
    logout, 
    setShowAuthModal, 
    setAuthType, 
    certificates, 
    certificateTypes,
    grievances, 
    taxRecords, 
    setViewingCertificate, 
    setMobileTab,
    panchayatInfo 
  } = useApp();

  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Management State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!newPassword || newPassword.length < 4) {
      setPassMsg({
        text: language === 'mr' ? 'नवीन पासवर्ड किमान ४ अक्षरांचा असावा.' : 'Password must be at least 4 characters.',
        isError: true
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({
        text: language === 'mr' ? 'दोन्ही पासवर्ड जुळत नाहीत.' : 'Passwords do not match.',
        isError: true
      });
      return;
    }

    setIsUpdatingPass(true);
    const res = await changeUserPassword(newPassword);
    setIsUpdatingPass(false);
    if (res.success) {
      setPassMsg({
        text: language === 'mr' ? '✅ पासवर्ड यशस्वीरीत्या सेट झाला! आता आपण मोबाईल + पासवर्डने लॉगिन करू शकता.' : '✅ Password set successfully! You can now log in with mobile + password.',
        isError: false
      });
      setTimeout(() => {
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setPassMsg(null);
      }, 1500);
    } else {
      setPassMsg({
        text: res.message || (language === 'mr' ? 'पासवर्ड बदलणे अयशस्वी.' : 'Failed to update password.'),
        isError: true
      });
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    email: '',
    aadhaar: '',
    houseNo: '',
    wardNo: '',
    address: '',
    gramPanchayat: '',
    taluka: '',
    district: '',
    avatarUrl: ''
  });

  const openEditModal = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        dob: currentUser.dob || '',
        email: currentUser.email || '',
        aadhaar: currentUser.aadhaar || '',
        houseNo: currentUser.houseNo || '',
        wardNo: currentUser.wardNo || 'Ward 1',
        address: currentUser.address || '',
        gramPanchayat: currentUser.gramPanchayat || panchayatInfo.nameMr,
        taluka: currentUser.taluka || panchayatInfo.talukaMr,
        district: currentUser.district || panchayatInfo.districtMr,
        avatarUrl: currentUser.avatarUrl || ''
      });
    }
    setShowEditModal(true);
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
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert(language === 'mr' ? 'नाव आणि मोबाईल नंबर आवश्यक आहे.' : 'Name and phone are required.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob.trim() || undefined,
        email: formData.email.trim() || undefined,
        aadhaar: formData.aadhaar.trim() || undefined,
        houseNo: formData.houseNo.trim() || undefined,
        wardNo: formData.wardNo.trim() || undefined,
        address: formData.address.trim() || undefined,
        gramPanchayat: formData.gramPanchayat.trim() || undefined,
        taluka: formData.taluka.trim() || undefined,
        district: formData.district.trim() || undefined,
        avatarUrl: formData.avatarUrl || undefined
      });
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const myCertificates = currentUser 
    ? certificates.filter(c => c.applicantPhone.includes(currentUser.phone) || (currentUser.houseNo && c.houseNo === currentUser.houseNo))
    : certificates;

  const myGrievances = currentUser
    ? grievances.filter(g => g.citizenPhone.includes(currentUser.phone))
    : grievances;

  const myTaxes = currentUser && currentUser.houseNo
    ? taxRecords.filter(t => t.propertyNo.toLowerCase() === currentUser.houseNo?.toLowerCase())
    : taxRecords.slice(0, 1);

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-gov-navy via-slate-800 to-slate-950 text-white rounded-2xl p-4 shadow-card border border-amber-500/20 space-y-3 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-3.5">
            {/* Clickable Avatar */}
            <div className="relative group cursor-pointer" onClick={currentUser ? openEditModal : undefined}>
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 p-0.5 bg-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 border-2 border-amber-400 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              {currentUser && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow border border-white hover:scale-110 transition-transform">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              {/* Dual Role Badges for Promoted Citizens */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {language === 'mr' ? 'नागरिक' : 'Citizen'}
                </span>
                {currentUser && currentUser.role !== 'citizen' && (
                  <span className="text-[10px] font-bold uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2.5 py-0.5 rounded-full shadow-sm inline-flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5" />
                    {currentUser.designation || currentUser.role}
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base text-white mt-1.5 leading-tight">
                {formatUserName(currentUser?.name, language) || (language === 'mr' ? 'अतिथी नागरिक' : 'Guest Citizen')}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="font-mono">{currentUser?.phone || '९८XXXXXXXX'}</span>
                {currentUser?.houseNo && (
                  <span className="bg-white/10 px-1.5 py-0.2 rounded text-[11px] text-amber-200">
                    🏠 {currentUser.houseNo}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          {currentUser && (
            <button
              onClick={openEditModal}
              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'बदला' : 'Edit'}</span>
            </button>
          )}
        </div>

        {/* Citizen Details Info Box with Geo & Address */}
        {currentUser ? (
          <div className="space-y-2 pt-2.5 border-t border-white/10 text-xs text-slate-300 relative z-10">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block">{language === 'mr' ? 'आधार क्रमांक:' : 'Aadhaar No:'}</span>
                <span className="font-mono font-bold text-white tracking-wide">
                  {currentUser.aadhaar ? currentUser.aadhaar.replace(/(\d{4})/g, '$1 ').trim() : 'XXXX-XXXX-XXXX'}
                </span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block">{language === 'mr' ? 'घर / मिळकत क्र:' : 'House No:'}</span>
                <span className="font-bold text-amber-300">{currentUser.houseNo || 'लागू नाही'}</span>
              </div>
            </div>

            {currentUser.email && (
              <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center gap-1.5 text-[11px]">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">{language === 'mr' ? 'ईमेल:' : 'Email:'}</span>
                <span className="text-white truncate font-medium">{currentUser.email}</span>
              </div>
            )}

            {currentUser.dob && (
              <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center gap-1.5 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400">{language === 'mr' ? 'जन्मतारीख (DOB):' : 'Date of Birth:'}</span>
                <span className="text-white font-medium">{currentUser.dob}</span>
              </div>
            )}

            {currentUser.address && (
              <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-start gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400">{language === 'mr' ? 'पत्ता / परिसर:' : 'Address:'}</span>
                  <p className="text-white font-medium leading-tight mt-0.5">{currentUser.address}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-[9px] text-slate-400 block">{language === 'mr' ? 'ग्रामपंचायत:' : 'Gram Panchayat:'}</span>
                <span className="font-semibold text-amber-300 truncate block">{currentUser.gramPanchayat || panchayatInfo.nameMr}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">{language === 'mr' ? 'तालुका व जिल्हा:' : 'Taluka & Dist:'}</span>
                <span className="font-semibold text-white">{currentUser.taluka || panchayatInfo.talukaMr}, {currentUser.district || panchayatInfo.districtMr}</span>
              </div>
            </div>

            {currentUser.wardNo && (
              <div className="text-[10px] text-slate-400 pt-0.5 flex items-center gap-1">
                <span className="text-slate-400">{language === 'mr' ? 'प्रभाग / वॉर्ड:' : 'Ward:'}</span>
                <strong className="text-amber-200 bg-white/10 px-1.5 py-0.5 rounded">{currentUser.wardNo}</strong>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              setAuthType('citizen');
              setShowAuthModal(true);
            }}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-4 h-4 text-amber-200" />
            {language === 'mr' ? 'लॉगिन करा / नवीन नोंदणी' : 'Sign In / Register'}
          </button>
        )}
      </div>

      {/* Official Role Promotion / Staff ERP Access Card */}
      {currentUser && currentUser.role !== 'citizen' && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 rounded-2xl shadow-lg border border-amber-400/40 space-y-2.5 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-white/20 rounded-xl border border-white/30 shadow-inner">
                <Crown className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 bg-black/20 px-2 py-0.5 rounded-full">
                  {language === 'mr' ? 'नियुक्त अधिकृत पदभार' : 'Official Assigned Role'}
                </span>
                <h4 className="font-black text-sm text-white mt-0.5">
                  {currentUser.designation || (currentUser.role === 'sarpanch' ? 'सरपंच (Gram Panchayat Head)' : currentUser.role)}
                </h4>
              </div>
            </div>

            {currentUser.employeeCode && (
              <span className="px-2 py-1 bg-white/20 text-white rounded-lg text-[10px] font-mono font-bold border border-white/20">
                {currentUser.employeeCode}
              </span>
            )}
          </div>

          <p className="text-xs text-amber-100 leading-relaxed">
            {language === 'mr'
              ? 'तुमच्या प्रोफाईलला ग्रामपंचायत प्रशासकीय ERP प्रणालीचा ॲक्सेस मंजूर करण्यात आला आहे. खालील बटणावर क्लिक करून थेट अधिकृत कार्यकक्षात प्रवेश करा.'
              : 'Your profile has been granted official Panchayat Administrative ERP access. Click below to enter your workstation.'}
          </p>

          <button
            onClick={() => setAppMode('panchayat-desktop')}
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 border border-amber-500/40 active:scale-95 transition-all"
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>{language === 'mr' ? '🏢 ग्रामपंचायत प्रशासकीय ERP मध्ये प्रवेश करा' : 'Access Panchayat Desktop ERP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Summary Numbers */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div 
          onClick={() => setMobileTab('certificates')}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 active:scale-95 transition-all"
        >
          <FileText className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <span className="text-[10px] text-slate-500 block">{language === 'mr' ? 'माझे अर्ज' : 'Applications'}</span>
          <span className="text-sm font-extrabold text-slate-900">{myCertificates.length}</span>
        </div>

        <div 
          onClick={() => setMobileTab('grievances')}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 active:scale-95 transition-all"
        >
          <AlertCircle className="w-4 h-4 text-orange-600 mx-auto mb-1" />
          <span className="text-[10px] text-slate-500 block">{language === 'mr' ? 'तक्रारी' : 'Grievances'}</span>
          <span className="text-sm font-extrabold text-slate-900">{myGrievances.length}</span>
        </div>

        <div 
          onClick={() => setMobileTab('tax')}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 active:scale-95 transition-all"
        >
          <Receipt className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <span className="text-[10px] text-slate-500 block">{language === 'mr' ? 'कर पावत्या' : 'Tax Receipts'}</span>
          <span className="text-sm font-extrabold text-slate-900">{myTaxes.filter(t => t.isPaid).length}</span>
        </div>
      </div>

      {/* Edit Profile Action Button banner */}
      {currentUser && (
        <div className="space-y-2">
          <button
            onClick={openEditModal}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-between transition-all active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>{language === 'mr' ? '✏️ प्रोफाईल संपादित करा (फोटो, मोबाईल, पत्ता)' : '✏️ Edit Profile (Photo, Phone, Address)'}</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Web Login Password Setting Card */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {language === 'mr' ? 'वेब लॉगिन पासवर्ड' : 'Web Login Password'}
                  </h4>
                  {currentUser.hasPassword && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      {language === 'mr' ? 'सक्रिय' : 'Active'}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  {language === 'mr' ? 'वेबसाइटवर थेट मोबाईल + पासवर्डने लॉगिन करण्यासाठी' : 'For daily password login on website'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setNewPassword('');
                setConfirmPassword('');
                setPassMsg(null);
                setShowPasswordModal(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold shrink-0 shadow-xs flex items-center gap-1 active:scale-95 transition-all"
            >
              <Key className="w-3 h-3 text-amber-300" />
              <span>{currentUser.hasPassword ? (language === 'mr' ? 'बदला' : 'Change') : (language === 'mr' ? 'सेट करा' : 'Set')}</span>
            </button>
          </div>
        </div>
      )}

      {/* My Recent Applications with Download */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            {language === 'mr' ? 'माझे दाखले व प्रमाणपत्रे' : 'My Certificates'}
          </h4>
          <button 
            onClick={() => setMobileTab('certificates')}
            className="text-[10px] text-blue-600 font-bold hover:underline"
          >
            {language === 'mr' ? 'नवीन अर्ज करा' : 'Apply New'}
          </button>
        </div>

        {myCertificates.length > 0 ? (
          <div className="space-y-2">
            {myCertificates.map(cert => (
              <div 
                key={cert.id}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">
                    {(() => {
                      const ct = certificateTypes.find(c => c.code === cert.type || c.id === cert.type);
                      return ct ? (language === 'mr' ? ct.nameMr : ct.nameEn) : cert.type;
                    })()}
                  </span>
                  <span className="text-[10px] text-slate-500">#{cert.applicationNo} • {cert.appliedDate}</span>
                </div>
                {cert.status === 'approved' ? (
                  <button
                    onClick={() => setViewingCertificate(cert)}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <Download className="w-3 h-3" />
                    {language === 'mr' ? 'दाखला' : 'Download'}
                  </button>
                ) : (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {cert.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">
            {language === 'mr' ? 'कोणतेही अर्ज उपलब्ध नाहीत.' : 'No applications found.'}
          </p>
        )}
      </div>

      {/* Account Switch & Logout */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => {
            setAuthType('citizen');
            setShowAuthModal(true);
          }}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <UserCheck className="w-4 h-4 text-orange-600" />
          {language === 'mr' ? 'खाते बदला / नवीन लॉगिन' : 'Switch Account / Sign In'}
        </button>

        {currentUser && (
          <button
            onClick={logout}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            {t('logoutBtn')}
          </button>
        )}
      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-gov-navy to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">
                  {language === 'mr' ? 'नागरिक प्रोफाईल संपादित करा' : 'Edit Citizen Profile'}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSaveProfile} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Photo Upload Section */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <label className="font-bold text-slate-800 block">
                  {language === 'mr' ? '📸 प्रोफाईल फोटो (Profile Photo)' : '📸 Profile Photo'}
                </label>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {formData.avatarUrl ? (
                      <img
                        src={formData.avatarUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-500 font-bold text-xl">
                        {formData.name.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
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
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{language === 'mr' ? 'फोटो अपलोड करा' : 'Upload Photo'}</span>
                      </button>

                      {formData.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-bold text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'mr' ? 'काढा' : 'Remove'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {language === 'mr' ? 'गॅलरी किंवा कॅमेरामधून पासपोर्ट साईझ फोटो निवडा (कमाल ५MB).' : 'Upload passport photo from gallery or camera (max 5MB).'}
                    </p>
                  </div>
                </div>

                {/* Preset Indian Avatars */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-600 block mb-1.5 font-bold">
                    {language === 'mr' ? '🇮🇳 भारतीय नागरिक अवतार निवडा (Select Indian Avatar):' : '🇮🇳 Select Indian Citizen Avatar:'}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatarUrl: av.url }))}
                        className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                          formData.avatarUrl === av.url 
                            ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-400/40' 
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <img 
                          src={av.url} 
                          alt={av.nameEn} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-sm" 
                        />
                        <span className="text-[9px] font-bold text-slate-700 mt-1 text-center truncate max-w-full leading-tight">
                          {language === 'mr' ? av.nameMr.split(' ')[0] : av.nameEn.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  {language === 'mr' ? 'वैयक्तिक माहिती (Personal Details)' : 'Personal Details'}
                </h4>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'पूर्ण नाव (Full Name) *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                    placeholder="उदा. रोशन सोमनाथ गोरडे"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'मोबाईल क्र. (Mobile) *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-slate-800"
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'आधार क्र. (Aadhaar)' : 'Aadhaar Number'}
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={formData.aadhaar}
                      onChange={e => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-slate-800"
                      placeholder="12 अंकी आधार"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'ईमेल आयडी' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800"
                      placeholder="citizen@example.com"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'जन्मतारीख (DOB)' : 'Date of Birth'}
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Address & Residence Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {language === 'mr' ? 'रहिवासी पत्ता व मिळकत माहिती (Address & Residence)' : 'Address & Property Details'}
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'घर / मिळकत क्र. (House No)' : 'House / Property No'}
                    </label>
                    <input
                      type="text"
                      value={formData.houseNo}
                      onChange={e => setFormData({ ...formData, houseNo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
                      placeholder={language === 'mr' ? 'उदा. १२/अ किंवा घर क्र. ४५' : 'e.g. 12/A or House 45'}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'प्रभाग / वॉर्ड (Ward)' : 'Ward / Prabhag'}
                    </label>
                    <select
                      value={formData.wardNo}
                      onChange={e => setFormData({ ...formData, wardNo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                    >
                      <option value="Ward 1">Ward 1 (प्रभाग १)</option>
                      <option value="Ward 2">Ward 2 (प्रभाग २)</option>
                      <option value="Ward 3">Ward 3 (प्रभाग ३)</option>
                      <option value="Ward 4">Ward 4 (प्रभाग ४)</option>
                      <option value="Ward 5">Ward 5 (प्रभाग ५)</option>
                      <option value="Ward 6">Ward 6 (प्रभाग ६)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संपूर्ण पत्ता / गल्ली / परिसर (Detailed Address)' : 'Detailed Address / Street'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800"
                    placeholder="उदा. मेन रोड, मारुती मंदिराशेजारी, मु. पो."
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1 text-[10px]">
                      {language === 'mr' ? 'ग्रामपंचायत' : 'Gram Panchayat'}
                    </label>
                    <input
                      type="text"
                      value={formData.gramPanchayat}
                      onChange={e => setFormData({ ...formData, gramPanchayat: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[11px] text-slate-800 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1 text-[10px]">
                      {language === 'mr' ? 'तालुका' : 'Taluka'}
                    </label>
                    <input
                      type="text"
                      value={formData.taluka}
                      onChange={e => setFormData({ ...formData, taluka: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[11px] text-slate-800 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1 text-[10px]">
                      {language === 'mr' ? 'जिल्हा' : 'District'}
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[11px] text-slate-800 bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
                      <span>{language === 'mr' ? '💾 माहिती जतन करा' : 'Save Profile'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Management Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <Lock className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {language === 'mr' ? 'वेब लॉगिन पासवर्ड सेट करा / बदला' : 'Set / Update Web Password'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {language === 'mr' ? 'मोबाईल नंबर + पासवर्डने लॉगिन करण्यासाठी' : 'For daily Mobile + Password login'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  passMsg.isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {passMsg.isError ? (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{passMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'नवीन पासवर्ड (किमान ४ अक्षरे)' : 'New Password (min 4 characters)'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'पासवर्ड पुन्हा प्रविष्ट करा' : 'Confirm New Password'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {language === 'mr' ? 'सुरक्षा सूचना:' : 'Security Note:'}
                </p>
                <p>
                  {language === 'mr'
                    ? 'हा पासवर्ड सेट केल्यानंतर तुम्ही व ग्रामपंचायत अधिकारी वेबसाइटवर दररोज SMS OTP शिवाय मोबाईल व पासवर्डने लॉगिन करू शकता.'
                    : 'After setting this password, you can log in daily on the website using Mobile + Password without waiting for SMS OTP.'}
                </p>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPass}
                  className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  {isUpdatingPass ? (
                    <span className="animate-pulse">{language === 'mr' ? 'जतन करत आहे...' : 'Saving...'}</span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-amber-300" />
                      <span>{language === 'mr' ? 'पासवर्ड जतन करा' : 'Save Password'}</span>
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
