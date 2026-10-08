import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/certificate_model.dart';
import '../models/tax_model.dart';
import '../models/grievance_model.dart';
import '../models/scheme_model.dart';
import '../models/notice_model.dart';
import '../models/project_model.dart';
import '../models/official_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../config/translations.dart';

class UniversalSearchResult {
  final String title;
  final String subtitle;
  final String category;
  final IconData icon;
  final Color color;
  final String actionType;
  final dynamic data;

  UniversalSearchResult({
    required this.title,
    required this.subtitle,
    required this.category,
    required this.icon,
    required this.color,
    required this.actionType,
    this.data,
  });
}

class AppNotificationItem {
  final String id;
  final String title;
  final String message;
  final String timestamp;
  final String category;
  final IconData icon;
  final Color color;
  final bool isUrgent;
  final String? actionRoute;

  AppNotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.category,
    required this.icon,
    required this.color,
    this.isUrgent = false,
    this.actionRoute,
  });
}

class AppProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  UserModel? _currentUser;
  String _language = 'mr'; // 'mr' or 'en'
  bool _isLoading = false;
  bool _isDarkMode = false;
  bool _notificationsEnabled = true;
  List<String> _readNotificationIds = [];

  List<CertificateModel> _certificates = [];
  List<TaxRecordModel> _taxRecords = [];
  List<GrievanceModel> _grievances = [];
  List<GovtSchemeModel> _schemes = [];
  List<NoticeModel> _notices = [];
  List<ProjectModel> _projects = [];
  List<VillageOfficialModel> _officials = [];

  // Getters
  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  String get language => _language;
  bool get isLoading => _isLoading;
  bool get isDarkMode => _isDarkMode;
  bool get notificationsEnabled => _notificationsEnabled;

  List<CertificateModel> get certificates => _certificates;
  List<TaxRecordModel> get taxRecords => _taxRecords;
  List<GrievanceModel> get grievances => _grievances;
  List<GovtSchemeModel> get schemes => _schemes;
  List<NoticeModel> get notices => _notices;
  List<ProjectModel> get projects => _projects;
  List<VillageOfficialModel> get officials => _officials;

  // Translation helper
  String tr(String key) => AppTranslations.get(key, _language);

  bool _isInitialized = false;
  bool _isRestoringSession = true;
  String _startupStatusText = 'ॲप सुरू होत आहे...';

  bool get isInitialized => _isInitialized;
  bool get isRestoringSession => _isRestoringSession;
  String get startupStatusText => _startupStatusText;

  // Initialize from storage (NON-BLOCKING FAST STARTUP)
  Future<void> init() async {
    final authStartTime = DateTime.now();
    debugPrint('[PERF] AUTH START: ${authStartTime.toIso8601String()}');
    _startupStatusText = 'खाते पडताळणी सुरू आहे... (Checking account)';

    try {
      _language = await StorageService.getLanguage();
      _isDarkMode = await StorageService.getDarkMode();
      _notificationsEnabled = await StorageService.getNotificationPermission();
      _readNotificationIds = await StorageService.getReadNotificationIds();
      _currentUser = await StorageService.getUser();
      _isGovdDeskMode = false;
      _isRestoringSession = false;
      _isInitialized = true;

      debugPrint('[PERF] AUTH COMPLETE: +${DateTime.now().difference(authStartTime).inMilliseconds}ms (User: ${_currentUser?.name ?? "Logged Out"})');
      notifyListeners();

      // Trigger background data sync WITHOUT awaiting it so UI renders instantly!
      if (_currentUser != null) {
        refreshAllData();
      } else {
        loadPublicData();
      }
    } catch (e) {
      debugPrint('[PERF] Init error (handled gracefully): $e');
      _isRestoringSession = false;
      _isInitialized = true;
      notifyListeners();
    }
  }

  // 🌓 Toggle Dark Mode
  Future<void> toggleDarkMode() async {
    _isDarkMode = !_isDarkMode;
    await StorageService.saveDarkMode(_isDarkMode);
    notifyListeners();
  }

  // 🔔 Notification Permission Toggle
  Future<void> setNotificationPermission(bool enabled) async {
    _notificationsEnabled = enabled;
    await StorageService.saveNotificationPermission(enabled);
    notifyListeners();
  }

  // 🔔 Notifications List
  List<AppNotificationItem> get notifications {
    final isMr = _language == 'mr';
    return [
      AppNotificationItem(
        id: 'notif-1',
        title: isMr ? 'विशेष प्रजासत्ताक दिन ग्रामसभा सूचना' : 'Special Republic Day Gram Sabha Notice',
        message: isMr
            ? '२६ जानेवारी रोजी सकाळी ९:३० वाजता ग्रामपंचायत सभागृहात विशेष ग्रामसभेचे आयोजन केले आहे.'
            : 'Special Gram Sabha meeting on 26th Jan at 9:30 AM at Gram Panchayat Hall.',
        timestamp: 'आज • 10:30 AM',
        category: 'gram_sabha',
        icon: Icons.campaign_rounded,
        color: const Color(0xFFEF4444),
        isUrgent: true,
        actionRoute: 'notices',
      ),
      AppNotificationItem(
        id: 'notif-2',
        title: isMr ? '१०% कर सवलत योजना (Rebate Alert)' : '10% Advance Tax Rebate Scheme',
        message: isMr
            ? '३१ मार्च पूर्वी घरपट्टी व पाणीपट्टी पूर्ण भरल्यास १०% थेट सवलत मिळवा.'
            : 'Pay full property and water tax before March 31st to avail 10% instant rebate.',
        timestamp: 'काल • 04:15 PM',
        category: 'tax',
        icon: Icons.savings_rounded,
        color: const Color(0xFF10B981),
        isUrgent: false,
        actionRoute: 'taxes',
      ),
      AppNotificationItem(
        id: 'notif-3',
        title: isMr ? 'दाखला अर्ज मंजूर झाला आहे' : 'Certificate Application Approved',
        message: isMr
            ? 'आपला रहिवासी दाखला अर्ज ग्रामसेवकांकडून मंजूर झाला असून डिजिटल स्वाक्षरीसह उपलब्ध आहे.'
            : 'Your Residence Certificate application is approved and ready with digital signature.',
        timestamp: '२ दिवसांपूर्वी',
        category: 'certificate',
        icon: Icons.verified_rounded,
        color: const Color(0xFF2563EB),
        isUrgent: false,
        actionRoute: 'certificates',
      ),
      AppNotificationItem(
        id: 'notif-4',
        title: isMr ? 'नमो शेतकरी महासन्मान निधी' : 'Namo Shetkari Sanman Nidhi DBT',
        message: isMr
            ? 'नवीन हप्त्यासाठी पात्र शेतकऱ्यांची यादी पोर्टलवर उपलब्ध आहे. त्वरित तपासा.'
            : 'Eligible farmers list for latest DBT installment is published.',
        timestamp: '३ दिवसांपूर्वी',
        category: 'scheme',
        icon: Icons.agriculture_rounded,
        color: const Color(0xFFF59E0B),
        isUrgent: false,
        actionRoute: 'schemes',
      ),
      AppNotificationItem(
        id: 'notif-5',
        title: isMr ? 'पाणीपुरवठा पाईपलाईन देखभाल दुरुस्ती' : 'Water Supply Maintenance Alert',
        message: isMr
            ? 'वॉर्ड क्र. १ व २ मध्ये पाईपलाईन दुरुस्तीमुळे उद्या दुपारी १ ते सायंकाळी ५ पाणीपुरवठा बंद राहील.'
            : 'Water supply will be suspended tomorrow 1 PM - 5 PM in Ward 1 & 2 for maintenance.',
        timestamp: '४ दिवसांपूर्वी',
        category: 'civic',
        icon: Icons.water_drop_rounded,
        color: const Color(0xFF0284C7),
        isUrgent: true,
        actionRoute: 'notices',
      ),
    ];
  }

  int get unreadNotificationCount {
    return notifications.where((n) => !_readNotificationIds.contains(n.id)).length;
  }

  bool isNotificationRead(String id) => _readNotificationIds.contains(id);

  Future<void> markNotificationAsRead(String id) async {
    if (!_readNotificationIds.contains(id)) {
      _readNotificationIds.add(id);
      await StorageService.saveReadNotificationIds(_readNotificationIds);
      notifyListeners();
    }
  }

  Future<void> markAllNotificationsAsRead() async {
    _readNotificationIds = notifications.map((n) => n.id).toList();
    await StorageService.saveReadNotificationIds(_readNotificationIds);
    notifyListeners();
  }

  // 🌐 Toggle Language
  Future<void> toggleLanguage() async {
    _language = _language == 'mr' ? 'en' : 'mr';
    await StorageService.saveLanguage(_language);
    notifyListeners();
  }

  // 📲 Send OTP
  Future<Map<String, dynamic>> sendOtp(String phone) async {
    return await _api.sendOtp(phone);
  }

  // 🛡️ Verify OTP
  Future<Map<String, dynamic>> verifyOtp(String target, String otp) async {
    return await _api.verifyOtp(target, otp);
  }

  // 🔑 Login with SMS OTP
  Future<bool> login(String phone, String otp) async {
    _isLoading = true;
    notifyListeners();

    try {
      final user = await _api.login(phone, otp);
      if (user != null) {
        _currentUser = user;
        _isGovdDeskMode = false;
        await StorageService.saveUser(user);
        await refreshAllData();
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Login error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  // 📱 Check if Phone is Already Registered
  Future<Map<String, dynamic>> checkPhoneRegistered(String phone) async {
    return await _api.checkPhoneRegistered(phone);
  }

  // 📝 Register Citizen (Prevent duplicate accounts)
  Future<Map<String, dynamic>> registerCitizen(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final phone = data['phone']?.toString() ?? '';
      final check = await _api.checkPhoneRegistered(phone);
      if (check['alreadyRegistered'] == true || check['exists'] == true) {
        _isLoading = false;
        notifyListeners();
        return {
          'success': false,
          'alreadyRegistered': true,
          'message': check['message'] ?? 'हा मोबाईल क्रमांक आधीच नोंदणीकृत आहे. कृपया थेट लॉगिन करा.',
        };
      }

      final user = await _api.registerCitizen(data);
      if (user != null) {
        _currentUser = user;
        _isGovdDeskMode = false;
        await StorageService.saveUser(user);
        await refreshAllData();
        _isLoading = false;
        notifyListeners();
        return {'success': true, 'data': user};
      }
    } catch (e) {
      debugPrint('Registration error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return {'success': false, 'message': 'नोंदणी अयशस्वी. कृपया सर्व तपशील तपासा.'};
  }

  // 🚪 Logout
  Future<void> logout() async {
    _currentUser = null;
    _isGovdDeskMode = false;
    _certificates = [];
    _taxRecords = [];
    _grievances = [];
    await StorageService.clearUser();
    await loadPublicData();
    notifyListeners();
  }

  // 👤 Update User Profile
  Future<void> updateUser(UserModel updated) async {
    _currentUser = updated;
    await StorageService.saveUser(updated);
    notifyListeners();
  }

  // 📍 Switch Gram Panchayat Jurisdiction
  Future<void> switchLocation(String gp, String taluka) async {
    if (_currentUser != null) {
      final updated = UserModel(
        id: _currentUser!.id,
        role: _currentUser!.role,
        name: _currentUser!.name,
        phone: _currentUser!.phone,
        dob: _currentUser!.dob,
        email: _currentUser!.email,
        aadhaar: _currentUser!.aadhaar,
        state: _currentUser!.state,
        district: _currentUser!.district,
        taluka: taluka,
        gramPanchayat: gp,
        wardNo: _currentUser!.wardNo,
        houseNo: _currentUser!.houseNo,
        address: _currentUser!.address,
        designation: _currentUser!.designation,
        employeeCode: _currentUser!.employeeCode,
        avatarUrl: _currentUser!.avatarUrl,
      );
      _currentUser = updated;
      await StorageService.saveUser(updated);
    }
    await refreshAllData();
    notifyListeners();
  }

  // 🔄 Refresh All Live Data (Safe background execution)
  Future<void> refreshAllData() async {
    final bgStartTime = DateTime.now();
    debugPrint('[PERF] DASHBOARD START: Background data refresh started');
    final phone = _currentUser?.phone ?? '';
    final gp = _currentUser?.gramPanchayat;
    final taluka = _currentUser?.taluka;

    try {
      final results = await Future.wait([
        _api.getCertificates(phone, gp: gp, taluka: taluka),
        _api.getTaxRecords(phone, gp: gp, taluka: taluka),
        _api.getGrievances(phone, gp: gp, taluka: taluka),
        _api.getSchemes(gp: gp, taluka: taluka),
        _api.getNotices(gp: gp, taluka: taluka),
        _api.getProjects(gp: gp, taluka: taluka),
        _api.getOfficials(gp: gp, taluka: taluka),
      ]).timeout(const Duration(seconds: 4));

      _certificates = results[0] as List<CertificateModel>;
      _taxRecords = results[1] as List<TaxRecordModel>;
      _grievances = results[2] as List<GrievanceModel>;
      _schemes = results[3] as List<GovtSchemeModel>;
      _notices = results[4] as List<NoticeModel>;
      _projects = results[5] as List<ProjectModel>;
      _officials = results[6] as List<VillageOfficialModel>;

      debugPrint('[PERF] DASHBOARD RENDERED: Live data refreshed in +${DateTime.now().difference(bgStartTime).inMilliseconds}ms');
    } catch (e) {
      debugPrint('[PERF] Background refreshAllData timeout/handled: $e');
    }

    notifyListeners();
  }

  // 🌐 Load Public Data (Safe background execution)
  Future<void> loadPublicData() async {
    final bgStartTime = DateTime.now();
    debugPrint('[PERF] PUBLIC DATA START');
    try {
      final results = await Future.wait([
        _api.getSchemes(),
        _api.getNotices(),
        _api.getProjects(),
        _api.getOfficials(),
      ]).timeout(const Duration(seconds: 4));

      _schemes = results[0] as List<GovtSchemeModel>;
      _notices = results[1] as List<NoticeModel>;
      _projects = results[2] as List<ProjectModel>;
      _officials = results[3] as List<VillageOfficialModel>;

      debugPrint('[PERF] PUBLIC DATA COMPLETE in +${DateTime.now().difference(bgStartTime).inMilliseconds}ms');
    } catch (e) {
      debugPrint('[PERF] loadPublicData timeout/handled: $e');
    }

    notifyListeners();
  }

  // 🔍 Universal Search Across All Modules
  List<UniversalSearchResult> searchAll(String query) {
    if (query.trim().isEmpty) return [];
    final q = query.toLowerCase().trim();
    final isMr = _language == 'mr';
    final results = <UniversalSearchResult>[];

    // 1. Search Certificates Catalog
    final certTypes = [
      {'name': 'जन्म दाखला (Birth Certificate)', 'fee': '₹20', 'type': 'birth'},
      {'name': 'मृत्यू दाखला (Death Certificate)', 'fee': '₹20', 'type': 'death'},
      {'name': 'विवाह नोंदणी दाखला (Marriage Certificate)', 'fee': '₹50', 'type': 'marriage'},
      {'name': 'रहिवासी दाखला (Residence Certificate)', 'fee': '₹20', 'type': 'residence'},
      {'name': 'दारिद्र्यरेषेखालील दाखला (BPL Certificate)', 'fee': 'मोफत', 'type': 'bpl'},
      {'name': 'ना-हरकत प्रमाणपत्र (NOC)', 'fee': '₹30', 'type': 'noc'},
      {'name': 'मालमत्ता आकारणी दाखला (Assessment)', 'fee': '₹30', 'type': 'assessment'},
      {'name': 'शौचालय दाखला (Toilet Certificate)', 'fee': 'मोफत', 'type': 'toilet'},
      {'name': 'हयातीचा दाखला (Life Certificate)', 'fee': 'मोफत', 'type': 'life'},
      {'name': 'वारस नोंद दाखला (Heirship Certificate)', 'fee': '₹50', 'type': 'heir'},
      {'name': 'नळ जोडणी ना-हरकत (Water NOC)', 'fee': '₹30', 'type': 'water_noc'},
      {'name': 'उद्योग परवाना (Trade License)', 'fee': '₹100', 'type': 'trade'},
    ];

    for (final c in certTypes) {
      if (c['name']!.toLowerCase().contains(q) || c['type']!.toLowerCase().contains(q)) {
        results.add(UniversalSearchResult(
          title: c['name']!,
          subtitle: isMr ? 'फी: ${c['fee']} • त्वरित ऑनलाइन अर्ज करा' : 'Fee: ${c['fee']} • Apply Online',
          category: isMr ? 'दाखले व प्रमाणपत्रे' : 'Certificates',
          icon: Icons.description_rounded,
          color: const Color(0xFF2563EB),
          actionType: 'apply_certificate',
          data: c,
        ));
      }
    }

    // 2. Search Government Schemes
    for (final s in _schemes) {
      if (s.nameMr.toLowerCase().contains(q) ||
          s.nameEn.toLowerCase().contains(q) ||
          s.category.toLowerCase().contains(q) ||
          s.descriptionMr.toLowerCase().contains(q)) {
        results.add(UniversalSearchResult(
          title: isMr ? s.nameMr : s.nameEn,
          subtitle: isMr ? 'लाभ: ${s.benefitAmount} • ${s.category}' : 'Benefit: ${s.benefitAmount} • ${s.category}',
          category: isMr ? 'शासकीय योजना (DBT)' : 'Govt Schemes',
          icon: Icons.agriculture_rounded,
          color: const Color(0xFF10B981),
          actionType: 'view_scheme',
          data: s,
        ));
      }
    }

    // 3. Search Gram Sabha Notices
    for (final n in _notices) {
      if (n.titleMr.toLowerCase().contains(q) ||
          n.titleEn.toLowerCase().contains(q) ||
          n.contentMr.toLowerCase().contains(q)) {
        results.add(UniversalSearchResult(
          title: isMr ? n.titleMr : n.titleEn,
          subtitle: '${n.publishDate} • ${n.issuedBy}',
          category: isMr ? 'ग्रामपंचायत सूचना' : 'Notices',
          icon: Icons.campaign_rounded,
          color: const Color(0xFFEF4444),
          actionType: 'view_notice',
          data: n,
        ));
      }
    }

    // 4. Search Tax Records
    for (final t in _taxRecords) {
      if (t.propertyNo.toLowerCase().contains(q) ||
          t.ownerName.toLowerCase().contains(q) ||
          t.wardNo.toLowerCase().contains(q)) {
        results.add(UniversalSearchResult(
          title: '${isMr ? "मालमत्ता क्र." : "Property"} ${t.propertyNo} (${t.ownerName})',
          subtitle: isMr ? 'थकबाकी: ₹${t.dueAmount.toInt()} • १०% सवलत लागू' : 'Due: ₹${t.dueAmount.toInt()} • 10% Rebate',
          category: isMr ? 'कर भरणा व पावती' : 'Tax Records',
          icon: Icons.receipt_long_rounded,
          color: const Color(0xFFF59E0B),
          actionType: 'pay_tax',
          data: t,
        ));
      }
    }

    // 5. Search Directory Officials
    for (final o in _officials) {
      if (o.nameMr.toLowerCase().contains(q) ||
          o.nameEn.toLowerCase().contains(q) ||
          o.designationMr.toLowerCase().contains(q) ||
          o.designationEn.toLowerCase().contains(q) ||
          o.phone.contains(q)) {
        results.add(UniversalSearchResult(
          title: '${isMr ? o.nameMr : o.nameEn} (${isMr ? o.designationMr : o.designationEn})',
          subtitle: 'संपर्क: ${o.phone} • ग्रामपंचायत कार्यालय',
          category: isMr ? 'पदाधिकारी डिरेक्टरी' : 'Officials Directory',
          icon: Icons.call_rounded,
          color: const Color(0xFF0D9488),
          actionType: 'call_official',
          data: o,
        ));
      }
    }

    return results;
  }

  // 🤖 AI ग्राम मित्र (AI Civic Assistant Intelligence Engine)
  Map<String, dynamic> askGramMitra(String userQuery) {
    final q = userQuery.toLowerCase().trim();
    final isMr = _language == 'mr';

    // 1. Tax / कर भरणा Queries
    if (q.contains('कर') || q.contains('tax') || q.contains('घरपट्टी') || q.contains('पाणीपट्टी') || q.contains('पावती') || q.contains('सूट') || q.contains('rebate')) {
      return {
        'response': isMr
            ? '💰 **कर भरणा व १०% सवलत योजना:**\n'
                'आपल्या ग्रामपंचायतीने चालू वर्षाच्या करावर **१०% आगाऊ भरणा सवलत (Rebate)** सुरू केली आहे.\n\n'
                '• घरपट्टी, पाणीपट्टी, दिवाबत्ती कर आपण थेट **UPI (GPay / PhonePe / Paytm)** द्वारे भरू शकता.\n'
                '• कर भरल्यानंतर अधिकृत **नमुना ८ डिजिटल पावती** त्वरित डाऊनलोड करता येते.'
            : '💰 **Tax Payment & 10% Rebate:**\n'
                'A 10% instant rebate is available for full advance payment.\n'
                '• Pay Property & Water Tax via UPI.\n'
                '• Download official Namuna 8 digital receipt instantly.',
        'actionText': isMr ? '👉 कर भरणा करा (Pay Now)' : '👉 Pay Taxes Now',
        'actionType': 'pay_tax',
        'suggestedChips': isMr
            ? ['💰 १०% सूट कशी मिळेल?', '📄 नमुना ८ पावती', '💧 पाणीपट्टी किती?']
            : ['💰 How to get 10% rebate?', '📄 Namuna 8 Receipt', '💧 Water Tax Details'],
      };
    }

    // 2. Certificate / दाखला Queries
    if (q.contains('दाखला') || q.contains('cert') || q.contains('जन्म') || q.contains('मृत्यू') || q.contains('रहिवासी') || q.contains('विवाह') || q.contains('bpl') || q.contains('noc')) {
      return {
        'response': isMr
            ? '📜 **डिजिटल दाखले व प्रमाणपत्रे:**\n'
                'ग्रामपंचायतीचे १२ प्रकारचे अधिकृत दाखले आता मोबाईलवरून ऑनलाइन उपलब्ध आहेत:\n\n'
                '१. **जन्म दाखला / मृत्यू दाखला** (फी: ₹२०)\n'
                '२. **रहिवासी दाखला** (फी: ₹२०)\n'
                '३. **विवाह नोंदणी प्रमाणपत्र** (फी: ₹५०)\n'
                '४. **दारिद्र्यरेषेखालील (BPL) दाखला** (मोफत)\n'
                '५. **ना-हरकत प्रमाणपत्र (NOC)** (फी: ₹३०)\n\n'
                'अर्ज केल्यावर १-२ दिवसांत ग्रामसेवक स्वाक्षरीसह QR-कोड युक्त डिजिटल दाखला मिळतो.'
            : '📜 **Digital Certificates:**\n'
                'Apply for 12 official certificates online:\n'
                '• Birth & Death Certificate (₹20)\n'
                '• Residence Certificate (₹20)\n'
                '• Marriage Certificate (₹50)\n'
                '• BPL Certificate (Free)\n'
                '• NOC (₹30)\n'
                'Approved certificates are digitally signed with QR code.',
        'actionText': isMr ? '👉 दाखल्यासाठी अर्ज करा' : '👉 Apply for Certificate',
        'actionType': 'apply_certificate',
        'suggestedChips': isMr
            ? ['📜 रहिवासी दाखला कागदपत्रे', '👶 जन्म दाखला अर्ज', '💍 विवाह नोंदणी']
            : ['📜 Residence Certificate Docs', '👶 Birth Certificate', '💍 Marriage Registration'],
      };
    }

    // 3. Welfare Schemes / योजना Queries
    if (q.contains('योजना') || q.contains('scheme') || q.contains('शेतकरी') || q.contains('घरकुल') || q.contains('आवास') || q.contains('लाडकी') || q.contains('अनुदान') || q.contains('dbt')) {
      return {
        'response': isMr
            ? '🌾 **शासकीय योजना व थेट अनुदान (DBT):**\n'
                'सध्या ग्रामपंचायतीत खालील प्रमुख योजनांसाठी अर्ज सुरू आहेत:\n\n'
                '• **नमो शेतकरी महासन्मान निधी**: पात्र शेतकऱ्यांना वार्षिक ₹६,००० थेट बँक खात्यात.\n'
                '• **रमाई आवास / PM आवास योजना**: घरकुलासाठी ₹१.२० लाखांचे अर्थसहाय्य.\n'
                '• **माझी लाडकी बहीण योजना**: पात्र महिलांना दरमहा ₹१,५०० थेट मदत.\n'
                '• **शेततळे व ठिबक सिंचन अनुदान**: ८०% पर्यंत शासकीय अनुदान.\n\n'
                'आपण **पात्रता तपासणी (Quiz)** द्वारे आपल्यासाठी कोणत्या योजना योग्य आहेत हे तपासू शकता.'
            : '🌾 **Govt Welfare Schemes & DBT:**\n'
                'Ongoing schemes in your Gram Panchayat:\n'
                '• Namo Shetkari Sanman Nidhi (₹6,000/year)\n'
                '• Ramai / PM Awas Yojana (₹1.20 Lakh for housing)\n'
                '• Ladki Bahin Yojana (₹1,500/month)\n'
                '• Farm Pond & Drip Irrigation Subsidy (Up to 80%).',
        'actionText': isMr ? '👉 पात्रता तपासा व अर्ज करा' : '👉 Check Eligibility & Apply',
        'actionType': 'view_schemes',
        'suggestedChips': isMr
            ? ['🏡 घरकुल योजना पात्रता', '🚜 शेतकरी योजना', '👩 महिला सक्षमीकरण योजना']
            : ['🏡 Housing Scheme Eligibility', '🚜 Farmer Schemes', '👩 Women Welfare Schemes'],
      };
    }

    // 4. Grievance / तक्रार Queries
    if (q.contains('तक्रार') || q.contains('grievance') || q.contains('पाणी') || q.contains('रस्ता') || q.contains('लाईट') || q.contains('कचरा') || q.contains('गटार') || q.contains('खड्डे')) {
      return {
        'response': isMr
            ? '📢 **नागरी तक्रार निवारण (Grievance Desk):**\n'
                'गावातील कोणत्याही समस्येवर थेट ग्रामपंचायतीकडे तक्रार दाखल करा:\n\n'
                '• **पाणीपुरवठा खंडित** किंवा गळती\n'
                '• **रस्त्यावरील खड्डे** व दुरुस्ती\n'
                '• **बंद पथदिवे (Streetlights)**\n'
                '• **कचरा व स्वच्छता व्यवस्थापन**\n'
                '• **ड्रेनेज व गटारे सफाई**\n\n'
                'तक्रार दाखल केल्यावर २४ ते ४८ तासांत ग्रामसेवक/कर्मचाऱ्यांकडून कार्यवाही करण्यात येते.'
            : '📢 **Grievance Redressal:**\n'
                'Lodge issues directly to the Gram Panchayat:\n'
                '• Water supply breakdown\n'
                '• Road & Pothole issues\n'
                '• Streetlight repairs\n'
                '• Sanitation & garbage\n'
                '• Drainage cleaning\n'
                'Issues are resolved within 24-48 hours.',
        'actionText': isMr ? '👉 तक्रार नोंदवा (Lodge Issue)' : '👉 Lodge Grievance',
        'actionType': 'lodge_grievance',
        'suggestedChips': isMr
            ? ['💧 पाणीपुरवठा समस्या', '💡 बंद पथदिवे', '🧹 स्वच्छता व कचरा']
            : ['💧 Water Issues', '💡 Streetlight Off', '🧹 Sanitation Complaint'],
      };
    }

    // 5. Gram Sabha / Notices / वेळ
    if (q.contains('ग्रामसभा') || q.contains('sabha') || q.contains('नोटीस') || q.contains('notice') || q.contains('वेळ') || q.contains('कार्यालय') || q.contains('timing')) {
      return {
        'response': isMr
            ? '🏛️ **ग्रामपंचायत कार्यालय वेळ व ग्रामसभा:**\n\n'
                '• **कार्यालयीन वेळ**: सोमवार ते शनिवार, सकाळी ९:३० ते सायंकाळी ६:००\n'
                '• **नागरिक भेट वेळ**: सकाळी १०:०० ते दुपारी २:००\n'
                '• **पुढील विशेष ग्रामसभा**: २६ जानेवारी रोजी सकाळी ९:३० वाजता ग्रामपंचायत सभागृहात.\n'
                'सर्व नागरिकांनी ग्रामसभेस वेळेवर उपस्थित राहावे.'
            : '🏛️ **Gram Panchayat Office Hours & Gram Sabha:**\n\n'
                '• Office Hours: Monday to Saturday, 9:30 AM to 6:00 PM\n'
                '• Public Visiting: 10:00 AM to 2:00 PM\n'
                '• Upcoming Gram Sabha: 26th Jan, 9:30 AM at Panchayat Hall.',
        'actionText': isMr ? '👉 सूचना व नोटीस पहा' : '👉 View Notices',
        'actionType': 'view_notices',
        'suggestedChips': isMr
            ? ['📢 पुढील ग्रामसभा विषय', '⏰ कार्यालयीन वेळ', '👥 अधिकारी संपर्क']
            : ['📢 Gram Sabha Agenda', '⏰ Office Hours', '👥 Officials Contact'],
      };
    }

    // 6. Emergency & Helpline Queries
    if (q.contains('इमर्जन्सी') || q.contains('emergency') || q.contains('रुग्णवाहिका') || q.contains('ambulance') || q.contains('पोलीस') || q.contains('police') || q.contains('सरपंच') || q.contains('ग्रामसेवक') || q.contains('नंबर') || q.contains('phone')) {
      return {
        'response': isMr
            ? '🚨 **२४x७ आपत्कालीन संपर्क व अधिकारी डिरेक्टरी:**\n\n'
                '• **रुग्णवाहिका (Ambulance)**: १०८\n'
                '• **पोलीस नियंत्रण कक्ष**: १०० / ११२\n'
                '• **अग्निशामक दल**: १०१\n'
                '• **सरपंच**: ९८२२०१२३४५\n'
                '• **ग्रामसेवक**: ९८२२०५४३२१\n'
                '• **तलाठी कार्यालय**: ९८२२०६७८९०'
            : '🚨 **24x7 Emergency Helplines & Officials:**\n\n'
                '• Ambulance: 108\n'
                '• Police Control: 100 / 112\n'
                '• Fire: 101\n'
                '• Sarpanch: 9822012345\n'
                '• Gramsevak: 9822054321\n'
                '• Talathi: 9822067890',
        'actionText': isMr ? '👉 अधिकारी डिरेक्टरी उघडा' : '👉 Open Directory',
        'actionType': 'view_directory',
        'suggestedChips': isMr
            ? ['🚑 रुग्णवाहिका १०८', '👮 पोलीस १००', '📞 सरपंच संपर्क']
            : ['🚑 Ambulance 108', '👮 Police 100', '📞 Sarpanch Call'],
      };
    }

    // Default Smart Answer
    return {
      'response': isMr
          ? 'नमस्ते! 🙏 मी आपला **AI ग्राम मित्र** आहे. मी आपल्याला खालील बाबतीत त्वरित मदत करू शकतो:\n\n'
              '१. 📜 **दाखले व प्रमाणपत्रे** - जन्म, रहिवासी, विवाह, BPL दाखला अर्ज\n'
              '२. 💰 **कर भरणा** - घरपट्टी/पाणीपट्टी १०% सवलत व पावती\n'
              '३. 🌾 **शासकीय योजना** - नमो शेतकरी, रमाई आवास, लाडकी बहीण\n'
              '४. 📢 **तक्रार निवारण** - पाणी, रस्ते, पथदिवे, स्वच्छता तक्रार\n'
              '५. 🏛️ **ग्रामसभा व नोटीस** - कार्यक्रम, सूचना व आपत्कालीन क्रमांक\n\n'
              'आपल्याला नेमकी कोणती माहिती हवी आहे ते खाली टाईप करा किंवा खालील पर्यायांवर क्लिक करा!'
          : 'Namaste! 🙏 I am your **AI Gram Mitra**. I can assist you with:\n\n'
              '1. 📜 Digital Certificates (Birth, Residence, Marriage, BPL)\n'
              '2. 💰 Tax Payment with 10% Instant Rebate & Receipts\n'
              '3. 🌾 Welfare Schemes & DBT Financial Subsidies\n'
              '4. 📢 Civic Grievances (Water, Roads, Streetlights)\n'
              '5. 🏛️ Gram Sabha Notices & 24x7 Helplines.',
      'actionText': isMr ? '👉 सर्व सेवा पहा' : '👉 Explore All Services',
      'actionType': 'explore_services',
      'suggestedChips': isMr
          ? ['📜 दाखला कसा काढायचा?', '💰 घरपट्टी १०% सूट', '🌾 शेतकरी योजना', '📢 पाणीपुरवठा तक्रार']
          : ['📜 Apply Certificate', '💰 10% Tax Rebate', '🌾 Farmer Schemes', '📢 Water Complaint'],
    };
  }

  // 📜 Apply for Certificate
  Future<bool> applyCertificate({
    required String certificateType,
    required String purpose,
    double fee = 20.0,
  }) async {
    if (_currentUser == null) return false;

    final data = {
      'id': 'cert-${DateTime.now().millisecondsSinceEpoch}',
      'applicantName': _currentUser!.name,
      'applicantPhone': _currentUser!.phone,
      'certificateType': certificateType,
      'purpose': purpose,
      'submissionDate': DateTime.now().toIso8601String().substring(0, 10),
      'status': 'pending',
      'gramPanchayat': _currentUser!.gramPanchayat,
      'taluka': _currentUser!.taluka,
      'wardNo': _currentUser!.wardNo,
      'houseNo': _currentUser!.houseNo,
      'aadhaar': _currentUser!.aadhaar,
      'fee': fee,
      'paymentStatus': 'paid',
    };

    final created = await _api.applyCertificate(data);
    if (created != null) {
      _certificates.insert(0, created);
      notifyListeners();
      return true;
    }
    return false;
  }

  // 💰 Pay Property / Water Tax
  Future<bool> payTax({
    required String taxId,
    required double amount,
    required String paymentMethod,
  }) async {
    final success = await _api.payTax(taxId, amount, paymentMethod);
    if (success) {
      final index = _taxRecords.indexWhere((t) => t.id == taxId);
      if (index != -1) {
        final current = _taxRecords[index];
        _taxRecords[index] = TaxRecordModel(
          id: current.id,
          citizenName: current.citizenName,
          citizenPhone: current.citizenPhone,
          houseNo: current.houseNo,
          propertyType: current.propertyType,
          wardNo: current.wardNo,
          gramPanchayat: current.gramPanchayat,
          taluka: current.taluka,
          assessmentYear: current.assessmentYear,
          generalTax: current.generalTax,
          waterTax: current.waterTax,
          lightingTax: current.lightingTax,
          sanitationTax: current.sanitationTax,
          totalAmount: current.totalAmount,
          paidAmount: current.paidAmount + amount,
          dueAmount: (current.totalAmount - (current.paidAmount + amount)).clamp(0, double.infinity),
          status: (current.totalAmount - (current.paidAmount + amount)) <= 0 ? 'paid' : 'partial',
          paymentDate: DateTime.now().toIso8601String().substring(0, 10),
          paymentMethod: paymentMethod,
          transactionId: 'TXN-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
        );
        notifyListeners();
      }
      return true;
    }
    return false;
  }

  // 📢 Lodge Grievance
  Future<bool> lodgeGrievance({
    required String title,
    required String description,
    required String category,
    required String wardNo,
    String? photoUrl,
  }) async {
    if (_currentUser == null) return false;

    final data = {
      'id': 'grv-${DateTime.now().millisecondsSinceEpoch}',
      'citizenName': _currentUser!.name,
      'citizenPhone': _currentUser!.phone,
      'title': title,
      'description': description,
      'category': category,
      'wardNo': wardNo,
      'gramPanchayat': _currentUser!.gramPanchayat,
      'taluka': _currentUser!.taluka,
      'houseNo': _currentUser!.houseNo,
      'status': 'open',
      'priority': 'medium',
      'submittedDate': DateTime.now().toIso8601String().substring(0, 10),
      'photoUrls': photoUrl != null ? [photoUrl] : <String>[],
    };

    final created = await _api.lodgeGrievance(data);
    if (created != null) {
      _grievances.insert(0, created);
      notifyListeners();
      return true;
    }
    return false;
  }

  // 🏛️ Govd Desk Mode State (Mobile Desktop for Officers)
  bool _isGovdDeskMode = false;
  bool get isGovdDeskMode => _isGovdDeskMode;

  void toggleGovdDeskMode() {
    _isGovdDeskMode = !_isGovdDeskMode;
    notifyListeners();
  }

  void setGovdDeskMode(bool val) {
    _isGovdDeskMode = val;
    notifyListeners();
  }

  // 🏛️ Offline & Sync State for Field Work & Remote Operations
  bool _isNetworkOnline = true;
  bool _isSyncingData = false;
  int _offlineDraftCount = 0;

  bool get isNetworkOnline => _isNetworkOnline;
  bool get isSyncingData => _isSyncingData;
  int get offlineDraftCount => _offlineDraftCount;

  void setNetworkOnline(bool online) {
    _isNetworkOnline = online;
    notifyListeners();
  }

  void incrementOfflineDraft() {
    _offlineDraftCount++;
    notifyListeners();
  }

  Future<void> syncOfflineData() async {
    if (_isSyncingData) return;
    _isSyncingData = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 1200));
    _offlineDraftCount = 0;
    _isSyncingData = false;
    notifyListeners();
  }

  // 🏛️ Officer Action: Approve Certificate Application
  Future<bool> approveCertificate(String certId, {String? remarks, String? certNumber}) async {
    final index = _certificates.indexWhere((c) => c.id == certId);
    final generatedNo = certNumber ?? 'GP/${(_currentUser?.gramPanchayat ?? "GP").substring(0, 2).toUpperCase()}/${DateTime.now().year}/${(100 + DateTime.now().millisecond)}';
    
    if (index != -1) {
      final current = _certificates[index];
      _certificates[index] = CertificateModel(
        id: current.id,
        applicantName: current.applicantName,
        applicantPhone: current.applicantPhone,
        certificateType: current.certificateType,
        purpose: current.purpose,
        submissionDate: current.submissionDate,
        status: 'approved',
        gramPanchayat: current.gramPanchayat,
        taluka: current.taluka,
        wardNo: current.wardNo,
        houseNo: current.houseNo,
        aadhaar: current.aadhaar,
        certificateNumber: generatedNo,
        issueDate: DateTime.now().toIso8601String().substring(0, 10),
        fee: current.fee,
        paymentStatus: current.paymentStatus,
      );
      notifyListeners();
      return true;
    }
    return false;
  }

  // 🏛️ Officer Action: Reject Certificate Application
  Future<bool> rejectCertificate(String certId, {required String reason}) async {
    final index = _certificates.indexWhere((c) => c.id == certId);
    if (index != -1) {
      final current = _certificates[index];
      _certificates[index] = CertificateModel(
        id: current.id,
        applicantName: current.applicantName,
        applicantPhone: current.applicantPhone,
        certificateType: current.certificateType,
        purpose: current.purpose,
        submissionDate: current.submissionDate,
        status: 'rejected',
        gramPanchayat: current.gramPanchayat,
        taluka: current.taluka,
        wardNo: current.wardNo,
        houseNo: current.houseNo,
        aadhaar: current.aadhaar,
        rejectionReason: reason,
        fee: current.fee,
        paymentStatus: current.paymentStatus,
      );
      notifyListeners();
      return true;
    }
    return false;
  }

  // 🏛️ Officer Action: Update Grievance Status
  Future<bool> updateGrievanceStatus(String grievanceId, String newStatus, {String? resolutionNotes}) async {
    final index = _grievances.indexWhere((g) => g.id == grievanceId);
    if (index != -1) {
      final current = _grievances[index];
      _grievances[index] = GrievanceModel(
        id: current.id,
        citizenName: current.citizenName,
        citizenPhone: current.citizenPhone,
        title: current.title,
        description: current.description,
        category: current.category,
        wardNo: current.wardNo,
        gramPanchayat: current.gramPanchayat,
        taluka: current.taluka,
        houseNo: current.houseNo,
        status: newStatus,
        priority: current.priority,
        submittedDate: current.submittedDate,
        resolutionDate: newStatus == 'resolved' ? DateTime.now().toIso8601String().substring(0, 10) : current.resolutionDate,
        resolutionRemarks: resolutionNotes ?? current.resolutionRemarks ?? (newStatus == 'resolved' ? 'तक्रार निवारण पूर्ण झाले.' : 'काम प्रगतीपथावर आहे.'),
        photoUrls: current.photoUrls,
      );
      notifyListeners();
      return true;
    }
    return false;
  }

  // 🏛️ Officer Action: Collect Tax Payment
  Future<bool> collectTaxPayment({
    required String taxId,
    required double amount,
    required String paymentMethod,
    String? payerPhone,
  }) async {
    final index = _taxRecords.indexWhere((t) => t.id == taxId);
    final receiptNo = 'GP-REC-${DateTime.now().year}-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

    if (index != -1) {
      final current = _taxRecords[index];
      final newPaid = current.paidAmount + amount;
      final newDue = (current.totalAmount - newPaid).clamp(0.0, double.infinity);

      _taxRecords[index] = TaxRecordModel(
        id: current.id,
        citizenName: current.citizenName,
        citizenPhone: payerPhone ?? current.citizenPhone,
        houseNo: current.houseNo,
        propertyType: current.propertyType,
        wardNo: current.wardNo,
        gramPanchayat: current.gramPanchayat,
        taluka: current.taluka,
        assessmentYear: current.assessmentYear,
        generalTax: current.generalTax,
        waterTax: current.waterTax,
        lightingTax: current.lightingTax,
        sanitationTax: current.sanitationTax,
        totalAmount: current.totalAmount,
        paidAmount: newPaid,
        dueAmount: newDue,
        status: newDue <= 0 ? 'paid' : 'partial',
        paymentDate: DateTime.now().toIso8601String().substring(0, 10),
        paymentMethod: '$paymentMethod (Counter: ${_currentUser?.name ?? "Staff"})',
        transactionId: receiptNo,
      );
      notifyListeners();
      return true;
    }
    return false;
  }

  // 🏛️ Officer Action: Publish Village Notice
  Future<bool> publishNotice({
    required String titleMr,
    required String contentMr,
    String? titleEn,
    String? contentEn,
    required String category,
    bool isUrgent = false,
  }) async {
    final newNotice = NoticeModel(
      id: 'not-${DateTime.now().millisecondsSinceEpoch}',
      titleMr: titleMr,
      titleEn: titleEn ?? titleMr,
      contentMr: contentMr,
      contentEn: contentEn ?? contentMr,
      category: category,
      publishDate: DateTime.now().toIso8601String().substring(0, 10),
      issuedBy: '${_currentUser?.designation ?? _currentUser?.roleDisplayMr ?? "ग्रामपंचायत कार्यालय"}, ${_currentUser?.gramPanchayat ?? "घुलेवाडी"}',
      isUrgent: isUrgent,
    );

    _notices.insert(0, newNotice);
    notifyListeners();
    return true;
  }

  // 🏛️ Officer Action: Add / Update Development Project
  Future<bool> addProject({
    required String titleMr,
    required String descriptionMr,
    required String category,
    required double budget,
    required String contractorName,
    required String startDate,
    required String expectedEndDate,
  }) async {
    final newProject = ProjectModel(
      id: 'proj-${DateTime.now().millisecondsSinceEpoch}',
      titleMr: titleMr,
      titleEn: titleMr,
      descriptionMr: descriptionMr,
      descriptionEn: descriptionMr,
      category: category,
      budget: budget,
      expenditure: 0.0,
      status: 'pending',
      completionPercentage: 0,
      contractorName: contractorName,
      startDate: startDate,
      expectedEndDate: expectedEndDate,
    );

    _projects.insert(0, newProject);
    notifyListeners();
    return true;
  }
}
