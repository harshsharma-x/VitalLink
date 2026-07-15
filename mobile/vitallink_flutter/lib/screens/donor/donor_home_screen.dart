import 'dart:convert';
import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/blood_drop.dart';
import '../../widgets/pulse_dot.dart';
import '../../widgets/rs_card.dart';
import '../../widgets/blood_tag.dart';
import '../../services/api_service.dart';
import '../../services/storage_service.dart';
import '../../services/notification_service.dart';

class DonorHomeScreen extends StatefulWidget {
  const DonorHomeScreen({super.key});
  @override State<DonorHomeScreen> createState() => _DonorHomeScreenState();
}

class _DonorHomeScreenState extends State<DonorHomeScreen> {
  Map<String, dynamic>? _profile;
  bool _loading = true;
  bool _available = true;
  String _localName = 'Donor';
  String _localGroup = 'O+';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    _localName = await StorageService.getString('donor_name') ?? 'Donor';
    _localGroup = await StorageService.getString('donor_group') ?? 'O+';
    try {
      final donorId = await StorageService.getString('donor_id');
      final res = await ApiService.get('/donors/$donorId');
      final data = ApiService.decode(res);
      _profile = data;
      _available = data['is_available'] ?? true;
      await StorageService.setString('cached_profile', jsonEncode(data));
    } catch (_) {
      final c = await StorageService.getString('cached_profile');
      if (c != null) { _profile = jsonDecode(c); _available = _profile!['is_available'] ?? true; }
    }
    setState(() => _loading = false);
    // Register push token after login
    NotificationService.registerTokenAfterLogin();
    // Listen for incoming emergency alerts
    NotificationService.onMessageReceived = (message) {
      final data = message.data;
      if (data['type'] == 'emergency_alert' && mounted) {
        Navigator.pushNamed(context, '/donor/emergency', arguments: {
          'request_id': data['request_id'],
          'match_id': data['match_id'],
          'blood_group': data['blood_group'],
          'hospital': data['hospital'],
          'hospital_lat': double.tryParse(data['hospital_lat'] ?? ''),
          'hospital_lng': double.tryParse(data['hospital_lng'] ?? ''),
          'units': int.tryParse(data['units'] ?? '1'),
        });
      }
    };
  }

  Future<void> _toggle(bool val) async {
    setState(() => _available = val);
    try {
      final donorId = await StorageService.getString('donor_id');
      await ApiService.patch('/donors/$donorId/availability', body: {'availability': val});
    } catch (_) { _load(); }
  }

  @override
  Widget build(BuildContext context) {
    final name = _profile?['name'] ?? _localName;
    final group = _profile?['blood_group'] ?? _localGroup;
    final count = _profile?['donation_count'] ?? 0;
    final score = _profile?['reliability_score'] ?? 0;
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
              Text('Donor dashboard', style: TextStyle(fontSize: 11.5, color: RS.mid)),
            ])),
            BloodTag(group: group, accent: RS.accent),
          ])),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: RS.accent))
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(padding: const EdgeInsets.all(18), children: [
                Text('Namaste, $name', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: RS.ink)),
                const SizedBox(height: 14),
                // Availability card
                RSCard(
                  border: Border.all(color: _available ? RS.teal : RS.line, width: 1.5),
                  child: Row(children: [
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(_available ? 'Available for donation' : 'Currently unavailable', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: RS.ink)),
                      const SizedBox(height: 4),
                      Row(children: [
                        if (_available) const PulseDot(color: RS.teal, size: 7),
                        const SizedBox(width: 6),
                        Text(_available ? 'You will receive emergency alerts' : 'Toggle to start receiving alerts',
                            style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: _available ? RS.teal : RS.faint)),
                      ]),
                    ])),
                    Switch(value: _available, onChanged: _toggle, activeThumbColor: RS.teal),
                  ]),
                ),
                const SizedBox(height: 10),
                // Stats row
                Row(children: [
                  _stat('$count', 'Donations', RS.accent, RS.soft),
                  const SizedBox(width: 10),
                  _stat('$score%', 'Reliability', RS.teal, RS.steal),
                  const SizedBox(width: 10),
                  _stat('${(count * 1.4).floor()}', 'Lives saved', RS.amber, RS.samber),
                ]),
                const SizedBox(height: 14),
                // Last donation
                RSCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('LAST DONATION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.8, color: RS.faint)),
                  const SizedBox(height: 6),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    const Text('Apollo Hospital, Ludhiana', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RS.ink)),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: RS.steal, borderRadius: BorderRadius.circular(6)), child: const Text('Done', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: RS.teal))),
                  ]),
                  const SizedBox(height: 4),
                  const Text('Jun 14, 2025 · O+ · 1 unit', style: TextStyle(fontSize: 11.5, color: RS.mid)),
                  const SizedBox(height: 8),
                  const Row(children: [
                    Text('Next eligible: ', style: TextStyle(fontSize: 11.5, color: RS.mid)),
                    Text('Aug 14, 2025', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 11.5, color: RS.ink)),
                  ]),
                ])),
              ]),
            ),
      bottomNavigationBar: _bottomNav(),
    );
  }

  Widget _stat(String val, String label, Color fg, Color bg) {
    return Expanded(child: Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
      child: Column(children: [
        Text(val, style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 22, color: fg)),
        const SizedBox(height: 3),
        Text(label, style: const TextStyle(fontSize: 10.5, color: RS.mid)),
      ]),
    ));
  }

  Widget _bottomNav() {
    return Container(
      decoration: const BoxDecoration(color: RS.white, border: Border(top: BorderSide(color: RS.line))),
      child: SafeArea(child: Row(children: [
        _navItem('Home', () {}),
        _navItem('History', () => Navigator.pushNamed(context, '/donor/history')),
        _navItem('Profile', () => Navigator.pushNamed(context, '/donor/profile')),
      ])),
    );
  }

  Widget _navItem(String label, VoidCallback onTap) {
    return Expanded(child: GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 6, height: 6, decoration: BoxDecoration(color: RS.accent, shape: BoxShape.circle)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 10.5, color: RS.accent, fontWeight: FontWeight.w700)),
        ]),
      ),
    ));
  }
}
