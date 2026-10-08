import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../models/tax_model.dart';
import '../widgets/govd_theme.dart';

class GovdTaxDesk extends StatefulWidget {
  const GovdTaxDesk({super.key});

  @override
  State<GovdTaxDesk> createState() => _GovdTaxDeskState();
}

class _GovdTaxDeskState extends State<GovdTaxDesk> {
  String _selectedFilter = 'all'; // 'all', 'paid', 'pending'
  String _searchQuery = '';

  void _openTaxReceipt(BuildContext context, TaxRecordModel t, bool isMr) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(22),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: GovdTheme.emerald.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.receipt_long_rounded, color: GovdTheme.emerald, size: 22),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isMr ? 'ग्रामपंचायत अधिकृत कर पावती' : 'Official Tax Receipt',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                    ),
                    Text(
                      'पावती क्र. #REC-2026-${t.houseNo.replaceAll(RegExp(r'\D'), '')}',
                      style: const TextStyle(fontSize: 11, color: GovdTheme.slateMedium),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 10),

            _buildReceiptRow(isMr ? 'घर क्र. / मिळकत:' : 'House No:', t.houseNo),
            _buildReceiptRow(isMr ? 'करदात्याचे नाव:' : 'Owner Name:', t.citizenName),
            _buildReceiptRow(isMr ? 'वॉर्ड क्र. / क्षेत्र:' : 'Ward / Area:', '${t.wardNo} • ${t.gramPanchayat}'),
            _buildReceiptRow(isMr ? 'मूल्यांकन वर्ष:' : 'Assessment Year:', t.assessmentYear),
            const Divider(height: 20),

            _buildReceiptRow(isMr ? 'घरपट्टी (Property Tax):' : 'Property Tax:', '₹${t.generalTax.toInt()}'),
            _buildReceiptRow(isMr ? 'पाणीपट्टी (Water Tax):' : 'Water Tax:', '₹${t.waterTax.toInt()}'),
            _buildReceiptRow(isMr ? 'दिवाबत्ती कर (Lighting):' : 'Lighting Tax:', '₹${t.lightingTax.toInt()}'),
            _buildReceiptRow(isMr ? 'आरोग्य कर (Sanitation):' : 'Sanitation Tax:', '₹${t.sanitationTax.toInt()}'),
            const Divider(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isMr ? 'भरलेली एकूण रक्कम:' : 'Total Paid Amount:',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                ),
                Text(
                  '₹${t.totalAmount.toInt()}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: GovdTheme.emerald),
                ),
              ],
            ),
            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(isMr ? 'पावती PDF डाऊनलोड झाली.' : 'Tax receipt PDF downloaded.'),
                      backgroundColor: GovdTheme.emerald,
                    ),
                  );
                },
                icon: const Icon(Icons.download_rounded, size: 18),
                label: Text(isMr ? 'पावती PDF डाऊनलोड करा' : 'Download Receipt PDF'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: GovdTheme.navyDark,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  void _openCollectPaymentModal(BuildContext context, TaxRecordModel t, AppProvider app, bool isMr) {
    String paymentMode = 'रोख (Cash)';
    final amountController = TextEditingController(text: '${t.dueAmount.toInt()}');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(
            left: 22,
            right: 22,
            top: 18,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
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
              const SizedBox(height: 16),

              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: GovdTheme.emerald.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.currency_rupee_rounded, color: GovdTheme.emerald, size: 22),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isMr ? 'कर वसुली नोंदणी (Collect Payment)' : 'Collect Tax Payment',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                      ),
                      Text(
                        '${t.houseNo} • ${t.citizenName}',
                        style: const TextStyle(fontSize: 11, color: GovdTheme.slateMedium),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 10),

              // Outstanding Breakdown
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    _buildReceiptRow(isMr ? 'घरपट्टी शिल्लक:' : 'Property Tax Due:', '₹${t.generalTax.toInt()}'),
                    _buildReceiptRow(isMr ? 'पाणीपट्टी शिल्लक:' : 'Water Tax Due:', '₹${t.waterTax.toInt()}'),
                    const Divider(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          isMr ? 'एकूण थकीत रक्कम:' : 'Total Due Amount:',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
                        ),
                        Text(
                          '₹${t.dueAmount.toInt()}',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: GovdTheme.rose),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Payment Mode Selection
              Text(
                isMr ? 'भरणा पद्धत निवडा (Payment Mode):' : 'Select Payment Mode:',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: GovdTheme.navyDark),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  _buildPaymentModeChip('रोख (Cash)', paymentMode == 'रोख (Cash)', () {
                    setModalState(() => paymentMode = 'रोख (Cash)');
                  }),
                  const SizedBox(width: 8),
                  _buildPaymentModeChip('UPI / QR कोड', paymentMode == 'UPI / QR कोड', () {
                    setModalState(() => paymentMode = 'UPI / QR कोड');
                  }),
                  const SizedBox(width: 8),
                  _buildPaymentModeChip('धनादेश (Cheque)', paymentMode == 'धनादेश (Cheque)', () {
                    setModalState(() => paymentMode = 'धनादेश (Cheque)');
                  }),
                ],
              ),
              const SizedBox(height: 14),

              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: isMr ? 'वसूल केलेली रक्कम (₹) *' : 'Amount Collected (₹) *',
                  prefixIcon: const Icon(Icons.currency_rupee_rounded, size: 18),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 18),

              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton(
                  onPressed: () {
                    final amt = double.tryParse(amountController.text.trim()) ?? t.dueAmount;
                    app.payTax(taxId: t.id, amount: amt, paymentMethod: 'CASH');
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(isMr ? '₹${amt.toInt()} कर वसुली यशस्वीरित्या नोंदवली गेली!' : 'Tax payment recorded successfully!'),
                        backgroundColor: GovdTheme.emerald,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: GovdTheme.emerald,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text(
                    isMr ? 'पावती तयार करा व भरणा नोंदवा (Confirm)' : 'Issue Receipt & Confirm',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentModeChip(String label, bool isSelected, VoidCallback onTap) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? GovdTheme.navyDark : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: isSelected ? GovdTheme.navyDark : const Color(0xFFE2E8F0)),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: isSelected ? Colors.white : GovdTheme.navyDark,
              ),
              maxLines: 1,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11.5, color: GovdTheme.slateMedium)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: GovdTheme.navyDark)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final allTaxes = app.taxRecords;
    final isMr = app.language == 'mr';

    final filtered = allTaxes.where((t) {
      if (_selectedFilter == 'pending' && t.dueAmount <= 0) return false;
      if (_selectedFilter == 'paid' && t.dueAmount > 0) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = t.citizenName.toLowerCase();
        final phone = t.citizenPhone.toLowerCase();
        final house = t.houseNo.toLowerCase();
        final ward = t.wardNo.toLowerCase();
        if (!name.contains(q) && !phone.contains(q) && !house.contains(q) && !ward.contains(q)) {
          return false;
        }
      }
      return true;
    }).toList();

    // Stats
    final paidCount = allTaxes.where((t) => t.dueAmount <= 0).length;
    final pendingCount = allTaxes.where((t) => t.dueAmount > 0).length;
    final todayCollection = 12500;
    final pendingAmount = 45300;

    return Scaffold(
      backgroundColor: GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isMr ? 'कर संकलन व पावती डेस्क' : 'Tax Management',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              isMr ? 'घरपट्टी, पाणीपट्टी व संकलन' : 'Property & Water Tax Collection',
              style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Section 9: 4-Metric Mobile Collection Box
          Container(
            padding: const EdgeInsets.all(14),
            color: GovdTheme.navyDark,
            child: Column(
              children: [
                Row(
                  children: [
                    _buildTaxKpiBox(isMr ? 'आजची वसुली' : 'Today\'s Collection', '₹$todayCollection', GovdTheme.emerald),
                    const SizedBox(width: 8),
                    _buildTaxKpiBox(isMr ? 'थकबाकी रक्कम' : 'Pending Due', '₹$pendingAmount', GovdTheme.goldDark),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildTaxKpiBox(isMr ? 'भरणा झालेली घरे' : 'Paid Households', '$paidCount', Colors.white),
                    const SizedBox(width: 8),
                    _buildTaxKpiBox(isMr ? 'थकबाकी घरे' : 'Pending Households', '$pendingCount', GovdTheme.rose),
                  ],
                ),
              ],
            ),
          ),

          // Search Property (House No, Owner, Amount, Status)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v),
              decoration: InputDecoration(
                hintText: isMr ? 'घर क्र., मालकाचे नाव किंवा मोबाईल शोधा...' : 'Search house no., owner, phone...',
                hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                prefixIcon: const Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
            ),
          ),

          // Filter Tabs (Scrollable)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('all', isMr ? 'सर्व मिळकती (${allTaxes.length})' : 'All (${allTaxes.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('pending', isMr ? '🔴 थकबाकीदार ($pendingCount)' : '🔴 Pending ($pendingCount)'),
                  const SizedBox(width: 8),
                  _buildFilterChip('paid', isMr ? '🟢 पूर्ण भरणा ($paidCount)' : '🟢 Paid ($paidCount)'),
                ],
              ),
            ),
          ),

          // Section 9 Property Cards List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.receipt_long_outlined, size: 48, color: GovdTheme.slateLight),
                        const SizedBox(height: 8),
                        Text(
                          isMr ? 'कोणतीही कर नोंद सापडली नाही' : 'No tax records found',
                          style: const TextStyle(color: GovdTheme.slateMedium, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final t = filtered[index];
                      return _buildSection9TaxCard(t, app, isMr);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTaxKpiBox(String label, String value, Color valueColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: valueColor)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 9.5, color: Colors.white70, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _selectedFilter == value;
    return InkWell(
      onTap: () => setState(() => _selectedFilter = value),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? GovdTheme.navyDark : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? GovdTheme.navyDark : Colors.grey.shade300),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
            color: isSelected ? Colors.white : GovdTheme.navyDark,
          ),
        ),
      ),
    );
  }

  // Exact Section 9 Card Layout (Anti-Collision & Responsive):
  // House No. GHUL-45
  // Roshan Gorde
  // Property Tax ₹800
  // Water Tax ₹400
  // 🟢 Paid -> [View Receipt]
  // For pending: 🔴 ₹1,440 Due -> [Collect Payment]
  Widget _buildSection9TaxCard(TaxRecordModel t, AppProvider app, bool isMr) {
    final isPaid = t.dueAmount <= 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isPaid ? Colors.grey.shade200 : GovdTheme.rose.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // House No & Status Pill
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: GovdTheme.navyDark.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.home_work_rounded, color: GovdTheme.navyDark, size: 16),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'घर क्र. ${t.houseNo}',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: GovdTheme.navyDark),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isPaid ? GovdTheme.emerald.withOpacity(0.12) : GovdTheme.rose.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: isPaid ? GovdTheme.emerald.withOpacity(0.4) : GovdTheme.rose.withOpacity(0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isPaid ? Icons.check_circle_rounded : Icons.error_outline_rounded,
                      size: 12,
                      color: isPaid ? GovdTheme.emerald : GovdTheme.rose,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isPaid ? (isMr ? 'भरणा पूर्ण' : 'Paid') : (isMr ? '₹${t.dueAmount.toInt()} बाकी' : '₹${t.dueAmount.toInt()} Due'),
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        color: isPaid ? GovdTheme.emerald : GovdTheme.rose,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Owner Name
          Text(
            t.citizenName,
            style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: GovdTheme.navyDark),
          ),
          const SizedBox(height: 2),
          Text(
            '${t.wardNo} • ${t.propertyType}',
            style: const TextStyle(fontSize: 11, color: GovdTheme.slateMedium),
          ),
          const SizedBox(height: 10),

          // Tax Breakdown (Responsive Wrap)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Wrap(
              alignment: WrapAlignment.spaceBetween,
              spacing: 8,
              runSpacing: 4,
              children: [
                Text(
                  '${isMr ? "घरपट्टी:" : "Property Tax:"} ₹${t.generalTax.toInt()}',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                ),
                Text(
                  '${isMr ? "पाणीपट्टी:" : "Water Tax:"} ₹${t.waterTax.toInt()}',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                ),
                Text(
                  '${isMr ? "एकूण:" : "Total:"} ₹${t.totalAmount.toInt()}',
                  style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: GovdTheme.navyDark),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Action Button
          SizedBox(
            width: double.infinity,
            height: 42,
            child: isPaid
                ? OutlinedButton.icon(
                    onPressed: () => _openTaxReceipt(context, t, isMr),
                    icon: const Icon(Icons.receipt_rounded, size: 16),
                    label: Text(isMr ? 'पावती पहा (View Receipt)' : 'View Receipt'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: GovdTheme.navyDark,
                      side: const BorderSide(color: GovdTheme.navyDark),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  )
                : ElevatedButton.icon(
                    onPressed: () => _openCollectPaymentModal(context, t, app, isMr),
                    icon: const Icon(Icons.currency_rupee_rounded, size: 16),
                    label: Text(isMr ? 'कर भरणा नोंदवा (Collect Payment) →' : 'Collect Payment →'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: GovdTheme.emerald,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 0,
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
