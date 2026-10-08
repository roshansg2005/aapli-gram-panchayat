import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_app_bar.dart';
import '../../models/tax_model.dart';
import 'pay_tax_modal.dart';
import 'tax_receipt_dialog.dart';

class TaxRecordsScreen extends StatefulWidget {
  final bool showBackButton;
  const TaxRecordsScreen({super.key, this.showBackButton = false});

  @override
  State<TaxRecordsScreen> createState() => _TaxRecordsScreenState();
}

class _TaxRecordsScreenState extends State<TaxRecordsScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isMr = app.language == 'mr';
    final isDark = app.isDarkMode;
    final taxes = app.taxRecords;
    final totalDue = taxes.fold<double>(0.0, (sum, t) => sum + t.dueAmount);
    final totalPaid = taxes.fold<double>(0.0, (sum, t) => sum + t.paidAmount);

    final filteredTaxes = _searchQuery.isEmpty
        ? taxes
        : taxes.where((t) {
            final q = _searchQuery.toLowerCase();
            return t.propertyNo.toLowerCase().contains(q) ||
                t.ownerName.toLowerCase().contains(q) ||
                t.wardNo.toLowerCase().contains(q);
          }).toList();

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9),
      appBar: CustomGovAppBar(
        title: app.tr('taxPortalTitle'),
        showBackButton: widget.showBackButton,
      ),
      body: RefreshIndicator(
        onRefresh: () => app.refreshAllData(),
        color: AppTheme.primaryOrange,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 🌟 Top Tax Summary Banner
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.receipt_long_rounded, color: Color(0xFFF59E0B), size: 14),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    isMr ? 'चालू वर्षाची एकूण थकबाकी' : 'Total Tax Due (FY 2026-27)',
                                    style: const TextStyle(fontSize: 11, color: Color(0xFFCBD5E1)),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              alignment: Alignment.centerLeft,
                              child: Text(
                                '₹${totalDue.toInt()}',
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFFF59E0B),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            isMr ? 'भरणा केलेला कर' : 'Total Paid',
                            style: const TextStyle(fontSize: 11, color: Color(0xFFCBD5E1)),
                          ),
                          const SizedBox(height: 4),
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerRight,
                            child: Text(
                              '₹${totalPaid.toInt()}',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF10B981),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.local_offer_rounded, color: Color(0xFF34D399), size: 14),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            isMr ? '🌟 वेळेत ऑनलाइन कर भरल्यावर १०% विशेष सवलत लागू!' : '🌟 10% instant rebate on prompt digital payment!',
                            style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF34D399)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 🔍 Search Property Box
            Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
              ),
              child: TextField(
                controller: _searchController,
                style: TextStyle(
                  fontSize: 13.5,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
                onChanged: (val) => setState(() => _searchQuery = val.trim()),
                decoration: InputDecoration(
                  hintText: isMr ? 'मिळकत क्र. (उदा. GHUL-45) किंवा नाव शोधा...' : 'Search Property No or Owner Name...',
                  hintStyle: TextStyle(fontSize: 12, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
                  prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.primaryOrange, size: 20),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Section Heading
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    _searchQuery.isEmpty
                        ? (isMr ? 'चालू मालमत्ता व कर मूल्यांकन' : 'Current Property & Tax Assessment')
                        : (isMr ? 'शोध निकाल (${filteredTaxes.length})' : 'Search Results (${filteredTaxes.length})'),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            if (filteredTaxes.isEmpty) ...[
              Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                ),
                child: Center(
                  child: Column(
                    children: [
                      Icon(Icons.search_off_rounded, size: 40, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
                      const SizedBox(height: 10),
                      Text(
                        isMr ? 'या मिळकत क्रमांकाची नोंद सापडली नाही' : 'No tax record found for this query',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ] else ...[
              ...filteredTaxes.map((tax) => _buildTaxCard(context, tax, isMr, isDark)),
            ],

            const SizedBox(height: 16),

            // 📜 Tax Assessment History Section (2026-27, 2025-26, 2024-25)
            _buildTaxHistorySection(isDark, isMr),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildTaxCard(BuildContext context, TaxModel tax, bool isMr, bool isDark) {
    final isPaid = tax.dueAmount <= 0;
    final rebate = (tax.generalTax + tax.waterTax + tax.lightTax + tax.healthTax) * 0.10;
    final netPayable = (tax.dueAmount > 0) ? (tax.dueAmount - (isPaid ? 0 : rebate)).clamp(0, double.infinity) : 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isPaid
              ? const Color(0xFF10B981).withOpacity(0.4)
              : const Color(0xFFEF4444).withOpacity(0.3),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Summary: Property Number, Owner Name, Ward
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'मिळकत क्र. #${tax.propertyNo}',
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                color: isDark ? const Color(0xFF6EE7B7) : const Color(0xFF047857),
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              tax.wardNo,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        tax.ownerName,
                        style: TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${tax.gramPanchayat}, ता. ${tax.taluka}',
                        style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: isPaid
                        ? (isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5))
                        : (isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFEF2F2)),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isPaid ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isPaid ? Icons.check_circle_rounded : Icons.pending_actions_rounded,
                        size: 13,
                        color: isPaid ? const Color(0xFF34D399) : const Color(0xFFF87171),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isPaid ? (isMr ? 'कर भरला आहे' : 'Paid') : (isMr ? 'थकबाकी' : 'Unpaid'),
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w800,
                          color: isPaid ? const Color(0xFF34D399) : const Color(0xFFF87171),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Divider(color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9), height: 1),
            const SizedBox(height: 12),

            // Itemized Tax Breakdown Table
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _buildTaxRow('🏠 घरपट्टी (Property Tax)', '₹${tax.generalTax.toInt()}', isDark: isDark),
                  const SizedBox(height: 6),
                  _buildTaxRow('💧 पाणीपट्टी (Water Tax)', '₹${tax.waterTax.toInt()}', isDark: isDark),
                  const SizedBox(height: 6),
                  _buildTaxRow('💡 दिवाबत्ती कर (Lighting Tax)', '₹${tax.lightTax.toInt()}', isDark: isDark),
                  const SizedBox(height: 6),
                  _buildTaxRow('🧹 स्वच्छता व आरोग्य कर (Health Tax)', '₹${tax.healthTax.toInt()}', isDark: isDark),
                  if (!isPaid) ...[
                    const SizedBox(height: 6),
                    _buildTaxRow('🎁 १०% विशेष ऑनलाइन सवलत (Rebate)', '- ₹${rebate.toInt()}', isDiscount: true, isDark: isDark),
                  ],
                  const SizedBox(height: 8),
                  Divider(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1), height: 1),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        isMr ? 'एकूण देय रक्कम (Total Payable):' : 'Total Payable Amount:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        '₹${(isPaid ? 0 : netPayable).toInt()}',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: isPaid ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Action Buttons
            if (isPaid) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (_) => TaxReceiptDialog(taxRecord: tax),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF047857),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.receipt_rounded, size: 16),
                  label: Text(
                    isMr ? 'अधिकृत नमुना ८ पावती पहा / डाउनलोड ➔' : 'View / Download Official Receipt ➔',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ] else ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      shape: const RoundedRectangleBorder(
                        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                      ),
                      builder: (_) => PayTaxModal(taxRecord: tax),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.qr_code_2_rounded, size: 18),
                  label: Text(
                    isMr ? 'आता कर भरा (Pay Now) ➔' : 'Pay Now Online (UPI) ➔',
                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTaxRow(String label, String value, {bool isDiscount = false, required bool isDark}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: isDiscount
                  ? (isDark ? const Color(0xFF34D399) : const Color(0xFF047857))
                  : (isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w800,
            color: isDiscount
                ? (isDark ? const Color(0xFF34D399) : const Color(0xFF047857))
                : (isDark ? Colors.white : const Color(0xFF0F172A)),
          ),
        ),
      ],
    );
  }

  Widget _buildTaxHistorySection(bool isDark, bool isMr) {
    final history = [
      {'year': '2026-27', 'amount': '₹1,200', 'status': 'Pending / Due', 'paid': false},
      {'year': '2025-26', 'amount': '₹1,150', 'status': 'Paid (भरणा पूर्ण)', 'paid': true, 'date': '12 Oct 2025'},
      {'year': '2024-25', 'amount': '₹1,050', 'status': 'Paid (भरणा पूर्ण)', 'paid': true, 'date': '18 Nov 2024'},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.history_rounded, size: 18, color: AppTheme.primaryOrange),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isMr ? 'कर भरणा इतिहास (Tax History)' : 'Tax Payment History',
                  style: TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...history.map((item) {
            final isPaid = item['paid'] as bool;
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isPaid
                      ? (isDark ? const Color(0xFF064E3B) : const Color(0xFFD1FAE5))
                      : (isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFEE2E2)),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'आर्थिक वर्ष ${item['year']}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (item['date'] != null)
                          Text(
                            'भरणा दिनांक: ${item['date']}',
                            style: TextStyle(fontSize: 10, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Row(
                    children: [
                      Text(
                        item['amount'] as String,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isPaid
                              ? (isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5))
                              : (isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFEF2F2)),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          isPaid ? '✓ Paid' : '⏳ Due',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isPaid ? const Color(0xFF34D399) : const Color(0xFFF87171),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
