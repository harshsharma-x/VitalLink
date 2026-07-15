import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static String _baseUrl = 'http://localhost:8000';
  static String? _token;

  static void setBaseUrl(String url) => _baseUrl = url;
  static String get baseUrl => _baseUrl;

  static Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('access_token');
  }

  static Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', token);
  }

  static Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
  }

  static Map<String, String> get _headers {
    final h = <String, String>{'Content-Type': 'application/json'};
    if (_token != null) h['Authorization'] = 'Bearer $_token';
    return h;
  }

  static Future<http.Response> get(String path) async {
    await _loadToken();
    return http.get(Uri.parse('$_baseUrl$path'), headers: _headers);
  }

  static Future<http.Response> post(String path, {Object? body}) async {
    await _loadToken();
    return http.post(Uri.parse('$_baseUrl$path'), headers: _headers, body: body != null ? jsonEncode(body) : null);
  }

  static Future<http.Response> patch(String path, {Object? body}) async {
    await _loadToken();
    return http.patch(Uri.parse('$_baseUrl$path'), headers: _headers, body: body != null ? jsonEncode(body) : null);
  }

  static dynamic decode(http.Response res) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body);
    }
    throw Exception('API Error ${res.statusCode}: ${res.body}');
  }
}
