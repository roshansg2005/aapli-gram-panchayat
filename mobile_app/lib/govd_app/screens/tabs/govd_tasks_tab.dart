import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/app_provider.dart';
import '../../widgets/govd_theme.dart';
import '../govd_grievances_desk.dart';
import '../govd_certificates_desk.dart';
import '../govd_tax_desk.dart';
import '../govd_gram_sabha_desk.dart';
import '../govd_projects_desk.dart';

class GovdTasksTab extends StatefulWidget {
  const GovdTasksTab({super.key});

  @override
  State<GovdTasksTab> createState() => _GovdTasksTabState();
}

class _GovdTasksTabState extends State<GovdTasksTab> {
  String _filter = 'all'; // 'all', 'urgent', 'approvals', 'tax', 'field'

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isMr = app.language == 'mr';
    final user = app.currentUser;

    final pendingCerts = app.certificates.where((c) => c.status == 'pending').toList();
    final urgentGrievances = app.grievances.where((g) => g.status != 'resolved').toList();
    final pendingTaxes = app.taxRecords.where((t) => t.dueAmount > 0).toList();

    return Scaffold(
      backgroundColor: GovdTheme.bgSurface,
      body: RefreshIndicator(
        onRefresh: () => app.refreshAllData(),
        color: GovdTheme.saffron,
        child: Column(
          children: [
            // Top Tasks Filter Header
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              color: GovdTheme.navyDark,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isMr ? 'आजची प्रशासकीय कामे' : 'Today\'s Administrative Tasks',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
                          ),
                          Text(
                            isMr ? 'प्राधान्यक्रमानुसार दैनंदिन कार्य यादी' : 'Priority Daily Action List',
                            style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.7)),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: GovdTheme.saffron.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: GovdTheme.saffron, width: 1),
                        ),
                        child: Text(
                          '${urgentGrievances.length + pendingCerts.length} ${isMr ? "प्रलंबित" : "Pending"}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('all', isMr ? 'सर्व कामे' : 'All Tasks'),
                        const SizedBox(width: 8),
                        _buildFilterChip('urgent', isMr ? '🔴 तातडीचे (Urgent)' : '🔴 Urgent'),
                        const SizedBox(width: 8),
                        _buildFilterChip('approvals', isMr ? '📄 दाखले मंजुरी (${pendingCerts.length})' : '📄 Approvals (${pendingCerts.length})'),
                        const SizedBox(width: 8),
                        _buildFilterChip('tax', isMr ? '💰 कर वसुली' : '💰 Tax Collection'),
                        const SizedBox(width: 8),
                        _buildFilterChip('field', isMr ? '📍 क्षेत्र भेट (Field Visits)' : '📍 Field Visits'),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Tasks List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Task 1: Urgent Streetlight / Water Complaint
                  if (urgentGrievances.isNotEmpty && (_filter == 'all' || _filter == 'urgent'))
                    _buildTaskCard(
                      icon: Icons.lightbulb_outline_rounded,
                      iconColor: GovdTheme.rose,
                      badgeText: isMr ? '🔴 तातडीची तक्रार' : '🔴 Urgent Complaint',
                      badgeColor: GovdTheme.rose,
                      title: urgentGrievances.first.title,
                      location: '${urgentGrievances.first.wardNo} • ${urgentGrievances.first.gramPanchayat}',
                      dueText: isMr ? 'स्थिती: प्रगतीपथावर' : 'Status: In Progress',
                      buttonLabel: isMr ? 'तक्रार उघडा (View) →' : 'View Complaint →',
                      onAction: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGrievancesDesk()));
                      },
                    ),

                  // Task 2: Certificate Verification
                  if (pendingCerts.isNotEmpty && (_filter == 'all' || _filter == 'approvals' || _filter == 'urgent'))
                    _buildTaskCard(
                      icon: Icons.fact_check_rounded,
                      iconColor: GovdTheme.saffron,
                      badgeText: isMr ? '🟡 दाखला पडताळणी' : '🟡 Certificate Verification',
                      badgeColor: GovdTheme.saffron,
                      title: '${pendingCerts.length} ${isMr ? "नागरिकांचे दाखले मंजुरीच्या प्रतीक्षेत आहेत" : "Certificate applications awaiting verification"}',
                      location: isMr ? 'रहिवासी / जन्म / मिळकत दाखले' : 'Residence / Birth / Property Certificates',
                      dueText: isMr ? 'आज तपासणी आवश्यक' : 'Due for inspection today',
                      buttonLabel: isMr ? 'दाखले तपासा (Review) →' : 'Review Applications →',
                      onAction: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk()));
                      },
                    ),

                  // Task 3: Tax Due Collection
                  if (pendingTaxes.isNotEmpty && (_filter == 'all' || _filter == 'tax'))
                    _buildTaskCard(
                      icon: Icons.currency_rupee_rounded,
                      iconColor: GovdTheme.emerald,
                      badgeText: isMr ? '💰 कर वसुली मोहीम' : '💰 Tax Collection',
                      badgeColor: GovdTheme.emerald,
                      title: isMr
                          ? 'वॉर्ड क्र. १ व २ मधील घरपट्टी व पाणीपट्टी वसुली'
                          : 'Property & Water tax collection for Ward 1 & 2',
                      location: isMr ? 'एकूण थकबाकी: ₹१,४४०' : 'Total Outstanding: ₹1,440',
                      dueText: isMr ? 'आजचे उद्दिष्ट: १० घरे' : 'Today\'s Target: 10 Houses',
                      buttonLabel: isMr ? 'कर वसुली डेस्क (Collect) →' : 'Open Tax Desk →',
                      onAction: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdTaxDesk()));
                      },
                    ),

                  // Task 4: Gram Sabha Meeting Preparation
                  if (_filter == 'all' || _filter == 'urgent')
                    _buildTaskCard(
                      icon: Icons.groups_rounded,
                      iconColor: GovdTheme.primaryBlue,
                      badgeText: isMr ? '🏛️ ग्रामसभा बैठक' : '🏛️ Gram Sabha Meeting',
                      badgeColor: GovdTheme.primaryBlue,
                      title: isMr
                          ? 'आगामी विशेष ग्रामसभा बैठक विषयपत्रिका निश्चिती'
                          : 'Finalize upcoming Special Gram Sabha Meeting Agenda',
                      location: isMr ? '२६ जानेवारी • सकाळी ९:३० वा.' : '26 January • 9:30 AM',
                      dueText: isMr ? 'स्थान: ग्रामपंचायत सभागृह' : 'Venue: GP Hall',
                      buttonLabel: isMr ? 'बैठक तपशील (Details) →' : 'Meeting Details →',
                      onAction: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGramSabhaDesk()));
                      },
                    ),

                  // Task 5: Development Work Inspection
                  if (_filter == 'all' || _filter == 'field')
                    _buildTaskCard(
                      icon: Icons.engineering_rounded,
                      iconColor: GovdTheme.purpleLight,
                      badgeText: isMr ? '📍 क्षेत्र पाहणी' : '📍 Field Visit',
                      badgeColor: GovdTheme.purpleLight,
                      title: isMr
                          ? 'गणपती चौक ते मुख्य रस्ता काँक्रीटीकरण प्रत्यक्ष पाहणी'
                          : 'Ganpati Chowk to Main Road Concreting Field Inspection',
                      location: isMr ? 'प्रभाग क्र. २ • प्रगती: ४८%' : 'Ward 2 • Progress: 48%',
                      dueText: isMr ? 'कंत्राटदार: ABC कन्स्ट्रक्शन' : 'Contractor: ABC Construction',
                      buttonLabel: isMr ? 'प्रकल्प पहा (View Project) →' : 'View Project →',
                      onAction: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdProjectsDesk()));
                      },
                    ),

                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _filter == value;
    return InkWell(
      onTap: () => setState(() => _filter = value),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? GovdTheme.gold : Colors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
            color: isSelected ? GovdTheme.navyDark : Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildTaskCard({
    required IconData icon,
    required Color iconColor,
    required String badgeText,
    required Color badgeColor,
    required String title,
    required String location,
    required String dueText,
    required String buttonLabel,
    required VoidCallback onAction,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Badge + Icon
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: badgeColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badgeText,
                  style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: badgeColor),
                ),
              ),
              Icon(icon, color: iconColor, size: 20),
            ],
          ),
          const SizedBox(height: 8),

          // Title
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: GovdTheme.navyDark,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 4),

          // Location & Due
          Text(
            location,
            style: const TextStyle(fontSize: 11.5, color: GovdTheme.slateMedium),
          ),
          const SizedBox(height: 2),
          Text(
            dueText,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: GovdTheme.navyDark),
          ),
          const SizedBox(height: 12),

          // Action Button
          SizedBox(
            width: double.infinity,
            height: 40,
            child: ElevatedButton(
              onPressed: onAction,
              style: ElevatedButton.styleFrom(
                backgroundColor: GovdTheme.navyDark,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: Text(
                buttonLabel,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
