import { DesktopTab, UserRole } from '../types';
import { 
  Building2, 
  Crown, 
  Award, 
  ShieldCheck, 
  Users2, 
  Receipt,
  LayoutDashboard,
  FileCheck2,
  AlertTriangle,
  Layers,
  HardHat,
  Calendar,
  UserPlus
} from 'lucide-react';
import React from 'react';

export interface RoleConfig {
  allowedTabs: DesktopTab[];
  defaultTab: DesktopTab;
  roleTitleMr: string;
  roleTitleEn: string;
  sectionHeaderMr: string;
  sectionHeaderEn: string;
  badgeLabelMr: string;
  badgeLabelEn: string;
  color: string;
  icon: React.FC<{ className?: string }>;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  taluka_bdo: {
    allowedTabs: [
      'taluka_oversight',
      'admin_users',
      'dashboard',
      'development',
      'gramsabha',
      'schemes',
      'grievances',
      'directory'
    ],
    defaultTab: 'taluka_oversight',
    roleTitleMr: 'गटविकास अधिकारी (BDO)',
    roleTitleEn: 'Block Development Officer (BDO)',
    sectionHeaderMr: 'तालुका BDO संनियंत्रण कक्ष',
    sectionHeaderEn: 'Taluka BDO Oversight',
    badgeLabelMr: 'गटविकास अधिकारी',
    badgeLabelEn: 'Taluka BDO',
    color: 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40',
    icon: Building2
  },
  sarpanch: {
    allowedTabs: [
      'dashboard',
      'admin_users',
      'ward_desk',
      'development',
      'gramsabha',
      'certificates',
      'grievances',
      'tax',
      'schemes',
      'directory'
    ],
    defaultTab: 'dashboard',
    roleTitleMr: 'सरपंच (Sarpanch)',
    roleTitleEn: 'Panchayat President (Sarpanch)',
    sectionHeaderMr: 'सरपंच कार्यकारी कार्यकक्ष',
    sectionHeaderEn: 'Sarpanch Executive Desk',
    badgeLabelMr: 'सरपंच (लोकप्रतिनिधी)',
    badgeLabelEn: 'Sarpanch',
    color: 'bg-amber-500/30 text-amber-200 border-amber-400/40',
    icon: Crown
  },
  upsarpanch: {
    allowedTabs: [
      'dashboard',
      'admin_users',
      'ward_desk',
      'development',
      'gramsabha',
      'grievances',
      'schemes',
      'directory'
    ],
    defaultTab: 'dashboard',
    roleTitleMr: 'उपसरपंच (Up-Sarpanch)',
    roleTitleEn: 'Vice President (Up-Sarpanch)',
    sectionHeaderMr: 'उपसरपंच व वॉर्ड समन्वय कक्ष',
    sectionHeaderEn: 'Up-Sarpanch Coordination',
    badgeLabelMr: 'उपसरपंच',
    badgeLabelEn: 'Up-Sarpanch',
    color: 'bg-orange-500/30 text-orange-200 border-orange-400/40',
    icon: Award
  },
  gram_sevak: {
    allowedTabs: [
      'dashboard',
      'admin_users',
      'certificates',
      'tax',
      'grievances',
      'schemes',
      'development',
      'gramsabha',
      'directory',
      'ward_desk'
    ],
    defaultTab: 'dashboard',
    roleTitleMr: 'ग्रामविकास अधिकारी / ग्रामसेवक',
    roleTitleEn: 'Gram Sevak / Secretary',
    sectionHeaderMr: 'ग्रामविकास व प्रशासकीय ERP',
    sectionHeaderEn: 'Administrative & Revenue ERP',
    badgeLabelMr: 'ग्रामविकास अधिकारी',
    badgeLabelEn: 'Gram Sevak',
    color: 'bg-blue-500/30 text-blue-200 border-blue-400/40',
    icon: ShieldCheck
  },
  sadasya: {
    allowedTabs: [
      'ward_desk',
      'dashboard',
      'grievances',
      'development',
      'gramsabha',
      'schemes',
      'directory'
    ],
    defaultTab: 'ward_desk',
    roleTitleMr: 'ग्रामपंचायत सदस्य (Ward Member)',
    roleTitleEn: 'Ward Member (Sadasya)',
    sectionHeaderMr: 'प्रभाग प्रतिनिधी कार्यकक्ष',
    sectionHeaderEn: 'Ward Member Workspace',
    badgeLabelMr: 'वॉर्ड प्रतिनिधी',
    badgeLabelEn: 'Ward Member',
    color: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40',
    icon: Users2
  },
  tax_clerk: {
    allowedTabs: [
      'tax',
      'certificates',
      'dashboard',
      'grievances',
      'directory'
    ],
    defaultTab: 'tax',
    roleTitleMr: 'कर वसुली लिपिक व ऑपरेटर',
    roleTitleEn: 'Tax Clerk & Operator',
    sectionHeaderMr: 'कर संकलन व नागरिक काउंटर',
    sectionHeaderEn: 'Revenue Counter & Desk',
    badgeLabelMr: 'कर लिपिक',
    badgeLabelEn: 'Tax Clerk',
    color: 'bg-cyan-500/30 text-cyan-200 border-cyan-400/40',
    icon: Receipt
  },
  staff: {
    allowedTabs: [
      'dashboard',
      'certificates',
      'tax',
      'grievances',
      'schemes',
      'directory'
    ],
    defaultTab: 'dashboard',
    roleTitleMr: 'ग्रामपंचायत कर्मचारी (Staff)',
    roleTitleEn: 'Panchayat Staff',
    sectionHeaderMr: 'दैनिक कामकाज कार्यप्रणाली',
    sectionHeaderEn: 'Staff Workspace',
    badgeLabelMr: 'कर्मचारी',
    badgeLabelEn: 'Staff',
    color: 'bg-slate-700 text-slate-200 border-slate-600',
    icon: ShieldCheck
  },
  admin: {
    allowedTabs: [
      'admin_users',
      'dashboard',
      'directory'
    ],
    defaultTab: 'admin_users',
    roleTitleMr: 'मुख्य प्रशासक (Administrator)',
    roleTitleEn: 'System Administrator',
    sectionHeaderMr: 'मुख्य प्रशासकीय नियंत्रण कक्ष',
    sectionHeaderEn: 'Master Control Desk',
    badgeLabelMr: 'प्रशासक',
    badgeLabelEn: 'Administrator',
    color: 'bg-purple-500/30 text-purple-200 border-purple-400/40',
    icon: ShieldCheck
  },
  citizen: {
    allowedTabs: [],
    defaultTab: 'dashboard',
    roleTitleMr: 'नागरिक',
    roleTitleEn: 'Citizen',
    sectionHeaderMr: 'नागरिक सेवा',
    sectionHeaderEn: 'Citizen Services',
    badgeLabelMr: 'नागरिक',
    badgeLabelEn: 'Citizen',
    color: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: Users2
  }
};

