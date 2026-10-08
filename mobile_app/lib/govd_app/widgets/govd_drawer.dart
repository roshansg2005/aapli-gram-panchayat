import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import 'govd_theme.dart';
import '../screens/govd_user_management_desk.dart';
import '../screens/govd_certificates_desk.dart';
import '../screens/govd_projects_desk.dart';
import '../screens/govd_gram_sabha_desk.dart';
import '../screens/govd_tax_desk.dart';
import '../screens/govd_schemes_desk.dart';
import '../screens/govd_bdo_reports_desk.dart';
import '../screens/govd_settings_screen.dart';
import '../screens/govd_field_work_screen.dart';
import '../screens/govd_global_search_modal.dart';
import '../../config/theme.dart';
import '../../screens/auth/login_screen.dart';

class GovdNavigationDrawer extends StatelessWidget {
  final int currentTabIndex;
  final Function(int)? onNavigateTab;

  const GovdNavigationDrawer({
    super.key,
    this.currentTabIndex = 0,
    this.onNavigateTab,
  });

  void _confirmLogout(BuildContext context, AppProvider app, bool isMr) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text(
          isMr ? 'प्रशासकीय लॉगआउट' : 'Officer Logout',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: Text(
          isMr
              ? 'आपण शासकीय नियंत्रण कक्षातून लॉगआउट करू इच्छिता का?'
              : 'Are you sure you want to log out of the administration desk?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(isMr ? 'रद्द करा' : 'Cancel', style: const TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.dangerRed, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              Navigator.pop(context); // close drawer
              await app.logout();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            child: Text(isMr ? 'लॉगआउट करा' : 'Logout'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final user = app.currentUser;
    final isMr = app.language == 'mr';

    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Column(
          children: [
            // Drawer Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: const BoxDecoration(
                gradient: GovdTheme.headerGradient,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundColor: GovdTheme.gold.withOpacity(0.2),
                        child: const Icon(Icons.shield_rounded, size: 28, color: GovdTheme.gold),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.name ?? 'शासकीय अधिकारी',
                              style: const TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              user?.roleDisplayMr ?? 'ग्रामपंचायत प्रशासन',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.goldLight),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              '${user?.gramPanchayat ?? "घुलेवाडी"} • ${user?.employeeCode ?? "EMP-01"}',
                              style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.7)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // More Menu Items (Section 5)
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 6),
                children: [
                  // 1. Citizen Management
                  _buildDrawerItem(
                    icon: Icons.people_alt_rounded,
                    color: GovdTheme.primaryBlue,
                    title: isMr ? 'नागरिक व्यवस्थापन (Citizen Management)' : 'Citizen Management',
                    subtitle: isMr ? 'नोंदणी, वॉर्डनिहाय यादी व कुटुंब नोंदी' : 'Citizen directory & family records',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdUserManagementDesk()));
                    },
                  ),

