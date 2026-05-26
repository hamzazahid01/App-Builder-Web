import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/component.dart';
import '../providers/app_state_provider.dart';

class ComponentRenderer extends StatefulWidget {
  final Component component;
  final bool isSelected;
  final VoidCallback? onTap;
  final VoidCallback? onDoubleTap;
  final Function(double x, double y)? onPositionChanged;

  const ComponentRenderer({
    super.key,
    required this.component,
    this.isSelected = false,
    this.onTap,
    this.onDoubleTap,
    this.onPositionChanged,
  });

  @override
  State<ComponentRenderer> createState() => _ComponentRendererState();
}

class _ComponentRendererState extends State<ComponentRenderer> {
  double? _startX;
  double? _startY;
  double? _initialX;
  double? _initialY;
  bool _isDragging = false;

  @override
  Widget build(BuildContext context) {
    final layout = widget.component.layout;
    final styles = widget.component.styles;

    return Consumer<AppStateProvider>(
      builder: (context, provider, child) {
        final currentPage = provider.getCurrentPage();
        final otherComponents = currentPage?.components.where((c) => c.id != widget.component.id).toList() ?? [];
        
        return Positioned(
          left: layout?.x ?? 0,
          top: layout?.y ?? 0,
          child: GestureDetector(
            onTap: widget.onTap,
            onDoubleTap: widget.onDoubleTap,
            onPanStart: (details) {
              _startX = details.globalPosition.dx;
              _startY = details.globalPosition.dy;
              _initialX = layout?.x;
              _initialY = layout?.y;
              setState(() => _isDragging = true);
            },
            onPanUpdate: (details) {
              if (_startX == null || _startY == null || _initialX == null || _initialY == null) return;
              
              final dx = details.globalPosition.dx - _startX!;
              final dy = details.globalPosition.dy - _startY!;
              
              double newX = _initialX! + dx;
              double newY = _initialY! + dy;
              
              // Apply snap to grid if enabled
              if (provider.snapToGrid) {
                final gridSize = 10.0;
                newX = (newX / gridSize).round() * gridSize;
                newY = (newY / gridSize).round() * gridSize;
              }
              
              newX = newX.clamp(0.0, 350.0);
              newY = newY.clamp(0.0, 750.0);
              
              widget.onPositionChanged?.call(newX, newY);
            },
            onPanEnd: (details) {
              _startX = null;
              _startY = null;
              _initialX = null;
              _initialY = null;
              setState(() => _isDragging = false);
            },
            child: Stack(
              children: [
                // Alignment guides (only show during drag)
                if (_isDragging)
                  ..._buildAlignmentGuides(layout?.x ?? 0, layout?.y ?? 0, layout?.width ?? 100, layout?.height ?? 40, otherComponents, provider),
                Container(
                  width: layout?.width ?? 100,
                  height: layout?.height ?? 40,
                  decoration: BoxDecoration(
                    color: _parseColor(styles?.backgroundColor),
                    borderRadius: _parseBorderRadius(styles?.borderRadius),
                    border: styles?.borderColor != null
                        ? Border.all(
                            color: _parseColor(styles?.borderColor) ?? Colors.transparent,
                            width: _parseDouble(styles?.borderWidth) ?? 1,
                          )
                        : null,
                    boxShadow: widget.isSelected
                        ? [
                            BoxShadow(
                              color: const Color(0xFF8B5CF6).withOpacity(0.9),
                              blurRadius: 0,
                              spreadRadius: 2,
                            ),
                            BoxShadow(
                              color: const Color(0xFF8B5CF6).withOpacity(0.14),
                              blurRadius: 8,
                              spreadRadius: 4,
                            ),
                          ]
                        : null,
                  ),
                  child: _buildContent(styles),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  List<Widget> _buildAlignmentGuides(double x, double y, double width, double height, List<Component> otherComponents, AppStateProvider provider) {
    final guides = <Widget>[];
    const snapThreshold = 8.0;
    final currentPage = provider.getCurrentPage();
    final canvasWidth = 390.0; // iPhone 14 width
    final canvasHeight = 844.0; // iPhone 14 height

    // Center alignment guides
    final centerX = canvasWidth / 2;
    final centerY = canvasHeight / 2;
    final componentCenterX = x + width / 2;
    final componentCenterY = y + height / 2;

    // Horizontal center guide
    if ((componentCenterX - centerX).abs() < snapThreshold) {
      guides.add(
        Positioned(
          left: centerX - x,
          top: -50,
          bottom: -50,
          child: Container(
            width: 1,
            color: const Color(0xFF8B5CF6).withOpacity(0.8),
          ),
        ),
      );
    }

    // Vertical center guide
    if ((componentCenterY - centerY).abs() < snapThreshold) {
      guides.add(
        Positioned(
          top: centerY - y,
          left: -50,
          right: -50,
          child: Container(
            height: 1,
            color: const Color(0xFF8B5CF6).withOpacity(0.8),
          ),
        ),
      );
    }

    // Alignment with other components
    for (final other in otherComponents) {
      final otherLayout = other.layout;
      if (otherLayout == null) continue;

      final otherX = otherLayout.x;
      final otherY = otherLayout.y;
      final otherWidth = otherLayout.width;
      final otherHeight = otherLayout.height;
      final otherCenterX = otherX + otherWidth / 2;
      final otherCenterY = otherY + otherHeight / 2;

      // Left edge alignment
      if ((x - otherX).abs() < snapThreshold) {
        guides.add(
          Positioned(
            left: otherX - x,
            top: -50,
            bottom: -50,
            child: Container(
              width: 1,
              color: const Color(0xFF4ADE80).withOpacity(0.8),
            ),
          ),
        );
      }

      // Right edge alignment
      if ((x + width - (otherX + otherWidth)).abs() < snapThreshold) {
        guides.add(
          Positioned(
            left: otherX + otherWidth - x,
            top: -50,
            bottom: -50,
            child: Container(
              width: 1,
              color: const Color(0xFF4ADE80).withOpacity(0.8),
            ),
          ),
        );
      }

      // Top edge alignment
      if ((y - otherY).abs() < snapThreshold) {
        guides.add(
          Positioned(
            top: otherY - y,
            left: -50,
            right: -50,
            child: Container(
              height: 1,
              color: const Color(0xFF4ADE80).withOpacity(0.8),
            ),
          ),
        );
      }

      // Bottom edge alignment
      if ((y + height - (otherY + otherHeight)).abs() < snapThreshold) {
        guides.add(
          Positioned(
            top: otherY + otherHeight - y,
            left: -50,
            right: -50,
            child: Container(
              height: 1,
              color: const Color(0xFF4ADE80).withOpacity(0.8),
            ),
          ),
        );
      }

      // Center alignment with other component
      if ((componentCenterX - otherCenterX).abs() < snapThreshold) {
        guides.add(
          Positioned(
            left: otherCenterX - x,
            top: -50,
            bottom: -50,
            child: Container(
              width: 1,
              color: const Color(0xFFF472B6).withOpacity(0.8),
            ),
          ),
        );
      }

      if ((componentCenterY - otherCenterY).abs() < snapThreshold) {
        guides.add(
          Positioned(
            top: otherCenterY - y,
            left: -50,
            right: -50,
            child: Container(
              height: 1,
              color: const Color(0xFFF472B6).withOpacity(0.8),
            ),
          ),
        );
      }

      // Width matching
      if ((width - otherWidth).abs() < snapThreshold) {
        guides.add(
          Positioned(
            right: -20,
            top: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF60A5FA).withOpacity(0.9),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'W: ${width.toInt()}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        );
      }

      // Height matching
      if ((height - otherHeight).abs() < snapThreshold) {
        guides.add(
          Positioned(
            bottom: -20,
            left: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF60A5FA).withOpacity(0.9),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'H: ${height.toInt()}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        );
      }
    }

    return guides;
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
}
