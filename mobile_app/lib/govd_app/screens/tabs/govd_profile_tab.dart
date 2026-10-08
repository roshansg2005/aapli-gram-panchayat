import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/app_provider.dart';
import '../../widgets/govd_theme.dart';
import '../govd_audit_logs_screen.dart';
import '../govd_field_work_screen.dart';
import '../../../config/theme.dart';
import '../../../models/user_model.dart';
import '../../../screens/auth/login_screen.dart';

class GovdProfileTab extends StatelessWidget {
  const GovdProfileTab({super.key});

  void _showEditProfileDialog(BuildContext context, AppProvider app) {
    final user = app.currentUser;
    final isDark = app.isDarkMode;

    final nameController = TextEditingController(text: user?.name ?? '');
    final phoneController = TextEditingController(text: user?.phone ?? '');
    final emailController = TextEditingController(text: user?.email ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('अधिकारी प्रोफाईल संपादित करा', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'पूर्ण नाव', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'मोबाईल क्रमांक', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'शासकीय ईमेल', border: OutlineInputBorder()),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.navyDark, foregroundColor: Colors.white),
            onPressed: () {
              if (user != null) {
                final updated = UserModel(
                  id: user.id,
                  role: user.role,
                  name: nameController.text.trim(),
                  phone: phoneController.text.trim(),
                  dob: user.dob,
                  email: emailController.text.trim(),
                  aadhaar: user.aadhaar,
                  state: user.state,
                  district: user.district,
                  taluka: user.taluka,
                  gramPanchayat: user.gramPanchayat,
                  wardNo: user.wardNo,
                  houseNo: user.houseNo,
                  address: user.address,
                  designation: user.designation,
                  employeeCode: user.employeeCode,
                  avatarUrl: user.avatarUrl,
                );
                app.updateUser(updated);
              }
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('✅ अधिकारी प्रोफाइल अद्ययावत झाली!'), backgroundColor: GovdTheme.emeraldDark),
              );
            },
            child: const Text('जतन करा'),
          ),
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context, AppProvider app) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: app.isDarkMode ? const Color(0xFF1E293B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('प्रशासकीय लॉगआउट', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: const Text('आपण शासकीय डेस्कवरून सुरक्षितपणे लॉगआउट करू इच्छिता का?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('रद्द करा', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.dangerRed, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              await app.logout();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            child: const Text('लॉगआउट करा'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final user = app.currentUser;
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Official Profile Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: GovdTheme.headerGradient,
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.18), blurRadius: 12, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: GovdTheme.gold.withOpacity(0.25),
                            child: const Icon(Icons.shield_rounded, size: 30, color: GovdTheme.gold),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user?.name ?? 'शासकीय अधिकारी',
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  user?.roleDisplayMr ?? 'ग्रामपंचायत प्रशासन',
                                  style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: GovdTheme.goldLight),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  'ID: ${user?.employeeCode ?? "EMP-01"}',
                                  style: TextStyle(fontSize: 10.5, color: Colors.white.withOpacity(0.75)),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit_note_rounded, color: GovdTheme.gold, size: 26),
                      tooltip: 'संपादित करा',
                      onPressed: () => _showEditProfileDialog(context, app),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Divider(color: Colors.white12, height: 1),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        '${user?.gramPanchayat ?? "घुलेवाडी"}, ता. ${user?.taluka ?? "संगमनेर"}',
                        style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.85)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: GovdTheme.emerald.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: GovdTheme.emerald.withOpacity(0.4)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.verified_rounded, color: GovdTheme.emeraldLight, size: 12),
                          SizedBox(width: 4),
                          Text('सत्यापित खाते', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: GovdTheme.emeraldLight)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // 2. Official Information Tile
          _buildSectionHeading(
            icon: Icons.account_balance_rounded,
            title: isMr ? 'कार्यालयीन व पद माहिती' : 'Office Information',
            isDark: isDark,
          ),
          const SizedBox(height: 8),

          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                _buildInfoRow('मोबाईल नंबर:', '+91 ${user?.phone ?? "8080341618"}', isDark),
                const Divider(height: 14),
                _buildInfoRow('शासकीय ईमेल:', user?.email ?? 'gp.${(user?.gramPanchayat ?? "ghulewadi").toLowerCase()}@gov.in', isDark),
                const Divider(height: 14),
                _buildInfoRow('पदभार / हुद्दा:', user?.designation ?? (user?.roleDisplayMr.split(' ').first ?? 'प्रशासक'), isDark),
                const Divider(height: 14),
                _buildInfoRow('कार्यक्षेत्र:', 'ग्रामपंचायत ${user?.gramPanchayat ?? "घुलेवाडी"}, जि. ${user?.district ?? "अहिल्यानगर"}', isDark),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // 3. Administrative Settings & Switches
          _buildSectionHeading(
            icon: Icons.settings_suggest_rounded,
            title: isMr ? 'सिस्टीम प्राधान्ये व सुरक्षा' : 'System Preferences',
            isDark: isDark,
          ),
          const SizedBox(height: 8),

          Material(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            clipBehavior: Clip.antiAlias,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  // Biometric Security Switch
                  ListTile(
                    dense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                    leading: const Icon(Icons.fingerprint_rounded, color: GovdTheme.emeraldDark, size: 22),
                    title: const Text('बायोमेट्रिक फिंगरप्रिंट लॉक', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                    subtitle: const Text('ॲप उघडताना बायोमेट्रिक सुरक्षा', style: TextStyle(fontSize: 10)),
                    trailing: Switch(
                      value: true,
                      activeColor: GovdTheme.emeraldDark,
                      onChanged: (v) {},
                    ),
                  ),
                  const Divider(height: 1),

                  // Notifications Switch
                  ListTile(
                    dense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                    leading: const Icon(Icons.notifications_active_outlined, color: GovdTheme.saffronPrimary, size: 22),
                    title: const Text('तातडीच्या तक्रार सूचना (SMS & App)', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                    subtitle: const Text('नवीन अर्ज व तक्रारींची तात्काळ सूचना', style: TextStyle(fontSize: 10)),
                    trailing: Switch(
                      value: app.notificationsEnabled,
                      activeColor: GovdTheme.saffronPrimary,
                      onChanged: (v) => app.setNotificationPermission(v),
                    ),
                  ),
                  const Divider(height: 1),

                  // Language Toggle
                  ListTile(
                    dense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                    leading: const Icon(Icons.translate_rounded, color: Color(0xFF2563EB), size: 22),
                    title: const Text('भाषा बदला (Language)', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                    subtitle: Text(isMr ? 'सध्या: मराठी (म)' : 'Current: English (EN)', style: const TextStyle(fontSize: 10)),
                    trailing: TextButton(
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        minimumSize: const Size(50, 32),
                      ),
                      onPressed: () => app.toggleLanguage(),
                      child: Text(isMr ? 'English' : 'मराठी', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ),
                  const Divider(height: 1),

                  // Dark Mode Switch
                  ListTile(
                    dense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                    leading: Icon(isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded, color: const Color(0xFF6366F1), size: 22),
                    title: const Text('डार्क मोड (Dark Theme)', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                    trailing: Switch(
                      value: isDark,
                      activeColor: GovdTheme.goldDark,
                      onChanged: (_) => app.toggleDarkMode(),
                    ),
                  ),
                  const Divider(height: 1),

                  // Audit Logs Link
                  ListTile(
                    dense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                    leading: const Icon(Icons.history_edu_rounded, color: Color(0xFF0D9488), size: 22),
                    title: const Text('प्रशासकीय ऑडिट लॉग (Activity History)', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdAuditLogsScreen())),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // 4. Switch to Citizen View
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () => app.setGovdDeskMode(false),
              style: ElevatedButton.styleFrom(
                backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFEEF2FF),
                foregroundColor: isDark ? const Color(0xFF818CF8) : const Color(0xFF3730A3),
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              icon: const Icon(Icons.swap_horiz_rounded, size: 20),
              label: const Text(
                'नागरिक दृश्य मोडमध्ये जा (Citizen View)',
                style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),

          const SizedBox(height: 10),

          // 5. Logout Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: () => _confirmLogout(context, app),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.dangerRed,
                side: const BorderSide(color: AppTheme.dangerRed, width: 1.5),
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.logout_rounded, size: 18),
              label: const Text(
                'प्रशासकीय लॉगआउट (Logout)',
                style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeading({
    required IconData icon,
    required String title,
    required bool isDark,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF334155) : GovdTheme.navyDark.withOpacity(0.08),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 15, color: isDark ? GovdTheme.goldLight : GovdTheme.navyDark),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
              letterSpacing: -0.1,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
        ),
      ],
    );
  }
}
