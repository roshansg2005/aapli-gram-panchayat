class NoticeModel {
  final String id;
  final String titleMr;
  final String titleEn;
  final String contentMr;
  final String contentEn;
  final String category;
  final String publishDate;
  final String? expiryDate;
  final String issuedBy;
  final bool isUrgent;
  final String gramPanchayat;
  final String taluka;

  NoticeModel({
    required this.id,
    required this.titleMr,
    required this.titleEn,
    required this.contentMr,
    required this.contentEn,
    this.category = 'ग्रामसभा (Gram Sabha)',
    required this.publishDate,
    this.expiryDate,
    this.issuedBy = 'ग्रामपंचायत कार्यालय',
    this.isUrgent = false,
    this.gramPanchayat = 'घुलेवाडी',
    this.taluka = 'संगमनेर',
  });

  factory NoticeModel.fromJson(Map<String, dynamic> json) {
    return NoticeModel(
      id: json['id']?.toString() ?? '',
      titleMr: json['titleMr']?.toString() ?? json['title_mr']?.toString() ?? json['title']?.toString() ?? '',
      titleEn: json['titleEn']?.toString() ?? json['title_en']?.toString() ?? json['title']?.toString() ?? '',
      contentMr: json['contentMr']?.toString() ?? json['content_mr']?.toString() ?? json['content']?.toString() ?? '',
      contentEn: json['contentEn']?.toString() ?? json['content_en']?.toString() ?? json['content']?.toString() ?? '',
      category: json['category']?.toString() ?? 'ग्रामसभा',
      publishDate: json['publishDate']?.toString() ?? json['publish_date']?.toString() ?? DateTime.now().toIso8601String().substring(0, 10),
      expiryDate: json['expiryDate']?.toString() ?? json['expiry_date']?.toString(),
      issuedBy: json['issuedBy']?.toString() ?? json['issued_by']?.toString() ?? 'ग्रामपंचायत कार्यालय',
      isUrgent: json['isUrgent'] == true || json['is_urgent'] == 1 || json['is_urgent'] == true,
      gramPanchayat: json['gramPanchayat']?.toString() ?? json['gram_panchayat']?.toString() ?? 'घुलेवाडी',
      taluka: json['taluka']?.toString() ?? 'संगमनेर',
    );
  }

  String get type => category;
  String get descriptionMr => contentMr;
  String get descriptionEn => contentEn;
  String get date => publishDate;
  String? get venue => 'ग्रामपंचायत कार्यालय / मुख्य सभागृह';
  String? get time => 'सकाळी ११:०० वा.';

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titleMr': titleMr,
      'titleEn': titleEn,
      'contentMr': contentMr,
      'contentEn': contentEn,
      'category': category,
      'publishDate': publishDate,
      'expiryDate': expiryDate,
      'issuedBy': issuedBy,
      'isUrgent': isUrgent,
      'gramPanchayat': gramPanchayat,
      'taluka': taluka,
    };
  }
}
