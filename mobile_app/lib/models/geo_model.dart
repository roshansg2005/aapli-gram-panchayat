class DistrictModel {
  final String code;
  final String nameEn;
  final String nameMr;

  DistrictModel({
    required this.code,
    required this.nameEn,
    required this.nameMr,
  });

  factory DistrictModel.fromJson(Map<String, dynamic> json) {
    return DistrictModel(
      code: (json['code'] ?? json['id'] ?? '').toString(),
      nameEn: json['name_en'] ?? json['nameEn'] ?? '',
      nameMr: json['name_mr'] ?? json['nameMr'] ?? json['name_en'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'code': code,
    'name_en': nameEn,
    'name_mr': nameMr,
  };
}

class TalukaModel {
  final String code;
  final String districtCode;
  final String nameEn;
  final String nameMr;

  TalukaModel({
    required this.code,
    required this.districtCode,
    required this.nameEn,
    required this.nameMr,
  });

  factory TalukaModel.fromJson(Map<String, dynamic> json) {
    return TalukaModel(
      code: (json['code'] ?? json['id'] ?? '').toString(),
      districtCode: (json['district_code'] ?? json['districtCode'] ?? '').toString(),
      nameEn: json['name_en'] ?? json['nameEn'] ?? '',
      nameMr: json['name_mr'] ?? json['nameMr'] ?? json['name_en'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'code': code,
    'district_code': districtCode,
    'name_en': nameEn,
    'name_mr': nameMr,
  };
}

class GramPanchayatModel {
  final String code;
  final String talukaCode;
  final String districtCode;
  final String nameEn;
  final String nameMr;
  final List<String> wards;

  GramPanchayatModel({
    required this.code,
    required this.talukaCode,
    required this.districtCode,
    required this.nameEn,
    required this.nameMr,
    required this.wards,
  });

  factory GramPanchayatModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedWards = [];
    if (json['wards'] is List) {
      parsedWards = (json['wards'] as List).map((e) => e.toString()).toList();
    } else if (json['wards_json'] != null) {
      try {
        parsedWards = ['Ward 1 (गणपती चौक)', 'Ward 2 (मारुती मंदिर)', 'Ward 3 (बाजारपेठ)', 'Ward 4 (गावठाण)'];
      } catch (_) {
        parsedWards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'];
      }
    }
    if (parsedWards.isEmpty) {
      parsedWards = ['Ward 1 (गणपती चौक)', 'Ward 2 (मारुती मंदिर)', 'Ward 3 (बाजारपेठ)', 'Ward 4 (गावठाण)'];
    }

    return GramPanchayatModel(
      code: (json['code'] ?? json['id'] ?? '').toString(),
      talukaCode: (json['subdistrict_code'] ?? json['taluka_code'] ?? json['talukaCode'] ?? '').toString(),
      districtCode: (json['district_code'] ?? json['districtCode'] ?? '').toString(),
      nameEn: json['name_en'] ?? json['nameEn'] ?? '',
      nameMr: json['name_mr'] ?? json['nameMr'] ?? json['name_en'] ?? '',
      wards: parsedWards,
    );
  }

  Map<String, dynamic> toJson() => {
    'code': code,
    'subdistrict_code': talukaCode,
    'district_code': districtCode,
    'name_en': nameEn,
    'name_mr': nameMr,
    'wards': wards,
  };
}

class LocationSearchResult {
  final String gpCode;
  final String talukaCode;
  final String districtCode;
  final String gpNameEn;
  final String gpNameMr;
  final String talukaNameEn;
  final String talukaNameMr;
  final String districtNameEn;
  final String districtNameMr;

  LocationSearchResult({
    required this.gpCode,
    required this.talukaCode,
    required this.districtCode,
    required this.gpNameEn,
    required this.gpNameMr,
    required this.talukaNameEn,
    required this.talukaNameMr,
    required this.districtNameEn,
    required this.districtNameMr,
  });

  factory LocationSearchResult.fromJson(Map<String, dynamic> json) {
    return LocationSearchResult(
      gpCode: (json['gp_code'] ?? json['code'] ?? '').toString(),
      talukaCode: (json['taluka_code'] ?? json['subdistrict_code'] ?? '').toString(),
      districtCode: (json['district_code'] ?? '').toString(),
      gpNameEn: json['gp_name_en'] ?? json['name_en'] ?? '',
      gpNameMr: json['gp_name_mr'] ?? json['name_mr'] ?? json['gp_name_en'] ?? json['name_en'] ?? '',
      talukaNameEn: json['taluka_name_en'] ?? '',
      talukaNameMr: json['taluka_name_mr'] ?? json['taluka_name_en'] ?? '',
      districtNameEn: json['district_name_en'] ?? '',
      districtNameMr: json['district_name_mr'] ?? json['district_name_en'] ?? '',
    );
  }
}
