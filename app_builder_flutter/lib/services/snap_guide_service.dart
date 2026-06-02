import 'package:flutter/material.dart';
import '../models/component.dart';

class SnapGuide {
  static const double SNAP_THRESHOLD = 10.0;

  static List<SnapLine> calculateCenterSnaps(
    ComponentLayout layout,
    Size canvasSize,
  ) {
    final snaps = <SnapLine>[];
    final centerX = canvasSize.width / 2;
    final centerY = canvasSize.height / 2;
    final elementCenterX = layout.x + layout.width / 2;
    final elementCenterY = layout.y + layout.height / 2;

    // Check horizontal center
    if ((elementCenterX - centerX).abs() <= SNAP_THRESHOLD) {
      snaps.add(SnapLine(
        type: 'center-h',
        value: centerX - layout.width / 2,
        line: SnapLineData(
          x1: centerX,
          y1: 0,
          x2: centerX,
          y2: canvasSize.height,
        ),
      ));
    }

    // Check vertical center
    if ((elementCenterY - centerY).abs() <= SNAP_THRESHOLD) {
      snaps.add(SnapLine(
        type: 'center-v',
        value: centerY - layout.height / 2,
        line: SnapLineData(
          x1: 0,
          y1: centerY,
          x2: canvasSize.width,
          y2: centerY,
        ),
      ));
    }

    return snaps;
  }

