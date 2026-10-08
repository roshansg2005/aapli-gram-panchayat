import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/status_badge.dart';
import 'apply_certificate_screen.dart';
import 'certificate_view_dialog.dart';

class CertificatesListScreen extends StatefulWidget {
  final bool showBackButton;
  const CertificatesListScreen({super.key, this.showBackButton = false});

  @override
  State<CertificatesListScreen> createState() => _CertificatesListScreenState();
}

class _CertificatesListScreenState extends State<CertificatesListScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _catalogTypes = [
    {
      'type': 'रहिवासी दाखला (Residence Certificate)',
      'fee': 20.0,
      'days': 2,
      'icon': Icons.home_work_rounded,
      'color': const Color(0xFF2563EB),
      'docs': 'आधार कार्ड, घरपट्टी पावती, रेशन कार्ड',
    },
    {
      'type': 'जन्म दाखला (Birth Certificate)',
      'fee': 25.0,
      'days': 3,
      'icon': Icons.child_care_rounded,
      'color': const Color(0xFF059669),
      'docs': 'दवाखाना डिस्चार्ज कार्ड, पालकांचे आधार',
    },
    {
      'type': 'मृत्यू दाखला (Death Certificate)',
      'fee': 25.0,
      'days': 3,
      'icon': Icons.person_off_rounded,
      'color': const Color(0xFF64748B),
      'docs': 'वैद्यकीय प्रमाणपत्र, स्मशानभूमी पावती',
    },
    {
      'type': 'उत्पन्नाचा दाखला (Income Certificate)',
      'fee': 30.0,
      'days': 4,
      'icon': Icons.account_balance_wallet_rounded,
      'color': const Color(0xFFD97706),
      'docs': '७/१२ उतारा, कर पावती, उत्पन्नाचे स्वयंघोषणापत्र',
    },
    {
      'type': 'विवाह नोंदणी दाखला (Marriage Certificate)',
      'fee': 50.0,
      'days': 5,
      'icon': Icons.favorite_rounded,
      'color': const Color(0xFFDB2777),
      'docs': 'लग्नपत्रिका, वधू-वरांचे आधार व फोटो',
    },
    {
      'type': 'दारिद्र्य रेषेखालील दाखला (BPL Certificate)',
      'fee': 20.0,
      'days': 2,
      'icon': Icons.layers_rounded,
      'color': const Color(0xFF7C3AED),
      'docs': 'पिवळे रेशन कार्ड, ग्रामसभा यादी प्रत',
    },
    {
      'type': 'थकबाकी नसलेला दाखला (No Dues Certificate)',
      'fee': 20.0,
      'days': 1,
      'icon': Icons.check_circle_rounded,
      'color': const Color(0xFF0D9488),
      'docs': 'चालू वर्षाची घरपट्टी व पाणीपट्टी पावती',
    },
    {
      'type': 'शौचालय दाखला (Toilet Facility Certificate)',
      'fee': 20.0,
      'days': 2,
      'icon': Icons.clean_hands_rounded,
      'color': const Color(0xFF0284C7),
      'docs': 'शौचालयाचा जिओटॅग फोटो, मिळकत कर पावती',
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
    final certs = app.certificates;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9),
      appBar: CustomGovAppBar(
        title: app.tr('certificatesTitle'),
        showBackButton: widget.showBackButton,
      ),
      body: Column(
        children: [
          // 2-Tab Navigation Bar: [ Apply Now ] [ My Applications ]
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
                        const Icon(Icons.add_circle_outline_rounded, size: 15),
                        const SizedBox(width: 4),
                        Flexible(
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(isMr ? 'नवीन अर्ज' : 'Apply Now'),
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
                        const Icon(Icons.folder_shared_rounded, size: 15),
                        const SizedBox(width: 4),
                        Flexible(
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text('${isMr ? "माझे अर्ज" : "My Apps"} (${certs.length})'),
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
                // Tab 1: Apply Now (Certificate Catalog)
                _buildCatalogTab(context, app, isMr, isDark),

                // Tab 2: My Applications & Digital Certificates
                _buildMyApplicationsTab(context, app, certs, isMr, isDark),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCatalogTab(BuildContext context, AppProvider app, bool isMr, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1E3A8A), Color(0xFF1E1B4B)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF1E3A8A).withOpacity(0.2),
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
                child: const Icon(Icons.verified_user_rounded, color: Color(0xFFFDE68A), size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isMr ? 'डिजिटल स्वाक्षरीसह अधिकृत दाखले' : 'Digitally Signed Official Certificates',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isMr
                          ? 'घरबसल्या अर्ज करा, शुल्क भरा व थेट डिजिटल दाखला मिळवा.'
                          : 'Apply online, pay fee & download verified certificate.',
                      style: const TextStyle(fontSize: 10.5, color: Color(0xFFCBD5E1)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        Text(
          isMr ? 'उपलब्ध दाखल्यांचे प्रकार' : 'Available Certificate Services',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w900,
            color: isDark ? Colors.white : const Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 10),

        ..._catalogTypes.map((item) {
          final type = item['type'] as String;
          final fee = (item['fee'] as double).toInt();
          final days = item['days'] as int;
          final icon = item['icon'] as IconData;
          final color = item['color'] as Color;
          final docs = item['docs'] as String;

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(15),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(9),
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
                            Text(
                              type,
                              style: TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w900,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    'शुल्क: ₹$fee',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      color: isDark ? const Color(0xFF6EE7B7) : const Color(0xFF047857),
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF1E3A8A) : const Color(0xFFEFF6FF),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    'कालावधी: $days दिवस',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      color: isDark ? const Color(0xFF93C5FD) : const Color(0xFF1D4ED8),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.attach_file_rounded, size: 14, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'आवश्यक कागदपत्रे: $docs',
                            style: TextStyle(fontSize: 10.5, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ApplyCertificateScreen(),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryOrange,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        elevation: 0,
                      ),
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.edit_document, size: 16),
                            const SizedBox(width: 6),
                            Text(
                              isMr ? 'या दाखल्यासाठी अर्ज करा ➔' : 'Apply for this Certificate ➔',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildMyApplicationsTab(BuildContext context, AppProvider app, List certs, bool isMr, bool isDark) {
    if (certs.isEmpty) {
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
              child: const Icon(Icons.folder_open_rounded, size: 48, color: AppTheme.primaryOrange),
            ),
            const SizedBox(height: 16),
            Text(
              isMr ? 'अद्याप कोणतेही दाखले अर्ज केलेले नाहीत' : 'No certificate applications yet.',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              isMr ? 'नवीन दाखल्यासाठी "नवीन दाखला अर्ज" टॅब वापरा.' : 'Click "Apply Now" tab to submit a new application.',
              style: TextStyle(fontSize: 12, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: certs.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final cert = certs[index];
        final isApproved = cert.status == 'approved';

        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isApproved ? const Color(0xFF10B981).withOpacity(0.5) : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
              width: isApproved ? 1.5 : 1.0,
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
                    Expanded(
                      child: Text(
                        cert.certificateType,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                    ),
                    StatusBadge(status: cert.status),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.tag_rounded, size: 14, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        'अर्ज क्र: ${cert.id.toUpperCase()}',
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
                      cert.submissionDate,
                      style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // 5-Step Status Timeline
                _buildStatusTimeline(cert.status, isDark, isMr),
                const SizedBox(height: 10),

                // Details Card
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('अर्जदार:', style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              cert.applicantName,
                              textAlign: TextAlign.end,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('उद्देश:', style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              cert.purpose,
                              textAlign: TextAlign.end,
                              style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('शुल्क भरणा:', style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '₹${cert.fee.toInt()} (Paid • भरणा पूर्ण)',
                              textAlign: TextAlign.end,
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Actions for Approved Certificate
                if (isApproved) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (_) => CertificateViewDialog(certificate: cert),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF047857),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            elevation: 0,
                          ),
                          icon: const Icon(Icons.verified_rounded, size: 16),
                          label: Text(
                            isMr ? 'दाखला पहा (View)' : 'View Certificate',
                            style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 1,
                        child: OutlinedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(isMr ? 'PDF सेव्ह झाली!' : 'PDF Saved!'),
                                backgroundColor: AppTheme.successGreen,
                              ),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: isDark ? Colors.white70 : const Color(0xFF0F172A),
                            side: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                          icon: const Icon(Icons.download_rounded, size: 16),
                          label: const Text('PDF', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatusTimeline(String status, bool isDark, bool isMr) {
    // 5 status steps: 0: Submitted, 1: Verified, 2: Under Review, 3: Approved, 4: Ready
    int activeStep = 0;
    if (status == 'documents_verified') activeStep = 1;
    if (status == 'under_scrutiny' || status == 'in_progress') activeStep = 2;
    if (status == 'approved') activeStep = 4;
    if (status == 'rejected') activeStep = -1;

    final steps = isMr
        ? ['अर्ज सादर', 'कागदपत्रे तपासणी', 'पुनरावलोकन', 'मंजूर', 'तयार']
        : ['Submitted', 'Docs Verified', 'In Review', 'Approved', 'Ready'];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0B1324) : const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(5, (idx) {
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
                    if (idx < 4)
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
                    fontSize: 8,
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
