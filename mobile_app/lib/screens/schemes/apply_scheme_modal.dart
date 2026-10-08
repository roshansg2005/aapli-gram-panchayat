import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/scheme_model.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';

class ApplySchemeModal extends StatefulWidget {
  final GovtSchemeModel scheme;

  const ApplySchemeModal({super.key, required this.scheme});

  @override
  State<ApplySchemeModal> createState() => _ApplySchemeModalState();
}

class _ApplySchemeModalState extends State<ApplySchemeModal> {
  final _remarksController = TextEditingController();
  bool _isSubmitting = false;

  void _handleApply() async {
    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(milliseconds: 1000));

    if (!mounted) return;
    setState(() => _isSubmitting = false);
    Navigator.of(context).pop();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✅ योजनेसाठी अर्ज यशस्वीरीत्या सादर झाला! (Scheme Application Submitted)'),
        backgroundColor: AppTheme.successGreen,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final user = app.currentUser;
    final title = app.language == 'mr' ? widget.scheme.titleMr : widget.scheme.titleEn;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'योजना अर्ज (Apply Scheme)',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
              IconButton(
                icon: Icon(Icons.close_rounded, color: isDark ? const Color(0xFF94A3B8) : Colors.grey),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          Divider(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
          const SizedBox(height: 8),

          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isDark ? const Color(0xFFFDE68A) : AppTheme.primaryOrangeDark,
            ),
          ),
          const SizedBox(height: 12),

          // Applicant Auto-fill Box
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : AppTheme.backgroundLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark ? const Color(0xFF334155) : AppTheme.cardBorder,
              ),
            ),
            child: Column(
              children: [
                _buildRow('अर्जदाराचे नाव', user?.name ?? 'नागरिक', isDark),
                const SizedBox(height: 4),
                _buildRow('मोबाईल नंबर', user?.phone ?? '-', isDark),
                const SizedBox(height: 4),
                _buildRow('ग्रामपंचायत', user?.gramPanchayat ?? 'घुलेवाडी', isDark),
                const SizedBox(height: 4),
                _buildRow('घर क्र. व वॉर्ड', '${user?.houseNo ?? "-"} • ${user?.wardNo ?? "-"}', isDark),
              ],
            ),
          ),
          const SizedBox(height: 14),

          Text(
            'अर्जदाराचे विवरण / शेरा (Remarks)',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _remarksController,
            maxLines: 3,
            style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0F172A)),
            decoration: const InputDecoration(
              hintText: 'योजनेचा लाभ घेण्याचे कारण लिहा...',
            ),
          ),
          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _handleApply,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryOrange,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isSubmitting
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('अर्ज सादर करा (Submit Application)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value, bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary)),
        Text(value, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white : AppTheme.textPrimary)),
      ],
    );
  }
}
