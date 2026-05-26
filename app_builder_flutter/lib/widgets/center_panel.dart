import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import 'component_renderer.dart';

class CenterPanel extends StatelessWidget {
  const CenterPanel({super.key});

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
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.white.withOpacity(0.12)),
            color: Colors.white.withOpacity(0.06),
          ),
          child: Row(
            children: [
              Text(
                'iPhone 14',
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
      ],
    );
  }

  Widget _buildZoomControl() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.12)),
        color: Colors.white.withOpacity(0.06),
      ),
      child: Row(
        children: [
          _buildZoomButton('−'),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              '100%',
              style: const TextStyle(
                color: Color(0xFFF8FAFC),
                fontSize: 12,
              ),
            ),
          ),
          _buildZoomButton('+'),
        ],
      ),
    );
  }

  Widget _buildZoomButton(String label) {
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
          onTap: () {},
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
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.12)),
        color: Colors.white.withOpacity(0.08),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {},
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
    return Container(
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
          width: deviceInfo.width,
          height: deviceInfo.height,
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
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(40),
                    color: page != null
                        ? _parseColor(page.backgroundColor)
                        : Colors.white,
                  ),
                  child: page != null && page.components.isNotEmpty
                      ? Stack(
                          children: page.components.map((component) {
                            return ComponentRenderer(
                              component: component,
                              isSelected: component.id == provider.selectedId,
                              onTap: () {
                                provider.selectComponent(component.id);
                              },
                            );
                          }).toList(),
                        )
                      : const Center(
                          child: Text(
                            'Canvas Area',
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 14,
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
}
