import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/rs_app_header.dart';
import '../../widgets/rs_card.dart';
import '../../widgets/blood_tag.dart';

class PatientHistoryScreen extends StatelessWidget {
  const PatientHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RS.fog,
      appBar: const PreferredSize(preferredSize: Size.fromHeight(60), child: RSAppHeader(name: 'Request history', sub: 'Your past requests')),
      body: ListView(padding: const EdgeInsets.all(18), children: [
        _requestItem('O+', 'Apollo Hospital, Ludhiana', 'Jun 14, 2025', 'completed', '2 units'),
        _requestItem('A+', 'Max Hospital, Ludhiana', 'Mar 22, 2025', 'completed', '1 unit'),
        _requestItem('B+', 'Fortis Hospital, Ludhiana', 'Dec 10, 2024', 'completed', '3 units'),
      ]),
    );
  }

  Widget _requestItem(String group, String hospital, String date, String status, String units) {
    final colors = {'completed': (RS.teal, RS.steal), 'pending': (RS.amber, RS.samber), 'cancelled': (RS.faint, RS.fog)};
    final (fg, bg) = colors[status] ?? (RS.teal, RS.steal);
    final labels = {'completed': 'Fulfilled', 'pending': 'Pending', 'cancelled': 'Cancelled'};
    return RSCard(child: Row(children: [
      BloodTag(group: group, size: 36),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(hospital, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RS.ink)),
        const SizedBox(height: 2),
        Text('$date · $units', style: const TextStyle(fontSize: 11, color: RS.mid)),
      ])),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(100), border: Border.all(color: fg, width: 1.5)),
        child: Text(labels[status] ?? status, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: fg)),
      ),
    ]));
  }
}
