import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/universal_search_modal.dart';
import '../ai_assistant/ai_gram_mitra_modal.dart';
import '../certificates/certificates_list_screen.dart';
import '../certificates/apply_certificate_screen.dart';
import '../taxes/tax_records_screen.dart';
import '../grievances/grievances_list_screen.dart';
import '../grievances/lodge_grievance_screen.dart';
import '../schemes/schemes_list_screen.dart';
import '../notices/notices_screen.dart';
import '../projects/projects_screen.dart';
import '../directory/directory_screen.dart';
import '../../govd_app/govd_app.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  Future<void> _makePhoneCall(String phoneNumber) async {
    final clean = phoneNumber.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  String _getTimeGreeting(bool isMr) {
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
    final isDark = app.isDarkMode;

    final certs = app.certificates;
    final approvedCerts = certs.where((c) => c.status == 'approved').length;
    final pendingCerts = certs.where((c) => c.status == 'pending' || c.status == 'under_scrutiny').toList();

    final taxes = app.taxRecords;
    final unpaidTaxes = taxes.where((t) => t.dueAmount > 0).toList();

    final grievances = app.grievances;
    final activeGrievances = grievances.where((g) => g.status != 'resolved').toList();

    final schemes = app.schemes;
    final notices = app.notices;
    final latestNotice = notices.isNotEmpty ? notices.first : null;
    final featuredScheme = schemes.isNotEmpty ? schemes.first : null;

    final gpName = user?.gramPanchayat ?? 'घुलेवाडी';
    final talukaName = user?.taluka ?? 'संगमनेर';
    final districtName = user?.district ?? 'अहिल्यानगर';

    // 2026 Refined Color Tokens
    final bgColor = isDark ? const Color(0xFF0B1120) : const Color(0xFFF1F5F9);
    final cardBgColor = isDark ? const Color(0xFF172235) : Colors.white;
    final cardBorderColor = isDark ? const Color(0xFF1E2D4A) : const Color(0xFFE2E8F0);
    final titleTextColor = isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A);
    final subTextColor = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);

    // Dynamic Pending Tasks Count
    final pendingTasksCount = pendingCerts.length + unpaidTaxes.length + activeGrievances.length;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: const CustomGovAppBar(),
      // Compact, Non-Intrusive Floating AI Assistant (Fixed above bottom navigation)
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: const LinearGradient(
              colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF7C3AED).withOpacity(0.35),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: FloatingActionButton.extended(
            elevation: 0,
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.white,
            icon: const Icon(Icons.auto_awesome, color: Color(0xFFFDE68A), size: 18),
            label: Text(
              isMr ? 'AI मित्र' : 'AI Assistant',
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 0.2),
            ),
            onPressed: () => AiGramMitraModal.show(context),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => app.refreshAllData(),
        color: AppTheme.primaryOrange,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Welcome / Citizen Summary Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: isDark
                      ? const LinearGradient(
                          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        )
                      : const LinearGradient(
                          colors: [Color(0xFF0F172A), Color(0xFF1E2D4A)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.25)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.12),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${_getTimeGreeting(isMr)}, ${user?.name.split(" ").first ?? (isMr ? "नागरिक" : "Citizen")} 👋',
                                style: const TextStyle(
                                  fontSize: 16.5,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  letterSpacing: -0.2,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 3),
                              Text(
                                'ग्रामपंचायत $gpName • ता. $talukaName, जि. $districtName',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.white.withOpacity(0.75),
                                  fontWeight: FontWeight.w500,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.verified_user_rounded, color: Color(0xFFFCD34D), size: 18),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(color: Colors.white12, height: 1),
                    const SizedBox(height: 10),

                    // 3-Column Compact Statistics Bar
                    Row(
                      children: [
                        Expanded(
                          child: _buildCompactStatTile(
                            label: isMr ? 'दाखले' : 'Certificates',
                            count: '${certs.length}',
                            sub: isMr ? '$approvedCerts मंजूर' : '$approvedCerts Approved',
                            color: const Color(0xFFFCD34D),
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CertificatesListScreen())),
                          ),
                        ),
                        Container(width: 1, height: 28, color: Colors.white12),
                        Expanded(
                          child: _buildCompactStatTile(
                            label: isMr ? 'तक्रारी' : 'Grievances',
                            count: '${activeGrievances.length}',
                            sub: isMr ? 'सक्रिय' : 'Active',
                            color: const Color(0xFFFB923C),
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GrievancesListScreen())),
                          ),
                        ),
                        Container(width: 1, height: 28, color: Colors.white12),
                        Expanded(
                          child: _buildCompactStatTile(
                            label: isMr ? 'योजना' : 'Schemes',
                            count: '${schemes.length}',
                            sub: isMr ? 'उपलब्ध' : 'Available',
                            color: const Color(0xFF34D399),
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SchemesListScreen())),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // 🏛️ Official Promoted Desk Switcher Banner (If user has an Adhikari role)
              if (user != null && user.isOfficial) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0F172A), Color(0xFF1E3A8A)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.5), width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.admin_panel_settings_rounded, color: Color(0xFFFCD34D), size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user.roleDisplayMr,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              isMr ? 'शासकीय नियंत्रण कक्ष व मंजुरी डेस्क' : 'Official Administration & Approval Desk',
                              style: const TextStyle(fontSize: 10, color: Color(0xFFBFDBFE)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        onPressed: () => app.setGovdDeskMode(true),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFF59E0B),
                          foregroundColor: const Color(0xFF0F172A),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
                        ),
                        icon: const Icon(Icons.swap_horiz_rounded, size: 16),
                        label: Text(
                          isMr ? 'डॅशबोर्ड' : 'Dashboard',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // 2. MY PENDING TASKS / ATTENTION NEEDED SECTION
              if (pendingTasksCount > 0) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E2433) : const Color(0xFFFFFBEB),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isDark ? const Color(0xFFF59E0B).withOpacity(0.4) : const Color(0xFFFDE68A),
                      width: 1.2,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.pending_actions_rounded, color: AppTheme.warningAmber, size: 18),
                              const SizedBox(width: 6),
                              Text(
                                isMr
                                    ? '$pendingTasksCount बाबींवर आपले लक्ष आवश्यक आहे'
                                    : '$pendingTasksCount items need your attention',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: isDark ? const Color(0xFFFDE68A) : const Color(0xFF92400E),
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.warningAmber.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '$pendingTasksCount Action',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.warningAmber),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Divider(
                        height: 1,
                        color: isDark ? const Color(0xFF334155) : const Color(0xFFFDE68A),
                      ),
                      const SizedBox(height: 8),

                      // Item 1: Pending Certificate Application
                      if (pendingCerts.isNotEmpty)
                        _buildPendingTaskItem(
                          icon: Icons.description_rounded,
                          title: pendingCerts.first.certificateType,
                          subtitle: isMr ? 'तपासणी व पडताळणी सुरू आहे' : 'Under review by Gram Sevak',
                          statusText: isMr ? 'प्रलंबित (Pending)' : 'In Review',
                          statusColor: AppTheme.warningAmber,
                          isDark: isDark,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CertificatesListScreen())),
                        ),

                      // Item 2: Unpaid Tax Bill
                      if (unpaidTaxes.isNotEmpty) ...[
                        if (pendingCerts.isNotEmpty) const SizedBox(height: 6),
                        _buildPendingTaskItem(
                          icon: Icons.receipt_long_rounded,
                          title: isMr
                              ? 'मालमत्ता व पाणीपट्टी कर (मिळकत क्र. ${unpaidTaxes.first.propertyNo})'
                              : 'Property Tax (Property #${unpaidTaxes.first.propertyNo})',
                          subtitle: isMr
                              ? 'देय रक्कम: ₹${unpaidTaxes.first.dueAmount.toInt()} (१०% सवलत उपलब्ध)'
                              : 'Due: ₹${unpaidTaxes.first.dueAmount.toInt()} (10% rebate available)',
                          statusText: isMr ? 'देय आहे (Due)' : 'Due',
                          statusColor: AppTheme.dangerRed,
                          isDark: isDark,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TaxRecordsScreen())),
                        ),
                      ],

                      // Item 3: Active Grievance
                      if (activeGrievances.isNotEmpty) ...[
                        if (pendingCerts.isNotEmpty || unpaidTaxes.isNotEmpty) const SizedBox(height: 6),
                        _buildPendingTaskItem(
                          icon: Icons.support_agent_rounded,
                          title: activeGrievances.first.title,
                          subtitle: isMr ? 'संबंधित विभागाकडे पाठवले आहे' : 'Assigned to field staff',
                          statusText: isMr ? 'सुरू (In Progress)' : 'In Progress',
                          statusColor: const Color(0xFF2563EB),
                          isDark: isDark,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GrievancesListScreen())),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // 3. Universal Search Bar with AI Chip
              InkWell(
                onTap: () => UniversalSearchModal.show(context),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  decoration: BoxDecoration(
                    color: cardBgColor,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: cardBorderColor, width: 1.2),
                    boxShadow: isDark
                        ? []
                        : [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.03),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.search_rounded, color: AppTheme.primaryOrange, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          isMr ? 'दाखले, योजना, कर, सूचना शोधा...' : 'Search services, certificates, schemes...',
                          style: TextStyle(
                            fontSize: 12.5,
                            color: subTextColor,
                            fontWeight: FontWeight.w500,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF4F46E5).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.auto_awesome, color: Color(0xFF4F46E5), size: 12),
                            const SizedBox(width: 4),
                            Text(
                              isMr ? 'AI शोध' : 'AI Search',
                              style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF4F46E5)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Official Admin Banner (If Sarpanch / Gram Sevak / Staff logged in)
              if (user != null && user.isOfficial) ...[
                InkWell(
                  onTap: () {
                    app.setGovdDeskMode(true);
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1E1B4B), Color(0xFF312E81)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.4)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.admin_panel_settings_rounded, color: Color(0xFFF59E0B), size: 20),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user.roleDisplayMr,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
                              ),
                              Text(
                                isMr ? 'दाखले मंजुरी व कार्यालयीन कामकाज' : 'Official approvals & governance',
                                style: TextStyle(fontSize: 10.5, color: Colors.white.withOpacity(0.8)),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            isMr ? 'डेस्क उघडा →' : 'Open Desk →',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // 4. Quick Services (4 Core Compact Cards)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildSectionTitle(isMr ? 'जलद नागरिक सेवा' : 'Quick Services', titleTextColor),
                  InkWell(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CertificatesListScreen())),
                    child: Text(
                      isMr ? 'सर्व सेवा →' : 'See all →',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 1.28,
                children: [
                  _buildCitizenServiceCard(
                    title: isMr ? 'दाखले व प्रमाणपत्रे' : 'Certificates & NOC',
                    subtitle: isMr ? 'रहिवासी, जन्म, उत्पन्न' : 'Residence • Birth • Income',
                    badge: '${certs.length} ${isMr ? "अर्ज" : "Apps"}',
                    color: const Color(0xFF2563EB),
                    icon: Icons.description_rounded,
                    isDark: isDark,
                    cardBg: cardBgColor,
                    borderColor: cardBorderColor,
                    titleColor: titleTextColor,
                    subColor: subTextColor,
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CertificatesListScreen())),
                  ),
                  _buildCitizenServiceCard(
                    title: isMr ? 'मालमत्ता व पाणीपट्टी कर' : 'Property & Water Tax',
                    subtitle: isMr ? 'ऑनलाइन भरणा व पावती' : 'Pay bills online & receipts',
                    badge: isMr ? '१०% सवलत' : '10% Rebate',
                    color: const Color(0xFF059669),
                    icon: Icons.receipt_long_rounded,
                    isDark: isDark,
                    cardBg: cardBgColor,
                    borderColor: cardBorderColor,
                    titleColor: titleTextColor,
                    subColor: subTextColor,
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TaxRecordsScreen())),
                  ),
                  _buildCitizenServiceCard(
                    title: isMr ? 'तक्रार निवारण कक्ष' : 'Grievance Desk',
                    subtitle: isMr ? 'पाणी, रस्ते व दिवाबत्ती' : 'Water, road & lighting',
                    badge: '${activeGrievances.length} ${isMr ? "सुरू" : "Active"}',
                    color: const Color(0xFFD97706),
                    icon: Icons.support_agent_rounded,
                    isDark: isDark,
                    cardBg: cardBgColor,
                    borderColor: cardBorderColor,
                    titleColor: titleTextColor,
                    subColor: subTextColor,
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GrievancesListScreen())),
                  ),
                  _buildCitizenServiceCard(
                    title: isMr ? 'शासकीय योजना' : 'Govt Schemes',
                    subtitle: isMr ? 'पात्रता व थेट लाभ' : 'View schemes & apply',
                    badge: '${schemes.length} ${isMr ? "योजना" : "Live"}',
                    color: const Color(0xFF9333EA),
                    icon: Icons.layers_rounded,
                    isDark: isDark,
                    cardBg: cardBgColor,
                    borderColor: cardBorderColor,
                    titleColor: titleTextColor,
                    subColor: subTextColor,
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SchemesListScreen())),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // 5. Gram Sabha & Important Notices
              if (latestNotice != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardBgColor,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: cardBorderColor, width: 1.2),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.event_note_rounded, color: AppTheme.primaryOrange, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                isMr ? 'ग्रामसभा व सूचना' : 'Gram Sabha & Notices',
                                style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: titleTextColor),
                              ),
                            ],
                          ),
                          InkWell(
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NoticesScreen())),
                            child: Text(
                              isMr ? 'सर्व सूचना →' : 'View All →',
                              style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF2E2413) : const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: isDark ? const Color(0xFF92400E) : const Color(0xFFFDE68A)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF78350F) : const Color(0xFFFEF3C7),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    latestNotice.type.toUpperCase(),
                                    style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: Color(0xFFD97706)),
                                  ),
                                ),
                                Text(
                                  latestNotice.date ?? '18 Sep 2026',
                                  style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: subTextColor),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              isMr ? latestNotice.titleMr : latestNotice.titleEn,
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: isDark ? Colors.white : const Color(0xFF0F172A)),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              isMr ? latestNotice.descriptionMr : latestNotice.descriptionEn,
                              style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (latestNotice.venue != null) ...[
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.place_rounded, size: 13, color: AppTheme.primaryOrange),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      '${isMr ? "स्थळ:" : "Venue:"} ${latestNotice.venue} (${latestNotice.time ?? "11:00 AM"})',
                                      style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: isDark ? const Color(0xFFFDE68A) : const Color(0xFF92400E)),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
              ],

              // 6. Featured Government Scheme Banner
              if (featuredScheme != null) ...[
                InkWell(
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SchemesListScreen())),
                  borderRadius: BorderRadius.circular(18),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFBE185D), Color(0xFF7C2D12)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFBE185D).withOpacity(0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.campaign_rounded, color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isMr ? featuredScheme.titleMr : featuredScheme.titleEn,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                isMr
                                    ? 'पात्रता तपासा व अनुदान मिळवा • ₹${featuredScheme.maxSubsidy.toInt()}'
                                    : 'Check eligibility & apply • Subsidy ₹${featuredScheme.maxSubsidy.toInt()}',
                                style: TextStyle(fontSize: 10.5, color: Colors.white.withOpacity(0.85)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 14),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),
              ],

              // 7. Emergency Helplines (Compact & Actionable)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBgColor,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: cardBorderColor, width: 1.2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.emergency_rounded, color: Color(0xFFDC2626), size: 18),
                            const SizedBox(width: 8),
                            Text(
                              isMr ? 'आपत्कालीन संपर्क (२४x७)' : 'Emergency Helpline (24x7)',
                              style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: titleTextColor),
                            ),
                          ],
                        ),
                        InkWell(
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DirectoryScreen())),
                          child: Text(
                            isMr ? 'गाव संपर्क →' : 'Directory →',
                            style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildCompactEmergencyRow(
                      name: isMr ? 'ग्रामपंचायत कार्यालय' : 'Panchayat Helpline',
                      number: '1800-120-8040',
                      icon: Icons.account_balance_rounded,
                      color: const Color(0xFFF59E0B),
                      isDark: isDark,
                      onTap: () => _makePhoneCall('18001208040'),
                    ),
                    const SizedBox(height: 8),
                    _buildCompactEmergencyRow(
                      name: isMr ? 'पोलीस नियंत्रण कक्ष (Police)' : 'Police Emergency',
                      number: '112 (Toll Free)',
                      icon: Icons.local_police_rounded,
                      color: const Color(0xFF3B82F6),
                      isDark: isDark,
                      onTap: () => _makePhoneCall('112'),
                    ),
                    const SizedBox(height: 8),
                    _buildCompactEmergencyRow(
                      name: isMr ? '१०८ रुग्णवाहिका (Ambulance)' : '108 Ambulance Health',
                      number: '108 (Toll Free)',
                      icon: Icons.medical_services_rounded,
                      color: const Color(0xFF10B981),
                      isDark: isDark,
                      onTap: () => _makePhoneCall('108'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // 8. Village Projects & Officials Links
              Row(
                children: [
                  Expanded(
                    child: _buildVillageInfoCard(
                      icon: Icons.construction_rounded,
                      color: const Color(0xFF0D9488),
                      title: isMr ? 'गावातील विकासकामे' : 'Village Projects',
                      subtitle: isMr ? 'प्रगती व निधी तपशील' : 'Budget & Status',
                      isDark: isDark,
                      cardBg: cardBgColor,
                      border: cardBorderColor,
                      titleColor: titleTextColor,
                      subColor: subTextColor,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProjectsScreen())),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildVillageInfoCard(
                      icon: Icons.people_alt_rounded,
                      color: const Color(0xFF6366F1),
                      title: isMr ? 'गाव पदाधिकारी' : 'Village Officials',
                      subtitle: isMr ? 'सरपंच, ग्रामसेवक संपर्क' : 'Contact Directory',
                      isDark: isDark,
                      cardBg: cardBgColor,
                      border: cardBorderColor,
                      titleColor: titleTextColor,
                      subColor: subTextColor,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DirectoryScreen())),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, Color color) {
    return Row(
      children: [
        Container(
          width: 3.5,
          height: 15,
          decoration: BoxDecoration(
            color: AppTheme.primaryOrange,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          title,
          style: TextStyle(
            fontSize: 14.5,
            fontWeight: FontWeight.w800,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildCompactStatTile({
    required String label,
    required String count,
    required String sub,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        child: Column(
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 10.5, color: Color(0xFFCBD5E1), fontWeight: FontWeight.w600),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              count,
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color),
            ),
            Text(
              sub,
              style: TextStyle(fontSize: 9.5, color: Colors.white.withOpacity(0.7)),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPendingTaskItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required String statusText,
    required Color statusColor,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF131A26) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: statusColor, size: 16),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 10,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                statusText,
                style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: statusColor),
              ),
            ),
            const SizedBox(width: 4),
            Icon(Icons.arrow_forward_ios_rounded, size: 11, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
          ],
        ),
      ),
    );
  }

  Widget _buildCitizenServiceCard({
    required String title,
    required String subtitle,
    required String badge,
    required Color color,
    required IconData icon,
    required bool isDark,
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: borderColor, width: 1.1),
          boxShadow: isDark
              ? []
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 20),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    badge,
                    style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: color),
                  ),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: titleColor),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 1),
                Text(
                  subtitle,
                  style: TextStyle(fontSize: 10, color: subColor),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompactEmergencyRow({
    required String name,
    required String number,
    required IconData icon,
    required Color color,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
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
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    number,
                    style: TextStyle(fontSize: 10, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.call_rounded, size: 12, color: Color(0xFF10B981)),
                  SizedBox(width: 4),
                  Text('कॉल', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF10B981))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVillageInfoCard({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required bool isDark,
    required Color cardBg,
    required Color border,
    required Color titleColor,
    required Color subColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: border, width: 1.1),
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
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: titleColor),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 9.5, color: subColor),
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
}
