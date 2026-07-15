import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/rs_app_header.dart';
import '../../widgets/blood_tag.dart';

class DonorHistoryScreen extends StatelessWidget {
  const DonorHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RS.fog,
      appBar: const PreferredSize(preferredSize: Size.fromHeight(60), child: RSAppHeader(name: 'Donation history', sub: 'Your impact timeline')),
      body: ListView(padding: const EdgeInsets.all(18), children: [
        Container(
          padding: const EdgeInsets.all(18), width: double.infinity,
          decoration: BoxDecoration(color: RS.accent, borderRadius: BorderRadius.circular(18), boxShadow: [BoxShadow(color: RS.accent.withOpacity(0.3), blurRadius: 30, offset: const Offset(0, 14))]),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                Text('3', style: TextStyle(fontFamily: 'monospace', fontSize: 32, fontWeight: FontWeight.w700, color: RS.white)),
                SizedBox(height: 2),
                Text('donations completed', style: TextStyle(fontSize: 12, color: Colors.white70)),
              ]),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: const [
                Text('Next milestone', style: TextStyle(fontSize: 11, color: Colors.white54)),
                Text('5', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 20, color: RS.white)),
              ]),
            ]),
            const SizedBox(height: 10),
            ClipRRect(borderRadius: BorderRadius.circular(3), child: LinearProgressIndicator(value: 0.6, backgroundColor: Colors.white24, valueColor: const AlwaysStoppedAnimation(RS.white), minHeight: 5)),
            const SizedBox(height: 6),
            Text('2 more to reach your next milestone', style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.5))),
          ]),
        ),
        const SizedBox(height: 20),
        _timelineItem('Apollo Hospital, Ludhiana', 'Jun 14, 2025', 'completed'),
        _timelineItem('Max Hospital, Ludhiana', 'Mar 22, 2025', 'completed'),
        _timelineItem('Fortis Hospital, Ludhiana', 'Dec 10, 2024', 'completed'),
      ]),
    );
  }

  Widget _timelineItem(String hospital, String date, String status) {
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SizedBox(width: 32, child: Column(children: [
        Container(width: 14, height: 14, decoration: BoxDecoration(shape: BoxShape.circle, color: status == 'completed' ? RS.teal : RS.line)),
        Container(width: 2, height: 30, color: RS.line),
      ])),
      Expanded(child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: RS.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: RS.line)),
        child: Row(children: [
          const BloodTag(group: 'O+', size: 32),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(hospital, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RS.ink)),
            const SizedBox(height: 2),
            Text('$date · 1 unit', style: const TextStyle(fontSize: 11, color: RS.mid)),
          ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
            decoration: BoxDecoration(color: RS.steal, borderRadius: BorderRadius.circular(100), border: Border.all(color: RS.teal, width: 1.5)),
            child: const Text('Done', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: RS.teal)),
          ),
        ]),
      )),
    ]);
  }
}
