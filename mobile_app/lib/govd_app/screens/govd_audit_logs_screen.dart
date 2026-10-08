import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../widgets/govd_theme.dart';

class GovdAuditLogsScreen extends StatelessWidget {
  const GovdAuditLogsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;

    final List<Map<String, dynamic>> logs = [
      {
        'time': 'आज • १०:१५ AM',
        'user': 'श्री. राहुल कदम',
        'role': 'सरपंच',
        'action': 'रहिवासी दाखला मंजूर केला व डिजिटल स्वाक्षरी केली',
        'recordId': 'CERT-GP/RES/2026/042',
        'type': 'certificate',
        'status': 'मंजूर (Approved)',
      },
      {
        'time': 'आज • ०९:४० AM',
        'user': 'श्री. सुरेश पाटील',
        'role': 'ग्रामसेवक',
        'action': 'नवीन पाणीपट्टी कर पावती जारी केली (₹४५०)',
        'recordId': 'TXN-98421095',
        'type': 'tax',
        'status': 'यशस्वी (Success)',
      },
      {
        'time': 'काल • ०४:३० PM',
        'user': 'श्री. सुरेश पाटील',
        'role': 'ग्रामसेवक',
        'action': 'तक्रार #GRV-301 संबंधित लाईनमन कडे वर्ग केली',
        'recordId': 'GRV-301',
        'type': 'grievance',
        'status': 'वर्ग (Assigned)',
      },
      {
        'time': '१६ सप्टें • ०२:१५ PM',
        'user': 'श्री. अरविंद देशमुख',
        'role': 'तालुका BDO',
        'action': 'वार्षिक विकास आराखडा निधी अंदाजपत्रक पडताळणी पूर्ण',
        'recordId': 'PROJ-PLAN-2026',
        'type': 'project',
        'status': 'तपासले (Verified)',
      },
      {
        'time': '१५ सप्टें • ११:०० AM',
        'user': 'श्री. राहुल कदम',
        'role': 'सरपंच',
        'action': 'विशेष प्रजासत्ताक दिन ग्रामसभा जाहीर सूचना प्रकाशित केली',
        'recordId': 'NOT-172983',
        'type': 'notice',
        'status': 'प्रकाशित (Published)',
      },
    ];

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '📜 प्रशासकीय ऑडिट व कार्य इतिहास',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              'सुरक्षित, अपरिवर्तनीय डिजिटल कार्य नोंदवही (Audit Trail)',
              style: TextStyle(fontSize: 10.5, color: Colors.white70),
            ),
          ],
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: logs.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (ctx, i) {
          final log = logs[i];
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
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: GovdTheme.gold.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            log['role'],
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: GovdTheme.goldDark),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          log['user'],
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w800,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                    Text(
                      log['time'],
                      style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  log['action'],
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155),
                  ),
                ),
                const SizedBox(height: 8),
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
                        'ID: ${log['recordId']}',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: GovdTheme.emeraldLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        log['status'],
                        style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: GovdTheme.emeraldDark),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
