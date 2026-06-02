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
                  child: DragTarget<String>(
                    onAcceptWithDetails: (details) {
                      final dropOffset = _getCanvasDropOffset(details.offset);
                      if (dropOffset == null) return;
                      final layout = _buildDropLayout(
                        componentType: details.data,
                        dropOffset: dropOffset,
                        page: page,
                      );
                      provider.addComponent(
                        details.data,
                        layout: layout,
                      );
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Added ${details.data.toUpperCase()}')),
                      );
                    },
                    builder: (context, candidateData, rejectedData) {
                      _canvasBox = context.findRenderObject() as RenderBox?;
                      return Container(
                        decoration: BoxDecoration(
                          color: page != null
                              ? _parseColor(page.backgroundColor)
                              : Colors.white,
                          border: candidateData.isNotEmpty
                              ? Border.all(
                                  color: const Color(0xFF8B5CF6),
                                  width: 2,
                                )
                              : null,
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
                      );
                    },
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
    final snaps = provider.activeSnapGuides;
    final deviceInfo = provider.deviceMap[provider.currentDeviceKey] ?? provider.deviceMap['iphone-14']!;
    
    // If no snaps, return empty
    if (snaps.isEmpty) {
      return const SizedBox.shrink();
    }
    
    return Positioned.fill(
      child: IgnorePointer(
        child: CustomPaint(
          painter: _SnapGuidePainter(
            snaps: snaps,
            canvasWidth: deviceInfo.width,
            canvasHeight: deviceInfo.height,
          ),
        ),
      ),
    );
  }
}

class _SnapGuidePainter extends CustomPainter {
  final List<SnapLine> snaps;
  final double canvasWidth;
  final double canvasHeight;

  _SnapGuidePainter({
    required this.snaps,
    required this.canvasWidth,
    required this.canvasHeight,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final snap in snaps) {
      final isCenter = snap.type.contains('center');
      final paint = Paint()
        ..color = isCenter
            ? const Color(0xFF06B6D4).withOpacity(0.8)
            : const Color(0xFF0891B2).withOpacity(0.6)
        ..strokeWidth = 2
        ..style = PaintingStyle.stroke;

      final line = snap.line;
      canvas.drawLine(
        Offset(line.x1, line.y1),
        Offset(line.x2, line.y2),
        paint,
      );
      
      // Add glow effect for better visibility
      final glowPaint = Paint()
        ..color = paint.color.withOpacity(0.2)
        ..strokeWidth = 4
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2);
      
      canvas.drawLine(
        Offset(line.x1, line.y1),
        Offset(line.x2, line.y2),
        glowPaint,
      );
    }
  }

  @override
  bool shouldRepaint(_SnapGuidePainter oldDelegate) {
    return oldDelegate.snaps.length != snaps.length;
  }
}
