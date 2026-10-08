class GovtSchemeModel {
  final String id;
  final String titleMr;
  final String titleEn;
  final String departmentMr;
  final String departmentEn;
  final String category;
  final double subsidyPercentage;
  final double maxSubsidy;
  final String eligibility;
  final String documentsRequired;
  final String descriptionMr;
  final String descriptionEn;
  final String? startDate;
  final String? endDate;
  final String gramPanchayat;
  final String taluka;

  GovtSchemeModel({
    required this.id,
    required this.titleMr,
    required this.titleEn,
    required this.departmentMr,
    required this.departmentEn,
    this.category = 'कृषी व सिंचन',
    this.subsidyPercentage = 75.0,
    this.maxSubsidy = 50000.0,
    required this.eligibility,
    required this.documentsRequired,
    required this.descriptionMr,
    required this.descriptionEn,
    this.startDate,
    this.endDate,
    this.gramPanchayat = 'सर्व (All)',
    this.taluka = 'सर्व (All)',
  });

  factory GovtSchemeModel.fromJson(Map<String, dynamic> json) {
    return GovtSchemeModel(
      id: json['id']?.toString() ?? '',
      titleMr: json['titleMr']?.toString() ?? json['title_mr']?.toString() ?? json['title']?.toString() ?? '',
      titleEn: json['titleEn']?.toString() ?? json['title_en']?.toString() ?? json['title']?.toString() ?? '',
      departmentMr: json['departmentMr']?.toString() ?? json['department_mr']?.toString() ?? 'ग्रामविकास विभाग',
      departmentEn: json['departmentEn']?.toString() ?? json['department_en']?.toString() ?? 'Rural Development Dept',
      category: json['category']?.toString() ?? 'कल्याणकारी योजना',
      subsidyPercentage: ((json['subsidyPercentage'] ?? json['subsidy_percentage'] ?? 75.0) as num).toDouble(),
      maxSubsidy: ((json['maxSubsidy'] ?? json['max_subsidy'] ?? 50000.0) as num).toDouble(),
      eligibility: json['eligibility']?.toString() ?? 'गावातील सर्व रहिवासी',
      documentsRequired: json['documentsRequired']?.toString() ?? json['documents_required']?.toString() ?? 'आधार कार्ड, बँक पासबुक, ८-अ उतारा',
      descriptionMr: json['descriptionMr']?.toString() ?? json['description_mr']?.toString() ?? '',
      descriptionEn: json['descriptionEn']?.toString() ?? json['description_en']?.toString() ?? '',
      startDate: json['startDate']?.toString() ?? json['start_date']?.toString(),
      endDate: json['endDate']?.toString() ?? json['end_date']?.toString(),
      gramPanchayat: json['gramPanchayat']?.toString() ?? json['gram_panchayat']?.toString() ?? 'सर्व (All)',
      taluka: json['taluka']?.toString() ?? 'सर्व (All)',
    );
  }

  // Alias Getters for universal search & web compatibility
  String get nameMr => titleMr;
  String get nameEn => titleEn;
  String get benefitAmount => '₹${maxSubsidy.toInt()}';

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titleMr': titleMr,
      'titleEn': titleEn,
      'departmentMr': departmentMr,
      'departmentEn': departmentEn,
      'category': category,
      'subsidyPercentage': subsidyPercentage,
      'maxSubsidy': maxSubsidy,
      'eligibility': eligibility,
      'documentsRequired': documentsRequired,
      'descriptionMr': descriptionMr,
      'descriptionEn': descriptionEn,
      'startDate': startDate,
      'endDate': endDate,
      'gramPanchayat': gramPanchayat,
      'taluka': taluka,
    };
  }
}

class SchemeApplicationModel {
  final String id;
  final String schemeId;
  final String schemeTitle;
  final String applicantName;
  final String applicantPhone;
  final String submissionDate;
  final String status; // 'pending', 'approved', 'rejected'
  final String? remarks;
  final String gramPanchayat;
  final String taluka;

  SchemeApplicationModel({
    required this.id,
    required this.schemeId,
    required this.schemeTitle,
    required this.applicantName,
    required this.applicantPhone,
    required this.submissionDate,
    this.status = 'pending',
    this.remarks,
    required this.gramPanchayat,
    required this.taluka,
  });

  factory SchemeApplicationModel.fromJson(Map<String, dynamic> json) {
    return SchemeApplicationModel(
      id: json['id']?.toString() ?? '',
      schemeId: json['schemeId']?.toString() ?? json['scheme_id']?.toString() ?? '',
      schemeTitle: json['schemeTitle']?.toString() ?? json['scheme_title']?.toString() ?? '',
      applicantName: json['applicantName']?.toString() ?? json['applicant_name']?.toString() ?? '',
      applicantPhone: json['applicantPhone']?.toString() ?? json['applicant_phone']?.toString() ?? '',
      submissionDate: json['submissionDate']?.toString() ?? json['submission_date']?.toString() ?? DateTime.now().toIso8601String().substring(0, 10),
      status: json['status']?.toString() ?? 'pending',
      remarks: json['remarks']?.toString(),
      gramPanchayat: json['gramPanchayat']?.toString() ?? json['gram_panchayat']?.toString() ?? 'घुलेवाडी',
      taluka: json['taluka']?.toString() ?? 'संगमनेर',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'schemeId': schemeId,
      'schemeTitle': schemeTitle,
      'applicantName': applicantName,
      'applicantPhone': applicantPhone,
      'submissionDate': submissionDate,
      'status': status,
      'remarks': remarks,
      'gramPanchayat': gramPanchayat,
      'taluka': taluka,
    };
  }
}

typedef SchemeModel = GovtSchemeModel;

