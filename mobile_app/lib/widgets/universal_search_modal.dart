import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/app_provider.dart';
import '../screens/certificates/certificates_list_screen.dart';
import '../screens/taxes/tax_records_screen.dart';
import '../screens/schemes/schemes_list_screen.dart';
import '../screens/notices/notices_screen.dart';
import '../screens/directory/directory_screen.dart';

class UniversalSearchModal extends StatefulWidget {
  const UniversalSearchModal({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const UniversalSearchModal(),
    );
  }

  @override
  State<UniversalSearchModal> createState() => _UniversalSearchModalState();
}

class _UniversalSearchModalState extends State<UniversalSearchModal> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'all';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final clean = phoneNumber.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _handleResultTap(UniversalSearchResult item) {
    Navigator.of(context).pop();

    switch (item.actionType) {
      case 'apply_certificate':
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CertificatesListScreen()));
        break;
      case 'pay_tax':
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TaxRecordsScreen()));
        break;
      case 'view_scheme':
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SchemesListScreen()));
        break;
      case 'view_notice':
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const NoticesScreen()));
        break;
      case 'call_official':
        if (item.data != null && item.data.phone != null) {
          _makePhoneCall(item.data.phone);
        } else {
          Navigator.of(context).push(MaterialPageRoute(builder: (_) => const DirectoryScreen()));
        }
        break;
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';

    final query = _searchController.text;
    final rawResults = app.searchAll(query);

    final results = _selectedCategory == 'all'
        ? rawResults
        : rawResults.where((r) {
            if (_selectedCategory == 'cert') return r.actionType == 'apply_certificate';
            if (_selectedCategory == 'scheme') return r.actionType == 'view_scheme';
            if (_selectedCategory == 'tax') return r.actionType == 'pay_tax';
            if (_selectedCategory == 'notice') return r.actionType == 'view_notice';
            if (_selectedCategory == 'official') return r.actionType == 'call_official';
            return true;
          }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
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

          // Search Header & Input Box
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 6, 16, 12),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                        width: 1.2,
                      ),
                    ),
                    child: TextField(
                      controller: _searchController,
                      autofocus: true,
                      style: TextStyle(
                        fontSize: 14.5,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                        fontWeight: FontWeight.w500,
                      ),
                      decoration: InputDecoration(
                        hintText: isMr
                            ? 'दाखले, योजना, कर, नोटीस किंवा अधिकारी शोधा...'
                            : 'Search certificates, schemes, tax, notices...',
                        hintStyle: TextStyle(
                          fontSize: 13,
                          color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                        ),
                        prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF2563EB)),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.cancel_rounded, size: 18, color: Color(0xFF94A3B8)),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() {});
                                },
                              )
                            : null,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                      onChanged: (_) => setState(() {}),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(
                    isMr ? 'रद्द करा' : 'Cancel',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                  ),
                ),
              ],
            ),
          ),

          // Category Pills
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildCategoryPill('all', isMr ? 'सर्व (All)' : 'All', isDark),
                _buildCategoryPill('cert', isMr ? '📜 दाखले' : 'Certificates', isDark),
                _buildCategoryPill('scheme', isMr ? '🌾 योजना' : 'Schemes', isDark),
                _buildCategoryPill('tax', isMr ? '💰 कर भरणा' : 'Taxes', isDark),
                _buildCategoryPill('notice', isMr ? '📢 सूचना' : 'Notices', isDark),
                _buildCategoryPill('official', isMr ? '👥 अधिकारी' : 'Officials', isDark),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Results List or Empty Prompt
          Expanded(
            child: query.trim().isEmpty
                ? _buildPopularQueries(isDark, isMr)
                : results.isEmpty
                    ? _buildNoResults(isDark, isMr)
                    : ListView.separated(
                        padding: const EdgeInsets.fromLTRB(16, 6, 16, 20),
                        itemCount: results.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, idx) {
                          final item = results[idx];
                          return InkWell(
                            onTap: () => _handleResultTap(item),
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: item.color.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Icon(item.icon, color: item.color, size: 22),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: item.color.withOpacity(0.12),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Text(
                                                item.category,
                                                style: TextStyle(
                                                  fontSize: 9.5,
                                                  fontWeight: FontWeight.bold,
                                                  color: item.color,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          item.title,
                                          style: TextStyle(
                                            fontSize: 13.5,
                                            fontWeight: FontWeight.w700,
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
                                  Icon(
                                    Icons.arrow_forward_ios_rounded,
                                    size: 14,
                                    color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
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

  Widget _buildCategoryPill(String key, String label, bool isDark) {
    final isSelected = _selectedCategory == key;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        labelStyle: TextStyle(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          color: isSelected
              ? Colors.white
              : (isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
        ),
        selectedColor: const Color(0xFF2563EB),
        backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(
            color: isSelected
                ? const Color(0xFF2563EB)
                : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
          ),
        ),
        onSelected: (val) {
          if (val) setState(() => _selectedCategory = key);
        },
      ),
    );
  }

  Widget _buildPopularQueries(bool isDark, bool isMr) {
    final popular = isMr
        ? ['जन्म दाखला', 'रहिवासी दाखला', '१०% कर सवलत', 'नमो शेतकरी योजना', 'घरकुल योजना', 'ग्रामसभा नोटीस', 'सरपंच संपर्क']
        : ['Birth Certificate', 'Residence Certificate', '10% Tax Rebate', 'Namo Shetkari', 'Housing Scheme', 'Gram Sabha', 'Sarpanch Contact'];

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.trending_up_rounded, color: Color(0xFFF59E0B), size: 18),
              const SizedBox(width: 6),
              Text(
                isMr ? 'नेहमी शोधले जाणारे विषय:' : 'Popular Searches:',
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.bold,
                  color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: popular.map((p) {
              return ActionChip(
                label: Text(p),
                labelStyle: TextStyle(
                  fontSize: 11.5,
                  color: isDark ? const Color(0xFF93C5FD) : const Color(0xFF1D4ED8),
                ),
                backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFEFF6FF),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(
                    color: isDark ? const Color(0xFF1D4ED8).withOpacity(0.4) : const Color(0xFFBFDBFE),
                  ),
                ),
                onPressed: () {
                  _searchController.text = p;
                  setState(() {});
                },
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildNoResults(bool isDark, bool isMr) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search_off_rounded,
              size: 48,
              color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
            ),
            const SizedBox(height: 12),
            Text(
              isMr ? 'कोणतेही परिणाम सापडले नाहीत' : 'No Results Found',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              isMr ? 'दुसरा शब्द टाईप करून पहा किंवा AI ग्राम मित्राची मदत घ्या.' : 'Try a different term or ask AI Gram Mitra.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
