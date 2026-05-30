import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../providers/app_state_provider.dart';

class KeyboardHandler extends StatefulWidget {
  final Widget child;
  final AppStateProvider provider;

  const KeyboardHandler({
    super.key,
    required this.child,
    required this.provider,
  });

  @override
  State<KeyboardHandler> createState() => _KeyboardHandlerState();
}

class _KeyboardHandlerState extends State<KeyboardHandler> {
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _focusNode = FocusNode();
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  void _handleKeyEvent(RawKeyEvent event) {
    if (event is RawKeyDownEvent) {
      final isCtrlPressed = event.isControlPressed;
      final isShiftPressed = event.isShiftPressed;

      if (isCtrlPressed) {
        if (event.logicalKey == LogicalKeyboardKey.keyZ) {
          widget.provider.undo();
        } else if (event.logicalKey == LogicalKeyboardKey.keyY ||
            (isShiftPressed && event.logicalKey == LogicalKeyboardKey.keyZ)) {
          widget.provider.redo();
        } else if (event.logicalKey == LogicalKeyboardKey.keyS) {
          widget.provider.saveToLocal();
        } else if (event.logicalKey == LogicalKeyboardKey.keyC) {
          final selected = widget.provider.findSelectedComponent();
          if (selected != null) {
            widget.provider.copyComponent(selected);
          }
        } else if (event.logicalKey == LogicalKeyboardKey.keyV) {
          widget.provider.pasteComponent();
        } else if (event.logicalKey == LogicalKeyboardKey.keyX) {
          final selected = widget.provider.findSelectedComponent();
          if (selected != null) {
            widget.provider.copyComponent(selected);
            widget.provider.deleteSelected();
          }
        }
      } else if (event.logicalKey == LogicalKeyboardKey.delete) {
        widget.provider.deleteSelected();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return RawKeyboardListener(
      focusNode: _focusNode,
      onKey: _handleKeyEvent,
      child: widget.child,
    );
  }
}
