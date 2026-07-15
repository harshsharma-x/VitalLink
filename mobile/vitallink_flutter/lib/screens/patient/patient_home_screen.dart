import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/blood_drop.dart';
import '../../widgets/pulse_dot.dart';
import '../../widgets/rs_card.dart';
import '../../services/storage_service.dart';
import '../../services/notification_service.dart';

class PatientHomeScreen extends StatefulWidget {
  const PatientHomeScreen({super.key});
  @override State<PatientHomeScreen> createState() => _PatientHomeScreenState();
}

class _PatientHomeScreenState extends State<PatientHomeScreen> {
  String _name = 'User';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final n = await StorageService.getString('patient_name');
    setState(() { if (n != null) _name = n; });
    // Register push token after login
    NotificationService.registerTokenAfterLogin();
    // Listen for incoming donor accepted notifications
    NotificationService.onMessageReceived = (message) {
      final data = message.data;
      if (data['type'] == 'donor_accepted' && mounted) {
        Navigator.pushNamed(context, '/patient/tracking', arguments: {
          'request_id': data['request_id'],
          'match_id': data['match_id'],
          'blood_group': data['blood_group'],
          'donor_name': data['donor_name'],
          'donor_group': data['donor_blood_group'],
        });
      }
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RS.fog,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: Container(
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 12),
          decoration: const BoxDecoration(color: RS.white, border: Border(bottom: BorderSide(color: RS.line))),
          child: SafeArea(bottom: false, child: Row(children: [
            const BloodDrop(size: 16, color: RS.accent),
            const SizedBox(width: 10),
            const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
              Text('VitalLink', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: RS.ink)),
              Text('Ludhiana, Punjab', style: TextStyle(fontSize: 11.5, color: RS.mid)),
            ])),
            Row(children: [
              const PulseDot(color: RS.teal, size: 7),
              const SizedBox(width: 6),
              const Text('12,480 donors nearby', style: TextStyle(fontSize: 11.5, color: RS.teal, fontWeight: FontWeight.w600)),
            ]),
          ])),
        ),
      ),
      body: ListView(padding: const EdgeInsets.all(18), children: [
        Text('Namaste, $_name 🙏', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: RS.ink)),
        const SizedBox(height: 14),
        // Emergency CTA
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(color: RS.deep, borderRadius: BorderRadius.circular(18), boxShadow: [BoxShadow(color: RS.accent.withOpacity(0.24), blurRadius: 34, offset: const Offset(0, 14))]),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Need blood urgently?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: RS.white)),
            const SizedBox(height: 4),
            const Text('Verified donors near you are alerted in under 90 seconds.', style: TextStyle(fontSize: 12.5, color: Colors.white70)),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/patient/create_request'),
                style: ElevatedButton.styleFrom(backgroundColor: RS.white, foregroundColor: RS.accent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.symmetric(vertical: 14)),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: const [BloodDrop(size: 13, color: RS.accent), SizedBox(width: 8), Text('Request blood now', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700))]),
              ),
            ),
          ]),
        ),
        const SizedBox(height: 14),
        Row(children: [
          Expanded(child: GestureDetector(
            onTap: () => Navigator.pushNamed(context, '/patient/blood_banks'),
            child: RSCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
              Text('Blood banks', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RS.ink)),
              SizedBox(height: 2),
              Text('9 nearby · live stock', style: TextStyle(fontSize: 11.5, color: RS.mid)),
            ])),
          )),
          const SizedBox(width: 12),
          Expanded(child: GestureDetector(
            onTap: () => Navigator.pushNamed(context, '/patient/history'),
            child: RSCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
              Text('My requests', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RS.ink)),
              SizedBox(height: 2),
              Text('No active requests', style: TextStyle(fontSize: 11.5, color: RS.mid)),
            ])),
          )),
        ]),
        const SizedBox(height: 14),
        RSCard(child: Row(children: [
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: RS.steal, borderRadius: BorderRadius.circular(6)), child: const Text('SMS', style: TextStyle(fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.w700, color: RS.teal))),
          const SizedBox(width: 10),
          const Expanded(child: Text('No internet? Dial *BLOOD# or send a missed call — same network, any phone.', style: TextStyle(fontSize: 11.5, color: RS.mid))),
        ])),
      ]),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(color: RS.white, border: Border(top: BorderSide(color: RS.line))),
        child: SafeArea(child: Row(children: [
          _navItem('Home', () {}),
          _navItem('Blood Banks', () => Navigator.pushNamed(context, '/patient/blood_banks')),
          _navItem('Requests', () => Navigator.pushNamed(context, '/patient/history')),
          _navItem('Profile', () => Navigator.pushNamed(context, '/patient/profile')),
        ])),
      ),
    );
  }

  Widget _navItem(String label, VoidCallback onTap) {
    return Expanded(child: GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 6, height: 6, decoration: BoxDecoration(color: label == 'Home' ? RS.accent : RS.faint, shape: BoxShape.circle)),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 10.5, color: label == 'Home' ? RS.accent : RS.faint, fontWeight: label == 'Home' ? FontWeight.w700 : FontWeight.w500)),
        ]),
      ),
    ));
  }
}
