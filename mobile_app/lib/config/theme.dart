import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors
  static const Color primaryOrange = Color(0xFFE65100);
  static const Color primaryOrangeDark = Color(0xFFC43E00);
  static const Color primaryOrangeLight = Color(0xFFFF833A);
  static const Color saffron = Color(0xFFFF9933);
  static const Color saffronLight = Color(0xFFFFF3E0);

  static const Color govNavy = Color(0xFF0F172A);
  static const Color govNavyLight = Color(0xFF1E293B);
  static const Color govBlue = Color(0xFF1D4ED8);
  static const Color govBlueLight = Color(0xFFEFF6FF);

  static const Color successGreen = Color(0xFF059669);
  static const Color successGreenLight = Color(0xFFECFDF5);
  static const Color warningAmber = Color(0xFFD97706);
  static const Color warningAmberLight = Color(0xFFFFFBEB);
  static const Color dangerRed = Color(0xFFDC2626);
  static const Color dangerRedLight = Color(0xFFFEF2F2);

  // Light Mode Tokens
  static const Color backgroundLight = Color(0xFFF1F5F9);
  static const Color surfaceWhite = Colors.white;
  static const Color cardBorderLight = Color(0xFFE2E8F0);
  static const Color textPrimaryLight = Color(0xFF0F172A);
  static const Color textSecondaryLight = Color(0xFF475569);
  static const Color textMutedLight = Color(0xFF94A3B8);

  // Legacy Aliases for backward compatibility
  static const Color cardBorder = cardBorderLight;
  static const Color textPrimary = textPrimaryLight;
  static const Color textSecondary = textSecondaryLight;
  static const Color textMuted = textMutedLight;

  // Dark Mode Tokens
  static const Color backgroundDark = Color(0xFF0B0F19);
  static const Color surfaceDark = Color(0xFF131C2E);
  static const Color cardDark = Color(0xFF1E293B);
  static const Color cardBorderDark = Color(0xFF334155);
  static const Color textPrimaryDark = Color(0xFFF8FAFC);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color textMutedDark = Color(0xFF64748B);

  // Gradient Decorations
  static const LinearGradient saffronGradient = LinearGradient(
    colors: [Color(0xFFE65100), Color(0xFFF57C00)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient navyGradient = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient aiGlowGradient = LinearGradient(
    colors: [Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFEC4899)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardAccentGradient = LinearGradient(
    colors: [Color(0xFFFFF7ED), Color(0xFFFFEDD5)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Light Theme Data
  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.poppinsTextTheme();

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: backgroundLight,
      colorScheme: const ColorScheme.light(
        primary: primaryOrange,
        secondary: saffron,
        surface: surfaceWhite,
        error: dangerRed,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textPrimaryLight,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: govNavy,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: cardBorderLight, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryOrange,
          foregroundColor: Colors.white,
          elevation: 1,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryOrange,
          side: const BorderSide(color: primaryOrange, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: cardBorderLight, width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: cardBorderLight, width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryOrange, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: dangerRed, width: 1.5),
        ),
        labelStyle: const TextStyle(color: textSecondaryLight, fontSize: 13),
        hintStyle: const TextStyle(color: textMutedLight, fontSize: 13),
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.bold, color: textPrimaryLight),
        headlineMedium: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: textPrimaryLight),
        titleLarge: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: textPrimaryLight),
        titleMedium: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600, color: textPrimaryLight),
        bodyLarge: GoogleFonts.poppins(fontSize: 14, color: textPrimaryLight),
        bodyMedium: GoogleFonts.poppins(fontSize: 12, color: textSecondaryLight),
      ),
    );
  }

  // Dark Theme Data
  static ThemeData get darkTheme {
    final baseTextTheme = GoogleFonts.poppinsTextTheme(ThemeData(brightness: Brightness.dark).textTheme);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: backgroundDark,
      colorScheme: const ColorScheme.dark(
        primary: saffron,
        secondary: Color(0xFF60A5FA),
        surface: surfaceDark,
        error: Color(0xFFF87171),
        onPrimary: Colors.black,
        onSecondary: Colors.white,
        onSurface: textPrimaryDark,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(0xFF070B12),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
      cardTheme: CardThemeData(
        color: cardDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: cardBorderDark, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryOrange,
          foregroundColor: Colors.white,
          elevation: 1,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: saffron,
          side: const BorderSide(color: saffron, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardDark,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: cardBorderDark, width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: cardBorderDark, width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: saffron, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFF87171), width: 1.5),
        ),
        labelStyle: const TextStyle(color: textSecondaryDark, fontSize: 13),
        hintStyle: const TextStyle(color: textMutedDark, fontSize: 13),
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.bold, color: textPrimaryDark),
        headlineMedium: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: textPrimaryDark),
        titleLarge: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: textPrimaryDark),
        titleMedium: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600, color: textPrimaryDark),
        bodyLarge: GoogleFonts.poppins(fontSize: 14, color: textPrimaryDark),
        bodyMedium: GoogleFonts.poppins(fontSize: 12, color: textSecondaryDark),
      ),
    );
  }
}
