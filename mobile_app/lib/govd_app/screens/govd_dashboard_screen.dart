import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../widgets/govd_theme.dart';
import '../widgets/govd_app_header.dart';
import '../widgets/govd_drawer.dart';
import '../widgets/govd_offline_banner.dart';
import 'tabs/govd_home_tab.dart';
import 'tabs/govd_bdo_home_tab.dart';
import 'tabs/govd_tasks_tab.dart';
import 'tabs/govd_alerts_tab.dart';
import 'tabs/govd_profile_tab.dart';
import 'govd_grievances_desk.dart';
import 'govd_certificates_desk.dart';
import 'govd_tax_desk.dart';
import 'govd_bdo_panchayats_desk.dart';
import 'govd_bdo_reports_desk.dart';
import 'govd_user_management_desk.dart';
import 'govd_gram_sabha_desk.dart';
import 'govd_notices_desk.dart';

class GovdDashboardScreen extends StatefulWidget {
  final int initialTabIndex;
  const GovdDashboardScreen({super.key, this.initialTabIndex = 0});

  @override
  State<GovdDashboardScreen> createState() => _GovdDashboardScreenState();
}

class _GovdDashboardScreenState extends State<GovdDashboardScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTabIndex;
  }

  void _onTabSelected(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  void _showQuickActionSheet() {
    final app = context.read<AppProvider>();
    final isMr = app.language == 'mr';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
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
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: GovdTheme.saffron.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.flash_on_rounded, color: GovdTheme.saffron, size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isMr ? 'जलद प्रशासकीय कृती' : 'Quick Administrative Action',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        isMr ? 'कार्यालयीन कामांसाठी १-टॅप पर्याय' : '1-Tap actions for administration',
                        style: const TextStyle(fontSize: 11, color: GovdTheme.slateMedium),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 2.2,
              children: [
                _buildQuickActionItem(
                  icon: Icons.person_add_rounded,
                  label: isMr ? 'नागरिक नोंदणी' : 'Citizen Register',
                  sub: 'Register Citizen',
                  color: GovdTheme.primaryBlue,
                  onTap: () {
                    Navigator.pop(ctx);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdUserManagementDesk()));
                  },
                ),
                _buildQuickActionItem(
                  icon: Icons.receipt_long_rounded,
                  label: isMr ? 'कर पावती द्या' : 'Collect Tax',
                  sub: 'Issue Tax Receipt',
                  color: GovdTheme.emerald,
                  onTap: () {
                    Navigator.pop(ctx);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdTaxDesk()));
                  },
                ),
                _buildQuickActionItem(
                  icon: Icons.fact_check_rounded,
                  label: isMr ? 'दाखला पडताळणी' : 'Certificates',
                  sub: 'Verify Certificate',
                  color: GovdTheme.goldDark,
                  onTap: () {
                    Navigator.pop(ctx);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk()));
                  },
                ),
                _buildQuickActionItem(
                  icon: Icons.groups_rounded,
                  label: isMr ? 'ग्रामसभा सूचना' : 'Gram Sabha',
                  sub: 'Meeting Notice',
                  color: GovdTheme.purpleLight,
                  onTap: () {
                    Navigator.pop(ctx);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGramSabhaDesk()));
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionItem({
    required IconData icon,
    required String label,
    required String sub,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.06),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2), width: 1),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 16),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    sub,
                    style: const TextStyle(fontSize: 8.5, color: GovdTheme.slateMedium),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isMr = app.language == 'mr';
    final user = app.currentUser;
    final isBdo = user?.isTalukaBDO == true;
    final isGramSevak = user?.isGramSevak == true;
    final isTaxClerk = user?.isTaxClerk == true;

    final unreadAlerts = app.grievances.where((g) => g.priority == 'high' && g.status != 'resolved').length +
        app.certificates.where((c) => c.status == 'pending').length;

    // Build role-specific screens list
    List<Widget> screens;
    List<BottomNavigationBarItem> navItems;

    if (isBdo) {
      // BDO Navigation: Home, Panchayats, Reports, Alerts, Profile
      screens = [
        GovdBdoHomeTab(onTabChange: _onTabSelected),
        const GovdBdoPanchayatsDesk(),
        const GovdBdoReportsDesk(),
        const GovdAlertsTab(),
        const GovdProfileTab(),
      ];
      navItems = [
        BottomNavigationBarItem(
          icon: const Icon(Icons.home_outlined),
          activeIcon: const Icon(Icons.home_rounded),
          label: isMr ? 'मुख्य' : 'Home',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.account_balance_outlined),
          activeIcon: const Icon(Icons.account_balance_rounded),
          label: isMr ? 'पंचायती' : 'Panchayats',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.analytics_outlined),
          activeIcon: const Icon(Icons.analytics_rounded),
          label: isMr ? 'अहवाल' : 'Reports',
        ),
        BottomNavigationBarItem(
          icon: _buildBadgeIcon(Icons.notifications_outlined, unreadAlerts),
          activeIcon: _buildBadgeIcon(Icons.notifications_rounded, unreadAlerts),
          label: isMr ? 'सूचना' : 'Alerts',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.person_outline_rounded),
          activeIcon: const Icon(Icons.person_rounded),
          label: isMr ? 'प्रोफाइल' : 'Profile',
        ),
      ];
    } else if (isGramSevak) {
      // Gram Sevak Navigation: Home, Tasks, Certificates, Alerts, Profile
      screens = [
        GovdHomeTab(onTabChange: _onTabSelected),
        const GovdTasksTab(),
        const GovdCertificatesDesk(),
        const GovdAlertsTab(),
        const GovdProfileTab(),
      ];
      navItems = [
        BottomNavigationBarItem(
          icon: const Icon(Icons.home_outlined),
          activeIcon: const Icon(Icons.home_rounded),
          label: isMr ? 'मुख्य' : 'Home',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.assignment_outlined),
          activeIcon: const Icon(Icons.assignment_rounded),
          label: isMr ? 'कामे' : 'Tasks',
        ),
        BottomNavigationBarItem(
          icon: _buildBadgeIcon(Icons.fact_check_outlined, app.certificates.where((c) => c.status == 'pending').length),
          activeIcon: _buildBadgeIcon(Icons.fact_check_rounded, app.certificates.where((c) => c.status == 'pending').length),
          label: isMr ? 'दाखले' : 'Certs',
        ),
        BottomNavigationBarItem(
          icon: _buildBadgeIcon(Icons.notifications_outlined, unreadAlerts),
          activeIcon: _buildBadgeIcon(Icons.notifications_rounded, unreadAlerts),
          label: isMr ? 'सूचना' : 'Alerts',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.person_outline_rounded),
          activeIcon: const Icon(Icons.person_rounded),
          label: isMr ? 'प्रोफाइल' : 'Profile',
        ),
      ];
    } else if (isTaxClerk) {
      // Tax Clerk Navigation: Home, Tasks, Tax Desk, Alerts, Profile
      screens = [
        GovdHomeTab(onTabChange: _onTabSelected),
        const GovdTasksTab(),
        const GovdTaxDesk(),
        const GovdAlertsTab(),
        const GovdProfileTab(),
      ];
      navItems = [
        BottomNavigationBarItem(
          icon: const Icon(Icons.home_outlined),
          activeIcon: const Icon(Icons.home_rounded),
          label: isMr ? 'मुख्य' : 'Home',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.assignment_outlined),
          activeIcon: const Icon(Icons.assignment_rounded),
          label: isMr ? 'कामे' : 'Tasks',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.receipt_long_outlined),
          activeIcon: const Icon(Icons.receipt_long_rounded),
          label: isMr ? 'कर' : 'Taxes',
        ),
        BottomNavigationBarItem(
          icon: _buildBadgeIcon(Icons.notifications_outlined, unreadAlerts),
          activeIcon: _buildBadgeIcon(Icons.notifications_rounded, unreadAlerts),
          label: isMr ? 'सूचना' : 'Alerts',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.person_outline_rounded),
          activeIcon: const Icon(Icons.person_rounded),
          label: isMr ? 'प्रोफाइल' : 'Profile',
        ),
      ];
    } else {
      // Sarpanch / Up-Sarpanch Navigation: Home, Tasks, Complaints, Alerts, Profile
      screens = [
        GovdHomeTab(onTabChange: _onTabSelected),
        const GovdTasksTab(),
        const GovdGrievancesDesk(),
        const GovdAlertsTab(),
        const GovdProfileTab(),
      ];
      navItems = [
        BottomNavigationBarItem(
          icon: const Icon(Icons.home_outlined),
          activeIcon: const Icon(Icons.home_rounded),
          label: isMr ? 'मुख्य' : 'Home',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.assignment_outlined),
          activeIcon: const Icon(Icons.assignment_rounded),
          label: isMr ? 'कामे' : 'Tasks',
        ),
        BottomNavigationBarItem(
          icon: _buildBadgeIcon(Icons.report_problem_outlined, app.grievances.where((g) => g.status != 'resolved').length),
          activeIcon: _buildBadgeIcon(Icons.report_problem_rounded, app.grievances.where((g) => g.status != 'resolved').length),
          label: isMr ? 'तक्रारी' : 'Issues',
        ),
        BottomNavigationBarItem(
          icon: _buildBadgeIcon(Icons.notifications_outlined, unreadAlerts),
          activeIcon: _buildBadgeIcon(Icons.notifications_rounded, unreadAlerts),
          label: isMr ? 'सूचना' : 'Alerts',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.person_outline_rounded),
          activeIcon: const Icon(Icons.person_rounded),
          label: isMr ? 'प्रोफाइल' : 'Profile',
        ),
      ];
    }

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: GovdTheme.bgSurface,
      drawer: GovdNavigationDrawer(
        currentTabIndex: _currentIndex,
        onNavigateTab: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Sticky Mobile Government Header
            GovdAppHeader(
              onOpenDrawer: () => _scaffoldKey.currentState?.openDrawer(),
              onOpenAlerts: () => setState(() => _currentIndex = 3),
            ),

            // 2. Offline / Sync Banner
            const GovdOfflineBanner(),

            // 3. Main Tab Screen (IndexedStack preserves state)
            Expanded(
              child: IndexedStack(
                index: _currentIndex.clamp(0, screens.length - 1),
                children: screens,
              ),
            ),
          ],
        ),
      ),
      // Floating Action Button
      floatingActionButton: (_currentIndex == 0 || _currentIndex == 1)
          ? FloatingActionButton(
              onPressed: _showQuickActionSheet,
              backgroundColor: GovdTheme.saffron,
              elevation: 4,
              shape: const CircleBorder(),
              child: const Icon(Icons.add_rounded, color: Colors.white, size: 28),
            )
          : null,
      // 4. Dynamic Role-Based Fixed 5-Item Bottom Navigation Bar
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: GovdTheme.navyDark.withOpacity(0.08),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
          border: Border(
            top: BorderSide(color: Colors.grey.shade200, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex.clamp(0, navItems.length - 1),
          onTap: _onTabSelected,
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: GovdTheme.saffron,
          unselectedItemColor: GovdTheme.slateMedium,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10.5),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 10),
          elevation: 0,
          items: navItems,
        ),
      ),
    );
  }

  Widget _buildBadgeIcon(IconData icon, int count) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Icon(icon),
        if (count > 0)
          Positioned(
            top: -2,
            right: -4,
            child: Container(
              padding: const EdgeInsets.all(3),
              decoration: const BoxDecoration(
                color: GovdTheme.rose,
                shape: BoxShape.circle,
              ),
              child: Text(
                '$count',
                style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
              ),
            ),
          ),
      ],
    );
  }
}
