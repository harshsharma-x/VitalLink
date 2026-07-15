import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/blood_drop.dart';
import '../../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String _selectedGroup = 'O+';
  bool _loading = false;
  String _error = '';
  String? _role;

  static const _groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  bool get _isValid => _nameCtrl.text.trim().isNotEmpty && RegExp(r'^[6-9]\d{9}$').hasMatch(_phoneCtrl.text);

  void _onPhoneChange(String v) {
    _phoneCtrl.text = v.replaceAll(RegExp(r'\D'), '').substring(0, v.length.clamp(0, 10));
    setState(() {});
  }

  Future<void> _getOtp() async {
    if (_role == null) { setState(() => _error = 'Select a role first'); return; }
    if (_nameCtrl.text.trim().isEmpty) { setState(() => _error = 'Enter your name'); return; }
    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(_phoneCtrl.text)) { setState(() => _error = 'Enter a valid 10-digit number'); return; }
    setState(() { _error = ''; _loading = true; });
    try {
      final res = await ApiService.post('/auth/send-otp', body: {'phone': _phoneCtrl.text});
      final data = ApiService.decode(res);
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/otp', arguments: {
        'phone': _phoneCtrl.text,
        'name': _nameCtrl.text.trim(),
        'role': _role,
        'blood_group': _selectedGroup,
        'dev_otp': data['dev_otp'],
      });
    } catch (e) {
      setState(() { _error = e.toString().contains('Exception') ? e.toString().split('Exception: ').last : 'Could not reach server'; });
    } finally { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RS.fog,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(22, 20, 22, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(children: [
                const BloodDrop(size: 16, color: RS.accent),
                const SizedBox(width: 9),
                const Text('VitalLink', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: RS.ink)),
              ]),
              const SizedBox(height: 14),
              // Progress bar
              Row(children: [
                Expanded(child: Container(height: 4, decoration: BoxDecoration(color: RS.accent, borderRadius: BorderRadius.circular(2)))),
                const SizedBox(width: 5),
                Expanded(child: Container(height: 4, decoration: BoxDecoration(color: RS.line, borderRadius: BorderRadius.circular(2)))),
              ]),
              const SizedBox(height: 26),
              // Heading
              const Text('Save a life\nin 90 seconds.', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: RS.ink, height: 1.2)),
              const SizedBox(height: 10),
              const Text('Register as a donor — you\'ll get instant alerts when someone near you needs your blood group.', style: TextStyle(fontSize: 13, color: RS.mid, height: 1.5)),
              const SizedBox(height: 18),

              // Role selector
              const Text('I AM A', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: RS.faint)),
              const SizedBox(height: 8),
              Row(children: [
                _roleChip('Donor', Icons.bloodtype, 'donor'),
                const SizedBox(width: 10),
                _roleChip('Patient', Icons.person, 'patient'),
              ]),
              const SizedBox(height: 18),

              // Name
              _label('FULL NAME'),
              _input('Your name', _nameCtrl, TextInputType.text, autoCapitalize: true),
              const SizedBox(height: 14),

              // Phone
              _label('MOBILE NUMBER'),
              Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 13),
                  decoration: BoxDecoration(color: RS.white, border: Border.all(color: RS.line, width: 1.5), borderRadius: BorderRadius.circular(12)),
                  child: const Text('+91', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w600, fontSize: 15, color: RS.ink)),
                ),
                const SizedBox(width: 8),
                Expanded(child: _input('10-digit number', _phoneCtrl, TextInputType.phone, maxLength: 10, onChange: _onPhoneChange)),
              ]),
              const SizedBox(height: 14),

              // Blood group (only for donors)
              if (_role == 'donor') ...[
                const Text('MY BLOOD GROUP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: RS.faint)),
                const SizedBox(height: 8),
                Wrap(spacing: 8, runSpacing: 8, children: _groups.map((g) => _groupChip(g)).toList()),
                const SizedBox(height: 14),
              ],

              if (_error.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(_error, style: const TextStyle(fontSize: 12.5, color: RS.accent, fontWeight: FontWeight.w600)),
                ),

              // Get OTP
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isValid && !_loading ? _getOtp : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: RS.accent,
                    foregroundColor: RS.white,
                    disabledBackgroundColor: RS.accent.withOpacity(0.45),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: _loading
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation(RS.white)))
                      : const Text('Get OTP', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 17)),
                ),
              ),
              const SizedBox(height: 12),
              const Center(child: Text('A 6-digit code will be sent to your number.', style: TextStyle(fontSize: 11, color: RS.faint, height: 1.5))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _roleChip(String label, IconData icon, String role) {
    final selected = _role == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() { _role = role; _error = ''; }),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: selected ? (role == 'donor' ? RS.steal : RS.soft) : RS.white,
            border: Border.all(color: selected ? (role == 'donor' ? RS.teal : RS.accent) : RS.line, width: 1.5),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(icon, size: 18, color: selected ? (role == 'donor' ? RS.teal : RS.accent) : RS.mid),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: selected ? (role == 'donor' ? RS.teal : RS.accent) : RS.mid)),
          ]),
        ),
      ),
    );
  }

  Widget _groupChip(String g) {
    final selected = g == _selectedGroup;
    return GestureDetector(
      onTap: () => setState(() => _selectedGroup = g),
      child: Container(
        width: 72,
        padding: const EdgeInsets.symmetric(vertical: 11),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? RS.soft : RS.white,
          border: Border.all(color: selected ? RS.accent : RS.line, width: 1.5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(g, style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 14, color: selected ? RS.accent : RS.mid)),
      ),
    );
  }

  Widget _label(String t) => Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(t, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: RS.faint)));

  Widget _input(String hint, TextEditingController ctrl, TextInputType type, {bool autoCapitalize = false, int? maxLength, ValueChanged<String>? onChange}) {
    return TextField(
      controller: ctrl,
      keyboardType: type,
      maxLength: maxLength,
      textCapitalization: autoCapitalize ? TextCapitalization.words : TextCapitalization.none,
      onChanged: onChange,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: RS.faint),
        filled: true,
        fillColor: RS.white,
        counterText: '',
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: RS.line, width: 1.5)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: RS.line, width: 1.5)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: RS.accent, width: 1.5)),
      ),
      style: const TextStyle(fontSize: 15, color: RS.ink),
    );
  }
}
