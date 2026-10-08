import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';

class LodgeGrievanceScreen extends StatefulWidget {
  final String? initialCategory;
  const LodgeGrievanceScreen({super.key, this.initialCategory});

  @override
  State<LodgeGrievanceScreen> createState() => _LodgeGrievanceScreenState();
}

class _LodgeGrievanceScreenState extends State<LodgeGrievanceScreen> {
  int _currentStep = 0; // 0: Category, 1: Details, 2: Location, 3: Photo/Media, 4: Review & Submit

  late String _selectedCategory;
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _locationController = TextEditingController();
  String _selectedWard = 'Ward 1 (गणपती चौक व मुख्य रस्ता)';
  bool _hasPhoto = false;
  bool _isSubmitting = false;

  final List<Map<String, dynamic>> _categories = [
    {
      'id': 'water',
      'nameMr': 'पाणी पुरवठा',
      'nameEn': 'Water Supply',
      'icon': Icons.water_drop_rounded,
      'color': Color(0xFF0284C7),
    },
    {
      'id': 'streetlight',
      'nameMr': 'दिवाबत्ती व वीज',
      'nameEn': 'Streetlights & Power',
      'icon': Icons.lightbulb_rounded,
      'color': Color(0xFFF59E0B),
    },
    {
      'id': 'sanitation',
      'nameMr': 'कचरा व स्वच्छता',
      'nameEn': 'Garbage & Sanitation',
      'icon': Icons.delete_outline_rounded,
      'color': Color(0xFF10B981),
    },
    {
      'id': 'roads',
      'nameMr': 'रस्ते व सांडपाणी गटार',
      'nameEn': 'Roads & Drains',
      'icon': Icons.alt_route_rounded,
      'color': Color(0xFFEA580C),
    },
    {
      'id': 'encroachment',
      'nameMr': 'अतिक्रमण तक्रार',
      'nameEn': 'Encroachments',
      'icon': Icons.fence_rounded,
      'color': Color(0xFFDC2626),
    },
    {
      'id': 'health',
      'nameMr': 'आरोग्य व औषध फवारणी',
      'nameEn': 'Health & Fogging',
      'icon': Icons.sanitizer_rounded,
      'color': Color(0xFF7C3AED),
    },
    {
      'id': 'other',
      'nameMr': 'इतर तक्रार',
      'nameEn': 'Other Complaint',
      'icon': Icons.more_horiz_rounded,
      'color': Color(0xFF64748B),
    },
  ];

