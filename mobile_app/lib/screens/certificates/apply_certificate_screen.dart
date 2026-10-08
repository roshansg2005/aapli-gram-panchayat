import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';

class ApplyCertificateScreen extends StatefulWidget {
  const ApplyCertificateScreen({super.key});

  @override
  State<ApplyCertificateScreen> createState() => _ApplyCertificateScreenState();
}

class _ApplyCertificateScreenState extends State<ApplyCertificateScreen> {
  String _selectedType = 'रहिवासी दाखला (Residence Certificate)';
  final _purposeController = TextEditingController();
  final _notesController = TextEditingController();
  bool _isSubmitting = false;

  final Map<String, double> _certificateTypes = {
    'रहिवासी दाखला (Residence Certificate)': 20.0,
    'जन्म दाखला (Birth Certificate)': 25.0,
    'मृत्यू दाखला (Death Certificate)': 25.0,
    'विवाह नोंदणी दाखला (Marriage Certificate)': 50.0,
    'उत्पन्नाचा दाखला (Income Certificate)': 30.0,
    'दारिद्र्य रेषेखालील दाखला (BPL Certificate)': 20.0,
    'थकबाकी नसलेला दाखला (No Dues Certificate)': 20.0,
    'हयातीचा दाखला (Life Certificate)': 20.0,
    'शौचालय दाखला (Toilet Facility Certificate)': 20.0,
  };

  @override
  void dispose() {
    _purposeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    final purpose = _purposeController.text.trim();
    if (purpose.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('कृपया दाखल्याचा उद्देश प्रविष्ट करा.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final app = context.read<AppProvider>();
    final fee = _certificateTypes[_selectedType] ?? 20.0;
    final success = await app.applyCertificate(
      certificateType: _selectedType,
      purpose: purpose,
      fee: fee,
    );

    setState(() => _isSubmitting = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ दाखला अर्ज यशस्वीरीत्या सादर झाला! (शुल्क ₹${fee.toInt()})'),
          backgroundColor: AppTheme.successGreen,
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final user = app.currentUser;
    final fee = _certificateTypes[_selectedType] ?? 20.0;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9),
      appBar: CustomGovAppBar(
        title: app.tr('applyNewCertificate'),
        showBackButton: Navigator.canPop(context),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Applicant Info Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'अर्जदार माहिती (Applicant Details)',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: isDark ? Colors.white : AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.person_outline_rounded, size: 16, color: AppTheme.primaryOrange),
                      const SizedBox(width: 6),
                      Text(
                        user?.name ?? 'नागरिक',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.phone_outlined, size: 16, color: isDark ? const Color(0xFF94A3B8) : Colors.grey),
                      const SizedBox(width: 6),
                      Text(
                        user?.phone ?? '-',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        'घर क्र: ${user?.houseNo ?? "-"}',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Certificate Type Dropdown
            Text(
              app.tr('selectCertificateType'),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _selectedType,
              dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
              isExpanded: true,
              style: TextStyle(
                color: isDark ? Colors.white : const Color(0xFF0F172A),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.description_outlined, size: 18, color: AppTheme.primaryOrange),
              ),
              items: _certificateTypes.keys.map((type) {
                return DropdownMenuItem(
                  value: type,
                  child: Text(
                    type,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                );
              }).toList(),
              onChanged: (v) => setState(() => _selectedType = v!),
            ),
            const SizedBox(height: 14),

            // Purpose Field
            Text(
              app.tr('purposeOfCertificate'),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _purposeController,
              style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0F172A)),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.edit_note_rounded, size: 20, color: AppTheme.primaryOrange),
                hintText: app.language == 'mr' ? 'उदा. शासकीय शिष्यवृत्ती / नोकरी / बँक कामासाठी' : 'e.g. Scholarship / Employment / Bank',
              ),
            ),
            const SizedBox(height: 14),

            // Additional Notes
            Text(
              'अतिरिक्त शेरा / माहिती (पर्यायी)',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _notesController,
              maxLines: 2,
              style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0F172A)),
              decoration: const InputDecoration(
                hintText: 'आवश्यक असल्यास अधिक माहिती द्या...',
              ),
            ),
            const SizedBox(height: 18),

            // Fee & Payment Summary Box
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF78350F).withOpacity(0.4) : AppTheme.saffronLight,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? const Color(0xFFF59E0B).withOpacity(0.5) : AppTheme.primaryOrange.withOpacity(0.3),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        app.tr('applicationFee'),
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? const Color(0xFFCBD5E1) : AppTheme.textSecondary,
                        ),
                      ),
                      Text(
                        '₹${fee.toInt()}.00',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: isDark ? const Color(0xFFFDE68A) : AppTheme.primaryOrangeDark,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF064E3B).withOpacity(0.7) : AppTheme.successGreenLight,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.successGreen.withOpacity(0.4)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.check_circle_outline, size: 14, color: isDark ? const Color(0xFF34D399) : AppTheme.successGreen),
                        const SizedBox(width: 4),
                        Text(
                          'ऑनलाईन भरणा समाविष्ट',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isDark ? const Color(0xFF34D399) : AppTheme.successGreen,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryOrange,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                          const SizedBox(width: 8),
                          Text(
                            'अर्ज सादर करा व शुल्क भरा (₹${fee.toInt()})',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
