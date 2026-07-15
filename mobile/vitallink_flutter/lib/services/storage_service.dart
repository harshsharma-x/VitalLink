import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static Future<void> setString(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, value);
  }

  static Future<String?> getString(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }

  static Future<void> remove(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }

  static Future<void> setMultiple(Map<String, String> entries) async {
    final prefs = await SharedPreferences.getInstance();
    for (final e in entries.entries) {
      await prefs.setString(e.key, e.value);
    }
  }

  static Future<void> removeMultiple(List<String> keys) async {
    final prefs = await SharedPreferences.getInstance();
    for (final key in keys) {
      await prefs.remove(key);
    }
  }
}
