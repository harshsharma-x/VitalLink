import 'package:flutter/material.dart';
import '../../theme/colors.dart';
import '../../widgets/blood_drop.dart';
import '../../widgets/rs_card.dart';

class DonorCompleteScreen extends StatelessWidget {
  const DonorCompleteScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RS.fog,
      body: Column(children: [
        Container(
          width: double.infinity, padding: const EdgeInsets.fromLTRB(20, 52, 20, 32),
          decoration: const BoxDecoration(color: RS.teal),
          child: const Row(children: [BloodDrop(size: 20, color: RS.white), SizedBox(width: 10), Text('VitalLink', style: TextStyle(color: RS.white, fontWeight: FontWeight.w800, fontSize: 16))]),
        ),
        Container(
          width: double.infinity, padding: const EdgeInsets.fromLTRB(28, 8, 28, 32),
          decoration: const BoxDecoration(color: RS.teal),
          child: Column(children: [
            Container(width: 72, height: 72, decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), shape: BoxShape.circle), child: const Icon(Icons.check, color: RS.white, size: 36)),
            const SizedBox(height: 12),
            const Text('You saved a life.', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: RS.white)),
            const SizedBox(height: 6),
            const Text('1 donation can save up to 3 lives.', style: TextStyle(fontSize: 13, color: Colors.white70)),
          ]),
        ),
        Expanded(child: ListView(padding: const EdgeInsets.all(18), children: [
          RSCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('RELIABILITY SCORE', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, letterSpacing: 1, color: RS.faint)),
            const SizedBox(height: 10),
            Row(children: [
              const Text('94', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 48, color: RS.teal)),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Row(children: [Text('+2', style: TextStyle(fontFamily: 'monospace', fontSize: 13, fontWeight: FontWeight.w700, color: RS.teal)), SizedBox(width: 6), Text('from this donation', style: TextStyle(fontSize: 12, color: RS.mid))]),
                const SizedBox(height: 6),
                ClipRRect(borderRadius: BorderRadius.circular(3), child: LinearProgressIndicator(value: 0.94, backgroundColor: RS.steal, valueColor: const AlwaysStoppedAnimation(RS.teal), minHeight: 5)),
                const SizedBox(height: 4),
                const Text('Top 8% of donors in Ludhiana', style: TextStyle(fontSize: 10.5, color: RS.faint)),
              ])),
            ]),
          ])),
          const SizedBox(height: 14),
          RSCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('NEXT ELIGIBLE DATE', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, letterSpacing: 1, color: RS.faint)),
            const SizedBox(height: 6),
            const Text('14 Sep 2025', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 18, color: RS.ink)),
            const SizedBox(height: 2),
            const Text('90 days after today · whole blood (O+)', style: TextStyle(fontSize: 11.5, color: RS.mid)),
          ])),
          const SizedBox(height: 14),
          SizedBox(width: double.infinity, height: 52, child: ElevatedButton(
            onPressed: () => Navigator.pushNamedAndRemoveUntil(context, '/donor/home', (_) => false),
            style: ElevatedButton.styleFrom(backgroundColor: RS.ink, foregroundColor: RS.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
            child: const Text('Back to dashboard', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          )),
        ])),
      ]),
    );
  }
}
