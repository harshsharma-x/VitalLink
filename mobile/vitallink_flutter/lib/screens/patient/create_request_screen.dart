import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/rs_app_header.dart';
import '../../widgets/rs_btn.dart';
import '../../widgets/rs_label.dart';
import '../../services/api_service.dart';
import '../../utils/geo.dart';

class CreateRequestScreen extends StatefulWidget {
  const CreateRequestScreen({super.key});
  @override State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  String _group = 'O+';
  int _units = 2;
  String _urgency = 'critical';
  bool _loading = false;
  bool _loadingHospitals = true;
  List<dynamic> _hospitals = [];
  dynamic _selectedHospital;
  String _error = '';

  static const _groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  static const _urgencies = [('critical', 'Critical — now'), ('day', 'Within 24 hrs'), ('planned', 'Planned')];

  @override
  void initState() { super.initState(); _fetchHospitals(); }

  Future<void> _fetchHospitals() async {
    setState(() { _loadingHospitals = true; });
    try {
      final loc = await GeoUtil.getCurrentLocation();
      if (loc == null) {
        throw Exception('Location permission denied');
      }
      final res = await ApiService.get('/hospitals/nearby?lat=${loc.latitude}&lon=${loc.longitude}&radius_km=10&limit=15');
      final list = ApiService.decode(res) as List<dynamic>? ?? [];
      setState(() {
        _hospitals = list;
        if (list.isNotEmpty) _selectedHospital = list[0];
      });
    } catch (_) {
      // Fallback
      setState(() {
        _hospitals = [{'id': 'fallback', 'name': 'Apollo Hospital, Ludhiana', 'address': 'Ludhiana, Punjab', 'distance_km': 0}];
        _selectedHospital = _hospitals[0];
      });
    } finally { setState(() => _loadingHospitals = false); }
  }

