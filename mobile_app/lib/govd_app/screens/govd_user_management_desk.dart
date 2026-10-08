import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../models/official_model.dart';
import '../widgets/govd_theme.dart';
import '../widgets/govd_leadership_bar.dart';
import '../../widgets/location_selector_widget.dart';

class GovdUserManagementDesk extends StatefulWidget {
  const GovdUserManagementDesk({super.key});

  @override
  State<GovdUserManagementDesk> createState() => _GovdUserManagementDeskState();
}

class _GovdUserManagementDeskState extends State<GovdUserManagementDesk> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _searchQuery = '';
  String _selectedWardFilter = 'All';

  final List<Map<String, dynamic>> _citizensList = [
    {
      'id': 'CIT-1001',
      'name': 'श्री. ज्ञानेश्वर संभाजी मोरे',
      'phone': '9876543210',
      'houseNo': 'घर क्र. ४५',
      'wardNo': 'Ward 1',
      'gp': 'घुलेवाडी',
      'taluka': 'संगमनेर',
      'district': 'अहिल्यानगर',
      'aadhaarMasked': 'XXXX-XXXX-4521',
      'isVerified': true,
    },
    {
      'id': 'CIT-1002',
      'name': 'सौ. आशा विकास पाटील',
      'phone': '9855512345',
      'houseNo': 'घर क्र. १२',
      'wardNo': 'Ward 2',
      'gp': 'घुलेवाडी',
      'taluka': 'संगमनेर',
      'district': 'अहिल्यानगर',
      'aadhaarMasked': 'XXXX-XXXX-8912',
      'isVerified': true,
    },
    {
      'id': 'CIT-1003',
      'name': 'श्री. गणेश शांताराम कदम',
      'phone': '9822233445',
      'houseNo': 'घर क्र. ७८',
      'wardNo': 'Ward 3',
      'gp': 'घुलेवाडी',
      'taluka': 'संगमनेर',
      'district': 'अहिल्यानगर',
      'aadhaarMasked': 'XXXX-XXXX-7341',
      'isVerified': true,
    },
    {
      'id': 'CIT-1004',
      'name': 'श्री. राहुल बाजीराव थोरात',
      'phone': '9811122233',
      'houseNo': 'घर क्र. १०२',
      'wardNo': 'Ward 4',
      'gp': 'घुलेवाडी',
      'taluka': 'संगमनेर',
      'district': 'अहिल्यानगर',
      'aadhaarMasked': 'XXXX-XXXX-1190',
      'isVerified': true,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showRegisterCitizenSheet(BuildContext context) {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final aadhaarCtrl = TextEditingController();
    final houseCtrl = TextEditingController();
    final addressCtrl = TextEditingController();

    String selDistrict = 'अहिल्यानगर';
    String selTaluka = 'संगमनेर';
    String selGp = 'घुलेवाडी';
    String selWard = 'Ward 1 (गणपती चौक)';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (modalCtx, setModalState) {
          return Container(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.92,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 16,
              bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: GovdTheme.saffron.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.person_add_rounded, color: GovdTheme.saffron, size: 20),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'नवीन नागरिक / कर्मचारी नोंदणी',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                          ),
                          Text(
                            'Register Citizen with LGD Geo-Location',
                            style: TextStyle(fontSize: 11, color: GovdTheme.slateMedium),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Name
                        const Text('पूर्ण नाव (Full Name) *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        TextField(
                          controller: nameCtrl,
                          style: const TextStyle(fontSize: 13),
                          decoration: InputDecoration(
                            hintText: 'उदा. श्री. रमेश विठ्ठल पाटील',
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Phone & Aadhaar
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('मोबाईल क्र. *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  TextField(
                                    controller: phoneCtrl,
                                    keyboardType: TextInputType.phone,
                                    maxLength: 10,
                                    style: const TextStyle(fontSize: 13),
                                    decoration: InputDecoration(
                                      counterText: '',
                                      hintText: '९८XXXXXXXX',
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('आधार क्र. (Masked)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  TextField(
                                    controller: aadhaarCtrl,
                                    keyboardType: TextInputType.number,
                                    maxLength: 12,
                                    style: const TextStyle(fontSize: 13),
                                    decoration: InputDecoration(
                                      counterText: '',
                                      hintText: 'XXXX-XXXX-1234',
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Location & Ward Selector (All 28,097 Panchayats Live Search)
                        LocationSelectorWidget(
                          initialDistrict: selDistrict,
                          initialTaluka: selTaluka,
                          initialGramPanchayat: selGp,
                          initialWard: selWard,
                          showWard: true,
                          onChanged: (loc) {
                            selDistrict = loc.district;
                            selTaluka = loc.taluka;
                            selGp = loc.gramPanchayat;
                            selWard = loc.ward;
                          },
                        ),
                        const SizedBox(height: 12),

                        // House No & Street
                        Row(
                          children: [
                            Expanded(
                              flex: 1,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('घर क्र. *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  TextField(
                                    controller: houseCtrl,
                                    style: const TextStyle(fontSize: 13),
                                    decoration: InputDecoration(
                                      hintText: 'घर क्र. १२/अ',
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              flex: 2,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('पत्ता / परिसर *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  TextField(
                                    controller: addressCtrl,
                                    style: const TextStyle(fontSize: 13),
                                    decoration: InputDecoration(
                                      hintText: 'गणपती मंदिरामागे, नवी वस्ती',
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Submit Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: GovdTheme.saffron,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: () {
                              if (nameCtrl.text.trim().isEmpty || phoneCtrl.text.trim().isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('कृपया नाव आणि मोबाईल क्रमांक प्रविष्ट करा.')),
                                );
                                return;
                              }

                              final rawAadhaar = aadhaarCtrl.text.trim();
                              final masked = rawAadhaar.length >= 4
                                  ? 'XXXX-XXXX-${rawAadhaar.substring(rawAadhaar.length - 4)}'
                                  : 'XXXX-XXXX-4567';

                              setState(() {
                                _citizensList.insert(0, {
                                  'id': 'CIT-${1005 + _citizensList.length}',
                                  'name': nameCtrl.text.trim(),
                                  'phone': phoneCtrl.text.trim(),
                                  'houseNo': houseCtrl.text.trim().isNotEmpty ? houseCtrl.text.trim() : 'घर क्र. नवीन',
                                  'wardNo': selWard.split(' ').first,
                                  'gp': selGp,
                                  'taluka': selTaluka,
                                  'district': selDistrict,
                                  'aadhaarMasked': masked,
                                  'isVerified': true,
                                });
                              });

                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: GovdTheme.emeraldDark,
                                  content: Text('नागरिक ${nameCtrl.text.trim()} यशस्वीरीत्या नोंदणीकृत झाले!'),
                                ),
                              );
                            },
                            child: const Text('नोंदणी पूर्ण करा (Register Citizen)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final officials = app.officials;
    final user = app.currentUser;

    final filteredCitizens = _citizensList.where((c) {
      final matchesQuery = _searchQuery.isEmpty ||
          c['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          c['phone'].toString().contains(_searchQuery) ||
          c['houseNo'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesWard = _selectedWardFilter == 'All' || c['wardNo'] == _selectedWardFilter;
      return matchesQuery && matchesWard;
    }).toList();

    return Scaffold(
      backgroundColor: GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'नागरिक व पदाधिकारी नोंदणी कक्ष',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              '${user?.gramPanchayat ?? "ग्रामपंचायत"} • रोस्टर व डिरेक्टरी',
              style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: GovdTheme.gold,
          indicatorWeight: 3,
          labelColor: GovdTheme.gold,
          unselectedLabelColor: Colors.white.withOpacity(0.7),
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: '🏛️ पदाधिकारी व कर्मचारी'),
            Tab(text: '📱 गाव नागरिक डिरेक्टरी'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showRegisterCitizenSheet(context),
        backgroundColor: GovdTheme.saffron,
        icon: const Icon(Icons.person_add_rounded, color: Colors.white),
        label: const Text('नवीन नोंदणी', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Officials & Leadership Roster
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GovdLeadershipBar(
                  gpName: user?.gramPanchayat ?? 'घुलेवाडी',
                  talukaName: user?.taluka ?? 'संगमनेर',
                ),
                const SizedBox(height: 16),
                const Text(
                  'ग्रामपंचायत पदाधिकारी व सेवक सूची',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 8),
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: officials.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (ctx, i) {
                    final off = officials[i];
                    return _buildOfficialCard(off);
                  },
                ),
              ],
            ),
          ),

          // Tab 2: Village Citizen Directory with Filters
          Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: TextField(
                  onChanged: (v) => setState(() => _searchQuery = v),
                  decoration: InputDecoration(
                    hintText: 'नागरिकाचे नाव, मोबाईल किंवा घर क्र. शोधा...',
                    hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                    prefixIcon: const Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                  ),
                ),
              ),

              // Ward Filter Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Row(
                  children: [
                    _buildFilterChip('सर्व वॉर्ड', 'All'),
                    _buildFilterChip('वॉर्ड १', 'Ward 1'),
                    _buildFilterChip('वॉर्ड २', 'Ward 2'),
                    _buildFilterChip('वॉर्ड ३', 'Ward 3'),
                    _buildFilterChip('वॉर्ड ४', 'Ward 4'),
                  ],
                ),
              ),

              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                  itemCount: filteredCitizens.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (ctx, i) {
                    final c = filteredCitizens[i];
                    return _buildCitizenCard(
                      id: c['id'],
                      name: c['name'],
                      phone: c['phone'],
                      houseNo: c['houseNo'],
                      wardNo: c['wardNo'],
                      gp: c['gp'],
                      aadhaarMasked: c['aadhaarMasked'],
                      isVerified: c['isVerified'],
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedWardFilter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(label, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500, color: isSelected ? Colors.white : GovdTheme.navyDark)),
        selected: isSelected,
        selectedColor: GovdTheme.saffron,
        backgroundColor: Colors.white,
        showCheckmark: false,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: isSelected ? GovdTheme.saffron : Colors.grey.shade300)),
        onSelected: (_) {
          setState(() => _selectedWardFilter = value);
        },
      ),
    );
  }

  Widget _buildOfficialCard(VillageOfficialModel off) {
    final isElected = off.roleType == 'elected';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: isElected ? GovdTheme.goldLight : GovdTheme.lightBlue,
            backgroundImage: off.photoUrl != null ? NetworkImage(off.photoUrl!) : null,
            child: off.photoUrl == null
                ? Icon(
                    isElected ? Icons.workspace_premium : Icons.person,
                    color: isElected ? GovdTheme.goldDark : GovdTheme.primaryBlue,
                  )
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  off.nameMr,
                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 2),
                Text(
                  off.designationMr,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isElected ? GovdTheme.goldDark : GovdTheme.primaryBlue,
                  ),
                ),
                if (off.phone.isNotEmpty) ...[
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      const Icon(Icons.phone_rounded, size: 12, color: Color(0xFF64748B)),
                      const SizedBox(width: 4),
                      Text(off.phone, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                    ],
                  ),
                ],
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isElected ? const Color(0xFFFEF3C7) : const Color(0xFFEEF2FF),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              isElected ? 'लोकप्रतिनिधी' : 'प्रशासन',
              style: TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.bold,
                color: isElected ? GovdTheme.goldDark : const Color(0xFF3730A3),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCitizenCard({
    required String id,
    required String name,
    required String phone,
    required String houseNo,
    required String wardNo,
    required String gp,
    required String aadhaarMasked,
    required bool isVerified,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: const Color(0xFFF1F5F9),
            child: const Icon(Icons.person_rounded, size: 20, color: Color(0xFF64748B)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '$houseNo • $wardNo • $gp',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  'आधार: $aadhaarMasked | मो: $phone',
                  style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: GovdTheme.emeraldLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'OTP Verified',
              style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: GovdTheme.emeraldDark),
            ),
          ),
        ],
      ),
    );
  }
}
