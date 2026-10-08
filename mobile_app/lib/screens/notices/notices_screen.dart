import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';

class NoticesScreen extends StatelessWidget {
  final bool showBackButton;
  const NoticesScreen({super.key, this.showBackButton = true});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final notices = app.notices;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9),
      appBar: CustomGovAppBar(
        title: app.tr('importantNotices'),
        showBackButton: showBackButton && Navigator.canPop(context),
      ),
      body: RefreshIndicator(
        onRefresh: () => app.refreshAllData(),
        color: AppTheme.primaryOrange,
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: notices.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final not = notices[index];
            final title = app.language == 'mr' ? not.titleMr : not.titleEn;
            final content = app.language == 'mr' ? not.contentMr : not.contentEn;

            return Container(
              padding: const EdgeInsets.all(16),
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
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: not.isUrgent
                              ? (isDark ? const Color(0xFF7F1D1D).withOpacity(0.5) : AppTheme.dangerRedLight)
                              : (isDark ? const Color(0xFF78350F).withOpacity(0.5) : AppTheme.saffronLight),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          not.isUrgent ? 'तातडीची सूचना' : not.category,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: not.isUrgent
                                ? (isDark ? const Color(0xFFFCA5A5) : AppTheme.dangerRed)
                                : (isDark ? const Color(0xFFFDE68A) : AppTheme.primaryOrangeDark),
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          Icon(Icons.calendar_today_rounded, size: 12, color: isDark ? const Color(0xFF94A3B8) : Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            not.publishDate,
                            style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : Colors.grey),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    content,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                      height: 1.4,
                    ),
                  ),
                  Divider(height: 20, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                  Row(
                    children: [
                      Icon(Icons.campaign_outlined, size: 14, color: isDark ? const Color(0xFFFCD34D) : AppTheme.govNavy),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          'जारीकर्ता: ${not.issuedBy}',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? const Color(0xFFFCD34D) : AppTheme.govNavy,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
