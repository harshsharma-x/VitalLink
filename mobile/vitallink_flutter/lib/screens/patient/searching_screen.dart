import 'dart:async';
import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/rs_app_header.dart';
import '../../widgets/rs_card.dart';
import '../../services/api_service.dart';

class SearchingScreen extends StatefulWidget {
  const SearchingScreen({super.key});
  @override State<SearchingScreen> createState() => _SearchingScreenState();
}

class _SearchingScreenState extends State<SearchingScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ringCtrl;
  late Animation<double> _ring1, _ring2;
  int _donorsAlerted = 0;
  final List<bool> _steps = [false, false, false];
  String _phase = 'searching';
  Timer? _pollTimer;
  final _startedAt = DateTime.now();
  bool _pollStarted = false;

  @override
  void initState() {
    super.initState();
    _ringCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat();
    _ring1 = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ringCtrl, curve: const Interval(0.0, 1.0)));
    _ring2 = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ringCtrl, curve: const Interval(0.3, 1.0)));
    Future.delayed(const Duration(milliseconds: 600), () { if (mounted) setState(() => _steps[0] = true); });
    Future.delayed(const Duration(milliseconds: 1400), () { if (mounted) setState(() => _steps[1] = true); });
    Future.delayed(const Duration(milliseconds: 2400), () { if (mounted) setState(() => _steps[2] = true); });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_pollStarted) { _pollStarted = true; _poll(); }
  }

  void _poll() {
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final requestId = args?['request_id'];
    if (requestId == null) return;
    _pollTimer = Timer.periodic(const Duration(seconds: 4), (_) async {
      try {
        final res = await ApiService.get('/matching/status/$requestId');
        final data = ApiService.decode(res);
        if (!mounted) return;
        setState(() => _donorsAlerted = data['donors_alerted'] ?? 0);
        if (data['status'] == 'accepted') {
          _pollTimer?.cancel();
          Navigator.pushReplacementNamed(context, '/patient/tracking', arguments: {
            ...?args, 'match_id': data['accepted_match']?['match_id'],
            'donor_name': data['accepted_match']?['donor_name'],
            'donor_group': data['accepted_match']?['blood_group'],
          });
        }
        final elapsed = DateTime.now().difference(_startedAt).inMilliseconds;
        if (elapsed > 45000 && _donorsAlerted == 0) setState(() => _phase = 'expanding');
        if (elapsed > 180000) { _pollTimer?.cancel(); setState(() => _phase = 'timeout'); }
      } catch (e) { debugPrint('Polling error: $e'); }
    });
  }

  @override
  void dispose() { _ringCtrl.dispose(); _pollTimer?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final bloodGroup = args['blood_group'] ?? 'O+';
    final units = args['units'] ?? 2;

    if (_phase == 'timeout') {
      return Scaffold(
        backgroundColor: RS.fog,
        appBar: const PreferredSize(preferredSize: Size.fromHeight(60), child: RSAppHeader(name: 'Finding donors', sub: 'O+ · 2 units')),
        body: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Text('No donors available right now', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: RS.ink)),
          const SizedBox(height: 8),
          const Text('We searched within 50 km. Try again in a few minutes.', style: TextStyle(fontSize: 13, color: RS.mid)),
          const SizedBox(height: 20),
          ElevatedButton(onPressed: () => Navigator.pushNamedAndRemoveUntil(context, '/patient/home', (_) => false), style: ElevatedButton.styleFrom(backgroundColor: RS.accent, foregroundColor: RS.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: const Text('Check blood banks')),
        ])),
      );
    }

    return Scaffold(
      backgroundColor: RS.fog,
      appBar: PreferredSize(preferredSize: const Size.fromHeight(60), child: RSAppHeader(name: 'Finding donors', sub: '$bloodGroup · $units units')),
      body: Center(child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          SizedBox(width: 170, height: 170, child: Stack(alignment: Alignment.center, children: [
            AnimatedBuilder(animation: _ring1, builder: (_, __) => Transform.scale(scale: 0.6 + _ring1.value, child: Container(width: 170, height: 170, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: RS.accent.withOpacity((0.5 - _ring1.value * 0.5).clamp(0.0, 0.5)), width: 1.5))))),
            AnimatedBuilder(animation: _ring2, builder: (_, __) => Transform.scale(scale: 0.6 + _ring2.value, child: Container(width: 170, height: 170, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: RS.accent.withOpacity((0.5 - _ring2.value * 0.5).clamp(0.0, 0.5)), width: 1.5))))),
            Container(width: 96, height: 96, decoration: BoxDecoration(color: RS.white, shape: BoxShape.circle, border: Border.all(color: RS.accent, width: 2), boxShadow: [BoxShadow(color: RS.accent.withOpacity(0.18), blurRadius: 30, offset: const Offset(0, 10))]),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text('$_donorsAlerted', style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 26, color: RS.accent)),
                const Text('ALERTED', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1, color: RS.mid)),
              ])),
          ])),
          const SizedBox(height: 20),
          Text(_phase == 'expanding' ? 'Expanding search radius…' : 'Alerting nearby donors…', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: RS.ink)),
          const SizedBox(height: 4),
          Text(_phase == 'expanding' ? 'No donors found nearby — trying up to 50 km' : 'Search radius 15 km — expands automatically',
              style: const TextStyle(fontSize: 12.5, color: RS.mid), textAlign: TextAlign.center),
          const SizedBox(height: 20),
          RSCard(child: Column(children: _steps.asMap().entries.map((e) {
            final i = e.key;
            final done = e.value;
            final labels = ['Hospital verified against HFR registry', 'Urgency scored — CRITICAL (82/100)', 'Alerting $bloodGroup donors within 15 km'];
            return Container(
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: i < 2 ? const BoxDecoration(border: Border(bottom: BorderSide(color: RS.line))) : null,
              child: Row(children: [
                Container(width: 18, height: 18, decoration: BoxDecoration(shape: BoxShape.circle, color: done ? RS.teal : RS.fog, border: Border.all(color: done ? RS.teal : RS.line, width: 1.5)),
                  child: done ? const Icon(Icons.check, color: RS.white, size: 12) : null),
                const SizedBox(width: 10),
                Expanded(child: Text(labels[i], style: TextStyle(fontSize: 12.5, color: done ? RS.ink : RS.faint, fontWeight: done ? FontWeight.w600 : FontWeight.w400))),
              ]),
            );
          }).toList())),
          const SizedBox(height: 20),
          Text(_donorsAlerted > 0 ? '$_donorsAlerted donor${_donorsAlerted > 1 ? 's' : ''} alerted — waiting for response…' : 'Searching for compatible donors. This takes up to 3 minutes.',
              style: const TextStyle(fontSize: 11, color: RS.faint), textAlign: TextAlign.center),
        ]),
      )),
    );
  }
}
