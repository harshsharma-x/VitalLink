import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/rs_app_header.dart';
import '../../widgets/rs_card.dart';
import '../../widgets/rs_label.dart';
import '../../services/api_service.dart';
import '../../utils/geo.dart';

class BloodBanksScreen extends StatefulWidget {
  const BloodBanksScreen({super.key});
  @override State<BloodBanksScreen> createState() => _BloodBanksScreenState();
}

class _BloodBanksScreenState extends State<BloodBanksScreen> {
  String _tab = 'banks';
  String? _filter;
  List<dynamic> _banks = [];
  List<dynamic> _hospitals = [];
  bool _loading = true;
  String _error = '';
  String _locLabel = 'Detecting location…';

  static const _groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = ''; });
    try {
      final loc = await GeoUtil.getCurrentLocation();
      if (loc == null) {
        setState(() { _error = 'Location permission denied.'; _loading = false; });
        return;
      }
      final lat = loc.latitude;
      final lon = loc.longitude;
      _locLabel = '${lat.toStringAsFixed(2)}, ${lon.toStringAsFixed(2)}';
      final bankRes = await ApiService.get('/bloodbanks/nearby?lat=$lat&lon=$lon&radius_km=10&limit=20');
      final hospRes = await ApiService.get('/hospitals/nearby?lat=$lat&lon=$lon&radius_km=10&limit=20');
      _banks = ApiService.decode(bankRes) ?? [];
      _hospitals = ApiService.decode(hospRes) ?? [];
    } catch (_) { _error = 'Could not load data. Check your connection.'; }
    setState(() => _loading = false);
  }

  Color _stockColor(int? units) {
    if (units == null) return RS.faint;
    if (units == 0) return RS.accent;
    if (units < 4) return RS.amber;
    return RS.teal;
  }

  @override
  Widget build(BuildContext context) {
    final list = _tab == 'banks' ? _banks : _hospitals;
    return Scaffold(
      backgroundColor: RS.fog,
      appBar: PreferredSize(preferredSize: const Size.fromHeight(60), child: RSAppHeader(name: _tab == 'banks' ? 'Blood banks' : 'Hospitals', sub: _locLabel)),
      body: Column(children: [
        Container(color: RS.white, child: Row(children: [
          _tabBtn('banks', 'Blood banks'), _tabBtn('hospitals', 'Hospitals'),
        ])),
        Expanded(child: _loading
            ? const Center(child: CircularProgressIndicator(color: RS.accent))
            : _error.isNotEmpty
                ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Text(_error, style: const TextStyle(fontSize: 14, color: RS.ink)),
                    const SizedBox(height: 12),
                    TextButton(onPressed: _load, child: const Text('Retry', style: TextStyle(color: RS.accent))),
                  ]))
                : RefreshIndicator(
                    onRefresh: _load,
                    child: ListView(padding: const EdgeInsets.all(18), children: [
                      if (_tab == 'banks') ...[
                        const RSLabel(text: 'Filter by group'),
                        SizedBox(height: 40, child: ListView(scrollDirection: Axis.horizontal, children: [
                          _filterChip(null), ..._groups.map((g) => _filterChip(g)),
                        ])),
                        const SizedBox(height: 10),
                      ],
                      if (list.isEmpty)
                        const Padding(padding: EdgeInsets.only(top: 48), child: Text('Nothing found nearby', textAlign: TextAlign.center, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: RS.ink)))
                      else
                        ...list.map((item) => _tab == 'banks' ? _bankCard(item) : _hospitalCard(item)),
                    ]),
                  )),
      ]),
    );
  }

  Widget _tabBtn(String id, String label) {
    return Expanded(child: GestureDetector(
      onTap: () => setState(() => _tab = id),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 11),
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: _tab == id ? RS.accent : Colors.transparent, width: 2))),
        child: Text(label, textAlign: TextAlign.center, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: _tab == id ? RS.accent : RS.mid)),
      ),
    ));
  }

  Widget _filterChip(String? group) {
    final selected = _filter == group;
    return GestureDetector(
      onTap: () => setState(() => _filter = group),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(color: selected ? RS.soft : RS.white, border: Border.all(color: selected ? RS.accent : RS.line, width: 1.5), borderRadius: BorderRadius.circular(100)),
        child: Text(group ?? 'All', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 12, color: selected ? RS.accent : RS.mid)),
      ),
    );
  }

  Widget _bankCard(dynamic bank) {
    final stock = bank['stock'] as Map<String, dynamic>?;
    final dist = (bank['distance_km'] as num?)?.toDouble() ?? 0;
    final distStr = dist < 1 ? '${(dist * 1000).round()} m' : '${dist.toStringAsFixed(1)} km';
    return RSCard(margin: const EdgeInsets.only(bottom: 14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(bank['name'] ?? 'Unknown', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RS.ink)),
          const SizedBox(height: 2),
          Text(bank['address'] ?? '', style: const TextStyle(fontSize: 11.5, color: RS.mid), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 5),
          Row(children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2), decoration: BoxDecoration(color: RS.fog, borderRadius: BorderRadius.circular(5)),
              child: Text(distStr, style: const TextStyle(fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.w600, color: RS.ink))),
            if (bank['rating'] != null) ...[const SizedBox(width: 8), Text('★ ${(bank['rating'] as num).toStringAsFixed(1)}', style: const TextStyle(fontSize: 11, color: RS.mid))],
          ]),
        ])),
        const Text('Maps ›', style: TextStyle(fontSize: 11, color: RS.teal, fontWeight: FontWeight.w600)),
      ]),
      if (stock != null) ...[
        const SizedBox(height: 10),
        Wrap(spacing: 6, runSpacing: 6, children: (_filter != null ? [_filter!] : _groups).map((g) {
          final units = stock[g] as int?;
          final color = _stockColor(units);
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
            decoration: BoxDecoration(color: color.withOpacity(0.1), border: Border.all(color: color, width: 1.5), borderRadius: BorderRadius.circular(8)),
            child: Column(children: [
              Text(g, style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 11, color: color)),
              Text(units == null ? '?' : units == 0 ? 'Out' : '${units}u', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
            ]),
          );
        }).toList()),
      ],
    ]));
  }

  Widget _hospitalCard(dynamic h) {
    final dist = (h['distance_km'] as num?)?.toDouble() ?? 0;
    final distStr = dist < 1 ? '${(dist * 1000).round()} m' : '${dist.toStringAsFixed(1)} km';
    return RSCard(margin: const EdgeInsets.only(bottom: 14), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(h['name'] ?? 'Unknown', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RS.ink)),
        const SizedBox(height: 2),
        Text(h['address'] ?? '', style: const TextStyle(fontSize: 11.5, color: RS.mid), maxLines: 1, overflow: TextOverflow.ellipsis),
        const SizedBox(height: 5),
        Row(children: [
          Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2), decoration: BoxDecoration(color: RS.fog, borderRadius: BorderRadius.circular(5)),
            child: Text(distStr, style: const TextStyle(fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.w600, color: RS.ink))),
          if (h['rating'] != null) ...[const SizedBox(width: 8), Text('★ ${(h['rating'] as num).toStringAsFixed(1)}', style: const TextStyle(fontSize: 11, color: RS.mid))],
        ]),
      ])),
      const Text('Maps ›', style: TextStyle(fontSize: 11, color: RS.teal, fontWeight: FontWeight.w600)),
    ]));
  }
}
