import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../models/certificate_model.dart';
import '../widgets/govd_theme.dart';

class GovdCertificatesDesk extends StatefulWidget {
  const GovdCertificatesDesk({super.key});

  @override
  State<GovdCertificatesDesk> createState() => _GovdCertificatesDeskState();
}

class _GovdCertificatesDeskState extends State<GovdCertificatesDesk> {
  String _selectedStatus = 'all'; // 'all', 'pending', 'approved', 'rejected'
  String _searchQuery = '';

  void _openCertificateReview(BuildContext context, CertificateModel cert, AppProvider app, bool isMr) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.9,
        ),
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 16,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          child: Column(
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

              // Certificate Title & Number
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          cert.certificateType,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                        ),
                        Text(
                          'अर्ज क्र: ${cert.certificateNumber ?? cert.id}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.slateMedium),
                        ),
                      ],
                    ),
                  ),
                  _buildStatusBadge(cert.status, isMr),
                ],
              ),
              const SizedBox(height: 14),
              const Divider(),
              const SizedBox(height: 10),

              // 1. Applicant Information Box
              Text(
                isMr ? '१. अर्जदाराची माहिती (Applicant Details)' : '1. Applicant Details',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    _buildDetailRow(Icons.person_outline_rounded, isMr ? 'नाव:' : 'Name:', cert.applicantName),
                    const SizedBox(height: 6),
                    _buildDetailRow(Icons.phone_android_rounded, isMr ? 'मोबाईल:' : 'Mobile:', cert.applicantPhone),
                    const SizedBox(height: 6),
                    _buildDetailRow(Icons.home_outlined, isMr ? 'पत्ता / वॉर्ड:' : 'Address:', '${cert.wardNo} • ${cert.gramPanchayat}'),
                    const SizedBox(height: 6),
                    _buildDetailRow(Icons.calendar_today_outlined, isMr ? 'अर्ज दिनांक:' : 'Applied:', cert.submissionDate),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // 2. Document Checklist
              Text(
                isMr ? '२. कागदपत्र पडताळणी सूची (Document Checklist)' : '2. Document Checklist',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    _buildDocCheckItem('आधार कार्ड (Aadhaar Card)', true),
                    const Divider(height: 12),
                    _buildDocCheckItem('रेशन कार्ड / रहिवासी पुरावा (Ration Card)', true),
                    const Divider(height: 12),
                    _buildDocCheckItem('ग्रामपंचायत कर भरणा पावती (Tax Receipt)', true),
                    const Divider(height: 12),
                    _buildDocCheckItem('स्वयंघोषणापत्र (Self Declaration)', true),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // 3. Uploaded Documents Preview
              Text(
                isMr ? '३. जोडलेली कागदपत्रे (Uploaded Documents)' : '3. Uploaded Documents',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildDocFileTile('aadhaar_card.pdf', isMr ? 'आधार प्रत' : 'Aadhaar'),
                  const SizedBox(width: 10),
                  _buildDocFileTile('tax_receipt.pdf', isMr ? 'कर पावती' : 'Tax Receipt'),
                ],
              ),
              const SizedBox(height: 20),

              // 4. Officer Actions (Approve, Reject, Request Correction)
              if (cert.status == 'pending') ...[
                Text(
                  isMr ? 'प्रशासकीय निर्णय पर्याय (Officer Actions):' : 'Officer Actions:',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _confirmApproveCertificate(context, cert, app, isMr, ctx),
                        icon: const Icon(Icons.check_circle_outline_rounded, size: 16),
                        label: Text(
                          isMr ? 'मंजूर करा' : 'Approve',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: GovdTheme.emerald,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _showRejectDialog(context, cert, app, isMr, ctx),
                        icon: const Icon(Icons.cancel_outlined, size: 16),
                        label: Text(
                          isMr ? 'नाकारा' : 'Reject',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: GovdTheme.rose,
                          side: const BorderSide(color: GovdTheme.rose),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: TextButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(isMr ? 'नागरिकाला दुरुस्ती सूचना पाठवली गेली.' : 'Correction request sent to citizen.'),
                          backgroundColor: GovdTheme.goldDark,
                        ),
                      );
                    },
                    icon: const Icon(Icons.edit_note_rounded, size: 16, color: GovdTheme.navyDark),
                    label: Text(
                      isMr ? 'कागदपत्र दुरुस्तीची मागणी करा' : 'Request Correction',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmApproveCertificate(BuildContext context, CertificateModel cert, AppProvider app, bool isMr, BuildContext parentModalCtx) {
    showDialog(
      context: context,
      builder: (dCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Row(
          children: [
            const Icon(Icons.verified_rounded, color: GovdTheme.emerald, size: 22),
            const SizedBox(width: 8),
            Text(isMr ? 'दाखला मंजुरी निश्चिती' : 'Approve Certificate', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          isMr
              ? 'आपण ${cert.applicantName} यांचा "${cert.certificateType}" मंजूर करू इच्छिता का? मंजुरीनंतर डिजिटल स्वाक्षरीसह दाखला तयार होईल.'
              : 'Are you sure you want to approve this ${cert.certificateType} for ${cert.applicantName}?',
          style: const TextStyle(fontSize: 12.5, color: Color(0xFF334155)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dCtx),
            child: Text(isMr ? 'रद्द करा' : 'Cancel', style: const TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: GovdTheme.emerald,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              app.approveCertificate(cert.id);
              Navigator.pop(dCtx);
              Navigator.pop(parentModalCtx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(isMr ? 'दाखला यशस्वीरित्या मंजूर करण्यात आला!' : 'Certificate approved successfully!'),
                  backgroundColor: GovdTheme.emerald,
                ),
              );
            },
            child: Text(isMr ? 'होय, मंजूर करा' : 'Yes, Approve'),
          ),
        ],
      ),
    );
  }

  void _showRejectDialog(BuildContext context, CertificateModel cert, AppProvider app, bool isMr, BuildContext parentModalCtx) {
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (dCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Row(
          children: [
            const Icon(Icons.cancel_rounded, color: GovdTheme.rose, size: 22),
            const SizedBox(width: 8),
            Text(isMr ? 'दाखला नाकारण्याचे कारण' : 'Reject Certificate', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isMr ? 'कृपया अर्ज नाकारण्याचे स्पष्ट कारण नमूद करा:' : 'Please enter the reason for rejection:',
              style: const TextStyle(fontSize: 12, color: GovdTheme.slateMedium),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: reasonController,
              maxLines: 2,
              decoration: InputDecoration(
                hintText: isMr ? 'उदा. अपूर्ण कागदपत्रे / कर थकबाकी.' : 'e.g. Incomplete documents.',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.all(10),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dCtx),
            child: Text(isMr ? 'रद्द करा' : 'Cancel', style: const TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: GovdTheme.rose,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              final reason = reasonController.text.trim().isNotEmpty
                  ? reasonController.text.trim()
                  : (isMr ? 'अपूर्ण कागदपत्रांमुळे नाकारला.' : 'Rejected due to incomplete documents.');
              app.rejectCertificate(cert.id, reason: reason);
              Navigator.pop(dCtx);
              Navigator.pop(parentModalCtx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(isMr ? 'अर्ज नाकारण्यात आला.' : 'Application rejected.'),
                  backgroundColor: GovdTheme.rose,
                ),
              );
            },
            child: Text(isMr ? 'नाकारा' : 'Reject'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 14, color: GovdTheme.slateMedium),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 11, color: GovdTheme.slateMedium, fontWeight: FontWeight.w600)),
        const SizedBox(width: 6),
        Expanded(
          child: Text(value, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: GovdTheme.navyDark)),
        ),
      ],
    );
  }

  Widget _buildDocCheckItem(String title, bool isVerified) {
    return Row(
      children: [
        Icon(
          isVerified ? Icons.check_circle_rounded : Icons.pending_outlined,
          size: 16,
          color: isVerified ? GovdTheme.emerald : GovdTheme.goldDark,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: GovdTheme.navyDark),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: GovdTheme.emerald.withOpacity(0.1),
            borderRadius: BorderRadius.circular(4),
          ),
          child: const Text('तपासले ✓', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: GovdTheme.emerald)),
        ),
      ],
    );
  }

  Widget _buildDocFileTile(String filename, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Row(
          children: [
            const Icon(Icons.picture_as_pdf_rounded, color: GovdTheme.rose, size: 24),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.navyDark)),
                  Text(filename, style: const TextStyle(fontSize: 9, color: GovdTheme.slateMedium), maxLines: 1),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status, bool isMr) {
    Color bg;
    Color fg;
    String label;

    switch (status) {
      case 'approved':
        bg = GovdTheme.emerald.withOpacity(0.12);
        fg = GovdTheme.emerald;
        label = isMr ? 'मंजूर' : 'Issued';
        break;
      case 'rejected':
        bg = GovdTheme.rose.withOpacity(0.12);
        fg = GovdTheme.rose;
        label = isMr ? 'नाकारला' : 'Rejected';
        break;
      default:
        bg = GovdTheme.gold.withOpacity(0.15);
        fg = GovdTheme.goldDark;
        label = isMr ? 'प्रलंबित' : 'Pending';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: fg.withOpacity(0.3)),
      ),
      child: Text(label, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: fg)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final allCerts = app.certificates;
    final isMr = app.language == 'mr';

    final filteredCerts = allCerts.where((cert) {
      if (_selectedStatus != 'all' && cert.status != _selectedStatus) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = cert.applicantName.toLowerCase();
        final phone = cert.applicantPhone.toLowerCase();
        final type = cert.certificateType.toLowerCase();
        final num = (cert.certificateNumber ?? '').toLowerCase();
        if (!name.contains(q) && !phone.contains(q) && !type.contains(q) && !num.contains(q)) {
          return false;
        }
      }
      return true;
    }).toList();

    final pendingCount = allCerts.where((c) => c.status == 'pending').length;

    return Scaffold(
      backgroundColor: GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isMr ? 'दाखला व प्रमाणपत्र मंजुरी कक्ष' : 'Certificate Management',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              isMr ? 'डिजिटल स्वाक्षरी व वितरण डेस्क' : 'Digital Verification & Issuance',
              style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Top Banner (Section 8: Pending Verification: N)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: GovdTheme.navyDark,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: GovdTheme.gold.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.assignment_late_rounded, color: GovdTheme.gold, size: 18),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          isMr ? 'प्रलंबित पडताळणी अर्ज:' : 'Pending Verification:',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: GovdTheme.saffron,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$pendingCount',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),

          // Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v),
              decoration: InputDecoration(
                hintText: isMr ? 'अर्जदार, दाखला प्रकार किंवा अर्ज क्र. शोधा...' : 'Search applicant, type or application no...',
                hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                prefixIcon: const Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
            ),
          ),

          // Filter Chips (Horizontally Scrollable for Small Screens)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('all', isMr ? 'सर्व (${allCerts.length})' : 'All (${allCerts.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('pending', isMr ? '🟡 प्रलंबित ($pendingCount)' : '🟡 Pending ($pendingCount)'),
                  const SizedBox(width: 8),
                  _buildFilterChip('approved', isMr ? '🟢 मंजूर' : '🟢 Approved'),
                ],
              ),
            ),
          ),

          // Cards List (Section 8)
          Expanded(
            child: filteredCerts.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.fact_check_outlined, size: 48, color: GovdTheme.slateLight),
                        const SizedBox(height: 8),
                        Text(
                          isMr ? 'कोणतेही दाखला अर्ज उपलब्ध नाहीत' : 'No certificate applications found',
                          style: const TextStyle(color: GovdTheme.slateMedium, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredCerts.length,
                    itemBuilder: (context, index) {
                      final cert = filteredCerts[index];
                      return _buildSection8CertificateCard(cert, app, isMr);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _selectedStatus == value;
    return InkWell(
      onTap: () => setState(() => _selectedStatus = value),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? GovdTheme.navyDark : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? GovdTheme.navyDark : Colors.grey.shade300),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
            color: isSelected ? Colors.white : GovdTheme.navyDark,
          ),
        ),
      ),
    );
  }

  // Exact Section 8 Card Layout (Responsive and Anti-Collision):
  // Residence Certificate
  // Applicant: XYZ
  // Applied: 18 Sep
  // Status: Pending
  // [Review]
  Widget _buildSection8CertificateCard(CertificateModel cert, AppProvider app, bool isMr) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Certificate Type & Status
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: GovdTheme.gold.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.description_rounded, color: GovdTheme.goldDark, size: 18),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      cert.certificateType,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                    ),
                    if (cert.certificateNumber != null && cert.certificateNumber!.isNotEmpty)
                      Text(
                        cert.certificateNumber!,
                        style: const TextStyle(fontSize: 10.5, color: GovdTheme.slateMedium, fontWeight: FontWeight.bold),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _buildStatusBadge(cert.status, isMr),
            ],
          ),
          const SizedBox(height: 10),

          // Applicant & Applied Date
          Text(
            '${isMr ? "अर्जदार:" : "Applicant:"} ${cert.applicantName}',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: GovdTheme.navyDark),
          ),
          const SizedBox(height: 3),
          Text(
            '${isMr ? "अर्ज दिनांक:" : "Applied:"} ${cert.submissionDate} • ${cert.wardNo ?? ""}',
            style: const TextStyle(fontSize: 11.5, color: GovdTheme.slateMedium),
          ),
          const SizedBox(height: 12),

          // Review Button
          SizedBox(
            width: double.infinity,
            height: 42,
            child: ElevatedButton(
              onPressed: () => _openCertificateReview(context, cert, app, isMr),
              style: ElevatedButton.styleFrom(
                backgroundColor: GovdTheme.navyDark,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: Text(
                isMr ? 'तपासा व निर्णय घ्या (Review) →' : 'Review →',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
