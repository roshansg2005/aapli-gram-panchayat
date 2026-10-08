import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/status_badge.dart';
import 'lodge_grievance_screen.dart';

class GrievancesListScreen extends StatefulWidget {
  final bool showBackButton;
  const GrievancesListScreen({super.key, this.showBackButton = false});

  @override
  State<GrievancesListScreen> createState() => _GrievancesListScreenState();
}

class _GrievancesListScreenState extends State<GrievancesListScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _categories = [
    {
      'id': 'water',
      'titleMr': 'पाणीपुरवठा व जलसंधारण',
      'titleEn': 'Water Supply',
      'icon': Icons.water_drop_rounded,
      'color': const Color(0xFF2563EB),
      'desc': 'पाणीपुरवठा खंडित, गळती, दूषित पाणी',
    },
    {
      'id': 'electricity',
      'titleMr': 'पथदिवे व वीज समस्या',
      'titleEn': 'Streetlights & Power',
      'icon': Icons.lightbulb_rounded,
      'color': const Color(0xFFD97706),
      'desc': 'बंद पथदिवे, तुटलेली वीजतार, नवीन पोल',
    },
    {
      'id': 'sanitation',
      'titleMr': 'कचरा व स्वच्छता',
      'titleEn': 'Garbage & Sanitation',
      'icon': Icons.delete_sweep_rounded,
      'color': const Color(0xFF059669),
      'desc': 'कचरा उचलणे, सार्वजनिक गटार स्वच्छता',
    },
    {
      'id': 'roads',
      'titleMr': 'रस्ते, खड्डे व गटारे',
      'titleEn': 'Roads, Potholes & Drains',
      'icon': Icons.construction_rounded,
      'color': const Color(0xFFEA580C),
      'desc': 'रस्त्यावरील खड्डे, डांबरीकरण, बंद गटार',
    },
    {
      'id': 'encroachment',
      'titleMr': 'अतिक्रमण व रस्ता अडथळा',
      'titleEn': 'Encroachments',
      'icon': Icons.warning_amber_rounded,
      'color': const Color(0xFFDC2626),
      'desc': 'सार्वजनिक रस्त्यावरील अतिक्रमण तक्रार',
    },
    {
      'id': 'health',
      'titleMr': 'धुरफवारणी व आरोग्य',
      'titleEn': 'Health & Fogging',
      'icon': Icons.health_and_safety_rounded,
      'color': const Color(0xFF7C3AED),
      'desc': 'डास निर्मूलन, धुरफवारणी, औषध फवारणी',
    },
    {
      'id': 'other',
      'titleMr': 'इतर तक्रार / समस्या',
      'titleEn': 'Other Complaints',
      'icon': Icons.help_outline_rounded,
      'color': const Color(0xFF475569),
      'desc': 'इतर प्रशासकीय व नागरी समस्या',
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

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isMr = app.language == 'mr';
    final isDark = app.isDarkMode;
    final grievances = app.grievances;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9),
      appBar: CustomGovAppBar(
        title: app.tr('serviceGrievances'),
        showBackButton: widget.showBackButton,
      ),
      body: Column(
        children: [
          // 2-Tab Navigation Bar: [ Lodge Issue ] [ My Complaints ]
          Container(
            color: isDark ? const Color(0xFF131C2E) : Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: AppTheme.primaryOrange,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryOrange.withOpacity(0.3),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                labelColor: Colors.white,
                unselectedLabelColor: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                labelStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800),
                unselectedLabelStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                tabs: [
                  Tab(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.add_alert_rounded, size: 15),
                        const SizedBox(width: 4),
                        Flexible(
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(isMr ? 'तक्रार नोंदवा' : 'Lodge Issue'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Tab(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.checklist_rounded, size: 15),
                        const SizedBox(width: 4),
                        Flexible(
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text('${isMr ? "माझ्या तक्रारी" : "My Issues"} (${grievances.length})'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Tab 1: Categories & Lodge Complaint Entry
                _buildCategoriesTab(context, app, isMr, isDark),

                // Tab 2: My Complaints Timeline
                _buildMyComplaintsTab(context, app, grievances, isMr, isDark),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoriesTab(BuildContext context, AppProvider app, bool isMr, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Top Info Box
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFC2410C), Color(0xFF7C2D12)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFC2410C).withOpacity(0.25),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.support_agent_rounded, color: Color(0xFFFDE68A), size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isMr ? '२४ ते ४८ तासांत तत्पर निवारण' : 'Prompt 24-48h Resolution',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isMr
                          ? 'पाणी, वीज, कचरा किंवा रस्त्याची समस्या थेट ग्रामपंचायतीकडे नोंदवा.'
                          : 'Report civic issues directly to Gram Panchayat administration.',
                      style: const TextStyle(fontSize: 10.5, color: Color(0xFFFED7AA)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        Text(
          isMr ? 'तक्रारीचा प्रवर्ग निवडा' : 'Select Complaint Category',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w900,
            color: isDark ? Colors.white : const Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 10),

        ..._categories.map((cat) {
          final title = isMr ? cat['titleMr'] as String : cat['titleEn'] as String;
          final desc = cat['desc'] as String;
          final icon = cat['icon'] as IconData;
          final color = cat['color'] as Color;

          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                title: Text(
                  title,
                  style: TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
                subtitle: Text(
                  desc,
                  style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                ),
                trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTheme.primaryOrange),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => LodgeGrievanceScreen(initialCategory: cat['id']),
                    ),
                  );
                },
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildMyComplaintsTab(BuildContext context, AppProvider app, List grievances, bool isMr, bool isDark) {
    if (grievances.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : AppTheme.saffronLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_outline_rounded, size: 48, color: AppTheme.primaryOrange),
            ),
            const SizedBox(height: 16),
            Text(
              isMr ? 'कोणतीही तक्रार प्रलंबित नाही' : 'No complaints recorded yet.',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              isMr ? 'समस्या नोंदवण्यासाठी "तक्रार नोंदवा" टॅब वापरा.' : 'Click "Lodge Issue" tab to submit a new complaint.',
              style: TextStyle(fontSize: 12, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: grievances.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final grv = grievances[index];
        final isResolved = grv.status == 'resolved';
        final complaintId = 'GRV-2026-${grv.id.toString().padLeft(6, "0")}';

        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isResolved ? const Color(0xFF10B981).withOpacity(0.5) : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
              width: isResolved ? 1.5 : 1.0,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF78350F) : AppTheme.saffronLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        grv.category.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: isDark ? const Color(0xFFFDE68A) : AppTheme.primaryOrangeDark,
                        ),
                      ),
                    ),
                    StatusBadge(status: grv.status),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.confirmation_number_outlined, size: 14, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        'तक्रार क्र: $complaintId',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.calendar_today_rounded, size: 12, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Text(
                      grv.createdAt.split(' ').first,
                      style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // 4-Step Tracking Timeline: Submitted -> Assigned -> In Progress -> Resolved
                _buildGrievanceTrackingTimeline(grv.status, isDark, isMr),
                const SizedBox(height: 10),

                Text(
                  grv.title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  grv.description,
                  style: TextStyle(fontSize: 12, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
                ),
                const SizedBox(height: 10),

                // Location & Department Strip
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.location_on_outlined, size: 14, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${grv.wardNo} • ${grv.locationDetails}',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.govNavy.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'ग्रामपंचायत विभाग',
                          style: TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.bold,
                            color: isDark ? const Color(0xFF94A3B8) : AppTheme.govNavy,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Resolution Notes if available
                if (grv.resolutionNotes != null && grv.resolutionNotes!.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.task_alt_rounded, size: 14, color: Color(0xFF34D399)),
                            const SizedBox(width: 4),
                            Text(
                              'ग्रामपंचायत निवारण अहवाल (Resolution Note):',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: isDark ? const Color(0xFF6EE7B7) : const Color(0xFF047857),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          grv.resolutionNotes!,
                          style: TextStyle(fontSize: 11, color: isDark ? Colors.white : const Color(0xFF065F46)),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildGrievanceTrackingTimeline(String status, bool isDark, bool isMr) {
    // 4 Steps: 0: Submitted, 1: Assigned, 2: In Progress, 3: Resolved
    int activeStep = 0;
    if (status == 'assigned') activeStep = 1;
    if (status == 'in_progress' || status == 'under_review') activeStep = 2;
    if (status == 'resolved') activeStep = 3;

    final steps = isMr
        ? ['नोंदवली', 'नियुक्त', 'प्रगतीपथावर', 'निवारण झाले']
        : ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0B1324) : const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(4, (idx) {
          final isDone = activeStep >= idx;
          final isCurrent = activeStep == idx;

          return Expanded(
            child: Column(
              children: [
                Row(
                  children: [
                    if (idx > 0)
                      Expanded(
                        child: Container(
                          height: 2,
                          color: isDone ? const Color(0xFF10B981) : (isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                        ),
                      ),
                    Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        color: isDone
                            ? const Color(0xFF10B981)
                            : (isDark ? const Color(0xFF1E293B) : const Color(0xFFCBD5E1)),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isCurrent ? AppTheme.primaryOrange : Colors.transparent,
                          width: 1.5,
                        ),
                      ),
                      child: Center(
                        child: isDone
                            ? const Icon(Icons.check, size: 10, color: Colors.white)
                            : null,
                      ),
                    ),
                    if (idx < 3)
                      Expanded(
                        child: Container(
                          height: 2,
                          color: activeStep > idx ? const Color(0xFF10B981) : (isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  steps[idx],
                  style: TextStyle(
                    fontSize: 8.5,
                    fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
                    color: isDone
                        ? (isDark ? const Color(0xFF6EE7B7) : const Color(0xFF047857))
                        : (isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}
