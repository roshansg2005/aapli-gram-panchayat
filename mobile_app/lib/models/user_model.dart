class UserModel {
  final String id;
  final String role;
  final String name;
  final String phone;
  final String? dob;
  final String? email;
  final String? aadhaar;
  final String state;
  final String district;
  final String taluka;
  final String gramPanchayat;
  final String? wardNo;
  final String? houseNo;
  final String? address;
  final String? designation;
  final String? employeeCode;
  final String? avatarUrl;

  UserModel({
    required this.id,
    this.role = 'citizen',
    required this.name,
    required this.phone,
    this.dob,
    this.email,
    this.aadhaar,
    this.state = 'Maharashtra',
    this.district = 'अहिल्यानगर',
    this.taluka = 'संगमनेर',
    this.gramPanchayat = 'घुलेवाडी',
    this.wardNo = 'Ward 1',
    this.houseNo,
    this.address,
    this.designation,
    this.employeeCode,
    this.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      role: json['role']?.toString() ?? 'citizen',
      name: json['name']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      dob: json['dob']?.toString(),
      email: json['email']?.toString(),
      aadhaar: json['aadhaar']?.toString(),
      state: json['state']?.toString() ?? 'Maharashtra',
      district: json['district']?.toString() ?? 'अहिल्यानगर',
      taluka: json['taluka']?.toString() ?? 'संगमनेर',
      gramPanchayat: json['gramPanchayat']?.toString() ?? json['gram_panchayat']?.toString() ?? 'घुलेवाडी',
      wardNo: json['wardNo']?.toString() ?? json['ward_no']?.toString() ?? 'Ward 1',
      houseNo: json['houseNo']?.toString() ?? json['house_no']?.toString(),
      address: json['address']?.toString(),
      designation: json['designation']?.toString(),
      employeeCode: json['employeeCode']?.toString() ?? json['employee_code']?.toString(),
      avatarUrl: json['avatarUrl']?.toString() ?? json['avatar_url']?.toString(),
    );
  }

  bool get isOfficial => role != 'citizen';
  bool get isSarpanch => role == 'sarpanch';
  bool get isUpSarpanch => role == 'upsarpanch';
  bool get isGramSevak => role == 'gram_sevak';
  bool get isSadasya => role == 'sadasya';
  bool get isTaxClerk => role == 'tax_clerk';
  bool get isStaff => role == 'staff';
  bool get isTalukaBDO => role == 'taluka_bdo';
  bool get isAdmin => role == 'admin';

  String get roleDisplayMr {
    switch (role) {
      case 'sarpanch': return '👑 सरपंच (Panchayat Head)';
      case 'upsarpanch': return '🎖️ उपसरपंच (Up-Sarpanch)';
      case 'gram_sevak': return '✍️ ग्रामविकास अधिकारी / ग्रामसेवक';
      case 'sadasya': return '👥 ग्रामपंचायत सदस्य (वॉर्ड प्रतिनिधी)';
      case 'tax_clerk': return '🧾 कर वसुली लिपिक व ऑपरेटर';
      case 'staff': return '🛠️ ग्रामपंचायत सेवक / शिपाई';
      case 'taluka_bdo': return '🏛️ गटविकास अधिकारी (तालुका BDO)';
      case 'admin': return '🛡️ सिस्टीम ॲडमिनिस्ट्रेटर';
      default: return '📱 गाव नागरिक (Citizen)';
    }
  }

  String get roleDisplayEn {
    switch (role) {
      case 'sarpanch': return '👑 Sarpanch (Panchayat Head)';
      case 'upsarpanch': return '🎖️ Deputy Sarpanch';
      case 'gram_sevak': return '✍️ Gram Sevak (Secretary)';
      case 'sadasya': return '👥 Ward Member (Sadasya)';
      case 'tax_clerk': return '🧾 Tax Clerk & Operator';
      case 'staff': return '🛠️ Panchayat Staff';
      case 'taluka_bdo': return '🏛️ Taluka BDO';
      case 'admin': return '🛡️ System Administrator';
      default: return '📱 Citizen';
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'role': role,
      'name': name,
      'phone': phone,
      'dob': dob,
      'email': email,
      'aadhaar': aadhaar,
      'state': state,
      'district': district,
      'taluka': taluka,
      'gramPanchayat': gramPanchayat,
      'wardNo': wardNo,
      'houseNo': houseNo,
      'address': address,
      'designation': designation,
      'employeeCode': employeeCode,
      'avatarUrl': avatarUrl,
    };
  }
}
