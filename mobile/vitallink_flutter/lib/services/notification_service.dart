import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

/// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Background message: ${message.messageId}');
}

class NotificationService {
  static FirebaseMessaging? _messaging;
  static FlutterLocalNotificationsPlugin? _localNotifications;
  static bool _initialized = false;
  static String? _fcmToken;
  static int _notificationId = 0;
  static Function(RemoteMessage)? onMessageReceived;

  /// Initialize Firebase and notification channels
  static Future<void> init() async {
    if (kIsWeb) {
      debugPrint('Push notifications not available on web — skipping Firebase init');
      return;
    }
    try {
      await Firebase.initializeApp();
      _initialized = true;

      // Register background handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      _messaging = FirebaseMessaging.instance;
      _localNotifications = FlutterLocalNotificationsPlugin();

      // Request permission
      final settings = await _messaging!.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      debugPrint('Notification permission: ${settings.authorizationStatus}');

      // Initialize local notifications for foreground display
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      const iosSettings = DarwinInitializationSettings();
      const initSettings = InitializationSettings(android: androidSettings, iOS: iosSettings);
      await _localNotifications!.initialize(initSettings, onDidReceiveNotificationResponse: (response) {
        debugPrint('Notification tapped: ${response.payload}');
      });

      // Create Android notification channel
      const androidChannel = AndroidNotificationChannel(
        'emergency',
        'Emergency Alerts',
        importance: Importance.max,
        description: 'Critical blood emergency alerts',
      );
      await _localNotifications!.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()?.createNotificationChannel(androidChannel);

      // Get FCM token
      _fcmToken = await _messaging!.getToken();
      debugPrint('FCM Token: $_fcmToken');

      // Register token with backend
      if (_fcmToken != null) await _registerToken(_fcmToken!);

      // Listen for token refresh
      _messaging!.onTokenRefresh.listen((token) {
        _fcmToken = token;
        _registerToken(token);
      });

      // Foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Foreground message: ${message.notification?.title}');
        _showLocalNotification(message);
        onMessageReceived?.call(message);
      });

      // Message opened app (from terminated state)
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('Message opened app: ${message.data}');
        onMessageReceived?.call(message);
      });

      // Check if app opened from notification (cold start)
      final initialMessage = await _messaging!.getInitialMessage();
      if (initialMessage != null) {
        onMessageReceived?.call(initialMessage);
      }
    } catch (e) {
      debugPrint('Firebase init failed (expected on web without config): $e');
    }
  }  /// Show local notification for foreground messages
  static Future<void> _showLocalNotification(RemoteMessage message) async {
    if (!_initialized || _localNotifications == null) return;
    final notification = message.notification;
    if (notification == null) return;

    const androidDetails = AndroidNotificationDetails(
      'emergency',
      'Emergency Alerts',
      importance: Importance.max,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );
    const details = NotificationDetails(android: androidDetails);
    await _localNotifications!.show(
      _notificationId++,
      notification.title,
      notification.body,
      details,
      payload: jsonEncode(message.data),
    );
  }

  /// Register push token with backend (role-aware, skips if not authenticated)
  static Future<void> _registerToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final accessToken = prefs.getString('access_token');
      if (accessToken == null || accessToken.isEmpty) {
        debugPrint('No auth token yet — skipping push token registration');
        return;
      }
      final hasDonorId = prefs.containsKey('donor_id');
      final endpoint = hasDonorId ? '/donors/push-token' : '/auth/push-token';
      await ApiService.post(endpoint, body: {'push_token': token});
      debugPrint('Push token registered ($endpoint)');
    } catch (e) {
      debugPrint('Failed to register push token: $e');
    }
  }

  /// Re-register token after login (call from home screens)
  static Future<void> registerTokenAfterLogin() async {
    if (_fcmToken != null) await _registerToken(_fcmToken!);
  }

  /// Get current FCM token
  static String? get fcmToken => _fcmToken;

  /// Whether Firebase is initialized
  static bool get isInitialized => _initialized;

  /// Subscribe to a topic
  static Future<void> subscribeToTopic(String topic) async {
    if (_messaging == null) return;
    await _messaging!.subscribeToTopic(topic);
    debugPrint('Subscribed to topic: $topic');
  }

  /// Unsubscribe from a topic
  static Future<void> unsubscribeFromTopic(String topic) async {
    if (_messaging == null) return;
    await _messaging!.unsubscribeFromTopic(topic);
    debugPrint('Unsubscribed from topic: $topic');
  }
}
