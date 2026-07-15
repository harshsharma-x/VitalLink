import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/rs_app_header.dart';
import '../../widgets/rs_card.dart';
import '../../widgets/blood_tag.dart';
import '../../services/storage_service.dart';

class DonorProfileScreen extends StatefulWidget {
  const DonorProfileScreen({super.key});
  @override State<DonorProfileScreen> createState() => _DonorProfileScreenState();
}

class _DonorProfileScreenState extends State<DonorProfileScreen> {
  String _name = 'Donor';
  String _group = 'O+';
  String _phone = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final n = await StorageService.getString('donor_name');
    final g = await StorageService.getString('donor_group');
    final p = await StorageService.getString('donor_phone');
    setState(() { if (n != null) _name = n; if (g != null) _group = g; if (p != null) _phone = p; });
  }

  Future<void> _logout() async {
    await StorageService.removeMultiple(['access_token', 'donor_id', 'donor_name', 'donor_group', 'donor_phone', 'cached_profile', 'cached_donations']);
    if (mounted) Navigator.pushNamedAndRemoveUntil(context, '/', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    final masked = _phone.length == 10 ? '+91 ${_phone.substring(0, 2)}****${_phone.substring(6)}' : '+91 ••••••••••';
    return Scaffold(
      backgroundColor: RS.fog,
      appBar: const PreferredSize(preferredSize: Size.fromHeight(60), child: RSAppHeader(name: 'Profile', sub: 'ABHA & settings')),
      body: ListView(padding: const EdgeInsets.all(18), children: [
        RSCard(child: Row(children: [
          CircleAvatar(radius: 26, backgroundColor: RS.soft, child: Text(_name.isNotEmpty ? _name[0].toUpperCase() : 'D', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: RS.accent))),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(_name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: RS.ink)),
            const SizedBox(height: 3),
            Text(masked, style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: RS.mid)),
            const SizedBox(height: 6),
            Row(children: [
              BloodTag(group: _group, accent: RS.accent, size: 28),
              const SizedBox(width: 8),
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: RS.steal, borderRadius: BorderRadius.circular(5)), child: const Text('ABHA Verified', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: RS.teal))),
            ]),
          ])),
        ])),
        const SizedBox(height: 16),
        _section('ALERT SETTINGS', [
          _setting('Receive emergency alerts', 'Get push notifications when someone near you needs your blood group.'),
          _setting('Expand radius to 15 km', 'By default alerts are for donors within 10 km.'),
        ]),
        const SizedBox(height: 16),
        _section('ABHA & PRIVACY', [
          _setting('Share ABHA health records', 'Hospitals can view your donation history for faster matching.'),
          _setting('Keep identity anonymous', 'Patients only see your first name and blood group.'),
        ]),
        const SizedBox(height: 16),
        RSCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
          Text('Your ABHA ID and donation records are stored on NHA servers under IT Act 2000.', style: TextStyle(fontSize: 12, color: RS.mid)),
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

  Widget _section(String title, List<Widget> children) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: RS.faint)),
      const SizedBox(height: 8),
      RSCard(child: Column(children: children)),
    ]);
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
