class VillageOfficialModel {
  final String id;
  final String nameMr;
  final String nameEn;
  final String designationMr;
  final String designationEn;
  final String phone;
  final String? email;
  final String? wardNo;
  final String photoUrl;
  final String roleType; // 'elected' or 'administration'

  VillageOfficialModel({
    required this.id,
    required this.nameMr,
    required this.nameEn,
    required this.designationMr,
    required this.designationEn,
    required this.phone,
    this.email,
    this.wardNo,
    required this.photoUrl,
    required this.roleType,
  });

  factory VillageOfficialModel.fromJson(Map<String, dynamic> json) {
    return VillageOfficialModel(
      id: json['id']?.toString() ?? '',
      nameMr: json['nameMr']?.toString() ?? json['name_mr']?.toString() ?? json['name']?.toString() ?? '',
      nameEn: json['nameEn']?.toString() ?? json['name_en']?.toString() ?? json['name']?.toString() ?? '',
      designationMr: json['designationMr']?.toString() ?? json['designation_mr']?.toString() ?? json['designation']?.toString() ?? 'ग्रामपंचायत प्रतिनिधी',
      designationEn: json['designationEn']?.toString() ?? json['designation_en']?.toString() ?? json['designation']?.toString() ?? 'Representative',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString(),
      wardNo: json['wardNo']?.toString() ?? json['ward_no']?.toString(),
      photoUrl: json['photoUrl']?.toString() ?? json['photo_url']?.toString() ?? 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300',
      roleType: json['roleType']?.toString() ?? json['role_type']?.toString() ?? 'elected',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nameMr': nameMr,
      'nameEn': nameEn,
      'designationMr': designationMr,
      'designationEn': designationEn,
      'phone': phone,
      'email': email,
      'wardNo': wardNo,
      'photoUrl': photoUrl,
      'roleType': roleType,
    };
  }
}
