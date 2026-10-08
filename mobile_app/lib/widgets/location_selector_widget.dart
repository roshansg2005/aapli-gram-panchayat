import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../models/geo_model.dart';
import '../services/geo_service.dart';
import '../config/locations.dart';
import '../config/theme.dart';

class LocationSelectionData {
  final String state;
  final String district;
  final String? districtCode;
  final String taluka;
  final String? talukaCode;
  final String gramPanchayat;
  final String? gramPanchayatCode;
  final String ward;

  LocationSelectionData({
    required this.state,
    required this.district,
    this.districtCode,
    required this.taluka,
    this.talukaCode,
    required this.gramPanchayat,
    this.gramPanchayatCode,
    required this.ward,
  });
}

class LocationSelectorWidget extends StatefulWidget {
  final String? initialDistrict;
  final String? initialTaluka;
  final String? initialGramPanchayat;
  final String? initialWard;
  final bool showWard;
  final bool isDark;
  final ValueChanged<LocationSelectionData> onChanged;

  const LocationSelectorWidget({
    super.key,
    this.initialDistrict,
    this.initialTaluka,
    this.initialGramPanchayat,
    this.initialWard,
    this.showWard = true,
    this.isDark = false,
    required this.onChanged,
  });

  @override
  State<LocationSelectorWidget> createState() => _LocationSelectorWidgetState();
}

class _LocationSelectorWidgetState extends State<LocationSelectorWidget> {
  final GeoService _geo = GeoService();

  List<DistrictModel> _districts = [];
  List<TalukaModel> _talukas = [];
  List<GramPanchayatModel> _panchayats = [];
  List<String> _wards = [
    'Ward 1 (गणपती चौक)',
    'Ward 2 (मारुती मंदिर)',
    'Ward 3 (बाजारपेठ)',
    'Ward 4 (गावठाण)',
    'Ward 5 (नवी वस्ती)',
    'Ward 6 (शाळा परिसर)'
  ];

  String _selectedDistrictCode = '466'; // Ahilyanagar default
  String _selectedDistrictName = 'अहिल्यानगर';
  String _selectedDistrictNameEn = 'Ahilyanagar';

  String _selectedTalukaCode = '4202'; // Sangamner default
  String _selectedTalukaName = 'संगमनेर';
  String _selectedTalukaNameEn = 'Sangamner';

  String _selectedPanCode = '';
  String _selectedPanName = 'घुलेवाडी';
  String _selectedPanNameEn = 'Ghulewadi';

  String _selectedWard = 'Ward 1 (गणपती चौक)';

  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;
  List<LocationSearchResult> _searchResults = [];
  bool _isSearching = false;
  bool _isLoadingGps = false;

