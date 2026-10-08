import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../models/notice_model.dart';
import '../widgets/govd_theme.dart';

class GovdNoticesDesk extends StatelessWidget {
  const GovdNoticesDesk({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final notices = app.notices;
    final user = app.currentUser;

    return Scaffold(
      backgroundColor: GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'सूचना व जाहीर प्रगटन फलक',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              '${user?.gramPanchayat ?? "ग्रामपंचायत"} • प्रसिद्धी डेस्क',
              style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            onPressed: () => app.refreshAllData(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateNoticeDialog(context, app),
        backgroundColor: GovdTheme.goldDark,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('नवीन सूचना प्रसिद्ध करा', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: notices.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (ctx, i) {
          final n = notices[i];
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
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
                        color: n.isUrgent ? GovdTheme.roseLight : const Color(0xFFEEF2FF),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        n.category,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: n.isUrgent ? GovdTheme.rose : const Color(0xFF3730A3),
                        ),
                      ),
                    ),
                    Text(
                      n.publishDate,
                      style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  n.titleMr,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 4),
                Text(
                  n.contentMr,
                  style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569), height: 1.3),
                ),
                const SizedBox(height: 10),
                Text(
                  'प्रसिद्धी: ${n.issuedBy}',
                  style: const TextStyle(fontSize: 10, fontStyle: FontStyle.italic, color: Color(0xFF64748B)),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showCreateNoticeDialog(BuildContext context, AppProvider app) {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    String category = 'ग्रामसभा सूचना';
    bool isUrgent = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('नवीन सूचना प्रसिद्ध करा', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'सूचनेचे शीर्षक (Title)',
                    hintText: 'उदा. विशेष ग्रामसभा आयोजन...',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: contentController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'सूचनेचा तपशील (Details)',
                    hintText: 'तपशीलवार माहिती प्रविष्ट करा...',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                const Text('वर्गवारी (Category):', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 6,
                  children: [
                    ChoiceChip(
                      label: const Text('ग्रामसभा'),
                      selected: category == 'ग्रामसभा सूचना',
                      onSelected: (val) => setDialogState(() => category = 'ग्रामसभा सूचना'),
                    ),
                    ChoiceChip(
                      label: const Text('आरोग्य शिबीर'),
                      selected: category == 'आरोग्य शिबीर',
                      onSelected: (val) => setDialogState(() => category = 'आरोग्य शिबीर'),
                    ),
                    ChoiceChip(
                      label: const Text('विकास कामे'),
                      selected: category == 'विकास कामे',
                      onSelected: (val) => setDialogState(() => category = 'विकास कामे'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                CheckboxListTile(
                  title: const Text('तातडीची सूचना (Urgent Alert)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  value: isUrgent,
                  contentPadding: EdgeInsets.zero,
                  onChanged: (val) => setDialogState(() => isUrgent = val ?? false),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.navyDark, foregroundColor: Colors.white),
              onPressed: () async {
                if (titleController.text.trim().isEmpty || contentController.text.trim().isEmpty) return;
                Navigator.pop(ctx);
                await app.publishNotice(
                  titleMr: titleController.text.trim(),
                  contentMr: contentController.text.trim(),
                  category: category,
                  isUrgent: isUrgent,
                );
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('सूचना फलकावर प्रसिद्ध झाली!'), backgroundColor: GovdTheme.emeraldDark),
                  );
                }
              },
              child: const Text('प्रसिद्ध करा'),
            ),
          ],
        ),
      ),
    );
  }
}
