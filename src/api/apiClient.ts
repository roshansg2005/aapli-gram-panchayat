const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim() !== '')
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api`
  : (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export interface DistrictItem {
  code: string;
  name_en: string;
  name_mr: string;
}

export interface TalukaItem {
  code: string;
  district_code: string;
  name_en: string;
  name_mr: string;
}

export interface PanchayatItem {
  code: string;
  subdistrict_code?: string;
  district_code?: string;
  name_en: string;
  name_mr: string;
  wards: string[];
}

export const api = {
  // Geo APIs
  async getDistricts(): Promise<DistrictItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/geo/districts`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn('Backend geo API unreachable:', err);
      return [];
    }
  },

  async getTalukas(districtCode: string): Promise<TalukaItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/geo/talukas?districtCode=${districtCode}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn('Backend taluka API unreachable:', err);
      return [];
    }
  },

  async getPanchayats(talukaCode?: string, search?: string): Promise<PanchayatItem[]> {
    try {
      const params = new URLSearchParams();
      if (talukaCode) params.append('talukaCode', talukaCode);
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE_URL}/geo/panchayats?${params.toString()}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn('Backend panchayat API unreachable:', err);
      return [];
    }
  },

  async searchLocations(q: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/geo/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },

  // Auth APIs
  async sendOtp(target: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, phone: target, email: target })
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.sendOtp:', err);
      return { success: false, message: 'OTP पाठवणे अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.' };
    }
  },

  async verifyOtp(target: string, otp: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, otp })
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.verifyOtp:', err);
      return { success: false, message: 'OTP पडताळणी अयशस्वी झाली.' };
    }
  },

  async registerCitizen(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register-citizen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.registerCitizen:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async registerStaff(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.registerStaff:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async login(identifier: string, otp?: string, role?: string, password?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, role, password })
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.login:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async changePassword(userId: string, newPassword: string, oldPassword?: string, phone?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword, oldPassword, phone })
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.changePassword:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async getUsers(role?: string, gramPanchayat?: string, taluka?: string) {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (gramPanchayat) params.append('gramPanchayat', gramPanchayat);
      if (taluka) params.append('taluka', taluka);
      const url = `${API_BASE_URL}/auth/users?${params.toString()}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn('Error fetching users from DB:', err);
      return [];
    }
  },

  async checkRoleAvailability(
    role: string, 
    location: { gramPanchayat?: string; taluka?: string; district?: string; wardNo?: string },
    excludeUserId?: string
  ) {
    try {
      const params = new URLSearchParams();
      params.append('role', role);
      if (location.gramPanchayat) params.append('gramPanchayat', location.gramPanchayat);
      if (location.taluka) params.append('taluka', location.taluka);
      if (location.district) params.append('district', location.district);
      if (location.wardNo) params.append('wardNo', location.wardNo);
      if (excludeUserId) params.append('excludeUserId', excludeUserId);

      const res = await fetch(`${API_BASE_URL}/auth/check-role-availability?${params.toString()}`);
      return await res.json();
    } catch (err) {
      console.warn('Error checking role availability:', err);
      return { success: true, isAvailable: true, hasConflict: false };
    }
  },

  async adminLogin(username: string, password: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.adminLogin:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async createUser(userData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.createUser:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async deleteUser(userId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.deleteUser:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async updateProfile(userId: string, data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.updateProfile:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async promoteUser(userId: string, data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/promote-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data })
      });
      return await res.json();
    } catch (err) {
      console.error('Error in api.promoteUser:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  // Certificate APIs
  async getCertificates(phone?: string, status?: string, gramPanchayat?: string, taluka?: string) {
    try {
      const params = new URLSearchParams();
      if (phone) params.append('phone', phone);
      if (status) params.append('status', status);
      if (gramPanchayat) params.append('gramPanchayat', gramPanchayat);
      if (taluka) params.append('taluka', taluka);
      const res = await fetch(`${API_BASE_URL}/certificates?${params.toString()}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },

  async applyCertificate(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async updateCertificateStatus(id: string, status: string, remarks?: string, approvedBy?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks, approvedBy })
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async getCertificateTypes(gramPanchayat?: string, includeInactive?: boolean) {
    try {
      const params = new URLSearchParams();
      if (gramPanchayat) params.append('gramPanchayat', gramPanchayat);
      if (includeInactive) params.append('includeInactive', 'true');
      const res = await fetch(`${API_BASE_URL}/certificates/types?${params.toString()}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn('Backend certificate types API error:', err);
      return [];
    }
  },

  async addCertificateType(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Error in addCertificateType:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async updateCertificateType(id: string, updates: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (err) {
      console.error('Error in updateCertificateType:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async deleteCertificateType(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/types/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.error('Error in deleteCertificateType:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  // Grievance APIs
  async getGrievances(phone?: string, status?: string, gramPanchayat?: string, taluka?: string) {
    try {
      const params = new URLSearchParams();
      if (phone) params.append('phone', phone);
      if (status) params.append('status', status);
      if (gramPanchayat) params.append('gramPanchayat', gramPanchayat);
      if (taluka) params.append('taluka', taluka);
      const res = await fetch(`${API_BASE_URL}/grievances?${params.toString()}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },

  async createGrievance(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/grievances/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async updateGrievance(id: string, updates: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/grievances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Tax APIs
  async getTaxRecords(gramPanchayat?: string, wardNo?: string, taluka?: string) {
    try {
      const params = new URLSearchParams();
      if (gramPanchayat) params.append('gramPanchayat', gramPanchayat);
      if (wardNo) params.append('wardNo', wardNo);
      if (taluka) params.append('taluka', taluka);
      const res = await fetch(`${API_BASE_URL}/tax?${params.toString()}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },

  async createTaxAssessment(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/tax/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Error assessing tax in API:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  async payTax(propertyNo: string, paymentMethod: string = 'UPI') {
    try {
      const res = await fetch(`${API_BASE_URL}/tax/${propertyNo}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod })
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async deleteTaxAssessment(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/tax/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.error('Error in deleteTaxAssessment:', err);
      return { success: false, message: 'Server connection error' };
    }
  },

  // Content APIs (Notices & Projects)
  async getNotices(gramPanchayat?: string, taluka?: string) {
    try {
      const params = new URLSearchParams();
      if (gramPanchayat) params.append('gramPanchayat', gramPanchayat);
      if (taluka) params.append('taluka', taluka);
      const res = await fetch(`${API_BASE_URL}/content/notices?${params.toString()}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },

  async addNotice(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/content/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async getProjects(gramPanchayat?: string, taluka?: string) {
    try {
      const params = new URLSearchParams();
      if (gramPanchayat) params.append('gramPanchayat', gramPanchayat);
      if (taluka) params.append('taluka', taluka);
      const res = await fetch(`${API_BASE_URL}/content/projects?${params.toString()}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },

  async addProject(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/content/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Schemes APIs
  async getSchemes(gramPanchayat?: string, category?: string, taluka?: string) {
    try {
      const params = new URLSearchParams();
      if (gramPanchayat) params.append('gramPanchayat', gramPanchayat);
      if (category && category !== 'All') params.append('category', category);
      if (taluka) params.append('taluka', taluka);
      const res = await fetch(`${API_BASE_URL}/content/schemes?${params.toString()}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },

  async addScheme(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/content/schemes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Scheme Application APIs
  async getSchemeApplications(gramPanchayat?: string, taluka?: string) {
    try {
      const params = new URLSearchParams();
      if (gramPanchayat) params.append('gramPanchayat', gramPanchayat);
      if (taluka) params.append('taluka', taluka);
      const res = await fetch(`${API_BASE_URL}/content/schemes/applications?${params.toString()}`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },

  async applyForScheme(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/content/schemes/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async updateSchemeApplicationStatus(id: string, status: string, dbtStatus?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/content/schemes/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, dbtStatus })
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  }
};