  static List<SnapLine> calculateElementSnaps(
    ComponentLayout layout,
    List<Component> components,
    String excludeId,
    Size canvasSize,
  ) {
    final snaps = <SnapLine>[];
    final elementLeft = layout.x;
    final elementRight = layout.x + layout.width;
    final elementTop = layout.y;
    final elementBottom = layout.y + layout.height;
    final elementCenterX = layout.x + layout.width / 2;
    final elementCenterY = layout.y + layout.height / 2;

    for (final comp in components) {
      if (comp.id == excludeId || comp.layout == null) continue;

      final compLeft = comp.layout!.x;
      final compRight = comp.layout!.x + comp.layout!.width;
      final compTop = comp.layout!.y;
      final compBottom = comp.layout!.y + comp.layout!.height;
      final compCenterX = comp.layout!.x + comp.layout!.width / 2;
      final compCenterY = comp.layout!.y + comp.layout!.height / 2;

      // Left edge alignment
      if ((elementLeft - compLeft).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'left',
          value: compLeft,
          line: SnapLineData(x1: compLeft, y1: 0, x2: compLeft, y2: canvasSize.height),
        ));
      }
      if ((elementLeft - compRight).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'left-right',
          value: compRight,
          line: SnapLineData(x1: compRight, y1: 0, x2: compRight, y2: canvasSize.height),
        ));
      }

      // Right edge alignment
      if ((elementRight - compRight).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'right',
          value: compRight - layout.width,
          line: SnapLineData(x1: compRight, y1: 0, x2: compRight, y2: canvasSize.height),
        ));
      }
      if ((elementRight - compLeft).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'right-left',
          value: compLeft - layout.width,
          line: SnapLineData(x1: compLeft, y1: 0, x2: compLeft, y2: canvasSize.height),
        ));
      }

      // Top edge alignment
      if ((elementTop - compTop).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'top',
          value: compTop,
          line: SnapLineData(x1: 0, y1: compTop, x2: canvasSize.width, y2: compTop),
        ));
      }
      if ((elementTop - compBottom).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'top-bottom',
          value: compBottom,
          line: SnapLineData(x1: 0, y1: compBottom, x2: canvasSize.width, y2: compBottom),
        ));
      }

      // Bottom edge alignment
      if ((elementBottom - compBottom).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'bottom',
          value: compBottom - layout.height,
          line: SnapLineData(x1: 0, y1: compBottom, x2: canvasSize.width, y2: compBottom),
        ));
      }
      if ((elementBottom - compTop).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'bottom-top',
          value: compTop - layout.height,
          line: SnapLineData(x1: 0, y1: compTop, x2: canvasSize.width, y2: compTop),
        ));
      }

      // Center alignment
      if ((elementCenterX - compCenterX).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'center-x',
          value: compCenterX - layout.width / 2,
          line: SnapLineData(x1: compCenterX, y1: 0, x2: compCenterX, y2: canvasSize.height),
        ));
      }
      if ((elementCenterY - compCenterY).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'center-y',
          value: compCenterY - layout.height / 2,
          line: SnapLineData(x1: 0, y1: compCenterY, x2: canvasSize.width, y2: compCenterY),
        ));
      }

      // Corner alignment
      if ((elementLeft - compLeft).abs() <= SNAP_THRESHOLD &&
          (elementTop - compTop).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'corner-tl',
          value: {'x': compLeft, 'y': compTop},
          line: SnapLineData(x1: compLeft, y1: compTop, x2: compLeft, y2: compTop),
        ));
      }
      if ((elementRight - compRight).abs() <= SNAP_THRESHOLD &&
          (elementTop - compTop).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'corner-tr',
          value: {'x': compRight - layout.width, 'y': compTop},
          line: SnapLineData(x1: compRight, y1: compTop, x2: compRight, y2: compTop),
        ));
      }
      if ((elementLeft - compLeft).abs() <= SNAP_THRESHOLD &&
          (elementBottom - compBottom).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'corner-bl',
          value: {'x': compLeft, 'y': compBottom - layout.height},
          line: SnapLineData(x1: compLeft, y1: compBottom, x2: compLeft, y2: compBottom),
        ));
      }
      if ((elementRight - compRight).abs() <= SNAP_THRESHOLD &&
          (elementBottom - compBottom).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'corner-br',
          value: {'x': compRight - layout.width, 'y': compBottom - layout.height},
          line: SnapLineData(x1: compRight, y1: compBottom, x2: compRight, y2: compBottom),
        ));
      }
    }

    return snaps;
  }

  static List<SnapLine> calculateSizeSnaps(
    double width,
    double height,
    List<Component> components,
    String excludeId,
  ) {
    final snaps = <SnapLine>[];

    for (final comp in components) {
      if (comp.id == excludeId || comp.layout == null) continue;

      // Width snapping
      if ((width - comp.layout!.width).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'width',
          value: comp.layout!.width,
          line: SnapLineData(
            x1: comp.layout!.x,
            y1: comp.layout!.y,
            x2: comp.layout!.x + comp.layout!.width,
            y2: comp.layout!.y,
          ),
        ));
      }

      // Height snapping
      if ((height - comp.layout!.height).abs() <= SNAP_THRESHOLD) {
        snaps.add(SnapLine(
          type: 'height',
          value: comp.layout!.height,
          line: SnapLineData(
            x1: comp.layout!.x,
            y1: comp.layout!.y,
            x2: comp.layout!.x,
            y2: comp.layout!.y + comp.layout!.height,
          ),
        ));
      }
    }

    return snaps;
  }

  static Offset applySnaps(ComponentLayout layout, List<SnapLine> snaps) {
    double newX = layout.x;
    double newY = layout.y;

    for (final snap in snaps) {
      if (snap.type == 'center-h' || snap.type == 'center-x') {
        newX = snap.value as double;
      } else if (snap.type == 'center-v' || snap.type == 'center-y') {
        newY = snap.value as double;
      } else if (snap.type.startsWith('left') || snap.type.startsWith('right')) {
        newX = snap.value as double;
      } else if (snap.type.startsWith('top') || snap.type.startsWith('bottom')) {
        newY = snap.value as double;
      } else if (snap.type.startsWith('corner')) {
        if (snap.value is Map) {
          final value = snap.value as Map;
          if (value.containsKey('x')) newX = value['x'] as double;
          if (value.containsKey('y')) newY = value['y'] as double;
        }
      }
    }

    return Offset(newX, newY);
  }
}

class SnapLine {
  final String type;
  final dynamic value;
  final SnapLineData line;

  SnapLine({
    required this.type,
    required this.value,
    required this.line,
  });
}

class SnapLineData {
  final double x1;
  final double y1;
  final double x2;
  final double y2;

  SnapLineData({
    required this.x1,
    required this.y1,
    required this.x2,
    required this.y2,
  });
}
