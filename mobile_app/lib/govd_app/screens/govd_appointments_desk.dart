import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../widgets/govd_theme.dart';

class GovdAppointmentsDesk extends StatefulWidget {
  const GovdAppointmentsDesk({super.key});

  @override
  State<GovdAppointmentsDesk> createState() => _GovdAppointmentsDeskState();
}

class _GovdAppointmentsDeskState extends State<GovdAppointmentsDesk> {
  final List<Map<String, dynamic>> _panchayats = [
    {
      'name': 'घुलेवाडी (Ghulewadi)',
      'taluka': 'संगमनेर',
      'sarpanch': 'श्री. राहुल कदम',
      'sarpanchStatus': 'active',
      'upsarpanch': 'श्री. सचिन थोरात',
      'upsarpanchStatus': 'active',
      'gramsevak': 'श्री. सुरेश पाटील',
      'gramsevakStatus': 'active',
      'lastAudit': '१० फेब्रु २०२६',
    },
    {
      'name': 'गुंजाळवाडी (Gunjalwadi)',
      'taluka': 'संगमनेर',
      'sarpanch': 'पद रिक्त (Vacant)',
      'sarpanchStatus': 'vacant',
      'upsarpanch': 'श्री. दत्तात्रय गुंजाळ',
      'upsarpanchStatus': 'active',
      'gramsevak': 'पद रिक्त (Vacant)',
      'gramsevakStatus': 'vacant',
      'lastAudit': '१५ जाने २०२६',
    },
    {
      'name': 'निमगाव जाळी (Nimgaon Jali)',
      'taluka': 'संगमनेर',
      'sarpanch': 'सौ. सुवर्णा दत्तात्रय पवार',
      'sarpanchStatus': 'active',
      'upsarpanch': 'श्री. बाळकृष्ण कदम',
      'upsarpanchStatus': 'active',
      'gramsevak': 'श्री. राजेंद्र देशमुख',
      'gramsevakStatus': 'active',
      'lastAudit': '०१ मार्च २०२६',
    },
    {
      'name': 'जोर्वे (Jorve)',
      'taluka': 'संगमनेर',
      'sarpanch': 'श्री. विलास थोरात',
      'sarpanchStatus': 'active',
      'upsarpanch': 'पद रिक्त (Vacant)',
      'upsarpanchStatus': 'vacant',
      'gramsevak': 'श्री. आनंद काकडे',
      'gramsevakStatus': 'active',
      'lastAudit': '२० जाने २०२६',
    },
    {
      'name': 'चंदनापुरी (Chandnapuri)',
      'taluka': 'संगमनेर',
      'sarpanch': 'सौ. अनिता शिंदे',
      'sarpanchStatus': 'active',
      'upsarpanch': 'श्री. ज्ञानेश्वर कांबळे',
      'upsarpanchStatus': 'active',
      'gramsevak': 'श्री. सुरेश पाटील (अतिरिक्त पदभार)',
      'gramsevakStatus': 'active',
      'lastAudit': '२२ फेब्रु २०२६',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;

    int totalVacant = 0;
    for (var p in _panchayats) {
      if (p['sarpanchStatus'] == 'vacant') totalVacant++;
      if (p['upsarpanchStatus'] == 'vacant') totalVacant++;
      if (p['gramsevakStatus'] == 'vacant') totalVacant++;
    }

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '🏛️ तालुका BDO पदभार व रोस्टर डेस्क',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              'तालुक्यातील सर्व ग्रामपंचायतींचे नेतृत्व व रिक्त पदे',
              style: TextStyle(fontSize: 10.5, color: Colors.white70),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Summary bar
          Container(
            padding: const EdgeInsets.all(14),
            color: GovdTheme.navyMedium,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSummaryText('एकूण ग्रामपंचायती', '${_panchayats.length}', Colors.white),
                _buildSummaryText('सक्रिय पदाधिकारी', '${(_panchayats.length * 3) - totalVacant}', GovdTheme.emerald),
                _buildSummaryText('रिक्त पदे (Action Needed)', '$totalVacant', GovdTheme.rose),
              ],
            ),
          ),

          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _panchayats.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final gp = _panchayats[i];
                return _buildPanchayatCard(gp, isDark);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryText(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.white70)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: color)),
      ],
    );
  }

  Widget _buildPanchayatCard(Map<String, dynamic> gp, bool isDark) {
    final hasVacancy = gp['sarpanchStatus'] == 'vacant' ||
        gp['upsarpanchStatus'] == 'vacant' ||
        gp['gramsevakStatus'] == 'vacant';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: hasVacancy
              ? GovdTheme.rose.withOpacity(0.5)
              : isDark
                  ? const Color(0xFF334155)
                  : const Color(0xFFE2E8F0),
          width: hasVacancy ? 1.5 : 1.0,
        ),
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
              Text(
                'ग्रामपंचायत ${gp["name"]}',
                style: TextStyle(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
              if (hasVacancy)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(color: GovdTheme.roseLight, borderRadius: BorderRadius.circular(6)),
                  child: const Text('पद रिक्त', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: GovdTheme.rose)),
                ),
            ],
          ),
          const SizedBox(height: 10),
          _buildRoleRow('👑 सरपंच:', gp['sarpanch'], gp['sarpanchStatus'] == 'active'),
          const SizedBox(height: 4),
          _buildRoleRow('🎖️ उपसरपंच:', gp['upsarpanch'], gp['upsarpanchStatus'] == 'active'),
          const SizedBox(height: 4),
          _buildRoleRow('✍️ ग्रामसेवक:', gp['gramsevak'], gp['gramsevakStatus'] == 'active'),
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'अंतिम ऑडिट: ${gp["lastAudit"]}',
                style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
              ),
              ElevatedButton.icon(
                onPressed: () => _showAppointDialog(context, gp),
                style: ElevatedButton.styleFrom(
                  backgroundColor: hasVacancy ? GovdTheme.roseDark : GovdTheme.navyDark,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                icon: const Icon(Icons.assignment_ind_rounded, size: 14),
                label: Text(hasVacancy ? 'नियुक्ती / पदभार द्या' : 'पदभार बदला', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRoleRow(String roleLabel, String name, bool isActive) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(roleLabel, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
        Text(
          name,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.bold,
            color: isActive ? const Color(0xFF0F172A) : GovdTheme.rose,
          ),
        ),
      ],
    );
  }

  void _showAppointDialog(BuildContext context, Map<String, dynamic> gp) {
    final nameController = TextEditingController();
    String selectedRole = 'gramsevak';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text('पदभार नियुक्ती: ${gp["name"]}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('पद निवडा:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            DropdownButtonFormField<String>(
              value: selectedRole,
              items: const [
                DropdownMenuItem(value: 'sarpanch', child: Text('सरपंच (प्रभारी/नियुक्त)')),
                DropdownMenuItem(value: 'upsarpanch', child: Text('उपसरपंच')),
                DropdownMenuItem(value: 'gramsevak', child: Text('ग्रामविकास अधिकारी / ग्रामसेवक')),
              ],
              onChanged: (v) => selectedRole = v ?? 'gramsevak',
              decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'नियुक्त अधिकाऱ्याचे नाव',
                hintText: 'उदा. श्री. ज्ञानेश्वर मोरे...',
                border: OutlineInputBorder(),
                isDense: true,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.navyDark, foregroundColor: Colors.white),
            onPressed: () {
              if (nameController.text.trim().isEmpty) return;
              setState(() {
                if (selectedRole == 'sarpanch') {
                  gp['sarpanch'] = nameController.text.trim();
                  gp['sarpanchStatus'] = 'active';
                } else if (selectedRole == 'upsarpanch') {
                  gp['upsarpanch'] = nameController.text.trim();
                  gp['upsarpanchStatus'] = 'active';
                } else {
                  gp['gramsevak'] = nameController.text.trim();
                  gp['gramsevakStatus'] = 'active';
                }
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('पदभार आदेश यशस्वीरीत्या जारी करण्यात आला!'), backgroundColor: GovdTheme.emeraldDark),
              );
            },
            child: const Text('नियुक्त करा'),
          ),
        ],
      ),
    );
  }
}
