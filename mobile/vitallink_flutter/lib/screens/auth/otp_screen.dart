import 'dart:async';
import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/blood_drop.dart';
import '../../services/api_service.dart';
import '../../services/storage_service.dart';

class OTPScreen extends StatefulWidget {
  const OTPScreen({super.key});

  @override
  State<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  final _otpCtrl = TextEditingController();
  bool _loading = false;
  String _error = '';
  int _countdown = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _countdown = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() { _countdown--; if (_countdown <= 0) t.cancel(); });
    });
  }

  @override
  void dispose() { _timer?.cancel(); _otpCtrl.dispose(); super.dispose(); }

  Future<void> _verify() async {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    if (_otpCtrl.text.length != 6) { setState(() => _error = 'Enter the full 6-digit code'); return; }
    setState(() { _error = ''; _loading = true; });
    try {
      final res = await ApiService.post('/auth/verify-otp', body: {
        'phone': args['phone'], 'otp': _otpCtrl.text,
        'name': args['name'], 'role': args['role'],
        if (args['blood_group'] != null) 'blood_group': args['blood_group'],
      });
      final data = ApiService.decode(res);
      await ApiService.setToken(data['token'] ?? '');
      final role = args['role'] as String;
      final prefix = role == 'donor' ? 'donor' : 'patient';
      await StorageService.setMultiple({
        'access_token': data['token'] ?? '',
        '${prefix}_id': '${data['donor_id'] ?? data['user_id'] ?? ''}',
        '${prefix}_name': args['name'],
        '${prefix}_phone': args['phone'],
        if (role == 'donor') 'donor_group': args['blood_group'] ?? 'O+',
      });
      if (!mounted) return;
      final route = role == 'donor' ? '/donor/home' : '/patient/home';
      Navigator.pushNamedAndRemoveUntil(context, route, (_) => false);
    } catch (e) {
      setState(() { _error = 'Verification failed. Try again.'; });
    } finally { setState(() => _loading = false); }
  }

  Future<void> _resend() async {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    setState(() { _error = ''; _otpCtrl.clear(); });
    try {
      final res = await ApiService.post('/auth/send-otp', body: {'phone': args['phone']});
      final data = ApiService.decode(res);
      if (data['dev_otp'] != null) { _otpCtrl.text = '${data['dev_otp']}'; }
    } catch (e) { debugPrint('Resend OTP error: $e'); }
    _startTimer();
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final phone = args['phone'] as String;
    final devOtp = args['dev_otp'];
    final masked = '+91 ${phone.substring(0, 5)} ${phone.substring(5, 7)}****';
    final mins = (_countdown ~/ 60).toString().padLeft(2, '0');
    final secs = (_countdown % 60).toString().padLeft(2, '0');

    return Scaffold(
      backgroundColor: RS.fog,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(22, 20, 22, 24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [const BloodDrop(size: 16, color: RS.accent), const SizedBox(width: 9), const Text('VitalLink', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: RS.ink))]),
            const SizedBox(height: 14),
            Row(children: [
              Expanded(child: Container(height: 4, decoration: BoxDecoration(color: RS.accent, borderRadius: BorderRadius.circular(2)))),
              const SizedBox(width: 5),
              Expanded(child: Container(height: 4, decoration: BoxDecoration(color: RS.accent, borderRadius: BorderRadius.circular(2)))),
            ]),
            const SizedBox(height: 26),
            const Text('Enter the\nOTP.', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: RS.ink, height: 1.2)),
            const SizedBox(height: 10),
            Text('We sent a 6-digit code to $masked', style: const TextStyle(fontSize: 13, color: RS.mid, height: 1.5)),
            const SizedBox(height: 20),
            // OTP Input
            TextField(
              controller: _otpCtrl,
              keyboardType: TextInputType.number,
              maxLength: 6,
              onChanged: (v) => setState(() => _error = ''),
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, letterSpacing: 12, color: RS.ink),
              decoration: InputDecoration(
                hintText: '••••••',
                hintStyle: TextStyle(color: RS.faint.withOpacity(0.4), letterSpacing: 12),
                filled: true, fillColor: RS.white,
                counterText: '',
                contentPadding: const EdgeInsets.symmetric(vertical: 16),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: RS.line, width: 1.5)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: RS.line, width: 1.5)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: RS.accent, width: 1.5)),
              ),
            ),
            if (_error.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_error, style: const TextStyle(fontSize: 12.5, color: RS.accent, fontWeight: FontWeight.w600))),
            if (devOtp != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: RS.samber, borderRadius: BorderRadius.circular(10)),
                child: Text('DEV MODE — OTP auto-filled: $devOtp', style: const TextStyle(fontSize: 11, color: RS.amber, fontWeight: FontWeight.w700)),
              ),
            ],
            const SizedBox(height: 16),
            if (_countdown > 0)
              Center(child: Text('Resend available in $mins:$secs', style: const TextStyle(fontSize: 12, color: RS.mid)))
            else
              GestureDetector(onTap: _resend, child: const Center(child: Text.rich(TextSpan(children: [TextSpan(text: "Didn't receive it? ", style: TextStyle(fontSize: 12, color: RS.mid)), TextSpan(text: 'Resend OTP', style: TextStyle(fontSize: 12, color: RS.accent, fontWeight: FontWeight.w700))])))),
            const SizedBox(height: 20),
            SizedBox(width: double.infinity, height: 56, child: ElevatedButton(
              onPressed: _otpCtrl.text.length == 6 && !_loading ? _verify : null,
              style: ElevatedButton.styleFrom(backgroundColor: RS.accent, foregroundColor: RS.white, disabledBackgroundColor: RS.accent.withOpacity(0.45), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0),
              child: _loading ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation(RS.white))) : const Text('Verify & register', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 17)),
            )),
            const SizedBox(height: 16),
            Center(child: GestureDetector(onTap: () => Navigator.pop(context), child: const Text('← Change number', style: TextStyle(fontSize: 12.5, color: RS.mid)))),
          ]),
        ),
      ),
    );
  }
}
