import 'package:flutter/material.dart';

class GovdTheme {
  // Primary Government Palette
  static const Color navyDark = Color(0xFF0F172A); // Slate 900
  static const Color navyMedium = Color(0xFF1E293B); // Slate 800
  static const Color navyLight = Color(0xFF334155); // Slate 700
  
  static const Color saffronPrimary = Color(0xFFE65100); // Saffron / Orange
  static const Color saffron = Color(0xFFE65100);
  static const Color saffronDark = Color(0xFFC2410C); // Saffron Dark
  static const Color orangeLight = Color(0xFFFFF7ED); // Orange 50
  
  static const Color royalIndigo = Color(0xFF3730A3); // Indigo 800
  static const Color primaryBlue = Color(0xFF2563EB); // Blue 600
  static const Color lightBlue = Color(0xFFEFF6FF); // Blue 50
  
  static const Color gold = Color(0xFFF59E0B); // Amber 500
  static const Color goldDark = Color(0xFFD97706); // Amber 600
  static const Color goldLight = Color(0xFFFEF3C7); // Amber 100
  
  static const Color emerald = Color(0xFF10B981); // Emerald 500
  static const Color emeraldDark = Color(0xFF047857); // Emerald 700
  static const Color emeraldLight = Color(0xFFD1FAE5); // Emerald 100
  
  static const Color rose = Color(0xFFE11D48); // Rose 600
  static const Color roseDark = Color(0xFFBE123C); // Rose 700
  static const Color roseLight = Color(0xFFFFE4E6); // Rose 100
  
  static const Color purple = Color(0xFF7C3AED); // Purple 600
  static const Color purpleLight = Color(0xFFF3E8FF); // Purple 100
  
  static const Color bgSurface = Color(0xFFF8FAFC); // Slate 50
  static const Color cardBg = Colors.white;
  static const Color borderSubtle = Color(0xFFE2E8F0); // Slate 200
  static const Color textMain = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF64748B);
  static const Color slateMedium = Color(0xFF64748B);
  static const Color slateLight = Color(0xFF94A3B8);
  static const Color slateDark = Color(0xFF1E293B);

  // Gradients
  static const LinearGradient headerGradient = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient saffronGradient = LinearGradient(
    colors: [Color(0xFFF97316), Color(0xFFEA580C)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient blueGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient emeraldGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient purpleGradient = LinearGradient(
    colors: [Color(0xFF7C3AED), Color(0xFF6D28D9)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
