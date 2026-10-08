class ProjectModel {
  final String id;
  final String titleMr;
  final String titleEn;
  final String descriptionMr;
  final String descriptionEn;
  final String category;
  final double budget;
  final double expenditure;
  final String status; // 'proposed', 'approved', 'in_progress', 'completed'
  final int completionPercentage;
  final String contractorName;
  final String startDate;
  final String expectedEndDate;
  final String beforePhotoUrl;
  final String afterPhotoUrl;
  final String gramPanchayat;
  final String taluka;

  ProjectModel({
    required this.id,
    required this.titleMr,
    required this.titleEn,
    required this.descriptionMr,
    required this.descriptionEn,
    this.category = 'रस्ते व पायाभूत सुविधा',
    required this.budget,
    this.expenditure = 0.0,
    this.status = 'in_progress',
    this.completionPercentage = 60,
    this.contractorName = 'ग्रामपंचायत बांधकाम समिती',
    required this.startDate,
    required this.expectedEndDate,
    this.beforePhotoUrl = 'https://images.unsplash.com/photo-1541888946425-d0fbb18f13f7?w=500',
    this.afterPhotoUrl = 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500',
    this.gramPanchayat = 'घुलेवाडी',
    this.taluka = 'संगमनेर',
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['id']?.toString() ?? '',
      titleMr: json['titleMr']?.toString() ?? json['title_mr']?.toString() ?? json['title']?.toString() ?? '',
      titleEn: json['titleEn']?.toString() ?? json['title_en']?.toString() ?? json['title']?.toString() ?? '',
      descriptionMr: json['descriptionMr']?.toString() ?? json['description_mr']?.toString() ?? json['description']?.toString() ?? '',
      descriptionEn: json['descriptionEn']?.toString() ?? json['description_en']?.toString() ?? json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? 'रस्ते व वाहतूक',
      budget: ((json['budget'] ?? 1000000.0) as num).toDouble(),
      expenditure: ((json['expenditure'] ?? 450000.0) as num).toDouble(),
      status: json['status']?.toString() ?? 'in_progress',
      completionPercentage: (json['completionPercentage'] ?? json['completion_percentage'] ?? 60) as int,
      contractorName: json['contractorName']?.toString() ?? json['contractor_name']?.toString() ?? 'ग्रामपंचायत बांधकाम समिती',
      startDate: json['startDate']?.toString() ?? json['start_date']?.toString() ?? '2025-01-15',
      expectedEndDate: json['expectedEndDate']?.toString() ?? json['expected_end_date']?.toString() ?? '2026-06-30',
      beforePhotoUrl: json['beforePhotoUrl']?.toString() ?? json['before_photo_url']?.toString() ?? 'https://images.unsplash.com/photo-1541888946425-d0fbb18f13f7?w=500',
      afterPhotoUrl: json['afterPhotoUrl']?.toString() ?? json['after_photo_url']?.toString() ?? 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500',
      gramPanchayat: json['gramPanchayat']?.toString() ?? json['gram_panchayat']?.toString() ?? 'घुलेवाडी',
      taluka: json['taluka']?.toString() ?? 'संगमनेर',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titleMr': titleMr,
      'titleEn': titleEn,
      'descriptionMr': descriptionMr,
      'descriptionEn': descriptionEn,
      'category': category,
      'budget': budget,
      'expenditure': expenditure,
      'status': status,
      'completionPercentage': completionPercentage,
      'contractorName': contractorName,
      'startDate': startDate,
      'expectedEndDate': expectedEndDate,
      'beforePhotoUrl': beforePhotoUrl,
      'afterPhotoUrl': afterPhotoUrl,
      'gramPanchayat': gramPanchayat,
      'taluka': taluka,
    };
  }
}
