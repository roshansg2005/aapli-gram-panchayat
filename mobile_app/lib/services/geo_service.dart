import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import '../models/geo_model.dart';
import 'api_service.dart';

class GeoService {
  static final GeoService _instance = GeoService._internal();
  factory GeoService() => _instance;
  GeoService._internal();

  final ApiService _api = ApiService();

  bool _isLoaded = false;
  List<DistrictModel> _districts = [];
  List<TalukaModel> _talukas = [];
  List<GramPanchayatModel> _panchayats = [];

  Map<String, List<TalukaModel>> _talukasByDistrict = {};
  Map<String, List<GramPanchayatModel>> _panchayatsByTaluka = {};

  bool get isLoaded => _isLoaded;

  Future<void> init() async {
    if (_isLoaded) return;
    try {
      final jsonString = await rootBundle.loadString('assets/data/maharashtra_geo.json');
      final Map<String, dynamic> data = jsonDecode(jsonString);

      if (data['districts'] is List) {
        _districts = (data['districts'] as List).map((d) => DistrictModel.fromJson(d)).toList();
      }

      if (data['talukas'] is List) {
        _talukas = (data['talukas'] as List).map((t) => TalukaModel.fromJson(t)).toList();
        _talukasByDistrict = {};
        for (var t in _talukas) {
          _talukasByDistrict.putIfAbsent(t.districtCode, () => []).add(t);
        }
      }

      if (data['panchayats'] is List) {
        _panchayats = (data['panchayats'] as List).map((p) => GramPanchayatModel.fromJson(p)).toList();
        _panchayatsByTaluka = {};
        for (var p in _panchayats) {
          _panchayatsByTaluka.putIfAbsent(p.talukaCode, () => []).add(p);
        }
      }

      _isLoaded = true;
      debugPrint('GeoService initialized: ${_districts.length} Districts, ${_talukas.length} Talukas, ${_panchayats.length} Panchayats');
    } catch (e) {
      debugPrint('GeoService init error: $e');
    }
  }

  // Get all 36 Districts
  Future<List<DistrictModel>> getDistricts() async {
    await init();
    final apiRes = await _api.getDistricts();
    if (apiRes.isNotEmpty) {
      return apiRes;
    }
    return _districts;
  }

  // Get Talukas for District (e.g. 14 for Ahilyanagar)
  Future<List<TalukaModel>> getTalukas(String districtCodeOrName) async {
    await init();
    // Try API first
    final apiRes = await _api.getTalukas(districtCodeOrName);
    if (apiRes.isNotEmpty) {
      return apiRes;
    }

    // Lookup code or matching name
    final dist = _districts.firstWhere(
      (d) => d.code == districtCodeOrName || d.nameMr == districtCodeOrName || d.nameEn.toLowerCase() == districtCodeOrName.toLowerCase(),
      orElse: () => _districts.firstWhere((d) => d.code == '466', orElse: () => _districts.first),
    );

    return _talukasByDistrict[dist.code] ?? _talukas.where((t) => t.districtCode == dist.code).toList();
  }

  // Get all Gram Panchayats for Taluka (e.g. all 144 for Sangamner!)
  Future<List<GramPanchayatModel>> getPanchayats(String talukaCodeOrName) async {
    await init();
    // Try API first
    final apiRes = await _api.getPanchayats(talukaCodeOrName, limit: 1000);
    if (apiRes.isNotEmpty) {
      return apiRes;
    }

    // Lookup code or matching name
    final tal = _talukas.firstWhere(
      (t) => t.code == talukaCodeOrName || t.nameMr == talukaCodeOrName || t.nameEn.toLowerCase() == talukaCodeOrName.toLowerCase(),
      orElse: () => _talukas.firstWhere((t) => t.code == '4202', orElse: () => _talukas.first),
    );

    return _panchayatsByTaluka[tal.code] ?? _panchayats.where((p) => p.talukaCode == tal.code).toList();
  }

  // Live Search across all 28,097 Panchayats
  Future<List<LocationSearchResult>> searchLocations(String query) async {
    if (query.trim().isEmpty) return [];
    await init();

    // 1. Try backend API
    final apiRes = await _api.searchLocations(query);
    if (apiRes.isNotEmpty) {
      return apiRes;
    }

    // 2. Fallback instant in-memory search across 28,097 Panchayats
    final cleanQ = query.trim().toLowerCase();
    final List<LocationSearchResult> results = [];

    for (final p in _panchayats) {
      if (p.nameMr.toLowerCase().contains(cleanQ) || p.nameEn.toLowerCase().contains(cleanQ)) {
        final tal = _talukas.firstWhere((t) => t.code == p.talukaCode, orElse: () => TalukaModel(code: p.talukaCode, districtCode: p.districtCode, nameEn: '', nameMr: ''));
        final dist = _districts.firstWhere((d) => d.code == p.districtCode, orElse: () => DistrictModel(code: p.districtCode, nameEn: '', nameMr: ''));

        results.add(LocationSearchResult(
          gpCode: p.code,
          talukaCode: p.talukaCode,
          districtCode: p.districtCode,
          gpNameEn: p.nameEn,
          gpNameMr: p.nameMr,
          talukaNameEn: tal.nameEn,
          talukaNameMr: tal.nameMr,
          districtNameEn: dist.nameEn,
          districtNameMr: dist.nameMr,
        ));

        if (results.length >= 50) break;
      }
    }

    return results;
  }
}
