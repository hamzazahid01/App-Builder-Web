import 'package:flutter/material.dart';

class TopBar extends StatelessWidget {
  final String projectName;
  final VoidCallback onSave;
  final VoidCallback onUndo;
  final VoidCallback onRedo;
  final VoidCallback onPreview;
  final VoidCallback onExport;
  final VoidCallback onThemeToggle;
  final VoidCallback onProfile;

  const TopBar({
    super.key,
    required this.projectName,
    required this.onSave,
    required this.onUndo,
    required this.onRedo,
    required this.onPreview,
    required this.onExport,
    required this.onThemeToggle,
    required this.onProfile,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
      decoration: BoxDecoration(
        color: const Color(0xFF070B16).withOpacity(0.78),
        border: Border(
          bottom: BorderSide(
            color: Colors.white.withOpacity(0.08),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          _buildBrand(),
          const Spacer(),
          _buildActions(),
          const SizedBox(width: 16),
          _buildProfile(),
        ],
      ),
    );
  }

  Widget _buildBrand() {
    return Row(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF8B5CF6), Color(0xFFA78BFA)],
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF8B5CF6).withOpacity(0.28),
                blurRadius: 50,
                offset: const Offset(0, 18),
              ),
            ],
          ),
          child: const Center(
            child: Text(
              'AB',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 18,
              ),
            ),
          ),
        ),
        const SizedBox(width: 14),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'App Builder',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              projectName,
              style: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActions() {
    return Wrap(
      spacing: 12,
      children: [
        _buildButton('Save', onSave),
        _buildIconButton('↶', 'Undo', onUndo),
        _buildIconButton('↷', 'Redo', onRedo),
        _buildButton('Preview', onPreview),
        _buildButton('Export', onExport, isSecondary: true),
        _buildIconButton('🌙', 'Toggle theme', onThemeToggle),
      ],
    );
  }

  Widget _buildButton(String text, VoidCallback onPressed, {bool isSecondary = false}) {
    return Container(
      constraints: const BoxConstraints(minWidth: 84),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.12)),
        color: isSecondary 
            ? Colors.white.withOpacity(0.06)
            : Colors.white.withOpacity(0.08),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(14),
          child: Center(
            child: Text(
              text,
              style: const TextStyle(
                color: Color(0xFFF8FAFC),
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildIconButton(String icon, String tooltip, VoidCallback onPressed) {
    return Tooltip(
      message: tooltip,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.12)),
          color: Colors.white.withOpacity(0.08),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onPressed,
            borderRadius: BorderRadius.circular(14),
            child: Center(
              child: Text(
                icon,
                style: const TextStyle(fontSize: 18),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfile() {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.white.withOpacity(0.16),
            Colors.white.withOpacity(0.08),
          ],
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onProfile,
          borderRadius: BorderRadius.circular(14),
          child: const Center(
            child: Text(
              'HZ',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
