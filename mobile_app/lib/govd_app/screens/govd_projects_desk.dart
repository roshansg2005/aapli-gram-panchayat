import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../models/project_model.dart';
import '../widgets/govd_theme.dart';

class GovdProjectsDesk extends StatefulWidget {
  const GovdProjectsDesk({super.key});

  @override
  State<GovdProjectsDesk> createState() => _GovdProjectsDeskState();
}

class _GovdProjectsDeskState extends State<GovdProjectsDesk> {
  String _selectedFilter = 'all'; // all, in_progress, completed, sanctioned

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final projects = app.projects;
    final user = app.currentUser;

    // Filter projects
    final filteredProjects = projects.where((p) {
      if (_selectedFilter == 'in_progress') return p.status == 'in_progress' || p.status == 'ongoing';
      if (_selectedFilter == 'completed') return p.status == 'completed';
      if (_selectedFilter == 'sanctioned') return p.status == 'planned' || p.status == 'approved';
      return true;
    }).toList();

    double totalBudget = 0;
    double totalExp = 0;
    for (var p in projects) {
      totalBudget += p.budget;
      totalExp += p.expenditure;
    }

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '🏗️ ग्रामविकास प्रकल्प व निधी सनियंत्रण',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              '${user?.gramPanchayat ?? "घुलेवाडी"} • Development Works Desk',
              style: TextStyle(fontSize: 10.5, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            onPressed: () => app.refreshAllData(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddProjectDialog(context, app),
        backgroundColor: GovdTheme.saffronPrimary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('नवीन विकास काम जोडा', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
      ),
      body: Column(
        children: [
          // Budget Summary Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: GovdTheme.navyMedium,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildBudgetItem('मंजूर एकूण निधी', '₹${(totalBudget / 100000).toStringAsFixed(1)} लाख', Colors.white),
                _buildBudgetItem('खर्च झालेला निधी', '₹${(totalExp / 100000).toStringAsFixed(1)} लाख', GovdTheme.emeraldLight),
                _buildBudgetItem('सक्रिय कामे', '${projects.length}', GovdTheme.saffronPrimary),
              ],
            ),
          ),

          // Filter Chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('all', 'सर्व कामे (${projects.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('in_progress', '🟡 प्रगतीपथावर (In Progress)'),
                  const SizedBox(width: 8),
                  _buildFilterChip('completed', '🟢 पूर्ण झाले (Completed)'),
                  const SizedBox(width: 8),
                  _buildFilterChip('sanctioned', '🔵 मंजूर (Sanctioned)'),
                ],
              ),
            ),
          ),

          // Projects List
          Expanded(
            child: filteredProjects.isEmpty
                ? Center(
                    child: Text(
                      'या वर्गवारीत कोणतीही विकास कामे नाहीत.',
                      style: TextStyle(color: isDark ? Colors.white60 : const Color(0xFF64748B)),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredProjects.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (ctx, i) {
                      final p = filteredProjects[i];
                      return _buildProjectCard(p, isDark);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildBudgetItem(String label, String value, Color color) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(label, style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.7))),
          ),
          const SizedBox(height: 2),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: color)),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _selectedFilter == key;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
      selected: isSelected,
      onSelected: (_) => setState(() => _selectedFilter = key),
      selectedColor: GovdTheme.navyDark,
      labelStyle: TextStyle(color: isSelected ? Colors.white : const Color(0xFF475569)),
      backgroundColor: const Color(0xFFF1F5F9),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      showCheckmark: false,
    );
  }

  // Section 11 Specification Card Format
  Widget _buildProjectCard(ProjectModel p, bool isDark) {
    final isCompleted = p.status == 'completed';
    final progress = p.completionPercentage;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title & Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  p.titleMr.isNotEmpty ? p.titleMr : (p.titleEn.isNotEmpty ? p.titleEn : 'Road Repair – Ward 2'),
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isCompleted ? GovdTheme.emeraldLight : const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isCompleted ? '🟢 Completed' : '🟡 In Progress',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: isCompleted ? GovdTheme.emeraldDark : const Color(0xFFB45309),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Budget & Spent Grid
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Budget (मंजूर अंदाजपत्रक)', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                      const SizedBox(height: 2),
                      Text(
                        '₹${p.budget.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ),
                Container(width: 1, height: 28, color: const Color(0xFFCBD5E1)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Spent (झालेला खर्च)', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                      const SizedBox(height: 2),
                      Text(
                        '₹${p.expenditure.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: GovdTheme.emeraldDark),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Progress Bar & Percentage
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Progress: $progress%',
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
              ),
              Text(
                '${(100 - progress)}% उर्वरित',
                style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progress / 100.0,
              minHeight: 8,
              backgroundColor: const Color(0xFFE2E8F0),
              valueColor: AlwaysStoppedAnimation<Color>(
                isCompleted ? GovdTheme.emerald : GovdTheme.saffronPrimary,
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Contractor Info
          Row(
            children: [
              const Icon(Icons.business_rounded, size: 14, color: Color(0xFF64748B)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Contractor: ${p.contractorName ?? "ABC Construction"}',
                  style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // [View Project] Button (Touch friendly target >= 44px)
          SizedBox(
            width: double.infinity,
            height: 44,
            child: OutlinedButton.icon(
              onPressed: () => _openProjectDetailsSheet(context, p, isDark),
              style: OutlinedButton.styleFrom(
                foregroundColor: GovdTheme.navyDark,
                side: const BorderSide(color: GovdTheme.navyDark, width: 1.2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: const Icon(Icons.visibility_outlined, size: 16),
              label: const Text('View Project (प्रकल्प सविस्तर पहा)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  // Section 11 Specification: Work order, Budget, Expenses, Photos, Progress, Documents, Timeline
  void _openProjectDetailsSheet(BuildContext context, ProjectModel p, bool isDark) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (_, scrollController) => Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Drag handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 8),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2)),
                ),
              ),

              // Title Row
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            p.titleMr.isNotEmpty ? p.titleMr : p.titleEn,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                          ),
                          Text(
                            'प्रकल्प क्र: PRJ-${p.id.substring(0, p.id.length > 8 ? 8 : p.id.length)}',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
              ),

              const Divider(height: 1),

              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  children: [
                    // 1. WORK ORDER (कार्यादेश तपशील)
                    _buildSectionHeader('१. Work Order (कार्यादेश तपशील)'),
                    _buildInfoTile('कार्यादेश क्र.', 'WO/2026/GHUL/084', Icons.receipt_long_rounded),
                    _buildInfoTile('योजना नाव', '१५ वा वित्त आयोग (15th FC Tied Grant)', Icons.account_balance_rounded),
                    _buildInfoTile('कंत्राटदार संस्था', p.contractorName ?? 'ABC Construction, Sangamner', Icons.business_rounded),

                    const SizedBox(height: 16),

                    // 2. BUDGET & EXPENSES
                    _buildSectionHeader('२. Budget & Expenses (अंदाजपत्रक व खर्च)'),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        children: [
                          _buildExpenseRow('प्रशासकीय मान्यता अंदाजपत्रक', '₹${p.budget.toStringAsFixed(0)}', Colors.black87),
                          const Divider(height: 12),
                          _buildExpenseRow('झालेला प्रत्यक्ष खर्च (MB Record)', '₹${p.expenditure.toStringAsFixed(0)}', GovdTheme.emeraldDark),
                          const Divider(height: 12),
                          _buildExpenseRow('उर्वरित शिल्लक निधी', '₹${(p.budget - p.expenditure).toStringAsFixed(0)}', GovdTheme.saffronDark),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 3. PROGRESS TRACKER
                    _buildSectionHeader('३. Progress (भौतिक प्रगती)'),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('प्रगती टक्केवारी', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              Text('${p.completionPercentage}% पूर्ण', style: const TextStyle(fontWeight: FontWeight.w900, color: GovdTheme.navyDark)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: LinearProgressIndicator(
                              value: p.completionPercentage / 100.0,
                              minHeight: 10,
                              backgroundColor: const Color(0xFFE2E8F0),
                              valueColor: const AlwaysStoppedAnimation<Color>(GovdTheme.saffronPrimary),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 4. PHOTOS (Geotagged Site Photos)
                    _buildSectionHeader('४. Geotagged Site Photos (कामाचे प्रत्यक्ष फोटो)'),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildPhotoThumbnail('सुरुवातीची स्थिती', 'Ward 2 Road Start', Icons.landscape_rounded),
                          const SizedBox(width: 10),
                          _buildPhotoThumbnail('चालू काम (WBM)', 'WBM Grading Stage', Icons.construction_rounded),
                          const SizedBox(width: 10),
                          _buildPhotoThumbnail('कॉंक्रिटीकरण प्रगती', 'PQC Layer Concrete', Icons.photo_camera_rounded),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 5. DOCUMENTS
                    _buildSectionHeader('५. Documents & Approvals (कागदपत्रे व मान्यता)'),
                    _buildDocTile('प्रशासकीय मान्यता आदेश (PDF)', '१.४ MB • मंजूर'),
                    _buildDocTile('तांत्रिक मान्यता मंजुरी पत्र (PDF)', '८५० KB • सक्षम प्राधिकारी'),
                    _buildDocTile('कंत्राटदार करारनामा प्रत (PDF)', '२.१ MB • स्वाक्षरीकृत'),

                    const SizedBox(height: 16),

                    // 6. TIMELINE
                    _buildSectionHeader('६. Timeline (काम पूर्णता कालावधी)'),
                    _buildTimelineTile('काम सुरू तारीख', p.startDate, true),
                    _buildTimelineTile('पहिली तपासणी (MB Note)', '15 Feb 2026', true),
                    _buildTimelineTile('अपेक्षित पूर्णता तारीख', p.expectedEndDate, false),

                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
      ),
    );
  }

  Widget _buildInfoTile(String label, String value, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Icon(icon, size: 16, color: GovdTheme.navyDark),
          ),
          const SizedBox(width: 10),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 110),
            child: Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpenseRow(String label, String amount, Color amountColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(label, style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569))),
        ),
        const SizedBox(width: 8),
        Text(amount, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: amountColor)),
      ],
    );
  }

  Widget _buildPhotoThumbnail(String caption, String sub, IconData icon) {
    return Container(
      width: 120,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFCBD5E1)),
      ),
      child: Column(
        children: [
          Container(
            height: 60,
            width: double.infinity,
            decoration: BoxDecoration(
              color: GovdTheme.navyDark.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 28, color: GovdTheme.navyDark),
          ),
          const SizedBox(height: 6),
          Text(caption, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold), maxLines: 1),
          Text(sub, style: const TextStyle(fontSize: 8.5, color: Color(0xFF64748B)), maxLines: 1),
        ],
      ),
    );
  }

  Widget _buildDocTile(String name, String size) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          const Icon(Icons.picture_as_pdf_rounded, size: 20, color: Colors.red),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                Text(size, style: const TextStyle(fontSize: 9.5, color: Color(0xFF64748B))),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.download_rounded, size: 18, color: GovdTheme.primaryBlue),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('कागदपत्र डाउनलोड सुरू झाले...')));
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineTile(String label, String date, bool isDone) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(isDone ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded, size: 16, color: isDone ? GovdTheme.emeraldDark : const Color(0xFF94A3B8)),
          const SizedBox(width: 10),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 11.5))),
          const SizedBox(width: 8),
          Text(date, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  void _showAddProjectDialog(BuildContext context, AppProvider app) {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    final budgetController = TextEditingController();
    final contractorController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('नवीन विकास काम नोंदवा', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(labelText: 'कामाचे नाव (उदा. Road Repair – Ward 2)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: descController,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'तपशील व अंदाज', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: budgetController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'मंजूर अंदाजपत्रक (₹)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: contractorController,
                decoration: const InputDecoration(labelText: 'कंत्राटदार नाव (उदा. ABC Construction)', border: OutlineInputBorder()),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.navyDark, foregroundColor: Colors.white),
            onPressed: () async {
              if (titleController.text.trim().isEmpty) return;
              final budget = double.tryParse(budgetController.text.trim()) ?? 250000;
              Navigator.pop(ctx);
              await app.addProject(
                titleMr: titleController.text.trim(),
                descriptionMr: descController.text.trim(),
                category: 'पायाभूत सुविधा',
                budget: budget,
                contractorName: contractorController.text.trim().isNotEmpty ? contractorController.text.trim() : 'ABC Construction',
                startDate: DateTime.now().toIso8601String().substring(0, 10),
                expectedEndDate: '2026-12-31',
              );
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('नवीन विकास काम जोडले गेले!'), backgroundColor: GovdTheme.emeraldDark),
                );
              }
            },
            child: const Text('जतन करा'),
          ),
        ],
      ),
    );
  }
}
