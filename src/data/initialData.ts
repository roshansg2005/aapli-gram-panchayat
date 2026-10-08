import { 
  CertificateApplication, 
  Grievance, 
  PropertyTaxRecord, 
  GovtScheme, 
  GramNotice, 
  DevelopmentProject, 
  VillageOfficial,
  PanchayatInfo,
  User
} from '../types';


export const initialPanchayatInfo: PanchayatInfo = {
  nameMr: 'आपली ग्रामपंचायत',
  nameEn: 'Aapli Gram Panchayat',
  talukaMr: 'तालुका कार्यालय',
  talukaEn: 'Taluka Office',
  districtMr: 'महाराष्ट्र शासन',
  districtEn: 'Govt of Maharashtra',
  pincode: '414001',
  totalPopulation: 0,
  totalHouseholds: 0,
  totalWards: 6,
  helplineNumber: '1800-120-8040',
  policePatilNumber: '112',
  ambulanceNumber: '108',
  gramSevakName: 'ग्रामविकास अधिकारी (Gram Sevak)',
  sarpanchName: 'सरपंच (Sarpanch)',
  officeHoursMr: 'सकाळी १०:०० ते सायंकाळी ५:३० (सोमवार ते शनिवार)',
  officeHoursEn: '10:00 AM to 05:30 PM (Monday to Saturday)',
};

export const initialCertificates: CertificateApplication[] = [];

export const initialGrievances: Grievance[] = [];

export const initialTaxRecords: PropertyTaxRecord[] = [];

export const initialGovtSchemes: GovtScheme[] = [];

export const initialNotices: GramNotice[] = [];

export const initialProjects: DevelopmentProject[] = [];

export const initialOfficials: VillageOfficial[] = [];

export const initialUsers: User[] = [];