  @override
  void initState() {
    super.initState();
    _initDefaults();
    _loadLocationData();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _initDefaults() {
    if (widget.initialDistrict != null && widget.initialDistrict!.isNotEmpty) {
      _selectedDistrictName = widget.initialDistrict!;
      _selectedDistrictNameEn = widget.initialDistrict!;
    }
    if (widget.initialTaluka != null && widget.initialTaluka!.isNotEmpty) {
      _selectedTalukaName = widget.initialTaluka!;
      _selectedTalukaNameEn = widget.initialTaluka!;
    }
    if (widget.initialGramPanchayat != null && widget.initialGramPanchayat!.isNotEmpty) {
      _selectedPanName = widget.initialGramPanchayat!;
      _selectedPanNameEn = widget.initialGramPanchayat!;
    }
    if (widget.initialWard != null && widget.initialWard!.isNotEmpty) {
      _selectedWard = widget.initialWard!;
    }
  }

  Future<void> _loadLocationData() async {
    // 1. Load All 36 Districts
    final allDistricts = await _geo.getDistricts();
    if (!mounted) return;

    setState(() {
      _districts = allDistricts;
    });

    // Match initial district
    DistrictModel matchedDist;
    try {
      matchedDist = allDistricts.firstWhere(
        (d) => d.nameMr.contains(_selectedDistrictName) ||
            d.nameEn.toLowerCase() == _selectedDistrictName.toLowerCase() ||
            d.code == _selectedDistrictCode,
      );
    } catch (_) {
      matchedDist = allDistricts.isNotEmpty ? allDistricts.first : DistrictModel(code: '466', nameEn: 'Ahilyanagar', nameMr: 'अहिल्यानगर');
    }

    _selectedDistrictCode = matchedDist.code;
    _selectedDistrictName = matchedDist.nameMr;
    _selectedDistrictNameEn = matchedDist.nameEn;

    await _loadTalukasForDistrict(matchedDist.code, preserveTaluka: true);
  }

  Future<void> _loadTalukasForDistrict(String districtCode, {bool preserveTaluka = false}) async {
    final talukas = await _geo.getTalukas(districtCode);
    if (!mounted) return;

    setState(() {
      _talukas = talukas;
    });

    TalukaModel targetTal;
    if (preserveTaluka && talukas.isNotEmpty) {
      try {
        targetTal = talukas.firstWhere(
          (t) => t.nameMr.contains(_selectedTalukaName) ||
              t.nameEn.toLowerCase() == _selectedTalukaName.toLowerCase() ||
              t.code == _selectedTalukaCode,
        );
      } catch (_) {
        targetTal = talukas.first;
      }
    } else {
      targetTal = talukas.isNotEmpty ? talukas.first : TalukaModel(code: '4202', districtCode: districtCode, nameEn: 'Sangamner', nameMr: 'संगमनेर');
    }

    setState(() {
      _selectedTalukaCode = targetTal.code;
      _selectedTalukaName = targetTal.nameMr;
      _selectedTalukaNameEn = targetTal.nameEn;
    });

    await _loadPanchayatsForTaluka(targetTal.code, preserveGp: preserveTaluka);
  }

  Future<void> _loadPanchayatsForTaluka(String talukaCode, {bool preserveGp = false}) async {
    setState(() => _isLoadingGps = true);
    final gps = await _geo.getPanchayats(talukaCode);
    if (!mounted) return;

    setState(() {
      _isLoadingGps = false;
      _panchayats = gps;
    });

    GramPanchayatModel targetGp;
    if (preserveGp && gps.isNotEmpty) {
      try {
        targetGp = gps.firstWhere(
          (g) => g.nameMr.contains(_selectedPanName) ||
              g.nameEn.toLowerCase() == _selectedPanName.toLowerCase() ||
              g.code == _selectedPanCode,
        );
      } catch (_) {
        targetGp = gps.first;
      }
    } else {
      targetGp = gps.isNotEmpty ? gps.first : GramPanchayatModel(code: '168532', talukaCode: talukaCode, districtCode: _selectedDistrictCode, nameEn: 'Ghulewadi', nameMr: 'घुलेवाडी', wards: []);
    }

    setState(() {
      _selectedPanCode = targetGp.code;
      _selectedPanName = targetGp.nameMr;
      _selectedPanNameEn = targetGp.nameEn;
      _wards = targetGp.wards.isNotEmpty
          ? targetGp.wards
          : [
              'Ward 1 (गणपती चौक)',
              'Ward 2 (मारुती मंदिर)',
              'Ward 3 (बाजारपेठ)',
              'Ward 4 (गावठाण)',
              'Ward 5 (नवी वस्ती)',
              'Ward 6 (शाळा परिसर)',
            ];
      _selectedWard = _wards.contains(_selectedWard) ? _selectedWard : _wards.first;
    });

    _notifyChange();
  }

  void _notifyChange() {
    widget.onChanged(LocationSelectionData(
      state: 'Maharashtra',
      district: _selectedDistrictName,
      districtCode: _selectedDistrictCode,
      taluka: _selectedTalukaName,
      talukaCode: _selectedTalukaCode,
      gramPanchayat: _selectedPanName,
      gramPanchayatCode: _selectedPanCode,
      ward: _selectedWard,
    ));
  }

  void _onLiveSearchChanged(String query) {
    _debounceTimer?.cancel();
    if (query.trim().length < 2) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }

    setState(() => _isSearching = true);
    _debounceTimer = Timer(const Duration(milliseconds: 200), () async {
      final results = await _geo.searchLocations(query.trim());
      if (!mounted) return;

      setState(() {
        _searchResults = results;
        _isSearching = false;
      });
    });
  }

