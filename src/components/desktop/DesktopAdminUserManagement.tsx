import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  ShieldCheck, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Key, 
  Crown, 
  Award, 
  Briefcase, 
  Receipt, 
  UserCheck, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  X, 
  Save, 
  Sparkles,
  Lock,
  ArrowRight,
  LogIn,
  Home,
  Calendar,
  CreditCard,
  Hash,
  Image as ImageIcon,
  UserCircle,
  Smartphone,
  KeyRound,
  Info
} from 'lucide-react';
import { LocationSelector } from '../common/LocationSelector';
import { 
  matchGramPanchayat, 
  matchTaluka, 
  matchDistrict, 
  formatGramPanchayat, 
  formatTaluka, 
  formatDistrict, 
  getCanonicalLocationKey 
} from '../../utils/jurisdiction';
import { formatUserName, formatDesignation } from '../../utils/nameLocalization';

type AccountCategory = 'citizen' | 'official' | 'bdo_admin';

export const DesktopAdminUserManagement: React.FC = () => {
  const { 
    language, 
    t, 
    users, 
    currentUser, 
    addUser, 
    deleteUser, 
    updateUser, 
    promoteUser,
    loginWithUser,
    refreshData,
    panchayatInfo 
  } = useApp();

  // Determine Current Operator Tier
  const isSuperAdmin = currentUser?.role === 'admin';
  const isTalukaBDO = currentUser?.role === 'taluka_bdo';
  const isPanchayatLeader = ['sarpanch', 'upsarpanch', 'gram_sevak'].includes(currentUser?.role || '');

  // Operator Assigned Scope
  const userDistrict = currentUser?.district || 'अहिल्यानगर';
  const userTaluka = currentUser?.taluka || 'संगमनेर';
  const userGp = currentUser?.gramPanchayat && currentUser.gramPanchayat !== 'सर्व ग्रामपंचायती (All GPs)' ? currentUser.gramPanchayat : 'घुलेवाडी';

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'citizen' | 'official' | 'bdo_admin' | 'promotable'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [talukaFilter, setTalukaFilter] = useState<string>('all');
  const [gpFilter, setGpFilter] = useState<string>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Promotion Form State
  const [promoteData, setPromoteData] = useState({
    userId: '',
    name: '',
    phone: '',
    currentRole: 'citizen' as UserRole,
    targetRole: (isTalukaBDO ? 'sarpanch' : 'sadasya') as UserRole,
    designation: '',
    employeeCode: '',
    wardNo: 'Ward 1',
    gramPanchayat: '',
    taluka: '',
    district: '',
    remarks: ''
  });

  // Force reassign states for smooth 1-click role replacement
  const [promoteForceReassign, setPromoteForceReassign] = useState(true);
  const [addForceReassign, setAddForceReassign] = useState(true);

  // Modal Category Tab (for Add and Edit forms)
  const [modalCategory, setModalCategory] = useState<AccountCategory>(isTalukaBDO ? 'official' : 'citizen');

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: (isTalukaBDO ? 'sarpanch' : 'citizen') as UserRole,
    designation: isTalukaBDO ? 'सरपंच (Gram Panchayat Head)' : '',
    employeeCode: '',
    dob: '',
    aadhaar: '',
    houseNo: '',
    address: '',
    state: 'Maharashtra',
    district: userDistrict,
    taluka: userTaluka,
    gramPanchayat: isPanchayatLeader ? userGp : 'घुलेवाडी',
    wardNo: 'Ward 1',
    avatarUrl: '',
    isActive: true
  });

  // Avatar Presets Gallery
  const citizenAvatarPresets = [
    { label: 'नागरिक (पुरुष १)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'नागरिक (स्त्री १)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
    { label: 'शेतकरी / ग्रामस्थ', url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop&q=80' },
    { label: 'ज्येष्ठ नागरिक', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { label: 'युवा नागरिक', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' }
  ];

  const officialAvatarPresets = [
    { label: 'सरपंच (प्रमुख)', url: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&auto=format&fit=crop&q=80' },
    { label: 'ग्रामसेवक (अधिकारी)', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80' },
    { label: 'महिला प्रतिनिधी / अधिकारी', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80' },
    { label: 'कर लिपिक / कर्मचारी', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { label: 'BDO / वरिष्ठ प्रशासक', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' }
  ];

  // Base list of users scoped by the current operator's authority
  const scopedUsers = useMemo(() => {
    if (isSuperAdmin) return users;
    if (isTalukaBDO) {
      // BDO sees users in their Taluka
      return users.filter(u => matchTaluka(u.taluka, userTaluka) || u.role === 'taluka_bdo');
    }
    if (isPanchayatLeader) {
      // Sarpanch / Gram Sevak sees users in their Gram Panchayat bilingually
      return users.filter(u => matchGramPanchayat(u.gramPanchayat, userGp));
    }
    return users;
  }, [users, isSuperAdmin, isTalukaBDO, isPanchayatLeader, userTaluka, userGp]);

  // Extract unique, deduplicated bilingual locations for filtering
  const availableDistricts = useMemo(() => {
    const map = new Map<string, { key: string; label: string }>();
    scopedUsers.forEach(u => {
      if (!u.district) return;
      const key = getCanonicalLocationKey(u.district);
      if (key && !map.has(key)) {
        map.set(key, {
          key,
          label: formatDistrict(u.district, language)
        });
      }
    });
    return Array.from(map.values());
  }, [scopedUsers, language]);

  const availableTalukas = useMemo(() => {
    const map = new Map<string, { key: string; label: string }>();
    scopedUsers.forEach(u => {
      if (!u.taluka) return;
      const key = getCanonicalLocationKey(u.taluka);
      if (key && !map.has(key)) {
        map.set(key, {
          key,
          label: formatTaluka(u.taluka, language)
        });
      }
    });
    return Array.from(map.values());
  }, [scopedUsers, language]);

  const availableGps = useMemo(() => {
    const map = new Map<string, { key: string; label: string }>();
    scopedUsers.forEach(u => {
      if (!u.gramPanchayat || u.gramPanchayat.includes('सर्व ग्रामपंचायती')) return;
      const key = getCanonicalLocationKey(u.gramPanchayat);
      if (key && !map.has(key)) {
        map.set(key, {
          key,
          label: formatGramPanchayat(u.gramPanchayat, language)
        });
      }
    });
    return Array.from(map.values());
  }, [scopedUsers, language]);

  // Active Selected Gram Panchayat and Taluka for Leadership Dashboard Ribbon
  const activeSelectedGp = useMemo(() => {
    if (gpFilter !== 'all') {
      const found = availableGps.find(g => g.key === gpFilter);
      return found ? found.label : gpFilter;
    }
    return isPanchayatLeader ? userGp : (availableGps[0]?.label || 'घुलेवाडी');
  }, [gpFilter, availableGps, isPanchayatLeader, userGp]);

  const activeSelectedTaluka = useMemo(() => {
    if (talukaFilter !== 'all') {
      const found = availableTalukas.find(t => t.key === talukaFilter);
      return found ? found.label : talukaFilter;
    }
    return userTaluka;
  }, [talukaFilter, availableTalukas, userTaluka]);

  // Panchayat Leadership Occupancy for Active GP & Taluka
  const leadershipOccupancy = useMemo(() => {
    const activeBdoUser = users.find(u => 
      u.role === 'taluka_bdo' && 
      (matchTaluka(u.taluka, activeSelectedTaluka) || !u.taluka) && 
      u.isActive !== false
    );

    const activeSarpanchUser = users.find(u => 
      u.role === 'sarpanch' && 
      matchGramPanchayat(u.gramPanchayat, activeSelectedGp) && 
      u.isActive !== false
    );

    const activeUpSarpanchUser = users.find(u => 
      u.role === 'upsarpanch' && 
      matchGramPanchayat(u.gramPanchayat, activeSelectedGp) && 
      u.isActive !== false
    );

    const activeGramSevakUser = users.find(u => 
      u.role === 'gram_sevak' && 
      matchGramPanchayat(u.gramPanchayat, activeSelectedGp) && 
      u.isActive !== false
    );

    return {
      bdo: activeBdoUser || null,
      sarpanch: activeSarpanchUser || null,
      upsarpanch: activeUpSarpanchUser || null,
      gramSevak: activeGramSevakUser || null
    };
  }, [users, activeSelectedGp, activeSelectedTaluka]);

  // Live conflict detection for Add User Modal
  const addModalOccupancyConflict = useMemo(() => {
    if (!showAddModal) return null;
    const targetRole = formData.role;
    if (!['taluka_bdo', 'sarpanch', 'upsarpanch', 'gram_sevak', 'sadasya'].includes(targetRole)) {
      return null;
    }

    if (targetRole === 'taluka_bdo') {
      const occ = users.find(u => u.role === 'taluka_bdo' && matchTaluka(u.taluka, formData.taluka || userTaluka) && u.isActive !== false);
      const loc = `तालुका ${formData.taluka || userTaluka}`;
      return { isSingleOccupancy: true, isOccupied: !!occ, occupant: occ || null, locationText: loc };
    }

    if (targetRole === 'sadasya') {
      const targetWardNumMatch = (formData.wardNo || '').match(/\d+/);
      const targetWardNum = targetWardNumMatch ? targetWardNumMatch[0] : '';
      const occ = users.find(u => {
        if (u.role !== 'sadasya' || u.isActive === false) return false;
        if (!matchGramPanchayat(u.gramPanchayat, formData.gramPanchayat || userGp)) return false;
        const uWardMatch = (u.wardNo || '').match(/\d+/);
        const uWardNum = uWardMatch ? uWardMatch[0] : '';
        return targetWardNum && uWardNum === targetWardNum;
      });
      const loc = `ग्रामपंचायत ${formData.gramPanchayat || userGp} (प्रभाग/वॉर्ड ${targetWardNum || formData.wardNo})`;
      return { isSingleOccupancy: true, isOccupied: !!occ, occupant: occ || null, locationText: loc };
    }

    const occ = users.find(u => 
      u.role === targetRole && 
      matchGramPanchayat(u.gramPanchayat, formData.gramPanchayat || userGp) && 
      u.isActive !== false
    );
    const loc = `ग्रामपंचायत ${formData.gramPanchayat || userGp}`;
    return { isSingleOccupancy: true, isOccupied: !!occ, occupant: occ || null, locationText: loc };
  }, [showAddModal, formData.role, formData.gramPanchayat, formData.taluka, formData.wardNo, users, userGp, userTaluka]);

  // Live conflict detection for Promote Modal
  const promoteModalOccupancyConflict = useMemo(() => {
    if (!showPromoteModal || !selectedUser) return null;
    const targetRole = promoteData.targetRole;
    if (targetRole === 'citizen' || !['taluka_bdo', 'sarpanch', 'upsarpanch', 'gram_sevak', 'sadasya'].includes(targetRole)) {
      return null;
    }

    if (targetRole === 'taluka_bdo') {
      const occ = users.find(u => 
        u.role === 'taluka_bdo' && 
        u.id !== selectedUser.id && 
        u.phone !== selectedUser.phone &&
        matchTaluka(u.taluka, promoteData.taluka || userTaluka) && 
        u.isActive !== false
      );
      const loc = `तालुका ${promoteData.taluka || userTaluka}`;
      return { isSingleOccupancy: true, isOccupied: !!occ, occupant: occ || null, locationText: loc };
    }

    if (targetRole === 'sadasya') {
      const targetWardNumMatch = (promoteData.wardNo || '').match(/\d+/);
      const targetWardNum = targetWardNumMatch ? targetWardNumMatch[0] : '';
      const occ = users.find(u => {
        if (u.role !== 'sadasya' || u.id === selectedUser.id || u.phone === selectedUser.phone || u.isActive === false) return false;
        if (!matchGramPanchayat(u.gramPanchayat, promoteData.gramPanchayat || userGp)) return false;
        const uWardMatch = (u.wardNo || '').match(/\d+/);
        const uWardNum = uWardMatch ? uWardMatch[0] : '';
        return targetWardNum && uWardNum === targetWardNum;
      });
      const loc = `ग्रामपंचायत ${promoteData.gramPanchayat || userGp} (प्रभाग/वॉर्ड ${targetWardNum || promoteData.wardNo})`;
      return { isSingleOccupancy: true, isOccupied: !!occ, occupant: occ || null, locationText: loc };
    }

    const occ = users.find(u => 
      u.role === targetRole && 
      u.id !== selectedUser.id && 
      u.phone !== selectedUser.phone &&
      matchGramPanchayat(u.gramPanchayat, promoteData.gramPanchayat || userGp) && 
      u.isActive !== false
    );
    const loc = `ग्रामपंचायत ${promoteData.gramPanchayat || userGp}`;
    return { isSingleOccupancy: true, isOccupied: !!occ, occupant: occ || null, locationText: loc };
  }, [showPromoteModal, selectedUser, promoteData.targetRole, promoteData.gramPanchayat, promoteData.taluka, promoteData.wardNo, users, userGp, userTaluka]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return scopedUsers.filter(user => {
      // Category Filter
      if (activeCategoryFilter === 'citizen' && user.role !== 'citizen') return false;
      if (activeCategoryFilter === 'promotable' && user.role !== 'citizen') return false;
      if (activeCategoryFilter === 'official' && !['sarpanch', 'upsarpanch', 'gram_sevak', 'sadasya', 'tax_clerk', 'staff'].includes(user.role)) return false;
      if (activeCategoryFilter === 'bdo_admin' && !['taluka_bdo', 'admin'].includes(user.role)) return false;

      const matchesSearch = 
        !searchTerm ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.employeeCode && user.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.aadhaar && user.aadhaar.includes(searchTerm)) ||
        (user.houseNo && user.houseNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.gramPanchayat && (
          user.gramPanchayat.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatGramPanchayat(user.gramPanchayat, 'mr').toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatGramPanchayat(user.gramPanchayat, 'en').toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.isActive !== false) ||
        (statusFilter === 'inactive' && user.isActive === false);

      const matchesDistrict = districtFilter === 'all' || matchDistrict(user.district, districtFilter);
      const matchesTaluka = talukaFilter === 'all' || matchTaluka(user.taluka, talukaFilter);
      const matchesGp = gpFilter === 'all' || matchGramPanchayat(user.gramPanchayat, gpFilter);

      return matchesSearch && matchesRole && matchesStatus && matchesDistrict && matchesTaluka && matchesGp;
    });
  }, [scopedUsers, activeCategoryFilter, searchTerm, roleFilter, statusFilter, districtFilter, talukaFilter, gpFilter]);

  // KPI Statistics
  const stats = useMemo(() => {
    const total = scopedUsers.length;
    const citizens = scopedUsers.filter(u => u.role === 'citizen').length;
    const officials = scopedUsers.filter(u => ['sarpanch', 'upsarpanch', 'gram_sevak', 'sadasya', 'tax_clerk', 'staff'].includes(u.role)).length;
    const bdoAndAdmins = scopedUsers.filter(u => ['taluka_bdo', 'admin'].includes(u.role)).length;
    const activeCount = scopedUsers.filter(u => u.isActive !== false).length;
    const uniqueGps = new Set(scopedUsers.map(u => getCanonicalLocationKey(u.gramPanchayat)).filter(Boolean)).size;

    return { total, citizens, officials, bdoAndAdmins, activeCount, uniqueGps };
  }, [scopedUsers]);

  // Switch category within Add/Edit modal
  const handleSelectModalCategory = (category: AccountCategory) => {
    setModalCategory(category);
    if (category === 'citizen') {
      setFormData(prev => ({
        ...prev,
        role: 'citizen',
        designation: '',
        employeeCode: '',
        password: '',
        avatarUrl: prev.avatarUrl || citizenAvatarPresets[0].url
      }));
    } else if (category === 'official') {
      setFormData(prev => ({
        ...prev,
        role: (isTalukaBDO ? 'sarpanch' : (prev.role === 'citizen' ? 'sadasya' : prev.role)) as UserRole,
        designation: isTalukaBDO ? 'सरपंच (Gram Panchayat Head)' : 'ग्रामपंचायत सदस्य / कर्मचारी',
        employeeCode: prev.employeeCode || `STF-${Math.floor(1000 + Math.random() * 9000)}`,
        password: '',
        avatarUrl: prev.avatarUrl || officialAvatarPresets[0].url
      }));
    } else if (category === 'bdo_admin') {
      setFormData(prev => ({
        ...prev,
        role: (prev.role === 'admin' ? 'admin' : 'taluka_bdo') as UserRole,
        designation: prev.role === 'admin' ? 'सिस्टीम ॲडमिनिस्ट्रेटर (Admin)' : 'गटविकास अधिकारी (Taluka BDO)',
        employeeCode: prev.role === 'admin' ? 'ADM-HQ-001' : (prev.employeeCode || `BDO-${Math.floor(100 + Math.random() * 900)}`),
        password: prev.role === 'admin' ? (prev.password || 'admin123') : '',
        avatarUrl: prev.avatarUrl || officialAvatarPresets[4].url
      }));
    }
  };

  // Open Add User Modal from Leadership Card (pre-configured)
  const handleOpenLeadershipAddModal = (targetRole: UserRole, targetGp?: string, targetTaluka?: string) => {
    setModalCategory(targetRole === 'taluka_bdo' ? 'bdo_admin' : 'official');
    let desig = '';
    if (targetRole === 'sarpanch') desig = 'सरपंच (Gram Panchayat Head)';
    else if (targetRole === 'upsarpanch') desig = 'उपसरपंच (Deputy Sarpanch)';
    else if (targetRole === 'gram_sevak') desig = 'ग्रामविकास अधिकारी (Gram Sevak)';
    else if (targetRole === 'taluka_bdo') desig = 'गटविकास अधिकारी (Taluka BDO)';

    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: targetRole,
      designation: desig,
      employeeCode: `STF-${Math.floor(1000 + Math.random() * 9000)}`,
      dob: '',
      aadhaar: '',
      houseNo: '',
      address: '',
      state: 'Maharashtra',
      district: userDistrict,
      taluka: targetTaluka || activeSelectedTaluka,
      gramPanchayat: targetRole === 'taluka_bdo' ? '' : (targetGp || activeSelectedGp),
      wardNo: 'Ward 1',
      avatarUrl: officialAvatarPresets[0].url,
      isActive: true
    });
    setAddForceReassign(true);
    setShowAddModal(true);
  };

  // Open Add User Modal with role-specific defaults
  const handleOpenAddModal = (initialCategory: AccountCategory = isTalukaBDO ? 'official' : 'citizen') => {
    setModalCategory(initialCategory);

    let defaultRole: UserRole = 'citizen';
    let defaultDesig = '';
    if (isTalukaBDO) {
      defaultRole = 'sarpanch';
      defaultDesig = 'सरपंच (Gram Panchayat Head)';
    } else if (isPanchayatLeader && initialCategory === 'official') {
      defaultRole = 'sadasya';
      defaultDesig = 'ग्रामपंचायत वॉर्ड सदस्य';
    }

    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: defaultRole,
      designation: defaultDesig,
      employeeCode: initialCategory === 'citizen' ? '' : `STF-${Math.floor(1000 + Math.random() * 9000)}`,
      dob: '',
      aadhaar: '',
      houseNo: '',
      address: '',
      state: 'Maharashtra',
      district: userDistrict,
      taluka: userTaluka,
      gramPanchayat: userGp,
      wardNo: 'Ward 1',
      avatarUrl: initialCategory === 'citizen' ? citizenAvatarPresets[0].url : officialAvatarPresets[0].url,
      isActive: true
    });
    setAddForceReassign(true);
    setShowAddModal(true);
  };

  // Open Edit User Modal
  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    const userCategory: AccountCategory = user.role === 'citizen' 
      ? 'citizen' 
      : ['taluka_bdo', 'admin'].includes(user.role) 
      ? 'bdo_admin' 
      : 'official';

    setModalCategory(userCategory);
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      password: user.role === 'admin' ? (user.password || 'admin123') : '',
      role: user.role || 'citizen',
      designation: user.designation || '',
      employeeCode: user.employeeCode || '',
      dob: user.dob || '',
      aadhaar: user.aadhaar || '',
      houseNo: user.houseNo || '',
      address: user.address || '',
      state: user.state || 'Maharashtra',
      district: user.district || userDistrict,
      taluka: user.taluka || userTaluka,
      gramPanchayat: user.gramPanchayat || userGp,
      wardNo: user.wardNo || 'Ward 1',
      avatarUrl: user.avatarUrl || '',
      isActive: user.isActive !== false
    });
    setShowEditModal(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Submit Add User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert(language === 'mr' ? 'नाव आणि १० अंकी मोबाईल नंबर आवश्यक आहे.' : 'Name and 10-digit Mobile are required.');
      return;
    }

    if (formData.role === 'admin' && !formData.password.trim()) {
      alert(language === 'mr' ? 'कृपया सिस्टीम ॲडमिनसाठी पासवर्ड प्रविष्ट करा.' : 'Please enter a Password for System Admin.');
      return;
    }

    const payload = {
      ...formData,
      houseNo: formData.houseNo || '-',
      wardNo: formData.wardNo || 'Ward 1',
      gramPanchayat: formData.role === 'taluka_bdo' ? '' : (formData.gramPanchayat || userGp),
      forceReassign: addForceReassign
    };

    setIsSubmitting(true);
    const res = await addUser(payload);
    setIsSubmitting(false);

    if (res) {
      setShowAddModal(false);
      refreshData();
    }
  };

  // Submit Edit User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert(language === 'mr' ? 'नाव आणि मोबाईल नंबर आवश्यक आहे.' : 'Name and Mobile are required.');
      return;
    }

    if (formData.role === 'admin' && !formData.password.trim()) {
      alert(language === 'mr' ? 'कृपया सिस्टीम ॲडमिनसाठी पासवर्ड प्रविष्ट करा.' : 'Please enter a Password for System Admin.');
      return;
    }

    setIsSubmitting(true);
    const success = await updateUser(selectedUser.id, formData);
    setIsSubmitting(false);

    if (success) {
      setShowEditModal(false);
      setSelectedUser(null);
      refreshData();
    }
  };

  // Submit Delete User
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    const success = await deleteUser(selectedUser.id);
    setIsSubmitting(false);
    if (success) {
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  // Toggle User Active/Inactive
  const handleToggleStatus = async (user: User) => {
    const newStatus = !(user.isActive !== false);
    await updateUser(user.id, { isActive: newStatus });
  };

  // Open Role Promotion / Demotion Modal
  const handleOpenPromoteModal = (user: User) => {
    setSelectedUser(user);

    const isCitizen = user.role === 'citizen';
    let defaultTarget: UserRole = 'sadasya';

    if (isCitizen) {
      defaultTarget = isTalukaBDO ? 'sarpanch' : 'sadasya';
    } else {
      // If already an official, default to their current role or allow easy demotion
      defaultTarget = user.role;
    }

    let defaultDesig = '';
    if (defaultTarget === 'sarpanch') defaultDesig = 'सरपंच (Gram Panchayat Head)';
    else if (defaultTarget === 'upsarpanch') defaultDesig = 'उपसरपंच (Deputy Sarpanch)';
    else if (defaultTarget === 'gram_sevak') defaultDesig = 'ग्रामविकास अधिकारी (Gram Sevak)';
    else if (defaultTarget === 'sadasya') defaultDesig = user.wardNo ? `ग्रामपंचायत सदस्य (${user.wardNo})` : 'ग्रामपंचायत सदस्य (Ward Member)';
    else if (defaultTarget === 'tax_clerk') defaultDesig = 'कर वसुली लिपिक व संगणक परिचालक';
    else if (defaultTarget === 'staff') defaultDesig = 'ग्रामपंचायत कर्मचारी (Panchayat Staff)';
    else if (defaultTarget === 'taluka_bdo') defaultDesig = 'गटविकास अधिकारी (Taluka BDO)';
    else if (defaultTarget === 'admin') defaultDesig = 'सिस्टीम ॲडमिनिस्ट्रेटर (Admin)';
    else defaultDesig = 'नागरिक (Citizen)';

    const orderCode = defaultTarget === 'citizen' ? '' : (user.employeeCode || `GP-ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);

    setPromoteData({
      userId: user.id,
      name: user.name || '',
      phone: user.phone || '',
      currentRole: user.role || 'citizen',
      targetRole: defaultTarget,
      designation: defaultDesig,
      employeeCode: orderCode,
      wardNo: user.wardNo || 'Ward 1',
      gramPanchayat: user.gramPanchayat || userGp,
      taluka: user.taluka || userTaluka,
      district: user.district || userDistrict,
      remarks: isCitizen
        ? (language === 'mr' ? 'ग्रामपंचायत मासिक सभा ठराव क्र. ४ अन्वये पदभार वाटप' : 'Role assigned as per Gram Panchayat resolution.')
        : (language === 'mr' ? 'प्रशासकीय कार्यभार फेरबदल / पदबदल आदेश' : 'Administrative role change / demotion order.')
    });
    setShowPromoteModal(true);
  };

  // Change Target Role in Promotion / Demotion Modal
  const handleTargetRoleChange = (role: UserRole) => {
    let newDesig = '';
    let newCode = promoteData.employeeCode;

    if (role === 'sarpanch') newDesig = 'सरपंच (Gram Panchayat Head)';
    else if (role === 'upsarpanch') newDesig = 'उपसरपंच (Deputy Sarpanch)';
    else if (role === 'gram_sevak') newDesig = 'ग्रामविकास अधिकारी (Gram Sevak)';
    else if (role === 'sadasya') newDesig = promoteData.wardNo ? `ग्रामपंचायत सदस्य (${promoteData.wardNo})` : 'ग्रामपंचायत सदस्य (Ward Member)';
    else if (role === 'tax_clerk') newDesig = 'कर वसुली लिपिक व संगणक परिचालक';
    else if (role === 'staff') newDesig = 'ग्रामपंचायत कर्मचारी (Panchayat Staff)';
    else if (role === 'taluka_bdo') newDesig = 'गटविकास अधिकारी (Taluka BDO)';
    else if (role === 'admin') newDesig = 'सिस्टीम ॲडमिनिस्ट्रेटर (Admin)';
    else {
      newDesig = 'नागरिक (Citizen)';
      newCode = '';
    }

    if (role !== 'citizen' && !newCode) {
      newCode = `GP-ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    }

    setPromoteData(prev => ({
      ...prev,
      targetRole: role,
      designation: newDesig,
      employeeCode: newCode
    }));
  };

  // Submit Role Promotion / Demotion
  const handleSubmitPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    const isDemotion = promoteData.targetRole === 'citizen';
    const success = await promoteUser(selectedUser.id, {
      role: promoteData.targetRole,
      newRole: promoteData.targetRole,
      designation: isDemotion ? 'नागरिक (Citizen)' : (promoteData.designation.trim() || undefined),
      employeeCode: isDemotion ? '' : (promoteData.employeeCode.trim() || undefined),
      wardNo: promoteData.wardNo || undefined,
      gramPanchayat: promoteData.gramPanchayat || undefined,
      taluka: promoteData.taluka || undefined,
      district: promoteData.district || undefined,
      remarks: promoteData.remarks.trim() || undefined,
      promotedBy: currentUser?.name || currentUser?.role || 'Admin',
      forceReassign: promoteForceReassign
    });
    setIsSubmitting(false);

    if (success) {
      setShowPromoteModal(false);
      setSelectedUser(null);
      refreshData();
    }
  };

  // Helper function for role badge
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: language === 'mr' ? 'सिस्टीम ॲडमिन' : 'Super Admin',
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          authType: 'password',
          authLabel: language === 'mr' ? '🔑 पासवर्ड आधारित' : 'Password Login',
          icon: Shield
        };
      case 'taluka_bdo':
        return {
          label: language === 'mr' ? 'गटविकास अधिकारी (BDO)' : 'Taluka BDO',
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          authType: 'otp',
          authLabel: language === 'mr' ? '📱 OTP आधारित' : 'OTP Login',
          icon: Building2
        };
      case 'sarpanch':
        return {
          label: language === 'mr' ? 'सरपंच (लोकप्रतिनिधी)' : 'Sarpanch',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          authType: 'otp',
          authLabel: language === 'mr' ? '📱 OTP आधारित' : 'OTP Login',
          icon: Crown
        };
      case 'upsarpanch':
        return {
          label: language === 'mr' ? 'उपसरपंच' : 'Up-Sarpanch',
          bg: 'bg-orange-100 text-orange-900 border-orange-300',
          authType: 'otp',
          authLabel: language === 'mr' ? '📱 OTP आधारित' : 'OTP Login',
          icon: Award
        };
      case 'gram_sevak':
        return {
          label: language === 'mr' ? 'ग्रामविकास अधिकारी' : 'Gram Sevak',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          authType: 'otp',
          authLabel: language === 'mr' ? '📱 OTP आधारित' : 'OTP Login',
          icon: ShieldCheck
        };
      case 'sadasya':
        return {
          label: language === 'mr' ? 'वॉर्ड सदस्य' : 'Ward Member',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          authType: 'otp',
          authLabel: language === 'mr' ? '📱 OTP आधारित' : 'OTP Login',
          icon: Users
        };
      case 'tax_clerk':
        return {
          label: language === 'mr' ? 'कर लिपिक' : 'Tax Clerk',
          bg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
          authType: 'otp',
          authLabel: language === 'mr' ? '📱 OTP आधारित' : 'OTP Login',
          icon: Receipt
        };
      case 'staff':
        return {
          label: language === 'mr' ? 'कर्मचारी' : 'Staff',
          bg: 'bg-slate-100 text-slate-900 border-slate-300',
          authType: 'otp',
          authLabel: language === 'mr' ? '📱 OTP आधारित' : 'OTP Login',
          icon: Briefcase
        };
      default:
        return {
          label: language === 'mr' ? 'नागरिक (Citizen)' : 'Citizen',
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          authType: 'otp',
          authLabel: language === 'mr' ? '📱 OTP आधारित' : 'OTP Login',
          icon: UserCheck
        };
    }
  };

  // Export CSV of Users
  const exportUsersCSV = () => {
    const headers = ['ID', 'Name', 'Role', 'Auth Type', 'Designation', 'Phone', 'Email', 'DOB', 'Aadhaar', 'District', 'Taluka', 'Gram Panchayat', 'Ward', 'House No', 'Address', 'Employee Code', 'Status'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name}"`,
      u.role,
      u.role === 'admin' ? 'Password' : 'OTP',
      `"${u.designation || ''}"`,
      u.phone,
      u.email || '',
      u.dob || '',
      u.aadhaar || '',
      `"${u.district || ''}"`,
      `"${u.taluka || ''}"`,
      `"${u.gramPanchayat || ''}"`,
      `"${u.wardNo || ''}"`,
      `"${u.houseNo || ''}"`,
      `"${(u.address || '').replace(/"/g, '""')}"`,
      `"${u.employeeCode || ''}"`,
      u.isActive !== false ? 'Active' : 'Inactive'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `grampanchayat_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header & Dynamic Authority Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30 flex items-center gap-1.5">
              {isSuperAdmin ? (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'केंद्रीय प्रशासकीय नियंत्रण कक्ष (Master Admin)' : 'Central Admin Master Desk'}</span>
                </>
              ) : isTalukaBDO ? (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? `तालुका गटविकास अधिकारी कक्ष (ता. ${userTaluka})` : `Taluka BDO Desk (${userTaluka})`}</span>
                </>
              ) : (
                <>
                  <Crown className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? `ग्रामपंचायत नोंदणी कक्ष (${userGp})` : `Gram Panchayat Desk (${userGp})`}</span>
                </>
              )}
            </span>
            <span className="text-xs text-slate-400 font-mono">Total: {stats.total}</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-black mt-2 tracking-tight text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-amber-400" />
            <span>
              {isSuperAdmin 
                ? (language === 'mr' ? 'सर्व युझर व अधिकारी खाते व्यवस्थापन' : 'Master User & Officer Directory') 
                : isTalukaBDO 
                ? (language === 'mr' ? 'तालुका सरपंच व ग्रामसेवक नियुक्ती व्यवस्थापन' : 'Taluka Sarpanch & Gram Sevak Appointment Desk') 
                : (language === 'mr' ? 'गाव नागरिक व कर्मचारी नोंदणी कक्ष' : 'Village Citizen & Staff Registration Desk')}
            </span>
          </h1>

          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            {isSuperAdmin 
              ? (language === 'mr' ? 'केंद्रीय प्रशासक: सर्व नागरिक, सरपंच, ग्रामसेवक, BDO व ॲडमिन खाती जोडणे व व्यवस्थापित करण्याचे पूर्ण अधिकार.' : 'Super Admin: Full authority to manage Citizens, Sarpanches, Gram Sevaks, BDOs and System Administrators.')
              : isTalukaBDO
              ? (language === 'mr' ? 'तालुका BDO: आपल्या तालुक्यातील ग्रामपंचायतींसाठी सरपंच, उपसरपंच व ग्रामविकास अधिकारी (ग्रामसेवक) यांची नियुक्ती व नोंदणी करा.' : 'Taluka BDO: Appoint and register Sarpanch, Up-Sarpanch, and Gram Sevak for Gram Panchayats in your taluka.')
              : (language === 'mr' ? 'सरपंच / ग्रामसेवक: आपल्या गावातील नागरिक (गाव रहिवासी), वॉर्ड सदस्य, कर लिपिक व कर्मचाऱ्यांची अधिकृत नोंदणी करा.' : 'Sarpanch / Gram Sevak: Register and manage village Citizens, Ward Members, Tax Clerks and Panchayat Staff for your GP.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => refreshData()}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 shadow-sm active:scale-95"
            title={language === 'mr' ? 'डेटा रीफ्रेश करा' : 'Refresh Data'}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'mr' ? 'रीफ्रेश' : 'Refresh'}</span>
          </button>

          <button
            onClick={exportUsersCSV}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 shadow-sm active:scale-95"
            title={language === 'mr' ? 'CSV एक्सपोर्ट' : 'Export CSV'}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'mr' ? 'एक्सपोर्ट' : 'Export'}</span>
          </button>

          {/* Quick Add Citizen (For Super Admin or Sarpanch/Gram Sevak) */}
          {!isTalukaBDO && (
            <button
              onClick={() => handleOpenAddModal('citizen')}
              className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95 border border-emerald-400/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'mr' ? '+ नागरिक जोडा (OTP)' : '+ Add Citizen (OTP)'}</span>
            </button>
          )}

          {/* Add Official Button (Context Aware) */}
          <button
            onClick={() => handleOpenAddModal('official')}
            className="flex-1 lg:flex-none px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl font-black text-xs md:text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 border border-amber-300/30"
          >
            {isTalukaBDO ? <Building2 className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
            <span>
              {isTalukaBDO 
                ? (language === 'mr' ? '+ सरपंच / ग्रामसेवक नियुक्ती' : '+ Appoint Sarpanch / Gram Sevak') 
                : isPanchayatLeader 
                ? (language === 'mr' ? '+ कर्मचारी / सदस्य जोडा' : '+ Add Staff / Member')
                : (language === 'mr' ? '+ अधिकारी / BDO जोडा' : '+ Add Officer / Staff')}
            </span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setActiveCategoryFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeCategoryFilter === 'all' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/40' 
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <span className={`text-[11px] font-bold block ${activeCategoryFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            {language === 'mr' ? 'एकूण नोंदणीकृत' : 'Total Directory'}
          </span>
          <span className={`text-2xl font-black mt-1 block ${activeCategoryFilter === 'all' ? 'text-white' : 'text-slate-900'}`}>
            {stats.total}
          </span>
          <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-0.5 ${activeCategoryFilter === 'all' ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <CheckCircle2 className="w-3 h-3" /> {stats.activeCount} सक्रिय (Active)
          </span>
        </div>

        <div 
          onClick={() => setActiveCategoryFilter('citizen')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeCategoryFilter === 'citizen' 
              ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-500/40' 
              : 'bg-white hover:bg-amber-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold block ${activeCategoryFilter === 'citizen' ? 'text-amber-100' : 'text-amber-600'}`}>
              {language === 'mr' ? '📱 नागरिक खाती' : 'Citizens'}
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${activeCategoryFilter === 'citizen' ? 'bg-black/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
              OTP
            </span>
          </div>
          <span className={`text-2xl font-black mt-1 block ${activeCategoryFilter === 'citizen' ? 'text-white' : 'text-amber-900'}`}>
            {stats.citizens}
          </span>
          <span className={`text-[10px] font-medium ${activeCategoryFilter === 'citizen' ? 'text-amber-100' : 'text-slate-500'}`}>
            गावातील रहिवासी (OTP)
          </span>
        </div>

        <div 
          onClick={() => setActiveCategoryFilter('official')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeCategoryFilter === 'official' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/40' 
              : 'bg-white hover:bg-blue-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold block ${activeCategoryFilter === 'official' ? 'text-blue-100' : 'text-blue-600'}`}>
              {language === 'mr' ? '🏛️ पदाधिकारी / सेवक' : 'Staff & Officials'}
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${activeCategoryFilter === 'official' ? 'bg-black/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
              OTP
            </span>
          </div>
          <span className={`text-2xl font-black mt-1 block ${activeCategoryFilter === 'official' ? 'text-white' : 'text-blue-900'}`}>
            {stats.officials}
          </span>
          <span className={`text-[10px] font-medium ${activeCategoryFilter === 'official' ? 'text-blue-100' : 'text-slate-500'}`}>
            सरपंच, ग्रामसेवक, सदस्य (OTP)
          </span>
        </div>

        {isSuperAdmin && (
          <div 
            onClick={() => setActiveCategoryFilter('bdo_admin')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeCategoryFilter === 'bdo_admin' 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/40' 
                : 'bg-white hover:bg-indigo-50/50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold block ${activeCategoryFilter === 'bdo_admin' ? 'text-indigo-100' : 'text-indigo-600'}`}>
                {language === 'mr' ? '🏢 BDO व ॲडमिन' : 'BDO & Admins'}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${activeCategoryFilter === 'bdo_admin' ? 'bg-black/20 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                Hybrid
              </span>
            </div>
            <span className={`text-2xl font-black mt-1 block ${activeCategoryFilter === 'bdo_admin' ? 'text-white' : 'text-indigo-900'}`}>
              {stats.bdoAndAdmins}
            </span>
            <span className={`text-[10px] font-medium ${activeCategoryFilter === 'bdo_admin' ? 'text-indigo-100' : 'text-slate-500'}`}>
              तालुका व केंद्रीय प्रशासन
            </span>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-purple-600 block">{language === 'mr' ? 'समाविष्ट GP' : 'Gram Panchayats'}</span>
          <span className="text-2xl font-black text-purple-900 mt-1 block">{stats.uniqueGps}</span>
          <span className="text-[10px] text-slate-500 font-medium">{isPanchayatLeader ? userGp : isTalukaBDO ? `ता. ${userTaluka}` : 'सर्व महाराष्ट्र GP'}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 block">{language === 'mr' ? 'सुरक्षा मॉडेल' : 'Security Mode'}</span>
          <span className="text-xs font-black text-emerald-700 mt-2 block flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            OTP Base Login
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">DB Synced</span>
        </div>
      </div>

      {/* 2.5. Panchayat Leadership Occupancy Desk Ribbon */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 border border-indigo-500/20 text-white shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-400/20 text-amber-400 rounded-lg border border-amber-400/30">
                <Crown className="w-4 h-4" />
              </span>
              <h2 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>
                  {language === 'mr'
                    ? `ग्रामपंचायत व तालुका नेतृत्व पदभार स्थिती (${activeSelectedGp}, ता. ${activeSelectedTaluka})`
                    : `Panchayat & Taluka Leadership Desk (${activeSelectedGp}, Tal. ${activeSelectedTaluka})`}
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
              {language === 'mr'
                ? '१ तालुका = १ BDO | १ ग्रामपंचायत = १ सरपंच, १ उपसरपंच, १ ग्रामसेवक (स्थाननिहाय पदभार नियंत्रण)'
                : 'Single-Occupancy Jurisdiction: 1 Taluka = 1 BDO | 1 GP = 1 Sarpanch, 1 Up-Sarpanch, 1 Gram Sevak'}
            </p>
          </div>

          {/* Quick context info */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 bg-white/10 rounded-xl font-bold text-amber-300 border border-white/10 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{activeSelectedGp}</span>
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-xl font-bold text-indigo-200 border border-white/10">
              ता. {activeSelectedTaluka}
            </span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Taluka BDO Card */}
          <div className="bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[11px] font-black block text-indigo-200">
                      {language === 'mr' ? 'गटविकास अधिकारी (BDO)' : 'Taluka BDO'}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">ता. {activeSelectedTaluka}</span>
                  </div>
                </div>
                {leadershipOccupancy.bdo ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {language === 'mr' ? 'कार्यरत' : 'Active'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black">
                    {language === 'mr' ? 'रिक्त' : 'Vacant'}
                  </span>
                )}
              </div>

              {leadershipOccupancy.bdo ? (
                <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 space-y-1">
                  <div className="font-bold text-xs text-white truncate">
                    {formatUserName(leadershipOccupancy.bdo.name, language)}
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    {leadershipOccupancy.bdo.phone}
                  </div>
                </div>
              ) : (
                <div className="bg-black/20 rounded-xl p-2.5 border border-dashed border-white/15 text-center text-[11px] text-slate-400">
                  {language === 'mr' ? 'तालुक्यासाठी BDO नियुक्ती प्रलंबित आहे' : 'No active BDO appointed for this taluka'}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-end">
              {leadershipOccupancy.bdo ? (
                (isSuperAdmin || isTalukaBDO) && (
                  <button
                    onClick={() => handleOpenPromoteModal(leadershipOccupancy.bdo!)}
                    className="text-[11px] font-bold text-indigo-300 hover:text-indigo-100 flex items-center gap-1 transition-all"
                  >
                    <span>{language === 'mr' ? 'बदला / पदोन्नती ➔' : 'Reassign / Change ➔'}</span>
                  </button>
                )
              ) : (
                (isSuperAdmin || isTalukaBDO) && (
                  <button
                    onClick={() => handleOpenLeadershipAddModal('taluka_bdo', undefined, activeSelectedTaluka)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black transition-all shadow-sm"
                  >
                    {language === 'mr' ? '+ BDO नियुक्त करा' : '+ Appoint BDO'}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 2. Sarpanch Card */}
          <div className="bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
                    <Crown className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[11px] font-black block text-amber-200">
                      {language === 'mr' ? 'सरपंच (Panchayat Head)' : 'Sarpanch'}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">{activeSelectedGp}</span>
                  </div>
                </div>
                {leadershipOccupancy.sarpanch ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {language === 'mr' ? 'कार्यरत' : 'Active'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black">
                    {language === 'mr' ? 'रिक्त' : 'Vacant'}
                  </span>
                )}
              </div>

              {leadershipOccupancy.sarpanch ? (
                <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 space-y-1">
                  <div className="font-bold text-xs text-white truncate">
                    {formatUserName(leadershipOccupancy.sarpanch.name, language)}
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {leadershipOccupancy.sarpanch.phone}
                    </span>
                    {leadershipOccupancy.sarpanch.employeeCode && (
                      <span className="text-[9px] text-amber-300 font-bold">{leadershipOccupancy.sarpanch.employeeCode}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-black/20 rounded-xl p-2.5 border border-dashed border-white/15 text-center text-[11px] text-slate-400">
                  {language === 'mr' ? 'सरपंच पद रिक्त आहे' : 'Sarpanch post is currently vacant'}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-end">
              {leadershipOccupancy.sarpanch ? (
                <button
                  onClick={() => handleOpenPromoteModal(leadershipOccupancy.sarpanch!)}
                  className="text-[11px] font-bold text-amber-300 hover:text-amber-100 flex items-center gap-1 transition-all"
                >
                  <span>{language === 'mr' ? 'बदला / पदोन्नती ➔' : 'Reassign / Change ➔'}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleOpenLeadershipAddModal('sarpanch', activeSelectedGp, activeSelectedTaluka)}
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-[11px] font-black transition-all shadow-sm"
                >
                  {language === 'mr' ? '+ सरपंच नियुक्त करा' : '+ Appoint Sarpanch'}
                </button>
              )}
            </div>
          </div>

          {/* 3. Up-Sarpanch Card */}
          <div className="bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg">
                    <Award className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[11px] font-black block text-teal-200">
                      {language === 'mr' ? 'उपसरपंच (Deputy Head)' : 'Up-Sarpanch'}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">{activeSelectedGp}</span>
                  </div>
                </div>
                {leadershipOccupancy.upsarpanch ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {language === 'mr' ? 'कार्यरत' : 'Active'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black">
                    {language === 'mr' ? 'रिक्त' : 'Vacant'}
                  </span>
                )}
              </div>

              {leadershipOccupancy.upsarpanch ? (
                <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 space-y-1">
                  <div className="font-bold text-xs text-white truncate">
                    {formatUserName(leadershipOccupancy.upsarpanch.name, language)}
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {leadershipOccupancy.upsarpanch.phone}
                    </span>
                    {leadershipOccupancy.upsarpanch.employeeCode && (
                      <span className="text-[9px] text-teal-300 font-bold">{leadershipOccupancy.upsarpanch.employeeCode}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-black/20 rounded-xl p-2.5 border border-dashed border-white/15 text-center text-[11px] text-slate-400">
                  {language === 'mr' ? 'उपसरपंच पद रिक्त आहे' : 'Up-Sarpanch post is currently vacant'}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-end">
              {leadershipOccupancy.upsarpanch ? (
                <button
                  onClick={() => handleOpenPromoteModal(leadershipOccupancy.upsarpanch!)}
                  className="text-[11px] font-bold text-teal-300 hover:text-teal-100 flex items-center gap-1 transition-all"
                >
                  <span>{language === 'mr' ? 'बदला / पदोन्नती ➔' : 'Reassign / Change ➔'}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleOpenLeadershipAddModal('upsarpanch', activeSelectedGp, activeSelectedTaluka)}
                  className="px-3 py-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-[11px] font-black transition-all shadow-sm"
                >
                  {language === 'mr' ? '+ उपसरपंच नियुक्त करा' : '+ Appoint Up-Sarpanch'}
                </button>
              )}
            </div>
          </div>

          {/* 4. Gram Sevak / Secretary Card */}
          <div className="bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[11px] font-black block text-blue-200">
                      {language === 'mr' ? 'ग्रामसेवक (Gram Sevak)' : 'Gram Sevak'}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">{activeSelectedGp}</span>
                  </div>
                </div>
                {leadershipOccupancy.gramSevak ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {language === 'mr' ? 'कार्यरत' : 'Active'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black">
                    {language === 'mr' ? 'रिक्त' : 'Vacant'}
                  </span>
                )}
              </div>

              {leadershipOccupancy.gramSevak ? (
                <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 space-y-1">
                  <div className="font-bold text-xs text-white truncate">
                    {formatUserName(leadershipOccupancy.gramSevak.name, language)}
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {leadershipOccupancy.gramSevak.phone}
                    </span>
                    {leadershipOccupancy.gramSevak.employeeCode && (
                      <span className="text-[9px] text-blue-300 font-bold">{leadershipOccupancy.gramSevak.employeeCode}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-black/20 rounded-xl p-2.5 border border-dashed border-white/15 text-center text-[11px] text-slate-400">
                  {language === 'mr' ? 'ग्रामसेवक पद रिक्त आहे' : 'Gram Sevak post is currently vacant'}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-end">
              {leadershipOccupancy.gramSevak ? (
                <button
                  onClick={() => handleOpenPromoteModal(leadershipOccupancy.gramSevak!)}
                  className="text-[11px] font-bold text-blue-300 hover:text-blue-100 flex items-center gap-1 transition-all"
                >
                  <span>{language === 'mr' ? 'बदला / पदोन्नती ➔' : 'Reassign / Change ➔'}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleOpenLeadershipAddModal('gram_sevak', activeSelectedGp, activeSelectedTaluka)}
                  className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-[11px] font-black transition-all shadow-sm"
                >
                  {language === 'mr' ? '+ ग्रामसेवक नियुक्त करा' : '+ Appoint Gram Sevak'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Advanced Search & Role Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-600 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            {language === 'mr' ? 'खाते संवर्ग:' : 'Category:'}
          </span>

          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
              activeCategoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🌐 {language === 'mr' ? 'सर्व खाती' : 'All Accounts'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{stats.total}</span>
          </button>

          {!isTalukaBDO && (
            <button
              onClick={() => setActiveCategoryFilter('citizen')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                activeCategoryFilter === 'citizen'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <span>📱 {language === 'mr' ? 'नागरिक खाती (OTP)' : 'Citizens (OTP)'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950/20">{stats.citizens}</span>
            </button>
          )}

          <button
            onClick={() => setActiveCategoryFilter('promotable')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
              activeCategoryFilter === 'promotable'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm ring-2 ring-amber-400/40'
                : 'bg-orange-50 text-orange-950 hover:bg-orange-100 border border-orange-200/80'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'mr' ? 'पदोन्नतीस उपलब्ध नागरिक' : 'Available for Promotion'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950/20">{stats.citizens}</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('official')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
              activeCategoryFilter === 'official'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200/60'
            }`}
          >
            <span>🏛 {isTalukaBDO ? (language === 'mr' ? 'सरपंच व ग्रामसेवक' : 'Sarpanch & Secretary') : (language === 'mr' ? 'ग्रामपंचायत अधिकारी व कर्मचारी' : 'Panchayat Staff')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950/20">{stats.officials}</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveCategoryFilter('bdo_admin')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                activeCategoryFilter === 'bdo_admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200/60'
              }`}
            >
              <span>🏢 {language === 'mr' ? 'BDO व ॲडमिन' : 'BDO & Admin'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950/20">{stats.bdoAndAdmins}</span>
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 pt-1 border-t border-slate-100">
          {/* Main Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={language === 'mr' ? 'नाव, फोन, घर क्र., आधार, ईमेल, कर्मचारी कोड किंवा GP द्वारे शोधा...' : 'Search by name, phone, house no, aadhaar, email, emp code or GP...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-56">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">🎭 सर्व पदे (All Roles)</option>
              {!isTalukaBDO && <option value="citizen">📱 नागरिक (Citizen - OTP)</option>}
              <option value="sarpanch">👑 सरपंच (Sarpanch - OTP)</option>
              <option value="upsarpanch">🎖️ उपसरपंच (Up-Sarpanch - OTP)</option>
              <option value="gram_sevak">✍️ ग्रामसेवक (Gram Sevak - OTP)</option>
              {!isTalukaBDO && (
                <>
                  <option value="sadasya">👥 वॉर्ड सदस्य (Ward Member - OTP)</option>
                  <option value="tax_clerk">🧾 कर लिपिक (Tax Clerk - OTP)</option>
                  <option value="staff">🛠️ कर्मचारी (Staff - OTP)</option>
                </>
              )}
              {isSuperAdmin && (
                <>
                  <option value="taluka_bdo">🏛️ गटविकास अधिकारी (BDO - OTP)</option>
                  <option value="admin">🛡️ सिस्टीम ॲडमिन (Admin - Password)</option>
                </>
              )}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">⚡ सर्व स्थिती (All Status)</option>
              <option value="active">✅ सक्रिय (Active)</option>
              <option value="inactive">⛔ निष्क्रिय (Inactive)</option>
            </select>
          </div>
        </div>

        {/* Location Filters Row (Only for Super Admin or BDO) */}
        {(isSuperAdmin || isTalukaBDO) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {language === 'mr' ? 'स्थानिक फिल्टर:' : 'Geo Filter:'}
            </span>

            {isSuperAdmin && availableDistricts.length > 0 && (
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700"
              >
                <option value="all">📍 {language === 'mr' ? 'सर्व जिल्हे (All Districts)' : 'All Districts'}</option>
                {availableDistricts.map(d => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            )}

            {isSuperAdmin && availableTalukas.length > 0 && (
              <select
                value={talukaFilter}
                onChange={(e) => setTalukaFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700"
              >
                <option value="all">🏛️ {language === 'mr' ? 'सर्व तालुके (All Talukas)' : 'All Talukas'}</option>
                {availableTalukas.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            )}

            {availableGps.length > 0 && (
              <select
                value={gpFilter}
                onChange={(e) => setGpFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700"
              >
                <option value="all">🏡 {language === 'mr' ? 'सर्व ग्रामपंचायती (All GPs)' : 'All Gram Panchayats'}</option>
                {availableGps.map(g => (
                  <option key={g.key} value={g.key}>{g.label}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* 4. Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              {language === 'mr' ? 'नोंदणीकृत युझर्स डिरेक्टरी' : 'Registered User Directory'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-black font-mono">
              {filteredUsers.length} / {scopedUsers.length}
            </span>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {language === 'mr' ? 'सुरक्षा: नागरिक व अधिकारी = OTP प्रमाणीकरण' : 'Auth: All Accounts use Mobile OTP'}
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">
              {language === 'mr' ? 'कोणतेही युझर्स आढळले नाहीत' : 'No users found matching your filters'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {language === 'mr' ? 'कृपया शोध शब्द तपासा किंवा नवीन खाते नोंदणी करण्यासाठी खालील बटण वापरा.' : 'Try adjusting search terms or register a new user in the system.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {!isTalukaBDO && (
                <button
                  onClick={() => handleOpenAddModal('citizen')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl"
                >
                  + {language === 'mr' ? 'नागरिक जोडा (OTP)' : 'Add Citizen (OTP)'}
                </button>
              )}
              <button
                onClick={() => handleOpenAddModal('official')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
              >
                + {language === 'mr' ? 'अधिकारी जोडा' : 'Add Official'}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">{language === 'mr' ? 'युझर प्रोफाइल व खाते' : 'User Profile'}</th>
                  <th className="py-3.5 px-4">{language === 'mr' ? 'भूमिका व पद' : 'Role & Category'}</th>
                  <th className="py-3.5 px-4">{language === 'mr' ? 'प्रमाणीकरण प्रकार' : 'Auth Method'}</th>
                  <th className="py-3.5 px-4">{language === 'mr' ? 'संपर्क व ओळख' : 'Contact & ID'}</th>
                  <th className="py-3.5 px-4">{language === 'mr' ? 'स्थान व कार्यकक्षा' : 'Location & Address'}</th>
                  <th className="py-3.5 px-4">{language === 'mr' ? 'स्थिती' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{language === 'mr' ? 'कृती' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const Icon = roleBadge.icon;
                  const isPrimaryAdmin = user.role === 'admin' && (user.id === 'usr-admin-01' || user.email === 'admin@grampanchayat.gov.in');
                  const isCurrentLoggedUser = currentUser?.id === user.id || (currentUser?.phone && currentUser.phone === user.phone);
                  const isCitizen = user.role === 'citizen';
                  const isAdminUser = user.role === 'admin';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Profile / Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatarUrl || (isCitizen ? citizenAvatarPresets[0].url : officialAvatarPresets[0].url)}
                            alt={user.name}
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                          />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-black text-slate-900 text-xs md:text-sm">{formatUserName(user.name, language)}</span>
                              {isCurrentLoggedUser && (
                                <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-blue-100 text-blue-800 rounded-md border border-blue-200">
                                  {language === 'mr' ? 'तुम्ही (You)' : 'You'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono mt-0.5">
                              <span>ID: {user.id.slice(-8)}</span>
                              {user.employeeCode ? (
                                <>
                                  <span>•</span>
                                  <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                                    Code: {user.employeeCode}
                                  </span>
                                </>
                              ) : user.houseNo ? (
                                <>
                                  <span>•</span>
                                  <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded text-[10px]">
                                    {language === 'mr' ? 'घर क्र' : 'House No'}: {user.houseNo}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Role & Designation */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${roleBadge.bg}`}>
                            <Icon className="w-3 h-3 shrink-0" />
                            {roleBadge.label}
                          </span>
                          {user.designation ? (
                            <p className="text-[11px] font-bold text-slate-700 block truncate max-w-[160px]">
                              {formatDesignation(user.designation, language)}
                            </p>
                          ) : isCitizen && user.dob ? (
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>DOB: {user.dob}</span>
                            </p>
                          ) : null}
                        </div>
                      </td>

                      {/* 3. Auth Method Badge */}
                      <td className="py-3.5 px-4">
                        {isAdminUser ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-purple-50 text-purple-800 border border-purple-200">
                            <KeyRound className="w-3 h-3 text-purple-600" />
                            <span>{language === 'mr' ? '🔑 पासवर्ड लॉगिन' : 'Password Login'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{language === 'mr' ? '📱 OTP आधारित' : 'OTP Based Login'}</span>
                          </span>
                        )}
                      </td>

                      {/* 4. Contact Info & Aadhaar */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 text-slate-700">
                          <div className="flex items-center space-x-1 font-mono font-bold text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                          {user.email && (
                            <div className="flex items-center space-x-1 text-[10px] text-slate-500 truncate max-w-[170px]">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          )}
                          {user.aadhaar && (
                            <div className="flex items-center space-x-1 text-[10px] text-indigo-700 font-mono">
                              <CreditCard className="w-3 h-3 text-indigo-400 shrink-0" />
                              <span>Aadhaar: {user.aadhaar}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 5. Location / GP / Address */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-slate-700 text-[11px]">
                          <div className="font-bold flex items-center gap-1 text-slate-900">
                            <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                            <span>{formatGramPanchayat(user.gramPanchayat, language) || (language === 'mr' ? 'सर्व ग्रामपंचायती' : 'All Gram Panchayats')}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {[
                              user.wardNo, 
                              formatTaluka(user.taluka, language), 
                              formatDistrict(user.district, language)
                            ].filter(Boolean).join(' • ')}
                          </p>
                          {user.address && (
                            <p className="text-[10px] text-slate-600 truncate max-w-[180px] italic">
                              {user.address}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 6. Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={isPrimaryAdmin}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 border transition-all ${
                            user.isActive !== false
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                          } ${isPrimaryAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          title={isPrimaryAdmin ? 'Super Admin cannot be disabled' : 'Click to toggle status'}
                        >
                          {user.isActive !== false ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>{language === 'mr' ? 'सक्रिय' : 'Active'}</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                              <span>{language === 'mr' ? 'निष्क्रिय' : 'Inactive'}</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Promote / Change Role / Demote User */}
                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => handleOpenPromoteModal(user)}
                              className={`px-2.5 py-1.5 font-bold text-[10px] rounded-lg shadow-sm transition-all flex items-center gap-1 active:scale-95 text-white ${
                                isCitizen
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
                              }`}
                              title={
                                isCitizen
                                  ? (language === 'mr' ? 'पदभार वाटप व पदोन्नती द्या' : 'Promote & Assign Official Role')
                                  : (language === 'mr' ? 'पदबदल / पदनिवृत्ती (नागरिक पदावर आणा)' : 'Change Role / Demote to Citizen')
                              }
                            >
                              {isCitizen ? <Crown className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                              <span>{isCitizen ? (language === 'mr' ? '👑 पदोन्नती' : 'Promote') : (language === 'mr' ? '🔄 पदबदल / पदनिवृत्ती' : 'Change / Demote')}</span>
                            </button>
                          )}

                          {/* Direct Switch / Impersonate */}
                          <button
                            onClick={() => loginWithUser(user)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg transition-all"
                            title={language === 'mr' ? `${user.name} म्हणून थेट लॉगिन करा` : `Login as ${user.name}`}
                          >
                            <LogIn className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 rounded-lg transition-all"
                            title={language === 'mr' ? 'माहिती संपादित करा' : 'Edit User Details'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => handleOpenDeleteModal(user)}
                              className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-lg transition-all"
                              title={language === 'mr' ? 'युझर हटवा' : 'Delete User'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. ADD USER MODAL (Role-Scoped: Admin vs BDO vs Sarpanch) */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200 animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base md:text-lg">
                  {isTalukaBDO 
                    ? (language === 'mr' ? 'नवीन सरपंच / ग्रामसेवक नियुक्ती नोंदणी' : 'Appoint New Sarpanch / Gram Sevak')
                    : isPanchayatLeader
                    ? (language === 'mr' ? 'गावातील नवीन नागरिक / कर्मचारी नोंदणी' : 'Register New Citizen / Staff for Village')
                    : (language === 'mr' ? 'नवीन खाते नोंदणी (Add New User)' : 'Create New User / Officer Account')}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Selector Tabs (Context Aware) */}
            <div className={`bg-slate-100 p-2 border-b border-slate-200 grid ${isSuperAdmin ? 'grid-cols-3' : isTalukaBDO ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
              {!isTalukaBDO && (
                <button
                  type="button"
                  onClick={() => handleSelectModalCategory('citizen')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    modalCategory === 'citizen'
                      ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-500/30'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>{language === 'mr' ? '📱 नागरिक नोंदणी (गाव रहिवासी)' : '📱 Citizen Registration'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSelectModalCategory('official')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  modalCategory === 'official'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600/30'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>
                  {isTalukaBDO 
                    ? (language === 'mr' ? '🏛️ ग्रामपंचायत सरपंच / ग्रामसेवक नियुक्ती' : '🏛️ Appoint Sarpanch / Gram Sevak') 
                    : (language === 'mr' ? '👥 कर्मचारी व वॉर्ड सदस्य' : '👥 Staff & Ward Members')}
                </span>
              </button>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => handleSelectModalCategory('bdo_admin')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    modalCategory === 'bdo_admin'
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600/30'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>{language === 'mr' ? '🏢 BDO / ॲडमिन' : '🏢 BDO / Admin'}</span>
                </button>
              )}
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Category-Specific Header / Alert */}
              {modalCategory === 'citizen' ? (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start space-x-3">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>{language === 'mr' ? 'गाव नागरिक नोंदणी (१००% OTP आधारित)' : 'Village Citizen Registration (OTP Based)'}</span>
                      <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full text-[9px] font-extrabold uppercase">
                        No Password Required
                      </span>
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {language === 'mr' 
                        ? `नागरिकांना पासवर्डची आवश्यकता नाही. नागरिक ${userGp} ग्रामपंचायतीच्या सेवांसाठी त्यांच्या मोबाईल OTP द्वारे थेट लॉगिन करतील.`
                        : 'Citizens authenticate seamlessly using Mobile OTP. No password required.'}
                    </p>
                  </div>
                </div>
              ) : modalCategory === 'official' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-xl text-blue-800 shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                        <span>
                          {isTalukaBDO 
                            ? (language === 'mr' ? 'तालुका BDO: ग्रामपंचायत सरपंच / ग्रामसेवक नियुक्ती' : 'Taluka BDO: GP Head Appointment')
                            : (language === 'mr' ? 'ग्रामपंचायत कर्मचारी व सदस्य नियुक्ती' : 'Panchayat Staff & Ward Member Appointment')}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded-full text-[9px] font-extrabold uppercase">
                          OTP Auth
                        </span>
                      </h4>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        {language === 'mr' 
                          ? 'अधिकारी व कर्मचारी नोंदणीकृत १०-अंकी मोबाईल क्रमांक व OTP द्वारे अधिकृत ERP प्रणालीमध्ये सुरक्षितपणे लॉगिन करतील.'
                          : 'Officers and staff log in to the ERP portal via registered 10-digit Mobile OTP.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {language === 'mr' ? 'ग्रामपंचायत पद निवडा (Select Role)' : 'Select Role'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setFormData(prev => ({
                          ...prev,
                          role: newRole,
                          designation: newRole === 'sarpanch' ? 'सरपंच (Gram Panchayat Head)' :
                                       newRole === 'upsarpanch' ? 'उपसरपंच (Up-Sarpanch)' :
                                       newRole === 'gram_sevak' ? 'ग्रामविकास अधिकारी (Gram Sevak)' :
                                       newRole === 'sadasya' ? 'ग्रामपंचायत सदस्य (Ward Member)' :
                                       newRole === 'tax_clerk' ? 'कर वसुली लिपिक (Tax Clerk)' :
                                       newRole === 'staff' ? 'ग्रामपंचायत सेवक / कर्मचारी' : 'कर्मचारी'
                        }));
                      }}
                      className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/40 text-blue-950"
                    >
                      {isTalukaBDO ? (
                        <>
                          <option value="sarpanch">👑 सरपंच (Sarpanch - ग्रामपंचायत प्रमुख)</option>
                          <option value="upsarpanch">🎖️ उपसरपंच (Up-Sarpanch - उपप्रमुख)</option>
                          <option value="gram_sevak">✍️ ग्रामविकास अधिकारी / ग्रामसेवक (Gram Sevak / Secretary)</option>
                        </>
                      ) : isPanchayatLeader ? (
                        <>
                          <option value="sadasya">👥 वॉर्ड सदस्य / प्रभाग प्रतिनिधी (Ward Member)</option>
                          <option value="tax_clerk">🧾 कर वसुली लिपिक / ऑपरेटर (Tax Clerk)</option>
                          <option value="staff">🛠️ ग्रामपंचायत सेवक / शिपाई (Staff)</option>
                        </>
                      ) : (
                        <>
                          <option value="sarpanch">👑 सरपंच (Sarpanch - ग्रामपंचायत प्रमुख)</option>
                          <option value="upsarpanch">🎖️ उपसरपंच (Up-Sarpanch - उपप्रमुख)</option>
                          <option value="gram_sevak">✍️ ग्रामविकास अधिकारी / ग्रामसेवक (Gram Sevak)</option>
                          <option value="sadasya">👥 वॉर्ड सदस्य / प्रतिनिधी (Ward Member)</option>
                          <option value="tax_clerk">🧾 कर वसुली लिपिक / ऑपरेटर (Tax Clerk)</option>
                          <option value="staff">🛠️ ग्रामपंचायत सेवक / शिपाई (Staff)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {language === 'mr' ? 'प्रशासकीय पद निवडा (Select Admin Role)' : 'Select Admin Role'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setFormData(prev => ({
                          ...prev,
                          role: newRole,
                          designation: newRole === 'taluka_bdo' ? 'गटविकास अधिकारी (Taluka BDO)' : 'सिस्टीम ॲडमिनिस्ट्रेटर (System Admin)',
                          password: newRole === 'admin' ? (prev.password || 'admin123') : ''
                        }));
                      }}
                      className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/40 text-indigo-950"
                    >
                      <option value="taluka_bdo">🏛️ गटविकास अधिकारी - BDO (तालुका पंचायत समिती - OTP आधारित)</option>
                      <option value="admin">🛡️ सिस्टीम ॲडमिनिस्ट्रेटर (Super System Admin - पासवर्ड आधारित)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? 'पूर्ण नाव (Full Name)' : 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={modalCategory === 'citizen' ? 'उदा. श्री. गणेश रावसाहेब थोरात' : 'उदा. श्री. विकास शांताराम पाटील'}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? '१० अंकी मोबाईल क्रमांक (OTP साठी)' : 'Mobile Number (For OTP Login)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Location Hierarchy Selector (Taluka for BDO, Ward for Sadasya, GP for Sarpanch/Staff/Citizen) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  {formData.role === 'taluka_bdo'
                    ? (language === 'mr' ? 'तालुका कार्यक्षेत्र निवड (State -> District -> Taluka):' : 'Taluka Jurisdiction (State -> District -> Taluka):')
                    : formData.role === 'sadasya'
                    ? (language === 'mr' ? 'वॉर्ड सदस्य कार्यक्षेत्र (स्थान व वॉर्ड क्र. निवड):' : 'Ward Member Jurisdiction (Location & Ward No):')
                    : isPanchayatLeader 
                    ? (language === 'mr' ? `कार्यक्षेत्र: ${userGp}, ता. ${userTaluka}` : `Jurisdiction: ${userGp}, ${userTaluka}`)
                    : isTalukaBDO 
                    ? (language === 'mr' ? `तालुका कार्यक्षेत्र (ता. ${userTaluka}): ग्रामपंचायत निवडा` : `Taluka Jurisdiction (${userTaluka}): Select GP`)
                    : (language === 'mr' ? 'स्थान व ग्रामपंचायत निवड (District -> Taluka -> GP):' : 'Location Hierarchy:')}
                </span>

                {formData.role === 'taluka_bdo' ? (
                  <LocationSelector
                    level="taluka"
                    selectedState={formData.state}
                    selectedDistrict={formData.district}
                    selectedTaluka={formData.taluka}
                    onChange={(data) => {
                      setFormData(prev => ({
                        ...prev,
                        district: data.district,
                        taluka: data.taluka,
                        gramPanchayat: '',
                        wardNo: ''
                      }));
                    }}
                  />
                ) : formData.role === 'sadasya' ? (
                  /* Ward Member (Sadasya) requires Ward selection */
                  isSuperAdmin ? (
                    <LocationSelector
                      level="ward"
                      showWard={true}
                      selectedState={formData.state}
                      selectedDistrict={formData.district}
                      selectedTaluka={formData.taluka}
                      selectedGramPanchayat={formData.gramPanchayat}
                      selectedWard={formData.wardNo}
                      onChange={(data) => {
                        setFormData(prev => ({
                          ...prev,
                          district: data.district,
                          taluka: data.taluka,
                          gramPanchayat: data.gramPanchayat,
                          wardNo: data.ward || 'Ward 1'
                        }));
                      }}
                    />
                  ) : isTalukaBDO ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">लक्ष्य ग्रामपंचायत (Target GP):</label>
                        <select
                          value={formData.gramPanchayat}
                          onChange={(e) => setFormData(prev => ({ ...prev, gramPanchayat: e.target.value }))}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white"
                        >
                          {availableGps.map(g => (
                            <option key={g.key} value={g.label}>{g.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">प्रतिनिधित्व वॉर्ड (Ward No):</label>
                        <select
                          value={formData.wardNo}
                          onChange={(e) => setFormData(prev => ({ ...prev, wardNo: e.target.value }))}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-orange-300 bg-orange-50/50"
                        >
                          <option value="Ward 1 (गणपती चौक)">Ward 1 (गणपती चौक)</option>
                          <option value="Ward 2 (मारुती मंदिर परिसर)">Ward 2 (मारुती मंदिर परिसर)</option>
                          <option value="Ward 3 (शाळा व बाजार परिसर)">Ward 3 (शाळा व बाजार परिसर)</option>
                          <option value="Ward 4 (गावठाण व नदीकाठ)">Ward 4 (गावठाण व नदीकाठ)</option>
                          <option value="Ward 5 (नवीन वसाहत)">Ward 5 (नवीन वसाहत)</option>
                          <option value="Ward 6 (कृषी परिसर)">Ward 6 (कृषी परिसर)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-amber-950 block">{userGp}</span>
                          <span className="text-[11px] text-amber-800">ता. {userTaluka}, जि. {userDistrict}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {language === 'mr' ? 'गाव कार्यक्षेत्र' : 'Village Level'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">
                          {language === 'mr' ? 'सदस्य कोणत्या वॉर्डचे आहेत? (निवडा)' : 'Select Member Ward No:'} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.wardNo}
                          onChange={(e) => setFormData(prev => ({ ...prev, wardNo: e.target.value }))}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-orange-300 bg-orange-50/60 text-slate-900"
                        >
                          <option value="Ward 1 (गणपती चौक)">Ward 1 (गणपती चौक)</option>
                          <option value="Ward 2 (मारुती मंदिर परिसर)">Ward 2 (मारुती मंदिर परिसर)</option>
                          <option value="Ward 3 (शाळा व बाजार परिसर)">Ward 3 (शाळा व बाजार परिसर)</option>
                          <option value="Ward 4 (गावठाण व नदीकाठ)">Ward 4 (गावठाण व नदीकाठ)</option>
                          <option value="Ward 5 (नवीन वसाहत)">Ward 5 (नवीन वसाहत)</option>
                          <option value="Ward 6 (कृषी परिसर)">Ward 6 (कृषी परिसर)</option>
                        </select>
                      </div>
                    </div>
                  )
                ) : isSuperAdmin ? (
                  <LocationSelector
                    level="gramPanchayat"
                    selectedState={formData.state}
                    selectedDistrict={formData.district}
                    selectedTaluka={formData.taluka}
                    selectedGramPanchayat={formData.gramPanchayat}
                    onChange={(data) => {
                      setFormData(prev => ({
                        ...prev,
                        district: data.district,
                        taluka: data.taluka,
                        gramPanchayat: data.gramPanchayat,
                        wardNo: 'Ward 1'
                      }));
                    }}
                  />
                ) : isTalukaBDO ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-500 block text-[10px]">तालुका:</span>
                      <span className="font-bold text-slate-800">{userTaluka}, जि. {userDistrict}</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">लक्ष्य ग्रामपंचायत (Target GP):</label>
                      <select
                        value={formData.gramPanchayat}
                        onChange={(e) => setFormData(prev => ({ ...prev, gramPanchayat: e.target.value }))}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white"
                      >
                        {availableGps.map(g => (
                          <option key={g.key} value={g.label}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-950 block">{userGp}</span>
                      <span className="text-[11px] text-amber-800">ता. {userTaluka}, जि. {userDistrict}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {language === 'mr' ? 'गाव कार्यक्षेत्र' : 'Village Level'}
                    </span>
                  </div>
                )}
              </div>

              {/* Live Single-Occupancy Availability / Conflict Warning Banner */}
              {addModalOccupancyConflict && (
                addModalOccupancyConflict.isOccupied ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2.5 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-amber-200 text-amber-900 rounded-xl shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                          <span>
                            {language === 'mr' 
                              ? `⚠️ हे पद आधीच भरलेले आहे (${addModalOccupancyConflict.locationText})` 
                              : `⚠️ Position Currently Occupied (${addModalOccupancyConflict.locationText})`}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-300/80 text-amber-950 rounded-full text-[9px] font-black uppercase">
                            Single Occupancy
                          </span>
                        </h5>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          {language === 'mr' ? (
                            <>
                              सध्या या पदावर <strong>{formatUserName(addModalOccupancyConflict.occupant?.name || '', 'mr')}</strong> (मो. {addModalOccupancyConflict.occupant?.phone}) कार्यरत आहेत. एका ठिकाणी एका वेळी एकच पदाधिकारी राहू शकतात.
                            </>
                          ) : (
                            <>
                              Currently held by <strong>{formatUserName(addModalOccupancyConflict.occupant?.name || '', 'en')}</strong> ({addModalOccupancyConflict.occupant?.phone}). Only one active official is permitted per post.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 p-2.5 bg-white/90 rounded-xl border border-amber-300/80 cursor-pointer hover:bg-white transition-all">
                      <input
                        type="checkbox"
                        checked={addForceReassign}
                        onChange={(e) => setAddForceReassign(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <div className="text-[11px] leading-tight">
                        <span className="font-black text-amber-950 block">
                          {language === 'mr' 
                            ? 'जुन्या पदाधिकाऱ्यास (Old Officer) पदमुक्त करून नागरिक (Citizen) खात्यात वर्ग करा व नवीन नियुक्ती पूर्ण करा' 
                            : 'Auto-Demote Prior Occupant to Citizen & Transfer Official Duties'}
                        </span>
                        <span className="text-[10px] text-amber-800">
                          {language === 'mr'
                            ? 'जुन्या पदाधिकाऱ्याचा कर्मचारी कोड रद्द होईल आणि त्यांचे खाते सामान्य नागरिक (Mobile OTP) म्हणून सुरक्षित राहील.'
                            : 'Prior official’s employee code will be cleared, and their account converted to Citizen (OTP login).'}
                        </span>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between text-xs text-emerald-950 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-[11px]">
                        {language === 'mr' 
                          ? `🟢 हे पद सध्या रिक्त आहे (${addModalOccupancyConflict.locationText}) — नवीन नियुक्ती थेट करता येईल.`
                          : `🟢 Post is vacant (${addModalOccupancyConflict.locationText}) — Ready for new appointment.`}
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                      Vacant
                    </span>
                  </div>
                )
              )}

              {/* Notice: Profile details can be completed later */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {language === 'mr' 
                    ? 'खाते केवळ नाव, १०-अंकी मोबाईल व कार्यक्षेत्राद्वारे त्वरित तयार होते. वापरकर्ता लॉगिन केल्यानंतर प्रोफाईलमधून उर्वरित माहिती (घर क्र., आधार इ.) पूर्ण करू शकतात.'
                    : 'Accounts are created with Name, Mobile, and Jurisdiction. Users can complete remaining profile details (House No, Aadhaar, etc.) after login.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? (language === 'mr' ? 'जतन करत आहे...' : 'Saving...') 
                      : modalCategory === 'citizen'
                      ? (language === 'mr' ? 'नागरिक खाते नोंदणी पूर्ण करा (OTP)' : 'Create Citizen Account (OTP)')
                      : isTalukaBDO
                      ? (language === 'mr' ? 'सरपंच / ग्रामसेवक नियुक्ती जतन करा' : 'Save Appointment (OTP)')
                      : (language === 'mr' ? 'खाते तयार करा (OTP)' : 'Create Account (OTP)')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. EDIT USER MODAL */}
      {/* ========================================================================= */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200 animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base md:text-lg">
                  {language === 'mr' ? `युझर माहिती संपादन: ${selectedUser.name}` : `Edit Profile: ${selectedUser.name}`}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Role & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? 'पद व कार्यप्रणाली (Role)' : 'Role'}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setFormData(prev => ({ 
                        ...prev, 
                        role: newRole,
                        password: newRole === 'admin' ? (prev.password || 'admin123') : ''
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
                  >
                    <option value="citizen">📱 नागरिक (Citizen - OTP)</option>
                    <option value="sarpanch">👑 सरपंच (Sarpanch - OTP)</option>
                    <option value="upsarpanch">🎖️ उपसरपंच (Up-Sarpanch - OTP)</option>
                    <option value="gram_sevak">✍️ ग्रामविकास अधिकारी (Gram Sevak - OTP)</option>
                    <option value="sadasya">👥 वॉर्ड सदस्य (Ward Member - OTP)</option>
                    <option value="tax_clerk">🧾 कर लिपिक (Tax Clerk - OTP)</option>
                    <option value="staff">🛠️ कर्मचारी (Staff - OTP)</option>
                    {isSuperAdmin && (
                      <>
                        <option value="taluka_bdo">🏛️ गटविकास अधिकारी - BDO (OTP)</option>
                        <option value="admin">🛡️ सिस्टीम ॲडमिन (System Admin - Password)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? 'खाते स्थिती (Account Status)' : 'Account Status'}
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
                  >
                    <option value="active">✅ सक्रिय (Active)</option>
                    <option value="inactive">⛔ निलंबित / निष्क्रिय (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? 'पूर्ण नाव (Full Name)' : 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? 'मोबाइल क्रमांक (OTP साठी)' : 'Mobile Number (For OTP Login)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Citizen-Specific Fields (DOB & Aadhaar) */}
              {selectedUser.role === 'citizen' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-amber-50/40 rounded-2xl border border-amber-200">
                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      {language === 'mr' ? 'जन्मतारीख (Date of Birth)' : 'Date of Birth'}
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                      {language === 'mr' ? 'आधार क्रमांक (Aadhaar No)' : 'Aadhaar Number'}
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={formData.aadhaar}
                      onChange={(e) => setFormData(prev => ({ ...prev, aadhaar: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Staff-Specific Fields (Designation & Employee Code) */}
              {selectedUser.role !== 'citizen' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-blue-50/60 rounded-2xl border border-blue-200">
                  <div>
                    <label className="block text-xs font-bold text-blue-950 mb-1">
                      {language === 'mr' ? 'पदनाम (Designation)' : 'Designation'}
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-950 mb-1">
                      {language === 'mr' ? 'कर्मचारी कोड (Employee Code)' : 'Employee Code'}
                    </label>
                    <input
                      type="text"
                      value={formData.employeeCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeCode: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Email & Password (PASSWORD SHOWN ONLY IF ROLE === 'admin') */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? 'ईमेल पत्ता' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {formData.role === 'admin' ? (
                  <div>
                    <label className="block text-xs font-bold text-purple-950 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-purple-700" />
                        {language === 'mr' ? 'नवीन ॲडमिन पासवर्ड बदला' : 'Reset Admin Password'}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new admin password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono bg-purple-50/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      {language === 'mr' ? 'प्रमाणीकरण' : 'Authentication'}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      {language === 'mr' ? 'OTP आधारित प्रमाणीकरण (No Password Required)' : 'OTP Based Authentication'}
                    </span>
                  </div>
                )}
              </div>

              {/* Location Hierarchy Selector */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  {language === 'mr' ? 'स्थान व कार्यक्षेत्र:' : 'Location:'}
                </span>

                {isSuperAdmin ? (
                  <LocationSelector
                    selectedState={formData.state}
                    selectedDistrict={formData.district}
                    selectedTaluka={formData.taluka}
                    selectedGramPanchayat={formData.gramPanchayat}
                    selectedWard={formData.wardNo}
                    onChange={(data) => {
                      setFormData(prev => ({
                        ...prev,
                        district: data.district,
                        taluka: data.taluka,
                        gramPanchayat: data.gramPanchayat,
                        wardNo: data.ward
                      }));
                    }}
                  />
                ) : (
                  <div className="p-2 bg-slate-100 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{formData.gramPanchayat}</span>
                      <span className="text-slate-500 block text-[11px]">ता. {formData.taluka}, जि. {formData.district}</span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 mr-1.5">वॉर्ड:</label>
                      <select
                        value={formData.wardNo}
                        onChange={(e) => setFormData(prev => ({ ...prev, wardNo: e.target.value }))}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Ward 1">Ward 1</option>
                        <option value="Ward 2">Ward 2</option>
                        <option value="Ward 3">Ward 3</option>
                        <option value="Ward 4">Ward 4</option>
                        <option value="Ward 5">Ward 5</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* House No & Residential Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? 'घर / मिळकत क्रमांक' : 'House / Property No'}
                  </label>
                  <input
                    type="text"
                    value={formData.houseNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, houseNo: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? 'पत्ता / गल्ली (Address)' : 'Address'}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? (language === 'mr' ? 'अद्यतनित करत आहे...' : 'Updating...') : (language === 'mr' ? 'बदल जतन करा' : 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ROLE PROMOTION, TRANSFER & DEMOTION MODAL */}
      {/* ========================================================================= */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200 animate-scale-up">
            {/* Modal Header */}
            <div className={`px-6 py-4 text-white flex items-center justify-between ${
              selectedUser.role === 'citizen'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700'
                : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
                  {selectedUser.role === 'citizen' ? (
                    <Crown className="w-5 h-5 text-amber-200" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-indigo-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-base md:text-lg leading-tight">
                    {selectedUser.role === 'citizen'
                      ? (language === 'mr' ? '👑 पदभार वाटप व पदोन्नती (Role Promotion)' : '👑 Role Promotion & Assignment')
                      : (language === 'mr' ? '🔄 पदबदल, पदनिवृत्ती व पदभार फेरबदल' : '🔄 Role Change & Demotion Desk')}
                  </h3>
                  <p className="text-[11px] text-slate-200 font-medium">
                    {selectedUser.role === 'citizen'
                      ? (language === 'mr' ? 'नोंदणीकृत नागरिकाला ग्रामपंचायत अधिकृत पदभार व ERP ॲक्सेस द्या' : 'Assign official Panchayat role and ERP desk access to citizen')
                      : (language === 'mr' ? 'पदाधिकाऱ्याचे पद बदला किंवा सामान्य नागरिक पदावर पदनिवृत्ती (Demotion) करा' : 'Transfer official to another role or demote back to standard citizen')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowPromoteModal(false);
                  setSelectedUser(null);
                }}
                className="p-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPromotion} className="p-6 space-y-4">
              {/* Selected Profile Summary Card */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                selectedUser.role === 'citizen'
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                  : 'bg-gradient-to-r from-indigo-50 to-slate-50 border-indigo-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedUser.avatarUrl || (selectedUser.role === 'citizen' ? citizenAvatarPresets[0].url : officialAvatarPresets[0].url)}
                    alt={selectedUser.name}
                    className={`w-12 h-12 rounded-2xl object-cover border-2 bg-white shadow-sm shrink-0 ${
                      selectedUser.role === 'citizen' ? 'border-amber-400' : 'border-indigo-500'
                    }`}
                  />
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{formatUserName(selectedUser.name, language)}</h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 font-mono">
                      <span>📱 {selectedUser.phone}</span>
                      {selectedUser.houseNo && <span>• 🏠 {selectedUser.houseNo}</span>}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      📍 {formatGramPanchayat(selectedUser.gramPanchayat, language)}, {selectedUser.wardNo || 'Ward 1'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    {language === 'mr' ? 'सध्याचे पद' : 'Current Role'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black bg-white border shadow-xs ${
                    selectedUser.role === 'citizen' 
                      ? 'border-amber-300 text-amber-900' 
                      : 'border-indigo-300 text-indigo-900'
                  }`}>
                    {selectedUser.role === 'citizen' 
                      ? (language === 'mr' ? 'नागरिक (Citizen)' : 'Citizen') 
                      : (selectedUser.designation || selectedUser.role)}
                  </span>
                </div>
              </div>

              {/* Demotion Alert Notice (When target role is citizen) */}
              {promoteData.targetRole === 'citizen' && (
                <div className="p-3 bg-red-50 rounded-2xl border border-red-200 flex items-start space-x-3 animate-fade-in">
                  <div className="p-2 bg-red-100 rounded-xl text-red-700 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-red-950 flex items-center gap-1.5">
                      <span>{language === 'mr' ? '🔻 पदनिवृत्ती सूचना (Demotion to Citizen)' : '🔻 Demotion Notice (Revert to Citizen)'}</span>
                      <span className="px-2 py-0.2 bg-red-200 text-red-900 rounded-full text-[9px] font-extrabold uppercase">
                        ERP Revocation
                      </span>
                    </h4>
                    <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">
                      {language === 'mr' 
                        ? 'या वापरकर्त्याचे सर्व प्रशासकीय ERP अधिकार त्वरित रद्द केले जातील. कर्मचारी कोड काढून टाकला जाईल व खाते केवळ सामान्य नागरिक सेवांसाठी सक्रिय राहील.'
                        : 'All administrative ERP permissions and employee code will be removed. The user will be demoted to standard citizen status.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Target Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span>{language === 'mr' ? 'नवीन पद किंवा पदनिवृत्ती निवडा (Select Target Role):' : 'Select Target Role or Demote:'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    promoteData.targetRole === 'citizen'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {promoteData.targetRole === 'citizen' 
                      ? (language === 'mr' ? '🔻 नागरिक पद (नाही ERP)' : '🔻 Citizen Access') 
                      : (language === 'mr' ? '👑 थेट ERP कार्यकक्ष ॲक्सेस' : '👑 Grants ERP Access')}
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                  {/* Demote to Citizen (Highlighted for quick demotion) */}
                  <div
                    onClick={() => handleTargetRoleChange('citizen')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-2.5 ${
                      promoteData.targetRole === 'citizen'
                        ? 'border-red-500 bg-red-50/70 shadow-sm ring-1 ring-red-400'
                        : 'border-slate-200 hover:border-red-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      promoteData.targetRole === 'citizen' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-900 block flex items-center gap-1">
                        <span>📱 {language === 'mr' ? 'नागरिक पदावर पदनिवृत्ती' : 'Demote to Citizen'}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        {language === 'mr' ? 'प्रशासकीय अधिकार काढून सामान्य नागरिक करा' : 'Revoke ERP access & revert to citizen'}
                      </span>
                    </div>
                  </div>

                  {/* Sarpanch */}
                  <div
                    onClick={() => handleTargetRoleChange('sarpanch')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-2.5 ${
                      promoteData.targetRole === 'sarpanch'
                        ? 'border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-400'
                        : 'border-slate-200 hover:border-amber-200 bg-white'
                    }`}
                  >
                    <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-900 block">👑 {language === 'mr' ? 'सरपंच (Sarpanch)' : 'Sarpanch'}</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">{language === 'mr' ? 'ग्रामपंचायत प्रमुख व विकासकामे मंजुरी कक्ष' : 'Panchayat President & Executive Head'}</span>
                    </div>
                  </div>

                  {/* Up-Sarpanch */}
                  <div
                    onClick={() => handleTargetRoleChange('upsarpanch')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-2.5 ${
                      promoteData.targetRole === 'upsarpanch'
                        ? 'border-orange-500 bg-orange-50 shadow-sm ring-1 ring-orange-400'
                        : 'border-slate-200 hover:border-orange-200 bg-white'
                    }`}
                  >
                    <div className="p-2 bg-orange-500 text-white rounded-xl shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-900 block">🎖️ {language === 'mr' ? 'उपसरपंच (Up-Sarpanch)' : 'Up-Sarpanch'}</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">{language === 'mr' ? 'उपप्रमुख व वॉर्ड समन्वय कक्ष' : 'Vice President & Coordination'}</span>
                    </div>
                  </div>

                  {/* Gram Sevak */}
                  <div
                    onClick={() => handleTargetRoleChange('gram_sevak')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-2.5 ${
                      promoteData.targetRole === 'gram_sevak'
                        ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-400'
                        : 'border-slate-200 hover:border-blue-200 bg-white'
                    }`}
                  >
                    <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-900 block">✍️ {language === 'mr' ? 'ग्रामविकास अधिकारी (Gram Sevak)' : 'Gram Sevak / Secretary'}</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">{language === 'mr' ? 'दाखले छाननी, कर व शासकीय योजना ERP' : 'Administrative & Certificate Officer'}</span>
                    </div>
                  </div>

                  {/* Ward Member / Sadasya */}
                  <div
                    onClick={() => handleTargetRoleChange('sadasya')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-2.5 ${
                      promoteData.targetRole === 'sadasya'
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-400'
                        : 'border-slate-200 hover:border-emerald-200 bg-white'
                    }`}
                  >
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-900 block">👥 {language === 'mr' ? 'ग्रामपंचायत सदस्य (Ward Member)' : 'Ward Member (Sadasya)'}</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">{language === 'mr' ? 'प्रभाग तक्रारी व स्थानिक विकास कामे कक्ष' : 'Ward Representation & Local Issues'}</span>
                    </div>
                  </div>

                  {/* Tax Clerk */}
                  <div
                    onClick={() => handleTargetRoleChange('tax_clerk')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-2.5 ${
                      promoteData.targetRole === 'tax_clerk'
                        ? 'border-cyan-500 bg-cyan-50 shadow-sm ring-1 ring-cyan-400'
                        : 'border-slate-200 hover:border-cyan-200 bg-white'
                    }`}
                  >
                    <div className="p-2 bg-cyan-600 text-white rounded-xl shrink-0 mt-0.5">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-900 block">🧾 {language === 'mr' ? 'कर वसुली लिपिक व ऑपरेटर' : 'Tax Clerk & Operator'}</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">{language === 'mr' ? 'कर संकलन व पावती वितरण डेस्क' : 'Revenue Collection Counter'}</span>
                    </div>
                  </div>

                  {/* Panchayat Staff */}
                  <div
                    onClick={() => handleTargetRoleChange('staff')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-2.5 ${
                      promoteData.targetRole === 'staff'
                        ? 'border-slate-700 bg-slate-100 shadow-sm ring-1 ring-slate-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="p-2 bg-slate-700 text-white rounded-xl shrink-0 mt-0.5">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-900 block">🛠️ {language === 'mr' ? 'ग्रामपंचायत कर्मचारी (Staff)' : 'Panchayat Staff'}</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">{language === 'mr' ? 'दैनिक कार्यालयीन व फील्ड कामकाज' : 'Field & Operations Support'}</span>
                    </div>
                  </div>

                  {/* Taluka BDO (For Admin / BDO) */}
                  {(isSuperAdmin || isTalukaBDO) && (
                    <div
                      onClick={() => handleTargetRoleChange('taluka_bdo')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-2.5 ${
                        promoteData.targetRole === 'taluka_bdo'
                          ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-400'
                        : 'border-slate-200 hover:border-indigo-200 bg-white'
                      }`}
                    >
                      <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-xs text-slate-900 block">🏛️ {language === 'mr' ? 'गटविकास अधिकारी (Taluka BDO)' : 'Taluka BDO'}</span>
                        <span className="text-[10px] text-slate-500 leading-tight block">{language === 'mr' ? 'तालुका संनियंत्रण व आढावा' : 'Taluka Block Development Officer'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Designation & Employee Code */}
              {promoteData.targetRole !== 'citizen' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {language === 'mr' ? 'अधिकृत पदनाम (Official Designation):' : 'Official Designation:'}
                    </label>
                    <input
                      type="text"
                      value={promoteData.designation}
                      onChange={(e) => setPromoteData(prev => ({ ...prev, designation: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                      placeholder="उदा. सरपंच / वॉर्ड सदस्य"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {language === 'mr' ? 'आदेश / कर्मचारी कोड (Order / Emp Code):' : 'Order / Employee Code:'}
                    </label>
                    <input
                      type="text"
                      value={promoteData.employeeCode}
                      onChange={(e) => setPromoteData(prev => ({ ...prev, employeeCode: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                      placeholder="GP-ORD-2026-001"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>{language === 'mr' ? 'पदनिवृत्तीनंतर पदनाम:' : 'Designation after demotion:'} <strong>नागरिक (Citizen)</strong></span>
                  <span className="text-[10px] text-slate-400 font-mono">Employee Code: Cleared</span>
                </div>
              )}

              {/* Ward Assignment (if applicable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? 'प्रभाग / वॉर्ड क्र.:' : 'Assigned Ward:'}
                  </label>
                  <select
                    value={promoteData.wardNo}
                    onChange={(e) => setPromoteData(prev => ({ ...prev, wardNo: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                  >
                    <option value="Ward 1">Ward 1 (गणपती चौक परिसर)</option>
                    <option value="Ward 2">Ward 2 (मारुती मंदिर परिसर)</option>
                    <option value="Ward 3">Ward 3 (बाजारपेठ परिसर)</option>
                    <option value="Ward 4">Ward 4 (शाळा व नवीन वसाहत)</option>
                    <option value="Ward 5">Ward 5 (पाटील गल्ली परिसर)</option>
                    <option value="Ward 6">Ward 6 (गावठाण विस्तार)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'mr' ? 'ग्रामपंचायत कार्यक्षेत्र:' : 'Gram Panchayat:'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={promoteData.gramPanchayat || userGp}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold"
                  />
                </div>
              </div>

              {/* Order / Resolution Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'mr' ? 'आदेश / ठराव शेरा (Resolution / Remarks):' : 'Resolution / Order Remarks:'}
                </label>
                <input
                  type="text"
                  value={promoteData.remarks}
                  onChange={(e) => setPromoteData(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="उदा. ग्रामसभा ठराव क्र. ४ अन्वये बदल..."
                />
              </div>

              {/* Live Single-Occupancy Availability / Conflict Warning Banner for Promotion */}
              {promoteModalOccupancyConflict && promoteData.targetRole !== 'citizen' && (
                promoteModalOccupancyConflict.isOccupied ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2.5 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-amber-200 text-amber-900 rounded-xl shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                          <span>
                            {language === 'mr' 
                              ? `⚠️ हे पद सध्या कार्यरत पदाधिकाऱ्याकडे आहे (${promoteModalOccupancyConflict.locationText})` 
                              : `⚠️ Position Currently Occupied (${promoteModalOccupancyConflict.locationText})`}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-300/80 text-amber-950 rounded-full text-[9px] font-black uppercase">
                            Single Occupancy
                          </span>
                        </h5>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          {language === 'mr' ? (
                            <>
                              सध्या या पदावर <strong>{formatUserName(promoteModalOccupancyConflict.occupant?.name || '', 'mr')}</strong> (मो. {promoteModalOccupancyConflict.occupant?.phone}) कार्यरत आहेत. एका वेळी एकच पदाधिकारी कार्यरत राहू शकतात.
                            </>
                          ) : (
                            <>
                              Currently held by <strong>{formatUserName(promoteModalOccupancyConflict.occupant?.name || '', 'en')}</strong> ({promoteModalOccupancyConflict.occupant?.phone}). Only one active official is permitted per post.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 p-2.5 bg-white/90 rounded-xl border border-amber-300/80 cursor-pointer hover:bg-white transition-all">
                      <input
                        type="checkbox"
                        checked={promoteForceReassign}
                        onChange={(e) => setPromoteForceReassign(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <div className="text-[11px] leading-tight">
                        <span className="font-black text-amber-950 block">
                          {language === 'mr' 
                            ? 'जुन्या पदाधिकाऱ्यास (Old Officer) पदमुक्त करून नागरिक (Citizen) खात्यात वर्ग करा व नवीन नियुक्ती पूर्ण करा' 
                            : 'Auto-Demote Prior Occupant to Citizen & Transfer Official Duties'}
                        </span>
                        <span className="text-[10px] text-amber-800">
                          {language === 'mr'
                            ? 'जुन्या पदाधिकाऱ्याचा कर्मचारी कोड रद्द होईल आणि त्यांचे खाते सामान्य नागरिक (Mobile OTP) म्हणून सुरक्षित राहील.'
                            : 'Prior official’s employee code will be cleared, and their account converted to Citizen (OTP login).'}
                        </span>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between text-xs text-emerald-950 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-[11px]">
                        {language === 'mr' 
                          ? `🟢 हे पद सध्या रिक्त आहे (${promoteModalOccupancyConflict.locationText}) — थेट पदभार सोपवता येईल.`
                          : `🟢 Post is vacant (${promoteModalOccupancyConflict.locationText}) — Ready to assign duties.`}
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                      Vacant
                    </span>
                  </div>
                )
              )}

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPromoteModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 text-white ${
                    promoteData.targetRole === 'citizen'
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800'
                      : selectedUser.role !== 'citizen' && promoteData.targetRole !== selectedUser.role
                      ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600'
                  }`}
                >
                  {promoteData.targetRole === 'citizen' ? (
                    <UserCheck className="w-4 h-4 text-red-200" />
                  ) : (
                    <Crown className="w-4 h-4 text-amber-200" />
                  )}
                  <span>
                    {isSubmitting 
                      ? (language === 'mr' ? 'बदल लागू करत आहे...' : 'Applying Changes...') 
                      : promoteData.targetRole === 'citizen'
                      ? (language === 'mr' ? '🔻 पदनिवृत्ती लागू करा (Demote to Citizen)' : '🔻 Apply Demotion (Revert to Citizen)')
                      : selectedUser.role !== 'citizen' && promoteData.targetRole !== selectedUser.role
                      ? (language === 'mr' ? '🔄 पदबदल जतन करा (Confirm Role Change)' : '🔄 Confirm Role Change')
                      : (language === 'mr' ? '👑 पदभार वाटप व पदोन्नती मंजूर करा' : 'Confirm Promotion & Assign Role')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up p-6 space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                {language === 'mr' ? 'युझर खाते कायमचे हटवायचे आहे का?' : 'Delete User Account Permanently?'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {language === 'mr' 
                  ? `तुम्ही "${formatUserName(selectedUser.name, 'mr')}" (${selectedUser.phone}) हे खाते हटवणार आहात. हा बदल पूर्ववत करता येणार नाही.`
                  : `Are you sure you want to remove "${formatUserName(selectedUser.name, 'en')}" (${selectedUser.phone})? This action cannot be undone.`}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
              <p><span className="font-bold text-slate-500">ID:</span> <span className="font-mono">{selectedUser.id}</span></p>
              <p><span className="font-bold text-slate-500">Role:</span> {selectedUser.role}</p>
              <p><span className="font-bold text-slate-500">Auth:</span> {selectedUser.role === 'admin' ? 'Password' : 'Mobile OTP'}</p>
              <p><span className="font-bold text-slate-500">Gram Panchayat:</span> {formatGramPanchayat(selectedUser.gramPanchayat, language) || (language === 'mr' ? 'सर्व ग्रामपंचायती' : 'All Gram Panchayats')}</p>
              {selectedUser.houseNo && <p><span className="font-bold text-slate-500">House No:</span> {selectedUser.houseNo}</p>}
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isSubmitting ? (language === 'mr' ? 'हटवत आहे...' : 'Deleting...') : (language === 'mr' ? 'होय, खाते हटवा' : 'Yes, Delete Account')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
