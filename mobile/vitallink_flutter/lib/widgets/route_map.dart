import 'package:flutter/material.dart';
import '../theme/colors.dart';

class RouteMap extends StatelessWidget {
  final double progress;
  final Color accent;
  final bool arrived;

  const RouteMap({super.key, this.progress = 0, this.accent = RS.accent, this.arrived = false});

  @override
  Widget build(BuildContext context) {
    final p = progress.clamp(0.0, 1.0);
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: const Color(0xFFEFEBE2),
      child: CustomPaint(painter: _RoutePainter(progress: p, accent: accent, arrived: arrived)),
    );
  }
}

class _RoutePainter extends CustomPainter {
  final double progress;
  final Color accent;
  final bool arrived;

  _RoutePainter({required this.progress, required this.accent, required this.arrived});

  @override
  void paint(Canvas canvas, Size size) {
    final roadPaint = Paint()..color = const Color(0xFFE3DDD2);
    final roadWidth = 10.0;

    // Horizontal roads
    canvas.drawRect(Rect.fromLTWH(0, size.height * 0.3, size.width, roadWidth), roadPaint);
    canvas.drawRect(Rect.fromLTWH(0, size.height * 0.64, size.width, roadWidth), roadPaint);
    // Vertical roads
    canvas.drawRect(Rect.fromLTWH(size.width * 0.24, 0, roadWidth, size.height), roadPaint);
    canvas.drawRect(Rect.fromLTWH(size.width * 0.56, 0, roadWidth, size.height), roadPaint);
    canvas.drawRect(Rect.fromLTWH(size.width * 0.8, 0, 8, size.height), roadPaint);

    // Green patches
    final greenPaint = Paint()..color = const Color(0xFFDCE8D8);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width * 0.06, size.height * 0.08, size.width * 0.14, size.height * 0.16), const Radius.circular(8)), greenPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width * 0.62, size.height * 0.72, size.width * 0.2, size.height * 0.18), const Radius.circular(8)), greenPaint);

    // Hospital marker
    final hx = size.width * 0.84;
    final hy = size.height * 0.20;
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromCenter(center: Offset(hx, hy), width: 34, height: 34), const Radius.circular(9)),
      Paint()..color = RS.white,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromCenter(center: Offset(hx, hy), width: 34, height: 34), const Radius.circular(9)),
      Paint()..color = accent..style = PaintingStyle.stroke..strokeWidth = 2,
    );

    // Hospital cross
    final crossPaint = Paint()..color = accent..strokeWidth = 3..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(hx - 7, hy), Offset(hx + 7, hy), crossPaint);
    canvas.drawLine(Offset(hx, hy - 7), Offset(hx, hy + 7), crossPaint);

    // Donor position
    final steps = [
      Offset(size.width * 0.14, size.height * 0.84),
      Offset(size.width * 0.30, size.height * 0.66),
      Offset(size.width * 0.47, size.height * 0.70),
      Offset(size.width * 0.60, size.height * 0.46),
      Offset(size.width * 0.76, size.height * 0.34),
      Offset(size.width * 0.84, size.height * 0.20),
    ];

    // Draw route dots
    final dotPaint = Paint()..color = accent.withOpacity(0.25);
    for (int i = 0; i < steps.length - 1; i++) {
      canvas.drawCircle(steps[i], 3, dotPaint);
    }

    // Interpolate donor position
    final idx = (progress * (steps.length - 1)).clamp(0.0, (steps.length - 1).toDouble());
    final i = idx.floor();
    final f = idx - i;
    Offset donorPos;
    if (i >= steps.length - 1) {
      donorPos = steps.last;
    } else {
      donorPos = Offset(
        steps[i].dx + (steps[i + 1].dx - steps[i].dx) * f,
        steps[i].dy + (steps[i + 1].dy - steps[i].dy) * f,
      );
    }

    // Pulse circle
    if (!arrived) {
      canvas.drawCircle(donorPos, 14, Paint()..color = accent.withOpacity(0.15));
    }

    // Donor dot
    canvas.drawCircle(donorPos, 10, Paint()..color = arrived ? RS.teal : accent);
    canvas.drawCircle(donorPos, 10, Paint()..color = RS.white..style = PaintingStyle.stroke..strokeWidth = 3);
  }

  @override
  bool shouldRepaint(covariant _RoutePainter old) => old.progress != progress || old.arrived != arrived;
}
