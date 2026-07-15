import 'package:flutter/material.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/otp_screen.dart';
import '../screens/donor/donor_home_screen.dart';
import '../screens/donor/emergency_alert_screen.dart';
import '../screens/donor/navigation_screen.dart';
import '../screens/donor/donation_screen.dart';
import '../screens/donor/complete_screen.dart';
import '../screens/donor/donor_history_screen.dart';
import '../screens/donor/donor_profile_screen.dart';
import '../screens/patient/patient_home_screen.dart';
import '../screens/patient/create_request_screen.dart';
import '../screens/patient/searching_screen.dart';
import '../screens/patient/tracking_screen.dart';
import '../screens/patient/patient_history_screen.dart';
import '../screens/patient/blood_banks_screen.dart';
import '../screens/patient/patient_profile_screen.dart';

class AppRouter {
  static Map<String, WidgetBuilder> get routes => {
    '/': (context) => const LoginScreen(),
    '/otp': (context) => const OTPScreen(),
    // Donor routes
    '/donor/home': (context) => const DonorHomeScreen(),
    '/donor/emergency': (context) => const EmergencyAlertScreen(),
    '/donor/navigation': (context) => const DonorNavigationScreen(),
    '/donor/donation': (context) => const DonationScreen(),
    '/donor/complete': (context) => const DonorCompleteScreen(),
    '/donor/history': (context) => const DonorHistoryScreen(),
    '/donor/profile': (context) => const DonorProfileScreen(),
    // Patient routes
    '/patient/home': (context) => const PatientHomeScreen(),
    '/patient/create_request': (context) => const CreateRequestScreen(),
    '/patient/searching': (context) => const SearchingScreen(),
    '/patient/tracking': (context) => const TrackingScreen(),
    '/patient/history': (context) => const PatientHistoryScreen(),
    '/patient/blood_banks': (context) => const BloodBanksScreen(),
    '/patient/profile': (context) => const PatientProfileScreen(),
  };
}
