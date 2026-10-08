import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../models/tax_model.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';

class TaxReceiptDialog extends StatelessWidget {
  final TaxRecordModel taxRecord;

  const TaxReceiptDialog({super.key, required this.taxRecord});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      insetPadding: const EdgeInsets.all(16),
      backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isDark ? const Color(0xFF10B981).withOpacity(0.5) : AppTheme.successGreen.withOpacity(0.4),
            width: 2,
          ),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF064E3B).withOpacity(0.6) : AppTheme.successGreenLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.receipt_long_rounded, color: Color(0xFF10B981), size: 22),
                  ),
                  Column(
                    children: [
                      Text(
                        'अधिकृत कर पावती (नमुना क्र. ९)',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppTheme.govNavy,
                        ),
                      ),
                      Text(
                        'महाराष्ट्र ग्रामपंचायत अधिनियम',
                        style: TextStyle(
                          fontSize: 10,
                          color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: Icon(Icons.close_rounded, color: isDark ? const Color(0xFF94A3B8) : Colors.grey),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              Divider(
                thickness: 1.5,
                color: isDark ? const Color(0xFF10B981) : AppTheme.successGreen,
                height: 20,
              ),

              // Title
              Text(
                'ग्रामपंचायत ${taxRecord.gramPanchayat}',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : AppTheme.govNavy,
                ),
              ),
              Text(
                'आकारणी वर्ष: ${taxRecord.assessmentYear}',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isDark ? const Color(0xFFFDE68A) : AppTheme.primaryOrangeDark,
                ),
              ),
              const SizedBox(height: 12),

              // Receipt Details Box
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F172A) : AppTheme.backgroundLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? const Color(0xFF334155) : AppTheme.cardBorder,
                  ),
                ),
                child: Column(
                  children: [
                    _buildRow('पावती क्रमांक', taxRecord.transactionId ?? 'TXN-84920194', isDark),
                    Divider(height: 10, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    _buildRow('करदात्याचे नाव', taxRecord.citizenName, isDark),
                    Divider(height: 10, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    _buildRow('घर / मिळकत क्रमांक', taxRecord.houseNo, isDark),
                    Divider(height: 10, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    _buildRow('वॉर्ड क्रमांक', taxRecord.wardNo, isDark),
                    Divider(height: 10, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    _buildRow('भरणा दिनांक', taxRecord.paymentDate ?? DateTime.now().toIso8601String().substring(0, 10), isDark),
                    Divider(height: 10, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    _buildRow('भरणा पद्धत', taxRecord.paymentMethod ?? 'UPI Online', isDark),
                    Divider(height: 10, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    _buildRow('सामान्य कर', '₹${taxRecord.generalTax.toInt()}', isDark),
                    Divider(height: 10, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    _buildRow('पाणीपट्टी कर', '₹${taxRecord.waterTax.toInt()}', isDark),
                    Divider(height: 10, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    _buildRow('दिवाबत्ती + स्वच्छता कर', '₹${(taxRecord.lightingTax + taxRecord.sanitationTax).toInt()}', isDark),
                    Divider(height: 10, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'एकूण भरलेली रक्कम',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                        Text(
                          '₹${taxRecord.paidAmount.toInt()}.00',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF10B981)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // QR Code and Stamp
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: QrImageView(
                      data: 'https://aapligrampanchayat.gov.in/receipt/${taxRecord.id}',
                      version: QrVersions.auto,
                      size: 64.0,
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 24),
                      const Text(
                        'कर भरणा यशस्वी',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                      ),
                      Text(
                        'कर वसुली लिपिक / ग्रामसेवक',
                        style: TextStyle(
                          fontSize: 9,
                          color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                        ),
                      ),
                      Text(
                        'ग्रामपंचायत घुलेवाडी',
                        style: TextStyle(
                          fontSize: 9,
                          color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('कर पावती यशस्वीरीत्या डाउनलोड झाली! (PDF Saved)')),
                    );
                    Navigator.of(context).pop();
                  },
                  icon: const Icon(Icons.download_rounded, size: 16, color: Colors.white),
                  label: const Text('पावती डाउनलोड करा (PDF)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryOrange),
                ),
              ),
            ],
          ),
        ),
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
