import 'package:flutter/material.dart';
import '../theme/colors.dart';

class RSBtn extends StatelessWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final Color accent;
  final bool big;
  final bool disabled;
  final bool loading;
  final Color? backgroundColor;
  final Color? textColor;

  const RSBtn({
    super.key,
    required this.child,
    this.onPressed,
    this.accent = RS.accent,
    this.big = false,
    this.disabled = false,
    this.loading = false,
    this.backgroundColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: big ? 56 : 48,
      child: ElevatedButton(
        onPressed: disabled || loading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor ?? accent,
          foregroundColor: textColor ?? RS.white,
          disabledBackgroundColor: (backgroundColor ?? accent).withOpacity(0.45),
          disabledForegroundColor: textColor ?? RS.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
        ),
        child: loading
            ? SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation(textColor ?? RS.white),
                ),
              )
            : DefaultTextStyle(
                style: TextStyle(
                  color: textColor ?? RS.white,
                  fontWeight: FontWeight.w600,
                  fontSize: big ? 17 : 15,
                ),
                child: child,
              ),
      ),
    );
  }
}
