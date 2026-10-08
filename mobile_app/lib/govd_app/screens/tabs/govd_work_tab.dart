import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/app_provider.dart';
import '../../widgets/govd_theme.dart';
import '../govd_certificates_desk.dart';
import '../govd_grievances_desk.dart';
import '../govd_tax_desk.dart';
import '../govd_user_management_desk.dart';
import '../govd_notices_desk.dart';
import '../govd_projects_desk.dart';
import '../govd_gram_sabha_desk.dart';
import '../govd_schemes_desk.dart';
import '../govd_appointments_desk.dart';
import '../govd_field_work_screen.dart';

class GovdWorkTab extends StatelessWidget {
  const GovdWorkTab({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final user = app.currentUser;
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';
    final isBdo = user?.isTalukaBDO == true;

    final pendingCerts = app.certificates.where((c) => c.status == 'pending').length;
    final openGrievances = app.grievances.where((g) => g.status == 'open' || g.status == 'pending').length;
    final unpaidTaxes = app.taxRecords.where((t) => t.dueAmount > 0).length;
    final activeProjects = app.projects.where((p) => p.status != 'completed').length;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isMr ? 'कार्यालयीन कामकाज व विभाग कक्ष (Work Hub)' : 'Work Hub & Desks',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            isMr
                ? 'ग्रामपंचायतीचे सर्व मुख्य विभाग व प्रशासकीय सेवा'
                : 'Panchayat governance desks and services',
            style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
          ),
          const SizedBox(height: 14),

          // 1. Core Desk Cards List
          _buildWorkHubCard(
            icon: Icons.assignment_turned_in_rounded,
            color: const Color(0xFF2563EB),
            title: isMr ? 'दाखला मंजुरी व वितरण कक्ष' : 'Certificate Verification Desk',
            subtitle: isMr ? 'जन्म, मृत्यू, रहिवासी व १२ अधिकृत दाखले पडताळणी' : 'Verify & issue 12 official certificates',
            badge: '$pendingCerts ' + (isMr ? 'प्रलंबित मंजुरी' : 'pending'),
            badgeColor: pendingCerts > 0 ? GovdTheme.goldDark : GovdTheme.emeraldDark,
            isDark: isDark,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk())),
          ),
          const SizedBox(height: 10),

          _buildWorkHubCard(
            icon: Icons.support_agent_rounded,
            color: GovdTheme.rose,
            title: isMr ? 'नागरी तक्रार निवारण कक्ष' : 'Grievance Redressal Desk',
            subtitle: isMr ? 'पाणी, रस्ते, पथदिवे व स्वच्छता तक्रारींचा निपटारा' : 'Manage & resolve civic complaints',
            badge: '$openGrievances ' + (isMr ? 'सक्रिय तक्रारी' : 'active'),
            badgeColor: openGrievances > 0 ? GovdTheme.rose : GovdTheme.emeraldDark,
            isDark: isDark,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGrievancesDesk())),
          ),
          const SizedBox(height: 10),

          _buildWorkHubCard(
            icon: Icons.point_of_sale_rounded,
            color: const Color(0xFF059669),
            title: isMr ? 'कर संकलन व पावती काउंटर' : 'Property & Water Tax Desk',
            subtitle: isMr ? 'घरपट्टी, पाणीपट्टी कर मागणी व नमुना ८ पावती' : 'Counter tax collection & receipt ledger',
            badge: '$unpaidTaxes ' + (isMr ? 'थकबाकीदार' : 'due bills'),
            badgeColor: GovdTheme.goldDark,
            isDark: isDark,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdTaxDesk())),
          ),
          const SizedBox(height: 10),

          _buildWorkHubCard(
            icon: Icons.how_to_reg_rounded,
            color: const Color(0xFF6366F1),
            title: isMr ? 'नागरिक व कर्मचारी नोंदणी कक्ष' : 'Citizen & Staff Registration',
            subtitle: isMr ? 'गावातील नागरिक, मतदार व कर्मचारी रोस्टर' : 'Resident IDs, staff list & roster',
            badge: isMr ? 'रोस्टर' : 'Roster',
            badgeColor: const Color(0xFF6366F1),
            isDark: isDark,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdUserManagementDesk())),
          ),
          const SizedBox(height: 10),

          _buildWorkHubCard(
            icon: Icons.event_seat_rounded,
            color: const Color(0xFFF97316),
            title: isMr ? 'ग्रामसभा व जाहीर प्रगटन' : 'Gram Sabha & Notices',
            subtitle: isMr ? 'ग्रामसभा आयोजन, अजेंडा व जाहीर सूचना फलक' : 'Meetings, resolutions & official notices',
            badge: '${app.notices.length} ' + (isMr ? 'सूचना' : 'notices'),
            badgeColor: const Color(0xFFF97316),
            isDark: isDark,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGramSabhaDesk())),
          ),
          const SizedBox(height: 10),

          _buildWorkHubCard(
            icon: Icons.construction_rounded,
            color: const Color(0xFF0284C7),
            title: isMr ? 'विकास प्रकल्प व निधी संनियंत्रण' : 'Infrastructure & Projects',
            subtitle: isMr ? 'रस्ते, गटारे, सौरऊर्जा कामांची प्रगती व खर्च' : 'Development works progress & budget',
            badge: '$activeProjects ' + (isMr ? 'कामे सुरू' : 'projects'),
            badgeColor: const Color(0xFF0284C7),
            isDark: isDark,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdProjectsDesk())),
          ),
          const SizedBox(height: 10),

          _buildWorkHubCard(
            icon: Icons.agriculture_rounded,
            color: const Color(0xFF0D9488),
            title: isMr ? 'शासकीय योजना व DBT थेट लाभ' : 'Govt Schemes & Subsidies',
            subtitle: isMr ? 'शेतकरी, घरकुल, निराधार योजना लाभार्थी याद्या' : 'Farmer subsidies & welfare monitoring',
            badge: '${app.schemes.length} ' + (isMr ? 'योजना' : 'schemes'),
            badgeColor: const Color(0xFF0D9488),
            isDark: isDark,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdSchemesDesk())),
          ),
          const SizedBox(height: 10),

          _buildWorkHubCard(
            icon: Icons.assignment_turned_in_rounded,
            color: const Color(0xFF8B5CF6),
            title: isMr ? 'फील्ड वर्क व स्थळ पाहणी मोड' : 'Field Work & Site Visits',
            subtitle: isMr ? 'स्थळ पाहणी, दौऱ्याची नोंद व ऑफलाइन शेरा' : 'Inspections, geo-tagging & field drafts',
            badge: isMr ? 'दौरे' : 'Visits',
            badgeColor: const Color(0xFF8B5CF6),
            isDark: isDark,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdFieldWorkScreen())),
          ),

          if (isBdo || user?.isAdmin == true) ...[
            const SizedBox(height: 10),
            _buildWorkHubCard(
              icon: Icons.account_balance_rounded,
              color: const Color(0xFF7C3AED),
              title: isMr ? 'तालुका BDO पदभार व रोस्टर' : 'BDO Appointments & Roster',
              subtitle: isMr ? 'तालुक्यातील सर्व ग्रामपंचायतींचे नेतृत्व व रिक्त पदे' : 'Taluka GP leadership & vacancies',
              badge: isMr ? 'BDO डेस्क' : 'BDO Desk',
              badgeColor: const Color(0xFF7C3AED),
              isDark: isDark,
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdAppointmentsDesk())),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildWorkHubCard({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required String badge,
    required Color badgeColor,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text(
                          title,
                          style: TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w800,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: badgeColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          badge,
                          style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: badgeColor),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 10.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),
            Icon(Icons.arrow_forward_ios_rounded, size: 12, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
          ],
        ),
      ),
    );
  }
}
