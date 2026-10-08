import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/tax_model.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import 'tax_receipt_dialog.dart';

class PayTaxModal extends StatefulWidget {
  final TaxRecordModel taxRecord;

  const PayTaxModal({super.key, required this.taxRecord});

  @override
  State<PayTaxModal> createState() => _PayTaxModalState();
}

class _PayTaxModalState extends State<PayTaxModal> {
  String _selectedMethod = 'UPI / PhonePe / GPay';
  bool _isProcessing = false;

  void _handlePay() async {
    setState(() => _isProcessing = true);

    await Future.delayed(const Duration(milliseconds: 1200));

    if (!mounted) return;
    final app = context.read<AppProvider>();
    final success = await app.payTax(
      taxId: widget.taxRecord.id,
      amount: widget.taxRecord.dueAmount,
      paymentMethod: _selectedMethod,
    );

    setState(() => _isProcessing = false);

    if (success && mounted) {
      Navigator.of(context).pop();
      showDialog(
        context: context,
        builder: (_) => TaxReceiptDialog(
          taxRecord: TaxRecordModel(
            id: widget.taxRecord.id,
            citizenName: widget.taxRecord.citizenName,
            citizenPhone: widget.taxRecord.citizenPhone,
            houseNo: widget.taxRecord.houseNo,
            propertyType: widget.taxRecord.propertyType,
            wardNo: widget.taxRecord.wardNo,
            gramPanchayat: widget.taxRecord.gramPanchayat,
            taluka: widget.taxRecord.taluka,
            assessmentYear: widget.taxRecord.assessmentYear,
            generalTax: widget.taxRecord.generalTax,
            waterTax: widget.taxRecord.waterTax,
            lightingTax: widget.taxRecord.lightingTax,
            sanitationTax: widget.taxRecord.sanitationTax,
            totalAmount: widget.taxRecord.totalAmount,
            paidAmount: widget.taxRecord.totalAmount,
            dueAmount: 0.0,
            status: 'paid',
            paymentDate: DateTime.now().toIso8601String().substring(0, 10),
            paymentMethod: _selectedMethod,
            transactionId: 'TXN-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;

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
                'कर भरणा गेटवे (Tax Payment)',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : AppTheme.textPrimary,
                ),
              ),
              IconButton(
                icon: Icon(Icons.close_rounded, color: isDark ? const Color(0xFF94A3B8) : Colors.grey),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          Divider(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
          const SizedBox(height: 10),

          // Total Due Amount Box
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
                      'भरणा रक्कम (${widget.taxRecord.assessmentYear})',
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? const Color(0xFFCBD5E1) : AppTheme.textSecondary,
                      ),
                    ),
                    Text(
                      '₹${widget.taxRecord.dueAmount.toInt()}.00',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: isDark ? const Color(0xFFFDE68A) : AppTheme.primaryOrangeDark,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    widget.taxRecord.houseNo,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isDark ? const Color(0xFFFCD34D) : AppTheme.govNavy,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          Text(
            'पेमेंट पर्याय निवडा (Select Payment Method):',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 10),

          _buildPaymentOption('UPI / PhonePe / GPay / Paytm', Icons.qr_code_scanner_rounded, isDark),
          _buildPaymentOption('Debit / Credit Card / RuPay', Icons.credit_card_rounded, isDark),
          _buildPaymentOption('Net Banking (सर्व बँका)', Icons.account_balance_rounded, isDark),

          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isProcessing ? null : _handlePay,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isProcessing
                  ? const CircularProgressIndicator(color: Colors.white)
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.lock_outline_rounded, size: 18, color: Colors.white),
                        const SizedBox(width: 8),
                        Text(
                          'सुरक्षित भरणा करा (₹${widget.taxRecord.dueAmount.toInt()})',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }

  Widget _buildPaymentOption(String title, IconData icon, bool isDark) {
    final isSelected = _selectedMethod == title;
    return InkWell(
      onTap: () => setState(() => _selectedMethod = title),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? const Color(0xFF78350F).withOpacity(0.4) : AppTheme.saffronLight)
              : (isDark ? const Color(0xFF1E293B) : Colors.white),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? AppTheme.primaryOrange
                : (isDark ? const Color(0xFF334155) : AppTheme.cardBorder),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? AppTheme.primaryOrange : (isDark ? const Color(0xFF94A3B8) : Colors.grey),
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected
                      ? (isDark ? Colors.white : AppTheme.textPrimary)
                      : (isDark ? const Color(0xFFCBD5E1) : AppTheme.textSecondary),
                ),
              ),
            ),
            if (isSelected) const Icon(Icons.check_circle_rounded, color: AppTheme.primaryOrange, size: 18),
          ],
        ),
      ),
    );
  }
}
