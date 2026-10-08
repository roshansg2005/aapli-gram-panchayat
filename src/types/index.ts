export type Language = 'mr' | 'en';

export type AppMode = 'gateway' | 'citizen-mobile' | 'panchayat-desktop' | 'admin-portal' | 'admin-login';

export type MobileTab = 
  | 'home' 
  | 'certificates' 
  | 'grievances' 
  | 'tax' 
  | 'schemes' 
  | 'notices' 
  | 'directory' 
  | 'profile';

export type UserRole = 
  | 'citizen' 
  | 'sarpanch' 
  | 'upsarpanch' 
  | 'gram_sevak' 
  | 'sadasya' 
  | 'tax_clerk' 
  | 'staff' 
  | 'taluka_bdo' 
  | 'admin';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  dob?: string;
  email?: string;
  aadhaar?: string;
  state?: string;
  district?: string;
  taluka?: string;
  gramPanchayat?: string;
  wardNo?: string;
  houseNo?: string;
  address?: string;
  employeeCode?: string;
  designation?: string;
  avatarUrl?: string;
  password?: string;
  hasPassword?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export type DesktopTab = 
  | 'dashboard' 
  | 'certificates' 
  | 'grievances' 
  | 'tax' 
  | 'schemes' 
  | 'development' 
  | 'gramsabha' 
  | 'directory'
  | 'ward_desk'
  | 'taluka_oversight'
  | 'admin_users';

export type CertificateType = string;

export interface CertificateTypeConfig {
  id: string;
  code: string;
  gramPanchayat?: string;
  nameMr: string;
  nameEn: string;
  fee: number; // 0 for Free / मोफत
  deliveryDays: number;
  descriptionMr?: string;
  descriptionEn?: string;
  requiredDocumentsMr?: string;
  requiredDocumentsEn?: string;
  isActive: boolean;
  createdAt?: string;
}

export type ApplicationStatus = 'pending' | 'under_scrutiny' | 'approved' | 'rejected';

export interface CertificateApplication {
  id: string;
  applicationNo: string;
  type: string;
  applicantName: string;
  applicantAadhaar: string;
  applicantPhone: string;
  wardNo: string;
  houseNo: string;
  gramPanchayat?: string;
  taluka?: string;
  district?: string;
  reason: string;
  appliedDate: string;
  status: ApplicationStatus;
  remarks?: string;
  processedDate?: string;
  processedBy?: string;
  certificateNumber?: string;
  qrCodeData?: string;
  details: Record<string, string>;
}

export type GrievanceCategory = 
  | 'water'          // पाणीपुरवठा
  | 'streetlight'    // पथदिवे
  | 'sanitation'     // स्वच्छता व कचरा व्यवस्थापन
  | 'roads'          // रस्ते व गटारे
  | 'encroachment'   // अतिक्रमण
  | 'health'         // आरोग्य व कीटकनाशक फवारणी
  | 'other';         // इतर तक्रार

export type GrievanceStatus = 'submitted' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';

export interface Grievance {
  id: string;
  ticketNo: string;
  category: GrievanceCategory;
  title: string;
  description: string;
  wardNo: string;
  locationDetails: string;
  gramPanchayat?: string;
  taluka?: string;
  district?: string;
  citizenName: string;
  citizenPhone: string;
  photoUrl?: string;
  submittedDate: string;
  status: GrievanceStatus;
  assignedOfficer?: string;
  assignedOfficerPhone?: string;
  resolutionRemarks?: string;
  resolutionPhotoUrl?: string;
  resolvedDate?: string;
}

export interface PropertyTaxRecord {
  id: string;
  propertyNo: string;
  ownerName: string;
  guardianName?: string;
  wardNo: string;
  address?: string;
  gramPanchayat?: string;
  taluka?: string;
  district?: string;
  builtUpAreaSqFt?: number;
  propertyType?: 'Residential' | 'Commercial' | 'Agricultural';
  taxType?: 'all' | 'property_only' | 'water_only' | 'custom';
  propertyTax: number;
  waterTax: number;
  sanitationTax: number;
  lightingTax: number;
  totalTax: number;
  penalty?: number;
  discount: number;
  rebate?: number;
  finalAmount: number;
  isPaid: boolean;
  lastPaymentDate?: string;
  paidDate?: string;
  receiptNo?: string;
  paymentMode?: 'UPI' | 'Cash' | 'NetBanking';
  paymentMethod?: string;
  transactionId?: string;
}


export interface GovtScheme {
  id: string;
  nameMr: string;
  nameEn: string;
  category: 'Women & Child' | 'Farmers' | 'Housing' | 'Senior Citizens' | 'Health' | 'Youth';
  benefitMr: string;
  benefitEn: string;
  eligibilityMr: string[];
  eligibilityEn: string[];
  documentsMr: string[];
  documentsEn: string[];
  departmentMr: string;
  departmentEn: string;
  deadline?: string;
  gramPanchayat?: string;
  taluka?: string;
  district?: string;
  applicationCount: number;
  iconName: string;
}

export interface SchemeApplication {
  id: string;
  schemeId: string;
  schemeName?: string;
  schemeNameMr?: string;
  schemeNameEn?: string;
  applicantName: string;
  name?: string;
  aadhaar: string;
  applicantAadhaar?: string;
  phone: string;
  applicantPhone?: string;
  incomePerAnnum?: number;
  appliedDate: string;
  sanctionedDate?: string;
  status: 'pending' | 'verified' | 'sanctioned' | 'rejected' | 'Sanctioned' | 'Pending Verification';
  wardNo: string;
  ward?: string;
  gramPanchayat?: string;
  taluka?: string;
  district?: string;
  benefitAmount?: number;
  amount?: number;
  dbtDate?: string;
  dbtStatus?: string;
}


export interface GramNotice {
  id: string;
  titleMr: string;
  titleEn: string;
  date: string;
  type: 'GramSabha' | 'Tender' | 'Alert' | 'Resolution' | 'TaxNotice';
  descriptionMr: string;
  descriptionEn: string;
  venue?: string;
  time?: string;
  pdfUrl?: string;
  isHighPriority?: boolean;
  gramPanchayat?: string;
  taluka?: string;
  district?: string;
}

export interface DevelopmentProject {
  id: string;
  titleMr: string;
  titleEn: string;
  wardNo: string;
  gramPanchayat?: string;
  taluka?: string;
  district?: string;
  allocatedBudget: number;
  spentBudget: number;
  progressPercentage: number;
  status: 'planning' | 'in_progress' | 'completed';
  contractor: string;
  startDate: string;
  targetEndDate: string;
  photos: string[];
}

export interface VillageOfficial {
  id: string;
  nameMr: string;
  nameEn: string;
  designationMr: string;
  designationEn: string;
  phone: string;
  email?: string;
  wardNo?: string;
  gramPanchayat?: string;
  taluka?: string;
  photoUrl: string;
  roleType: 'elected' | 'administration' | 'field_staff';
}

export interface PanchayatInfo {
  nameMr: string;
  nameEn: string;
  talukaMr: string;
  talukaEn: string;
  districtMr: string;
  districtEn: string;
  pincode: string;
  totalPopulation: number;
  totalHouseholds: number;
  totalWards: number;
  helplineNumber: string;
  policePatilNumber: string;
  ambulanceNumber: string;
  gramSevakName: string;
  sarpanchName: string;
  officeHoursMr: string;
  officeHoursEn: string;
}
