import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/component.dart';
import '../providers/app_state_provider.dart';
import '../config/app_config.dart';
import '../services/snap_guide_service.dart';

class ComponentRenderer extends StatefulWidget {
  final Component component;
  final bool isSelected;
  final VoidCallback? onTap;
  final VoidCallback? onDoubleTap;
  final Function(double x, double y)? onPositionChanged;
  final VoidCallback? onDragEnd;

  const ComponentRenderer({
    super.key,
    required this.component,
    this.isSelected = false,
    this.onTap,
    this.onDoubleTap,
    this.onPositionChanged,
    this.onDragEnd,
  });

  @override
  State<ComponentRenderer> createState() => _ComponentRendererState();
}

class _ComponentRendererState extends State<ComponentRenderer> {
  bool _isHovering = false;
  String? _resizeHandle;
  double? _startX;
  double? _startY;
  double? _initialX;
  double? _initialY;
  double? _initialWidth;
  double? _initialHeight;
  bool _isDragging = false;
  List<SnapLine> _activeSnaps = [];

  @override
  Widget build(BuildContext context) {
    final layout = widget.component.layout;
    final styles = widget.component.styles;

    return Consumer<AppStateProvider>(
      builder: (context, provider, child) {
        return Positioned(
          left: layout?.x ?? 0,
          top: layout?.y ?? 0,
          child: Opacity(
            opacity: _isDragging ? 0.7 : 1.0,
            child: MouseRegion(
              onEnter: (_) => setState(() => _isHovering = true),
              onExit: (_) => setState(() => _isHovering = false),
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: widget.onTap,
                onDoubleTap: widget.onDoubleTap,
                onPanStart: (details) {
                  if (_resizeHandle != null) return;
                  _startX = details.localPosition.dx;
                  _startY = details.localPosition.dy;
                  _initialX = layout?.x;
                  _initialY = layout?.y;
                  setState(() {}); // Trigger rebuild for opacity
                },
              onPanUpdate: (details) {
                if (_resizeHandle != null) return;
                if (_startX == null || _startY == null || _initialX == null || _initialY == null) return;
                
                final dx = details.localPosition.dx - _startX!;
                final dy = details.localPosition.dy - _startY!;
                
                // Check drag threshold
                final distance = math.sqrt(dx * dx + dy * dy);
                if (distance < AppConfig.dragThreshold) {
                  return; // Haven't moved far enough yet
                }
                
                _isDragging = true;
                
                if (layout == null) return;
                
                double newX = _initialX! + dx;
                double newY = _initialY! + dy;
                
                // Apply snap to grid if enabled
                if (provider.snapToGrid) {
                  newX = (newX / AppConfig.gridSize).round() * AppConfig.gridSize;
                  newY = (newY / AppConfig.gridSize).round() * AppConfig.gridSize;
                }
                
                newX = newX.clamp(0.0, AppConfig.canvasMaxWidth - layout!.width);
                newY = newY.clamp(0.0, AppConfig.canvasMaxHeight - layout!.height);
                
                // Calculate snap guides (for visual feedback only)
                final page = provider.getCurrentPage();
                if (page != null) {
                  final tempLayout = layout!.copyWith(x: newX, y: newY);
                  final centerSnaps = SnapGuide.calculateCenterSnaps(
                    tempLayout,
                    Size(AppConfig.canvasMaxWidth, AppConfig.canvasMaxHeight),
                  );
                  final elementSnaps = SnapGuide.calculateElementSnaps(
                    tempLayout,
                    page.components,
                    widget.component.id,
                    Size(AppConfig.canvasMaxWidth, AppConfig.canvasMaxHeight),
                  );
                  
                  _activeSnaps = [...centerSnaps, ...elementSnaps];
                  
                  // Only apply snap if within 2px threshold
                  if (_activeSnaps.isNotEmpty) {
                    final snappedPos = SnapGuide.applySnaps(tempLayout, _activeSnaps);
                    if ((snappedPos.dx - newX).abs() <= 2 && (snappedPos.dy - newY).abs() <= 2) {
                      newX = snappedPos.dx;
                      newY = snappedPos.dy;
                    }
                  }
                }
                
                // Update component position without notifying
                provider.updateComponentLayout(
                  widget.component.id,
                  layout!.copyWith(x: newX, y: newY),
                  notify: false,
                );
              },
              onPanEnd: (details) {
                if (_resizeHandle != null) return;
                
                if (_isDragging) {
                  provider.finishDragSession(commitHistory: true);
                  _isDragging = false;
                }
                
                _startX = null;
                _startY = null;
                _initialX = null;
                _initialY = null;
                _activeSnaps = [];
              },
              child: SizedBox(
                width: layout?.width ?? 100,
                height: layout?.height ?? 40,
                child: Stack(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: _parseColor(styles?.backgroundColor),
                        borderRadius: _parseBorderRadius(styles?.borderRadius),
                        border: Border.all(
                          color: widget.isSelected
                              ? const Color(0xFF8B5CF6)
                              : _isHovering
                                  ? const Color(0xFF8B5CF6).withOpacity(0.5)
                                  : (styles?.borderColor != null
                                      ? _parseColor(styles?.borderColor) ?? Colors.transparent
                                      : Colors.transparent),
                          width: widget.isSelected ? 2 : (_parseDouble(styles?.borderWidth) ?? 1),
                        ),
                        boxShadow: [
                          if (widget.isSelected)
                            BoxShadow(
                              color: const Color(0xFF8B5CF6).withOpacity(0.9),
                              blurRadius: 0,
                              spreadRadius: 2,
                            ),
                          if (widget.isSelected)
                            BoxShadow(
                              color: const Color(0xFF8B5CF6).withOpacity(0.14),
                              blurRadius: 8,
                              spreadRadius: 4,
                            ),
                          if (_isHovering && !widget.isSelected)
                            BoxShadow(
                              color: const Color(0xFF8B5CF6).withOpacity(0.3),
                              blurRadius: 4,
                              spreadRadius: 1,
                            ),
                        ],
                      ),
                      child: _buildContent(styles),
                    ),
                    if (widget.isSelected) _buildResizeHandles(layout),
                  ],
                ),
              ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildContent(ComponentStyles? styles) {
    switch (widget.component.type) {
      case 'button':
        return _buildButton(styles);
      case 'text':
        return _buildText(styles);
      case 'image':
        return _buildImage(styles);
      case 'input':
        return _buildInput(styles);
      case 'icon':
        return _buildIcon(styles);
      default:
        return _buildDefault(styles);
    }
  }

  Widget _buildButton(ComponentStyles? styles) {
    return Center(
      child: Text(
        widget.component.props?['text'] ?? 'Button',
        style: TextStyle(
          color: _parseColor(styles?.color),
          fontSize: _parseDouble(styles?.fontSize) ?? 14,
          fontWeight: _parseFontWeight(styles?.fontWeight),
          fontFamily: styles?.fontFamily,
        ),
      ),
    );
  }

  Widget _buildText(ComponentStyles? styles) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Text(
        widget.component.props?['text'] ?? 'Text',
        style: TextStyle(
          color: _parseColor(styles?.color),
          fontSize: _parseDouble(styles?.fontSize) ?? 14,
          fontWeight: _parseFontWeight(styles?.fontWeight),
          fontFamily: styles?.fontFamily,
          decoration: _parseTextDecoration(styles?.textDecoration),
        ),
        textAlign: _parseTextAlign(styles?.textAlign),
      ),
    );
  }

  Widget _buildImage(ComponentStyles? styles) {
    final imageUrl = widget.component.props?['src'] ?? '';
    if (imageUrl.isEmpty) {
      return Container(
        color: Colors.grey.shade300,
        child: const Icon(Icons.image, color: Colors.grey),
      );
    }
    return Image.network(
      imageUrl,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          color: Colors.grey.shade300,
          child: const Icon(Icons.broken_image, color: Colors.grey),
        );
      },
    );
  }

