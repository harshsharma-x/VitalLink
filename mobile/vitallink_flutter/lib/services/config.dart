import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Config {
  static String _apiUrl = 'http://localhost:8000';
  static String _socketUrl = 'http://localhost:8000';

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _apiUrl = prefs.getString('api_url') ?? 'http://localhost:8000';
    _socketUrl = _apiUrl;
  }

  static String get apiUrl => _apiUrl;
  static String get socketUrl => _socketUrl;
}
