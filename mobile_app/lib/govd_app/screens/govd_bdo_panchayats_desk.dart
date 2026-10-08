import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../widgets/govd_theme.dart';
import 'govd_grievances_desk.dart';
import 'govd_certificates_desk.dart';
import 'govd_tax_desk.dart';
import 'govd_projects_desk.dart';

class GovdBdoPanchayatsDesk extends StatefulWidget {
  const GovdBdoPanchayatsDesk({super.key});

  @override
  State<GovdBdoPanchayatsDesk> createState() => _GovdBdoPanchayatsDeskState();
}

class _GovdBdoPanchayatsDeskState extends State<GovdBdoPanchayatsDesk> {
  String _filter = 'all'; // 'all', 'active', 'attention'
  String _searchQuery = '';

  // Sample Maharashtra Block Panchayat Live Data
  final List<Map<String, dynamic>> _panchayats = [
    {
      'id': 'gp-ghulewadi',
      'nameMr': 'ग्रामपंचायत घुलेवाडी',
      'nameEn': 'Gram Panchayat Ghulewadi',
      'taluka': 'संगमनेर',
      'district': 'अहिल्यानगर',
      'isOnline': true,
      'citizens': 245,
      'openComplaints': 2,
      'pendingApprovals': 1,
      'taxCollectionRate': 82,
      'activeProjects': 3,
      'sarpanch': 'श्री. राहुल कदम',
      'gramSevak': 'श्री. विजय थोरात',
      'needsAttention': false,
    },
    {
      'id': 'gp-gunjalwadi',
      'nameMr': 'ग्रामपंचायत गुंजाळवाडी',
      'nameEn': 'Gram Panchayat Gunjalwadi',
      'taluka': 'संगमनेर',
      'district': 'अहिल्यानगर',
      'isOnline': true,
      'citizens': 180,
      'openComplaints': 1,
      'pendingApprovals': 0,
      'taxCollectionRate': 78,
      'activeProjects': 2,
      'sarpanch': 'सौ. सुनिता गुंजाळ',
      'gramSevak': 'श्री. सुनील शिंदे',
      'needsAttention': false,
    },
    {
      'id': 'gp-nimgaon',
      'nameMr': 'ग्रामपंचायत निमगाव बुद्रुक',
      'nameEn': 'Gram Panchayat Nimgaon Budruk',
      'taluka': 'संगमनेर',
      'district': 'अहिल्यानगर',
      'isOnline': true,
      'citizens': 310,
      'openComplaints': 4,
      'pendingApprovals': 3,
      'taxCollectionRate': 64,
      'activeProjects': 4,
      'sarpanch': 'श्री. ज्ञानेश्वर काकड',
      'gramSevak': 'श्री. रमेश शेळके',
      'needsAttention': true,
    },
    {
      'id': 'gp-chandnapuri',
      'nameMr': 'ग्रामपंचायत चंदनापुरी',
      'nameEn': 'Gram Panchayat Chandnapuri',
      'taluka': 'संगमनेर',
      'district': 'अहिल्यानगर',
      'isOnline': false,
      'citizens': 195,
      'openComplaints': 5,
      'pendingApprovals': 2,
      'taxCollectionRate': 58,
      'activeProjects': 1,
      'sarpanch': 'श्री. संजय वाकचौरे',
      'gramSevak': 'श्री. प्रकाश दिघे',
      'needsAttention': true,
    },
  ];