  Future<void> _selectSearchResult(LocationSearchResult res) async {
    _searchController.clear();
    setState(() {
      _searchResults = [];
      _isSearching = false;
    });

    // 1. Set district
    _selectedDistrictCode = res.districtCode;
    _selectedDistrictName = res.districtNameMr.isNotEmpty ? res.districtNameMr : res.districtNameEn;
    _selectedDistrictNameEn = res.districtNameEn.isNotEmpty ? res.districtNameEn : res.districtNameMr;

    // 2. Set taluka
    _selectedTalukaCode = res.talukaCode;
    _selectedTalukaName = res.talukaNameMr.isNotEmpty ? res.talukaNameMr : res.talukaNameEn;
    _selectedTalukaNameEn = res.talukaNameEn.isNotEmpty ? res.talukaNameEn : res.talukaNameMr;

    // 3. Set GP
    _selectedPanCode = res.gpCode;
    _selectedPanName = res.gpNameMr.isNotEmpty ? res.gpNameMr : res.gpNameEn;
    _selectedPanNameEn = res.gpNameEn.isNotEmpty ? res.gpNameEn : res.gpNameMr;

    // Load full lists in background so pickers are in sync
    if (_selectedDistrictCode.isNotEmpty) {
      await _loadTalukasForDistrict(_selectedDistrictCode, preserveTaluka: true);
    }
    if (_selectedTalukaCode.isNotEmpty) {
      await _loadPanchayatsForTaluka(_selectedTalukaCode, preserveGp: true);
    }

    _notifyChange();
  }

  Future<void> _pickDistrictDialog() async {
    final language = context.read<AppProvider>().language;
    final isMr = language == 'mr';

    final picked = await _showSearchablePicker(
      title: isMr ? 'जिल्हा निवडा (Select District)' : 'Select District',
      searchHint: isMr ? 'जिल्ह्याचे नाव शोधा (३६ जिल्हे)...' : 'Search 36 districts of Maharashtra...',
      items: _districts.map((d) => d.code).toList(),
      itemLabels: {for (var d in _districts) d.code: isMr ? d.nameMr : d.nameEn},
      selectedCode: _selectedDistrictCode,
    );

    if (picked != null && picked != _selectedDistrictCode) {
      final found = _districts.firstWhere((d) => d.code == picked, orElse: () => _districts.first);
      setState(() {
        _selectedDistrictCode = found.code;
        _selectedDistrictName = found.nameMr;
        _selectedDistrictNameEn = found.nameEn;
      });
      await _loadTalukasForDistrict(found.code, preserveTaluka: false);
    }
  }

  Future<void> _pickTalukaDialog() async {
    final language = context.read<AppProvider>().language;
    final isMr = language == 'mr';

    final picked = await _showSearchablePicker(
      title: isMr ? '$_selectedDistrictName - तालुका निवडा' : 'Select Taluka ($_selectedDistrictNameEn)',
      searchHint: isMr ? 'तालुका शोधा...' : 'Search taluka...',
      items: _talukas.map((t) => t.code).toList(),
      itemLabels: {for (var t in _talukas) t.code: isMr ? t.nameMr : t.nameEn},
      selectedCode: _selectedTalukaCode,
    );

    if (picked != null && picked != _selectedTalukaCode) {
      final found = _talukas.firstWhere((t) => t.code == picked, orElse: () => _talukas.first);
      setState(() {
        _selectedTalukaCode = found.code;
        _selectedTalukaName = found.nameMr;
        _selectedTalukaNameEn = found.nameEn;
      });
      await _loadPanchayatsForTaluka(found.code, preserveGp: false);
    }
  }

