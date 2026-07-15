import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/rs_app_header.dart';
import '../../widgets/rs_card.dart';
import '../../widgets/rs_btn.dart';

class DonationScreen extends StatefulWidget {
  const DonationScreen({super.key});
  @override State<DonationScreen> createState() => _DonationScreenState();
}

class _DonationScreenState extends State<DonationScreen> {
  final Set<String> _done = {};
  static const _steps = [
    ('id', 'ID verified by hospital staff', 'Show your ABHA QR or any govt. photo ID'),
    ('screen', 'Pre-donation screening done', 'BP, Hb, weight check — takes ~5 min'),
    ('donate', 'Blood collected (1 unit ≈ 450 ml)', 'Takes 8–10 minutes. Stay relaxed.'),
    ('rest', 'Post-donation rest (15 min)', 'Have juice and biscuits provided by staff'),
  ];

  @override
  Widget build(BuildContext context) {
    final allDone = _steps.every((s) => _done.contains(s.$1));
    return Scaffold(
      backgroundColor: RS.fog,
      appBar: const PreferredSize(preferredSize: Size.fromHeight(60), child: RSAppHeader(name: 'Donation checklist', sub: 'Apollo Hospital · O+ · 1 unit')),
      body: ListView(padding: const EdgeInsets.all(18), children: [
        RSCard(child: Column(children: _steps.asMap().entries.map((e) {
          final i = e.key;
          final step = e.value;
          final checked = _done.contains(step.$1);
          return GestureDetector(
            onTap: () => setState(() { checked ? _done.remove(step.$1) : _done.add(step.$1); }),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: i < _steps.length - 1 ? const BoxDecoration(border: Border(bottom: BorderSide(color: RS.line))) : null,
              child: Row(children: [
                Container(width: 22, height: 22, decoration: BoxDecoration(shape: BoxShape.circle, color: checked ? RS.teal : RS.fog, border: Border.all(color: checked ? RS.teal : RS.line, width: 1.5)),
                  child: checked ? const Icon(Icons.check, color: RS.white, size: 14) : null),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(step.$2, style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: checked ? RS.teal : RS.ink, decoration: checked ? TextDecoration.lineThrough : null)),
                  const SizedBox(height: 3),
                  Text(step.$3, style: const TextStyle(fontSize: 11.5, color: RS.mid)),
                ])),
              ]),
            ),
          );
        }).toList())),
        const SizedBox(height: 16),
        RSCard(
          backgroundColor: RS.samber, border: Border.all(color: RS.amber, width: 1.5),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Your QR Unit Tag', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: RS.amber)),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16), width: double.infinity,
              decoration: BoxDecoration(color: RS.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: RS.line)),
              child: const Text('VTL-REQ-O+-1U', textAlign: TextAlign.center, style: TextStyle(fontFamily: 'monospace', fontSize: 12, color: RS.ink)),
            ),
            const SizedBox(height: 8),
            const Text('Show this tag to hospital staff for the unit to be logged against your ABHA ID.', style: TextStyle(fontSize: 11, color: RS.amber)),
          ]),
        ),
        const SizedBox(height: 12),
        const Text('You can donate again after 90 days (whole blood). Platelets every 7 days.', textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: RS.faint)),
      ]),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 24),
        decoration: const BoxDecoration(color: RS.white, border: Border(top: BorderSide(color: RS.line))),
        child: RSBtn(onPressed: allDone ? () => Navigator.pushReplacementNamed(context, '/donor/complete') : null, big: true, child: const Text('Confirm donation complete')),
      ),
    );
  }
}
