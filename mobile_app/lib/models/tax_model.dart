class TaxRecordModel {
  final String id;
  final String citizenName;
  final String citizenPhone;
  final String houseNo;
  final String propertyType;
  final String wardNo;
  final String gramPanchayat;
  final String taluka;
  final String assessmentYear;
  final double generalTax;
  final double waterTax;
  final double lightingTax;
  final double sanitationTax;
  final double totalAmount;
  final double paidAmount;
  final double dueAmount;
  final String status; // 'paid', 'pending', 'partial'
  final String? paymentDate;
  final String? paymentMethod;
  final String? transactionId;

  TaxRecordModel({
    required this.id,
    required this.citizenName,
    required this.citizenPhone,
    required this.houseNo,
    this.propertyType = 'निवासी (Residential)',
    required this.wardNo,
    required this.gramPanchayat,
    required this.taluka,
    this.assessmentYear = '२०२५-२०२६',
    this.generalTax = 800.0,
    this.waterTax = 400.0,
    this.lightingTax = 150.0,
    this.sanitationTax = 150.0,
    required this.totalAmount,
    required this.paidAmount,
    required this.dueAmount,
    required this.status,
    this.paymentDate,
    this.paymentMethod,
    this.transactionId,
  });

  factory TaxRecordModel.fromJson(Map<String, dynamic> json) {
    final tot = (json['totalAmount'] ?? json['total_amount'] ?? 1500.0) as num;
    final paid = (json['paidAmount'] ?? json['paid_amount'] ?? 0.0) as num;
    final due = (json['dueAmount'] ?? json['due_amount'] ?? (tot - paid)) as num;

    return TaxRecordModel(
      id: json['id']?.toString() ?? '',
      citizenName: json['citizenName']?.toString() ?? json['citizen_name']?.toString() ?? '',
      citizenPhone: json['citizenPhone']?.toString() ?? json['citizen_phone']?.toString() ?? '',
      houseNo: json['houseNo']?.toString() ?? json['house_no']?.toString() ?? 'घर क्र. १',
      propertyType: json['propertyType']?.toString() ?? json['property_type']?.toString() ?? 'निवासी (Residential)',
      wardNo: json['wardNo']?.toString() ?? json['ward_no']?.toString() ?? 'Ward 1',
      gramPanchayat: json['gramPanchayat']?.toString() ?? json['gram_panchayat']?.toString() ?? 'घुलेवाडी',
      taluka: json['taluka']?.toString() ?? 'संगमनेर',
      assessmentYear: json['assessmentYear']?.toString() ?? json['assessment_year']?.toString() ?? '२०२५-२०२६',
      generalTax: ((json['generalTax'] ?? json['general_tax'] ?? 800.0) as num).toDouble(),
      waterTax: ((json['waterTax'] ?? json['water_tax'] ?? 400.0) as num).toDouble(),
      lightingTax: ((json['lightingTax'] ?? json['lighting_tax'] ?? 150.0) as num).toDouble(),
      sanitationTax: ((json['sanitationTax'] ?? json['sanitation_tax'] ?? 150.0) as num).toDouble(),
      totalAmount: tot.toDouble(),
      paidAmount: paid.toDouble(),
      dueAmount: due.toDouble(),
      status: json['status']?.toString() ?? (due <= 0 ? 'paid' : 'pending'),
      paymentDate: json['paymentDate']?.toString() ?? json['payment_date']?.toString(),
      paymentMethod: json['paymentMethod']?.toString() ?? json['payment_method']?.toString(),
      transactionId: json['transactionId']?.toString() ?? json['transaction_id']?.toString(),
    );
  }

  String get propertyNo => houseNo;
  String get ownerName => citizenName;
  double get lightTax => lightingTax;
  double get healthTax => sanitationTax;
  bool get isPaid => dueAmount <= 0;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'citizenName': citizenName,
      'citizenPhone': citizenPhone,
      'houseNo': houseNo,
      'propertyType': propertyType,
      'wardNo': wardNo,
      'gramPanchayat': gramPanchayat,
      'taluka': taluka,
      'assessmentYear': assessmentYear,
      'generalTax': generalTax,
      'waterTax': waterTax,
      'lightingTax': lightingTax,
      'sanitationTax': sanitationTax,
      'totalAmount': totalAmount,
      'paidAmount': paidAmount,
      'dueAmount': dueAmount,
      'status': status,
      'paymentDate': paymentDate,
      'paymentMethod': paymentMethod,
      'transactionId': transactionId,
    };
  }
}

typedef TaxModel = TaxRecordModel;

