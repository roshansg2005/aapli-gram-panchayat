import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  // 🌐 Render Live Production Backend URL
  // Can be set at build/run time via:
  // flutter run --dart-define=LIVE_BACKEND_URL=https://<your-render-app>.onrender.com/api
  static const String defaultLiveUrl = String.fromEnvironment(
    'LIVE_BACKEND_URL',
    defaultValue: 'https://aapli-gram-panchayat-backend.onrender.com/api',
  );

  // Runtime custom URL override (stored in SharedPreferences)
  static String? _overrideUrl;

  // Use Live Render Backend flag (default true for mobile devices to connect to live Render cloud)
  static bool _useLiveBackend = const bool.fromEnvironment('USE_LIVE_BACKEND', defaultValue: true);

  // Initialize saved network configuration from storage
  static Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUrl = prefs.getString('custom_backend_url');
      if (savedUrl != null && savedUrl.trim().isNotEmpty) {
        _overrideUrl = savedUrl.trim();
      }
      final savedUseLive = prefs.getBool('use_live_backend');
      if (savedUseLive != null) {
        _useLiveBackend = savedUseLive;
      }
    } catch (e) {
      debugPrint('ApiConfig init warning: $e');
    }
  }

  // Set custom backend URL at runtime (e.g. custom Render domain)
  static Future<void> setCustomBackendUrl(String? url) async {
    _overrideUrl = url?.trim().isNotEmpty == true ? url!.trim() : null;
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_overrideUrl != null) {
        await prefs.setString('custom_backend_url', _overrideUrl!);
      } else {
        await prefs.remove('custom_backend_url');
      }
    } catch (_) {}
  }

  // Toggle between Live Render Backend and Local Development Server
  static Future<void> setUseLiveBackend(bool value) async {
    _useLiveBackend = value;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('use_live_backend', value);
    } catch (_) {}
  }

  static bool get isUsingLiveBackend => _useLiveBackend;
  static String? get customUrl => _overrideUrl;

  // Active Base URL getter
  static String get baseUrl {
    if (_overrideUrl != null && _overrideUrl!.isNotEmpty) {
      return _overrideUrl!;
    }

    if (_useLiveBackend) {
      return defaultLiveUrl;
    }

    if (kIsWeb) {
      return 'http://localhost:5000/api';
    } else if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:5000/api';
    } else {
      return 'http://localhost:5000/api';
    }
  }

  // Fallback direct localhost URL
  static const String directLocalhostUrl = 'http://localhost:5000/api';

  // Timeout: Render cold starts on free tier can take 15-20 seconds, so timeout is 25s
  static const Duration timeoutDuration = Duration(seconds: 25);
}
