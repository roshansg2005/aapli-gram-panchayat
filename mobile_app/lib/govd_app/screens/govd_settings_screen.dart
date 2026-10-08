import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../widgets/govd_theme.dart';

class GovdSettingsScreen extends StatelessWidget {
  const GovdSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final user = app.currentUser;

    return Scaffold(
      backgroundColor: GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: const Text(
          'कार्यालय व प्रशासकीय सेटिंग्ज',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Officer Profile Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: GovdTheme.headerGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: Colors.white.withOpacity(0.15),
                    child: const Icon(Icons.shield_rounded, size: 32, color: GovdTheme.gold),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? 'शासकीय अधिकारी',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.roleDisplayMr ?? 'ग्रामपंचायत प्रशासन',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: GovdTheme.goldLight),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${user?.gramPanchayat ?? "घुलेवाडी"}, ता. ${user?.taluka ?? "संगमनेर"}',
                          style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.7)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'प्रशासकीय प्राधान्ये व सुरक्षा',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 10),

            _buildSettingTile(
              icon: Icons.fingerprint_rounded,
              title: 'बायोमेट्रिक / फिंगरप्रिंट लॉक',
              subtitle: 'ॲप उघडताना बायोमेट्रिक सुरक्षा विचारा',
              trailing: Switch(value: true, activeColor: GovdTheme.emeraldDark, onChanged: (v) {}),
            ),
            _buildSettingTile(
              icon: Icons.notifications_active_outlined,
              title: 'तातडीच्या तक्रार सूचना',
              subtitle: 'नवीन तक्रार आल्यास तात्काळ SMS व नोटिफिकेशन',
              trailing: Switch(value: true, activeColor: GovdTheme.emeraldDark, onChanged: (v) {}),
            ),
            _buildSettingTile(
              icon: Icons.translate_rounded,
              title: 'भाषा बदला (Language)',
              subtitle: app.language == 'mr' ? 'मराठी (सक्रिय)' : 'English (Active)',
              trailing: TextButton(
                onPressed: () => app.toggleLanguage(),
                child: const Text('बदला', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'ग्रामपंचायत कार्यालय माहिती',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 10),

            _buildInfoCard([
              _buildInfoRow('कार्यालय वेळ', 'सकाळी ०९:४५ ते सायंकाळी ०६:१५'),
              _buildInfoRow('कार्यालय पत्ता', 'मुख्य प्रशासकीय इमारत, ग्रामपंचायत'),
              _buildInfoRow('ईमेल', 'gp.${(user?.gramPanchayat ?? "ghulewadi").toLowerCase()}@gov.in'),
              _buildInfoRow('हेल्पलाईन', '१८००-२२-५५५५ / ०२४२५-२२३४५६'),
            ]),

            const SizedBox(height: 24),

            // Switch to citizen view button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => app.setGovdDeskMode(false),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE2E8F0),
                  foregroundColor: const Color(0xFF334155),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  elevation: 0,
                ),
                icon: const Icon(Icons.home_outlined),
                label: const Text('नागरिक दृश्य मोडमध्ये जा (Citizen View)', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Widget trailing,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: GovdTheme.navyDark),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                Text(subtitle, style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B))),
              ],
            ),
          ),
          trailing,
        ],
      ),
    );
  }

  Widget _buildInfoCard(List<Widget> rows) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(children: rows),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
          Text(value, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        ],
      ),
    );
  }
}
