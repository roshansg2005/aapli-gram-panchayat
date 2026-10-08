import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import 'govd_theme.dart';
import '../screens/govd_global_search_modal.dart';

class GovdAppHeader extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback onOpenDrawer;
  final VoidCallback onOpenAlerts;

  const GovdAppHeader({
    super.key,
    required this.onOpenDrawer,
    required this.onOpenAlerts,
  });

  @override
  Size get preferredSize => const Size.fromHeight(66);

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final user = app.currentUser;
    final isBdo = user?.isTalukaBDO == true;

    final unreadCount = app.unreadNotificationCount;

    String primaryTitle;
    String subTitle;
    if (isBdo) {
      primaryTitle = 'तालुका BDO कक्ष (Taluka BDO Desk)';
      subTitle = 'ता. ${user?.taluka ?? "संगमनेर"} • महाराष्ट्र शासन';
    } else {
      primaryTitle = 'ग्रामपंचायत ${user?.gramPanchayat ?? "घुलेवाडी"}';
      subTitle = 'ता. ${user?.taluka ?? "संगमनेर"}, जि. ${user?.district ?? "अहिल्यानगर"}';
    }

    return AppBar(
      backgroundColor: GovdTheme.navyDark,
      elevation: 0,
      automaticallyImplyLeading: false,
      titleSpacing: 12,
      title: Row(
        children: [
          // Logo Emblem
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              gradient: GovdTheme.goldGradient,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: GovdTheme.gold.withOpacity(0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Center(
              child: Icon(Icons.account_balance_rounded, color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 10),
          // Titles
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  primaryTitle,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.1,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 1),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: GovdTheme.gold.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        user?.roleDisplayMr.split(' ').first ?? '👑',
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: GovdTheme.goldLight),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        subTitle,
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.white.withOpacity(0.75),
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        // 🔍 Global Search Button
        IconButton(
          constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          padding: EdgeInsets.zero,
          icon: const Icon(Icons.search_rounded, color: Colors.white, size: 21),
          tooltip: 'शोधा',
          onPressed: () => GovdGlobalSearchModal.show(context),
        ),

        // 🔔 Notification Alerts Bell with unread badge
        IconButton(
          constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          padding: EdgeInsets.zero,
          icon: Stack(
            clipBehavior: Clip.none,
            children: [
              const Icon(Icons.notifications_outlined, color: Colors.white, size: 21),
              if (unreadCount > 0)
                Positioned(
                  top: -2,
                  right: -2,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(
                      color: GovdTheme.rose,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 14, minHeight: 14),
                    child: Text(
                      '$unreadCount',
                      style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.w900),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          tooltip: 'सूचना',
          onPressed: onOpenAlerts,
        ),

        // ☰ Hamburger / Menu Drawer Trigger
        IconButton(
          constraints: const BoxConstraints(minWidth: 38, minHeight: 38),
          padding: const EdgeInsets.only(right: 8, left: 4),
          icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
          tooltip: 'मेन्यू',
          onPressed: onOpenDrawer,
        ),
      ],
    );
  }
}
