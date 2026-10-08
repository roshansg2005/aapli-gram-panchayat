import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/app_provider.dart';
import '../../widgets/govd_theme.dart';
import '../govd_certificates_desk.dart';
import '../govd_grievances_desk.dart';
import '../govd_tax_desk.dart';
import '../govd_gram_sabha_desk.dart';
import '../govd_user_management_desk.dart';
import '../govd_projects_desk.dart';

class GovdHomeTab extends StatelessWidget {
  final Function(int) onTabChange;

  const GovdHomeTab({
    super.key,
    required this.onTabChange,
  });

  String _getGreeting(bool isMr) {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return isMr ? 'नमस्कार' : 'Good Morning';
    } else if (hour < 17) {
      return isMr ? 'शुभ दुपार' : 'Good Afternoon';
    } else {
      return isMr ? 'शुभ संध्याकाळ' : 'Good Evening';
    }
  }

  void _showNewGrievanceSheet(BuildContext context, AppProvider app, bool isMr) {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    String category = 'पाणीपुरवठा';
    String ward = 'Ward 1';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 18,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
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
              const SizedBox(height: 14),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: GovdTheme.rose.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.add_alert_rounded, color: GovdTheme.rose, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    isMr ? 'नवीन तक्रार नोंदवा' : 'Register New Complaint',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: titleController,
                decoration: InputDecoration(
                  labelText: isMr ? 'तक्रारीचा विषय / शीर्षक *' : 'Complaint Title *',
                  hintText: isMr ? 'उदा. गणपती चौक पथदिवा बंद आहे' : 'e.g. Streetlight not working',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: category,
                      decoration: InputDecoration(
                        labelText: isMr ? 'विभाग / वर्ग' : 'Category',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'पाणीपुरवठा', child: Text('🚰 पाणीपुरवठा')),
                        DropdownMenuItem(value: 'पथदिवे', child: Text('💡 पथदिवे')),
                        DropdownMenuItem(value: 'रस्ते', child: Text('🛣️ रस्ते दुरुस्ती')),
                        DropdownMenuItem(value: 'स्वच्छता', child: Text('🧹 स्वच्छता')),
                      ],
                      onChanged: (v) => setSheetState(() => category = v!),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: ward,
                      decoration: InputDecoration(
                        labelText: isMr ? 'वॉर्ड क्र.' : 'Ward No.',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'Ward 1', child: Text('वॉर्ड क्र. १')),
                        DropdownMenuItem(value: 'Ward 2', child: Text('वॉर्ड क्र. २')),
                        DropdownMenuItem(value: 'Ward 3', child: Text('वॉर्ड क्र. ३')),
                        DropdownMenuItem(value: 'Ward 4', child: Text('वॉर्ड क्र. ४')),
                      ],
                      onChanged: (v) => setSheetState(() => ward = v!),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descController,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: isMr ? 'तपशीलवार वर्णन' : 'Description',
                  hintText: isMr ? 'तक्रारीबद्दल थोडक्यात माहिती लिहा...' : 'Provide details...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton(
                  onPressed: () {
                    if (titleController.text.trim().isEmpty) return;
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(isMr ? 'तक्रार यशस्वीरित्या नोंदवली गेली.' : 'Complaint registered successfully.'),
                        backgroundColor: GovdTheme.emerald,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: GovdTheme.navyDark,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(
                    isMr ? 'तक्रार सबमिट करा (Submit)' : 'Submit Complaint',
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final user = app.currentUser;
    final isMr = app.language == 'mr';

    // Live counts & calculations
    final openComplaints = app.grievances.where((g) => g.status == 'open' || g.status == 'pending').length;
    final pendingApprovals = app.certificates.where((c) => c.status == 'pending').length;
    final pendingTaxRecords = app.taxRecords.where((t) => t.dueAmount > 0).toList();
    final totalTaxDue = pendingTaxRecords.fold<double>(0, (sum, t) => sum + t.dueAmount).toInt();

    return RefreshIndicator(
      onRefresh: () => app.refreshAllData(),
      color: GovdTheme.saffron,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ==========================================
            // 1. TOP GREETING & JURISDICTION (Section 3)
            // ==========================================
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: GovdTheme.headerGradient,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.12),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: GovdTheme.gold.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: GovdTheme.gold.withOpacity(0.4)),
                          ),
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerLeft,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.verified_user_rounded, color: GovdTheme.gold, size: 13),
                                const SizedBox(width: 5),
                                Text(
                                  user?.roleDisplayMr ?? '👑 सरपंच कक्ष',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.goldLight),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: GovdTheme.emerald.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: GovdTheme.emerald.withOpacity(0.5)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.circle, color: GovdTheme.emerald, size: 7),
                            SizedBox(width: 4),
                            Text(
                              'Online',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${_getGreeting(isMr)}, ${user?.name ?? "Shri Rahul Kadam"} 👋',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: -0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '${user?.designation ?? "Sarpanch"} • ${user?.gramPanchayat ?? "Ghulewadi"} (ता. ${user?.taluka ?? "संगमनेर"})',
                    style: TextStyle(fontSize: 11.5, color: Colors.white.withOpacity(0.8)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ==========================================
            // 2. 2-COLUMN SUMMARY COMPACT CARDS (Section 3)
            // ==========================================
            Row(
              children: [
                Expanded(
                  child: _buildSummaryBox(
                    icon: Icons.report_problem_rounded,
                    count: '$openComplaints',
                    label: isMr ? 'खुली गाऱ्हाणी (Open)' : 'Open Complaints',
                    color: GovdTheme.rose,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGrievancesDesk()));
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildSummaryBox(
                    icon: Icons.fact_check_rounded,
                    count: '$pendingApprovals',
                    label: isMr ? 'प्रलंबित मंजुरी' : 'Pending Approvals',
                    color: GovdTheme.emerald,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk()));
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _buildSummaryBox(
                    icon: Icons.currency_rupee_rounded,
                    count: '₹${totalTaxDue > 0 ? totalTaxDue : 1440}',
                    label: isMr ? 'थकबाकी कर (Tax Due)' : 'Tax Due',
                    color: GovdTheme.goldDark,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdTaxDesk()));
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildSummaryBox(
                    icon: Icons.description_rounded,
                    count: '$pendingApprovals',
                    label: isMr ? 'दाखले (Certificates)' : 'Certificates',
                    color: GovdTheme.primaryBlue,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk()));
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),

            // ==========================================
            // 3. TODAY'S TASKS (Section 3)
            // ==========================================
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    isMr ? 'आजची महत्त्वाची कामे (Today\'s Tasks)' : 'Today\'s Tasks',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => onTabChange(1), // switch to Tasks tab
                  child: Text(
                    isMr ? 'सर्व पहा →' : 'View All →',
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Task 1: Streetlight complaint
            _buildTodayTaskItem(
              icon: Icons.lightbulb_outline_rounded,
              color: GovdTheme.rose,
              title: isMr ? '⚠️ गणपती चौक पथदिवा बंद तक्रार' : '⚠️ Streetlight complaint',
              subtitle: isMr ? 'गणपती चौक, वॉर्ड १ • प्रगतीपथावर (In Progress)' : 'Ganpati Chowk, Ward 1 • In Progress',
              actionText: isMr ? 'पहा (View)' : 'View',
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGrievancesDesk()));
              },
            ),
            const SizedBox(height: 8),

            // Task 2: Certificate verification
            _buildTodayTaskItem(
              icon: Icons.fact_check_outlined,
              color: GovdTheme.goldDark,
              title: isMr ? '📄 दाखले पडताळणी व स्वाक्षरी' : '📄 Certificate verification',
              subtitle: pendingApprovals > 0
                  ? '$pendingApprovals ${isMr ? "नवीन अर्ज मंजुरीच्या प्रतीक्षेत" : "pending applications"}'
                  : (isMr ? 'सध्या कोणतेही अर्ज प्रलंबित नाहीत' : 'No pending applications'),
              actionText: isMr ? 'तपासा' : 'Review',
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk()));
              },
            ),
            const SizedBox(height: 8),

            // Task 3: Tax collection
            _buildTodayTaskItem(
              icon: Icons.currency_rupee_rounded,
              color: GovdTheme.emerald,
              title: isMr ? '💰 घरपट्टी व पाणीपट्टी कर वसुली' : '💰 Tax collection',
              subtitle: isMr ? '₹१,४४० आजची वसुली शिल्लक' : '₹1,440 pending collection',
              actionText: isMr ? 'संकलन' : 'Collect',
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdTaxDesk()));
              },
            ),
            const SizedBox(height: 22),

            // ==========================================
            // 4. QUICK ACTIONS (Section 3 - Max 4 buttons)
            // ==========================================
            Text(
              isMr ? 'जलद प्रशासकीय कृती (Quick Actions)' : 'Quick Actions',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.add_circle_outline_rounded,
                    label: isMr ? '+ तक्रार नोंदवा' : '+ Complaint',
                    color: GovdTheme.rose,
                    onTap: () => _showNewGrievanceSheet(context, app, isMr),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.note_add_outlined,
                    label: isMr ? '+ दाखला अर्ज' : '+ Certificate',
                    color: GovdTheme.primaryBlue,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk()));
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.receipt_long_rounded,
                    label: isMr ? '+ कर वसुली' : '+ Tax Collection',
                    color: GovdTheme.emerald,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdTaxDesk()));
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.groups_rounded,
                    label: isMr ? '+ ग्रामसभा' : '+ Gram Sabha',
                    color: GovdTheme.goldDark,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGramSabhaDesk()));
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryBox({
    required IconData icon,
    required String count,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.25), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(7),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 18),
                ),
                Flexible(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      count,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: color,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                label,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: GovdTheme.navyDark),
                maxLines: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTodayTaskItem({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required String actionText,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: GovdTheme.navyDark),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 11, color: GovdTheme.slateMedium),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 6),
          ElevatedButton(
            onPressed: onTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: GovdTheme.navyDark,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              minimumSize: const Size(60, 32),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              elevation: 0,
            ),
            child: Text(
              actionText,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return SizedBox(
      height: 48,
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: GovdTheme.navyDark,
          side: BorderSide(color: color.withOpacity(0.4), width: 1.2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 10),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                label,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: GovdTheme.navyDark),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
