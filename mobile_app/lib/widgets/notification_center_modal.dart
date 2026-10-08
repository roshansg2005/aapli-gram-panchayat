import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../config/theme.dart';
import '../screens/notices/notices_screen.dart';
import '../screens/taxes/tax_records_screen.dart';
import '../screens/certificates/certificates_list_screen.dart';
import '../screens/schemes/schemes_list_screen.dart';
import '../screens/grievances/grievances_list_screen.dart';

class NotificationCenterModal extends StatefulWidget {
  const NotificationCenterModal({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const NotificationCenterModal(),
    );
  }

  @override
  State<NotificationCenterModal> createState() => _NotificationCenterModalState();
}

class _NotificationCenterModalState extends State<NotificationCenterModal> {
  String _selectedCategory = 'all';

  void _handleNotificationTap(BuildContext context, AppNotificationItem item) {
    final app = context.read<AppProvider>();
    app.markNotificationAsRead(item.id);
    Navigator.of(context).pop();

    if (item.actionRoute == 'notices') {
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const NoticesScreen()));
    } else if (item.actionRoute == 'taxes') {
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TaxRecordsScreen()));
    } else if (item.actionRoute == 'certificates') {
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CertificatesListScreen()));
    } else if (item.actionRoute == 'schemes') {
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SchemesListScreen()));
    } else if (item.actionRoute == 'grievances') {
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const GrievancesListScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';
    final notifs = app.notifications;
    final notifsEnabled = app.notificationsEnabled;

    final filterCategories = [
      {'id': 'all', 'nameMr': 'सर्व', 'nameEn': 'All'},
      {'id': 'important', 'nameMr': 'महत्त्वाचे', 'nameEn': 'Important'},
      {'id': 'certificates', 'nameMr': 'दाखले', 'nameEn': 'Certificates'},
      {'id': 'taxes', 'nameMr': 'कर', 'nameEn': 'Tax'},
      {'id': 'grievances', 'nameMr': 'तक्रारी', 'nameEn': 'Grievances'},
      {'id': 'sabha', 'nameMr': 'ग्रामसभा', 'nameEn': 'Gram Sabha'},
    ];

    final filteredNotifs = notifs.where((item) {
      if (_selectedCategory == 'all') return true;
      if (_selectedCategory == 'important') return item.isUrgent;
      if (_selectedCategory == 'certificates') return item.category == 'certificates' || item.actionRoute == 'certificates';
      if (_selectedCategory == 'taxes') return item.category == 'taxes' || item.actionRoute == 'taxes';
      if (_selectedCategory == 'grievances') return item.category == 'grievances' || item.actionRoute == 'grievances';
      if (_selectedCategory == 'sabha') return item.category == 'notices' || item.actionRoute == 'notices';
      return true;
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // Drag Handle
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 16, 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.notifications_active_rounded, color: Color(0xFFEF4444), size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isMr ? 'सूचना केंद्र व अलर्ट्स' : 'Notifications & Alerts',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        isMr ? 'ग्रामसभा, कर सवलत व दाखले अपडेट्स' : 'Gram Sabha, tax rebate & cert updates',
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                if (app.unreadNotificationCount > 0)
                  TextButton.icon(
                    onPressed: () => app.markAllNotificationsAsRead(),
                    icon: const Icon(Icons.done_all_rounded, size: 14, color: AppTheme.primaryOrange),
                    label: Text(
                      isMr ? 'सर्व वाचले' : 'Mark all read',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange),
                    ),
                  ),
              ],
            ),
          ),

          // Horizontal Category Filter Chips
          SizedBox(
            height: 40,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: filterCategories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = filterCategories[index];
                final isSelected = _selectedCategory == cat['id'];
                final label = isMr ? cat['nameMr']! : cat['nameEn']!;

                return ChoiceChip(
                  label: Text(label),
                  selected: isSelected,
                  onSelected: (_) => setState(() => _selectedCategory = cat['id']!),
                  labelStyle: TextStyle(
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                    color: isSelected ? Colors.white : (isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
                  ),
                  selectedColor: AppTheme.primaryOrange,
                  backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected ? AppTheme.primaryOrange : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          const Divider(height: 1),

          // 🔔 Permission Status / Activation Banner
          Container(
            margin: const EdgeInsets.fromLTRB(16, 10, 16, 8),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: notifsEnabled
                  ? (isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5))
                  : (isDark ? const Color(0xFF7C2D12) : const Color(0xFFFFFBEB)),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: notifsEnabled ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  notifsEnabled ? Icons.check_circle_rounded : Icons.notification_add_rounded,
                  color: notifsEnabled ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                  size: 20,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    notifsEnabled
                        ? (isMr ? 'पुश सूचना सेवा सुरू आहे (Active)' : 'Push notifications active')
                        : (isMr ? 'महत्त्वाच्या सूचना मिळवण्यासाठी सुरू करा' : 'Enable notifications'),
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                      color: notifsEnabled
                          ? (isDark ? Colors.white : const Color(0xFF065F46))
                          : (isDark ? Colors.white : const Color(0xFF92400E)),
                    ),
                  ),
                ),
                Switch(
                  value: notifsEnabled,
                  activeColor: const Color(0xFF10B981),
                  onChanged: (val) => app.setNotificationPermission(val),
                ),
              ],
            ),
          ),

          // Notifications List
          Expanded(
            child: filteredNotifs.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.notifications_off_outlined, size: 40, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
                        const SizedBox(height: 10),
                        Text(
                          isMr ? 'या प्रवर्गात कोणत्याही सूचना नाहीत' : 'No notifications in this category',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredNotifs.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = filteredNotifs[index];
                      final isRead = app.isNotificationRead(item.id);

                      return InkWell(
                        onTap: () => _handleNotificationTap(context, item),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isRead
                                ? (isDark ? const Color(0xFF131C2E) : const Color(0xFFF8FAFC))
                                : (isDark ? const Color(0xFF1E293B) : Colors.white),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: item.isUrgent
                                  ? const Color(0xFFEF4444).withOpacity(0.5)
                                  : (isRead
                                      ? (isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0))
                                      : (isDark ? const Color(0xFF3B82F6).withOpacity(0.5) : const Color(0xFF93C5FD))),
                              width: isRead ? 1 : 1.5,
                            ),
                            boxShadow: isRead
                                ? null
                                : [
                                    BoxShadow(
                                      color: const Color(0xFF3B82F6).withOpacity(0.06),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: item.color.withOpacity(0.12),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(item.icon, color: item.color, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        if (item.isUrgent)
                                          Container(
                                            margin: const EdgeInsets.only(right: 6),
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFEF4444),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              isMr ? 'तातडीचे' : 'URGENT',
                                              style: const TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.w900,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ),
                                        Expanded(
                                          child: Text(
                                            item.title,
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: isRead ? FontWeight.w600 : FontWeight.w800,
                                              color: isDark ? Colors.white : const Color(0xFF0F172A),
                                            ),
                                          ),
                                        ),
                                        if (!isRead)
                                          Container(
                                            width: 8,
                                            height: 8,
                                            margin: const EdgeInsets.only(left: 4),
                                            decoration: const BoxDecoration(
                                              color: Color(0xFF3B82F6),
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      item.message,
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                                        height: 1.4,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          item.timestamp,
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            Text(
                                              isMr ? 'पहा →' : 'View →',
                                              style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange),
                                            ),
                                          ],
                                        ),
                                      ],
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
      ),
    );
  }
}
