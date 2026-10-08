import 'package:flutter/material.dart';
import 'govd_theme.dart';

class GovdLeadershipBar extends StatelessWidget {
  final String gpName;
  final String talukaName;
  final String? bdoName;
  final String? sarpanchName;
  final String? upsarpanchName;
  final String? gramSevakName;
  final VoidCallback? onManageLeadership;

  const GovdLeadershipBar({
    super.key,
    required this.gpName,
    required this.talukaName,
    this.bdoName,
    this.sarpanchName,
    this.upsarpanchName,
    this.gramSevakName,
    this.onManageLeadership,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(5),
                      decoration: BoxDecoration(
                        color: GovdTheme.gold.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.shield_rounded, color: GovdTheme.gold, size: 16),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'नेतृत्व पदभार नियंत्रण कक्ष',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '१ तालुका = १ BDO | १ GP = १ सरपंच, उपसरपंच, ग्रामसेवक',
                            style: TextStyle(
                              fontSize: 9,
                              color: Colors.white.withOpacity(0.65),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: GovdTheme.emerald.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: GovdTheme.emerald.withOpacity(0.4)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircleAvatar(radius: 3, backgroundColor: GovdTheme.emerald),
                    SizedBox(width: 4),
                    Text(
                      'Live Occupancy',
                      style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: GovdTheme.emeraldLight),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildRolePill(
                  roleTitle: 'BDO (गटविकास)',
                  occupantName: bdoName ?? 'श्री. अरविंद देशमुख',
                  location: 'ता. $talukaName',
                  icon: Icons.account_balance_rounded,
                  iconColor: const Color(0xFF818CF8),
                ),
                const SizedBox(width: 8),
                _buildRolePill(
                  roleTitle: 'सरपंच (Panchayat Head)',
                  occupantName: sarpanchName ?? 'सौ. सुनिता घुले',
                  location: gpName,
                  icon: Icons.workspace_premium_rounded,
                  iconColor: GovdTheme.gold,
                ),
                const SizedBox(width: 8),
                _buildRolePill(
                  roleTitle: 'उपसरपंच (Deputy Head)',
                  occupantName: upsarpanchName ?? 'श्री. सचिन थोरात',
                  location: gpName,
                  icon: Icons.stars_rounded,
                  iconColor: const Color(0xFF2DD4BF),
                ),
                const SizedBox(width: 8),
                _buildRolePill(
                  roleTitle: 'ग्रामसेवक (Secretary)',
                  occupantName: gramSevakName ?? 'श्री. राहुल शिंदे',
                  location: gpName,
                  icon: Icons.verified_user_rounded,
                  iconColor: const Color(0xFF60A5FA),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRolePill({
    required String roleTitle,
    required String occupantName,
    required String location,
    required IconData icon,
    required Color iconColor,
  }) {
    return Container(
      width: 140,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 13, color: iconColor),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  roleTitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    color: iconColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            occupantName,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          Text(
            location,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 9,
              color: Colors.white.withOpacity(0.5),
            ),
          ),
        ],
      ),
    );
  }
}
