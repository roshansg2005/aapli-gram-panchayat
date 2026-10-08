import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../widgets/govd_theme.dart';
import '../widgets/govd_offline_banner.dart';

class GovdFieldWorkScreen extends StatefulWidget {
  const GovdFieldWorkScreen({super.key});

  @override
  State<GovdFieldWorkScreen> createState() => _GovdFieldWorkScreenState();
}

class _GovdFieldWorkScreenState extends State<GovdFieldWorkScreen> {
  String _selectedCategory = 'all'; // 'all', 'visits', 'inspections', 'complaints'

  final List<Map<String, dynamic>> _fieldTasks = [
    {
      'id': 'FT-101',
      'title': 'गणपती चौक रस्ता काँक्रिटीकरण पाहणी',
      'category': 'inspections',
      'location': 'वॉर्ड क्र. २ (गणपती मंदिर ते मुख्य चौक)',
      'target': 'प्रकल्प: मुख्य रस्ता कॉंक्रिटीकरण',
      'dueDate': 'आज • दुपारी १२:००',
      'status': 'pending',
      'officer': 'श्री. सुरेश पाटील (ग्रामसेवक)',
      'notes': 'पायाभरणी कामाची गुणवत्ता तपासणी करणे.',
    },
    {
      'id': 'FT-102',
      'title': 'पाणीपुरवठा गळती तक्रार स्थळ पाहणी',
      'category': 'complaints',
      'location': 'वॉर्ड क्र. १ (घर क्र. ४५ जवळ)',
      'target': 'तक्रारदार: ज्ञानेश्वर मोरे',
      'dueDate': 'आज • दुपारी ०२:३०',
      'status': 'in_progress',
      'officer': 'ग्रामपंचायत प्लंबर सेवक',
      'notes': 'मुख्य पाईपलाईन गळती दुरुस्ती कार्य तपासणी.',
    },
    {
      'id': 'FT-103',
      'title': 'रमाई घरकुल लाभार्थी स्थळ भेट व जिओ-टॅगिंग',
      'category': 'visits',
      'location': 'वॉर्ड क्र. ३ (आंबेडकर नगर)',
      'target': 'लाभार्थी: शांताराम कदम',
      'dueDate': 'उद्या • सकाळी १०:३०',
      'status': 'pending',
      'officer': 'श्री. राहुल कदम (सरपंच)',
      'notes': 'पाया बांधकामाचा फोटो अपलोड व हप्ता शिफारस.',
    },
    {
      'id': 'FT-104',
      'title': 'प्राथमिक आरोग्य केंद्र स्वच्छता पाहणी',
      'category': 'inspections',
      'location': 'गावठाण परिसर',
      'target': 'आरोग्य उपकेंद्र घुलेवाडी',
      'dueDate': 'काल',
      'status': 'completed',
      'officer': 'सरपंच व आरोग्य समिती',
      'notes': 'स्वच्छता समाधानकारक आढळली.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;

    final filtered = _fieldTasks.where((t) {
      if (_selectedCategory != 'all' && t['category'] != _selectedCategory) {
        return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '🦺 फील्ड वर्क व स्थळ पाहणी मोड',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              'दौरे, तपासणी व थेट स्थळ शेरा (Offline Capable)',
              style: TextStyle(fontSize: 10.5, color: Colors.white70),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_task_rounded, color: GovdTheme.goldLight),
            tooltip: 'नवीन पाहणी जोडा',
            onPressed: () => _showAddTaskDialog(context),
          ),
        ],
      ),
      body: Column(
        children: [
          const GovdOfflineBanner(),

          // Category Chips
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('सर्व कामे (${_fieldTasks.length})', 'all'),
                  const SizedBox(width: 6),
                  _buildFilterChip('प्रकल्प पाहणी', 'inspections'),
                  const SizedBox(width: 6),
                  _buildFilterChip('तक्रार निवारण भेट', 'complaints'),
                  const SizedBox(width: 6),
                  _buildFilterChip('घरकुल/दौरे', 'visits'),
                ],
              ),
            ),
          ),

          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final task = filtered[i];
                return _buildTaskCard(task, isDark, app);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedCategory == value;
    return InkWell(
      onTap: () => setState(() => _selectedCategory = value),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? GovdTheme.navyDark : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? GovdTheme.navyDark : const Color(0xFFCBD5E1)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : const Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Widget _buildTaskCard(Map<String, dynamic> task, bool isDark, AppProvider app) {
    final isCompleted = task['status'] == 'completed';
    final isInProgress = task['status'] == 'in_progress';

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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isCompleted
                      ? GovdTheme.emeraldLight
                      : isInProgress
                          ? GovdTheme.goldLight
                          : const Color(0xFFEEF2FF),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isCompleted ? '✓ पूर्ण झाले' : isInProgress ? '⏳ पाहणी सुरू' : '📋 नियोजित भेट',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: isCompleted ? GovdTheme.emeraldDark : isInProgress ? GovdTheme.goldDark : const Color(0xFF3730A3),
                  ),
                ),
              ),
              Text(
                task['dueDate'],
                style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            task['title'],
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 14, color: GovdTheme.saffronPrimary),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  task['location'],
                  style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'संदर्भ: ${task['target']}',
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
          ),
          if (task['notes'] != null) ...[
            const SizedBox(height: 6),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'पाहणी शेरा: ${task["notes"]}',
                style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155)),
              ),
            ),
          ],
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Photo Upload Action
              TextButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('📸 स्थळ फोटो सुरक्षित ऑफलाइन साठवला गेला!'), backgroundColor: GovdTheme.emeraldDark),
                  );
                },
                icon: const Icon(Icons.camera_alt_outlined, size: 16, color: GovdTheme.primaryBlue),
                label: const Text('फोटो जोडा', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              ),
              // Status Toggle Action
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    if (task['status'] == 'pending') {
                      task['status'] = 'in_progress';
                    } else {
                      task['status'] = 'completed';
                    }
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('पाहणी स्थिती अद्ययावत झाली: ${task["status"]}'), backgroundColor: GovdTheme.emeraldDark),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: isCompleted ? const Color(0xFF64748B) : GovdTheme.emeraldDark,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                ),
                icon: Icon(isCompleted ? Icons.check : Icons.play_arrow_rounded, size: 16),
                label: Text(
                  isCompleted ? 'पूर्ण' : isInProgress ? 'पूर्ण करा' : 'सुरू करा',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAddTaskDialog(BuildContext context) {
    final titleController = TextEditingController();
    final locationController = TextEditingController();
    final targetController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('नवीन स्थळ पाहणी जोडा', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: titleController, decoration: const InputDecoration(labelText: 'पाहणीचे नाव/विषय', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: locationController, decoration: const InputDecoration(labelText: 'स्थळ/वॉर्ड', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: targetController, decoration: const InputDecoration(labelText: 'संबंधित काम किंवा तक्रारदार', border: OutlineInputBorder())),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.navyDark, foregroundColor: Colors.white),
            onPressed: () {
              if (titleController.text.trim().isEmpty) return;
              setState(() {
                _fieldTasks.insert(0, {
                  'id': 'FT-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
                  'title': titleController.text.trim(),
                  'category': 'visits',
                  'location': locationController.text.trim().isNotEmpty ? locationController.text.trim() : 'गावात',
                  'target': targetController.text.trim().isNotEmpty ? targetController.text.trim() : 'ग्रामपंचायत',
                  'dueDate': 'आज',
                  'status': 'pending',
                  'officer': 'अधिकारी',
                  'notes': 'नवीन फील्ड टास्क नोंदवली.',
                });
              });
              Navigator.pop(ctx);
            },
            child: const Text('जोडा'),
          ),
        ],
      ),
    );
  }
}
