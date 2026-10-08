import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/app_provider.dart';
import '../../widgets/govd_theme.dart';
import '../../../models/certificate_model.dart';

class GovdApprovalsTab extends StatefulWidget {
  const GovdApprovalsTab({super.key});

  @override
  State<GovdApprovalsTab> createState() => _GovdApprovalsTabState();
}

class _GovdApprovalsTabState extends State<GovdApprovalsTab> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 6, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';

    final certs = app.certificates;
    final pendingCerts = certs.where((c) => c.status == 'pending').toList();
    final allCerts = certs;

    return Column(
      children: [
        // Tab Bar for Approvals
        Container(
          color: GovdTheme.navyDark,
          child: TabBar(
            controller: _tabController,
            isScrollable: true,
            indicatorColor: GovdTheme.gold,
            indicatorWeight: 3,
            labelColor: GovdTheme.gold,
            unselectedLabelColor: Colors.white70,
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            tabs: [
              Tab(text: isMr ? 'सर्व (${pendingCerts.length + 3})' : 'All (${pendingCerts.length + 3})'),
              Tab(text: isMr ? 'दाखले (${pendingCerts.length})' : 'Certificates (${pendingCerts.length})'),
              Tab(text: isMr ? 'तक्रारी (२)' : 'Grievances (2)'),
              Tab(text: isMr ? 'विकास प्रकल्प (१)' : 'Projects (1)'),
              Tab(text: isMr ? 'शासकीय योजना (२)' : 'Schemes (2)'),
              Tab(text: isMr ? 'इतर (०)' : 'Other (0)'),
            ],
          ),
        ),

        // Tab Bar View
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              // 1. All Pending Approvals
              _buildAllApprovalsList(context, pendingCerts, isDark, isMr, app),

              // 2. Certificates Approvals
              _buildCertificatesApprovalsList(context, allCerts, isDark, isMr, app),

              // 3. Grievances Approvals
              _buildGrievancesApprovalsList(context, isDark, isMr, app),

              // 4. Projects Approvals
              _buildProjectsApprovalsList(context, isDark, isMr),

              // 5. Schemes Approvals
              _buildSchemesApprovalsList(context, isDark, isMr),

              // 6. Other
              Center(
                child: Text(
                  isMr ? 'कोणतेही प्रलंबित इतर अर्ज नाहीत' : 'No other pending records',
                  style: TextStyle(color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAllApprovalsList(
    BuildContext context,
    List<CertificateModel> pendingCerts,
    bool isDark,
    bool isMr,
    AppProvider app,
  ) {
    if (pendingCerts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.verified_outlined, size: 54, color: Colors.grey.shade400),
            const SizedBox(height: 8),
            Text(
              isMr ? 'सर्व अर्ज मंजूर झाले आहेत!' : 'All applications are approved!',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey.shade600),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
      itemCount: pendingCerts.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (ctx, i) {
        final cert = pendingCerts[i];
        return _buildApprovalCard(
          context: ctx,
          recordId: 'CERT-${cert.id.toUpperCase()}',
          title: cert.certificateType,
          applicant: cert.applicantName,
          phone: cert.applicantPhone,
          submittedDate: cert.submissionDate,
          purpose: cert.purpose,
          status: 'Awaiting Verification',
          statusColor: GovdTheme.goldDark,
          isDark: isDark,
          isMr: isMr,
          onReview: () => _showReviewBottomSheet(ctx, cert, app, isDark, isMr),
        );
      },
    );
  }

  Widget _buildCertificatesApprovalsList(
    BuildContext context,
    List<CertificateModel> allCerts,
    bool isDark,
    bool isMr,
    AppProvider app,
  ) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
      itemCount: allCerts.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (ctx, i) {
        final cert = allCerts[i];
        final isApproved = cert.status == 'approved';
        return _buildApprovalCard(
          context: ctx,
          recordId: cert.certificateNumber ?? 'CERT-${cert.id.toUpperCase()}',
          title: cert.certificateType,
          applicant: cert.applicantName,
          phone: cert.applicantPhone,
          submittedDate: cert.submissionDate,
          purpose: cert.purpose,
          status: isApproved ? (isMr ? 'मंजूर (Approved)' : 'Approved') : (isMr ? 'पडताळणी प्रलंबित' : 'Pending Review'),
          statusColor: isApproved ? GovdTheme.emeraldDark : GovdTheme.goldDark,
          isDark: isDark,
          isMr: isMr,
          onReview: () => _showReviewBottomSheet(ctx, cert, app, isDark, isMr),
        );
      },
    );
  }

  Widget _buildGrievancesApprovalsList(BuildContext context, bool isDark, bool isMr, AppProvider app) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
      children: [
        _buildStaticApprovalCard(
          recordId: 'GRV-2026-0012',
          title: 'गणपती चौक मुख्य पथदिवा दुरुस्ती कार्य पूर्ण अहवाल',
          applicant: 'ज्ञानेश्वर संभाजी मोरे',
          date: 'आज • १०:३० AM',
          status: 'मंजुरी प्रलंबित',
          statusColor: GovdTheme.goldDark,
          isDark: isDark,
          onReview: () => _showGenericReviewDialog(context, 'GRV-2026-0012', 'तक्रार निवारण कार्य पूर्ण अहवाल', 'ज्ञानेश्वर मोरे', isDark, isMr),
        ),
        const SizedBox(height: 12),
        _buildStaticApprovalCard(
          recordId: 'GRV-2026-0015',
          title: 'वॉर्ड क्र. २ पाईपलाईन गळती दुरुस्ती मोजमाप',
          applicant: 'सुरेश कदम',
          date: 'काल • ०४:१५ PM',
          status: 'मंजुरी प्रलंबित',
          statusColor: GovdTheme.goldDark,
          isDark: isDark,
          onReview: () => _showGenericReviewDialog(context, 'GRV-2026-0015', 'पाईपलाईन दुरुस्ती खर्च मंजुरी', 'सुरेश कदम', isDark, isMr),
        ),
      ],
    );
  }

  Widget _buildProjectsApprovalsList(BuildContext context, bool isDark, bool isMr) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
      children: [
        _buildStaticApprovalCard(
          recordId: 'PROJ-APP-701',
          title: 'मुख्य रस्ता सिमेंट कॉंक्रिटीकरण टप्पा-२ देयक बिल',
          applicant: 'महाराष्ट्र ग्रामीण रस्ते विकास संस्था',
          date: '१६ सप्टें २०२६',
          status: 'तांत्रिक मंजुरी प्रलंबित (₹८,५०,०००)',
          statusColor: const Color(0xFF0284C7),
          isDark: isDark,
          onReview: () => _showGenericReviewDialog(context, 'PROJ-APP-701', 'रस्ता कॉंक्रिटीकरण देयक बिल मंजुरी', 'कंत्राटदार एजन्सी', isDark, isMr),
        ),
      ],
    );
  }

  Widget _buildSchemesApprovalsList(BuildContext context, bool isDark, bool isMr) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
      children: [
        _buildStaticApprovalCard(
          recordId: 'DBT-PMAY-045',
          title: 'पंतप्रधान आवास योजना घरकुल हप्ता-२ मंजुरी',
          applicant: 'शांताराम भिकाजी कदम',
          date: '१५ सप्टें २०२६',
          status: 'जिओ-टॅग पडताळणी पूर्ण (₹४०,०००)',
          statusColor: GovdTheme.emeraldDark,
          isDark: isDark,
          onReview: () => _showGenericReviewDialog(context, 'DBT-PMAY-045', 'घरकुल हप्ता वाटप मंजुरी', 'शांताराम कदम', isDark, isMr),
        ),
      ],
    );
  }

  Widget _buildApprovalCard({
    required BuildContext context,
    required String recordId,
    required String title,
    required String applicant,
    required String phone,
    required String submittedDate,
    required String purpose,
    required String status,
    required Color statusColor,
    required bool isDark,
    required bool isMr,
    required VoidCallback onReview,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  recordId,
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w900,
                    color: isDark ? const Color(0xFFFCD34D) : const Color(0xFF1E293B),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status,
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: statusColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.person_outline, size: 14, color: Color(0xFF64748B)),
              const SizedBox(width: 4),
              Text(
                'अर्जदार: $applicant',
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.calendar_today_outlined, size: 13, color: Color(0xFF64748B)),
              const SizedBox(width: 4),
              Text(
                submittedDate,
                style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
              ),
            ],
          ),
          if (purpose.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              'कारण: $purpose',
              style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
            ),
          ],
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'मोबाईल: $phone',
                style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
              ),
              ElevatedButton.icon(
                onPressed: onReview,
                style: ElevatedButton.styleFrom(
                  backgroundColor: GovdTheme.navyDark,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
                icon: const Icon(Icons.rate_review_rounded, size: 15, color: GovdTheme.gold),
                label: Text(
                  isMr ? 'तपासा व मंजुरी द्या (Review)' : 'Review & Approve',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStaticApprovalCard({
    required String recordId,
    required String title,
    required String applicant,
    required String date,
    required String status,
    required Color statusColor,
    required bool isDark,
    required VoidCallback onReview,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(recordId, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: statusColor.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                child: Text(status, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(title, style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: isDark ? Colors.white : const Color(0xFF0F172A))),
          const SizedBox(height: 4),
          Text('अर्जदार/कंत्राटदार: $applicant • $date', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton.icon(
              onPressed: onReview,
              style: ElevatedButton.styleFrom(
                backgroundColor: GovdTheme.navyDark,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              ),
              icon: const Icon(Icons.rate_review_rounded, size: 14, color: GovdTheme.gold),
              label: const Text('तपासा (Review)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  // REVIEW BOTTOM SHEET (DETAILED APPLICATION VERIFICATION)
  void _showReviewBottomSheet(
    BuildContext context,
    CertificateModel cert,
    AppProvider app,
    bool isDark,
    bool isMr,
  ) {
    bool chk1 = true;
    bool chk2 = true;
    bool chk3 = true;
    bool chk4 = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
          height: MediaQuery.of(context).size.height * 0.9,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag Handle
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Sheet Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isMr ? 'दाखला छाननी व मंजुरी कक्ष' : 'Application Review',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        'Application ID: CERT-${cert.id.toUpperCase()}',
                        style: const TextStyle(fontSize: 11, color: GovdTheme.goldDark, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const Divider(height: 16),

              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. Citizen Details
                      Text(isMr ? '👤 अर्जदार माहिती (Applicant Details)' : 'Applicant Details', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          children: [
                            _buildModalInfoRow('पूर्ण नाव:', cert.applicantName),
                            _buildModalInfoRow('मोबाईल:', cert.applicantPhone),
                            _buildModalInfoRow('दाखला प्रकार:', cert.certificateType),
                            _buildModalInfoRow('अर्ज कारण/उद्देश:', cert.purpose),
                            _buildModalInfoRow('गाव/ग्रामपंचायत:', '${cert.gramPanchayat}, ता. ${cert.taluka}'),
                            _buildModalInfoRow('आधार क्रमांक:', cert.aadhaar != null ? 'XXXX-XXXX-4567' : 'सत्यापित'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),

                      // 2. Verification Checklist
                      Text(isMr ? '✓ अधिकृत पडताळणी चेकलिस्ट' : 'Verification Checklist', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      CheckboxListTile(
                        dense: true,
                        value: chk1,
                        activeColor: GovdTheme.emeraldDark,
                        title: const Text('१. अर्जदाराची वैयक्तिक माहिती व ओळख पडताळली.', style: TextStyle(fontSize: 11.5)),
                        contentPadding: EdgeInsets.zero,
                        onChanged: (v) => setSheetState(() => chk1 = v ?? true),
                      ),
                      CheckboxListTile(
                        dense: true,
                        value: chk2,
                        activeColor: GovdTheme.emeraldDark,
                        title: const Text('२. आवश्यक रहिवासी पुरावा व कागदपत्रे वैध आहेत.', style: TextStyle(fontSize: 11.5)),
                        contentPadding: EdgeInsets.zero,
                        onChanged: (v) => setSheetState(() => chk2 = v ?? true),
                      ),
                      CheckboxListTile(
                        dense: true,
                        value: chk3,
                        activeColor: GovdTheme.emeraldDark,
                        title: const Text('३. घरपट्टी व पाणीपट्टी कर थकबाकी नाही.', style: TextStyle(fontSize: 11.5)),
                        contentPadding: EdgeInsets.zero,
                        onChanged: (v) => setSheetState(() => chk3 = v ?? true),
                      ),
                      CheckboxListTile(
                        dense: true,
                        value: chk4,
                        activeColor: GovdTheme.emeraldDark,
                        title: const Text('४. ग्रामपंचायत कार्यक्षेत्र निवासी असल्याबाबत खात्री झाली.', style: TextStyle(fontSize: 11.5)),
                        contentPadding: EdgeInsets.zero,
                        onChanged: (v) => setSheetState(() => chk4 = v ?? true),
                      ),
                    ],
                  ),
                ),
              ),

              const Divider(height: 20),

              // Action Buttons: Approve, Reject, Request Correction
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _showCorrectionReasonDialog(context, cert, app);
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: GovdTheme.goldDark,
                        side: const BorderSide(color: GovdTheme.goldDark),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('त्रुटी काढा (Correction)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _showRejectReasonDialog(context, cert, app);
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: GovdTheme.rose,
                        side: const BorderSide(color: GovdTheme.rose),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('नाकारा (Reject)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _confirmApproveDialog(context, cert, app);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: GovdTheme.emeraldDark,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.verified_rounded, size: 16),
                      label: const Text('मंजूर व सही करा', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModalInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          Text(value, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  void _confirmApproveDialog(BuildContext context, CertificateModel cert, AppProvider app) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('दाखला मंजुरी निश्चित करा', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Text('आपण खात्रीपूर्वक श्री/श्रीमती ${cert.applicantName} यांचा ${cert.certificateType} अर्ज मंजूर करू इच्छिता का?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.emeraldDark, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              await app.approveCertificate(cert.id);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('✅ ${cert.applicantName} यांचा दाखला डिजिटल स्वाक्षरीसह मंजूर झाला!'),
                    backgroundColor: GovdTheme.emeraldDark,
                  ),
                );
              }
            },
            child: const Text('होय, मंजूर करा'),
          ),
        ],
      ),
    );
  }

  void _showRejectReasonDialog(BuildContext context, CertificateModel cert, AppProvider app) {
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('दाखला अर्ज नाकारा', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: GovdTheme.rose)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('अर्जदार: ${cert.applicantName} (${cert.certificateType})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            TextField(
              controller: reasonController,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'नाकारण्याचे अनिवार्य कारण प्रविष्ट करा',
                hintText: 'उदा. सादर केलेले पुरावे अपूर्ण आहेत...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.rose, foregroundColor: Colors.white),
            onPressed: () async {
              if (reasonController.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              await app.rejectCertificate(cert.id, reason: reasonController.text.trim());
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('दाखला अर्ज नाकारण्यात आला.'), backgroundColor: GovdTheme.rose),
                );
              }
            },
            child: const Text('अर्ज नाकारा'),
          ),
        ],
      ),
    );
  }

  void _showCorrectionReasonDialog(BuildContext context, CertificateModel cert, AppProvider app) {
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('त्रुटी पूर्तता सूचना (Request Correction)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: GovdTheme.goldDark)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('अर्जदार: ${cert.applicantName}', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            TextField(
              controller: reasonController,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'आवश्यक सुधारणा / कागदपत्रांची माहिती',
                hintText: 'उदा. कृपया चालू वर्षाची घरपट्टी पावती जोडा...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.goldDark, foregroundColor: Colors.white),
            onPressed: () {
              if (reasonController.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('नागरिकाकडे त्रुटी पूर्तता सूचना पाठवण्यात आली.'), backgroundColor: GovdTheme.goldDark),
              );
            },
            child: const Text('सूचना पाठवा'),
          ),
        ],
      ),
    );
  }

  void _showGenericReviewDialog(BuildContext context, String id, String title, String applicant, bool isDark, bool isMr) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ID: $id', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
            Text('संबंधित: $applicant', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('सर्व तपासणी नोंदी व अहवाल समाधानकारक आढळले आहेत.', style: TextStyle(fontSize: 11.5)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.emeraldDark, foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('✅ $id यशस्वीरीत्या मंजूर करण्यात आले!'), backgroundColor: GovdTheme.emeraldDark),
              );
            },
            child: const Text('मंजूर करा (Approve)'),
          ),
        ],
      ),
    );
  }
}