  Future<void> _submit() async {
    if (_selectedHospital == null) return;
    setState(() { _loading = true; _error = ''; });
    try {
      await ApiService.post('/requests/', body: {
        'blood_group': _group, 'units_required': _units, 'urgency': _urgency,
        'hospital_name': _selectedHospital['name'], 'hospital_address': _selectedHospital['address'],
      });
    } catch (e) { debugPrint('Create request error: $e'); }
    if (mounted) Navigator.pushReplacementNamed(context, '/patient/searching', arguments: {'blood_group': _group, 'units': _units, 'urgency': _urgency});
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RS.fog,
      appBar: const PreferredSize(preferredSize: Size.fromHeight(60), child: RSAppHeader(name: 'Emergency request', sub: 'Step 1 of 1 — takes ~30 seconds')),
      body: ListView(padding: const EdgeInsets.all(18), children: [
        const RSLabel(text: 'Blood group needed'),
        Wrap(spacing: 8, runSpacing: 8, children: _groups.map((g) => GestureDetector(
          onTap: () => setState(() => _group = g),
          child: Container(width: 72, padding: const EdgeInsets.symmetric(vertical: 11), alignment: Alignment.center,
            decoration: BoxDecoration(color: g == _group ? RS.soft : RS.white, border: Border.all(color: g == _group ? RS.accent : RS.line, width: 1.5), borderRadius: BorderRadius.circular(10)),
            child: Text(g, style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 14, color: g == _group ? RS.accent : RS.mid))),
        )).toList()),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const RSLabel(text: 'Units needed'),
            Container(decoration: BoxDecoration(color: RS.white, border: Border.all(color: RS.line, width: 1.5), borderRadius: BorderRadius.circular(10)),
              child: Row(children: [
                GestureDetector(onTap: () => setState(() { if (_units > 1) _units--; }), child: const Padding(padding: EdgeInsets.all(10), child: Text('−', style: TextStyle(fontSize: 18, color: RS.mid)))),
                Expanded(child: Text('$_units', textAlign: TextAlign.center, style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 16, color: RS.ink))),
                GestureDetector(onTap: () => setState(() { if (_units < 6) _units++; }), child: const Padding(padding: EdgeInsets.all(10), child: Text('+', style: TextStyle(fontSize: 18, color: RS.mid)))),
              ])),
          ])),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const RSLabel(text: 'Patient Hb'),
            Container(width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 13), alignment: Alignment.center,
              decoration: BoxDecoration(color: RS.white, border: Border.all(color: RS.line, width: 1.5), borderRadius: BorderRadius.circular(10)),
              child: const Text('6.8 g/dL', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w600, fontSize: 14, color: RS.ink))),
          ])),
        ]),
        const SizedBox(height: 16),
        // Hospital picker
        const RSLabel(text: 'Hospital'),
        GestureDetector(
          onTap: () => _showHospitalPicker(),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: RS.white, border: Border.all(color: RS.line, width: 1.5), borderRadius: BorderRadius.circular(12)),
            child: _loadingHospitals
                ? Row(children: [const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: RS.accent)), const SizedBox(width: 10), Text('Finding nearby hospitals…', style: TextStyle(fontSize: 13, color: RS.mid))])
                : _selectedHospital != null
                    ? Row(children: [
                        Container(width: 9, height: 9, decoration: const BoxDecoration(color: RS.accent, shape: BoxShape.circle)),
                        const SizedBox(width: 10),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(_selectedHospital['name'] ?? '', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RS.ink)),
                          const SizedBox(height: 2),
                          Text(_selectedHospital['address'] ?? '', style: const TextStyle(fontSize: 11, color: RS.mid)),
                        ])),
                        const Text('Change', style: TextStyle(fontSize: 12, color: RS.teal, fontWeight: FontWeight.w600)),
                      ])
                    : const Text('Tap to select a hospital', style: TextStyle(fontSize: 13, color: RS.mid)),
          ),
        ),
        const SizedBox(height: 16),
        // Urgency
        const RSLabel(text: 'How urgent?'),
        Row(children: _urgencies.map((u) => Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _urgency = u.$1),
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(vertical: 10),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: _urgency == u.$1 ? (u.$1 == 'critical' ? RS.soft : u.$1 == 'day' ? RS.samber : RS.steal) : RS.white,
                border: Border.all(color: _urgency == u.$1 ? (_urgency == 'critical' ? RS.accent : _urgency == 'day' ? RS.amber : RS.teal) : RS.line, width: 1.5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(u.$2, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _urgency == u.$1 ? (_urgency == 'critical' ? RS.accent : _urgency == 'day' ? RS.amber : RS.teal) : RS.mid)),
            ),
          ),
        )).toList()),
        const SizedBox(height: 16),
        const Text('Your phone number stays masked. Donors see only the hospital location.', style: TextStyle(fontSize: 11, color: RS.faint)),
      ]),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 24),
        decoration: const BoxDecoration(color: RS.white, border: Border(top: BorderSide(color: RS.line))),
        child: RSBtn(onPressed: _submit, big: true, loading: _loading, child: const Text('Send emergency request')),
      ),
    );
  }

  void _showHospitalPicker() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7, maxChildSize: 0.9, minChildSize: 0.3,
        expand: false,
        builder: (ctx, ctrl) => Column(children: [
          Padding(
            padding: const EdgeInsets.all(18),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Text('Select hospital', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: RS.ink)),
              GestureDetector(onTap: () => Navigator.pop(ctx), child: const Text('Done', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: RS.accent))),
            ]),
          ),
          Expanded(child: ListView.builder(
            controller: ctrl,
            itemCount: _hospitals.length,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemBuilder: (ctx, i) {
              final h = _hospitals[i];
              final selected = _selectedHospital?['id'] == h['id'];
              return GestureDetector(
                onTap: () { setState(() => _selectedHospital = h); Navigator.pop(ctx); },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: selected ? RS.soft : RS.white, border: Border.all(color: selected ? RS.accent : RS.line, width: 1.5), borderRadius: BorderRadius.circular(12)),
                  child: Row(children: [
                    Container(width: 9, height: 9, decoration: BoxDecoration(color: selected ? RS.accent : RS.faint, shape: BoxShape.circle)),
                    const SizedBox(width: 10),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(h['name'] ?? '', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RS.ink)),
                      const SizedBox(height: 2),
                      Text(h['address'] ?? '', style: const TextStyle(fontSize: 11.5, color: RS.mid)),
                    ])),
                    if (selected) const Icon(Icons.check, color: RS.accent, size: 20),
                  ]),
                ),
              );
            },
          )),
        ]),
      ),
    );
  }
}
