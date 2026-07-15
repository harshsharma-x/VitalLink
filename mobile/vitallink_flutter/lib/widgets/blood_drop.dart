import 'package:flutter/material.dart';
import '../theme/colors.dart';

class BloodDrop extends StatelessWidget {
  final double size;
  final Color color;

  const BloodDrop({super.key, this.size = 18, this.color = RS.accent});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.only(
          topLeft: Radius.zero,
          topRight: Radius.circular(size),
          bottomRight: Radius.circular(size),
          bottomLeft: Radius.circular(size),
        ),
      ),
    );
  }
}
