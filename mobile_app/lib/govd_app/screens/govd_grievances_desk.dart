import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../models/grievance_model.dart';
import '../widgets/govd_theme.dart';

class GovdGrievancesDesk extends StatefulWidget {
  const GovdGrievancesDesk({super.key});

  @override
  State<GovdGrievancesDesk> createState() => _GovdGrievancesDeskState();
}

class _GovdGrievancesDeskState extends State<GovdGrievancesDesk> {
  String _selectedStatus = 'all'; // 'all', 'pending', 'in_progress', 'resolved'
  String _selectedWard = 'all';
  String _searchQuery = '';

  IconData _getCategoryIcon(String category) {
    final cat = category.toLowerCase();
    if (cat.contains('दिवा') || cat.contains('light') || cat.contains('वीज')) {
      return Icons.lightbulb_rounded;
    } else if (cat.contains('पाणी') || cat.contains('water')) {
      return Icons.water_drop_rounded;
    } else if (cat.contains('रस्ते') || cat.contains('road')) {
      return Icons.alt_route_rounded;
    } else if (cat.contains('स्वच्छता') || cat.contains('sanitation') || cat.contains('कचरा')) {
      return Icons.cleaning_services_rounded;
    } else if (cat.contains('आरोग्य') || cat.contains('health')) {
      return Icons.local_hospital_rounded;
    }
    return Icons.report_problem_rounded;
  }

