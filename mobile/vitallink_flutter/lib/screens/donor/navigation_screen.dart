import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../../theme/colors.dart';
import '../../widgets/pulse_dot.dart';
import '../../widgets/route_map.dart';
import '../../services/config.dart';
import '../../utils/geo.dart';

class DonorNavigationScreen extends StatefulWidget {
  const DonorNavigationScreen({super.key});
  @override State<DonorNavigationScreen> createState() => _DonorNavigationScreenState();
}

class _DonorNavigationScreenState extends State<DonorNavigationScreen> {
  IO.Socket? _socket;
  StreamSubscription<Position>? _posSub;
  double _progress = 0;
  String _distance = 'Calculating…';
  String _eta = '—';
  double? _startDist;

  @override
  void initState() {
    super.initState();
    _startTracking();
  }



  Future<void> _startTracking() async {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final requestId = args['request_id'] ?? '';
    final hospitalLat = (args['hospital_lat'] as num?)?.toDouble();
    final hospitalLng = (args['hospital_lng'] as num?)?.toDouble();

    // Connect socket
    _socket = IO.io(Config.socketUrl, IO.OptionBuilder().setTransports(['websocket']).build());
    _socket?.onConnect((_) => debugPrint('Socket connected'));
    _socket?.onDisconnect((_) => debugPrint('Socket disconnected'));

    // Request location permission
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    // Start listening to position updates
    _posSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 10, timeLimit: Duration(seconds: 5)),
    ).listen((pos) {
      // Emit location to socket
      _socket?.emit('donor_location', {
        'request_id': requestId,
        'latitude': pos.latitude,
        'longitude': pos.longitude,
      });

      // Calculate distance to hospital
      if (hospitalLat != null && hospitalLng != null) {
        final dist = GeoUtil.haversine(pos.latitude, pos.longitude, hospitalLat, hospitalLng);
        setState(() {
          _distance = dist < 1 ? '${(dist * 1000).round()} m' : '${dist.toStringAsFixed(1)} km';
          final etaMins = (dist / 30 * 60).round();
          _eta = etaMins <= 0 ? 'Arriving' : '$etaMins min';
          if (_startDist == null) _startDist = dist;
          if (_startDist != null && _startDist! > 0) {
            _progress = (1 - dist / _startDist!).clamp(0.0, 1.0);
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _posSub?.cancel();
    _socket?.disconnect();
    _socket?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final hospital = args['hospital'] ?? 'Hospital';
    return Scaffold(
      backgroundColor: RS.fog,
      body: Column(children: [
        Expanded(
          child: Stack(children: [
            RouteMap(progress: _progress, accent: RS.accent, arrived: _progress >= 0.95),
            Positioned(top: 12, left: 12, right: 12, child: Center(child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(color: RS.ink, borderRadius: BorderRadius.circular(100)),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [PulseDot(color: RS.white, size: 7), SizedBox(width: 8), Text('Sharing live location', style: TextStyle(color: RS.white, fontSize: 12, fontWeight: FontWeight.w600))]),
            ))),
          ]),
        ),
        Container(
          decoration: const BoxDecoration(color: RS.white, borderRadius: BorderRadius.vertical(top: Radius.circular(18)), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 30, offset: Offset(0, -10))]),
          padding: const EdgeInsets.all(18),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: RS.line, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 14),
            Text('🏥  $hospital', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RS.ink)),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: RS.fog, borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('ETA', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, letterSpacing: 0.7, color: RS.faint)),
                Text(_eta, style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 20, color: RS.teal)),
              ]))),
              const SizedBox(width: 10),
              Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: RS.fog, borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('DISTANCE', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, letterSpacing: 0.7, color: RS.faint)),
                Text(_distance, style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 20, color: RS.ink)),
              ]))),
            ]),
            const SizedBox(height: 10),
            const Text('Your precise GPS coordinates are being shared with the hospital every 5 seconds.', style: TextStyle(fontSize: 11, color: RS.faint)),
            const SizedBox(height: 14),
            SizedBox(width: double.infinity, height: 52, child: ElevatedButton(
              onPressed: () => Navigator.pushReplacementNamed(context, '/donor/donation', arguments: args),
              style: ElevatedButton.styleFrom(backgroundColor: RS.teal, foregroundColor: RS.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
              child: const Text("I've Arrived at the Hospital", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
            )),
          ]),
        ),
      ]),
    );
  }
}
