import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../auth/login_screen.dart';
import '../home/main_navigation.dart';
import '../../govd_app/screens/govd_dashboard_screen.dart';
import '../../govd_app/widgets/govd_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _logoAnimController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  late AnimationController _dotsAnimController;
  Timer? _minDisplayTimer;
  Timer? _timeoutTimer;
  bool _isMinTimeElapsed = false;
  bool _isTakingLonger = false;
  bool _hasNavigated = false;

  @override
  void initState() {
    super.initState();

    // 1. Logo & Text Entrance Animation
    _logoAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    _scaleAnimation = CurvedAnimation(
      parent: _logoAnimController,
      curve: Curves.easeOutBack,
    );

    _fadeAnimation = CurvedAnimation(
      parent: _logoAnimController,
      curve: Curves.easeIn,
    );

    _logoAnimController.forward();

    // 2. Bottom 3-Dots Wave Animation
    _dotsAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();

    // 3. Minimum Display Timer (1.2 seconds for crisp branding display)
    _minDisplayTimer = Timer(const Duration(milliseconds: 1200), () {
      if (mounted) {
        setState(() => _isMinTimeElapsed = true);
        _checkAndNavigate();
      }
    });

    // 4. Maximum Timeout (4.5 seconds safety fallback)
    _timeoutTimer = Timer(const Duration(milliseconds: 4500), () {
      if (mounted && !_hasNavigated) {
        setState(() => _isTakingLonger = true);
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _checkAndNavigate();
  }

  void _checkAndNavigate() {
    if (_hasNavigated || !mounted || !_isMinTimeElapsed) return;

    final app = context.read<AppProvider>();
    if (app.isInitialized) {
      _hasNavigated = true;
      _minDisplayTimer?.cancel();
      _timeoutTimer?.cancel();

      Widget targetScreen;
      if (!app.isAuthenticated) {
        targetScreen = const LoginScreen();
      } else if (app.currentUser?.isOfficial == true && app.isGovdDeskMode) {
        targetScreen = const GovdDashboardScreen();
      } else {
        targetScreen = const MainNavigationScreen();
      }

      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, animation, __) => targetScreen,
          transitionsBuilder: (_, animation, __, child) => FadeTransition(opacity: animation, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    }
  }

  void _continueOffline() {
    if (_hasNavigated || !mounted) return;
    _hasNavigated = true;
    _minDisplayTimer?.cancel();
    _timeoutTimer?.cancel();

    final app = context.read<AppProvider>();
    Widget targetScreen;
    if (app.currentUser != null && app.currentUser!.isOfficial && app.isGovdDeskMode) {
      targetScreen = const GovdDashboardScreen();
    } else if (app.currentUser != null) {
      targetScreen = const MainNavigationScreen();
    } else {
      targetScreen = const LoginScreen();
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => targetScreen),
    );
  }

  void _retryInit() {
    setState(() {
      _isTakingLonger = false;
    });
    final app = context.read<AppProvider>();
    app.init();
    _timeoutTimer = Timer(const Duration(milliseconds: 4000), () {
      if (mounted && !_hasNavigated) {
        setState(() => _isTakingLonger = true);
      }
    });
  }

  @override
  void dispose() {
    _minDisplayTimer?.cancel();
    _timeoutTimer?.cancel();
    _logoAnimController.dispose();
    _dotsAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;

    if (app.isInitialized && _isMinTimeElapsed && !_hasNavigated) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _checkAndNavigate());
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            stops: const [0.0, 0.45, 1.0],
            colors: isDark
                ? const [
                    Color(0xFF0F172A),
                    Color(0xFF1E293B),
                    Color(0xFF0F172A),
                  ]
                : const [
                    Color(0xFFFFFFFF),
                    Color(0xFFF6FAF7),
                    Color(0xFFE5EFE7),
                  ],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const SizedBox(height: 40),

              // Center Brand Emblem & Typography (Matches exact Image 2 design)
              Expanded(
                child: Center(
                  child: AnimatedBuilder(
                    animation: _logoAnimController,
                    builder: (context, child) {
                      return FadeTransition(
                        opacity: _fadeAnimation,
                        child: ScaleTransition(
                          scale: _scaleAnimation,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // 🌿 Golden-Emerald Emblem
                              _buildEmblemLogo(isDark),

                              const SizedBox(height: 28),

                              // 🏷️ "aapli grampanchayat" Typography
                              Text(
                                'aapli grampanchayat',
                                style: GoogleFonts.cinzel(
                                  fontSize: 27,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1.2,
                                  color: isDark
                                      ? const Color(0xFF6EE7B7)
                                      : const Color(0xFF0D482B),
                                  shadows: [
                                    Shadow(
                                      color: isDark
                                          ? Colors.black.withOpacity(0.4)
                                          : const Color(0xFF0D482B).withOpacity(0.12),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 8),

                              // Subtitle / Village Details
                              Text(
                                'आपली ग्रामपंचायत — डिजिटल महाराष्ट्र',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.5,
                                  color: isDark
                                      ? const Color(0xFF94A3B8)
                                      : const Color(0xFF3B6E52),
                                ),
                              ),

                              const SizedBox(height: 24),

                              if (_isTakingLonger)
                                _buildTimeoutCard(context),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),

              // Bottom 3 Pulsing Indicator Dots (Saffron, Mint, Emerald)
              Padding(
                padding: const EdgeInsets.only(bottom: 36),
                child: _buildPulsingDots(isDark),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 🏛️ Builds the Golden-Emerald Emblem (Image 2)
  Widget _buildEmblemLogo(bool isDark) {
    return Container(
      width: 220,
      height: 220,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFD4AF37).withOpacity(0.25),
            blurRadius: 36,
            spreadRadius: 4,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: const Color(0xFF0D482B).withOpacity(0.12),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipOval(
        child: Image.asset(
          'assets/images/emblem_logo.png',
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Image.asset(
              'assets/images/splash_full.png',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _buildFallbackLogo(isDark),
            );
          },
        ),
      ),
    );
  }

  // Fallback vector-styled emblem if image asset fails to load
  Widget _buildFallbackLogo(bool isDark) {
    return Container(
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            Color(0xFFF9F6ED),
            Color(0xFFE6D5AC),
            Color(0xFFB8860B),
            Color(0xFF0D482B),
          ],
          stops: [0.6, 0.8, 0.92, 1.0],
        ),
      ),
      child: const Center(
        child: Icon(Icons.eco_rounded, size: 68, color: Color(0xFF0D482B)),
      ),
    );
  }

  // ⚪⚪⚪ 3 Tri-Color Animated Indicator Dots (Saffron, Mint, Emerald)
  Widget _buildPulsingDots(bool isDark) {
    final dotColors = [
      const Color(0xFFE68A00), // Saffron / Gold
      const Color(0xFF6EE7B7), // Mint
      const Color(0xFF0D482B), // Deep Emerald
    ];

    return AnimatedBuilder(
      animation: _dotsAnimController,
      builder: (context, child) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(3, (index) {
            final progress = (_dotsAnimController.value + (index * 0.33)) % 1.0;
            final scale = 0.8 + (0.5 * (1.0 - (progress - 0.5).abs() * 2));
            final opacity = 0.4 + (0.6 * (1.0 - (progress - 0.5).abs() * 2));

            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 5),
              width: 8 * scale,
              height: 8 * scale,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: dotColors[index].withOpacity(opacity.clamp(0.2, 1.0)),
                boxShadow: [
                  BoxShadow(
                    color: dotColors[index].withOpacity(0.4),
                    blurRadius: 6 * scale,
                    spreadRadius: 1,
                  ),
                ],
              ),
            );
          }),
        );
      },
    );
  }

  // Timeout Fallback Card if initialization exceeds 4.5s
  Widget _buildTimeoutCard(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 32),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.wifi_off_rounded, size: 16, color: Color(0xFFF59E0B)),
              SizedBox(width: 6),
              Flexible(
                child: Text(
                  'Connection is taking longer than expected.',
                  style: TextStyle(
                    fontSize: 11,
                    color: Color(0xFF1E293B),
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _retryInit,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF334155),
                    side: const BorderSide(color: Color(0xFFCBD5E1)),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Retry', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton(
                  onPressed: _continueOffline,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: GovdTheme.emeraldDark,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Continue Offline', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
