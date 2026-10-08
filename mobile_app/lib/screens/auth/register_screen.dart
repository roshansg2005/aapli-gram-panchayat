import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../../widgets/location_selector_widget.dart';
import 'login_screen.dart';
import '../home/main_navigation.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  // Step controller: 0 = Basic Details, 1 = Personal Details, 2 = Address, 3 = Review & Submit
  int _currentStep = 0;

  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _dobController = TextEditingController();
  final _aadhaarController = TextEditingController();
  final _emailController = TextEditingController();
  final _houseNoController = TextEditingController();
  final _addressController = TextEditingController();
  final _otpController = TextEditingController();

  // 6 Individual OTP controllers & focus nodes for clean PIN verification
  final List<TextEditingController> _otpDigitControllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(6, (_) => FocusNode());

  String _selectedDistrict = 'अहिल्यानगर';
  String _selectedTaluka = 'संगमनेर';
  String _selectedGramPanchayat = 'घुलेवाडी';
  String _selectedWard = 'Ward 1 (गणपती चौक व मुख्य रस्ता)';

  bool _isMobileVerified = false;
  bool _showOtpField = false;
  bool _isAadhaarMasked = true;
  String? _errorMessage;
  String? _otpSuccessMsg;
  bool _isSubmitting = false;

  // 📱 Duplicate / Similar Phone Prevention
  bool _isPhoneAlreadyRegistered = false;
  bool _isCheckingPhone = false;
  String? _duplicatePhoneMessage;
  Timer? _phoneDebounceTimer;

  // Resend OTP timer
  int _resendCountdown = 30;
  Timer? _countdownTimer;
  bool _canResend = false;

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _phoneDebounceTimer?.cancel();
    _nameController.dispose();
    _phoneController.dispose();
    _dobController.dispose();
    _aadhaarController.dispose();
    _emailController.dispose();
    _houseNoController.dispose();
    _addressController.dispose();
    _otpController.dispose();
    for (final c in _otpDigitControllers) {
      c.dispose();
    }
    for (final f in _otpFocusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  void _checkPhoneDuplicate(String phone) {
    _phoneDebounceTimer?.cancel();
    final cleanPhone = phone.trim().replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.length < 10) {
      if (_isPhoneAlreadyRegistered) {
        setState(() {
          _isPhoneAlreadyRegistered = false;
          _duplicatePhoneMessage = null;
        });
      }
      return;
    }

    setState(() => _isCheckingPhone = true);
    _phoneDebounceTimer = Timer(const Duration(milliseconds: 300), () async {
      final app = context.read<AppProvider>();
      final res = await app.checkPhoneRegistered(cleanPhone);
      if (!mounted) return;

      setState(() {
        _isCheckingPhone = false;
        _isPhoneAlreadyRegistered = res['alreadyRegistered'] == true || res['exists'] == true;
        _duplicatePhoneMessage = _isPhoneAlreadyRegistered
            ? (app.language == 'mr'
                ? 'हा मोबाईल क्रमांक आधीच नोंदणीकृत आहे. कृपया थेट लॉगिन करा.'
                : 'This mobile number is already registered. Please login directly.')
            : null;
      });
    });
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





  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 20, 1, 1),
      firstDate: DateTime(1920),
      lastDate: now,
      builder: (context, child) {
        final isDark = context.read<AppProvider>().isDarkMode;
        return Theme(
          data: isDark ? AppTheme.darkTheme : AppTheme.lightTheme,
          child: child!,
        );
      },
    );
    if (picked != null) {
      final formatted = "${picked.year.toString().padLeft(4, '0')}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
      setState(() {
        _dobController.text = formatted;
      });
    }
  }

  void _handleSendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length < 10) {
      setState(() => _errorMessage = 'कृपया वैध १०-अंकी मोबाईल क्रमांक टाका.');
      return;
    }

    setState(() {
      _errorMessage = null;
      _otpSuccessMsg = null;
    });

    final app = context.read<AppProvider>();

    // 📱 Check duplicate / similar phone registration
    final check = await app.checkPhoneRegistered(phone);
    if (check['alreadyRegistered'] == true || check['exists'] == true) {
      setState(() {
        _isPhoneAlreadyRegistered = true;
        _errorMessage = app.language == 'mr'
            ? 'हा मोबाईल क्रमांक आधीच नोंदणीकृत आहे. कृपया थेट लॉगिन करा.'
            : 'This mobile number is already registered. Please login directly.';
      });
      return;
    }

    await app.sendOtp(phone);

    setState(() {
      _isPhoneAlreadyRegistered = false;
      _showOtpField = true;
      _otpController.text = '';
      _syncOtpToDigits('');
      _otpSuccessMsg = app.language == 'mr'
          ? 'सुरक्षित ६-अंकी OTP SMS आपल्या मोबाईल क्रमांकावर पाठवला आहे.'
          : 'Secure 6-digit OTP SMS sent to your registered mobile number.';
    });

    _startResendTimer();

    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted && _otpFocusNodes.isNotEmpty) {
        _otpFocusNodes[0].requestFocus();
      }
    });
  }

  void _handleVerifyOtp() async {
    final phone = _phoneController.text.trim();
    final enteredOtp = _getOtpFromDigits().isNotEmpty ? _getOtpFromDigits() : _otpController.text.trim();
    if (enteredOtp.length == 6) {
      final app = context.read<AppProvider>();
      final res = await app.verifyOtp(phone, enteredOtp);
      if (res['success'] == true) {
        setState(() {
          _isMobileVerified = true;
          _showOtpField = false;
          _errorMessage = null;
          _otpSuccessMsg = null;
        });
        // Move to step 2 after OTP verification
        _nextStep();
      } else {
        setState(() {
          _errorMessage = res['message'] ?? (app.language == 'mr' ? 'चुकीचा OTP टाकला आहे. कृपया पुन्हा तपासा.' : 'Invalid OTP entered. Please try again.');
        });
      }
    } else {
      setState(() {
        _errorMessage = 'कृपया ६-अंकी OTP प्रविष्ट करा.';
      });
    }
  }

  void _nextStep() {
    setState(() => _errorMessage = null);

    // Validate current step
    if (_currentStep == 0) {
      if (_nameController.text.trim().isEmpty) {
        setState(() => _errorMessage = 'कृपया आपले पूर्ण नाव प्रविष्ट करा.');
        return;
      }
      if (_phoneController.text.trim().length < 10) {
        setState(() => _errorMessage = 'कृपया वैध १०-अंकी मोबाईल क्रमांक प्रविष्ट करा.');
        return;
      }
      if (_isPhoneAlreadyRegistered) {
        setState(() => _errorMessage = 'हा मोबाईल क्रमांक आधीच नोंदणीकृत आहे. कृपया थेट लॉगिन करा.');
        return;
      }
      if (!_isMobileVerified) {
        setState(() => _errorMessage = 'कृपया मोबाईल क्रमांकावर आलेला OTP सत्यापित करा.');
        return;
      }
    } else if (_currentStep == 1) {
      // Personal details validation (DOB, Aadhaar)
      final aadhaar = _aadhaarController.text.replaceAll(' ', '').trim();
      if (aadhaar.isNotEmpty && aadhaar.length != 12) {
        setState(() => _errorMessage = 'आधार क्रमांक अचूक १२ अंकी असावा.');
        return;
      }
    } else if (_currentStep == 2) {
      // Address validation
      if (_houseNoController.text.trim().isEmpty) {
        setState(() => _errorMessage = 'कृपया घर / मिळकत क्रमांक प्रविष्ट करा.');
        return;
      }
      if (_addressController.text.trim().isEmpty) {
        setState(() => _errorMessage = 'कृपया रहिवाशी पत्ता / गल्ली प्रविष्ट करा.');
        return;
      }
    }

    if (_currentStep < 3) {
      setState(() => _currentStep++);
    }
  }

  void _prevStep() {
    setState(() {
      _errorMessage = null;
      if (_currentStep > 0) {
        _currentStep--;
      }
    });
  }

  void _handleFinalRegister() async {
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final app = context.read<AppProvider>();
    final data = {
      'name': _nameController.text.trim(),
      'phone': _phoneController.text.trim(),
      'dob': _dobController.text.trim().isNotEmpty ? _dobController.text.trim() : null,
      'aadhaar': _aadhaarController.text.replaceAll(' ', '').trim().isNotEmpty
          ? _aadhaarController.text.replaceAll(' ', '').trim()
          : null,
      'email': _emailController.text.trim().isNotEmpty ? _emailController.text.trim() : null,
      'state': 'Maharashtra',
      'district': _selectedDistrict,
      'taluka': _selectedTaluka,
      'gramPanchayat': _selectedGramPanchayat,
      'wardNo': _selectedWard,
      'houseNo': _houseNoController.text.trim(),
      'address': _addressController.text.trim(),
      'otp': _otpController.text.trim(),
    };

    final res = await app.registerCitizen(data);
    setState(() => _isSubmitting = false);

    if (res['success'] == true && mounted) {
      _showRegistrationSuccessDialog(app);
    } else if (res['alreadyRegistered'] == true && mounted) {
      setState(() {
        _isPhoneAlreadyRegistered = true;
        _currentStep = 0;
        _errorMessage = res['message'] ?? 'हा मोबाईल क्रमांक आधीच नोंदणीकृत आहे. कृपया थेट लॉगिन करा.';
      });
    } else if (mounted) {
      setState(() => _errorMessage = res['message'] ?? 'नोंदणी अयशस्वी. कृपया सर्व तपशील तपासा.');
    }
  }

  void _showRegistrationSuccessDialog(AppProvider app) {
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';
    final citizenId = app.currentUser?.id.isNotEmpty == true
        ? app.currentUser!.id
        : 'CIT-${DateTime.now().year}-${_phoneController.text.substring(_phoneController.text.length >= 4 ? _phoneController.text.length - 4 : 0)}';

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: isDark ? const Color(0xFF131C2E) : Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          contentPadding: const EdgeInsets.all(24),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppTheme.successGreen.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded, color: AppTheme.successGreen, size: 40),
              ),
              const SizedBox(height: 16),
              Text(
                isMr ? 'नागरिक नोंदणी यशस्वी!' : 'Registration Successful!',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                isMr
                    ? 'आपले डिजिटल ग्रामपंचायत नागरिक प्रोफाईल तयार झाले आहे.'
                    : 'Your Digital Gram Panchayat citizen profile has been created.',
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      isMr ? 'आपला नागरिक आयडी (Citizen ID)' : 'Your Citizen ID',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      citizenId,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primaryOrange,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx); // close dialog
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
                      (route) => false,
                    );
                  },
                  icon: const Icon(Icons.home_rounded, size: 18),
                  label: Text(
                    isMr ? 'मुख्य पानावर जा (Go to Home)' : 'Go to Home',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryOrange,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _getMaskedAadhaar(String? aadhaar) {
    if (aadhaar == null || aadhaar.isEmpty) return 'नोंदवलेले नाही (Not Provided)';
    final clean = aadhaar.replaceAll(RegExp(r'\s+'), '');
    if (clean.length >= 4) {
      return 'XXXX-XXXX-${clean.substring(clean.length - 4)}';
    }
    return 'XXXX-XXXX-XXXX';
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';

    final bgColor = isDark ? const Color(0xFF0B1120) : const Color(0xFFF1F5F9);
    final cardBgColor = isDark ? const Color(0xFF172235) : Colors.white;
    final cardBorderColor = isDark ? const Color(0xFF1E2D4A) : const Color(0xFFE2E8F0);
    final titleTextColor = isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A);
    final subTextColor = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text(
          isMr ? 'नवीन नागरिक नोंदणी' : 'New Citizen Registration',
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
        ),
        backgroundColor: isDark ? const Color(0xFF0B1120) : AppTheme.govNavy,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: Colors.white),
          onPressed: () {
            if (_currentStep > 0) {
              _prevStep();
            } else {
              Navigator.of(context).pop();
            }
          },
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. 4-Step Progress Indicator
            _buildStepIndicator(isDark, isMr),
            const SizedBox(height: 16),

            // 2. Error Banner if any
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
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.dangerRed),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 3. Step Content
            if (_currentStep == 0)
              _buildStep1BasicDetails(isDark, isMr, cardBgColor, cardBorderColor, titleTextColor, subTextColor),
            if (_currentStep == 1)
              _buildStep2PersonalDetails(isDark, isMr, cardBgColor, cardBorderColor, titleTextColor, subTextColor),
            if (_currentStep == 2)
              _buildStep3Address(isDark, isMr, cardBgColor, cardBorderColor, titleTextColor, subTextColor),
            if (_currentStep == 3)
              _buildStep4Review(isDark, isMr, cardBgColor, cardBorderColor, titleTextColor, subTextColor),

            const SizedBox(height: 24),

            // 4. Action Buttons (Next / Back / Submit)
            _buildNavigationButtons(isDark, isMr),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // PROGRESS INDICATOR (4 STEPS)
  // ==========================================
  Widget _buildStepIndicator(bool isDark, bool isMr) {
    final steps = isMr
        ? ['१. मूलभूत माहिती', '२. वैयक्तिक', '३. पत्ता व प्रभाग', '४. पडताळणी']
        : ['1. Basic', '2. Personal', '3. Address', '4. Review'];

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF131C2E) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? const Color(0xFF1E2D4A) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Row(
            children: List.generate(4, (index) {
              final isCompleted = _currentStep > index;
              final isCurrent = _currentStep == index;
              return Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: isCompleted
                                  ? AppTheme.successGreen
                                  : (isCurrent ? AppTheme.primaryOrange : (isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0))),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isCurrent ? AppTheme.primaryOrange : Colors.transparent,
                                width: 2,
                              ),
                            ),
                            child: Center(
                              child: isCompleted
                                  ? const Icon(Icons.check, color: Colors.white, size: 16)
                                  : Text(
                                      '${index + 1}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: (isCurrent || isCompleted)
                                            ? Colors.white
                                            : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                                      ),
                                    ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            steps[index],
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
                              color: isCurrent
                                  ? AppTheme.primaryOrange
                                  : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                    if (index < 3)
                      Container(
                        width: 12,
                        height: 2,
                        margin: const EdgeInsets.only(bottom: 16),
                        color: _currentStep > index
                            ? AppTheme.successGreen
                            : (isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
                      ),
                  ],
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 1: BASIC DETAILS & OTP
  // ==========================================
  Widget _buildStep1BasicDetails(
    bool isDark,
    bool isMr,
    Color cardBgColor,
    Color cardBorderColor,
    Color titleTextColor,
    Color subTextColor,
  ) {
    final isPhoneValid = _phoneController.text.trim().length == 10;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primaryOrange.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.person_outline_rounded, color: AppTheme.primaryOrange, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isMr ? 'टप्पा १ — मूलभूत माहिती' : 'Step 1 — Basic Details',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: titleTextColor),
                    ),
                    Text(
                      isMr ? 'आपले नाव व मोबाईल क्रमांक OTP द्वारे सत्यापित करा' : 'Verify your name and mobile number via OTP',
                      style: TextStyle(fontSize: 11, color: subTextColor),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Full Name
          _buildFieldLabel(isMr ? 'पूर्ण नाव (इंग्रजीत / मराठीत) *' : 'Full Name *', isDark),
          const SizedBox(height: 6),
          TextField(
            controller: _nameController,
            style: TextStyle(fontSize: 14, color: isDark ? Colors.white : const Color(0xFF0F172A)),
            decoration: InputDecoration(
              hintText: isMr ? 'उदा. राहुल नामदेव पाटील' : 'e.g. Rahul Namdeo Patil',
              prefixIcon: const Icon(Icons.badge_outlined, size: 20, color: AppTheme.primaryOrange),
            ),
          ),
          const SizedBox(height: 16),

          // Mobile Number
          _buildFieldLabel(isMr ? '१०-अंकी मोबाईल क्रमांक *' : '10-Digit Mobile Number *', isDark),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  enabled: !_isMobileVerified,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  onChanged: (v) {
                    _checkPhoneDuplicate(v);
                    setState(() {});
                  },
                  style: TextStyle(fontSize: 14, color: isDark ? Colors.white : const Color(0xFF0F172A), letterSpacing: 1),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.phone_android_rounded, size: 20, color: AppTheme.primaryOrange),
                    prefixText: '+91  ',
                    prefixStyle: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                    hintText: '98XXXXXXXX',
                    suffixIcon: _isMobileVerified
                        ? const Icon(Icons.verified_rounded, color: AppTheme.successGreen, size: 22)
                        : _isCheckingPhone
                            ? const Padding(
                                padding: EdgeInsets.all(12),
                                child: SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryOrange),
                                ),
                              )
                            : null,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              if (!_isMobileVerified)
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: (isPhoneValid && !_isPhoneAlreadyRegistered && !_isCheckingPhone) ? _handleSendOtp : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: (isPhoneValid && !_isPhoneAlreadyRegistered && !_isCheckingPhone)
                          ? AppTheme.primaryOrange
                          : (isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: _isCheckingPhone
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text(
                            isMr ? 'Get OTP' : 'Get OTP',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
            ],
          ),

          // ⚠️ Duplicate / Similar Mobile Number Registered Warning Box
          if (_isPhoneAlreadyRegistered) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red.withOpacity(0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          isMr ? 'हा मोबाईल क्रमांक आधीच नोंदणीकृत आहे!' : 'Mobile Number Already Registered!',
                          style: const TextStyle(
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _duplicatePhoneMessage ??
                        (isMr
                            ? 'या मोबाईल क्रमांकावर आधीच खाते नोंदणीकृत आहे. एका क्रमांकावर एकच खाते करता येते. कृपया थेट लॉगिन करा.'
                            : 'An account is already linked with this mobile number. Duplicate registration is not permitted. Please login directly.'),
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white70 : const Color(0xFF475569),
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    height: 38,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      },
                      icon: const Icon(Icons.login_rounded, size: 16),
                      label: Text(
                        isMr ? 'येथे थेट लॉगिन करा (Login to Existing Account) →' : 'Login to Existing Account →',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E293B),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          if (_isMobileVerified) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.successGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppTheme.successGreen.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: AppTheme.successGreen, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    isMr ? 'मोबाईल क्रमांक यशस्वीरित्या सत्यापित झाला!' : 'Mobile number successfully verified!',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.successGreen),
                  ),
                ],
              ),
            ),
          ],

          // OTP input boxes if OTP sent
          if (_showOtpField && !_isMobileVerified) ...[
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.primaryOrange.withOpacity(0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        isMr ? '६-अंकी OTP टाका *' : 'Enter 6-Digit OTP *',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: titleTextColor),
                      ),
                      if (_otpSuccessMsg != null)
                        Text(
                          isMr ? 'OTP पाठवला' : 'OTP Sent',
                          style: const TextStyle(fontSize: 11, color: AppTheme.successGreen, fontWeight: FontWeight.bold),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // 6 PIN boxes
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(6, (index) {
                      return SizedBox(
                        width: 42,
                        height: 48,
                        child: TextField(
                          controller: _otpDigitControllers[index],
                          focusNode: _otpFocusNodes[index],
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            LengthLimitingTextInputFormatter(1),
                          ],
                          decoration: InputDecoration(
                            contentPadding: EdgeInsets.zero,
                            filled: true,
                            fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: AppTheme.primaryOrange, width: 2),
                            ),
                          ),
                          onChanged: (val) {
                            if (val.isNotEmpty && index < 5) {
                              _otpFocusNodes[index + 1].requestFocus();
                            } else if (val.isEmpty && index > 0) {
                              _otpFocusNodes[index - 1].requestFocus();
                            }
                            if (_getOtpFromDigits().length == 6) {
                              _handleVerifyOtp();
                            }
                          },
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _canResend
                            ? (isMr ? 'OTP मिळाला नाही?' : "Didn't receive OTP?")
                            : (isMr ? 'पुन्हा OTP पाठवा ($_resendCountdown s)' : 'Resend OTP ($_resendCountdown s)'),
                        style: TextStyle(fontSize: 11, color: subTextColor),
                      ),
                      if (_canResend)
                        TextButton(
                          onPressed: _handleSendOtp,
                          style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(50, 30)),
                          child: Text(
                            isMr ? 'पुन्हा पाठवा (Resend)' : 'Resend',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton.icon(
                      onPressed: _handleVerifyOtp,
                      icon: const Icon(Icons.check_circle_outline, size: 18),
                      label: Text(
                        isMr ? 'OTP सत्यापित करा (Verify OTP)' : 'Verify OTP',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryOrange,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ==========================================
  // STEP 2: PERSONAL DETAILS (DOB, AADHAAR, EMAIL)
  // ==========================================
  Widget _buildStep2PersonalDetails(
    bool isDark,
    bool isMr,
    Color cardBgColor,
    Color cardBorderColor,
    Color titleTextColor,
    Color subTextColor,
  ) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.govBlue.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.security_rounded, color: AppTheme.govBlue, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isMr ? 'टप्पा २ — वैयक्तिक तपशील' : 'Step 2 — Personal Details',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: titleTextColor),
                    ),
                    Text(
                      isMr ? 'जन्मदिनांक व आधार क्रमांक (सुरक्षित व गोपनीय)' : 'Date of Birth & Masked Aadhaar details',
                      style: TextStyle(fontSize: 11, color: subTextColor),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Date of Birth
          _buildFieldLabel(isMr ? 'जन्मदिनांक (Date of Birth)' : 'Date of Birth', isDark),
          const SizedBox(height: 6),
          InkWell(
            onTap: _pickDate,
            borderRadius: BorderRadius.circular(12),
            child: IgnorePointer(
              child: TextField(
                controller: _dobController,
                style: TextStyle(fontSize: 14, color: isDark ? Colors.white : const Color(0xFF0F172A)),
                decoration: InputDecoration(
                  hintText: isMr ? 'YYYY-MM-DD (निवडण्यासाठी टॅप करा)' : 'YYYY-MM-DD (Tap to select)',
                  prefixIcon: const Icon(Icons.calendar_today_rounded, size: 20, color: AppTheme.govBlue),
                  suffixIcon: const Icon(Icons.arrow_drop_down_rounded, size: 24),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Aadhaar Number (Masked input)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildFieldLabel(isMr ? 'आधार क्रमांक (१२ अंक)' : 'Aadhaar Number (12 Digits)', isDark),
              GestureDetector(
                onTap: () => setState(() => _isAadhaarMasked = !_isAadhaarMasked),
                child: Row(
                  children: [
                    Icon(
                      _isAadhaarMasked ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                      size: 16,
                      color: subTextColor,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _isAadhaarMasked ? (isMr ? 'दाखवा' : 'Show') : (isMr ? 'लपवा' : 'Hide'),
                      style: TextStyle(fontSize: 11, color: subTextColor, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _aadhaarController,
            keyboardType: TextInputType.number,
            obscureText: _isAadhaarMasked,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(12),
            ],
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
              letterSpacing: 2,
            ),
            decoration: InputDecoration(
              hintText: 'XXXXXXXX1234',
              prefixIcon: const Icon(Icons.credit_card_rounded, size: 20, color: AppTheme.govBlue),
              helperText: isMr
                  ? '🔒 आधार क्रमांक संपूर्णपणे सुरक्षित व एनक्रिप्टेड राहील.'
                  : '🔒 Aadhaar number is masked and securely encrypted.',
              helperStyle: TextStyle(fontSize: 10, color: subTextColor),
            ),
          ),
          const SizedBox(height: 16),

          // Email (Optional)
          _buildFieldLabel(isMr ? 'ईमेल पत्ता (ऐच्छिक / Optional)' : 'Email Address (Optional)', isDark),
          const SizedBox(height: 6),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            style: TextStyle(fontSize: 14, color: isDark ? Colors.white : const Color(0xFF0F172A)),
            decoration: InputDecoration(
              hintText: 'citizen@example.com',
              prefixIcon: const Icon(Icons.email_outlined, size: 20, color: AppTheme.govBlue),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 3: ADDRESS & JURISDICTION
  // ==========================================
  Widget _buildStep3Address(
    bool isDark,
    bool isMr,
    Color cardBgColor,
    Color cardBorderColor,
    Color titleTextColor,
    Color subTextColor,
  ) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.successGreen.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.location_city_rounded, color: AppTheme.successGreen, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isMr ? 'टप्पा ३ — पत्ता व प्रभाग' : 'Step 3 — Address & Ward',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: titleTextColor),
                    ),
                    Text(
                      isMr ? 'ग्रामपंचायत कार्यक्षेत्र व घर क्रमांक निवडा' : 'Select Gram Panchayat jurisdiction and house no',
                      style: TextStyle(fontSize: 11, color: subTextColor),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          const SizedBox(height: 14),

          // LGD Live 28,097 Panchayat Search & Location Selector
          LocationSelectorWidget(
            initialDistrict: _selectedDistrict,
            initialTaluka: _selectedTaluka,
            initialGramPanchayat: _selectedGramPanchayat,
            initialWard: _selectedWard,
            showWard: true,
            isDark: isDark,
            onChanged: (locData) {
              setState(() {
                _selectedDistrict = locData.district;
                _selectedTaluka = locData.taluka;
                _selectedGramPanchayat = locData.gramPanchayat;
                _selectedWard = locData.ward;
              });
            },
          ),
          const SizedBox(height: 14),

          // House Number
          _buildFieldLabel(isMr ? 'घर / मिळकत क्रमांक (House / Property No.) *' : 'House / Property Number *', isDark),
          const SizedBox(height: 6),
          TextField(
            controller: _houseNoController,
            style: TextStyle(fontSize: 14, color: isDark ? Colors.white : const Color(0xFF0F172A)),
            decoration: InputDecoration(
              hintText: isMr ? 'उदा. घर क्र. १२४/अ' : 'e.g. House No. 124/A',
              prefixIcon: const Icon(Icons.home_outlined, size: 20, color: AppTheme.successGreen),
            ),
          ),
          const SizedBox(height: 14),

          // Full Address
          _buildFieldLabel(isMr ? 'रहिवासी पत्ता / गल्ली / परिसर *' : 'Residential Address / Street *', isDark),
          const SizedBox(height: 6),
          TextField(
            controller: _addressController,
            maxLines: 2,
            style: TextStyle(fontSize: 14, color: isDark ? Colors.white : const Color(0xFF0F172A)),
            decoration: InputDecoration(
              hintText: isMr ? 'उदा. गणपती मंदिरामागे, घुलेवाडी' : 'e.g. Near Ganpati Temple, Ghulewadi',
              prefixIcon: const Padding(
                padding: EdgeInsets.only(bottom: 24),
                child: Icon(Icons.signpost_outlined, size: 20, color: AppTheme.successGreen),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 4: REVIEW & CONFIRM
  // ==========================================
  Widget _buildStep4Review(
    bool isDark,
    bool isMr,
    Color cardBgColor,
    Color cardBorderColor,
    Color titleTextColor,
    Color subTextColor,
  ) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primaryOrange.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.fact_check_rounded, color: AppTheme.primaryOrange, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isMr ? 'टप्पा ४ — कृपया आपले तपशील तपासा' : 'Step 4 — Please Verify Your Details',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: titleTextColor),
                    ),
                    Text(
                      isMr ? 'नोंदणी अंतिम करण्यापूर्वी माहिती अचूक असल्याची खात्री करा' : 'Review and confirm your citizen registration',
                      style: TextStyle(fontSize: 11, color: subTextColor),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Summary Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF111827) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                _buildReviewRow(isMr ? 'पूर्ण नाव' : 'Full Name', _nameController.text.trim(), isDark),
                _buildReviewDivider(isDark),
                _buildReviewRow(isMr ? 'मोबाईल क्रमांक' : 'Mobile Number', '+91 ${_phoneController.text.trim()}', isDark),
                _buildReviewDivider(isDark),
                _buildReviewRow(
                  isMr ? 'जन्मदिनांक' : 'Date of Birth',
                  _dobController.text.trim().isNotEmpty ? _dobController.text.trim() : (isMr ? 'नोंदवले नाही' : 'Not Provided'),
                  isDark,
                ),
                _buildReviewDivider(isDark),
                _buildReviewRow(
                  isMr ? 'आधार क्रमांक' : 'Aadhaar (Masked)',
                  _getMaskedAadhaar(_aadhaarController.text.trim()),
                  isDark,
                ),
                _buildReviewDivider(isDark),
                _buildReviewRow(
                  isMr ? 'जिल्हा व तालुका' : 'District & Taluka',
                  '$_selectedDistrict, $_selectedTaluka',
                  isDark,
                ),
                _buildReviewDivider(isDark),
                _buildReviewRow(
                  isMr ? 'ग्रामपंचायत' : 'Gram Panchayat',
                  'ग्रामपंचायत $_selectedGramPanchayat',
                  isDark,
                ),
                _buildReviewDivider(isDark),
                _buildReviewRow(isMr ? 'प्रभाग / वॉर्ड' : 'Ward No', _selectedWard, isDark),
                _buildReviewDivider(isDark),
                _buildReviewRow(
                  isMr ? 'घर क्र. व पत्ता' : 'Address',
                  '${_houseNoController.text.trim()}, ${_addressController.text.trim()}',
                  isDark,
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Privacy note
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.verified_user_outlined, color: AppTheme.successGreen, size: 16),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isMr
                      ? 'आपली माहिती महाराष्ट्र ग्रामपंचायत अधिनियम अंतर्गत सुरक्षित असून केवळ अधिकृत सेवांसाठी वापरली जाईल.'
                      : 'Your information is secured under Maharashtra Gram Panchayat rules and used solely for civic services.',
                  style: TextStyle(fontSize: 10, color: subTextColor),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // NAVIGATION BUTTONS (NEXT / BACK / CONFIRM)
  // ==========================================
  Widget _buildNavigationButtons(bool isDark, bool isMr) {
    return Row(
      children: [
        if (_currentStep > 0) ...[
          Expanded(
            flex: 1,
            child: SizedBox(
              height: 48,
              child: OutlinedButton.icon(
                onPressed: _isSubmitting ? null : _prevStep,
                icon: const Icon(Icons.arrow_back_rounded, size: 16),
                label: Text(
                  isMr ? 'मागे (Back)' : 'Back',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: isDark ? Colors.white70 : const Color(0xFF0F172A),
                  side: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
        ],
        Expanded(
          flex: 2,
          child: SizedBox(
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _isSubmitting
                  ? null
                  : (_currentStep == 3 ? _handleFinalRegister : _nextStep),
              icon: _isSubmitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : Icon(
                      _currentStep == 3 ? Icons.check_circle_rounded : Icons.arrow_forward_rounded,
                      size: 18,
                    ),
              label: Text(
                _isSubmitting
                    ? (isMr ? 'नोंदणी होत आहे...' : 'Registering...')
                    : (_currentStep == 3
                        ? (isMr ? 'Confirm & Complete' : 'Confirm & Complete')
                        : (isMr ? 'पुढे जा (Next)' : 'Next Step')),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryOrange,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 1,
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ==========================================
  // HELPER WIDGETS
  // ==========================================
  Widget _buildFieldLabel(String label, bool isDark) {
    return Text(
      label,
      style: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w700,
        color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF334155),
      ),
    );
  }



  Widget _buildReviewRow(String label, String value, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 110,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewDivider(bool isDark) {
    return Divider(
      height: 14,
      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
    );
  }
}
