import 'package:flutter/material.dart';
import '../theme/colors.dart';

class RSAppHeader extends StatelessWidget {
  final String name;
  final String? sub;
  final VoidCallback? onBack;
  final Widget? right;
  final Color accent;

  const RSAppHeader({
    super.key,
    required this.name,
    this.sub,
    this.onBack,
    this.right,
    this.accent = RS.accent,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 14, 18, 12),
      decoration: const BoxDecoration(
        color: RS.white,
        border: Border(bottom: BorderSide(color: RS.line, width: 1)),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            if (onBack != null)
              GestureDetector(
                onTap: onBack,
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: RS.fog,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  alignment: Alignment.center,
                  child: const Text('‹', style: TextStyle(fontSize: 20, color: RS.ink)),
                ),
              )
            else
              Icon(Icons.water_drop, size: 16, color: accent),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: RS.ink)),
                  if (sub != null) Text(sub!, style: const TextStyle(fontSize: 11.5, color: RS.mid)),
                ],
              ),
            ),
            if (right != null) right!,
          ],
        ),
      ),
    );
  }
}
