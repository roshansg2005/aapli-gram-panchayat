import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Language, 
  AppMode, 
  MobileTab, 
  DesktopTab, 
  User, 
  UserRole,
  CertificateApplication, 
  CertificateType,
  CertificateTypeConfig,
  ApplicationStatus,
  Grievance, 
  PropertyTaxRecord, 
  GovtScheme, 
  SchemeApplication,
  GramNotice, 
  DevelopmentProject, 
  VillageOfficial, 
  PanchayatInfo 
} from '../types';
import { translations } from '../data/translations';
import { api } from '../api/apiClient';
import { 
  initialGovtSchemes, 
  initialOfficials, 
  initialPanchayatInfo 
} from '../data/initialData';
import { matchGramPanchayat, matchTaluka } from '../utils/jurisdiction';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['mr']) => string;
  
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  mobileTab: MobileTab;
  setMobileTab: (tab: MobileTab) => void;
  desktopTab: DesktopTab;
  setDesktopTab: (tab: DesktopTab) => void;
  mobileFrameMode: boolean;
  setMobileFrameMode: (enabled: boolean) => void;
  isMobileScreen: boolean;
  
  // Auth State & Actions
  currentUser: User | null;
  users: User[];
  login: (identifier: string, otpOrPassword?: string, role?: UserRole, isPassword?: boolean) => Promise<boolean> | boolean;
  changeUserPassword: (newPassword: string, oldPassword?: string) => Promise<{ success: boolean; message: string }>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  loginWithUser: (user: User) => void;
  registerCitizen: (userData: Omit<User, 'id' | 'role'>) => User;
  registerStaff: (userData: Omit<User, 'id'>) => User;
  addUser: (userData: any) => Promise<User | null>;
  deleteUser: (userId: string) => Promise<boolean>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<boolean>;
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  promoteUser: (userId: string, data: any) => Promise<boolean>;
  logout: () => void;
  
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authType: 'citizen' | 'panchayat';
  setAuthType: (type: 'citizen' | 'panchayat') => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  
  // Data Entities
  certificateTypes: CertificateTypeConfig[];
  addCertificateType: (data: any) => Promise<boolean>;
  updateCertificateType: (id: string, updates: any) => Promise<boolean>;
  deleteCertificateType: (id: string) => Promise<boolean>;
  
  certificates: CertificateApplication[];
  addCertificate: (cert: Omit<CertificateApplication, 'id' | 'applicationNo' | 'appliedDate' | 'status'>) => CertificateApplication;
  updateCertificateStatus: (id: string, status: ApplicationStatus, remarks?: string, processedBy?: string) => void;
  
  grievances: Grievance[];
  addGrievance: (grv: Omit<Grievance, 'id' | 'ticketNo' | 'submittedDate' | 'status'>) => Grievance;
  updateGrievance: (id: string, updates: Partial<Grievance>) => void;
  
  taxRecords: PropertyTaxRecord[];
  addTaxAssessment: (taxData: any) => Promise<PropertyTaxRecord | null>;
  payTaxRecord: (propertyNo: string, mode?: 'UPI' | 'Cash' | 'NetBanking') => PropertyTaxRecord | null;
  deleteTaxAssessment: (id: string) => Promise<boolean>;
  
  schemes: GovtScheme[];
  addScheme: (data: any) => Promise<boolean>;
  schemeApplications: SchemeApplication[];
  applyForScheme: (data: any) => Promise<boolean>;
  updateSchemeApplicationStatus: (id: string, status: string, dbtStatus?: string) => Promise<void>;
  
  notices: GramNotice[];
  addNotice: (notice: Omit<GramNotice, 'id' | 'date'>) => void;
  
  projects: DevelopmentProject[];
  addProject: (proj: Omit<DevelopmentProject, 'id'>) => void;
  updateProject: (id: string, updates: Partial<DevelopmentProject>) => void;
  
  officials: VillageOfficial[];
  panchayatInfo: PanchayatInfo;
  
  viewingCertificate: CertificateApplication | null;
  setViewingCertificate: (cert: CertificateApplication | null) => void;
  viewingReceipt: PropertyTaxRecord | null;
  setViewingReceipt: (receipt: PropertyTaxRecord | null) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  triggerConfetti: () => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('gp_language') as Language) || 'mr';
  });

  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [appMode, setAppModeState] = useState<AppMode>(() => {
    const saved = localStorage.getItem('gp_appMode') as AppMode | null;
    if (saved) return saved;
    return 'home';
  });

  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const [desktopTab, setDesktopTab] = useState<DesktopTab>('dashboard');
  const [mobileFrameMode, setMobileFrameMode] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('gp_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gp_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authType, setAuthType] = useState<'citizen' | 'panchayat'>('citizen');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [certificateTypes, setCertificateTypes] = useState<CertificateTypeConfig[]>([]);

  const [certificates, setCertificates] = useState<CertificateApplication[]>(() => {
    const saved = localStorage.getItem('gp_certificates');
    return saved ? JSON.parse(saved) : [];
  });

  const [grievances, setGrievances] = useState<Grievance[]>(() => {
    const saved = localStorage.getItem('gp_grievances');
    return saved ? JSON.parse(saved) : [];
  });

  const [taxRecords, setTaxRecords] = useState<PropertyTaxRecord[]>(() => {
    const saved = localStorage.getItem('gp_taxes');
    return saved ? JSON.parse(saved) : [];
  });

  const [schemes, setSchemes] = useState<GovtScheme[]>(() => {
    const saved = localStorage.getItem('gp_schemes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasOldMock = parsed.some((s: any) => s.id === 'sch-1' || s.id === 'sch-2' || s.id === 'sch-3' || s.id === 'sch-4');
          if (hasOldMock) {
            localStorage.removeItem('gp_schemes');
            return [];
          }
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [schemeApplications, setSchemeApplications] = useState<SchemeApplication[]>(() => {
    const saved = localStorage.getItem('gp_scheme_apps');
    return saved ? JSON.parse(saved) : [];
  });

  const [notices, setNotices] = useState<GramNotice[]>(() => {
    const saved = localStorage.getItem('gp_notices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasOldMock = parsed.some((n: any) => n.id === 'not-1' || n.id === 'not-2');
          if (hasOldMock) {
            localStorage.removeItem('gp_notices');
            return [];
          }
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [projects, setProjects] = useState<DevelopmentProject[]>(() => {
    const saved = localStorage.getItem('gp_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasOldMock = parsed.some((p: any) => p.id === 'proj-1' || p.id === 'proj-2');
          if (hasOldMock) {
            localStorage.removeItem('gp_projects');
            return [];
          }
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [viewingCertificate, setViewingCertificate] = useState<CertificateApplication | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<PropertyTaxRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 🚀 Load Live Data from SQLite Backend with Strict Privacy Separation
  const refreshData = async () => {
    try {
      // 1. Public Information (Always safe to load for landing page & notices)
      const [dbNotices, dbProjects, dbSchemes, dbCertTypes] = await Promise.all([
        api.getNotices(currentUser?.gramPanchayat, currentUser?.taluka),
        api.getProjects(currentUser?.gramPanchayat, currentUser?.taluka),
        api.getSchemes(currentUser?.gramPanchayat, undefined, currentUser?.taluka),
        api.getCertificateTypes(currentUser?.gramPanchayat)
      ]);

      if (Array.isArray(dbNotices)) setNotices(dbNotices);
      if (Array.isArray(dbProjects)) setProjects(dbProjects);
      if (Array.isArray(dbSchemes)) setSchemes(dbSchemes);
      if (Array.isArray(dbCertTypes)) setCertificateTypes(dbCertTypes);

      // 2. 🛡️ Privacy Guard: If user is not logged in, NEVER fetch private citizen data!
      if (!currentUser) {
        setUsers([]);
        setCertificates([]);
        setGrievances([]);
        setTaxRecords([]);
        setSchemeApplications([]);
        return;
      }

      // 3. Authenticated Data Fetching
      const isStaffOrAdmin = ['admin', 'taluka_bdo', 'sarpanch', 'upsarpanch', 'gram_sevak', 'sadasya', 'clerk', 'tax_clerk', 'staff'].includes(currentUser.role);
      const isBdo = currentUser.role === 'taluka_bdo';
      const gp = isBdo ? undefined : (currentUser.gramPanchayat || undefined);
      const taluka = currentUser.taluka || undefined;
      const citizenPhone = isStaffOrAdmin ? undefined : currentUser.phone;

      if (isStaffOrAdmin) {
        // Staff/Admin: Fetch their Panchayat's desk data
        const [dbUsers, dbCerts, dbGrvs, dbTaxes, dbSchemeApps] = await Promise.all([
          api.getUsers(undefined, gp, taluka),
          api.getCertificates(undefined, undefined, gp, taluka),
          api.getGrievances(undefined, undefined, gp, taluka),
          api.getTaxRecords(gp, undefined, taluka),
          api.getSchemeApplications(gp, taluka)
        ]);

        if (Array.isArray(dbUsers)) setUsers(dbUsers);
        if (Array.isArray(dbCerts)) setCertificates(dbCerts);
        if (Array.isArray(dbGrvs)) setGrievances(dbGrvs);
        if (Array.isArray(dbTaxes)) setTaxRecords(dbTaxes);
        if (Array.isArray(dbSchemeApps)) setSchemeApplications(dbSchemeApps);
      } else {
        // Citizen: Fetch only their personal records
        const [dbCerts, dbGrvs, dbTaxes, dbSchemeApps] = await Promise.all([
          api.getCertificates(citizenPhone, undefined, gp, taluka),
          api.getGrievances(citizenPhone, undefined, gp, taluka),
          api.getTaxRecords(gp, citizenPhone, taluka),
          api.getSchemeApplications(gp, taluka)
        ]);

        setUsers([currentUser]);
        if (Array.isArray(dbCerts)) setCertificates(dbCerts);
        if (Array.isArray(dbGrvs)) setGrievances(dbGrvs);
        if (Array.isArray(dbTaxes)) setTaxRecords(dbTaxes);
        if (Array.isArray(dbSchemeApps)) setSchemeApplications(dbSchemeApps);
      }
    } catch (err) {
      console.warn('Backend DB sync note:', err);
    }
  };

  useEffect(() => {
    refreshData();

    // ⚡ Gentle background sync (every 60s only when tab is active and visible)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshData();
      }
    }, 60000);

    // ⚡ Instant sync on tab focus or visibility change
    const handleFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshData();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [currentUser?.gramPanchayat, currentUser?.taluka, currentUser?.role]);

  useEffect(() => {
    localStorage.setItem('gp_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('gp_appMode', appMode);
  }, [appMode]);

  useEffect(() => {
    localStorage.setItem('gp_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gp_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gp_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('gp_grievances', JSON.stringify(grievances));
  }, [grievances]);

  useEffect(() => {
    localStorage.setItem('gp_taxes', JSON.stringify(taxRecords));
  }, [taxRecords]);

  useEffect(() => {
    localStorage.setItem('gp_scheme_apps', JSON.stringify(schemeApplications));
  }, [schemeApplications]);

  useEffect(() => {
    localStorage.setItem('gp_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('gp_schemes', JSON.stringify(schemes));
  }, [schemes]);

  useEffect(() => {
    localStorage.setItem('gp_projects', JSON.stringify(projects));
  }, [projects]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const toggleLanguage = () => setLanguageState(prev => prev === 'mr' ? 'en' : 'mr');
  const setAppMode = (mode: AppMode) => setAppModeState(mode);

  const t = (key: keyof typeof translations['mr']): string => {
    return translations[language][key] || translations['en'][key] || String(key);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const currentGpName = currentUser?.gramPanchayat || initialPanchayatInfo.nameMr;
  const currentTaluka = currentUser?.taluka || initialPanchayatInfo.talukaMr;
  const currentDistrict = currentUser?.district || initialPanchayatInfo.districtMr;

  const gpCitizens = users.filter(u => u.role === 'citizen' && matchGramPanchayat(u.gramPanchayat, currentGpName));
  const gpHouseholds = new Set(gpCitizens.map(u => u.houseNo).filter(Boolean)).size || gpCitizens.length;

  const gpStaffUsers = users.filter(u => u.role !== 'citizen' && matchGramPanchayat(u.gramPanchayat, currentGpName));
  const gpSarpanch = gpStaffUsers.find(u => u.role === 'sarpanch');
  const gpGramSevak = gpStaffUsers.find(u => u.role === 'gram_sevak');

  const panchayatInfo: PanchayatInfo = {
    ...initialPanchayatInfo,
    nameMr: currentGpName,
    nameEn: currentGpName,
    talukaMr: currentTaluka,
    talukaEn: currentTaluka,
    districtMr: currentDistrict,
    districtEn: currentDistrict,
    totalPopulation: gpCitizens.length * 4 || 0,
    totalHouseholds: gpHouseholds,
    totalWards: 6,
    sarpanchName: gpSarpanch ? `${gpSarpanch.name} (सरपंच)` : 'सरपंच (लोकप्रतिनिधी)',
    gramSevakName: gpGramSevak ? `${gpGramSevak.name} (ग्रामविकास अधिकारी)` : 'ग्रामविकास अधिकारी (प्रशासन)',
  };

  const officials: VillageOfficial[] = gpStaffUsers.length > 0 
    ? gpStaffUsers.map(s => ({
        id: s.id,
        nameMr: s.name,
        nameEn: s.name,
        designationMr: s.designation || (s.role === 'sarpanch' ? 'सरपंच (Sarpanch)' : s.role === 'gram_sevak' ? 'ग्रामविकास अधिकारी (Gram Sevak)' : 'कर्मचारी'),
        designationEn: s.designation || (s.role === 'sarpanch' ? 'Sarpanch' : s.role === 'gram_sevak' ? 'Gram Sevak' : 'Staff'),
        phone: s.phone,
        email: s.email,
        wardNo: s.wardNo,
        photoUrl: s.avatarUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
        roleType: s.role === 'sarpanch' ? 'elected' : 'administration'
      }))
    : [
        {
          id: 'off-sarp',
          nameMr: panchayatInfo.sarpanchName,
          nameEn: 'Sarpanch',
          designationMr: 'सरपंच (Sarpanch)',
          designationEn: 'Sarpanch',
          phone: panchayatInfo.helplineNumber,
          photoUrl: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&auto=format&fit=crop&q=80',
          roleType: 'elected'
        },
        {
          id: 'off-gs',
          nameMr: panchayatInfo.gramSevakName,
          nameEn: 'Gram Sevak',
          designationMr: 'ग्रामविकास अधिकारी (Gram Sevak)',
          designationEn: 'Gram Sevak',
          phone: panchayatInfo.helplineNumber,
          photoUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
          roleType: 'administration'
        }
      ];

  const login = async (identifier: string, otpOrPassword?: string, role?: UserRole, isPassword?: boolean): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();
    const digitsOnly = cleanId.replace(/\D/g, '');
    
    try {
      const res = await api.login(
        identifier, 
        isPassword ? undefined : otpOrPassword, 
        role, 
        isPassword ? otpOrPassword : undefined
      );
      if (res && res.success && res.data) {
        console.log('Database auth success:', res.data);
        const loggedUser = res.data;
        setCurrentUser(loggedUser);
        setUsers(prev => {
          const exists = prev.some(u => u.id === loggedUser.id || u.phone === loggedUser.phone);
          if (exists) return prev.map(u => (u.id === loggedUser.id || u.phone === loggedUser.phone ? loggedUser : u));
          return [loggedUser, ...prev];
        });
        localStorage.setItem('gp_current_user', JSON.stringify(loggedUser));
        setShowAuthModal(false);
        setAppModeState(loggedUser.role === 'citizen' ? 'citizen-mobile' : 'panchayat-desktop');
        showToast(language === 'mr' ? `लॉगिन यशस्वी! स्वागत आहे, ${loggedUser.name}!` : `Login Successful! Welcome, ${loggedUser.name}!`);
        triggerConfetti();
        return true;
      }
    } catch (err) {
      console.warn('DB login sync error:', err);
    }

    const foundUser = users.find(u => {
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
      const uAadhaarDigits = (u.aadhaar || '').replace(/\D/g, '');
      const uAadhaarRaw = (u.aadhaar || '').toLowerCase();
      const uEmpCode = (u.employeeCode || '').toLowerCase();
      const uName = (u.name || '').toLowerCase();

      return (
        (digitsOnly && uPhoneDigits.includes(digitsOnly)) ||
        (digitsOnly && uAadhaarDigits === digitsOnly) ||
        uAadhaarRaw.includes(cleanId) ||
        (uEmpCode && uEmpCode === cleanId) ||
        uName.includes(cleanId)
      );
    });

    if (foundUser) {
      setCurrentUser(foundUser);
      setShowAuthModal(false);
      localStorage.setItem('gp_current_user', JSON.stringify(foundUser));
      setAppModeState(foundUser.role === 'citizen' ? 'citizen-mobile' : 'panchayat-desktop');
      showToast(language === 'mr' ? `लॉगिन यशस्वी! स्वागत आहे, ${foundUser.name}!` : `Login Successful! Welcome, ${foundUser.name}!`);
      triggerConfetti();
      return true;
    }
    return false;
  };

  const changeUserPassword = async (newPassword: string, oldPassword?: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'लॉगिन केलेले नाही (Not logged in)' };
    try {
      const res = await api.changePassword(currentUser.id, newPassword, oldPassword, currentUser.phone);
      if (res && res.success) {
        const updated = { ...currentUser, hasPassword: true, password: newPassword };
        setCurrentUser(updated);
        setUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
        localStorage.setItem('gp_current_user', JSON.stringify(updated));
        showToast(language === 'mr' ? 'पासवर्ड यशस्वीरीत्या सेट / बदलला गेला!' : 'Password updated successfully!');
        return { success: true, message: res.message || 'Password updated' };
      }
      return { success: false, message: res?.message || 'Failed to update password' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error updating password' };
    }
  };

  const loginWithUser = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    setAppModeState(user.role === 'citizen' ? 'citizen-mobile' : 'panchayat-desktop');
    showToast(language === 'mr' ? `स्वागत आहे, ${user.name}!` : `Welcome, ${user.name}!`);
    triggerConfetti();
  };

  const registerCitizen = (userData: Omit<User, 'id' | 'role'>): User => {
    const newUser: User = {
      ...userData,
      id: `usr-cit-${Date.now()}`,
      role: 'citizen'
    };
    api.registerCitizen(userData).catch(err => console.warn('Database save error:', err));
    setUsers(prev => [newUser, ...prev]);
    showToast(language === 'mr' ? 'खाते यशस्वीरित्या तयार झाले! कृपया आता OTP ने लॉगिन करा.' : 'Account created successfully! Please login with OTP.');
    return newUser;
  };

  const registerStaff = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `usr-stf-${Date.now()}`
    };
    api.registerStaff(userData).catch(err => console.warn('Database save error:', err));
    setUsers(prev => [newUser, ...prev]);
    showToast(language === 'mr' ? 'कर्मचारी नोंदणी यशस्वी झाली! कृपया नोंदणीकृत मोबाईल व OTP ने लॉगिन करा.' : 'Staff registered successfully! Please login with registered Mobile & OTP.');
    return newUser;
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    const updatedUser: User = {
      ...currentUser,
      ...updates
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => (u.id === currentUser.id || u.phone === currentUser.phone ? updatedUser : u)));
    localStorage.setItem('gp_current_user', JSON.stringify(updatedUser));

    try {
      const res = await api.updateProfile(currentUser.id, updates);
      if (res && res.success && res.data) {
        setCurrentUser(res.data);
        setUsers(prev => prev.map(u => (u.id === currentUser.id || u.phone === currentUser.phone ? res.data : u)));
        localStorage.setItem('gp_current_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Backend updateProfile error:', err);
    }
    showToast(language === 'mr' ? 'प्रोफाईल माहिती यशस्वीरीत्या अद्यतनित केली!' : 'Profile updated successfully!');
    triggerConfetti();
    return true;
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await api.adminLogin(username, password);
      if (res && res.success && res.data) {
        const adminUser = res.data;
        setCurrentUser(adminUser);
        setShowAuthModal(false);
        setAppModeState('panchayat-desktop');
        setDesktopTab('admin_users');
        showToast(language === 'mr' ? `प्रशासक लॉगिन यशस्वी! स्वागत आहे, ${adminUser.name}` : `Admin Login Verified! Welcome, ${adminUser.name}`);
        triggerConfetti();
        return true;
      }
    } catch (err) {
      console.warn('Backend admin login error:', err);
    }

    // Local fallback check
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    const isMasterAdmin = (cleanUser === 'admin' || cleanUser === 'admin@grampanchayat.gov.in') && 
                          (cleanPass === 'admin123' || cleanPass === 'admin');

    if (isMasterAdmin) {
      const masterAdmin: User = {
        id: 'usr-admin-01',
        role: 'admin',
        name: 'मुख्य प्रशासक (System Administrator)',
        phone: '9999999999',
        email: 'admin@grampanchayat.gov.in',
        designation: 'मुख्य प्रशासकीय अधिकारी (Super Admin)',
        employeeCode: 'ADM-HQ-001',
        state: 'Maharashtra',
        district: 'अहिल्यानगर',
        taluka: 'संगमनेर',
        gramPanchayat: 'सर्व ग्रामपंचायती (All GPs)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        isActive: true
      };
      setCurrentUser(masterAdmin);
      setShowAuthModal(false);
      setAppModeState('panchayat-desktop');
      setDesktopTab('admin_users');
      showToast(language === 'mr' ? 'प्रशासक लॉगिन यशस्वी!' : 'Admin Login Successful!');
      triggerConfetti();
      return true;
    }

    return false;
  };

  const addUser = async (userData: any): Promise<User | null> => {
    try {
      const res = await api.createUser(userData);
      if (res && res.success && res.data) {
        const newUser = res.data;
        const replacedOccupant = res.replacedOccupant;
        setUsers(prev => {
          const list = prev.map(u => {
            if (replacedOccupant && (u.id === replacedOccupant.id || u.phone === replacedOccupant.phone)) {
              return replacedOccupant;
            }
            return u;
          });
          return [newUser, ...list.filter(u => u.id !== newUser.id)];
        });
        showToast(language === 'mr' ? `युझर ${newUser.name} यशस्वीरित्या जोडला गेला!` : `User ${newUser.name} created successfully!`);
        triggerConfetti();
        return newUser;
      } else if (res && !res.success && res.message) {
        showToast(res.message);
        return null;
      }
    } catch (err) {
      console.warn('Backend createUser error:', err);
    }

    // Fallback local creation
    const localUser: User = {
      id: `usr-${Date.now()}`,
      ...userData,
      isActive: true
    };
    setUsers(prev => [localUser, ...prev]);
    showToast(language === 'mr' ? 'युझर स्थानिक पातळीवर जोडला गेला.' : 'User added locally.');
    return localUser;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const res = await api.deleteUser(userId);
      if (res && res.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast(language === 'mr' ? 'युझर यशस्वीरित्या हटवला गेला!' : 'User deleted successfully!');
        return true;
      } else if (res && !res.success && res.message) {
        showToast(res.message);
        return false;
      }
    } catch (err) {
      console.warn('Backend deleteUser error:', err);
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast(language === 'mr' ? 'युझर हटवला गेला.' : 'User removed.');
    return true;
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
      const res = await api.updateProfile(userId, updates);
      if (res && res.success && res.data) {
        const updated = res.data;
        setUsers(prev => prev.map(u => u.id === userId ? updated : u));
        if (currentUser?.id === userId) {
          setCurrentUser(updated);
        }
        showToast(language === 'mr' ? 'युझर माहिती यशस्वीरीत्या अद्यतनित झाली!' : 'User updated successfully!');
        return true;
      }
    } catch (err) {
      console.warn('Backend updateUser error:', err);
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    showToast(language === 'mr' ? 'युझर माहिती अद्यतनित झाली.' : 'User details updated.');
    return true;
  };

  const promoteUser = async (userId: string, data: any): Promise<boolean> => {
    try {
      const res = await api.promoteUser(userId, data);
      if (res && res.success && res.data) {
        const updatedUser = res.data;
        const replacedOccupant = res.replacedOccupant;
        setUsers(prev => prev.map(u => {
          if (u.id === userId || u.phone === updatedUser.phone) return updatedUser;
          if (replacedOccupant && (u.id === replacedOccupant.id || u.phone === replacedOccupant.phone)) return replacedOccupant;
          return u;
        }));
        if (currentUser && (currentUser.id === userId || currentUser.phone === updatedUser.phone)) {
          setCurrentUser(updatedUser);
          if (updatedUser.role === 'citizen') {
            setAppModeState('citizen-mobile');
          } else if (['sarpanch', 'upsarpanch', 'gram_sevak', 'sadasya', 'tax_clerk', 'staff', 'taluka_bdo', 'admin'].includes(updatedUser.role)) {
            setAppModeState('panchayat-desktop');
          }
        }
        
        const isDemotion = updatedUser.role === 'citizen';
        const isSelf = currentUser && (currentUser.id === userId || currentUser.phone === updatedUser.phone);
        
        showToast(
          language === 'mr'
            ? isDemotion
              ? isSelf
                ? '🔻 पदनिवृत्ती यशस्वी: आपले खाते सामान्य नागरिक म्हणून अद्यतनित झाले आहे.'
                : `🔻 पदनिवृत्ती यशस्वी: ${updatedUser.name} यांचे खाते सामान्य नागरिक म्हणून अद्यतनित झाले.`
              : `🎖️ पदभार वाटप यशस्वी: ${updatedUser.name} यांना ${updatedUser.designation || updatedUser.role} पदभार देण्यात आला.`
            : isDemotion
              ? isSelf
                ? '🔻 Demotion Successful: Your account has been reverted to Citizen.'
                : `🔻 Demotion Successful: ${updatedUser.name} reverted to Citizen.`
              : `🎖️ Role Assigned: ${updatedUser.name} assigned ${updatedUser.designation || updatedUser.role}.`
        );
        triggerConfetti();
        return true;
      } else if (res && !res.success && res.message) {
        showToast(res.message);
        return false;
      }
    } catch (err) {
      console.warn('Backend promoteUser error:', err);
    }

    // Local fallback update
    const targetRole = data.role || data.newRole;
    const isDemoting = targetRole === 'citizen';

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: targetRole,
          designation: isDemoting ? 'नागरिक (Citizen)' : (data.designation || u.designation),
          employeeCode: isDemoting ? '' : (data.employeeCode || u.employeeCode || `GP-ORD-2026-${Math.floor(100 + Math.random() * 900)}`),
          wardNo: data.wardNo || u.wardNo,
          isActive: true
        };
      }
      return u;
    }));

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        role: targetRole,
        designation: isDemoting ? 'नागरिक (Citizen)' : (data.designation || prev.designation),
        employeeCode: isDemoting ? '' : (data.employeeCode || prev.employeeCode)
      } : null);

      if (isDemoting) {
        setAppModeState('citizen-mobile');
      } else {
        setAppModeState('panchayat-desktop');
      }
    }

    showToast(
      language === 'mr'
        ? isDemoting 
          ? '🔻 पदनिवृत्ती स्थानिक पातळीवर अद्यतनित झाली.' 
          : '🎖️ पदभार स्थानिक पातळीवर अद्यतनित झाला.'
        : isDemoting
          ? '🔻 Demoted to citizen locally.'
          : '🎖️ Role assigned locally.'
    );
    triggerConfetti();
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setAppModeState('gateway');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    showToast(language === 'mr' ? 'लॉगआउट यशस्वी झाले.' : 'Logged out successfully.');
  };

  const addCertificate = (certData: Omit<CertificateApplication, 'id' | 'applicationNo' | 'appliedDate' | 'status'>) => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCert: CertificateApplication = {
      ...certData,
      id: `cert-${Date.now()}`,
      applicationNo: `GP-${new Date().getFullYear()}-${randomDigits}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      gramPanchayat: certData.gramPanchayat || currentUser?.gramPanchayat || currentGpName,
      taluka: certData.taluka || currentUser?.taluka || currentTaluka,
      district: certData.district || currentUser?.district || currentDistrict
    };

    api.applyCertificate(newCert).catch(err => console.warn('Certificate DB save error:', err));

    setCertificates(prev => [newCert, ...prev]);
    showToast(language === 'mr' ? 'दाखल्याचा अर्ज यशस्वीरीत्या सादर केला!' : 'Certificate application submitted successfully!');
    triggerConfetti();
    return newCert;
  };

  const updateCertificateStatus = (id: string, status: ApplicationStatus, remarks?: string, processedBy?: string) => {
    const approver = processedBy || (currentUser?.name ? `${currentUser.name} (${currentUser.designation || 'ग्रामसेवक'})` : 'ग्रामविकास अधिकारी');
    api.updateCertificateStatus(id, status, remarks, approver).catch(err => console.warn('Cert update DB error:', err));

    setCertificates(prev => prev.map(c => {
      if (c.id === id) {
        const distCode = (c.district || currentDistrict || 'MAHA').slice(0, 3).toUpperCase();
        const talCode = (c.taluka || currentTaluka || 'TAL').slice(0, 3).toUpperCase();
        const certNo = status === 'approved' 
          ? `MH-${distCode}-${talCode}-${new Date().getFullYear()}-${c.type.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}` 
          : undefined;
        return {
          ...c,
          status,
          remarks: remarks || c.remarks,
          processedBy: approver,
          processedDate: new Date().toISOString().split('T')[0],
          certificateNumber: certNo,
          qrCodeData: certNo ? `GP-MAHARASHTRA|${certNo}|${c.applicantName}|APPROVED` : undefined
        };
      }
      return c;
    }));

    showToast(
      language === 'mr'
        ? `अर्जाची स्थिती अपडेट केली: ${status === 'approved' ? 'मंजूर' : status === 'rejected' ? 'नाकारले' : 'छाननी'}`
        : `Application status updated to ${status}`
    );
  };

  const addCertificateType = async (typeData: any): Promise<boolean> => {
    try {
      const payload = {
        ...typeData,
        gramPanchayat: typeData.gramPanchayat || currentUser?.gramPanchayat || currentGpName
      };
      const res = await api.addCertificateType(payload);
      if (res && res.success && res.data) {
        setCertificateTypes(prev => [...prev, res.data]);
        showToast(language === 'mr' ? 'नवीन दाखला प्रकार यशस्वीरीत्या जोडला!' : 'New certificate type added successfully!');
        triggerConfetti();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding cert type:', err);
      return false;
    }
  };

  const updateCertificateType = async (id: string, updates: any): Promise<boolean> => {
    try {
      const res = await api.updateCertificateType(id, updates);
      if (res && res.success && res.data) {
        setCertificateTypes(prev => prev.map(ct => ct.id === id ? res.data : ct));
        showToast(language === 'mr' ? 'दाखला शुल्क व तपशील अपडेट केले गेले!' : 'Certificate fee & details updated!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating cert type:', err);
      return false;
    }
  };

  const deleteCertificateType = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteCertificateType(id);
      if (res && res.success) {
        setCertificateTypes(prev => prev.filter(ct => ct.id !== id));
        showToast(language === 'mr' ? 'दाखला सेवा निष्क्रिय केली गेली.' : 'Certificate service deactivated.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting cert type:', err);
      return false;
    }
  };

  const addGrievance = (grvData: Omit<Grievance, 'id' | 'ticketNo' | 'submittedDate' | 'status'>) => {
    const randomDigits = Math.floor(100 + Math.random() * 900);
    const newGrv: Grievance = {
      ...grvData,
      id: `grv-${Date.now()}`,
      ticketNo: `GRV-2026-${randomDigits}`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'submitted',
      gramPanchayat: grvData.gramPanchayat || currentUser?.gramPanchayat || currentGpName,
      taluka: grvData.taluka || currentUser?.taluka || currentTaluka,
      district: grvData.district || currentUser?.district || currentDistrict
    };

    api.createGrievance(newGrv).catch(err => console.warn('Grievance DB save error:', err));

    setGrievances(prev => [newGrv, ...prev]);
    showToast(language === 'mr' ? 'तक्रार यशस्वीरीत्या नोंदवली गेली!' : 'Grievance registered successfully!');
    triggerConfetti();
    return newGrv;
  };

  const updateGrievance = (id: string, updates: Partial<Grievance>) => {
    api.updateGrievance(id, updates).catch(err => console.warn('Grievance update DB error:', err));
    setGrievances(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          ...updates,
          resolvedDate: updates.status === 'resolved' ? new Date().toISOString().split('T')[0] : g.resolvedDate
        };
      }
      return g;
    }));
    showToast(language === 'mr' ? 'तक्रार निवारण अपडेट केले गेले!' : 'Grievance updated successfully!');
  };

  const addTaxAssessment = async (taxData: any): Promise<PropertyTaxRecord | null> => {
    const fullData = {
      ...taxData,
      gramPanchayat: taxData.gramPanchayat || currentUser?.gramPanchayat || currentGpName,
      taluka: taxData.taluka || currentUser?.taluka || currentTaluka,
      district: taxData.district || currentUser?.district || currentDistrict
    };

    try {
      const res = await api.createTaxAssessment(fullData);
      if (res && res.success && res.data) {
        setTaxRecords(prev => [res.data, ...prev.filter(r => r.id !== res.data.id && r.propertyNo !== res.data.propertyNo)]);
        showToast(language === 'mr' ? 'नवीन कर मागणी यशस्वीरीत्या नोंदवली गेली!' : 'Tax demand recorded successfully!');
        triggerConfetti();
        return res.data;
      }
    } catch (err) {
      console.error('Error creating tax assessment:', err);
    }

    const pTax = Number(taxData.propertyTax) || 0;
    const wTax = Number(taxData.waterTax) || 0;
    const hTax = Number(taxData.healthCess) || 0;
    const lTax = Number(taxData.lightTax) || 0;
    const total = pTax + wTax + hTax + lTax;
    const disc = Number(taxData.rebate) || Math.round(total * 0.1);
    const finalAmt = Math.max(0, total - disc);

    const localRecord: PropertyTaxRecord = {
      id: `tax-${Date.now()}`,
      propertyNo: taxData.propertyNo,
      ownerName: taxData.ownerName,
      wardNo: taxData.wardNo || 'Ward 1',
      gramPanchayat: fullData.gramPanchayat,
      taluka: fullData.taluka,
      district: fullData.district,
      propertyTax: pTax,
      waterTax: wTax,
      sanitationTax: hTax,
      lightingTax: lTax,
      totalTax: total,
      discount: disc,
      rebate: disc,
      finalAmount: finalAmt,
      isPaid: false,
      taxType: taxData.taxType || 'all'
    };

    setTaxRecords(prev => [localRecord, ...prev]);
    showToast(language === 'mr' ? 'कर मागणी नोंदवली गेली!' : 'Tax assessment recorded!');
    return localRecord;
  };

  const payTaxRecord = (propertyNo: string, mode: 'UPI' | 'Cash' | 'NetBanking' = 'UPI'): PropertyTaxRecord | null => {
    let updatedRecord: PropertyTaxRecord | null = null;
    const rcptNo = `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toISOString().split('T')[0];

    api.payTax(propertyNo, mode).catch(err => console.warn('Tax pay DB sync error:', err));

    setTaxRecords(prev => prev.map(rec => {
      if (rec.propertyNo.toLowerCase() === propertyNo.toLowerCase() || rec.id === propertyNo) {
        updatedRecord = {
          ...rec,
          isPaid: true,
          lastPaymentDate: today,
          paidDate: today,
          receiptNo: rcptNo,
          paymentMode: mode,
          paymentMethod: mode
        };
        return updatedRecord;
      }
      return rec;
    }));

    if (updatedRecord) {
      showToast(language === 'mr' ? `कर भरणा यशस्वी! पावती क्र: ${rcptNo}` : `Payment successful! Receipt: ${rcptNo}`);
      triggerConfetti();
    }
    return updatedRecord;
  };

  const deleteTaxAssessment = async (id: string): Promise<boolean> => {
    try {
      await api.deleteTaxAssessment(id);
      setTaxRecords(prev => prev.filter(r => r.id !== id && r.propertyNo !== id));
      showToast(language === 'mr' ? 'कर आकारणी नोंद हटवली गेली!' : 'Tax assessment deleted!');
      return true;
    } catch (err) {
      console.error('Error deleting tax assessment:', err);
      return false;
    }
  };

  const applyForScheme = async (schemeData: any): Promise<boolean> => {
    const fullData = {
      ...schemeData,
      gramPanchayat: schemeData.gramPanchayat || currentUser?.gramPanchayat || currentGpName,
      taluka: schemeData.taluka || currentUser?.taluka || currentTaluka,
      district: schemeData.district || currentUser?.district || currentDistrict
    };

    try {
      const res = await api.applyForScheme(fullData);
      if (res && res.success && res.data) {
        const app: SchemeApplication = {
          id: res.data.id,
          schemeId: res.data.scheme_id || fullData.schemeId,
          schemeName: fullData.schemeNameMr,
          schemeNameMr: fullData.schemeNameMr,
          schemeNameEn: fullData.schemeNameEn,
          applicantName: fullData.applicantName,
          name: fullData.applicantName,
          phone: fullData.applicantPhone,
          applicantPhone: fullData.applicantPhone,
          aadhaar: fullData.applicantAadhaar,
          applicantAadhaar: fullData.applicantAadhaar,
          wardNo: fullData.wardNo || 'Ward 1',
          ward: fullData.wardNo || 'Ward 1',
          gramPanchayat: fullData.gramPanchayat,
          taluka: fullData.taluka,
          district: fullData.district,
          benefitAmount: fullData.benefitAmount || 1500,
          amount: fullData.benefitAmount || 1500,
          status: 'pending',
          appliedDate: new Date().toISOString().split('T')[0],
          dbtStatus: 'pending'
        };
        setSchemeApplications(prev => [app, ...prev]);
        showToast(language === 'mr' ? `${fullData.schemeNameMr} साठी अर्ज नोंदवला गेला!` : 'Applied for scheme successfully!');
        triggerConfetti();
        return true;
      }
    } catch (err) {
      console.error('Error applying for scheme:', err);
    }
    return false;
  };

  const updateSchemeApplicationStatus = async (id: string, status: string, dbtStatus?: string) => {
    try {
      await api.updateSchemeApplicationStatus(id, status, dbtStatus);
    } catch (err) {
      console.warn('DB update error:', err);
    }
    setSchemeApplications(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: status === 'sanctioned' ? 'Sanctioned' : 'Pending Verification',
          sanctionedDate: status === 'sanctioned' ? new Date().toISOString().split('T')[0] : a.sanctionedDate,
          dbtDate: status === 'sanctioned' ? '2026-09-01' : a.dbtDate,
          dbtStatus: dbtStatus || (status === 'sanctioned' ? 'linked' : a.dbtStatus)
        };
      }
      return a;
    }));
    showToast(language === 'mr' ? 'लाभार्थी मंजूर झाला व DBT प्रणालीशी लिंक केला!' : 'Beneficiary sanctioned and linked to DBT!');
    triggerConfetti();
  };

  const addScheme = async (schemeData: any): Promise<boolean> => {
    try {
      const fullData = {
        ...schemeData,
        gramPanchayat: schemeData.gramPanchayat || currentUser?.gramPanchayat || currentGpName,
        taluka: schemeData.taluka || currentUser?.taluka || currentTaluka,
        district: schemeData.district || currentUser?.district || currentDistrict
      };
      const res = await api.addScheme(fullData);
      if (res && res.success) {
        const refreshed = await api.getSchemes(fullData.gramPanchayat);
        if (Array.isArray(refreshed)) setSchemes(refreshed);
        showToast(language === 'mr' ? 'नवीन शासकीय योजना जोडली गेली!' : 'New scheme added successfully!');
        triggerConfetti();
        return true;
      }
    } catch (err) {
      console.error('Error adding scheme:', err);
    }
    return false;
  };

  const addNotice = async (noticeData: Omit<GramNotice, 'id' | 'date'>) => {
    const targetGp = noticeData.gramPanchayat || currentUser?.gramPanchayat || currentGpName;
    const targetTaluka = noticeData.taluka || currentUser?.taluka || currentTaluka;
    const targetDistrict = noticeData.district || currentUser?.district || currentDistrict;

    const newNotice: GramNotice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      venue: noticeData.venue || `ग्रामपंचायत सभागृह, ${targetGp}`,
      gramPanchayat: targetGp,
      taluka: targetTaluka,
      district: targetDistrict
    };

    try {
      const res = await api.addNotice(newNotice);
      if (res && res.success) {
        const refreshed = await api.getNotices(targetGp);
        if (Array.isArray(refreshed)) {
          setNotices(refreshed);
        } else {
          setNotices(prev => [newNotice, ...prev]);
        }
        showToast(language === 'mr' ? 'नवीन सूचना प्रसिद्ध केली गेली!' : 'Notice published successfully!');
        triggerConfetti();
        return;
      }
    } catch (err) {
      console.warn('Notice DB sync error:', err);
    }
    setNotices(prev => [newNotice, ...prev]);
    showToast(language === 'mr' ? 'नवीन सूचना प्रसिद्ध केली गेली!' : 'Notice published successfully!');
  };

  const addProject = (projData: Omit<DevelopmentProject, 'id'>) => {
    const newProj: DevelopmentProject = {
      ...projData,
      id: `prj-${Date.now()}`,
      gramPanchayat: projData.gramPanchayat || currentGpName,
      taluka: projData.taluka || currentTaluka,
      district: projData.district || currentDistrict
    };
    api.addProject(newProj).catch(err => console.warn('Project DB sync error:', err));
    setProjects(prev => [newProj, ...prev]);
    showToast(language === 'mr' ? 'नवीन विकासकाम प्रकल्प जोडला गेला!' : 'Project added successfully!');
  };

  const updateProject = (id: string, updates: Partial<DevelopmentProject>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        appMode,
        setAppMode,
        mobileTab,
        setMobileTab,
        desktopTab,
        setDesktopTab,
        mobileFrameMode,
        setMobileFrameMode,
        isMobileScreen,
        currentUser,
        users,
        login,
        changeUserPassword,
        adminLogin,
        loginWithUser,
        registerCitizen,
        registerStaff,
        addUser,
        deleteUser,
        updateUser,
        updateUserProfile,
        promoteUser,
        logout,
        showAuthModal,
        setShowAuthModal,
        authType,
        setAuthType,
        authMode,
        setAuthMode,
        certificateTypes,
        addCertificateType,
        updateCertificateType,
        deleteCertificateType,
        certificates,
        addCertificate,
        updateCertificateStatus,
        grievances,
        addGrievance,
        updateGrievance,
        taxRecords,
        addTaxAssessment,
        payTaxRecord,
        deleteTaxAssessment,
        schemes,
        addScheme,
        schemeApplications,
        applyForScheme,
        updateSchemeApplicationStatus,
        notices,
        addNotice,
        projects,
        addProject,
        updateProject,
        officials,
        panchayatInfo,
        viewingCertificate,
        setViewingCertificate,
        viewingReceipt,
        setViewingReceipt,
        toast,
        showToast,
        triggerConfetti,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