  void _openGrievanceDetails(BuildContext context, GrievanceModel g, AppProvider app, bool isMr) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDetailState) {
          final isResolved = g.status == 'resolved';
          final isInProgress = g.status == 'in_progress';
          final isPending = g.status == 'pending' || g.status == 'open';

          return Container(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.9,
            ),
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 16,
              bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Header with ID & Category
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: GovdTheme.navyDark.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(_getCategoryIcon(g.category), color: GovdTheme.navyDark, size: 20),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                g.id.toUpperCase(),
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                              ),
                              Text(
                                g.category,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.slateMedium),
                              ),
                            ],
                          ),
                        ],
                      ),
                      _buildStatusPill(g.status, isMr),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 10),

                  // Title & Description
                  Text(
                    g.title,
                    style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    g.description,
                    style: const TextStyle(fontSize: 12.5, color: Color(0xFF334155), height: 1.4),
                  ),
                  const SizedBox(height: 14),

                  // Citizen & Location Info Box
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        _buildInfoRow(Icons.person_pin_rounded, isMr ? 'तक्रारदार:' : 'Citizen:', g.citizenName),
                        const SizedBox(height: 6),
                        _buildInfoRow(Icons.phone_android_rounded, isMr ? 'मोबाईल:' : 'Mobile:', g.citizenPhone),
                        const SizedBox(height: 6),
                        _buildInfoRow(Icons.location_on_rounded, isMr ? 'ठिकाण / वॉर्ड:' : 'Location:', '${g.wardNo} • ${g.gramPanchayat}'),
                        const SizedBox(height: 6),
                        _buildInfoRow(Icons.calendar_today_rounded, isMr ? 'दाखल दिनांक:' : 'Date:', g.submittedDate),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Officer Resolution Remarks if any
                  if (g.resolutionRemarks != null && g.resolutionRemarks!.isNotEmpty) ...[
                    Text(
                      isMr ? 'कार्यालयीन निवारण शेरा (Resolution Note):' : 'Resolution Note:',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: GovdTheme.emerald.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: GovdTheme.emerald.withOpacity(0.3)),
                      ),
                      child: Text(
                        g.resolutionRemarks!,
                        style: const TextStyle(fontSize: 12, color: GovdTheme.navyDark, fontStyle: FontStyle.italic),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Timeline (Section 7)
                  Text(
                    isMr ? 'तक्रार निवारण प्रगती टाइमलाइन' : 'Grievance Resolution Timeline',
                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
                  ),
                  const SizedBox(height: 10),
                  _buildTimelineItem(
                    step: 1,
                    title: isMr ? 'तक्रार दाखल झाली (Submitted)' : 'Submitted',
                    subtitle: g.submittedDate,
                    isDone: true,
                    isCurrent: isPending,
                  ),
                  _buildTimelineItem(
                    step: 2,
                    title: isMr ? 'कर्मचाऱ्याकडे सोपवली (Assigned)' : 'Assigned to Field Staff',
                    subtitle: isPending ? (isMr ? 'पडताळणी चालू' : 'Under Review') : (isMr ? 'ग्रामसेवक / वायरमन नेमले' : 'Staff Assigned'),
                    isDone: isInProgress || isResolved,
                    isCurrent: isInProgress,
                  ),
                  _buildTimelineItem(
                    step: 3,
                    title: isMr ? 'काम प्रगतीपथावर (In Progress)' : 'In Progress',
                    subtitle: isInProgress ? (isMr ? 'प्रत्यक्ष दुरुस्ती काम चालू' : 'Repair Work Active') : (isResolved ? (isMr ? 'पूर्ण झाले' : 'Completed') : (isMr ? 'प्रतीक्षेत' : 'Pending')),
                    isDone: isResolved,
                    isCurrent: isInProgress,
                  ),
                  _buildTimelineItem(
                    step: 4,
                    title: isMr ? 'निवारण झाले व बंद केली (Resolved)' : 'Resolved & Closed',
                    subtitle: isResolved ? (isMr ? 'तक्रार यशस्वीरित्या सोडवली' : 'Successfully Resolved') : (isMr ? 'शिल्लक' : 'Pending'),
                    isDone: isResolved,
                    isCurrent: isResolved,
                    isLast: true,
                  ),
                  const SizedBox(height: 20),

                  // Officer Action Buttons (Section 7)
                  Text(
                    isMr ? 'प्रशासकीय कृती पर्याय (Officer Actions):' : 'Officer Actions:',
                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
                  ),
                  const SizedBox(height: 10),

                  Row(
                    children: [
                      if (!isInProgress && !isResolved)
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              app.updateGrievanceStatus(g.id, 'in_progress', resolutionNotes: 'काम तातडीने वायरमनकडे सोपवले आहे.');
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(isMr ? 'तक्रार प्रगतीपथावर म्हणून नोंदवली गेली.' : 'Status updated to In Progress.'),
                                  backgroundColor: GovdTheme.goldDark,
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: GovdTheme.goldDark,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                            child: Text(isMr ? 'स्वीकारा (Accept)' : 'Accept', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      if (!isInProgress && !isResolved) const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _showResolveDialog(context, g, app, isMr, ctx),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: GovdTheme.emerald,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                          child: Text(isMr ? 'निवारण करा (Resolve) ✓' : 'Resolve ✓', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showResolveDialog(BuildContext context, GrievanceModel g, AppProvider app, bool isMr, BuildContext parentModalCtx) {
    final noteController = TextEditingController();

    showDialog(
      context: context,
      builder: (dCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Row(
          children: [
            const Icon(Icons.check_circle_outline_rounded, color: GovdTheme.emerald, size: 22),
            const SizedBox(width: 8),
            Text(isMr ? 'तक्रार निवारण शेरा' : 'Mark as Resolved', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isMr
                  ? 'कृपया तक्रार सोडवण्याबाबतचा प्रत्यक्ष कामाचा तपशीलवार शेरा लिहा:'
                  : 'Please enter resolution notes detailing the completed work:',
              style: const TextStyle(fontSize: 12, color: GovdTheme.slateMedium),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: noteController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: isMr ? 'उदा. नवीन पथदिवा बसवून प्रकाश पूर्ववत केला.' : 'e.g. Streetlight repaired and functioning.',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                contentPadding: const EdgeInsets.all(10),
              ),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.photo_camera_outlined, size: 16, color: GovdTheme.navyDark),
                  const SizedBox(width: 6),
                  Text(
                    isMr ? 'काम पूर्ण झाल्याचा फोटो जोडला (Optional)' : 'Photo evidence attached (Optional)',
                    style: const TextStyle(fontSize: 10.5, color: GovdTheme.navyDark),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dCtx),
            child: Text(isMr ? 'रद्द करा' : 'Cancel', style: const TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: GovdTheme.emerald,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              final note = noteController.text.trim().isNotEmpty
                  ? noteController.text.trim()
                  : (isMr ? 'तक्रारीचे यशस्वी निवारण करण्यात आले.' : 'Grievance resolved.');
              app.updateGrievanceStatus(g.id, 'resolved', resolutionNotes: note);
              Navigator.pop(dCtx);
              Navigator.pop(parentModalCtx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(isMr ? 'तक्रार निवारण यशस्वीरित्या पूर्ण झाले!' : 'Grievance resolved successfully!'),
                  backgroundColor: GovdTheme.emerald,
                ),
              );
            },
            child: Text(isMr ? 'निवारण निश्चित करा' : 'Mark Resolved'),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 14, color: GovdTheme.slateMedium),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 11, color: GovdTheme.slateMedium, fontWeight: FontWeight.w600)),
        const SizedBox(width: 6),
        Expanded(
          child: Text(value, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: GovdTheme.navyDark)),
        ),
      ],
    );
  }

  Widget _buildTimelineItem({
    required int step,
    required String title,
    required String subtitle,
    required bool isDone,
    required bool isCurrent,
    bool isLast = false,
  }) {
    final color = isDone ? GovdTheme.emerald : (isCurrent ? GovdTheme.goldDark : Colors.grey.shade400);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: isDone ? GovdTheme.emerald : (isCurrent ? GovdTheme.goldDark : Colors.white),
                shape: BoxShape.circle,
                border: Border.all(color: color, width: 2),
              ),
              child: Center(
                child: isDone
                    ? const Icon(Icons.check, size: 12, color: Colors.white)
                    : Text('$step', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isCurrent ? Colors.white : Colors.grey)),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 26,
                color: isDone ? GovdTheme.emerald : Colors.grey.shade300,
              ),
          ],
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isDone || isCurrent ? GovdTheme.navyDark : Colors.grey.shade600,
                ),
              ),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 10, color: GovdTheme.slateMedium),
              ),
              if (!isLast) const SizedBox(height: 10),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatusPill(String status, bool isMr) {
    Color bg;
    Color fg;
    String label;
    IconData icon;

    switch (status) {
      case 'resolved':
        bg = GovdTheme.emerald.withOpacity(0.12);
        fg = GovdTheme.emerald;
        label = isMr ? 'निवारण झाले' : 'Resolved';
        icon = Icons.check_circle_rounded;
        break;
      case 'in_progress':
        bg = GovdTheme.primaryBlue.withOpacity(0.12);
        fg = GovdTheme.primaryBlue;
        label = isMr ? 'प्रगतीपथावर' : 'In Progress';
        icon = Icons.engineering_rounded;
        break;
      default:
        bg = GovdTheme.rose.withOpacity(0.12);
        fg = GovdTheme.rose;
        label = isMr ? 'नवीन' : 'Pending';
        icon = Icons.error_outline_rounded;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: fg.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: fg, size: 12),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: fg)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final allGrievances = app.grievances;
    final isMr = app.language == 'mr';
    final user = app.currentUser;

    final filtered = allGrievances.where((g) {
      if (_selectedStatus == 'pending' && g.status == 'resolved') return false;
      if (_selectedStatus == 'in_progress' && g.status != 'in_progress') return false;
      if (_selectedStatus == 'resolved' && g.status != 'resolved') return false;
      if (_selectedWard != 'all' && g.wardNo != _selectedWard) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final title = g.title.toLowerCase();
        final cat = g.category.toLowerCase();
        final citizen = g.citizenName.toLowerCase();
        final phone = g.citizenPhone.toLowerCase();
        if (!title.contains(q) && !cat.contains(q) && !citizen.contains(q) && !phone.contains(q)) {
          return false;
        }
      }
      return true;
    }).toList();

    final pendingCount = allGrievances.where((g) => g.status == 'open' || g.status == 'pending').length;
    final progressCount = allGrievances.where((g) => g.status == 'in_progress').length;
    final resolvedCount = allGrievances.where((g) => g.status == 'resolved').length;

    return Scaffold(
      backgroundColor: GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isMr ? 'नागरिक तक्रार निवारण कक्ष' : 'Citizen Grievances Desk',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              '${user?.gramPanchayat ?? "ग्रामपंचायत घुलेवाडी"} • प्रभागवार तक्रारी',
              style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Filter Tabs Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
            color: GovdTheme.navyDark,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('all', isMr ? 'सर्व (${allGrievances.length})' : 'All (${allGrievances.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('pending', isMr ? '🔴 नवीन ($pendingCount)' : '🔴 Pending ($pendingCount)'),
                  const SizedBox(width: 8),
                  _buildFilterChip('in_progress', isMr ? '🔵 प्रगतीपथावर ($progressCount)' : '🔵 In Progress ($progressCount)'),
                  const SizedBox(width: 8),
                  _buildFilterChip('resolved', isMr ? '🟢 निवारण ($resolvedCount)' : '🟢 Resolved ($resolvedCount)'),
                ],
              ),
            ),
          ),

          // Search & Ward Filter
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    onChanged: (v) => setState(() => _searchQuery = v),
                    decoration: InputDecoration(
                      hintText: isMr ? 'तक्रारदार, विषय किंवा विभाग शोधा...' : 'Search complaints...',
                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                      prefixIcon: const Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedWard,
                      icon: const Icon(Icons.filter_list_rounded, size: 18, color: GovdTheme.navyDark),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
                      items: const [
                        DropdownMenuItem(value: 'all', child: Text('सर्व वॉर्ड')),
                        DropdownMenuItem(value: 'Ward 1', child: Text('Ward 1')),
                        DropdownMenuItem(value: 'Ward 2', child: Text('Ward 2')),
                        DropdownMenuItem(value: 'Ward 3', child: Text('Ward 3')),
                        DropdownMenuItem(value: 'Ward 4', child: Text('Ward 4')),
                      ],
                      onChanged: (val) => setState(() => _selectedWard = val ?? 'all'),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Grievance Cards List (Section 6)
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.thumb_up_alt_outlined, size: 48, color: Colors.grey.shade400),
                        const SizedBox(height: 8),
                        Text(
                          isMr ? 'कोणतीही प्रलंबित तक्रार उपलब्ध नाही' : 'No complaints found',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (ctx, i) {
                      final g = filtered[i];
                      return _buildSection6GrievanceCard(ctx, g, app, isMr);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _selectedStatus == value;
    return InkWell(
      onTap: () => setState(() => _selectedStatus = value),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? GovdTheme.saffron : Colors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  // Exact Section 6 Card layout (Anti-Collision & Responsive):
  // ┌───────────────────────────┐
  // │ 💡 STREET LIGHT           │
  // │ Ganpati Chowk light बंद   │
  // │                           │
  // │ Ward 1 • Ghulewadi        │
  // │ 8 Mar 2026                │
  // │                           │
  // │ 🔵 In Progress            │
  // │                           │
  // │ View Complaint →          │
  // └───────────────────────────┘
  Widget _buildSection6GrievanceCard(BuildContext context, GrievanceModel g, AppProvider app, bool isMr) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 💡 Category Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Icon(_getCategoryIcon(g.category), size: 16, color: GovdTheme.saffron),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        g.category.toUpperCase(),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: GovdTheme.navyDark, letterSpacing: 0.5),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                g.id.toUpperCase(),
                style: const TextStyle(fontSize: 10, color: GovdTheme.slateMedium, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Issue Title
          Text(
            g.title,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: GovdTheme.navyDark, height: 1.2),
          ),
          const SizedBox(height: 8),

          // Location & Date
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 14, color: GovdTheme.slateMedium),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  '${g.wardNo} • ${g.gramPanchayat}',
                  style: const TextStyle(fontSize: 11.5, color: GovdTheme.slateMedium),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.calendar_today_outlined, size: 13, color: GovdTheme.slateMedium),
              const SizedBox(width: 4),
              Text(
                g.submittedDate,
                style: const TextStyle(fontSize: 11.5, color: GovdTheme.slateMedium),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Status Pill + View Complaint Action
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildStatusPill(g.status, isMr),
              InkWell(
                onTap: () => _openGrievanceDetails(context, g, app, isMr),
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        isMr ? 'तक्रार पहा' : 'View Complaint',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: GovdTheme.navyDark),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.arrow_forward_rounded, size: 14, color: GovdTheme.navyDark),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