  Widget _buildInput(ComponentStyles? styles) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: TextField(
        enabled: false,
        decoration: InputDecoration(
          hintText: widget.component.props?['placeholder'] ?? 'Input',
          hintStyle: TextStyle(
            color: _parseColor(styles?.color)?.withOpacity(0.5),
          ),
          border: InputBorder.none,
        ),
        style: TextStyle(
          color: _parseColor(styles?.color),
          fontSize: _parseDouble(styles?.fontSize) ?? 14,
        ),
      ),
    );
  }

  Widget _buildIcon(ComponentStyles? styles) {
    final iconName = widget.component.props?['icon'] ?? 'star';
    return Center(
      child: Icon(
        _getIconData(iconName),
        color: _parseColor(styles?.color),
        size: _parseDouble(styles?.fontSize) ?? 24,
      ),
    );
  }

  Widget _buildDefault(ComponentStyles? styles) {
    return Center(
      child: Text(
        widget.component.type.toUpperCase(),
        style: TextStyle(
          color: _parseColor(styles?.color),
          fontSize: 12,
        ),
      ),
    );
  }

  Color? _parseColor(String? colorString) {
    if (colorString == null || colorString.isEmpty) return null;
    try {
      if (colorString.startsWith('#')) {
        return Color(int.parse(colorString.substring(1), radix: 16) + 0xFF000000);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  double? _parseDouble(String? value) {
    if (value == null || value.isEmpty) return null;
    return double.tryParse(value);
  }

  BorderRadius? _parseBorderRadius(String? value) {
    final radius = _parseDouble(value);
    if (radius == null) return null;
    return BorderRadius.circular(radius);
  }

  FontWeight? _parseFontWeight(String? value) {
    switch (value?.toLowerCase()) {
      case '100':
      case 'thin':
        return FontWeight.w100;
      case '200':
      case 'extralight':
        return FontWeight.w200;
      case '300':
      case 'light':
        return FontWeight.w300;
      case '400':
      case 'normal':
        return FontWeight.w400;
      case '500':
      case 'medium':
        return FontWeight.w500;
      case '600':
      case 'semibold':
        return FontWeight.w600;
      case '700':
      case 'bold':
        return FontWeight.w700;
      case '800':
      case 'extrabold':
        return FontWeight.w800;
      case '900':
      case 'black':
        return FontWeight.w900;
      default:
        return FontWeight.normal;
    }
  }

  TextDecoration? _parseTextDecoration(String? value) {
    switch (value?.toLowerCase()) {
      case 'underline':
        return TextDecoration.underline;
      case 'line-through':
        return TextDecoration.lineThrough;
      case 'overline':
        return TextDecoration.overline;
      default:
        return null;
    }
  }

  TextAlign? _parseTextAlign(String? value) {
    switch (value?.toLowerCase()) {
      case 'left':
        return TextAlign.left;
      case 'right':
        return TextAlign.right;
      case 'center':
        return TextAlign.center;
      case 'justify':
        return TextAlign.justify;
      default:
        return TextAlign.left;
    }
  }

  IconData _getIconData(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'star':
        return Icons.star;
      case 'heart':
        return Icons.favorite;
      case 'home':
        return Icons.home;
      case 'settings':
        return Icons.settings;
      case 'search':
        return Icons.search;
      case 'add':
        return Icons.add;
      case 'delete':
        return Icons.delete;
      case 'edit':
        return Icons.edit;
      case 'close':
        return Icons.close;
      case 'check':
        return Icons.check;
      case 'arrow_back':
        return Icons.arrow_back;
      case 'arrow_forward':
        return Icons.arrow_forward;
      case 'menu':
        return Icons.menu;
      case 'more_vert':
        return Icons.more_vert;
      default:
        return Icons.help_outline;
    }
  }

  Widget _buildResizeHandles(ComponentLayout? layout) {
    if (layout == null) return const SizedBox.shrink();

    const handleSize = 8.0;
    const handleOffset = -4.0;

    return Stack(
      children: [
        Positioned(
          left: handleOffset,
          top: handleOffset,
          child: _buildResizeHandle('top-left'),
        ),
        Positioned(
          right: handleOffset,
          top: handleOffset,
          child: _buildResizeHandle('top-right'),
        ),
        Positioned(
          left: handleOffset,
          bottom: handleOffset,
          child: _buildResizeHandle('bottom-left'),
        ),
        Positioned(
          right: handleOffset,
          bottom: handleOffset,
          child: _buildResizeHandle('bottom-right'),
        ),
        Positioned(
          left: layout.width / 2 - handleSize / 2,
          top: handleOffset,
          child: _buildResizeHandle('top'),
        ),
        Positioned(
          left: layout.width / 2 - handleSize / 2,
          bottom: handleOffset,
          child: _buildResizeHandle('bottom'),
        ),
        Positioned(
          left: handleOffset,
          top: layout.height / 2 - handleSize / 2,
          child: _buildResizeHandle('left'),
        ),
        Positioned(
          right: handleOffset,
          top: layout.height / 2 - handleSize / 2,
          child: _buildResizeHandle('right'),
        ),
      ],
    );
  }

  Widget _buildResizeHandle(String position) {
    return MouseRegion(
      cursor: SystemMouseCursors.resizeColumn,
      child: Listener(
        onPointerDown: (event) {
          final layout = widget.component.layout;
          if (layout == null) return;
          _resizeHandle = position;
          _startX = event.position.dx;
          _startY = event.position.dy;
          _initialWidth = layout.width;
          _initialHeight = layout.height;
        },
        onPointerMove: (event) {
          if (_resizeHandle == null || _initialWidth == null || _initialHeight == null) return;
          final layout = widget.component.layout;
          if (layout == null) return;

          final dx = event.position.dx - (_startX ?? 0);
          final dy = event.position.dy - (_startY ?? 0);

          double newWidth = _initialWidth!;
          double newHeight = _initialHeight!;

          switch (_resizeHandle) {
            case 'top-left':
              newWidth = (_initialWidth! - dx).clamp(40, 500);
              newHeight = (_initialHeight! - dy).clamp(30, 500);
              break;
            case 'top-right':
              newWidth = (_initialWidth! + dx).clamp(40, 500);
              newHeight = (_initialHeight! - dy).clamp(30, 500);
              break;
            case 'bottom-left':
              newWidth = (_initialWidth! - dx).clamp(40, 500);
              newHeight = (_initialHeight! + dy).clamp(30, 500);
              break;
            case 'bottom-right':
              newWidth = (_initialWidth! + dx).clamp(40, 500);
              newHeight = (_initialHeight! + dy).clamp(30, 500);
              break;
            case 'top':
              newHeight = (_initialHeight! - dy).clamp(30, 500);
              break;
            case 'bottom':
              newHeight = (_initialHeight! + dy).clamp(30, 500);
              break;
            case 'left':
              newWidth = (_initialWidth! - dx).clamp(40, 500);
              break;
            case 'right':
              newWidth = (_initialWidth! + dx).clamp(40, 500);
              break;
          }

          final provider = context.read<AppStateProvider>();
          provider.updateComponentLayout(
            widget.component.id,
            layout.copyWith(width: newWidth, height: newHeight),
            notify: false,
          );
        },
        onPointerUp: (event) {
          _resizeHandle = null;
          _startX = null;
          _startY = null;
          _initialWidth = null;
          _initialHeight = null;
          final provider = context.read<AppStateProvider>();
          provider.notifyListeners();
        },
        child: Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFF8B5CF6),
            border: Border.all(
              color: Colors.white,
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF8B5CF6).withOpacity(0.5),
                blurRadius: 4,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
