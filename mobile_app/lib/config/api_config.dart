import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // Automatically choose correct base URL depending on platform
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000/api';
    } else if (Platform.isAndroid) {
      // Android Emulator loopback is 10.0.2.2; standard phone can use localhost or specific local IP
      return 'http://10.0.2.2:5000/api';
    } else {
      return 'http://localhost:5000/api';
    }
  }

  // Fallback direct localhost URL
  static const String directLocalhostUrl = 'http://localhost:5000/api';

  // Timeout
  static const Duration timeoutDuration = Duration(seconds: 4);
}
