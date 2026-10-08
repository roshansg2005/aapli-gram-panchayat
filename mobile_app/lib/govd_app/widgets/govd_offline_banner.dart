import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';

class GovdOfflineBanner extends StatelessWidget {
  const GovdOfflineBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isOnline = app.isNetworkOnline;
    final isSyncing = app.isSyncingData;
    final pendingDrafts = app.offlineDraftCount;

    if (isOnline && pendingDrafts == 0) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: !isOnline
            ? const Color(0xFF78350F) // Amber dark for offline
            : isSyncing
                ? const Color(0xFF1E3A8A) // Blue for syncing
                : const Color(0xFF064E3B), // Emerald for pending sync
        border: const Border(
          bottom: BorderSide(color: Colors.white24, width: 0.5),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: !isOnline
                      ? const Color(0xFFFBBF24)
                      : isSyncing
                          ? const Color(0xFF60A5FA)
                          : const Color(0xFF34D399),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                !isOnline
                    ? 'ऑफलाईन मोड • सुरक्षित मसुदा सक्रिय ($pendingDrafts नोंदी)'
                    : isSyncing
                        ? 'डेटा सिंक्रोनायझेशन सुरू आहे...'
                        : '$pendingDrafts मसुदे सिंक्रोनाइझसाठी तयार',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          if (isOnline && pendingDrafts > 0 && !isSyncing)
            InkWell(
              onTap: () => app.syncOfflineData(),
              borderRadius: BorderRadius.circular(6),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'सिंक करा 🔄',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
