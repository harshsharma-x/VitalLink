import 'dart:async';
import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/pulse_dot.dart';
import '../../widgets/route_map.dart';
import '../../widgets/blood_tag.dart';

class TrackingScreen extends StatefulWidget {
  const TrackingScreen({super.key});
  @override State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  double _progress = 0;
  bool _arrived = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 300), (t) {
      setState(() { _progress += 0.015; if (_progress >= 1) { _progress = 1; _arrived = true; t.cancel(); } });
    });
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final donorName = args['donor_name'] ?? 'Donor';
    final donorGroup = args['donor_group'] ?? args['blood_group'] ?? 'O+';
    final reliability = args['reliability_score'] ?? 0;
    final donations = args['donation_count'] ?? 0;
    final units = args['units'] ?? 1;
    final eta = (8 * (1 - _progress)).round().clamp(0, 99);
    final dist = (2.3 * (1 - _progress)).toStringAsFixed(1);
    final initial = donorName.isNotEmpty ? donorName[0].toUpperCase() : 'D';
    final rColor = reliability >= 80 ? RS.teal : reliability >= 50 ? RS.amber : RS.accent;

    return Scaffold(
      backgroundColor: RS.fog,
      body: Column(children: [
        Expanded(child: Stack(children: [
          RouteMap(progress: _progress, accent: RS.accent, arrived: _arrived),
          Positioned(top: 12, left: 12, right: 12, child: Center(child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
            decoration: BoxDecoration(color: _arrived ? RS.teal : RS.ink, borderRadius: BorderRadius.circular(100), boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 16, offset: const Offset(0, 6))]),
            child: Row(mainAxisSize: MainAxisSize.min, children: [const PulseDot(color: RS.white, size: 7), const SizedBox(width: 8), Text(_arrived ? 'Donor has arrived at the hospital' : 'Donor found — on the way', style: const TextStyle(color: RS.white, fontSize: 12, fontWeight: FontWeight.w600))]),
          ))),
        ])),
        Container(
          padding: const EdgeInsets.all(18),
          decoration: const BoxDecoration(color: RS.white, borderRadius: BorderRadius.vertical(top: Radius.circular(18)), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 30, offset: Offset(0, -10))]),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: RS.line, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 14),
            Row(children: [
              CircleAvatar(radius: 23, backgroundColor: RS.steal, child: Text(initial, style: const TextStyle(color: RS.teal, fontWeight: FontWeight.w700, fontSize: 17))),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(donorName, style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700, color: RS.ink)),
                Text('$donations donation${donations != 1 ? 's' : ''} · $reliability% reliability', style: const TextStyle(fontSize: 11.5, color: RS.mid)),
              ])),
              BloodTag(group: donorGroup, accent: RS.accent),
            ]),
            const SizedBox(height: 14),
            Row(children: [
              _stat('ETA', _arrived ? 'Arrived' : '$eta min', _arrived ? RS.teal : RS.ink),
              const SizedBox(width: 10),
              _stat('Distance', _arrived ? '0.0 km' : '$dist km', RS.ink),
              const SizedBox(width: 10),
              _stat('Units', '$units', RS.ink),
            ]),
            const SizedBox(height: 12),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Text('DONOR RELIABILITY', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, letterSpacing: 0.7, color: RS.faint)),
              Text('$reliability%', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: rColor)),
            ]),
            const SizedBox(height: 6),
            ClipRRect(borderRadius: BorderRadius.circular(3), child: LinearProgressIndicator(value: reliability / 100, backgroundColor: RS.line, valueColor: AlwaysStoppedAnimation(rColor), minHeight: 5)),
            const SizedBox(height: 14),
            Container(width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 13), alignment: Alignment.center,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: RS.line, width: 1.5)),
              child: const Text('☎  Call donor (number stays masked)', style: TextStyle(color: RS.ink, fontWeight: FontWeight.w600, fontSize: 14))),
          ]),
        ),
      ]),
    );
  }

  Widget _stat(String label, String value, Color color) {
    return Expanded(child: Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: RS.fog, borderRadius: BorderRadius.circular(12)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, letterSpacing: 0.7, color: RS.faint)),
        Text(value, style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 20, color: color)),
      ]),
    ));
  }
}
