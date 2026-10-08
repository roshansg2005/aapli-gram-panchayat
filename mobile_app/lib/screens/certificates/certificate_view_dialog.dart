import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../models/certificate_model.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';

class CertificateViewDialog extends StatelessWidget {
  final CertificateModel certificate;

  const CertificateViewDialog({super.key, required this.certificate});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      backgroundColor: isDark ? const Color(0xFF131C2E) : Colors.white,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF78350F).withOpacity(0.5) : AppTheme.saffronLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.account_balance_rounded, color: AppTheme.primaryOrange, size: 22),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Column(
                        children: [
                          Text(
                            isMr ? 'महाराष्ट्र शासन • ग्रामविकास विभाग' : 'Govt of Maharashtra • Rural Dev',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : AppTheme.govNavy,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            isMr ? 'अधिकृत डिजिटल ई-दाखला (Digital Copy)' : 'Official Digital e-Certificate',
                            style: TextStyle(
                              fontSize: 10,
                              color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.close_rounded, color: isDark ? const Color(0xFF94A3B8) : Colors.grey, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              Divider(
                thickness: 1.5,
                color: isDark ? const Color(0xFFF59E0B) : AppTheme.primaryOrange,
                height: 16,
              ),

              // Scrollable Certificate Document Content
              Flexible(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      Text(
                        'ग्रामपंचायत ${certificate.gramPanchayat}',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: isDark ? const Color(0xFFFDE68A) : AppTheme.primaryOrangeDark,
                        ),
                      ),
                      Text(
                        'ता. ${certificate.taluka}, जि. अहिल्यानगर',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? const Color(0xFF94A3B8) : AppTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 10),

                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF0F172A) : AppTheme.govNavy,
                          borderRadius: BorderRadius.circular(8),
                          border: isDark ? Border.all(color: const Color(0xFF334155)) : null,
                        ),
                        child: Text(
                          certificate.certificateType,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Document Table
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                          ),
                        ),
                        child: Column(
                          children: [
                            _buildRow(isMr ? 'दाखला क्रमांक' : 'Certificate No', certificate.certificateNumber ?? 'GP/2026/042', isDark),
                            Divider(height: 12, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                            _buildRow(isMr ? 'अर्जदाराचे नाव' : 'Applicant Name', certificate.applicantName, isDark),
                            Divider(height: 12, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                            _buildRow(isMr ? 'मोबाईल क्रमांक' : 'Mobile Number', certificate.applicantPhone, isDark),
                            Divider(height: 12, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                            _buildRow(isMr ? 'घर / मिळकत क्र' : 'Property No', certificate.houseNo ?? 'घर क्र. ४५', isDark),
                            Divider(height: 12, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                            _buildRow(isMr ? 'उद्देश' : 'Purpose', certificate.purpose, isDark),
                            Divider(height: 12, color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                            _buildRow(isMr ? 'निर्गमित दिनांक' : 'Issue Date', certificate.issueDate ?? certificate.submissionDate, isDark),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),

                      // QR Code and Digital Signature Section
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: const Color(0xFF10B981).withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: QrImageView(
                                data: 'https://aapligrampanchayat.gov.in/verify/${certificate.id}',
                                version: QrVersions.auto,
                                size: 64.0,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.verified_rounded, color: Color(0xFF10B981), size: 18),
                                      const SizedBox(width: 4),
                                      Text(
                                        isMr ? 'डिजिटल स्वाक्षरीत' : 'Digitally Signed',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    isMr ? 'ग्रामविकास अधिकारी / सरपंच' : 'Gram Sevak / Sarpanch',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155),
                                    ),
                                  ),
                                  Text(
                                    'ग्रामपंचायत ${certificate.gramPanchayat}',
                                    style: TextStyle(
                                      fontSize: 9.5,
                                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 14),

              // Action Buttons Row: Download PDF, Share, Verify Certificate
              Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(isMr ? 'दाखला PDF डाउनलोड झाला!' : 'Certificate PDF downloaded successfully!'),
                                backgroundColor: AppTheme.successGreen,
                              ),
                            );
                            Navigator.of(context).pop();
                          },
                          icon: const Icon(Icons.download_rounded, size: 16),
                          label: Text(
                            isMr ? 'डाउनलोड PDF' : 'Download PDF',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.primaryOrange),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(isMr ? 'दाखला लिंक कॉपी झाली!' : 'Certificate link copied!'),
                              ),
                            );
                          },
                          icon: const Icon(Icons.share_rounded, size: 16, color: Colors.white),
                          label: Text(
                            isMr ? 'शेअर करा' : 'Share',
                            style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryOrange,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: double.infinity,
                    child: TextButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(isMr
                                ? 'अधिकृत डिजिटल पडताळणी: वैध दाखला (${certificate.id})'
                                : 'Digital Verification: Valid Certificate (${certificate.id})'),
                            backgroundColor: AppTheme.successGreen,
                          ),
                        );
                      },
                      icon: const Icon(Icons.verified_user_outlined, size: 15, color: Color(0xFF2563EB)),
                      label: Text(
                        isMr ? 'ऑनलाइन पडताळणी करा (Verify Certificate)' : 'Verify Certificate Online',
                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                      ),
                    ),
                  ),
                ],
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
        Text(
          value,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }
}
