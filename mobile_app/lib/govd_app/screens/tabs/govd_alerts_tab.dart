import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/app_provider.dart';
import '../../widgets/govd_theme.dart';
import '../govd_certificates_desk.dart';
import '../govd_grievances_desk.dart';
import '../govd_tax_desk.dart';
import '../govd_projects_desk.dart';
import '../govd_gram_sabha_desk.dart';

class GovdAlertsTab extends StatefulWidget {
  const GovdAlertsTab({super.key});

  @override
  State<GovdAlertsTab> createState() => _GovdAlertsTabState();
}

class _GovdAlertsTabState extends State<GovdAlertsTab> {
  String _selectedCategory = 'all';

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';

    final List<Map<String, dynamic>> alerts = [
      {
        'id': 'alt-1',
        'category': 'urgent',
        'title': isMr ? '५ नागरी तक्रारी तातडीने निवारण करणे आवश्यक' : '5 Grievances Escalated to Urgent',
        'message': isMr
            ? 'वॉर्ड क्र. १ व २ मधील पिण्याचे पाणी व पथदिवा तक्रारींचे निवारण कालमर्यादा समाप्त होत आहे.'
            : 'Water supply breakdown and street light issues in Ward 1 & 2 need immediate action.',
        'time': '१० मिनिटांपूर्वी',
        'isUrgent': true,
        'action': 'grievance',
      },
      {
        'id': 'alt-2',
        'category': 'approvals',
        'title': isMr ? '३ दाखले डिजिटल स्वाक्षरीसाठी प्रलंबित' : '3 Certificates Awaiting Approval',
        'message': isMr
            ? 'रहिवासी व जन्म दाखल्यांची कागदपत्र पडताळणी पूर्ण झाली असून स्वाक्षरी बाकी आहे.'
            : 'Document verification completed for Residence & Birth certificates.',
        'time': '३० मिनिटांपूर्वी',
        'isUrgent': false,
        'action': 'certificate',
      },
      {
        'id': 'alt-3',
        'category': 'tax',
        'title': isMr ? '१०% आगाऊ कर सवलत योजना अंतिम मुदत' : '10% Tax Rebate Deadline Approaching',
        'message': isMr
            ? 'चालू आर्थिक वर्षात ५२ मिळकतींची कर आकारणी थकीत आहे. स्मरणपत्रे पाठवा.'
            : '52 properties have pending property tax. Send reminders to citizens.',
        'time': '२ तासांपूर्वी',
        'isUrgent': false,
        'action': 'tax',
      },
      {
        'id': 'alt-4',
        'category': 'projects',
        'title': isMr ? 'मुख्य रस्ता काँक्रिटीकरण प्रगती अहवाल अद्ययावत' : 'Road Concreting Project Milestone Updated',
        'message': isMr
            ? 'कंत्राटदाराने ७०% काम पूर्ण झाल्याचे मोजमाप पत्र सादर केले आहे.'
            : 'Contractor submitted 70% milestone progress inspection report.',
        'time': 'काल',
        'isUrgent': false,
        'action': 'project',
      },
      {
        'id': 'alt-5',
        'category': 'gram_sabha',
        'title': isMr ? 'विशेष प्रजासत्ताक दिन ग्रामसभा नोटीस प्रसिद्धी' : 'Special Gram Sabha Notice Published',
        'message': isMr
            ? '२६ जानेवारी विशेष ग्रामसभेचा अजेंडा डिजिटल फलकावर प्रसिद्ध झाला आहे.'
            : 'Gram Sabha notice and agenda published on digital board.',
        'time': '२ दिवसांपूर्वी',
        'isUrgent': false,
        'action': 'gram_sabha',
      },
    ];

    final filtered = alerts.where((a) {
      if (_selectedCategory != 'all' && a['category'] != _selectedCategory) {
        return false;
      }
      return true;
    }).toList();

    return Column(
      children: [
        // Category Filter Chips
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildChip('सर्व (${alerts.length})', 'all', isDark),
                      const SizedBox(width: 6),
                      _buildChip('🔴 तातडीचे (Urgent)', 'urgent', isDark),
                      const SizedBox(width: 6),
                      _buildChip('🟡 मंजुरी (Approvals)', 'approvals', isDark),
                      const SizedBox(width: 6),
                      _buildChip('📢 तक्रार', 'grievances', isDark),
                      const SizedBox(width: 6),
                      _buildChip('💰 कर', 'tax', isDark),
                      const SizedBox(width: 6),
                      _buildChip('🏗️ प्रकल्प', 'projects', isDark),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: () {
                  app.markAllNotificationsAsRead();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('सर्व सूचना वाचल्या म्हणून चिन्हांकित केल्या.'), backgroundColor: GovdTheme.emeraldDark),
                  );
                },
                child: Text(
                  isMr ? 'सर्व वाचा' : 'Mark All Read',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.saffronPrimary),
                ),
              ),
            ],
          ),
        ),

        // Alerts List
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
            itemCount: filtered.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (ctx, i) {
              final a = filtered[i];
              final isUrgent = a['isUrgent'] == true;

              return InkWell(
                onTap: () => _handleAlertClick(context, a['action']),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isUrgent
                          ? GovdTheme.rose.withOpacity(0.5)
                          : isDark
                              ? const Color(0xFF334155)
                              : const Color(0xFFE2E8F0),
                      width: isUrgent ? 1.5 : 1.0,
                    ),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
                    ],
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isUrgent ? GovdTheme.roseLight : const Color(0xFFFEF3C7),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isUrgent ? Icons.error_rounded : Icons.notifications_active_rounded,
                          size: 20,
                          color: isUrgent ? GovdTheme.rose : GovdTheme.goldDark,
                        ),
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
                                    a['title'],
                                    style: TextStyle(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w800,
                                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Text(
                                  a['time'],
                                  style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              a['message'],
                              style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF64748B), height: 1.3),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildChip(String label, String value, bool isDark) {
    final isSelected = _selectedCategory == value;
    return InkWell(
      onTap: () => setState(() => _selectedCategory = value),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? GovdTheme.navyDark : (isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9)),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? GovdTheme.navyDark : const Color(0xFFCBD5E1)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : (isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
          ),
        ),
      ),
    );
  }

  void _handleAlertClick(BuildContext context, String action) {
    switch (action) {
      case 'grievance':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGrievancesDesk()));
        break;
      case 'certificate':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk()));
        break;
      case 'tax':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdTaxDesk()));
        break;
      case 'project':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdProjectsDesk()));
        break;
      case 'gram_sabha':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGramSabhaDesk()));
        break;
    }
  }
}