                  // 2. Certificate Management
                  _buildDrawerItem(
                    icon: Icons.fact_check_rounded,
                    color: GovdTheme.goldDark,
                    title: isMr ? 'दाखले व प्रमाणपत्रे (Certificate Management)' : 'Certificate Management',
                    subtitle: isMr ? 'पडताळणी, डिजिटल स्वाक्षरी व मंजुरी' : 'Verification & approval workflow',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk()));
                    },
                  ),

                  // 3. Infrastructure Works
                  _buildDrawerItem(
                    icon: Icons.engineering_rounded,
                    color: const Color(0xFF6366F1),
                    title: isMr ? 'पायाभूत विकासकामे (Infrastructure Works)' : 'Infrastructure Works',
                    subtitle: isMr ? 'निधी, खर्च, कंत्राटदार व प्रगती ट्रॅकिंग' : 'Budget, spent & progress tracking',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdProjectsDesk()));
                    },
                  ),

                  // 4. Gram Sabha
                  _buildDrawerItem(
                    icon: Icons.groups_rounded,
                    color: const Color(0xFFF97316),
                    title: isMr ? 'ग्रामसभा व ठराव (Gram Sabha)' : 'Gram Sabha & Resolutions',
                    subtitle: isMr ? 'बैठका, विषयपत्रिका, उपस्थिती व इतिवृत्त' : 'Meetings, agendas, attendance & minutes',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGramSabhaDesk()));
                    },
                  ),

                  // 5. Tax Management
                  _buildDrawerItem(
                    icon: Icons.currency_rupee_rounded,
                    color: GovdTheme.emerald,
                    title: isMr ? 'कर व्यवस्थापन व पावती (Tax Management)' : 'Tax Management & Receipts',
                    subtitle: isMr ? 'घरपट्टी, पाणीपट्टी व संकलन अहवाल' : 'Property/Water tax collection & receipts',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdTaxDesk()));
                    },
                  ),

                  // 6. Government Schemes
                  _buildDrawerItem(
                    icon: Icons.agriculture_rounded,
                    color: const Color(0xFF0D9488),
                    title: isMr ? 'शासकीय योजना संनियंत्रण (Govt Schemes)' : 'Government Schemes',
                    subtitle: isMr ? 'लाभार्थी याद्या, निकष व अनुदान वितरण' : 'DBT beneficiaries & applications',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdSchemesDesk()));
                    },
                  ),

                  // 7. Staff Directory
                  _buildDrawerItem(
                    icon: Icons.badge_outlined,
                    color: const Color(0xFF0284C7),
                    title: isMr ? 'कर्मचारी व प्रतिनिधी सूची (Staff Directory)' : 'Staff Directory',
                    subtitle: isMr ? 'लिपिक, सेवक, वॉर्ड सदस्य संपर्क' : 'Panchayat officials & roster',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdUserManagementDesk()));
                    },
                  ),

                  // 8. Reports & Analytics
                  _buildDrawerItem(
                    icon: Icons.analytics_rounded,
                    color: const Color(0xFF8B5CF6),
                    title: isMr ? 'प्रशासकीय अहवाल (Reports & Analytics)' : 'Reports & Analytics',
                    subtitle: isMr ? 'मासिक प्रगती, वसुली व गाऱ्हाणी आकडेवारी' : 'Progress, revenue & KPI summaries',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdBdoReportsDesk()));
                    },
                  ),

                  // 9. Field Work / Inspection
                  _buildDrawerItem(
                    icon: Icons.assignment_turned_in_rounded,
                    color: const Color(0xFFE11D48),
                    title: isMr ? 'क्षेत्र पाहणी व नोंदी (Field Work)' : 'Field Work & Inspection',
                    subtitle: isMr ? 'दौरे, प्रत्यक्ष पाहणी व जिओ-फोटो' : 'Field visits & inspection logs',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdFieldWorkScreen()));
                    },
                  ),

                  // 10. Global Search
                  _buildDrawerItem(
                    icon: Icons.search_rounded,
                    color: const Color(0xFFEC4899),
                    title: isMr ? 'सर्वसमावेशक शोध (Global Search)' : 'Global Search',
                    subtitle: isMr ? 'दाखला क्र., घर क्र., नाव, तक्रार ID' : 'Search all panchayat records',
                    onTap: () {
                      Navigator.pop(context);
                      GovdGlobalSearchModal.show(context);
                    },
                  ),

                  const Divider(height: 16),

                  // Settings
                  _buildDrawerItem(
                    icon: Icons.settings_rounded,
                    color: GovdTheme.slateMedium,
                    title: isMr ? 'ॲप सेटिंग्ज (Settings)' : 'Settings',
                    subtitle: isMr ? 'सुरक्षा, बायोमेट्रिक व सूचना प्राधान्ये' : 'Security, notifications & preferences',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdSettingsScreen()));
                    },
                  ),

                  // Language Toggle
                  ListTile(
                    dense: true,
                    leading: Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: GovdTheme.navyDark.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.language_rounded, color: GovdTheme.navyDark, size: 18),
                    ),
                    title: Text(isMr ? 'भाषा बदला (Language)' : 'Change Language', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                    trailing: TextButton(
                      onPressed: () => app.toggleLanguage(),
                      child: Text(isMr ? 'English' : 'मराठी', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ),

                  // Switch to Citizen View
                  ListTile(
                    dense: true,
                    leading: Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.swap_horizontal_circle_outlined, color: Color(0xFF2563EB), size: 18),
                    ),
                    title: const Text(
                      'नागरिक व्ह्यूवर जा (Citizen View)',
                      style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: Color(0xFF2563EB)),
                    ),
                    subtitle: const Text('नागरिक अनुभव तपासण्यासाठी', style: TextStyle(fontSize: 10)),
                    onTap: () {
                      Navigator.pop(context);
                      app.setGovdDeskMode(false);
                    },
                  ),

                  const Divider(height: 16),

                  // Logout
                  ListTile(
                    dense: true,
                    leading: Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: AppTheme.dangerRed.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.logout_rounded, color: AppTheme.dangerRed, size: 18),
                    ),
                    title: const Text(
                      'प्रशासकीय लॉगआउट (Logout)',
                      style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: AppTheme.dangerRed),
                    ),
                    onTap: () => _confirmLogout(context, app, isMr),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      dense: true,
      leading: Container(
        padding: const EdgeInsets.all(7),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: color, size: 18),
      ),
      title: Text(
        title,
        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
      ),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Color(0xFF94A3B8)),
      onTap: onTap,
    );
  }
}
