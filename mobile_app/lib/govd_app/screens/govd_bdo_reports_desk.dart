import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../widgets/govd_theme.dart';

class GovdBdoReportsDesk extends StatelessWidget {
  const GovdBdoReportsDesk({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isMr = app.language == 'mr';

    return Scaffold(
      backgroundColor: GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isMr ? 'तालुका प्रशासकीय अहवाल व आकडेवारी' : 'Block Administrative Reports',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              isMr ? 'संगमनेर तालुका • BDO Analytics' : 'Sangamner Taluka • BDO Analytics',
              style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.file_download_outlined, color: Colors.white),
            tooltip: isMr ? 'अहवाल डाउनलोड करा' : 'Download Report',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    isMr
                        ? 'संगमनेर तालुका मासिक अहवाल PDF यशस्वीरित्या सेव्ह झाला.'
                        : 'Sangamner Block Monthly Report PDF saved successfully.',
                  ),
                  backgroundColor: GovdTheme.emerald,
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Summary Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: GovdTheme.headerGradient,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          isMr ? 'मासिक तालुका प्रगती अहवाल' : 'Monthly Block Progress Report',
                          style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900, color: Colors.white),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: GovdTheme.gold.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          isMr ? 'सप्टेंबर २०२६' : 'Sep 2026',
                          style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: GovdTheme.goldLight),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      _buildBlockKpi('कर वसुली', '८१.४%', '₹३,४५,०००', GovdTheme.emerald),
                      const SizedBox(width: 8),
                      _buildBlockKpi('तक्रार निवारण', '९२.०%', '४२ / ४६', GovdTheme.gold),
                      const SizedBox(width: 8),
                      _buildBlockKpi('योजना लाभार्थी', '१,२४०', '१२ योजना', GovdTheme.primaryBlue),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Section 1: Panchayat-wise Tax Collection
            _buildSectionHeader(
              icon: Icons.currency_rupee_rounded,
              title: isMr ? 'ग्रामपंचायतनिहाय कर वसुली टक्केवारी' : 'Panchayat Tax Collection %',
              color: GovdTheme.emerald,
            ),
            const SizedBox(height: 10),
            _buildTaxBarCard('घुलेवाडी (Ghulewadi)', 0.82, '₹१,२४,५०० / ₹१,५२,०००', GovdTheme.emerald),
            const SizedBox(height: 8),
            _buildTaxBarCard('गुंजाळवाडी (Gunjalwadi)', 0.78, '₹८५,२०० / ₹१,१०,०००', GovdTheme.emerald),
            const SizedBox(height: 8),
            _buildTaxBarCard('निमगाव बुद्रुक (Nimgaon)', 0.64, '₹९२,००० / ₹१,४४,०००', GovdTheme.gold),
            const SizedBox(height: 8),
            _buildTaxBarCard('चंदनापुरी (Chandnapuri)', 0.58, '₹४४,००० / ₹७६,०००', GovdTheme.rose),
            const SizedBox(height: 20),

            // Section 2: Grievance Resolution Categories
            _buildSectionHeader(
              icon: Icons.report_problem_rounded,
              title: isMr ? 'तक्रारींचे विभागवार वर्गीकरण' : 'Grievance Department Breakdown',
              color: GovdTheme.rose,
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  _buildGrievanceRow('💡 पथदिवे व वीज पुरवठा (Street Light)', 18, 16, GovdTheme.gold),
                  const Divider(height: 16),
                  _buildGrievanceRow('🚰 पिण्याचे पाणी पुरवठा (Drinking Water)', 14, 13, GovdTheme.primaryBlue),
                  const Divider(height: 16),
                  _buildGrievanceRow('🛣️ रस्ते दुरुस्ती व खड्डे (Roads & Paths)', 9, 8, GovdTheme.emerald),
                  const Divider(height: 16),
                  _buildGrievanceRow('🧹 स्वच्छता व कचरा व्यवस्थापन (Sanitation)', 5, 5, GovdTheme.purpleLight),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Section 3: Development Works
            _buildSectionHeader(
              icon: Icons.engineering_rounded,
              title: isMr ? 'विकासकामे निधी व खर्च (Infrastructure Budget)' : 'Development Works Budget',
              color: GovdTheme.primaryBlue,
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  _buildBudgetRow('१५ वा वित्त आयोग (15th Finance)', '₹२८,५०,०००', '₹१८,४०,०००', 0.65),
                  const Divider(height: 16),
                  _buildBudgetRow('जलजीवन मिशन (Jal Jeevan)', '₹४२,००,०००', '₹३५,२०,०००', 0.84),
                  const Divider(height: 16),
                  _buildBudgetRow('जिल्हा नियोजन निधी (DPDC Scheme)', '₹१५,००,०००', '₹९,५०,०००', 0.63),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader({required IconData icon, required String title, required Color color}) {
    return Row(
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
          child: Text(
            title,
            style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
          ),
        ),
      ],
    );
  }

  Widget _buildBlockKpi(String label, String value, String sub, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color)),
            ),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(label, style: const TextStyle(fontSize: 10, color: Colors.white70, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: 2),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(sub, style: const TextStyle(fontSize: 9, color: Colors.white54)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaxBarCard(String name, double percent, String details, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(name, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: GovdTheme.navyDark)),
              ),
              const SizedBox(width: 6),
              Text(
                '${(percent * 100).toInt()}%',
                style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: color),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: percent,
              backgroundColor: Colors.grey.shade200,
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 4),
          Text(details, style: const TextStyle(fontSize: 10, color: GovdTheme.slateMedium)),
        ],
      ),
    );
  }

  Widget _buildGrievanceRow(String title, int total, int resolved, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: GovdTheme.navyDark)),
        ),
        const SizedBox(width: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            '$resolved / $total निवारण',
            style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: color),
          ),
        ),
      ],
    );
  }

  Widget _buildBudgetRow(String scheme, String sanction, String spent, double progress) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(scheme, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: GovdTheme.navyDark)),
            ),
            const SizedBox(width: 6),
            Text('${(progress * 100).toInt()}% खर्च', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.primaryBlue)),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.grey.shade200,
            valueColor: const AlwaysStoppedAnimation<Color>(GovdTheme.primaryBlue),
            minHeight: 6,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text('मंजूर: $sanction', style: const TextStyle(fontSize: 10, color: GovdTheme.slateMedium)),
            ),
            const SizedBox(width: 6),
            Text('खर्च: $spent', style: const TextStyle(fontSize: 10, color: GovdTheme.slateMedium, fontWeight: FontWeight.w600)),
          ],
        ),
      ],
    );
  }
}
