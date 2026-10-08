import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../config/theme.dart';
import '../config/locations.dart';
import 'notification_center_modal.dart';

class CustomGovAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final bool showBackButton;
  final List<Widget>? actions;

  const CustomGovAppBar({
    super.key,
    this.title,
    this.showBackButton = false,
    this.actions,
  });

  @override
  Size get preferredSize => const Size.fromHeight(65);

  void _showLocationSelector(BuildContext context, AppProvider app) {
    final isMr = app.language == 'mr';
    final isDark = app.isDarkMode;
    final currentGp = app.currentUser?.gramPanchayat ?? 'घुलेवाडी';

    final List<Map<String, String>> gps = [];
    LocationData.maharashtraLocations.forEach((dist, talukaMap) {
      talukaMap.forEach((taluka, gpList) {
        for (final gp in gpList) {
          gps.add({'name': gp, 'taluka': taluka, 'dist': dist});
        }
      });
    });

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.75,
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Drag Handle
                Center(
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    width: 44,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                Row(
                  children: [
                    const Icon(Icons.location_city_rounded, color: AppTheme.primaryOrange, size: 22),
                    const SizedBox(width: 8),
                    Text(
                      isMr ? 'ग्रामपंचायत कार्यक्षेत्र निवडा' : 'Select Gram Panchayat',
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
                      ? 'आपल्या गावाची माहिती व सेवा पाहण्यासाठी ग्रामपंचायत निवडा'
                      : 'Choose Gram Panchayat to view village data and services',
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                  ),
                ),
                const SizedBox(height: 14),
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: gps.length,
                    itemBuilder: (context, index) {
                      final gp = gps[index];
                      final isSelected = gp['name'] == currentGp;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (isDark ? const Color(0xFF1E293B) : const Color(0xFFFFF7ED))
                              : (isDark ? const Color(0xFF131C2E) : Colors.white),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isSelected ? AppTheme.primaryOrange : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                            width: isSelected ? 1.5 : 1.0,
                          ),
                        ),
                        child: ListTile(
                          dense: true,
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppTheme.primaryOrange.withOpacity(0.15)
                                  : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              Icons.account_balance_rounded,
                              color: isSelected ? AppTheme.primaryOrange : const Color(0xFF64748B),
                              size: 18,
                            ),
                          ),
                          title: Text(
                            'ग्रामपंचायत ${gp["name"]}',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                              color: isSelected ? AppTheme.primaryOrange : (isDark ? Colors.white : const Color(0xFF0F172A)),
                            ),
                          ),
                          subtitle: Text(
                            'ता. ${gp["taluka"]}, जि. ${gp["dist"]}',
                            style: TextStyle(
                              fontSize: 10.5,
                              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                            ),
                          ),
                          trailing: isSelected
                              ? const Icon(Icons.check_circle_rounded, color: AppTheme.primaryOrange, size: 20)
                              : const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Color(0xFF94A3B8)),
                          onTap: () {
                            app.switchLocation(gp['name']!, gp['taluka']!);
                            Navigator.pop(ctx);
                          },
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final gpName = app.currentUser?.gramPanchayat ?? 'घुलेवाडी';
    final taluka = app.currentUser?.taluka ?? 'संगमनेर';
    final unreadCount = app.unreadNotificationCount;

    return AppBar(
      backgroundColor: isDark ? const Color(0xFF070B12) : AppTheme.govNavy,
      elevation: 0,
      automaticallyImplyLeading: false,
      leading: (showBackButton && Navigator.canPop(context))
          ? IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
              onPressed: () {
                if (Navigator.canPop(context)) {
                  Navigator.of(context).pop();
                }
              },
            )
          : null,
      title: InkWell(
        onTap: () => _showLocationSelector(context, app),
        borderRadius: BorderRadius.circular(12),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                gradient: AppTheme.saffronGradient,
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: Colors.orange.withOpacity(0.3),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Center(
                child: Icon(Icons.account_balance_rounded, color: Colors.white, size: 20),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: Text(
                          title ?? 'ग्रामपंचायत $gpName',
                          style: const TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            letterSpacing: 0.1,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 2),
                      const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFFFCD34D), size: 16),
                    ],
                  ),
                  Text(
                    'ता. $taluka • महाराष्ट्र शासन',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.white.withOpacity(0.8),
                      fontWeight: FontWeight.w500,
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
      actions: [
        // 🏛️ Gov Desk Quick Switcher (If official is viewing citizen side)
        if (app.currentUser?.isOfficial == true && !app.isGovdDeskMode)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 2),
            child: InkWell(
              onTap: () => app.setGovdDeskMode(true),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFF59E0B).withOpacity(0.3),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.admin_panel_settings_rounded, color: Colors.white, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      app.language == 'mr' ? 'शासकीय कक्ष' : 'Gov Desk',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ),
            ),
          ),

        // 🔔 Notification Center Button with unread badge
        IconButton(
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          icon: Stack(
            clipBehavior: Clip.none,
            children: [
              const Icon(Icons.notifications_outlined, color: Colors.white, size: 22),
              if (unreadCount > 0)
                Positioned(
                  top: -2,
                  right: -2,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(
                      color: Color(0xFFEF4444),
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '$unreadCount',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9.5,
                        fontWeight: FontWeight.w900,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          onPressed: () => NotificationCenterModal.show(context),
        ),

        // 🌓 Theme Switcher Button (Dark / Light)
        IconButton(
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          icon: Icon(
            isDark ? Icons.light_mode_rounded : Icons.dark_mode_outlined,
            color: const Color(0xFFFCD34D),
            size: 20,
          ),
          tooltip: isDark ? 'लाइट मोड' : 'डार्क मोड',
          onPressed: () => app.toggleDarkMode(),
        ),

        // 🌐 Language Toggle Button
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 4),
          child: InkWell(
            onTap: () => app.toggleLanguage(),
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.2), width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.language_rounded, color: AppTheme.saffron, size: 12),
                  const SizedBox(width: 3),
                  Text(
                    app.language == 'mr' ? 'मराठी' : 'EN',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (actions != null) ...actions!,
        const SizedBox(width: 4),
      ],
    );
  }
}
