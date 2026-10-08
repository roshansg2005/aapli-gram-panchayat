import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class StorageService {
  static const String _userKey = 'gp_citizen_user';
  static const String _langKey = 'gp_citizen_lang';
  static const String _themeKey = 'gp_citizen_dark_theme';
  static const String _notifKey = 'gp_citizen_notifications_enabled';
  static const String _readNotifsKey = 'gp_citizen_read_notifications';

  // Save Current User
  static Future<void> saveUser(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  // Load User
  static Future<UserModel?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_userKey);
    if (data != null) {
      try {
        return UserModel.fromJson(jsonDecode(data));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Clear Session
  static Future<void> clearUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userKey);
  }

  // Save Language
  static Future<void> saveLanguage(String lang) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_langKey, lang);
  }

  // Get Language (Defaults to 'mr')
  static Future<String> getLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_langKey) ?? 'mr';
  }

  // Save Dark Mode Theme
  static Future<void> saveDarkMode(bool isDark) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_themeKey, isDark);
  }

  // Get Dark Mode Theme (Defaults to false)
  static Future<bool> getDarkMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_themeKey) ?? false;
  }

  // Save Notification Permission/State
  static Future<void> saveNotificationPermission(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_notifKey, enabled);
  }

  // Get Notification Permission/State
  static Future<bool> getNotificationPermission() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_notifKey) ?? true;
  }

  // Save Read Notification IDs
  static Future<void> saveReadNotificationIds(List<String> ids) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_readNotifsKey, ids);
  }

  // Get Read Notification IDs
  static Future<List<String>> getReadNotificationIds() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_readNotifsKey) ?? [];
  }
}
