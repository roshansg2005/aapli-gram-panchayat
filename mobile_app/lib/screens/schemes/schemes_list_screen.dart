import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';
import '../../models/scheme_model.dart';
import 'apply_scheme_modal.dart';

class SchemesListScreen extends StatefulWidget {
  final bool showBackButton;
  const SchemesListScreen({super.key, this.showBackButton = true});

  @override
  State<SchemesListScreen> createState() => _SchemesListScreenState();
}

class _SchemesListScreenState extends State<SchemesListScreen> {
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Women & Child',
    'Farmers',
    'Housing',
    'Senior Citizens',
    'Health',
  ];

  void _showEligibilityQuiz(BuildContext context, SchemeModel scheme) {
    int age = 30;
    int income = 150000;
    bool isLandOwner = true;
    bool? isEligible;
    final isDark = context.read<AppProvider>().isDarkMode;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          return AlertDialog(
            backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                const Icon(Icons.psychology_alt_rounded, color: AppTheme.primaryOrange, size: 24),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'योजना पात्रता तपासणी',
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
                    scheme.titleMr,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isDark ? const Color(0xFFFDE68A) : AppTheme.primaryOrangeDark,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Age Slider
                  Text(
                    'आपले वय: $age वर्षे',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                  Slider(
                    value: age.toDouble(),
                    min: 18,
                    max: 80,
                    divisions: 62,
                    activeColor: AppTheme.primaryOrange,
                    onChanged: (val) => setDialogState(() => age = val.toInt()),
                  ),
                  const SizedBox(height: 8),

                  // Annual Income Slider
                  Text(
                    'वार्षिक उत्पन्न: ₹${income.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                  Slider(
                    value: income.toDouble(),
                    min: 30000,
                    max: 500000,
                    divisions: 47,
                    activeColor: AppTheme.primaryOrange,
                    onChanged: (val) => setDialogState(() => income = val.toInt()),
                  ),
                  const SizedBox(height: 8),

                  // Land Ownership Toggle
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'स्वतःची शेतजमीन आहे का?',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      Switch(
                        value: isLandOwner,
                        activeThumbColor: AppTheme.primaryOrange,
                        onChanged: (val) => setDialogState(() => isLandOwner = val),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Result Box if evaluated
                  if (isEligible != null) ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isEligible!
                            ? (isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5))
                            : (isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFEF2F2)),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isEligible! ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isEligible! ? Icons.verified_rounded : Icons.info_outline_rounded,
                            color: isEligible! ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              isEligible!
                                  ? '🎉 अभिनंदन! आपण या योजनेसाठी पात्र आहात. त्वरित अर्ज करा.'
                                  : '⚠️ नमूद माहितीनुसार आपण या योजनेच्या अटी पूर्ण करत नाही.',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.bold,
                                color: isEligible!
                                    ? (isDark ? Colors.white : const Color(0xFF047857))
                                    : (isDark ? Colors.white : const Color(0xFFDC2626)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('बंद करा', style: TextStyle(color: Color(0xFF64748B))),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryOrange),
                onPressed: () {
                  setDialogState(() {
                    if (scheme.category.contains('शेतकरी') || scheme.titleMr.contains('शेतकरी')) {
                      isEligible = isLandOwner && income <= 300000;
                    } else {
                      isEligible = income <= 250000;
                    }
                  });
                },
                child: const Text('पात्रता तपासा', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isMr = app.language == 'mr';
    final isDark = app.isDarkMode;
    final schemes = app.schemes;

    final filteredSchemes = _selectedCategory == 'All'
        ? schemes
        : schemes.where((s) => s.category.toLowerCase().contains(_selectedCategory.toLowerCase())).toList();

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9),
      appBar: CustomGovAppBar(
        title: app.tr('schemesTitle'),
        showBackButton: widget.showBackButton,
      ),
      body: Column(
        children: [
          // Filter Category Chips
          Container(
            color: isDark ? const Color(0xFF131C2E) : Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _categories.map((cat) {
                  final isSelected = _selectedCategory == cat;
                  final label = isMr
                      ? (cat == 'All'
                          ? 'सर्व'
                          : cat == 'Women & Child'
                              ? 'महिला व बाल'
                              : cat == 'Farmers'
                                  ? 'शेतकरी'
                                  : cat == 'Housing'
                                      ? 'गृहनिर्माण'
                                      : cat == 'Senior Citizens'
                                          ? 'ज्येष्ठ नागरिक'
                                          : 'आरोग्य')
                      : cat;

                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: InkWell(
                      onTap: () => setState(() => _selectedCategory = cat),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppTheme.primaryOrange
                              : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? AppTheme.primaryOrange
                                : (isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                          ),
                        ),
                        child: Text(
                          label,
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                            color: isSelected
                                ? Colors.white
                                : (isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Schemes List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => app.refreshAllData(),
              color: AppTheme.primaryOrange,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: filteredSchemes.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final sch = filteredSchemes[index];
                  final title = isMr ? sch.titleMr : sch.titleEn;
                  final dept = isMr ? sch.departmentMr : sch.departmentEn;
                  final desc = isMr ? sch.descriptionMr : sch.descriptionEn;

                  return Container(
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF831843) : const Color(0xFFFDF2F8),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: isDark ? const Color(0xFFBE185D) : const Color(0xFFFBCFE8)),
                                ),
                                child: Text(
                                  sch.category.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    color: isDark ? const Color(0xFFFBCFE8) : const Color(0xFF9D174D),
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: isDark ? const Color(0xFF047857) : const Color(0xFFA7F3D0)),
                                ),
                                child: Text(
                                  'अनुदान: ₹${sch.maxSubsidy.toInt()}',
                                  style: TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w900,
                                    color: isDark ? const Color(0xFF6EE7B7) : const Color(0xFF047857),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            title,
                            style: TextStyle(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w900,
                              color: isDark ? Colors.white : const Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            dept,
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            desc,
                            style: TextStyle(
                              fontSize: 11.5,
                              color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Eligibility Box
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(Icons.check_circle_outline_rounded, size: 14, color: Color(0xFF059669)),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(
                                        'पात्रता: ${sch.eligibility}',
                                        style: TextStyle(
                                          fontSize: 10.5,
                                          color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(Icons.description_outlined, size: 14, color: Color(0xFF2563EB)),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(
                                        'कागदपत्रे: ${sch.documentsRequired}',
                                        style: TextStyle(
                                          fontSize: 10.5,
                                          color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Action Buttons: Eligibility Quiz & Apply
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () => _showEligibilityQuiz(context, sch),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppTheme.primaryOrange,
                                    side: const BorderSide(color: AppTheme.primaryOrange),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                  ),
                                  icon: const Icon(Icons.psychology_rounded, size: 16),
                                  label: Text(
                                    isMr ? 'पात्रता तपासा' : 'Check Eligibility',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    showModalBottomSheet(
                                      context: context,
                                      isScrollControlled: true,
                                      shape: const RoundedRectangleBorder(
                                        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                                      ),
                                      builder: (_) => ApplySchemeModal(scheme: sch),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.primaryOrange,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    elevation: 0,
                                  ),
                                  icon: const Icon(Icons.send_rounded, size: 16),
                                  label: Text(
                                    isMr ? 'ऑनलाइन अर्ज करा' : 'Apply Online',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
