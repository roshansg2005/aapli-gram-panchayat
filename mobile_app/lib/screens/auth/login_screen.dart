import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import 'register_screen.dart';
import '../home/main_navigation.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _phoneController = TextEditingController(text: '9325637446');
  final _otpController = TextEditingController();

  // 6 Individual OTP controllers & focus nodes for 2026 PIN UI
  final List<TextEditingController> _otpDigitControllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(6, (_) => FocusNode());

  bool _otpSent = false;
  String? _errorMessage;
  String? _successBanner;

  // Resend OTP countdown timer
  int _resendCountdown = 30;
  Timer? _countdownTimer;
  bool _canResend = false;

  late AnimationController _animController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fadeAnimation = CurvedAnimation(parent: _animController, curve: Curves.easeInOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _animController.dispose();
    _phoneController.dispose();
    _otpController.dispose();
    for (final c in _otpDigitControllers) {
      c.dispose();
    }
    for (final f in _otpFocusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  void _syncOtpToDigits(String otp) {
    for (int i = 0; i < 6; i++) {
      if (i < otp.length) {
        _otpDigitControllers[i].text = otp[i];
      } else {
        _otpDigitControllers[i].text = '';
      }
    }
  }

  String _getOtpFromDigits() {
    return _otpDigitControllers.map((c) => c.text.trim()).join();
  }

  void _startResendTimer() {
    _countdownTimer?.cancel();
    setState(() {
      _resendCountdown = 30;
      _canResend = false;
    });
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_resendCountdown > 1) {
        setState(() => _resendCountdown--);
      } else {
        timer.cancel();
        setState(() {
          _resendCountdown = 0;
          _canResend = true;
        });
      }
    });
  }

  void _handleSendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length < 10) {
      setState(() {
        _errorMessage = 'कृपया वैध १०-अंकी मोबाईल क्रमांक प्रविष्ट करा.';
      });
      return;
    }

    setState(() {
      _errorMessage = null;
      _successBanner = null;
    });

    final app = context.read<AppProvider>();
    await app.sendOtp(phone);

    setState(() {
      _otpSent = true;
      _otpController.text = '';
      _syncOtpToDigits('');
      _successBanner = app.language == 'mr'
          ? 'सुरक्षित ६-अंकी OTP SMS आपल्या मोबाईल क्रमांकावर पाठवला आहे.'
          : 'Secure 6-digit OTP SMS sent to your registered mobile number.';
    });

    _startResendTimer();
    _animController.reset();
    _animController.forward();

    // Auto focus first OTP field
    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted && _otpFocusNodes.isNotEmpty) {
        _otpFocusNodes[0].requestFocus();
      }
    });
  }

  void _handleLogin() async {
    final phone = _phoneController.text.trim();
    final otp = _getOtpFromDigits().isNotEmpty ? _getOtpFromDigits() : _otpController.text.trim();

    if (phone.length < 10) {
      setState(() => _errorMessage = 'कृपया वैध १०-अंकी मोबाईल क्रमांक प्रविष्ट करा.');
      return;
    }
    if (otp.length < 6) {
      setState(() => _errorMessage = 'कृपया ६-अंकी OTP प्रविष्ट करा.');
      return;
    }

    setState(() {
      _errorMessage = null;
    });

    final app = context.read<AppProvider>();
    final success = await app.login(phone, otp);

    if (success && mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
        (route) => false,
      );
    } else if (!success && mounted) {
      setState(() {
        _errorMessage = app.language == 'mr'
            ? 'लॉगिन अयशस्वी. कृपया प्रविष्ट केलेला OTP तपासा.'
            : 'Login failed. Please verify your OTP and try again.';
      });
    }
  }

  String _getMaskedPhone(String phone) {
    if (phone.length < 10) return phone;
    return '+91 ******${phone.substring(phone.length - 4)}';
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';

    final bgColor = isDark ? const Color(0xFF0B0F19) : const Color(0xFFF1F5F9);
    final cardBgColor = isDark ? const Color(0xFF131C2E) : Colors.white;
    final cardBorderColor = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
    final titleTextColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subTextColor = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final inputBgColor = isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC);
    final inputBorderColor = isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isNarrow = constraints.maxWidth < 360;
            return SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: isNarrow ? 12 : 20, vertical: 14),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight - 28),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // 1. Compact Modern Header
                        _buildHeader(app, isDark, isMr),
                        const SizedBox(height: 18),

                        // 2. Main Login Card
                        Container(
                          padding: EdgeInsets.all(isNarrow ? 14 : 20),
                          decoration: BoxDecoration(
                            color: cardBgColor,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(color: cardBorderColor, width: 1.2),
                            boxShadow: isDark
                                ? []
                                : [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.04),
                                      blurRadius: 16,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Greeting & Title
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryOrange.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      isMr ? 'स्वागत आहे 👋' : 'Welcome 👋',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: AppTheme.primaryOrange,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                isMr ? 'नागरिक सुरक्षित लॉगिन' : 'Citizen Secure Login',
                                style: TextStyle(
                                  fontSize: 19,
                                  fontWeight: FontWeight.w800,
                                  color: titleTextColor,
                                  letterSpacing: -0.2,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                isMr
                                    ? 'आपल्या १०-अंकी मोबाईल क्रमांकावर सुरक्षित SMS OTP मिळवून लॉगिन करा.'
                                    : 'Enter your 10-digit mobile number to log in via SMS OTP.',
                                style: TextStyle(fontSize: 11.5, color: subTextColor, height: 1.3),
                              ),
                              const SizedBox(height: 18),

                              // Feedback Banners
                              if (_errorMessage != null) ...[
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF3B1219) : AppTheme.dangerRedLight,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppTheme.dangerRed.withOpacity(0.4)),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.error_outline_rounded, color: AppTheme.dangerRed, size: 18),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          _errorMessage!,
                                          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppTheme.dangerRed),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 14),
                              ],

                              if (_successBanner != null && _otpSent) ...[
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF0D2818) : AppTheme.successGreenLight,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppTheme.successGreen.withOpacity(0.4)),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.check_circle_outline_rounded, color: AppTheme.successGreen, size: 18),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          _successBanner!,
                                          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppTheme.successGreen),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 14),
                              ],

                              // Animated Step Switcher: Step 1 (Phone) vs Step 2 (OTP)
                              FadeTransition(
                                opacity: _fadeAnimation,
                                child: !_otpSent
                                    ? _buildStep1MobileInput(app, isDark, isMr, titleTextColor, subTextColor, inputBgColor, inputBorderColor)
                                    : _buildStep2OtpInput(app, isDark, isMr, titleTextColor, subTextColor, inputBgColor, inputBorderColor),
                              ),

                              const SizedBox(height: 18),

                              // Registration Link
                              Center(
                                child: Wrap(
                                  alignment: WrapAlignment.center,
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  children: [
                                    Text(
                                      isMr ? 'नवीन नागरिक आहात? ' : 'New to Aapli Gram Panchayat? ',
                                      style: TextStyle(fontSize: 12, color: subTextColor),
                                    ),
                                    InkWell(
                                      onTap: () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(builder: (_) => const RegisterScreen()),
                                        );
                                      },
                                      borderRadius: BorderRadius.circular(6),
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                        child: Text(
                                          isMr ? 'खाते तयार करा →' : 'Create Citizen Account →',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w700,
                                            color: AppTheme.primaryOrange,
                                          ),
                                        ),
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

                    // 3. Trust & Security Footer
                    Padding(
                      padding: const EdgeInsets.only(top: 20, bottom: 6),
                      child: Column(
                        children: [
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.lock_rounded, size: 13, color: AppTheme.primaryOrange),
                                const SizedBox(width: 5),
                                Text(
                                  isMr ? 'सुरक्षित शासकीय OTP प्रमाणीकरण' : 'Secure Government OTP Authentication',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            isMr
                                ? 'आपला मोबाईल नंबर सुरक्षित शासकीय सेवांसाठी वापरला जातो.'
                                : 'Your mobile number is securely used for official services.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 10, color: subTextColor),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '© 2026 आपली ग्रामपंचायत • ग्रामविकास विभाग, महाराष्ट्र शासन',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 9.5, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  // Header Widget
  Widget _buildHeader(AppProvider app, bool isDark, bool isMr) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF131C2E) : AppTheme.govNavy,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFF1E293B),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryOrange.withOpacity(0.35),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Image.asset(
                      'assets/images/emblem_logo.png',
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        decoration: const BoxDecoration(
                          gradient: AppTheme.saffronGradient,
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Icon(Icons.account_balance_rounded, color: Colors.white, size: 22),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        app.tr('appName'),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.1,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        isMr ? 'महाराष्ट्र शासन • ग्रामविकास विभाग' : 'Govt. of Maharashtra • Rural Dev. Dept.',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.75),
                          fontSize: 9.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Language Switcher Pill
          InkWell(
            onTap: () => app.toggleLanguage(),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.2)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.language_rounded, color: AppTheme.saffron, size: 14),
                  const SizedBox(width: 4),
                  Text(
                    isMr ? 'English' : 'मराठी',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // STEP 1: Mobile Number Input Form
  Widget _buildStep1MobileInput(
    AppProvider app,
    bool isDark,
    bool isMr,
    Color titleTextColor,
    Color subTextColor,
    Color inputBgColor,
    Color inputBorderColor,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isMr ? 'मोबाईल क्रमांक (Mobile Number)' : 'Mobile Number',
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w700,
            color: titleTextColor,
          ),
        ),
        const SizedBox(height: 6),

        // Phone Input Box with Indian Flag Prefix
        Container(
          decoration: BoxDecoration(
            color: inputBgColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: inputBorderColor, width: 1.2),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(13),
                    bottomLeft: Radius.circular(13),
                  ),
                  border: Border(
                    right: BorderSide(color: inputBorderColor, width: 1.2),
                  ),
                ),
                child: Row(
                  children: [
                    const Text('🇮🇳', style: TextStyle(fontSize: 16)),
                    const SizedBox(width: 6),
                    Text(
                      '+91',
                      style: TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w800,
                        color: titleTextColor,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                    color: titleTextColor,
                  ),
                  decoration: InputDecoration(
                    hintText: isMr ? '१०-अंकी मोबाईल नंबर टाका' : 'Enter 10-digit number',
                    hintStyle: TextStyle(fontSize: 13, color: subTextColor),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    suffixIcon: _phoneController.text.length == 10
                        ? const Icon(Icons.check_circle_rounded, color: AppTheme.successGreen, size: 20)
                        : null,
                  ),
                  onChanged: (v) {
                    if (v.length == 10) setState(() {});
                  },
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Send OTP Button
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: app.isLoading ? null : _handleSendOtp,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryOrange,
              elevation: 1.5,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: app.isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                  )
                : FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          isMr ? 'OTP पाठवा' : 'Send OTP',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward_rounded, size: 18, color: Colors.white),
                      ],
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  // STEP 2: Verify OTP Form (6 PIN Boxes & Resend Flow)
  Widget _buildStep2OtpInput(
    AppProvider app,
    bool isDark,
    bool isMr,
    Color titleTextColor,
    Color subTextColor,
    Color inputBgColor,
    Color inputBorderColor,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Verified Target Phone Info
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: inputBorderColor),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.phonelink_ring_rounded, size: 18, color: AppTheme.primaryOrange),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isMr ? 'OTP पाठवला आहे' : 'OTP Sent To',
                            style: TextStyle(fontSize: 10, color: subTextColor, fontWeight: FontWeight.w600),
                          ),
                          Text(
                            _getMaskedPhone(_phoneController.text.trim()),
                            style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: titleTextColor),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              TextButton(
                onPressed: () {
                  setState(() {
                    _otpSent = false;
                    _errorMessage = null;
                    _successBanner = null;
                  });
                },
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  isMr ? 'बदला' : 'Change',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.primaryOrange),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        Text(
          isMr ? '६-अंकी OTP प्रविष्ट करा' : 'Enter 6-Digit OTP',
          style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: titleTextColor),
        ),
        const SizedBox(height: 10),

        // 6 Separate OTP Boxes
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(6, (index) {
            return Flexible(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 2.5),
                height: 50,
                child: TextField(
                  controller: _otpDigitControllers[index],
                  focusNode: _otpFocusNodes[index],
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: titleTextColor,
                  ),
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(1),
                  ],
                  decoration: InputDecoration(
                    counterText: '',
                    filled: true,
                    fillColor: inputBgColor,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: inputBorderColor, width: 1.2),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: inputBorderColor, width: 1.2),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.primaryOrange, width: 2),
                    ),
                  ),
                  onChanged: (value) {
                    if (value.isNotEmpty) {
                      if (index < 5) {
                        _otpFocusNodes[index + 1].requestFocus();
                      } else {
                        _otpFocusNodes[index].unfocus();
                      }
                    } else if (value.isEmpty && index > 0) {
                      _otpFocusNodes[index - 1].requestFocus();
                    }
                    setState(() {});
                  },
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 14),

        // Resend Timer Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            InkWell(
              onTap: () {
                setState(() {
                  _otpSent = false;
                  _errorMessage = null;
                });
              },
              child: Text(
                isMr ? '← क्रमांक बदला' : '← Change number',
                style: TextStyle(fontSize: 11.5, color: subTextColor, fontWeight: FontWeight.w600),
              ),
            ),
            _canResend
                ? InkWell(
                    onTap: _handleSendOtp,
                    child: Text(
                      isMr ? 'पुन्हा OTP पाठवा' : 'Resend OTP',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primaryOrange,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  )
                : Text(
                    isMr ? 'पुन्हा पाठवा (${_resendCountdown}s)' : 'Resend in ${_resendCountdown}s',
                    style: TextStyle(fontSize: 11.5, color: subTextColor, fontWeight: FontWeight.w600),
                  ),
          ],
        ),
        const SizedBox(height: 20),

        // Verify & Login Button
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: app.isLoading ? null : _handleLogin,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryOrange,
              elevation: 1.5,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: app.isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                  )
                : FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.verified_user_rounded, size: 18, color: Colors.white),
                        const SizedBox(width: 8),
                        Text(
                          isMr ? 'सत्यापित करा आणि लॉगिन करा' : 'Verify & Login',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
          ),
        ),
      ],
    );
  }
}
