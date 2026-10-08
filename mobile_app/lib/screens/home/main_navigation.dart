import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import 'home_screen.dart';
import '../certificates/certificates_list_screen.dart';
import '../taxes/tax_records_screen.dart';
import '../grievances/grievances_list_screen.dart';
import '../profile/profile_screen.dart';
import '../../govd_app/screens/govd_dashboard_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const CertificatesListScreen(),
    const TaxRecordsScreen(),
    const GrievancesListScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;

    if (app.currentUser?.isOfficial == true && app.isGovdDeskMode) {
      return const GovdDashboardScreen();
    }

    return PopScope(
      canPop: _currentIndex == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_currentIndex != 0) {
          setState(() => _currentIndex = 0);
        }
      },
      child: Scaffold(
        backgroundColor: isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9),
        body: IndexedStack(
          index: _currentIndex,
          children: _screens,
        ),
        bottomNavigationBar: NavigationBarTheme(
          data: NavigationBarThemeData(
            backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
            elevation: 8,
            indicatorColor: isDark ? const Color(0xFF1E293B) : AppTheme.saffronLight,
            labelTextStyle: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.selected)) {
                return TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isDark ? const Color(0xFFFCD34D) : AppTheme.primaryOrange,
                );
              }
              return TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              );
            }),
            iconTheme: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.selected)) {
                return IconThemeData(
                  size: 24,
                  color: isDark ? const Color(0xFFFCD34D) : AppTheme.primaryOrange,
                );
              }
              return IconThemeData(
                size: 24,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              );
            }),
          ),
          child: NavigationBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
            destinations: [
              NavigationDestination(
                icon: const Icon(Icons.home_outlined),
                selectedIcon: const Icon(Icons.home_rounded),
                label: app.language == 'mr' ? 'मुख्यपृष्ठ' : 'Home',
              ),
              NavigationDestination(
                icon: const Icon(Icons.description_outlined),
                selectedIcon: const Icon(Icons.description_rounded),
                label: app.language == 'mr' ? 'दाखले' : 'Certificates',
              ),
              NavigationDestination(
                icon: const Icon(Icons.receipt_long_outlined),
                selectedIcon: const Icon(Icons.receipt_long_rounded),
                label: app.language == 'mr' ? 'कर' : 'Tax',
              ),
              NavigationDestination(
                icon: const Icon(Icons.support_agent_outlined),
                selectedIcon: const Icon(Icons.support_agent_rounded),
                label: app.language == 'mr' ? 'तक्रारी' : 'Grievances',
              ),
              NavigationDestination(
                icon: const Icon(Icons.person_outline_rounded),
                selectedIcon: const Icon(Icons.person_rounded),
                label: app.language == 'mr' ? 'प्रोफाइल' : 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
