import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/app_provider.dart';
import '../../widgets/govd_theme.dart';
import '../govd_bdo_panchayats_desk.dart';
import '../govd_bdo_reports_desk.dart';
import '../govd_grievances_desk.dart';
import '../govd_certificates_desk.dart';
import '../govd_projects_desk.dart';

class GovdBdoHomeTab extends StatelessWidget {
  final Function(int) onTabChange;

  const GovdBdoHomeTab({
    super.key,
    required this.onTabChange,
  });

  String _getGreeting(bool isMr) {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return isMr ? 'शुभ प्रभात' : 'Good Morning';
    } else if (hour < 17) {
      return isMr ? 'शुभ दुपार' : 'Good Afternoon';
    } else {
      return isMr ? 'शुभ संध्याकाळ' : 'Good Evening';
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final user = app.currentUser;
    final isMr = app.language == 'mr';

    return RefreshIndicator(
      onRefresh: () => app.refreshAllData(),
      color: GovdTheme.saffron,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. BDO GREETING & JURISDICTION CARD
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: GovdTheme.headerGradient,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
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
                          child: const FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerLeft,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.shield_rounded, color: GovdTheme.gold, size: 14),
                                SizedBox(width: 5),
                                Text(
                                  '🏛️ गटविकास अधिकारी नियंत्रण कक्ष',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.goldLight),
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
                              'तालुका Live',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${_getGreeting(isMr)}, ${user?.name ?? "श्री. अरविंद देशमुख"} 👋',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: -0.2,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'Block Development Officer • ${user?.taluka ?? "संगमनेर"} तालुका, जि. ${user?.district ?? "अहिल्यानगर"}',
                    style: TextStyle(fontSize: 11.5, color: Colors.white.withOpacity(0.8)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 2. 4-CARD BLOCK SUMMARY (Section 12)
            Row(
              children: [
                Expanded(
                  child: _buildBdoSummaryCard(
                    context: context,
                    icon: Icons.account_balance_rounded,
                    count: '३',
                    label: isMr ? 'ग्रामपंचायती' : 'Panchayats',
                    sub: isMr ? 'सक्रिय कक्ष' : 'Active Units',
                    color: GovdTheme.primaryBlue,
                    onTap: () => onTabChange(1), // go to Panchayats tab
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildBdoSummaryCard(
                    context: context,
                    icon: Icons.fact_check_rounded,
                    count: '४',
                    label: isMr ? 'प्रलंबित मंजुरी' : 'Approvals',
                    sub: isMr ? 'कार्यालयीन तपासणी' : 'Pending',
                    color: GovdTheme.goldDark,
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
                  child: _buildBdoSummaryCard(
                    context: context,
                    icon: Icons.report_problem_rounded,
                    count: '६',
                    label: isMr ? 'खुली गाऱ्हाणी' : 'Complaints',
                    sub: isMr ? 'तातडीचे निवारण' : 'Open Grievances',
                    color: GovdTheme.rose,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGrievancesDesk()));
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildBdoSummaryCard(
                    context: context,
                    icon: Icons.engineering_rounded,
                    count: '१२',
                    label: isMr ? 'विकासकामे' : 'Works',
                    sub: isMr ? 'प्रगतीपथावर' : 'Active Projects',
                    color: GovdTheme.purpleLight,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdProjectsDesk()));
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),

            // 3. REQUIRES YOUR ATTENTION (Section 12)
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: GovdTheme.rose.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.warning_amber_rounded, color: GovdTheme.rose, size: 16),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    isMr ? 'आपले तातडीचे लक्ष आवश्यक (Requires Attention)' : 'Requires Your Attention',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            _buildAttentionCard(
              icon: Icons.report_problem_outlined,
              color: GovdTheme.rose,
              title: isMr ? '२ प्रलंबित तक्रारी (Unresolved Complaints)' : '2 Unresolved Complaints',
              desc: isMr ? 'घुलेवाडी व चंदनापुरी येथील पाणीपुरवठा तक्रारी ४८ तासांपेक्षा जास्त प्रलंबित.' : 'Water supply complaints pending over 48 hours.',
              actionLabel: isMr ? 'तक्रारी पहा →' : 'Review →',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGrievancesDesk())),
            ),
            const SizedBox(height: 8),
            _buildAttentionCard(
              icon: Icons.fact_check_outlined,
              color: GovdTheme.goldDark,
              title: isMr ? '३ दाखले विशेष मंजुरी (Certificate Approvals)' : '3 Certificate Approvals',
              desc: isMr ? 'तालुका स्तरावर शिफारस केलेले ३ विशेष दाखले मंजुरीच्या प्रतीक्षेत.' : '3 escalated certificates awaiting BDO clearance.',
              actionLabel: isMr ? 'मंजुरी द्या →' : 'Clear →',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk())),
            ),
            const SizedBox(height: 8),
            _buildAttentionCard(
              icon: Icons.account_balance_outlined,
              color: GovdTheme.primaryBlue,
              title: isMr ? '१ पायाभूत सुविधा प्रकल्प मंजुरी (Infra Approval)' : '1 Infrastructure Approval',
              desc: isMr ? 'निमगाव बुद्रुक येथील १५ वा वित्त आयोग रस्ता काँक्रीटीकरण निधी वितरण.' : '15th Finance road sanction for Nimgaon Budruk.',
              actionLabel: isMr ? 'निधी मंजूर करा →' : 'Approve →',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdProjectsDesk())),
            ),
            const SizedBox(height: 22),

            // 4. GRAM PANCHAYATS OVERVIEW (Section 12 & 13)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: GovdTheme.navyDark.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.account_balance_rounded, color: GovdTheme.navyDark, size: 16),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          isMr ? 'तालुक्यातील ग्रामपंचायती' : 'Gram Panchayats',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton(
                  onPressed: () => onTabChange(1), // go to Panchayats tab
                  child: Text(
                    isMr ? 'सर्व पहा (${3}) →' : 'View All →',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Ghulewadi Card
            _buildPanchayatMiniCard(
              name: isMr ? 'ग्रामपंचायत घुलेवाडी' : 'Gram Panchayat Ghulewadi',
              statusOnline: true,
              citizens: 245,
              complaints: 2,
              approvals: 1,
              taxPercent: 82,
              onTap: () => onTabChange(1),
            ),
            const SizedBox(height: 8),

            // Gunjalwadi Card
            _buildPanchayatMiniCard(
              name: isMr ? 'ग्रामपंचायत गुंजाळवाडी' : 'Gram Panchayat Gunjalwadi',
              statusOnline: true,
              citizens: 180,
              complaints: 1,
              approvals: 0,
              taxPercent: 78,
              onTap: () => onTabChange(1),
            ),
            const SizedBox(height: 8),

            // Nimgaon Budruk Card
            _buildPanchayatMiniCard(
              name: isMr ? 'ग्रामपंचायत निमगाव बुद्रुक' : 'Gram Panchayat Nimgaon Budruk',
              statusOnline: true,
              citizens: 310,
              complaints: 4,
              approvals: 3,
              taxPercent: 64,
              onTap: () => onTabChange(1),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildBdoSummaryCard({
    required BuildContext context,
    required IconData icon,
    required String count,
    required String label,
    required String sub,
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
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    count,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: color,
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
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: GovdTheme.navyDark),
              ),
            ),
            Text(
              sub,
              style: const TextStyle(fontSize: 10, color: GovdTheme.slateMedium),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAttentionCard({
    required IconData icon,
    required Color color,
    required String title,
    required String desc,
    required String actionLabel,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
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
                ),
                const SizedBox(height: 2),
                Text(
                  desc,
                  style: const TextStyle(fontSize: 11, color: GovdTheme.slateMedium, height: 1.3),
                ),
                const SizedBox(height: 6),
                InkWell(
                  onTap: onTap,
                  child: Text(
                    actionLabel,
                    style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: color),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPanchayatMiniCard({
    required String name,
    required bool statusOnline,
    required int citizens,
    required int complaints,
    required int approvals,
    required int taxPercent,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    name,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: GovdTheme.navyDark),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: statusOnline ? GovdTheme.emerald.withOpacity(0.12) : GovdTheme.rose.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 5,
                        height: 5,
                        decoration: BoxDecoration(
                          color: statusOnline ? GovdTheme.emerald : GovdTheme.rose,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        statusOnline ? 'Online' : 'Offline',
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          color: statusOnline ? GovdTheme.emerald : GovdTheme.rose,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 12,
              runSpacing: 4,
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Text('नागरिक: $citizens', style: const TextStyle(fontSize: 10.5, color: GovdTheme.slateMedium)),
                Text('तक्रारी: $complaints', style: const TextStyle(fontSize: 10.5, color: GovdTheme.rose, fontWeight: FontWeight.bold)),
                Text('मंजुरी: $approvals', style: const TextStyle(fontSize: 10.5, color: GovdTheme.goldDark, fontWeight: FontWeight.bold)),
                Text('कर: $taxPercent%', style: const TextStyle(fontSize: 10.5, color: GovdTheme.emerald, fontWeight: FontWeight.bold)),
                const Text('तपासा →', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.navyDark)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
