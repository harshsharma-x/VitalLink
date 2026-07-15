import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/colors.dart';

class BloodTag extends StatelessWidget {
  final String group;
  final Color accent;
  final double size;

  const BloodTag({super.key, required this.group, this.accent = RS.accent, this.size = 40});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: RS.soft,
        border: Border.all(color: accent, width: 1.5),
        borderRadius: BorderRadius.circular(10),
      ),
      alignment: Alignment.center,
      child: Text(
        group,
        style: TextStyle(
          fontFamily: 'monospace',
          fontWeight: FontWeight.w700,
          fontSize: size > 45 ? 20 : 14,
          color: accent,
        ),
      ),
    );
  }
}
