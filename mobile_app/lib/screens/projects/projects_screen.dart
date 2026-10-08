import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';

class ProjectsScreen extends StatelessWidget {
  final bool showBackButton;
  const ProjectsScreen({super.key, this.showBackButton = true});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final projects = app.projects;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9),
      appBar: CustomGovAppBar(
        title: app.tr('serviceProjects'),
        showBackButton: showBackButton && Navigator.canPop(context),
      ),
      body: RefreshIndicator(
        onRefresh: () => app.refreshAllData(),
        color: AppTheme.primaryOrange,
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: projects.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, index) {
            final proj = projects[index];
            final title = app.language == 'mr' ? proj.titleMr : proj.titleEn;
            final desc = app.language == 'mr' ? proj.descriptionMr : proj.descriptionEn;

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
                          color: isDark ? const Color(0xFF78350F).withOpacity(0.5) : AppTheme.saffronLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          proj.category,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isDark ? const Color(0xFFFDE68A) : AppTheme.primaryOrangeDark,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: proj.status == 'completed'
                              ? (isDark ? const Color(0xFF064E3B).withOpacity(0.6) : AppTheme.successGreenLight)
                              : (isDark ? const Color(0xFF1E3A8A).withOpacity(0.6) : AppTheme.govBlueLight),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          proj.status == 'completed' ? 'काम पूर्ण (100%)' : 'प्रगतीत (${proj.completionPercentage}%)',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: proj.status == 'completed'
                                ? (isDark ? const Color(0xFF6EE7B7) : AppTheme.successGreen)
                                : (isDark ? const Color(0xFF93C5FD) : AppTheme.govBlue),
                          ),
                        ),
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
                    desc,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Progress Bar
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'कामाची प्रगती (Progress):',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                            ),
                          ),
                          Text(
                            '${proj.completionPercentage}%',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : const Color(0xFF0F172A),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: proj.completionPercentage / 100.0,
                          backgroundColor: isDark ? const Color(0xFF334155) : Colors.grey.shade200,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            proj.status == 'completed' ? const Color(0xFF10B981) : AppTheme.primaryOrange,
                          ),
                          minHeight: 6,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Budget vs Expense Box
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            children: [
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Text(
                                  'मंजूर निधी (Budget)',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                                  ),
                                ),
                              ),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Text(
                                  '₹${(proj.budget / 100000).toStringAsFixed(1)} लाख',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? const Color(0xFF60A5FA) : AppTheme.govNavy,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 24,
                          color: isDark ? const Color(0xFF334155) : Colors.grey.shade300,
                        ),
                        Expanded(
                          child: Column(
                            children: [
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Text(
                                  'झालेला खर्च (Spent)',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                                  ),
                                ),
                              ),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Text(
                                  '₹${(proj.expenditure / 100000).toStringAsFixed(1)} लाख',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF10B981),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
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
