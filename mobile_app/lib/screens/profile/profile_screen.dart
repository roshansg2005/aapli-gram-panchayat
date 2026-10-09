import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/notification_center_modal.dart';
import '../ai_assistant/ai_gram_mitra_modal.dart';
import '../../models/user_model.dart';
import '../../govd_app/govd_app.dart';
import '../auth/login_screen.dart';
import '../../config/api_config.dart';
import 'package:http/http.dart' as http;

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final List<Map<String, String>> _presetAvatars = [
    {
      'nameMr': 'शेतकरी / ज्येष्ठ नागरिक',
      'url': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    },
    {
      'nameMr': 'ग्रामस्थ नागरिक',
      'url': 'https://images.unsplash.com/photo-1614289371518-722f2615943d?w=200&auto=format&fit=crop&q=80',
    },
    {
      'nameMr': 'तरुण नागरिक',
      'url': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80',
    },
    {
      'nameMr': 'महिला शेतकरी',
      'url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    },
    {
      'nameMr': 'विद्यार्थी / विद्यार्थिनी',
      'url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    {
      'nameMr': 'गाव प्रतिनिधी',
      'url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    {
      'nameMr': 'ज्येष्ठ महिला',
      'url': 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80',
    },
    {
      'nameMr': 'शासकीय कर्मचारी',
      'url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
  ];

  void _showAvatarPicker(BuildContext context, AppProvider app) {
    final isMr = app.language == 'mr';
    final isDark = app.isDarkMode;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.face_retouching_natural_rounded, color: AppTheme.primaryOrange, size: 22),
                const SizedBox(width: 8),
                Text(
                  isMr ? 'आपला डिजिटल अवतार निवडा' : 'Select Resident Avatar',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              isMr
                  ? 'स्मार्ट नागरिक ओळखपत्रासाठी योग्य प्रोफाइल चित्र निवडा'
                  : 'Choose a suitable avatar for your Smart Resident ID Card',
              style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.82,
              ),
              itemCount: _presetAvatars.length,
              itemBuilder: (context, index) {
                final av = _presetAvatars[index];
                final isSelected = app.currentUser?.avatarUrl == av['url'];

                return InkWell(
                  onTap: () {
                    if (app.currentUser != null) {
                      final updated = UserModel(
                        id: app.currentUser!.id,
                        role: app.currentUser!.role,
                        name: app.currentUser!.name,
                        phone: app.currentUser!.phone,
                        dob: app.currentUser!.dob,
                        email: app.currentUser!.email,
                        aadhaar: app.currentUser!.aadhaar,
                        state: app.currentUser!.state,
                        district: app.currentUser!.district,
                        taluka: app.currentUser!.taluka,
                        gramPanchayat: app.currentUser!.gramPanchayat,
                        wardNo: app.currentUser!.wardNo,
                        houseNo: app.currentUser!.houseNo,
                        address: app.currentUser!.address,
                        designation: app.currentUser!.designation,
                        employeeCode: app.currentUser!.employeeCode,
                        avatarUrl: av['url'],
                      );
                      app.updateUser(updated);
                    }
                    Navigator.pop(ctx);
                  },
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(3),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected ? AppTheme.primaryOrange : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                            width: isSelected ? 2.5 : 1.2,
                          ),
                        ),
                        child: CircleAvatar(
                          radius: 26,
                          backgroundImage: NetworkImage(av['url']!),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        av['nameMr']!,
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: isSelected ? FontWeight.w900 : FontWeight.w500,
                          color: isSelected ? AppTheme.primaryOrange : (isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showDigitalIdCardModal(BuildContext context, UserModel? user, bool isDark, bool isMr) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F172A), Color(0xFF1E293B), Color(0xFF0B1329)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.6), width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.4),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.account_balance_rounded, color: Color(0xFFFCD34D), size: 20),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isMr ? 'महाराष्ट्र शासन • ग्रामविकास विभाग' : 'Govt of Maharashtra • Rural Dev',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFFCD34D)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                isMr ? 'अधिकृत डिजिटल नागरिक ओळखपत्र' : 'Official Digital Citizen Card',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white),
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
                    icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 22),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(color: Colors.white12, height: 1),
              const SizedBox(height: 16),

              // Avatar & Details
              CircleAvatar(
                radius: 40,
                backgroundImage: NetworkImage(
                  user?.avatarUrl != null && user!.avatarUrl!.isNotEmpty
                      ? user.avatarUrl!
                      : 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80',
                ),
              ),
              const SizedBox(height: 10),
              Text(
                user?.name ?? 'नागरिक',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
              ),
              const SizedBox(height: 2),
              Text(
                'Citizen ID: GP-CIT-${user?.id ?? "2026"}',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFCD34D), letterSpacing: 1),
              ),
              const SizedBox(height: 14),

              // Details Box
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white10),
                ),
                child: Column(
                  children: [
                    _buildIdModalRow('ग्रामपंचायत:', 'ग्रामपंचायत ${user?.gramPanchayat ?? "घुलेवाडी"}'),
                    const Divider(color: Colors.white12, height: 12),
                    _buildIdModalRow('प्रभाग / वॉर्ड:', user?.wardNo ?? 'Ward 1'),
                    const Divider(color: Colors.white12, height: 12),
                    _buildIdModalRow('घर / मिळकत क्र:', user?.houseNo ?? 'घर क्र. ४५'),
                    const Divider(color: Colors.white12, height: 12),
                    _buildIdModalRow('आधार (गोपनीय):', user?.aadhaar ?? 'XXXX-XXXX-4567'),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // QR Code
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: QrImageView(
                  data: 'CITIZEN-ID:${user?.id ?? "1"}:${user?.name ?? "Citizen"}:MAHA-GP',
                  version: QrVersions.auto,
                  size: 90,
                  padding: EdgeInsets.zero,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                '🔒 अधिकृत डिजिटल पडताळणीसाठी QR स्कॅन करा',
                style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIdModalRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Colors.white),
          ),
        ),
      ],
    );
  }

  void _showEditProfileDialog(BuildContext context, AppProvider app) {
    final user = app.currentUser;
    final isMr = app.language == 'mr';
    final isDark = app.isDarkMode;

    final nameController = TextEditingController(text: user?.name ?? '');
    final phoneController = TextEditingController(text: user?.phone ?? '');
    final houseNoController = TextEditingController(text: user?.houseNo ?? '४५');
    final wardController = TextEditingController(text: user?.wardNo ?? 'Ward 1');
    final emailController = TextEditingController(text: user?.email ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          isMr ? 'प्रोफाईल माहिती संपादित करा' : 'Edit Profile Details',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w900,
            color: isDark ? Colors.white : const Color(0xFF0F172A),
          ),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0F172A)),
                decoration: InputDecoration(labelText: isMr ? 'पूर्ण नाव' : 'Full Name'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneController,
                style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0F172A)),
                decoration: InputDecoration(labelText: isMr ? 'मोबाईल नंबर' : 'Mobile Number'),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: houseNoController,
                      style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0F172A)),
                      decoration: InputDecoration(labelText: isMr ? 'घर क्र.' : 'House No'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: wardController,
                      style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0F172A)),
                      decoration: InputDecoration(labelText: isMr ? 'वॉर्ड क्र.' : 'Ward No'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              TextField(
                controller: emailController,
                style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0F172A)),
                decoration: InputDecoration(labelText: isMr ? 'ईमेल (ऐच्छिक)' : 'Email (Optional)'),
                keyboardType: TextInputType.emailAddress,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(isMr ? 'रद्द करा' : 'Cancel', style: const TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryOrange),
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
                  wardNo: wardController.text.trim(),
                  houseNo: houseNoController.text.trim(),
                  address: user.address,
                  designation: user.designation,
                  employeeCode: user.employeeCode,
                  avatarUrl: user.avatarUrl,
                );
                app.updateUser(updated);
              }
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(isMr ? '✅ प्रोफाइल माहिती अद्ययावत केली!' : '✅ Profile updated successfully!'),
                  backgroundColor: const Color(0xFF10B981),
                ),
              );
            },
            child: Text(isMr ? 'जतन करा' : 'Save Changes', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context, AppProvider app) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: app.isDarkMode ? const Color(0xFF1E293B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(app.tr('logout')),
        content: Text(app.tr('logoutConfirm')),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(app.tr('cancel'), style: const TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(context).pop();
              await app.logout();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.dangerRed),
            child: Text(app.tr('confirm'), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showServerConfigDialog(BuildContext context, AppProvider app) {
    final isMr = app.language == 'mr';
    final isDark = app.isDarkMode;
    final urlController = TextEditingController(text: ApiConfig.baseUrl);
    bool useLive = ApiConfig.isUsingLiveBackend;
    bool isTesting = false;
    String? testResult;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(Icons.cloud_done_rounded, color: Color(0xFF10B981)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isMr ? 'सर्व्हर व Render API सेटिंग' : 'Server & Render API Settings',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isMr
                      ? 'मोबाईल ॲप थेट Render Live Cloud Backend ला जोडलेले आहे:'
                      : 'The mobile app connects to the Render Live Cloud Backend:',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: (isDark ? Colors.black26 : const Color(0xFFF1F5F9)),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          useLive ? 'Render Live Cloud Active' : 'Local Dev Server',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF10B981),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  isMr ? 'API बेस URL (Base URL):' : 'API Base URL:',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                  ),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: urlController,
                  style: TextStyle(
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                  decoration: InputDecoration(
                    hintText: 'https://your-service.onrender.com/api',
                    hintStyle: const TextStyle(fontSize: 11, color: Colors.grey),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    filled: true,
                    fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    ActionChip(
                      avatar: const Icon(Icons.cloud_rounded, size: 14, color: Colors.white),
                      backgroundColor: const Color(0xFF10B981),
                      label: const Text('Render Live Default', style: TextStyle(color: Colors.white, fontSize: 10)),
                      onPressed: () {
                        setDialogState(() {
                          urlController.text = ApiConfig.defaultLiveUrl;
                          useLive = true;
                        });
                      },
                    ),
                    ActionChip(
                      avatar: const Icon(Icons.laptop_chromebook, size: 14),
                      label: const Text('Localhost (10.0.2.2)', style: TextStyle(fontSize: 10)),
                      onPressed: () {
                        setDialogState(() {
                          urlController.text = 'http://10.0.2.2:5000/api';
                          useLive = false;
                        });
                      },
                    ),
                  ],
                ),
                if (testResult != null) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: testResult!.startsWith('✅') ? const Color(0xFF10B981).withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      testResult!,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: testResult!.startsWith('✅') ? const Color(0xFF10B981) : Colors.orange,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isTesting
                  ? null
                  : () async {
                      setDialogState(() {
                        isTesting = true;
                        testResult = isMr ? 'सर्व्हर तपासत आहे...' : 'Testing connection...';
                      });
                      try {
                        final pingUrl = Uri.parse('${urlController.text.trim().replaceAll(RegExp(r"/$"), "")}/geo/districts');
                        final res = await http.get(pingUrl).timeout(const Duration(seconds: 10));
                        setDialogState(() {
                          isTesting = false;
                          if (res.statusCode == 200) {
                            testResult = isMr ? '✅ सर्व्हर यशस्वीरित्या कनेक्ट झाला!' : '✅ Connected successfully!';
                          } else {
                            testResult = '⚠️ HTTP Status: ${res.statusCode}';
                          }
                        });
                      } catch (e) {
                        setDialogState(() {
                          isTesting = false;
                          testResult = isMr ? '⚠️ कनेक्ट होऊ शकले नाही (कदाचित सर्व्हर सुरू होत आहे)' : '⚠️ Could not connect: $e';
                        });
                      }
                    },
              child: Text(isMr ? 'कनेक्शन तपासा' : 'Test Ping'),
            ),
            ElevatedButton(
              onPressed: () async {
                final targetUrl = urlController.text.trim();
                await ApiConfig.setCustomBackendUrl(targetUrl);
                await ApiConfig.setUseLiveBackend(useLive);
                if (context.mounted) {
                  Navigator.pop(ctx);
                  setState(() {});
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        isMr ? 'सर्व्हर सेटिंग जतन केली: ${ApiConfig.baseUrl}' : 'Server URL updated: ${ApiConfig.baseUrl}',
                      ),
                      backgroundColor: const Color(0xFF10B981),
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: Text(isMr ? 'जतन करा (Save)' : 'Save'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final user = app.currentUser;
    final isMr = app.language == 'mr';
    final isDark = app.isDarkMode;

    final certs = app.certificates;
    final grievances = app.grievances;
    final taxes = app.taxRecords;
    final hasTaxDue = taxes.any((t) => t.dueAmount > 0);

    final avatar = user?.avatarUrl != null && user!.avatarUrl!.isNotEmpty
        ? user.avatarUrl!
        : 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9),
      appBar: CustomGovAppBar(
        title: app.tr('profileTitle'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // 🌟 1. SMART CITIZEN ID CARD
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B), Color(0xFF0B1329)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.4), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Gov Header Strip
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.account_balance_rounded, color: Color(0xFFFCD34D), size: 18),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    isMr ? 'महाराष्ट्र शासन • ग्रामविकास विभाग' : 'Govt of Maharashtra • Rural Dev',
                                    style: const TextStyle(
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFFFCD34D),
                                      letterSpacing: 0.3,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    isMr ? 'स्मार्ट नागरिक ओळखपत्र' : 'Smart Resident ID Card',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.white,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.verified_rounded, color: Color(0xFF34D399), size: 12),
                            const SizedBox(width: 4),
                            Text(
                              isMr ? 'सत्यापित' : 'VERIFIED',
                              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF34D399)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Colors.white12, height: 1),
                  const SizedBox(height: 14),

                  // Resident Info & Photo & QR
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Avatar with change button
                      Stack(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(2.5),
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                colors: [Color(0xFFF59E0B), Color(0xFFE65100)],
                              ),
                            ),
                            child: CircleAvatar(
                              radius: 34,
                              backgroundImage: NetworkImage(avatar),
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: InkWell(
                              onTap: () => _showAvatarPicker(context, app),
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: AppTheme.primaryOrange,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 12),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.name ?? 'नागरिक',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'घर क्र. ${user?.houseNo ?? "४५"} • ${user?.wardNo ?? "Ward 1"}',
                              style: const TextStyle(fontSize: 11, color: Color(0xFFCBD5E1), fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'ता. ${user?.taluka ?? "संगमनेर"}, जि. ${user?.district ?? "अहिल्यानगर"}',
                              style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8)),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'आधार: ${user?.aadhaar ?? "XXXX-XXXX-4567"}',
                              style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFFFDE68A)),
                            ),
                          ],
                        ),
                      ),
                      // Embedded Verification QR Code
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: QrImageView(
                          data: 'CITIZEN-ID:${user?.id ?? "1"}:${user?.name ?? "Citizen"}:MAHA-GP',
                          version: QrVersions.auto,
                          size: 52,
                          padding: EdgeInsets.zero,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Bottom Card Bar with [ View Digital ID ] Button
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          child: Text(
                            'ID: GP-CIT-${user?.id ?? "2026"}',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFFCD34D)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        InkWell(
                          onTap: () => _showDigitalIdCardModal(context, user, isDark, isMr),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryOrange,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.badge_rounded, size: 13, color: Colors.white),
                                const SizedBox(width: 4),
                                Text(
                                  isMr ? 'डिजिटल ID पहा ➔' : 'View Digital ID ➔',
                                  style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 🌟 2. Quick Activity Overview Box
            Row(
              children: [
                Expanded(
                  child: _buildSummaryBox(
                    label: isMr ? 'दाखले' : 'Certificates',
                    value: '${certs.length}',
                    color: const Color(0xFF2563EB),
                    icon: Icons.description_rounded,
                    isDark: isDark,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildSummaryBox(
                    label: isMr ? 'तक्रारी' : 'Grievances',
                    value: '${grievances.length}',
                    color: const Color(0xFFD97706),
                    icon: Icons.support_agent_rounded,
                    isDark: isDark,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildSummaryBox(
                    label: isMr ? 'कर स्थिती' : 'Tax Status',
                    value: hasTaxDue ? (isMr ? 'थकबाकी' : 'Due') : (isMr ? 'पूर्ण' : 'Paid'),
                    color: hasTaxDue ? const Color(0xFFDC2626) : const Color(0xFF047857),
                    icon: Icons.receipt_long_rounded,
                    isDark: isDark,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 🌟 3. Profile Information Details Tile
            Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            isMr ? 'वैयक्तिक व निवासी माहिती' : 'Personal & Residence Details',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                              color: isDark ? Colors.white : const Color(0xFF0F172A),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.edit_note_rounded, color: AppTheme.primaryOrange, size: 22),
                          onPressed: () => _showEditProfileDialog(context, app),
                        ),
                      ],
                    ),
                    Divider(height: 12, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    _buildInfoTile(Icons.phone_android_rounded, app.tr('mobileNumber'), '+91 ${user?.phone ?? "-"}', isDark),
                    _buildInfoTile(Icons.credit_card_rounded, app.tr('aadhaarNumber'), user?.aadhaar ?? 'XXXX-XXXX-4567', isDark),
                    _buildInfoTile(Icons.calendar_today_rounded, app.tr('dateOfBirth'), user?.dob ?? '1990-05-15', isDark),
                    _buildInfoTile(Icons.home_outlined, app.tr('houseNumber'), user?.houseNo ?? 'घर क्र. ४५', isDark),
                    _buildInfoTile(Icons.location_city_rounded, app.tr('selectWard'), user?.wardNo ?? 'Ward 1', isDark),
                    _buildInfoTile(Icons.account_balance_outlined, app.tr('selectGramPanchayat'), user?.gramPanchayat ?? 'घुलेवाडी', isDark),
                    _buildInfoTile(Icons.map_outlined, isMr ? 'तालुका व जिल्हा' : 'Taluka & Dist', '${user?.taluka ?? "संगमनेर"}, जि. ${user?.district ?? "अहिल्यानगर"}', isDark),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 🌟 4. Settings & Smart Features
            Material(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(20),
              clipBehavior: Clip.antiAlias,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    // 🤖 AI Gram Mitra Launch
                    ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(7),
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                          ),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.auto_awesome, color: Color(0xFFFDE68A), size: 18),
                      ),
                      title: Text(
                        isMr ? 'AI ग्राम मित्र सहाय्यक' : 'AI Gram Mitra Assistant',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      subtitle: Text(
                        isMr ? 'शासकीय योजना व दाखल्यांविषयी थेट विचारा' : 'Instant guidance in Marathi & English',
                        style: TextStyle(fontSize: 10.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF7C3AED)),
                      onTap: () => AiGramMitraModal.show(context),
                    ),
                    Divider(height: 1, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),

                    // 🌐 Switch Language
                    ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryOrange.withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.language_rounded, color: AppTheme.primaryOrange, size: 18),
                      ),
                      title: Text(
                        isMr ? 'भाषा बदला (Change Language)' : 'Language (भाषा)',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      subtitle: Text(
                        isMr ? 'सध्या: मराठी (म)' : 'Current: English (EN)',
                        style: TextStyle(fontSize: 10.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                      ),
                      trailing: TextButton(
                        onPressed: () => app.toggleLanguage(),
                        child: Text(
                          isMr ? 'English करा' : 'मराठी करा',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppTheme.primaryOrange),
                        ),
                      ),
                    ),
                    Divider(height: 1, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),

                    // 🌓 Dark Mode Toggle
                    ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: const Color(0xFF3B82F6).withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded, color: const Color(0xFF3B82F6), size: 18),
                      ),
                      title: Text(
                        isMr ? 'डार्क मोड (Dark Mode)' : 'Dark Theme',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      trailing: Switch(
                        value: isDark,
                        activeColor: AppTheme.primaryOrange,
                        onChanged: (_) => app.toggleDarkMode(),
                      ),
                    ),
                    Divider(height: 1, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),

                    // 🔔 Notifications
                    ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.notifications_active_rounded, color: Color(0xFFEF4444), size: 18),
                      ),
                      title: Text(
                        isMr ? 'सूचना केंद्र (Notifications)' : 'Notification Center',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF94A3B8)),
                      onTap: () => NotificationCenterModal.show(context),
                    ),
                    Divider(height: 1, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),

                    // 🌐 Server Connection (Render Live Cloud vs Local)
                    ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.cloud_sync_rounded, color: Color(0xFF10B981), size: 18),
                      ),
                      title: Text(
                        isMr ? 'सर्व्हर व API कनेक्शन (Render Cloud)' : 'Server & Render Cloud API',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      subtitle: Text(
                        ApiConfig.baseUrl,
                        style: TextStyle(
                          fontSize: 10,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                          fontFamily: 'monospace',
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF10B981)),
                      onTap: () => _showServerConfigDialog(context, app),
                    ),

                    // 👑 Official Portal Link (if staff)
                    if (user != null && user.isOfficial) ...[
                      Divider(height: 1, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(7),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withOpacity(0.15),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.admin_panel_settings_rounded, color: Color(0xFFF59E0B), size: 18),
                        ),
                        title: Text(
                          isMr ? 'प्रशासकीय डेस्क (Gov Portal)' : 'Official Admin Portal',
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                        subtitle: Text(
                          user.roleDisplayMr,
                          style: const TextStyle(fontSize: 10.5, color: Color(0xFFF59E0B), fontWeight: FontWeight.bold),
                        ),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFFF59E0B)),
                        onTap: () => app.setGovdDeskMode(true),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 🚪 Logout Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _confirmLogout(context, app),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.dangerRed,
                  side: const BorderSide(color: AppTheme.dangerRed, width: 1.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: const EdgeInsets.symmetric(vertical: 13),
                ),
                icon: const Icon(Icons.logout_rounded, size: 18),
                label: Text(
                  app.tr('logout'),
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                ),
              ),
            ),
            const SizedBox(height: 28),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryBox({
    required String label,
    required String value,
    required Color color,
    required IconData icon,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w900,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
          ),
          const SizedBox(height: 2),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              ),
              maxLines: 1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: AppTheme.primaryOrange),
          const SizedBox(width: 10),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 130),
            child: Text(
              label,
              style: TextStyle(
                fontSize: 11.5,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                fontWeight: FontWeight.w600,
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
      ),
    );
  }
}