  Future<void> _pickGramPanchayatDialog() async {
    final language = context.read<AppProvider>().language;
    final isMr = language == 'mr';

    final picked = await _showSearchablePicker(
      title: isMr ? '$_selectedTalukaName - ग्रामपंचायत निवडा' : 'Select Gram Panchayat ($_selectedTalukaNameEn)',
      searchHint: isMr ? 'गावाचे / ग्रामपंचायतीचे नाव शोधा...' : 'Search village / Gram Panchayat...',
      items: _panchayats.map((g) => g.code).toList(),
      itemLabels: {for (var g in _panchayats) g.code: isMr ? g.nameMr : g.nameEn},
      selectedCode: _selectedPanCode,
    );

    if (picked != null && picked != _selectedPanCode) {
      final found = _panchayats.firstWhere((g) => g.code == picked, orElse: () => _panchayats.first);
      setState(() {
        _selectedPanCode = found.code;
        _selectedPanName = found.nameMr;
        _selectedPanNameEn = found.nameEn;
        _wards = found.wards.isNotEmpty
            ? found.wards
            : [
                'Ward 1 (गणपती चौक)',
                'Ward 2 (मारुती मंदिर)',
                'Ward 3 (बाजारपेठ)',
                'Ward 4 (गावठाण)',
                'Ward 5 (नवी वस्ती)',
                'Ward 6 (शाळा परिसर)',
              ];
        _selectedWard = _wards.first;
      });
      _notifyChange();
    }
  }

  Future<void> _pickWardDialog() async {
    final language = context.read<AppProvider>().language;
    final isMr = language == 'mr';

    final picked = await _showSearchablePicker(
      title: isMr ? 'प्रभाग / वॉर्ड निवडा' : 'Select Ward',
      searchHint: isMr ? 'वॉर्ड शोधा...' : 'Search ward...',
      items: _wards,
      itemLabels: {for (var w in _wards) w: w},
      selectedCode: _selectedWard,
    );

    if (picked != null) {
      setState(() {
        _selectedWard = picked;
      });
      _notifyChange();
    }
  }