export const MASTER_SIDEBAR_LINKS: {
  id: DesktopTab;
  labelMr: string;
  labelEn: string;
  icon: React.FC<{ className?: string }>;
  roleBadgeMr?: string;
  roleBadgeEn?: string;
}[] = [
  { id: 'admin_users', labelMr: 'युझर व नागरिक नोंदणी', labelEn: 'User & Citizen Mgt', icon: UserPlus, roleBadgeMr: 'नोंदणी', roleBadgeEn: 'Reg Desk' },
  { id: 'dashboard', labelMr: 'डॅशबोर्ड (Dashboard)', labelEn: 'Executive Dashboard', icon: LayoutDashboard },
  { id: 'taluka_oversight', labelMr: 'तालुका BDO नियंत्रण कक्ष', labelEn: 'Taluka BDO Oversight', icon: Building2, roleBadgeMr: 'गटविकास अधिकारी', roleBadgeEn: 'BDO Oversight' },
  { id: 'ward_desk', labelMr: 'वॉर्ड सदस्य कार्यकक्ष', labelEn: 'Ward Member Desk', icon: Users2, roleBadgeMr: 'वॉर्ड प्रतिनिधी', roleBadgeEn: 'Ward Member' },
  { id: 'certificates', labelMr: 'दाखले छाननी व मंजुरी', labelEn: 'Certificate Scrutiny Desk', icon: FileCheck2 },
  { id: 'grievances', labelMr: 'तक्रार निवारण प्रणाली', labelEn: 'Grievance Redressal Desk', icon: AlertTriangle },
  { id: 'tax', labelMr: 'कर संकलन व पावती काउंटर', labelEn: 'Tax Assessment & Counter', icon: Receipt },
  { id: 'schemes', labelMr: 'शासकीय योजना लाभार्थी', labelEn: 'Govt Schemes Sanctioning', icon: Layers },
  { id: 'development', labelMr: 'गाव विकासकामे व निधी', labelEn: 'Infrastructure Works', icon: HardHat },
  { id: 'gramsabha', labelMr: 'ग्रामसभा व ठराव नोंदवही', labelEn: 'Gram Sabha & Resolutions', icon: Calendar },
  { id: 'directory', labelMr: 'कर्मचारी व वॉर्ड व्यवस्थापन', labelEn: 'Staff & Ward Directory', icon: Users2 },
];

export function getRoleConfig(role?: UserRole): RoleConfig {
  if (!role || !ROLE_CONFIGS[role]) {
    return ROLE_CONFIGS.staff;
  }
  return ROLE_CONFIGS[role];
}

export function isTabAllowedForRole(tab: DesktopTab, role?: UserRole): boolean {
  const config = getRoleConfig(role);
  return config.allowedTabs.includes(tab);
}