  void _openPanchayatDetails(BuildContext context, Map<String, dynamic> gp, bool isMr) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
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
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isMr ? gp['nameMr'] : gp['nameEn'],
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: GovdTheme.navyDark,
                        ),
                      ),
                      Text(
                        'ता. ${gp["taluka"]}, जि. ${gp["district"]}',
                        style: const TextStyle(fontSize: 12, color: GovdTheme.slateMedium),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: gp['isOnline']
                        ? GovdTheme.emerald.withOpacity(0.12)
                        : GovdTheme.rose.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: gp['isOnline'] ? GovdTheme.emerald : GovdTheme.rose,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: gp['isOnline'] ? GovdTheme.emerald : GovdTheme.rose,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        gp['isOnline']
                            ? (isMr ? 'ऑनलाइन' : 'Online')
                            : (isMr ? 'ऑफलाइन' : 'Offline'),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: gp['isOnline'] ? GovdTheme.emerald : GovdTheme.rose,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 10),

            // Key Leadership
            _buildLeadershipRow(
              icon: Icons.account_circle_rounded,
              label: isMr ? 'सरपंच:' : 'Sarpanch:',
              name: gp['sarpanch'],
            ),
            const SizedBox(height: 8),
            _buildLeadershipRow(
              icon: Icons.history_edu_rounded,
              label: isMr ? 'ग्रामसेवक:' : 'Gram Sevak:',
              name: gp['gramSevak'],
            ),
            const SizedBox(height: 16),

            // Metrics Grid
            Row(
              children: [
                Expanded(
                  child: _buildDetailMetric(
                    label: isMr ? 'नागरिक' : 'Citizens',
                    value: '${gp["citizens"]}',
                    icon: Icons.people_alt_rounded,
                    color: GovdTheme.primaryBlue,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildDetailMetric(
                    label: isMr ? 'तक्रारी' : 'Complaints',
                    value: '${gp["openComplaints"]}',
                    icon: Icons.report_problem_rounded,
                    color: GovdTheme.rose,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildDetailMetric(
                    label: isMr ? 'कर वसुली' : 'Tax %',
                    value: '${gp["taxCollectionRate"]}%',
                    icon: Icons.currency_rupee_rounded,
                    color: GovdTheme.emerald,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Quick Inspection Actions
            const Text(
              'प्रशासकीय तपासणी पर्याय',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGrievancesDesk()));
                    },
                    icon: const Icon(Icons.report_problem_outlined, size: 16),
                    label: Text(isMr ? 'तक्रारी तपासा' : 'Complaints', style: const TextStyle(fontSize: 12)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: GovdTheme.navyDark,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk()));
                    },
                    icon: const Icon(Icons.fact_check_outlined, size: 16),
                    label: Text(isMr ? 'दाखले मंजुरी' : 'Approvals', style: const TextStyle(fontSize: 12)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: GovdTheme.saffron,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdProjectsDesk()));
                },
                icon: const Icon(Icons.engineering_outlined, size: 16),
                label: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(isMr ? 'विकासकामे पाहणी (Development Works)' : 'View Development Works'),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: GovdTheme.navyDark,
                  side: const BorderSide(color: GovdTheme.navyDark),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildLeadershipRow({required IconData icon, required String label, required String name}) {
    return Row(
      children: [
        Icon(icon, size: 16, color: GovdTheme.slateMedium),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: GovdTheme.slateMedium)),
        const SizedBox(width: 6),
        Expanded(
          child: Text(name, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: GovdTheme.navyDark)),
        ),
      ],
    );
  }

  Widget _buildDetailMetric({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: color)),
          Text(label, style: const TextStyle(fontSize: 10, color: GovdTheme.slateMedium), maxLines: 1),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isMr = app.language == 'mr';

    final filteredList = _panchayats.where((gp) {
      if (_filter == 'active' && !gp['isOnline']) return false;
      if (_filter == 'attention' && !gp['needsAttention']) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final nameMr = (gp['nameMr'] as String).toLowerCase();
        final nameEn = (gp['nameEn'] as String).toLowerCase();
        if (!nameMr.contains(q) && !nameEn.contains(q)) return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isMr ? 'तालुका ग्रामपंचायती यादी' : 'Taluka Gram Panchayats',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              isMr ? 'संगमनेर गटविकास नियंत्रण • BDO Desk' : 'Sangamner Block Development Control',
              style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search & Filters Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            color: GovdTheme.navyMedium,
            child: Column(
              children: [
                // Search Input
                TextField(
                  onChanged: (v) => setState(() => _searchQuery = v),
                  style: const TextStyle(fontSize: 13, color: Colors.white),
                  decoration: InputDecoration(
                    hintText: isMr ? 'ग्रामपंचायतीचे नाव शोधा...' : 'Search Gram Panchayat...',
                    hintStyle: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12.5),
                    prefixIcon: const Icon(Icons.search_rounded, color: GovdTheme.gold, size: 20),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.12),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Filter Tabs
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  child: Row(
                    children: [
                      _buildFilterChip('all', isMr ? 'सर्व (${_panchayats.length})' : 'All (${_panchayats.length})'),
                      const SizedBox(width: 8),
                      _buildFilterChip('active', isMr ? '🟢 सक्रिय (Active)' : '🟢 Active'),
                      const SizedBox(width: 8),
                      _buildFilterChip('attention', isMr ? '⚠️ लक्ष द्या (Attention)' : '⚠️ Needs Attention'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Panchayat Cards List
          Expanded(
            child: filteredList.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.domain_disabled_rounded, size: 48, color: GovdTheme.slateLight),
                        const SizedBox(height: 10),
                        Text(
                          isMr ? 'कोणतीही ग्रामपंचायत सापडली नाही' : 'No Gram Panchayat found',
                          style: const TextStyle(color: GovdTheme.slateMedium, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(14),
                    itemCount: filteredList.length,
                    itemBuilder: (context, index) {
                      final gp = filteredList[index];
                      return _buildPanchayatCard(gp, isMr);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _filter == value;
    return InkWell(
      onTap: () => setState(() => _filter = value),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? GovdTheme.gold : Colors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
            color: isSelected ? GovdTheme.navyDark : Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildPanchayatCard(Map<String, dynamic> gp, bool isMr) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: gp['needsAttention'] ? GovdTheme.rose.withOpacity(0.4) : Colors.grey.shade200,
          width: gp['needsAttention'] ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: GovdTheme.navyDark.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.account_balance_rounded, color: GovdTheme.navyDark, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isMr ? gp['nameMr'] : gp['nameEn'],
                            style: const TextStyle(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w800,
                              color: GovdTheme.navyDark,
                            ),
                          ),
                          Text(
                            'ता. ${gp["taluka"]} • सरपंच: ${gp["sarpanch"]}',
                            style: const TextStyle(fontSize: 10.5, color: GovdTheme.slateMedium),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: gp['isOnline']
                      ? GovdTheme.emerald.withOpacity(0.12)
                      : GovdTheme.rose.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: gp['isOnline'] ? GovdTheme.emerald : GovdTheme.rose,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      gp['isOnline']
                          ? (isMr ? 'ऑनलाइन' : 'Online')
                          : (isMr ? 'ऑफलाइन' : 'Offline'),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: gp['isOnline'] ? GovdTheme.emerald : GovdTheme.rose,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // 4 Metric Chips
          Row(
            children: [
              _buildMetricChip(isMr ? 'नागरिक:' : 'Citizens:', '${gp["citizens"]}', GovdTheme.primaryBlue),
              const SizedBox(width: 6),
              _buildMetricChip(isMr ? 'तक्रारी:' : 'Complaints:', '${gp["openComplaints"]}', GovdTheme.rose),
              const SizedBox(width: 6),
              _buildMetricChip(isMr ? 'प्रलंबित:' : 'Approvals:', '${gp["pendingApprovals"]}', GovdTheme.gold),
              const SizedBox(width: 6),
              _buildMetricChip(isMr ? 'कर वसुली:' : 'Tax:', '${gp["taxCollectionRate"]}%', GovdTheme.emerald),
            ],
          ),
          const SizedBox(height: 12),

          // Action Button
          SizedBox(
            width: double.infinity,
            height: 38,
            child: ElevatedButton(
              onPressed: () => _openPanchayatDetails(context, gp, isMr),
              style: ElevatedButton.styleFrom(
                backgroundColor: GovdTheme.navyDark,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  isMr ? 'पंचायत उघडा (Open Panchayat) →' : 'Open Panchayat →',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricChip(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 2),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: color)),
            ),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(label, style: const TextStyle(fontSize: 8.5, color: Color(0xFF64748B)), maxLines: 1),
            ),
          ],
        ),
      ),
    );
  }
}