  Future<String?> _showSearchablePicker({
    required String title,
    required String searchHint,
    required List<String> items,
    required Map<String, String> itemLabels,
    required String selectedCode,
  }) async {
    String modalQuery = '';

    return showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: widget.isDark ? const Color(0xFF0F172A) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final filtered = items.where((code) {
              final label = itemLabels[code] ?? code;
              return label.toLowerCase().contains(modalQuery.toLowerCase()) || code.toLowerCase().contains(modalQuery.toLowerCase());
            }).toList();

            return SafeArea(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.85,
                ),
                child: Padding(
                  padding: EdgeInsets.only(
                    left: 20,
                    right: 20,
                    top: 14,
                    bottom: MediaQuery.of(context).viewInsets.bottom + 16,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 42,
                          height: 4,
                          decoration: BoxDecoration(
                            color: widget.isDark ? Colors.grey.shade700 : Colors.grey.shade300,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              title,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                color: widget.isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF7ED), // Orange 50
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFFEDD5)),
                            ),
                            child: Text(
                              '${filtered.length} उपलब्ध',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFEA580C),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        onChanged: (v) => setModalState(() => modalQuery = v),
                        style: TextStyle(fontSize: 13, color: widget.isDark ? Colors.white : const Color(0xFF0F172A)),
                        decoration: InputDecoration(
                          hintText: searchHint,
                          prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.primaryOrange, size: 20),
                          filled: true,
                          fillColor: widget.isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Flexible(
                        child: ListView.separated(
                          shrinkWrap: true,
                          itemCount: filtered.length,
                          separatorBuilder: (_, __) => Divider(
                            height: 1,
                            color: widget.isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                          ),
                          itemBuilder: (context, index) {
                            final code = filtered[index];
                            final label = itemLabels[code] ?? code;
                            final isSelected = code == selectedCode;

                            return ListTile(
                              dense: true,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              title: Text(
                                label,
                                style: TextStyle(
                                  fontSize: 13.5,
                                  fontWeight: isSelected ? FontWeight.w900 : FontWeight.w500,
                                  color: isSelected
                                      ? AppTheme.primaryOrange
                                      : (widget.isDark ? Colors.white : const Color(0xFF0F172A)),
                                ),
                              ),
                              trailing: isSelected
                                  ? const Icon(Icons.check_circle_rounded, color: AppTheme.primaryOrange, size: 20)
                                  : null,
                              onTap: () => Navigator.pop(ctx, code),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final language = context.watch<AppProvider>().language;
    final isMr = language == 'mr';

    final cardBg = widget.isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC);
    final borderColor = widget.isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final fieldBg = widget.isDark ? const Color(0xFF0F172A) : Colors.white;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Header: Title and Live DB Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, color: AppTheme.primaryOrange, size: 18),
                  const SizedBox(width: 6),
                  Text(
                    isMr ? 'प्रशासकीय स्थान व प्रभाग निवडा:' : 'Select Location & Ward:',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w800,
                      color: widget.isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.storage_rounded, size: 11, color: Color(0xFF047857)),
                    SizedBox(width: 4),
                    Text(
                      'LGD Live DB (२८,०९७ GP)',
                      style: TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF047857),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // 2. Direct Search across 28,097 Maharashtra Panchayats
          Stack(
            clipBehavior: Clip.none,
            children: [
              TextField(
                controller: _searchController,
                onChanged: _onLiveSearchChanged,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: widget.isDark ? Colors.white : const Color(0xFF0F172A),
                ),
                decoration: InputDecoration(
                  hintText: isMr
                      ? '⚡ महाराष्ट्रातील २८,०९७ ग्रामपंचायतींमधून थेट शोधा...'
                      : '⚡ Search directly across 28,097 Maharashtra Panchayats...',
                  hintStyle: TextStyle(
                    fontSize: 11.5,
                    color: widget.isDark ? Colors.grey.shade500 : Colors.grey.shade500,
                  ),
                  prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.primaryOrange, size: 20),
                  suffixIcon: _isSearching
                      ? const Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryOrange),
                          ),
                        )
                      : _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.close_rounded, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _searchResults = []);
                              },
                            )
                          : null,
                  filled: true,
                  fillColor: fieldBg,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: widget.isDark ? Colors.grey.shade700 : Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppTheme.primaryOrange, width: 1.5),
                  ),
                ),
              ),

              // Search Results Dropdown List
              if (_searchResults.isNotEmpty)
                Positioned(
                  top: 50,
                  left: 0,
                  right: 0,
                  child: Material(
                    elevation: 10,
                    borderRadius: BorderRadius.circular(14),
                    color: widget.isDark ? const Color(0xFF0F172A) : Colors.white,
                    child: Container(
                      constraints: const BoxConstraints(maxHeight: 240),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.primaryOrange.withOpacity(0.3)),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryOrange.withOpacity(0.08),
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  isMr ? '${_searchResults.length} ग्रामपंचायती सापडल्या:' : 'Found ${_searchResults.length} Gram Panchayats:',
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange),
                                ),
                                const Icon(Icons.check_circle_outline_rounded, size: 14, color: AppTheme.primaryOrange),
                              ],
                            ),
                          ),
                          Flexible(
                            child: ListView.separated(
                              shrinkWrap: true,
                              padding: EdgeInsets.zero,
                              itemCount: _searchResults.length,
                              separatorBuilder: (_, __) => Divider(
                                height: 1,
                                color: widget.isDark ? Colors.grey.shade800 : Colors.grey.shade200,
                              ),
                              itemBuilder: (ctx, i) {
                                final res = _searchResults[i];
                                final gpDisplay = isMr ? res.gpNameMr : res.gpNameEn;
                                final talDisplay = isMr ? res.talukaNameMr : res.talukaNameEn;
                                final distDisplay = isMr ? res.districtNameMr : res.districtNameEn;

                                return ListTile(
                                  dense: true,
                                  title: Text(
                                    gpDisplay.isNotEmpty ? 'ग्रामपंचायत $gpDisplay' : res.gpNameEn,
                                    style: TextStyle(
                                      fontSize: 12.5,
                                      fontWeight: FontWeight.w800,
                                      color: widget.isDark ? Colors.white : const Color(0xFF0F172A),
                                    ),
                                  ),
                                  subtitle: Text(
                                    isMr
                                        ? 'ता. $talDisplay, जि. $distDisplay'
                                        : 'Taluka: $talDisplay, Dist: $distDisplay',
                                    style: TextStyle(
                                      fontSize: 10.5,
                                      color: widget.isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                                    ),
                                  ),
                                  trailing: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryOrange.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      isMr ? 'निवडा' : 'Select',
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.primaryOrange,
                                      ),
                                    ),
                                  ),
                                  onTap: () => _selectSearchResult(res),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // 3. Selected Gram Panchayat Highlight Card
          if (_selectedPanName.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFBEB), // Amber 50
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFDE68A)), // Amber 200
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.apartment_rounded, color: Color(0xFFD97706), size: 16),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isMr ? 'सध्या निवडलेली ग्रामपंचायत:' : 'Selected Gram Panchayat:',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFB45309),
                          ),
                        ),
                        Text(
                          isMr ? 'ग्रामपंचायत $_selectedPanName' : _selectedPanNameEn,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Active',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF15803D),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          // 4. Dropdowns Grid
          // Row 1: State & District
          Row(
            children: [
              // 1. State (Locked)
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel(isMr ? '१. राज्य (State) *' : '1. State *'),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                      decoration: BoxDecoration(
                        color: widget.isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: widget.isDark ? Colors.grey.shade700 : Colors.grey.shade300),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              isMr ? 'महाराष्ट्र' : 'Maharashtra',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: widget.isDark ? Colors.grey.shade300 : Colors.grey.shade800,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Icon(Icons.lock_outline_rounded, size: 14, color: Colors.grey.shade500),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),

              // 2. District (36)
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel(isMr ? '२. जिल्हा (${_districts.length}) *' : '2. District (${_districts.length}) *'),
                    const SizedBox(height: 4),
                    _buildPickerTile(
                      label: isMr ? _selectedDistrictName : _selectedDistrictNameEn,
                      onTap: _pickDistrictDialog,
                      fieldBg: fieldBg,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Row 2: Taluka & Gram Panchayat
          Row(
            children: [
              // 3. Taluka
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel(isMr ? '३. तालुका (${_talukas.length}) *' : '3. Taluka (${_talukas.length}) *'),
                    const SizedBox(height: 4),
                    _buildPickerTile(
                      label: isMr ? _selectedTalukaName : _selectedTalukaNameEn,
                      onTap: _pickTalukaDialog,
                      fieldBg: fieldBg,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),

              // 4. Gram Panchayat
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFieldLabel(
                      _isLoadingGps
                          ? (isMr ? '४. ग्रामपंचायत (लोडिंग...)' : '4. GP (Loading...)')
                          : (isMr ? '४. ग्रामपंचायत (${_panchayats.length}) *' : '4. Gram Panchayat (${_panchayats.length}) *'),
                      isHighlighted: true,
                    ),
                    const SizedBox(height: 4),
                    _buildPickerTile(
                      label: _selectedPanName.isNotEmpty ? _selectedPanName : 'निवडा',
                      onTap: _pickGramPanchayatDialog,
                      fieldBg: const Color(0xFFFFFBEB),
                      borderColor: const Color(0xFFFDE68A),
                      isHighlighted: true,
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Row 3: Ward / Area (Optional)
          if (widget.showWard) ...[
            const SizedBox(height: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildFieldLabel(isMr ? '५. वॉर्ड / प्रभाग (Ward / Area) *' : '5. Ward / Area *'),
                const SizedBox(height: 4),
                _buildPickerTile(
                  label: _selectedWard,
                  onTap: _pickWardDialog,
                  fieldBg: fieldBg,
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFieldLabel(String text, {bool isHighlighted = false}) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 10.5,
        fontWeight: FontWeight.w800,
        color: isHighlighted
            ? AppTheme.primaryOrange
            : (widget.isDark ? Colors.grey.shade300 : const Color(0xFF475569)),
      ),
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildPickerTile({
    required String label,
    required VoidCallback onTap,
    required Color fieldBg,
    Color? borderColor,
    bool isHighlighted = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: fieldBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: borderColor ?? (widget.isDark ? Colors.grey.shade700 : Colors.grey.shade300),
            width: isHighlighted ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: isHighlighted ? FontWeight.w900 : FontWeight.w600,
                  color: isHighlighted ? const Color(0xFF9A3412) : (widget.isDark ? Colors.white : const Color(0xFF0F172A)),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: isHighlighted ? AppTheme.primaryOrange : Colors.grey.shade600),
          ],
        ),
      ),
    );
  }
}
