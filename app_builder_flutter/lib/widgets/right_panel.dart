import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../models/component.dart';
import '../models/page.dart';

class RightPanel extends StatelessWidget {
  const RightPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 320,
      decoration: BoxDecoration(
        color: const Color(0xFF0B1220),
        border: Border(
          left: BorderSide(color: Colors.white.withOpacity(0.08)),
        ),
      ),
      child: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: Consumer<AppStateProvider>(
              builder: (context, provider, child) {
                final component = provider.findSelectedComponent();
                final page = provider.getCurrentPage();
                final isPageSelected = provider.selectedId == null || provider.selectedType == 'page';
                
                if (isPageSelected && page != null) {
                  return _buildPageInspector(context, provider, page);
                }
                
                if (component == null) {
                  return const Center(
                    child: Text(
                      'Select a component to edit its properties',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 14,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  );
                }
                return _buildComponentInspector(context, provider, component);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPageInspector(BuildContext context, AppStateProvider provider, Page page) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      child: Column(
        children: [
          _buildSelectedHeader('Page Settings'),
          const SizedBox(height: 16),
          InspectorAccordion(
            title: 'Page Info',
            icon: Icons.info,
            iconColor: const Color(0xFF818CF8),
            children: [
              InspectorField(
                label: 'Page Name',
                value: page.name,
                placeholder: 'Page Name',
                onChanged: (value) {
                  page.name = value;
                  provider.notifyListeners();
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          InspectorAccordion(
            title: 'Background',
            icon: Icons.palette,
            iconColor: const Color(0xFF4ADE80),
            children: [
              InspectorColorField(
                label: 'Background Color',
                value: page.backgroundColor,
                onChanged: (value) {
                  page.backgroundColor = value;
                  provider.notifyListeners();
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          InspectorAccordion(
            title: 'App Bar',
            icon: Icons.menu,
            iconColor: const Color(0xFFF472B6),
            children: [
              InspectorField(
                label: 'Title',
                value: page.appBar.title,
                placeholder: 'App Title',
                onChanged: (value) {
                  page.appBar.title = value;
                  provider.notifyListeners();
                },
              ),
              InspectorColorField(
                label: 'Background Color',
                value: page.appBar.backgroundColor,
                onChanged: (value) {
                  page.appBar.backgroundColor = value;
                  provider.notifyListeners();
                },
              ),
              InspectorColorField(
                label: 'Text Color',
                value: page.appBar.textColor,
                onChanged: (value) {
                  page.appBar.textColor = value;
                  provider.notifyListeners();
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildComponentInspector(BuildContext context, AppStateProvider provider, Component component) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      child: Column(
        children: [
          _buildSelectedHeader(component.type),
          const SizedBox(height: 16),
          InspectorAccordion(
            title: 'Content',
            icon: Icons.text_fields,
            iconColor: const Color(0xFF818CF8),
            children: [
              InspectorField(
                label: 'Text',
                value: component.props?['text'] as String?,
                placeholder: 'Enter text',
                onChanged: (value) {
                  component.props ??= {};
                  component.props!['text'] = value;
                  provider.notifyListeners();
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          InspectorAccordion(
            title: 'Typography',
            icon: Icons.format_size,
            iconColor: const Color(0xFFF472B6),
            children: [
              InspectorField(
                label: 'Font Size',
                value: component.styles?.fontSize,
                placeholder: '16',
                onChanged: (value) {
                  component.styles ??= ComponentStyles();
                  component.styles!.fontSize = value;
                  provider.updateComponentStyles(
                    component.id,
                    component.styles!,
                  );
                },
              ),
              InspectorField(
                label: 'Font Weight',
                value: component.styles?.fontWeight,
                placeholder: 'Normal',
                onChanged: (value) {
                  component.styles ??= ComponentStyles();
                  component.styles!.fontWeight = value;
                  provider.updateComponentStyles(
                    component.id,
                    component.styles!,
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          InspectorAccordion(
            title: 'Colors',
            icon: Icons.palette,
            iconColor: const Color(0xFF4ADE80),
            children: [
              InspectorColorField(
                label: 'Text Color',
                value: component.styles?.color,
                onChanged: (value) {
                  component.styles ??= ComponentStyles();
                  component.styles!.color = value;
                  provider.updateComponentStyles(
                    component.id,
                    component.styles!,
                  );
                },
              ),
              InspectorColorField(
                label: 'Background Color',
                value: component.styles?.backgroundColor,
                onChanged: (value) {
                  component.styles ??= ComponentStyles();
                  component.styles!.backgroundColor = value;
                  provider.updateComponentStyles(
                    component.id,
                    component.styles!,
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          InspectorAccordion(
            title: 'Layout',
            icon: Icons.view_quilt,
            iconColor: const Color(0xFF60A5FA),
            children: [
              InspectorField(
                label: 'X Position',
                value: component.layout?.x.toString(),
                placeholder: '0',
                onChanged: (value) {
                  final x = double.tryParse(value);
                  if (x != null && component.layout != null) {
                    provider.updateComponentLayout(
                      component.id,
                      component.layout!.copyWith(x: x),
                    );
                  }
                },
              ),
              InspectorField(
                label: 'Y Position',
                value: component.layout?.y.toString(),
                placeholder: '0',
                onChanged: (value) {
                  final y = double.tryParse(value);
                  if (y != null && component.layout != null) {
                    provider.updateComponentLayout(
                      component.id,
                      component.layout!.copyWith(y: y),
                    );
                  }
                },
              ),
              InspectorField(
                label: 'Width',
                value: component.layout?.width.toString(),
                placeholder: '100',
                onChanged: (value) {
                  final width = double.tryParse(value);
                  if (width != null && component.layout != null) {
                    provider.updateComponentLayout(
                      component.id,
                      component.layout!.copyWith(width: width),
                    );
                  }
                },
              ),
              InspectorField(
                label: 'Height',
                value: component.layout?.height.toString(),
                placeholder: '40',
                onChanged: (value) {
                  final height = double.tryParse(value);
                  if (height != null && component.layout != null) {
                    provider.updateComponentLayout(
                      component.id,
                      component.layout!.copyWith(height: height),
                    );
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSelectedHeader(String title) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            color: const Color(0xFF8B5CF6).withOpacity(0.2),
          ),
          child: const Center(
            child: Icon(
              Icons.settings,
              size: 16,
              color: Color(0xFF8B5CF6),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              color: Color(0xFFF8FAFC),
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader() {
    return const Padding(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Inspector',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Only relevant settings, grouped by purpose.',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectedHeader(Component component) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
        color: const Color(0xFF1E293B).withOpacity(0.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            component.type.toUpperCase(),
            style: const TextStyle(
              color: Color(0xFFF8FAFC),
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'ID: ${component.id}',
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class InspectorAccordion extends StatefulWidget {
  final String title;
  final IconData icon;
  final Color iconColor;
  final List<Widget> children;

  const InspectorAccordion({
    super.key,
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.children,
  });

  @override
  State<InspectorAccordion> createState() => _InspectorAccordionState();
}

class _InspectorAccordionState extends State<InspectorAccordion> {
  bool _isExpanded = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
        color: const Color(0xFF1E293B),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () {
              setState(() {
                _isExpanded = !_isExpanded;
              });
            },
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: _isExpanded
                    ? const Color(0xFF6366F1).withOpacity(0.05)
                    : Colors.transparent,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(6),
                      color: _isExpanded
                          ? widget.iconColor
                          : widget.iconColor.withOpacity(0.1),
                    ),
                    child: Icon(
                      widget.icon,
                      size: 14,
                      color: _isExpanded ? Colors.white : widget.iconColor,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      widget.title,
                      style: const TextStyle(
                        color: Color(0xFFF8FAFC),
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  AnimatedRotation(
                    turns: _isExpanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 300),
                    child: Icon(
                      Icons.keyboard_arrow_down,
                      size: 20,
                      color: _isExpanded
                          ? const Color(0xFF6366F1)
                          : const Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_isExpanded)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: widget.children,
              ),
            ),
        ],
      ),
    );
  }
}

class InspectorField extends StatelessWidget {
  final String label;
  final String? value;
  final String placeholder;
  final Function(String)? onChanged;

  const InspectorField({
    super.key,
    required this.label,
    this.value,
    required this.placeholder,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFFCBD5E1),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: TextEditingController(text: value ?? '')..selection = TextSelection.fromPosition(TextPosition(offset: value?.length ?? 0)),
            style: const TextStyle(color: Color(0xFFF8FAFC), fontSize: 13),
            decoration: InputDecoration(
              hintText: placeholder,
              hintStyle: const TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 13,
              ),
              filled: true,
              fillColor: const Color(0xFF0F172A),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFF334155)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFF334155)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFF6366F1)),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 10,
              ),
            ),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class InspectorColorField extends StatelessWidget {
  final String label;
  final String? value;
  final Function(String)? onChanged;

  const InspectorColorField({
    super.key,
    required this.label,
    this.value,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFFCBD5E1),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            height: 36,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFF334155)),
              color: const Color(0xFF0F172A),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  margin: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    color: _parseColor(value),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: TextField(
                      controller: TextEditingController(text: value ?? '#6366F1')..selection = TextSelection.fromPosition(TextPosition(offset: value?.length ?? 7)),
                      style: const TextStyle(
                        color: Color(0xFFF8FAFC),
                        fontSize: 13,
                      ),
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onChanged: onChanged,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: Icon(
                    Icons.color_lens,
                    size: 18,
                    color: Colors.grey.shade400,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _parseColor(String? colorString) {
    if (colorString == null || colorString.isEmpty) {
      return const Color(0xFF6366F1);
    }
    try {
      if (colorString.startsWith('#')) {
        return Color(int.parse(colorString.substring(1), radix: 16) + 0xFF000000);
      }
      return const Color(0xFF6366F1);
    } catch (e) {
      return const Color(0xFF6366F1);
    }
  }
}
