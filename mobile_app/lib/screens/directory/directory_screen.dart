import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';

class DirectoryScreen extends StatelessWidget {
  final bool showBackButton;
  const DirectoryScreen({super.key, this.showBackButton = true});

  Future<void> _makePhoneCall(String phoneNumber) async {
    final clean = phoneNumber.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _openWhatsApp(String phoneNumber) async {
    final clean = phoneNumber.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('https://wa.me/91$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isMr = app.language == 'mr';
    final isDark = app.isDarkMode;
    final officials = app.officials;
    final user = app.currentUser;

    final gpName = user?.gramPanchayat ?? 'घुलेवाडी';
    final talukaName = user?.taluka ?? 'संगमनेर';
    final districtName = user?.district ?? 'अहिल्यानगर';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9),
      appBar: CustomGovAppBar(
        title: app.tr('directoryTitle'),
        showBackButton: showBackButton && Navigator.canPop(context),
      ),
      body: RefreshIndicator(
        onRefresh: () => app.refreshAllData(),
        color: AppTheme.primaryOrange,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 🌟 Top Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.12),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.people_alt_rounded, color: Color(0xFFFDE68A), size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          app.tr('directoryHeading'),
                          style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          app.tr('directorySub'),
                          style: const TextStyle(fontSize: 10.5, color: Color(0xFFCBD5E1)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // 🏛️ Panchayat Office Info Card (Matching Web)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.account_balance_rounded, color: AppTheme.primaryOrange, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        'ग्रामपंचायत $gpName कार्यालय',
                        style: TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.location_on_outlined, size: 14, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'मु. पो. $gpName, ता. $talukaName, जि. $districtName - ४२२६०५',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.schedule_rounded, size: 14, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                      const SizedBox(width: 6),
                      Text(
                        'कार्यालयीन वेळ: सोम - शनि: सकाळी ९:३० ते सायं ६:००',
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // 🚨 Emergency Call Badges (Ambulance, Police Patil)
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => _makePhoneCall('108'),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF450A0A).withOpacity(0.5) : const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDark ? const Color(0xFF991B1B) : const Color(0xFFFCA5A5),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.medical_services_rounded,
                            color: isDark ? const Color(0xFFFCA5A5) : const Color(0xFFDC2626),
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'रुग्णवाहिका',
                                  style: TextStyle(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? const Color(0xFFFCA5A5) : const Color(0xFFDC2626),
                                  ),
                                ),
                                Text(
                                  '१०८ (Toll Free)',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w900,
                                    color: isDark ? Colors.white : const Color(0xFF991B1B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: InkWell(
                    onTap: () => _makePhoneCall('112'),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF172554).withOpacity(0.5) : const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDark ? const Color(0xFF1E40AF) : const Color(0xFF93C5FD),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.local_police_rounded,
                            color: isDark ? const Color(0xFF93C5FD) : const Color(0xFF2563EB),
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'पोलीस पाटील',
                                  style: TextStyle(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? const Color(0xFF93C5FD) : const Color(0xFF2563EB),
                                  ),
                                ),
                                Text(
                                  '११२ / ९८२२४४५५६६',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                    color: isDark ? Colors.white : const Color(0xFF1E40AF),
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
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Officials Section
            Text(
              isMr ? 'लोकप्रतिनिधी व प्रशासकीय अधिकारी' : 'Representatives & Officers',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 10),

            ...officials.map((off) {
              final name = isMr ? off.nameMr : off.nameEn;
              final desig = isMr ? off.designationMr : off.designationEn;

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(13),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundImage: NetworkImage(off.photoUrl),
                        backgroundColor: AppTheme.saffronLight,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              style: TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w900,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              desig,
                              style: TextStyle(
                                fontSize: 11,
                                color: isDark ? const Color(0xFFFCD34D) : AppTheme.primaryOrangeDark,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '📱 +91 ${off.phone}',
                              style: TextStyle(
                                fontSize: 10.5,
                                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Action Icons: Call & WhatsApp
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            onPressed: () => _makePhoneCall(off.phone),
                            icon: Icon(
                              Icons.phone_in_talk_rounded,
                              color: isDark ? const Color(0xFF34D399) : const Color(0xFF047857),
                              size: 20,
                            ),
                            style: IconButton.styleFrom(
                              backgroundColor: isDark ? const Color(0xFF064E3B).withOpacity(0.6) : const Color(0xFFECFDF5),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.all(8),
                            ),
                          ),
                          const SizedBox(width: 6),
                          IconButton(
                            onPressed: () => _openWhatsApp(off.phone),
                            icon: Icon(
                              Icons.chat_bubble_rounded,
                              color: isDark ? const Color(0xFF34D399) : const Color(0xFF059669),
                              size: 18,
                            ),
                            style: IconButton.styleFrom(
                              backgroundColor: isDark ? const Color(0xFF064E3B).withOpacity(0.6) : const Color(0xFFECFDF5),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.all(8),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
