import 'package:flutter/material.dart';
import '../services/snap_guide_service.dart';

class SnapGuideOverlay extends StatelessWidget {
  final List<SnapLine> snaps;
  final Size canvasSize;

  const SnapGuideOverlay({
    super.key,
    required this.snaps,
    required this.canvasSize,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: IgnorePointer(
        child: CustomPaint(
          painter: SnapGuidePainter(snaps: snaps, canvasSize: canvasSize),
        ),
      ),
    );
  }
}

class SnapGuidePainter extends CustomPainter {
  final List<SnapLine> snaps;
  final Size canvasSize;

  SnapGuidePainter({
    required this.snaps,
    required this.canvasSize,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..strokeWidth = 1
      ..color = const Color(0xFF0891B2).withOpacity(0.5);

    final centerPaint = Paint()
      ..strokeWidth = 1
      ..color = const Color(0xFF06B6D4).withOpacity(0.7);

    for (final snap in snaps) {
      final line = snap.line;
      final isCenter = snap.type.contains('center');
      final currentPaint = isCenter ? centerPaint : paint;

      // Extend lines appropriately
      double x1 = line.x1;
      double y1 = line.y1;
      double x2 = line.x2;
      double y2 = line.y2;

      if (isCenter) {
        // Center lines extend across full canvas
        if (line.x1 == line.x2) {
          // Vertical line
          y1 = 0;
          y2 = canvasSize.height;
        } else {
          // Horizontal line
          x1 = 0;
          x2 = canvasSize.width;
        }
      } else {
        // Edge alignment lines - extend with padding
        const padding = 100.0;
        if (line.y1 == line.y2) {
          // Horizontal line
          x1 = (line.x1 - padding).clamp(0, canvasSize.width);
          x2 = (line.x2 + padding).clamp(0, canvasSize.width);
        } else {
          // Vertical line
          y1 = (line.y1 - padding).clamp(0, canvasSize.height);
          y2 = (line.y2 + padding).clamp(0, canvasSize.height);
        }
      }

      // Draw line with gradient effect
      _drawGradientLine(canvas, x1, y1, x2, y2, currentPaint, isCenter);
    }
  }

  void _drawGradientLine(
    Canvas canvas,
    double x1,
    double y1,
    double x2,
    double y2,
    Paint paint,
    bool isCenter,
  ) {
    // Draw main line
    canvas.drawLine(Offset(x1, y1), Offset(x2, y2), paint);

    // Add glow effect
    final glowPaint = Paint()
      ..strokeWidth = 3
      ..color = paint.color.withOpacity(0.2)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2);

    canvas.drawLine(Offset(x1, y1), Offset(x2, y2), glowPaint);
  }

  @override
  bool shouldRepaint(SnapGuidePainter oldDelegate) {
    return oldDelegate.snaps.length != snaps.length ||
        oldDelegate.canvasSize != canvasSize;
  }
}
