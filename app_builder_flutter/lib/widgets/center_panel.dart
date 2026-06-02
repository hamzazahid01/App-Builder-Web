import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_config.dart';
import '../models/component.dart';
import '../models/component_defaults.dart';
import '../models/page.dart' as app_models;
import '../providers/app_state_provider.dart';
import '../services/snap_guide_service.dart';
import 'component_renderer.dart';
import 'snap_guide_overlay.dart';

class CenterPanel extends StatefulWidget {
  const CenterPanel({super.key});

  @override
  State<CenterPanel> createState() => _CenterPanelState();
}

class _CenterPanelState extends State<CenterPanel> {
  RenderBox? _canvasBox;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0B1220),
        ),
        child: Column(
          children: [
            _buildToolbar(),
            _buildPageTabs(),
            Expanded(
              child: _buildPreviewViewport(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToolbar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Mobile canvas',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Preview your app design in real time',
                  style: TextStyle(
                    color: Colors.grey.shade400,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 20),
          _buildDeviceSwitcher(),
          const SizedBox(width: 12),
          _buildZoomControl(),
          const SizedBox(width: 12),
          _buildSnapToggle(),
        ],
      ),
    );
  }

  Widget _buildDeviceSwitcher() {
    return Consumer<AppStateProvider>(
      builder: (context, provider, child) {
        final currentDevice = provider.deviceMap[provider.currentDeviceKey];
        return Row(
          children: [
            Text(
              'Device',
              style: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 12,
              ),
            ),
            const SizedBox(width: 8),
            PopupMenuButton<String>(
              initialValue: provider.currentDeviceKey,
              onSelected: (deviceKey) {
                provider.setCurrentDevice(deviceKey);
              },
              itemBuilder: (context) {
                return provider.deviceMap.entries.map((entry) {
                  return PopupMenuItem<String>(
                    value: entry.key,
                    child: Row(
                      children: [
                        Text(
                          entry.value.label,
                          style: const TextStyle(
                            color: Color(0xFFF8FAFC),
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${entry.value.width.toInt()}x${entry.value.height.toInt()}',
                          style: TextStyle(
                            color: Colors.grey.shade400,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList();
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.white.withOpacity(0.12)),
                  color: Colors.white.withOpacity(0.06),
                ),
                child: Row(
                  children: [
                    Text(
                      currentDevice?.label ?? 'iPhone 14',
                      style: const TextStyle(
                        color: Color(0xFFF8FAFC),
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(
                      Icons.keyboard_arrow_down,
                      size: 16,
                      color: Colors.grey.shade400,
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildZoomControl() {
    return Consumer<AppStateProvider>(
      builder: (context, provider, child) {
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.white.withOpacity(0.12)),
            color: Colors.white.withOpacity(0.06),
          ),
          child: Row(
            children: [
              _buildZoomButton('−', () {
                final newZoom = (provider.previewZoom - 0.1).clamp(0.5, 2.0);
                provider.setPreviewZoom(newZoom);
              }),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text(
                  '${(provider.previewZoom * 100).toInt()}%',
                  style: const TextStyle(
                    color: Color(0xFFF8FAFC),
                    fontSize: 12,
                  ),
                ),
              ),
              _buildZoomButton('+', () {
                final newZoom = (provider.previewZoom + 0.1).clamp(0.5, 2.0);
                provider.setPreviewZoom(newZoom);
              }),
            ],
          ),
        );
      },
    );
  }

  Widget _buildZoomButton(String label, VoidCallback onTap) {
    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        border: Border(
          right: BorderSide(color: Colors.white.withOpacity(0.08)),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          child: Center(
            child: Text(
              label,
              style: const TextStyle(
                color: Color(0xFFF8FAFC),
                fontSize: 14,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSnapToggle() {
    return Consumer<AppStateProvider>(
      builder: (context, provider, child) {
        return Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: provider.snapToGrid
                  ? const Color(0xFF8B5CF6)
                  : Colors.white.withOpacity(0.12),
            ),
            color: provider.snapToGrid
                ? const Color(0xFF8B5CF6).withOpacity(0.2)
                : Colors.white.withOpacity(0.08),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                provider.setSnapToGrid(!provider.snapToGrid);
              },
              borderRadius: BorderRadius.circular(8),
              child: const Center(
                child: Text(
                  '🧲',
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildPageTabs() {
    return Consumer<AppStateProvider>(
      builder: (context, provider, child) {
        return Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: provider.app.pages.map((page) {
              final isActive = page.id == provider.app.currentPageId;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: _buildPageTab(page.name, isActive, () {
                  provider.setCurrentPage(page.id);
                }),
              );
            }).toList(),
          ),
        );
      },
    );
  }

  Widget _buildPageTab(String title, bool isActive, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          color: isActive
              ? const Color(0xFF8B5CF6).withOpacity(0.2)
              : Colors.white.withOpacity(0.04),
          border: Border.all(
            color: isActive
                ? const Color(0xFF8B5CF6)
                : Colors.white.withOpacity(0.08),
          ),
        ),
        child: Text(
          title,
          style: TextStyle(
            color: isActive ? const Color(0xFF8B5CF6) : Colors.grey.shade400,
            fontSize: 12,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildPreviewViewport() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Center(
        child: _buildMobilePreview(),
      ),
    );
  }

  Widget _buildMobilePreview() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(48),
        color: Colors.transparent,
      ),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(62),
          color: const Color(0xFF0D111D).withOpacity(0.95),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.18),
              blurRadius: 90,
              offset: const Offset(0, 30),
            ),
          ],
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: _buildDeviceScreen(),
      ),
    );
  }

  Widget _buildDeviceScreen() {
    return Consumer<AppStateProvider>(
      builder: (context, provider, child) {
        final page = provider.getCurrentPage();
        final deviceInfo = provider.deviceMap[provider.currentDeviceKey] ??
            provider.deviceMap['iphone-14']!;

        return Container(
          width: deviceInfo.width * provider.previewZoom,
          height: deviceInfo.height * provider.previewZoom,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(44),
            color: const Color(0xFFF8FBFF),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F172A).withOpacity(0.08),
                blurRadius: 0,
                offset: const Offset(0, 0),
                spreadRadius: 1,
              ),
              BoxShadow(
                color: const Color(0xFF0F172A).withOpacity(0.05),
                blurRadius: 30,
                offset: const Offset(0, 16),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Notch
              Positioned(
                top: 14,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    width: 104,
                    height: 7,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      color: Colors.black.withOpacity(0.12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 1,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              // Home indicator
              Positioned(
                bottom: 18,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    width: 72,
                    height: 6,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      color: Colors.black.withOpacity(0.12),
                    ),
                  ),
                ),
              ),
              // Canvas content
              Positioned.fill(
                top: 30,
                bottom: 30,
                left: 12,
                right: 12,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(40),
                  child: Listener(
                    onPointerDown: (event) {
                      // Check if dragging from library (would have Draggable data)
                      // For now, just track canvas box
                      _canvasBox = context.findRenderObject() as RenderBox?;
                    },
                    onPointerMove: (event) {
                      // Track canvas box during drag
                      _canvasBox = context.findRenderObject() as RenderBox?;
                    },
                    onPointerUp: (event) {
                      // Handle drop from library - check if we have a pending drag session
                      // This would be handled by the Draggable widget from left panel
                      _canvasBox = context.findRenderObject() as RenderBox?;
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: page != null
                            ? _parseColor(page.backgroundColor)
                            : Colors.white,
                      ),
                      child: Stack(
                        children: [
                          // Snap guide overlay (global)
                          Consumer<AppStateProvider>(
                            builder: (context, provider, child) {
                              return _buildSnapGuideOverlay(provider, page);
                            },
                          ),
                          // Components
                          if (page != null && page.components.isNotEmpty)
                            ...page.components.map((component) {
                              if (component is Component) {
                                return ComponentRenderer(
                                  component: component,
                                  isSelected: component.id == provider.selectedId,
                                  onTap: () {
                                    provider.selectComponent(component.id);
                                  },
                                  onPositionChanged: (x, y) {
                                    if (component.layout != null) {
                                      provider.updateComponentLayout(
                                        component.id,
                                        component.layout!.copyWith(x: x, y: y),
                                        notify: false,
                                      );
                                    }
                                  },
                                  onDragEnd: () {
                                    provider.notifyListeners();
                                  },
                                );
                              }
                              return const SizedBox.shrink();
                            }).toList(),
                          if (page == null || page.components.isEmpty)
                            const Center(
                              child: Text(
                                'Canvas Area',
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Offset? _getCanvasDropOffset(Offset globalOffset) {
    if (_canvasBox == null) return null;
    return _canvasBox!.globalToLocal(globalOffset);
  }

  ComponentLayout _buildDropLayout({
    required String componentType,
    required Offset dropOffset,
    required app_models.Page? page,
  }) {
    final defaults = ComponentDefaults.getDefaults(componentType);
    final layoutDefaults = defaults['layout'] as Map<String, dynamic>?;
    final width = (layoutDefaults?['width'] as num?)?.toDouble() ?? AppConfig.defaultComponentWidth;
    final height = (layoutDefaults?['height'] as num?)?.toDouble() ?? AppConfig.defaultComponentHeight;

    final maxX = math.max(AppConfig.canvasMaxWidth - width, 0.0);
    final maxY = math.max(AppConfig.canvasMaxHeight - height, 0.0);
    final x = dropOffset.dx.clamp(0.0, maxX);
    final y = dropOffset.dy.clamp(0.0, maxY);

    final zIndex = (page?.components.length ?? 0) + 1;

    return ComponentLayout(
      x: x,
      y: y,
      width: width,
      height: height,
      zIndex: zIndex,
    );
  }

  Color? _parseColor(String? colorString) {
    if (colorString == null || colorString.isEmpty) return Colors.white;
    try {
      if (colorString.startsWith('#')) {
        return Color(int.parse(colorString.substring(1), radix: 16) + 0xFF000000);
      }
      return Colors.white;
    } catch (e) {
      return Colors.white;
    }
  }

  Widget _buildSnapGuideOverlay(AppStateProvider provider, app_models.Page? page) {
    final selectedComponent = provider.findSelectedComponent();
    if (selectedComponent == null || selectedComponent.layout == null) {
      return const SizedBox.shrink();
    }

    final layout = selectedComponent.layout!;
    final otherComponents = page?.components.where((c) => c.id != selectedComponent.id).toList() ?? [];
    final deviceInfo = provider.deviceMap[provider.currentDeviceKey] ?? provider.deviceMap['iphone-14']!;
    
    return Positioned.fill(
      child: IgnorePointer(
        child: CustomPaint(
          painter: _SnapGuidePainter(
            layout: layout,
            otherComponents: otherComponents,
            canvasWidth: deviceInfo.width,
            canvasHeight: deviceInfo.height,
          ),
        ),
      ),
    );
  }
}

class _SnapGuidePainter extends CustomPainter {
  final ComponentLayout layout;
  final List<Component> otherComponents;
  final double canvasWidth;
  final double canvasHeight;
  static const double snapThreshold = 10.0;

  _SnapGuidePainter({
    required this.layout,
    required this.otherComponents,
    required this.canvasWidth,
    required this.canvasHeight,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final guides = _calculateGuides();
    
    for (final guide in guides) {
      final paint = Paint()
        ..color = guide.isCenter 
            ? const Color(0xFF06B6D4).withOpacity(0.7)
            : const Color(0xFF0891B2).withOpacity(0.5)
        ..strokeWidth = 1
        ..style = PaintingStyle.stroke;

      if (guide.isHorizontal) {
        canvas.drawLine(
          Offset(guide.x1, guide.y1),
          Offset(guide.x2, guide.y2),
          paint,
        );
      } else {
        canvas.drawLine(
          Offset(guide.x1, guide.y1),
          Offset(guide.x2, guide.y2),
          paint,
        );
      }
    }
  }

  List<_GuideLine> _calculateGuides() {
    final guides = <_GuideLine>[];
    final elementLeft = layout.x;
    final elementRight = layout.x + layout.width;
    final elementTop = layout.y;
    final elementBottom = layout.y + layout.height;
    final elementCenterX = layout.x + layout.width / 2;
    final elementCenterY = layout.y + layout.height / 2;

    // Center alignment with canvas
    final centerX = canvasWidth / 2;
    final centerY = canvasHeight / 2;

    if ((elementCenterX - centerX).abs() <= snapThreshold) {
      guides.add(_GuideLine(
        x1: centerX, y1: 0, x2: centerX, y2: canvasHeight,
        isHorizontal: false, isCenter: true,
      ));
    }

    if ((elementCenterY - centerY).abs() <= snapThreshold) {
      guides.add(_GuideLine(
        x1: 0, y1: centerY, x2: canvasWidth, y2: centerY,
        isHorizontal: true, isCenter: true,
      ));
    }

    // Alignment with other components
    for (final comp in otherComponents) {
      final compLayout = comp.layout;
      if (compLayout == null) continue;

      final compLeft = compLayout.x;
      final compRight = compLayout.x + compLayout.width;
      final compTop = compLayout.y;
      final compBottom = compLayout.y + compLayout.height;
      final compCenterX = compLayout.x + compLayout.width / 2;
      final compCenterY = compLayout.y + compLayout.height / 2;

      // Left edge alignment
      if ((elementLeft - compLeft).abs() <= snapThreshold) {
        guides.add(_GuideLine(
          x1: compLeft, y1: 0, x2: compLeft, y2: canvasHeight,
          isHorizontal: false, isCenter: false,
        ));
      }

      // Right edge alignment
      if ((elementRight - compRight).abs() <= snapThreshold) {
        guides.add(_GuideLine(
          x1: compRight, y1: 0, x2: compRight, y2: canvasHeight,
          isHorizontal: false, isCenter: false,
        ));
      }

      // Top edge alignment
      if ((elementTop - compTop).abs() <= snapThreshold) {
        guides.add(_GuideLine(
          x1: 0, y1: compTop, x2: canvasWidth, y2: compTop,
          isHorizontal: true, isCenter: false,
        ));
      }

      // Bottom edge alignment
      if ((elementBottom - compBottom).abs() <= snapThreshold) {
        guides.add(_GuideLine(
          x1: 0, y1: compBottom, x2: canvasWidth, y2: compBottom,
          isHorizontal: true, isCenter: false,
        ));
      }

      // Center alignment with other component
      if ((elementCenterX - compCenterX).abs() <= snapThreshold) {
        guides.add(_GuideLine(
          x1: compCenterX, y1: 0, x2: compCenterX, y2: canvasHeight,
          isHorizontal: false, isCenter: false,
        ));
      }

      if ((elementCenterY - compCenterY).abs() <= snapThreshold) {
        guides.add(_GuideLine(
          x1: 0, y1: compCenterY, x2: canvasWidth, y2: compCenterY,
          isHorizontal: true, isCenter: false,
        ));
      }
    }

    return guides;
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _GuideLine {
  final double x1, y1, x2, y2;
  final bool isHorizontal;
  final bool isCenter;

  _GuideLine({
    required this.x1, required this.y1,
    required this.x2, required this.y2,
    required this.isHorizontal,
    required this.isCenter,
  });
}
