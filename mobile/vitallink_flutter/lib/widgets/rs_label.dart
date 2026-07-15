import 'package:flutter/material.dart';
import '../theme/colors.dart';

class RSLabel extends StatelessWidget {
  final String text;

  const RSLabel({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: RS.faint,
        ),
      ),
    );
  }
}
