import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';

class LeftPanel extends StatefulWidget {
  final VoidCallback onAddTemplate;
  final VoidCallback onAddPage;

  const LeftPanel({
    super.key,
    required this.onAddTemplate,
    required this.onAddPage,
  });

  @override
  State<LeftPanel> createState() => _LeftPanelState();
}

class _LeftPanelState extends State<LeftPanel> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 320,
      decoration: BoxDecoration(
        color: const Color(0xFF0B1220),
        border: Border(
          right: BorderSide(color: Colors.white.withOpacity(0.08)),
        ),
      ),
      child: Column(
        children: [
          _buildHeader(),
          _buildSearch(),
          _buildComponentCategories(),
          _buildFooter(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Component library',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Drag, drop, and build screen layouts quickly.',
                  style: TextStyle(
                    color: Colors.grey.shade400,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
          _buildIconButton('★', 'Templates', widget.onAddTemplate),
        ],
      ),
    );
  }

  Widget _buildIconButton(String icon, String tooltip, VoidCallback onPressed) {
    return Tooltip(
      message: tooltip,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.12)),
          color: Colors.white.withOpacity(0.08),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onPressed,
            borderRadius: BorderRadius.circular(12),
            child: Center(
              child: Text(
                icon,
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSearch() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: TextField(
        style: const TextStyle(color: Color(0xFFF8FAFC)),
        onChanged: (value) {
          setState(() {
            _searchQuery = value.toLowerCase();
          });
        },
        decoration: InputDecoration(
          hintText: 'Search components',
          hintStyle: TextStyle(
            color: const Color(0xFFF8FAFC).withOpacity(0.5),
          ),
          filled: true,
          fillColor: Colors.white.withOpacity(0.06),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.12)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.12)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 1),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
          prefixIcon: Icon(
            Icons.search,
            size: 18,
            color: Colors.grey.shade400,
          ),
        ),
      ),
    );
  }

  Widget _buildComponentCategories() {
    final categories = [
      const ComponentCategory(
        title: 'Basic',
        icon: '📦',
        items: ['Button', 'Text', 'Image', 'Input'],
      ),
      const ComponentCategory(
        title: 'Layout',
        icon: '📐',
        items: ['Container', 'Row', 'Column', 'Stack'],
      ),
      const ComponentCategory(
        title: 'Navigation',
        icon: '🧭',
        items: ['AppBar', 'BottomNav', 'Drawer'],
      ),
    ];

    final filteredCategories = _searchQuery.isEmpty
        ? categories
        : categories
            .map((cat) => ComponentCategory(
              title: cat.title,
              icon: cat.icon,
              items: cat.items
                  .where((item) => item.toLowerCase().contains(_searchQuery))
                  .toList(),
            ))
            .where((cat) => cat.items.isNotEmpty)
            .toList();

    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: SingleChildScrollView(
          child: Column(
            children: [
              if (filteredCategories.isEmpty)
                Center(
                  child: Text(
                    'No components found',
                    style: TextStyle(
                      color: Colors.grey.shade400,
                      fontSize: 12,
                    ),
                  ),
                )
              else
                ...filteredCategories.map((cat) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: cat,
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFooter() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: widget.onAddPage,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white.withOpacity(0.06),
            foregroundColor: const Color(0xFFF8FAFC),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: BorderSide(color: Colors.white.withOpacity(0.12)),
            ),
          ),
          child: const Text(
            '+ New screen',
            style: TextStyle(fontWeight: FontWeight.w700),
          ),
        ),
      ),
    );
  }
}

class ComponentCategory extends StatefulWidget {
  final String title;
  final String icon;
  final List<String> items;

  const ComponentCategory({
    super.key,
    required this.title,
    required this.icon,
    required this.items,
  });

  @override
  State<ComponentCategory> createState() => _ComponentCategoryState();
}

class _ComponentCategoryState extends State<ComponentCategory> {
  bool _isExpanded = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
        color: Colors.white.withOpacity(0.05),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () {
              setState(() {
                _isExpanded = !_isExpanded;
              });
            },
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white.withOpacity(0.08),
                    Colors.white.withOpacity(0.03),
                  ],
                ),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      color: Colors.white.withOpacity(0.08),
                    ),
                    child: Center(
                      child: Text(
                        widget.icon,
                        style: const TextStyle(fontSize: 16),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      widget.title,
                      style: const TextStyle(
                        color: Color(0xFFF8FAFC),
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  Text(
                    _isExpanded ? '−' : '+',
                    style: TextStyle(
                      color: Colors.grey.shade400,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_isExpanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 18),
              child: Column(
                children: widget.items.map((item) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _ComponentItem(name: item),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }
}

class _ComponentItem extends StatefulWidget {
  final String name;

  const _ComponentItem({required this.name});

  @override
  State<_ComponentItem> createState() => _ComponentItemState();
}

class _ComponentItemState extends State<_ComponentItem> {
  bool _isDragging = false;

  @override
  Widget build(BuildContext context) {
    return Draggable<String>(
      data: widget.name.toLowerCase(),
      feedback: Material(
        color: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF8B5CF6)),
            color: const Color(0xFF1E293B).withOpacity(0.9),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF8B5CF6).withOpacity(0.4),
                blurRadius: 12,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.name,
                style: const TextStyle(
                  color: Color(0xFFE2E8F0),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
      onDragStarted: () => setState(() => _isDragging = true),
      onDraggableCanceled: (_, __) => setState(() => _isDragging = false),
      onDragEnd: (_) => setState(() => _isDragging = false),
      child: InkWell(
        onTap: () {
          final provider = context.read<AppStateProvider>();
          provider.addComponent(widget.name.toLowerCase());
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Added ${widget.name}')),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: _isDragging
                  ? const Color(0xFF8B5CF6)
                  : Colors.white.withOpacity(0.08),
            ),
            color: _isDragging
                ? const Color(0xFF1E293B).withOpacity(0.8)
                : const Color(0xFF1E293B).withOpacity(0.6),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  widget.name,
                  style: const TextStyle(
                    color: Color(0xFFE2E8F0),
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.white.withOpacity(0.08),
                ),
                child: Center(
                  child: Icon(
                    _isDragging ? Icons.pan_tool : Icons.add,
                    size: 18,
                    color: Colors.grey.shade400,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
