import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../widgets/govd_theme.dart';
import 'govd_certificates_desk.dart';
import 'govd_grievances_desk.dart';
import 'govd_tax_desk.dart';
import 'govd_user_management_desk.dart';
import 'govd_projects_desk.dart';
import 'govd_schemes_desk.dart';

class GovdGlobalSearchModal extends StatefulWidget {
  const GovdGlobalSearchModal({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const GovdGlobalSearchModal(),
    );
  }

  @override
  State<GovdGlobalSearchModal> createState() => _GovdGlobalSearchModalState();
}

class _GovdGlobalSearchModalState extends State<GovdGlobalSearchModal> {
  final _searchController = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final results = app.searchAll(_query);

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 8),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Search Box
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              controller: _searchController,
              autofocus: true,
              onChanged: (v) => setState(() => _query = v),
              style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0F172A), fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                hintText: 'नागरिक, दाखला, तक्रार, कर, कामे, योजना शोधा...',
                hintStyle: TextStyle(fontSize: 12.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                prefixIcon: const Icon(Icons.search_rounded, color: GovdTheme.goldDark),
                suffixIcon: _query.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _query = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Quick Filter tags
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                _buildQuickTag('दाखले', () => setState(() => _query = 'दाखला')),
                const SizedBox(width: 6),
                _buildQuickTag('तक्रारी', () => setState(() => _query = 'तक्रार')),
                const SizedBox(width: 6),
                _buildQuickTag('घरपट्टी/पाणीपट्टी', () => setState(() => _query = 'कर')),
                const SizedBox(width: 6),
                _buildQuickTag('शेतकरी योजना', () => setState(() => _query = 'योजना')),
                const SizedBox(width: 6),
                _buildQuickTag('विकास कामे', () => setState(() => _query = 'रस्ता')),
              ],
            ),
          ),

          const Divider(height: 16),

          // Results List
          Expanded(
            child: _query.trim().isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.manage_search_rounded, size: 54, color: Colors.grey.shade400),
                        const SizedBox(height: 8),
                        Text(
                          'नाव, दाखला क्र., तक्रार किंवा मिळकत क्र. प्रविष्ट करा',
                          style: TextStyle(fontSize: 12.5, color: Colors.grey.shade600, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  )
                : results.isEmpty
                    ? Center(
                        child: Text(
                          '"$_query" साठी नोंदी सापडल्या नाहीत',
                          style: TextStyle(fontSize: 13, color: Colors.grey.shade600, fontWeight: FontWeight.bold),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: results.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (ctx, i) {
                          final item = results[i];
                          return InkWell(
                            onTap: () {
                              Navigator.pop(context);
                              _navigateToResult(context, item.actionType);
                            },
                            borderRadius: BorderRadius.circular(14),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: item.color.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Icon(item.icon, color: item.color, size: 20),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.title,
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w800,
                                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          item.subtitle,
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      item.category,
                                      style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: item.color),
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

  Widget _buildQuickTag(String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFCBD5E1)),
        ),
        child: Text(label, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF334155))),
      ),
    );
  }

  void _navigateToResult(BuildContext context, String actionType) {
    switch (actionType) {
      case 'apply_certificate':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdCertificatesDesk()));
        break;
      case 'pay_tax':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdTaxDesk()));
        break;
      case 'lodge_grievance':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdGrievancesDesk()));
        break;
      case 'view_scheme':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdSchemesDesk()));
        break;
      case 'call_official':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdUserManagementDesk()));
        break;
      default:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const GovdProjectsDesk()));
        break;
    }
  }
}
