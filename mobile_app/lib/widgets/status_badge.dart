import 'package:flutter/material.dart';
import '../config/theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final String? label;

  const StatusBadge({
    super.key,
    required this.status,
    this.label,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    Color border;
    IconData icon;
    String display = label ?? status;

    final s = status.toLowerCase();

    if (s == 'approved' || s == 'paid' || s == 'resolved' || s == 'completed') {
      bg = AppTheme.successGreenLight;
      text = AppTheme.successGreen;
      border = AppTheme.successGreen.withOpacity(0.3);
      icon = Icons.check_circle_rounded;
      if (label == null) {
        if (s == 'approved') display = 'मंजूर (Approved)';
        if (s == 'paid') display = 'भरणा पूर्ण (Paid)';
        if (s == 'resolved') display = 'निवारण पूर्ण (Resolved)';
        if (s == 'completed') display = 'पूर्ण (Completed)';
      }
    } else if (s == 'in_progress' || s == 'partial') {
      bg = AppTheme.govBlueLight;
      text = AppTheme.govBlue;
      border = AppTheme.govBlue.withOpacity(0.3);
      icon = Icons.sync_rounded;
      if (label == null) {
        if (s == 'in_progress') display = 'प्रक्रिया सुरू (In Progress)';
        if (s == 'partial') display = 'अंशतः भरणा (Partial)';
      }
    } else if (s == 'rejected') {
      bg = AppTheme.dangerRedLight;
      text = AppTheme.dangerRed;
      border = AppTheme.dangerRed.withOpacity(0.3);
      icon = Icons.cancel_rounded;
      if (label == null) display = 'नाकारले (Rejected)';
    } else {
      // Pending / Open
      bg = AppTheme.warningAmberLight;
      text = AppTheme.warningAmber;
      border = AppTheme.warningAmber.withOpacity(0.3);
      icon = Icons.hourglass_top_rounded;
      if (label == null) {
        if (s == 'open') display = 'दाखल (Open)';
        if (s == 'pending') display = 'प्रलंबित (Pending)';
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: text),
          const SizedBox(width: 4),
          Text(
            display,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: text,
            ),
          ),
        ],
      ),
    );
  }
}
