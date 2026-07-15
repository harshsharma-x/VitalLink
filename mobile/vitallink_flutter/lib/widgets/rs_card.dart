import 'package:flutter/material.dart';
import '../theme/colors.dart';

class RSCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? backgroundColor;
  final BoxBorder? border;

  const RSCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      padding: padding ?? const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: backgroundColor ?? RS.white,
        border: border ?? Border.all(color: RS.line, width: 1),
        borderRadius: BorderRadius.circular(14),
      ),
      child: child,
    );
  }
}
