import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/rs_app_header.dart';
import '../../widgets/rs_card.dart';
import '../../services/storage_service.dart';

class PatientProfileScreen extends StatefulWidget {
  const PatientProfileScreen({super.key});
  @override State<PatientProfileScreen> createState() => _PatientProfileScreenState();
}

class _PatientProfileScreenState extends State<PatientProfileScreen> {
  String _name = 'User';
  String _phone = '';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final n = await StorageService.getString('patient_name');
    final p = await StorageService.getString('patient_phone');
    setState(() { if (n != null) _name = n; if (p != null) _phone = p; });
  }

  Future<void> _logout() async {
    await StorageService.removeMultiple(['access_token', 'patient_id', 'patient_name', 'patient_phone', 'cached_requests']);
    if (mounted) Navigator.pushNamedAndRemoveUntil(context, '/', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    final masked = _phone.length == 10 ? '+91 ${_phone.substring(0, 2)}****${_phone.substring(6)}' : '+91 ••••••••••';
    return Scaffold(
      backgroundColor: RS.fog,
      appBar: const PreferredSize(preferredSize: Size.fromHeight(60), child: RSAppHeader(name: 'Profile', sub: 'Privacy & health data')),
      body: ListView(padding: const EdgeInsets.all(18), children: [
        RSCard(child: Row(children: [
          CircleAvatar(radius: 26, backgroundColor: RS.accent, child: Text(_name.isNotEmpty ? _name[0].toUpperCase() : 'U', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: RS.white))),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(_name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: RS.ink)),
            const SizedBox(height: 3),
            Text(masked, style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: RS.mid)),
          ])),
        ])),
        const SizedBox(height: 16),
        const Text('ABDM CONSENT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: RS.faint)),
        const SizedBox(height: 8),
        RSCard(child: Column(children: [
          _setting('Share health records via ABHA', 'Doctors can pull your blood type and Hb from ABDM during an emergency.'),
          const Divider(color: RS.line),
          _setting('DISHA data rights', 'You can request a full export or deletion of your data.'),
        ])),
        const SizedBox(height: 16),
        const Text('PRIVACY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: RS.faint)),
        const SizedBox(height: 8),
        RSCard(child: Column(children: [
          _setting('Share approximate location', 'Only shared during an active request.'),
          const Divider(color: RS.line),
          _setting('Mask my identity from donors', 'Donors see the hospital, not your name or number.'),
        ])),
        const SizedBox(height: 16),
        RSCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
          Text('Your data is stored on Indian servers under IT Act 2000.', style: TextStyle(fontSize: 12, color: RS.mid)),
          SizedBox(height: 8),
          Text('DISHA compliant · NHA partner', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: RS.amber)),
        ])),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: _logout,
          child: Container(width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 13), decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: RS.line, width: 1.5)), alignment: Alignment.center,
            child: const Text('Sign out', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: RS.accent))),
        ),
      ]),
    );
  }

  Widget _setting(String label, String sub) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RS.ink)),
          const SizedBox(height: 2),
          Text(sub, style: const TextStyle(fontSize: 11.5, color: RS.mid)),
        ])),
        Switch(value: true, onChanged: (_) {}, activeThumbColor: RS.teal),
      ]),
    );
  }
}
