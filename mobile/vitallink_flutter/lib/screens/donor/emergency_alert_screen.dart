import 'dart:async';
import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../services/api_service.dart';
import '../../utils/geo.dart';

class EmergencyAlertScreen extends StatefulWidget {
  const EmergencyAlertScreen({super.key});
  @override State<EmergencyAlertScreen> createState() => _EmergencyAlertScreenState();
}

class _EmergencyAlertScreenState extends State<EmergencyAlertScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ringCtrl;
  late Animation<double> _ring1, _ring2, _ring3;
  int _countdown = 120;
  Timer? _timer;
  bool _accepting = false;
  String? _distance;

  @override
  void initState() {
    super.initState();
    _ringCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))..repeat();
    _ring1 = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ringCtrl, curve: const Interval(0.0, 1.0)));
    _ring2 = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ringCtrl, curve: const Interval(0.15, 1.0)));
    _ring3 = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ringCtrl, curve: const Interval(0.3, 1.0)));
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() { _countdown--; if (_countdown <= 0) { t.cancel(); Navigator.pop(context); } });
    });
    _calcDistance();
  }

  @override
  void dispose() { _ringCtrl.dispose(); _timer?.cancel(); super.dispose(); }



  Future<void> _calcDistance() async {
    try {
      final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
      final hLat = (args?['hospital_lat'] as num?)?.toDouble();
      final hLng = (args?['hospital_lng'] as num?)?.toDouble();
      if (hLat == null || hLng == null) return;
      final loc = await GeoUtil.getCurrentLocation();
      if (loc == null) return;
      final dist = GeoUtil.haversine(loc.latitude, loc.longitude, hLat, hLng);
      if (mounted) setState(() => _distance = dist < 1 ? '${(dist * 1000).round()} m' : '${dist.toStringAsFixed(1)} km');
    } catch (e) { debugPrint('Distance calc error: $e'); }
  }

  Future<void> _accept() async {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    setState(() => _accepting = true);
    try {
      await ApiService.post('/matching/accept', body: {'match_id': args['match_id']});
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/donor/navigation', arguments: args);
    } catch (_) { setState(() => _accepting = false); }
  }

  Future<void> _decline() async {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    try { await ApiService.post('/matching/reject', body: {'match_id': args['match_id']}); } catch (e) { debugPrint('Decline error: $e'); }
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final bloodGroup = args['blood_group'] ?? 'O+';
    final hospital = args['hospital'] ?? 'Unknown';
    final units = args['units'] ?? 1;
    final mins = (_countdown ~/ 60).toString().padLeft(2, '0');
    final secs = (_countdown % 60).toString().padLeft(2, '0');

    return Scaffold(
      backgroundColor: RS.deep,
      body: SafeArea(
        child: Column(children: [
          const SizedBox(height: 40),
          const Text('EMERGENCY ALERT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFFFF6B6B), letterSpacing: 3)),
          const SizedBox(height: 24),
          SizedBox(width: 110, height: 110, child: Stack(alignment: Alignment.center, children: [
            _ring(_ring1), _ring(_ring2), _ring(_ring3),
            Container(width: 80, height: 80, decoration: const BoxDecoration(color: RS.accent, shape: BoxShape.circle), child: const Icon(Icons.water_drop, color: RS.white, size: 28)),
          ])),
          const SizedBox(height: 16),
          Text(bloodGroup, style: const TextStyle(fontFamily: 'monospace', fontSize: 60, fontWeight: FontWeight.w900, color: RS.white, letterSpacing: 2)),
          const Text('BLOOD NEEDED', style: TextStyle(fontSize: 13, color: Colors.white54, letterSpacing: 1)),
          const SizedBox(height: 8),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Text('$mins:$secs', style: TextStyle(fontFamily: 'monospace', fontSize: 22, fontWeight: FontWeight.w700, color: _countdown <= 30 ? const Color(0xFFFF6B6B) : Colors.white70)),
            const SizedBox(width: 6),
            const Text('to respond', style: TextStyle(fontSize: 11, color: Colors.white38)),
          ]),
          const SizedBox(height: 24),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.07), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.12))),
            child: Column(children: [
              _infoRow('Hospital', hospital),
              Divider(color: Colors.white.withOpacity(0.12), height: 22),
              _infoRow('Distance', _distance ?? 'Calculating…'),
              Divider(color: Colors.white.withOpacity(0.12), height: 22),
              _infoRow('Units needed', '$units unit${units > 1 ? 's' : ''}'),
            ]),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Row(children: [
              Expanded(child: GestureDetector(
                onTap: _decline,
                child: Container(
                  height: 56, alignment: Alignment.center,
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.08), borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.15))),
                  child: const Text('DECLINE', style: TextStyle(color: Colors.white60, fontSize: 14, fontWeight: FontWeight.w700, letterSpacing: 1)),
                ),
              )),
              const SizedBox(width: 12),
              Expanded(flex: 2, child: ElevatedButton(
                onPressed: _accepting ? null : _accept,
                style: ElevatedButton.styleFrom(backgroundColor: RS.teal, foregroundColor: RS.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), minimumSize: const Size(0, 56)),
                child: _accepting ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(RS.white))) : const Text('ACCEPT', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, letterSpacing: 1)),
              )),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _ring(Animation<double> anim) {
    return AnimatedBuilder(animation: anim, builder: (_, __) {
      final scale = 1.0 + anim.value * 1.4;
      final opacity = (0.5 - anim.value * 0.5).clamp(0.0, 0.5);
      return Transform.scale(scale: scale, child: Container(width: 110, height: 110, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: RS.accent.withOpacity(opacity), width: 2))));
    });
  }

  Widget _infoRow(String label, String value) {
    return Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.45), letterSpacing: 0.7)),
      Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: RS.white)),
    ]);
  }
}