  @override
  void initState() {
    super.initState();
    _selectedCategory = _categories.first['nameMr'];
    if (widget.initialCategory != null) {
      final found = _categories.firstWhere(
        (c) => c['id'] == widget.initialCategory,
        orElse: () => _categories.first,
      );
      _selectedCategory = found['nameMr'];
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep == 1) {
      if (_titleController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('कृपया तक्रारीचे शीर्षक प्रविष्ट करा.')),
        );
        return;
      }
      if (_descController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('कृपया तक्रारीचा सविस्तर तपशील लिहा.')),
        );
        return;
      }
    }
    if (_currentStep < 4) {
      setState(() => _currentStep++);
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  void _handleSubmit() async {
    setState(() => _isSubmitting = true);

    final app = context.read<AppProvider>();
    final title = _titleController.text.trim();
    final desc = _descController.text.trim();
    final location = _locationController.text.trim().isNotEmpty
        ? _locationController.text.trim()
        : 'गणपती चौक परिसर';

    final success = await app.lodgeGrievance(
      title: title,
      description: desc,
      category: _selectedCategory,
      wardNo: '$_selectedWard ($location)',
    );

    setState(() => _isSubmitting = false);

    if (success && mounted) {
      _showGrievanceSuccessDialog(app);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('तक्रार नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.')),
      );
    }
  }

  void _showGrievanceSuccessDialog(AppProvider app) {
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';
    final complaintId = 'GRV-2026-${(DateTime.now().millisecondsSinceEpoch % 900000 + 100000)}';

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF131C2E) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        contentPadding: const EdgeInsets.all(24),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: AppTheme.successGreen.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, color: AppTheme.successGreen, size: 36),
            ),
            const SizedBox(height: 14),
            Text(
              isMr ? 'तक्रार यशस्वीरीत्या नोंदवली!' : 'Complaint Registered Successfully!',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              isMr
                  ? 'आपली तक्रार संबंधित ग्रामपंचायत विभागाकडे निवारणासाठी पाठवण्यात आली आहे.'
                  : 'Your complaint has been forwarded to the designated department.',
              style: TextStyle(
                fontSize: 12,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Text(
                    isMr ? 'तक्रार नोंदणी क्रमांक (Complaint ID)' : 'Complaint ID',
                    style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    complaintId,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.primaryOrange,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryOrange,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: Text(
                  isMr ? 'तक्रारी यादीकडे जा' : 'Go to Grievances List',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';

    final bgColor = isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9);
    final cardBg = isDark ? const Color(0xFF172235) : Colors.white;
    final cardBorder = isDark ? const Color(0xFF1E2D4A) : const Color(0xFFE2E8F0);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: CustomGovAppBar(
        title: isMr ? 'तक्रार नोंदणी कक्ष' : 'Lodge Grievance',
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Step Progress Indicator
            _buildStepProgressBar(isDark, isMr),
            const SizedBox(height: 16),

            // Step Content
            if (_currentStep == 0) _buildStep1Category(cardBg, cardBorder, isDark, isMr),
            if (_currentStep == 1) _buildStep2Details(cardBg, cardBorder, isDark, isMr),
            if (_currentStep == 2) _buildStep3Location(cardBg, cardBorder, isDark, isMr),
            if (_currentStep == 3) _buildStep4Media(cardBg, cardBorder, isDark, isMr),
            if (_currentStep == 4) _buildStep5Review(cardBg, cardBorder, isDark, isMr),

            const SizedBox(height: 20),

            // Navigation Buttons (Back / Next / Submit)
            Row(
              children: [
                if (_currentStep > 0) ...[
                  Expanded(
                    flex: 1,
                    child: OutlinedButton(
                      onPressed: _isSubmitting ? null : _prevStep,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        side: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                      ),
                      child: Text(
                        isMr ? 'मागे' : 'Back',
                        style: TextStyle(color: isDark ? Colors.white70 : const Color(0xFF0F172A), fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                ],
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : (_currentStep == 4 ? _handleSubmit : _nextStep),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryOrange,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text(
                            _currentStep == 4
                                ? (isMr ? 'तक्रार दाखल करा (Submit)' : 'Submit Complaint')
                                : (isMr ? 'पुढे जा (Next)' : 'Next Step'),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                          ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildStepProgressBar(bool isDark, bool isMr) {
    final steps = isMr
        ? ['प्रवर्ग', 'तपशील', 'स्थान', 'फोटो', 'पडताळणी']
        : ['Category', 'Details', 'Location', 'Photo', 'Review'];

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF131C2E) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? const Color(0xFF1E2D4A) : const Color(0xFFE2E8F0)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(5, (index) {
          final isCompleted = _currentStep > index;
          final isCurrent = _currentStep == index;

          return Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Container(
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          color: isCompleted
                              ? AppTheme.successGreen
                              : (isCurrent ? AppTheme.primaryOrange : (isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0))),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: isCompleted
                              ? const Icon(Icons.check, size: 14, color: Colors.white)
                              : Text(
                                  '${index + 1}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: (isCurrent || isCompleted)
                                        ? Colors.white
                                        : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        steps[index],
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
                          color: isCurrent
                              ? AppTheme.primaryOrange
                              : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                if (index < 4)
                  Container(
                    width: 8,
                    height: 2,
                    margin: const EdgeInsets.only(bottom: 14),
                    color: _currentStep > index
                        ? AppTheme.successGreen
                        : (isDark ? const Color(0xFF1E293B) : const Color(0xFFCBD5E1)),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStep1Category(Color cardBg, Color cardBorder, bool isDark, bool isMr) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isMr ? '१. तक्रारीचा प्रवर्ग निवडा' : '1. Select Grievance Category',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            isMr ? 'आपल्या समस्येशी संबंधित विभाग निवडा' : 'Choose the department responsible for your issue',
            style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
          ),
          const SizedBox(height: 14),
          ..._categories.map((cat) {
            final isSelected = _selectedCategory == cat['nameMr'];
            final color = cat['color'] as Color;
            final icon = cat['icon'] as IconData;

            return InkWell(
              onTap: () => setState(() => _selectedCategory = cat['nameMr']),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected
                      ? color.withOpacity(isDark ? 0.2 : 0.1)
                      : (isDark ? const Color(0xFF111827) : const Color(0xFFF8FAFC)),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? color : (isDark ? const Color(0xFF1E2D4A) : const Color(0xFFE2E8F0)),
                    width: isSelected ? 1.8 : 1.0,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(icon, color: color, size: 18),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            cat['nameMr'] as String,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                              color: isDark ? Colors.white : const Color(0xFF0F172A),
                            ),
                          ),
                          Text(
                            cat['nameEn'] as String,
                            style: TextStyle(fontSize: 10, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                    if (isSelected)
                      Icon(Icons.check_circle_rounded, color: color, size: 20),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildStep2Details(Color cardBg, Color cardBorder, bool isDark, bool isMr) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isMr ? '२. तक्रारीचा तपशील' : '2. Complaint Details',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 14),

          // Title
          Text(
            isMr ? 'तक्रारीचा विषय / शीर्षक *' : 'Complaint Title *',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155)),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _titleController,
            style: TextStyle(fontSize: 13, color: isDark ? Colors.white : const Color(0xFF0F172A)),
            decoration: InputDecoration(
              hintText: isMr ? 'उदा. मुख्य रस्त्यावरील पथदिवा बंद आहे' : 'e.g. Streetlight near Main Road not working',
            ),
          ),
          const SizedBox(height: 14),

          // Description
          Text(
            isMr ? 'सविस्तर वर्णन *' : 'Detailed Description *',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155)),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _descController,
            maxLines: 4,
            style: TextStyle(fontSize: 13, color: isDark ? Colors.white : const Color(0xFF0F172A)),
            decoration: InputDecoration(
              hintText: isMr ? 'समस्येचे सविस्तर वर्णन लिहा...' : 'Describe the exact issue and impact...',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep3Location(Color cardBg, Color cardBorder, bool isDark, bool isMr) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isMr ? '३. घटनास्थळ व प्रभाग' : '3. Location & Ward',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 14),

          // Ward Dropdown
          Text(
            isMr ? 'प्रभाग / वॉर्ड क्रमांक *' : 'Ward Number *',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155)),
          ),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _selectedWard,
            items: [
              'Ward 1 (गणपती चौक व मुख्य रस्ता)',
              'Ward 2 (शाळा परिसर व मारुती मंदिर)',
              'Ward 3 (बाजारपेठ व बसस्थानक)',
              'Ward 4 (गावठाण व जुनी वस्ती)',
              'Ward 5 (नवीन वसाहत व मळा परिसर)',
              'Ward 6 (औद्योगिक परिसर व रिंग रोड)',
            ].map((w) => DropdownMenuItem(value: w, child: Text(w, style: const TextStyle(fontSize: 12.5)))).toList(),
            onChanged: (v) {
              if (v != null) setState(() => _selectedWard = v);
            },
            decoration: const InputDecoration(),
          ),
          const SizedBox(height: 14),

          // Exact Landmark
          Text(
            isMr ? 'जवळची खूण / परिसर (Landmark)' : 'Exact Landmark / Street',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155)),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _locationController,
            style: TextStyle(fontSize: 13, color: isDark ? Colors.white : const Color(0xFF0F172A)),
            decoration: InputDecoration(
              hintText: isMr ? 'उदा. जिल्हा परिषद शाळेजवळ, पोल क्र. १२' : 'e.g. Near Primary School, Pole #12',
              prefixIcon: const Icon(Icons.pin_drop_rounded, color: AppTheme.primaryOrange, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep4Media(Color cardBg, Color cardBorder, bool isDark, bool isMr) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isMr ? '४. समस्येचा फोटो / व्हिडिओ (ऐच्छिक)' : '4. Optional Photo / Video Evidence',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 14),

          InkWell(
            onTap: () {
              setState(() => _hasPhoto = !_hasPhoto);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(_hasPhoto ? 'फोटो जोडला गेला!' : 'फोटो काढला गेला.'),
                  duration: const Duration(seconds: 1),
                ),
              );
            },
            borderRadius: BorderRadius.circular(14),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF111827) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: _hasPhoto ? AppTheme.successGreen : (isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                  width: _hasPhoto ? 1.5 : 1.0,
                ),
              ),
              child: Column(
                children: [
                  Icon(
                    _hasPhoto ? Icons.check_circle_rounded : Icons.camera_alt_outlined,
                    size: 40,
                    color: _hasPhoto ? AppTheme.successGreen : AppTheme.primaryOrange,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _hasPhoto
                        ? (isMr ? '✅ फोटो जोडला आहे (Tap to Remove)' : '✅ Photo Attached (Tap to remove)')
                        : (isMr ? 'कॅमेऱ्याने फोटो काढा किंवा गॅलरीतून निवडा' : 'Tap to capture photo or upload'),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: _hasPhoto ? AppTheme.successGreen : (isDark ? Colors.white : const Color(0xFF0F172A)),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isMr ? 'फोटो जोडल्यास तक्रारीचे जलद निवारण होण्यास मदत होते.' : 'Adding a photo helps faster field inspection.',
                    style: TextStyle(fontSize: 10.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep5Review(Color cardBg, Color cardBorder, bool isDark, bool isMr) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isMr ? '५. तक्रार पडताळणी व सादर करा' : '5. Review & Submit Grievance',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 14),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF111827) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                _buildSummaryRow(isMr ? 'प्रवर्ग:' : 'Category:', _selectedCategory, isDark),
                Divider(height: 12, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                _buildSummaryRow(isMr ? 'शीर्षक:' : 'Title:', _titleController.text.trim(), isDark),
                Divider(height: 12, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                _buildSummaryRow(isMr ? 'प्रभाग व स्थान:' : 'Location:', '$_selectedWard (${_locationController.text.trim().isEmpty ? "गावात" : _locationController.text.trim()})', isDark),
                Divider(height: 12, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                _buildSummaryRow(isMr ? 'फोटो पुरावा:' : 'Attachment:', _hasPhoto ? 'होय (Attached)' : 'नाही (None)', isDark),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            isMr
                ? 'तक्रार दाखल केल्यानंतर आपल्याला SMS व ॲप नोटिफिकेशनद्वारे अपडेट्स मिळतील.'
                : 'You will receive progress notifications as the Gram Sevak resolves your issue.',
            style: TextStyle(fontSize: 10.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 90,
          child: Text(
            label,
            style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B), fontWeight: FontWeight.bold),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: isDark ? Colors.white : const Color(0xFF0F172A)),
          ),
        ),
      ],
    );
  }
}
