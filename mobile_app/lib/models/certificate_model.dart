class CertificateModel {
  final String id;
  final String applicantName;
  final String applicantPhone;
  final String certificateType;
  final String purpose;
  final String submissionDate;
  final String status; // 'pending', 'approved', 'rejected'
  final String gramPanchayat;
  final String taluka;
  final String? wardNo;
  final String? houseNo;
  final String? aadhaar;
  final String? rejectionReason;
  final String? certificateNumber;
  final String? issueDate;
  final double fee;
  final String paymentStatus; // 'paid', 'pending'

  String get appliedDate => submissionDate;

  CertificateModel({
    required this.id,
    required this.applicantName,
    required this.applicantPhone,
    required this.certificateType,
    required this.purpose,
    required this.submissionDate,
    this.status = 'pending',
    required this.gramPanchayat,
    required this.taluka,
    this.wardNo,
    this.houseNo,
    this.aadhaar,
    this.rejectionReason,
    this.certificateNumber,
    this.issueDate,
    this.fee = 20.0,
    this.paymentStatus = 'paid',
  });

  factory CertificateModel.fromJson(Map<String, dynamic> json) {
    return CertificateModel(
      id: json['id']?.toString() ?? '',
      applicantName: json['applicantName']?.toString() ?? json['applicant_name']?.toString() ?? '',
      applicantPhone: json['applicantPhone']?.toString() ?? json['applicant_phone']?.toString() ?? '',
      certificateType: json['certificateType']?.toString() ?? json['certificate_type']?.toString() ?? 'रहिवासी दाखला (Residence)',
      purpose: json['purpose']?.toString() ?? 'शासकीय कामासाठी',
      submissionDate: json['submissionDate']?.toString() ?? json['submission_date']?.toString() ?? DateTime.now().toIso8601String().substring(0, 10),
      status: json['status']?.toString() ?? 'pending',
      gramPanchayat: json['gramPanchayat']?.toString() ?? json['gram_panchayat']?.toString() ?? 'घुलेवाडी',
      taluka: json['taluka']?.toString() ?? 'संगमनेर',
      wardNo: json['wardNo']?.toString() ?? json['ward_no']?.toString(),
      houseNo: json['houseNo']?.toString() ?? json['house_no']?.toString(),
      aadhaar: json['aadhaar']?.toString(),
      rejectionReason: json['rejectionReason']?.toString() ?? json['rejection_reason']?.toString(),
      certificateNumber: json['certificateNumber']?.toString() ?? json['certificate_number']?.toString(),
      issueDate: json['issueDate']?.toString() ?? json['issue_date']?.toString(),
      fee: (json['fee'] is num) ? (json['fee'] as num).toDouble() : 20.0,
      paymentStatus: json['paymentStatus']?.toString() ?? json['payment_status']?.toString() ?? 'paid',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'applicantName': applicantName,
      'applicantPhone': applicantPhone,
      'certificateType': certificateType,
      'purpose': purpose,
      'submissionDate': submissionDate,
      'status': status,
      'gramPanchayat': gramPanchayat,
      'taluka': taluka,
      'wardNo': wardNo,
      'houseNo': houseNo,
      'aadhaar': aadhaar,
      'rejectionReason': rejectionReason,
      'certificateNumber': certificateNumber,
      'issueDate': issueDate,
      'fee': fee,
      'paymentStatus': paymentStatus,
    };
  }
}
