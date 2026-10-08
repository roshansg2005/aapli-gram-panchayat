class GrievanceModel {
  final String id;
  final String citizenName;
  final String citizenPhone;
  final String title;
  final String description;
  final String category;
  final String wardNo;
  final String gramPanchayat;
  final String taluka;
  final String? houseNo;
  final String status; // 'open', 'in_progress', 'resolved'
  final String priority; // 'low', 'medium', 'high', 'urgent'
  final String submittedDate;
  final String? resolutionDate;
  final String? resolutionRemarks;
  final List<String> photoUrls;

  String get locationDetails => houseNo != null && houseNo!.isNotEmpty ? 'घर क्र. $houseNo, $gramPanchayat' : gramPanchayat;
  String get createdAt => submittedDate;
  String? get resolutionNotes => resolutionRemarks;

  GrievanceModel({
    required this.id,
    required this.citizenName,
    required this.citizenPhone,
    required this.title,
    required this.description,
    required this.category,
    required this.wardNo,
    required this.gramPanchayat,
    required this.taluka,
    this.houseNo,
    this.status = 'open',
    this.priority = 'medium',
    required this.submittedDate,
    this.resolutionDate,
    this.resolutionRemarks,
    this.photoUrls = const [],
  });

  factory GrievanceModel.fromJson(Map<String, dynamic> json) {
    List<String> photos = [];
    if (json['photoUrls'] != null) {
      if (json['photoUrls'] is List) {
        photos = List<String>.from(json['photoUrls'].map((x) => x.toString()));
      } else if (json['photoUrls'] is String) {
        photos = [json['photoUrls'].toString()];
      }
    }

    return GrievanceModel(
      id: json['id']?.toString() ?? '',
      citizenName: json['citizenName']?.toString() ?? json['citizen_name']?.toString() ?? '',
      citizenPhone: json['citizenPhone']?.toString() ?? json['citizen_phone']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? 'पाणी पुरवठा (Water Supply)',
      wardNo: json['wardNo']?.toString() ?? json['ward_no']?.toString() ?? 'Ward 1',
      gramPanchayat: json['gramPanchayat']?.toString() ?? json['gram_panchayat']?.toString() ?? 'घुलेवाडी',
      taluka: json['taluka']?.toString() ?? 'संगमनेर',
      houseNo: json['houseNo']?.toString() ?? json['house_no']?.toString(),
      status: json['status']?.toString() ?? 'open',
      priority: json['priority']?.toString() ?? 'medium',
      submittedDate: json['submittedDate']?.toString() ?? json['submitted_date']?.toString() ?? DateTime.now().toIso8601String().substring(0, 10),
      resolutionDate: json['resolutionDate']?.toString() ?? json['resolution_date']?.toString(),
      resolutionRemarks: json['resolutionRemarks']?.toString() ?? json['resolution_remarks']?.toString(),
      photoUrls: photos,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'citizenName': citizenName,
      'citizenPhone': citizenPhone,
      'title': title,
      'description': description,
      'category': category,
      'wardNo': wardNo,
      'gramPanchayat': gramPanchayat,
      'taluka': taluka,
      'houseNo': houseNo,
      'status': status,
      'priority': priority,
      'submittedDate': submittedDate,
      'resolutionDate': resolutionDate,
      'resolutionRemarks': resolutionRemarks,
      'photoUrls': photoUrls,
    };
  }
}
