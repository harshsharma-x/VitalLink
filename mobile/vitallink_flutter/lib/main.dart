import 'package:flutter/material.dart';
import 'navigation/app_router.dart';
import 'services/config.dart';
import 'services/notification_service.dart';
import 'theme/colors.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Config.init();
  try {
    await NotificationService.init();
  } catch (e) {
    debugPrint('Notification service init failed: $e');
  }
  runApp(const VitalLinkApp());
}

class VitalLinkApp extends StatelessWidget {
  const VitalLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VitalLink',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.red,
        scaffoldBackgroundColor: RS.fog,
        appBarTheme: const AppBarTheme(
          backgroundColor: RS.white,
          foregroundColor: RS.ink,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
        ),
        colorScheme: ColorScheme.fromSeed(
          seedColor: RS.accent,
          brightness: Brightness.light,
        ),
      ),
      initialRoute: '/',
      routes: AppRouter.routes,
    );
  }
}
