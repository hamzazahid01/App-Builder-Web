import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/component.dart';
import '../providers/app_state_provider.dart';

class ComponentTree extends StatefulWidget {
  const ComponentTree({super.key});

  @override
  State<ComponentTree> createState() => _ComponentTreeState();
}

class _ComponentTreeState extends State<ComponentTree> {
  final Set<String> _expandedIds = {};

  @override
  Widget build(BuildContext context) {
    return Consumer<AppStateProvider>(
      builder: (context, provider, child) {
        final page = provider.getCurrentPage();
        if (page == null || page.components.isEmpty) {
          return Center(
            child: Text(
              'No components',
              style: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 12,
              ),
            ),
          );
        }

        return ListView.builder(
          itemCount: page.components.length,
          itemBuilder: (context, index) {
            final component = page.components[index];
            return _buildComponentNode(component, provider);
          },
        );
      },
    );
  }

  Widget _buildComponentNode(Component component, AppStateProvider provider) {
    final isSelected = component.id == provider.selectedId;
    final isExpanded = _expandedIds.contains(component.id);
    final hasChildren = component.children != null && component.children!.isNotEmpty;

    return Column(
      children: [
        Container(
          color: isSelected ? const Color(0xFF8B5CF6).withOpacity(0.2) : Colors.transparent,
          child: Row(
            children: [
              if (hasChildren)
                InkWell(
                  onTap: () {
                    setState(() {
                      if (isExpanded) {
                        _expandedIds.remove(component.id);
                      } else {
                        _expandedIds.add(component.id);
                      }
                    });
                  },
                  child: Container(
                    width: 24,
                    height: 24,
                    alignment: Alignment.center,
                    child: Icon(
                      isExpanded ? Icons.expand_more : Icons.chevron_right,
                      size: 16,
                      color: Colors.grey.shade400,
                    ),
                  ),
                )
              else
                const SizedBox(width: 24),
              Expanded(
                child: InkWell(
                  onTap: () {
                    provider.selectComponent(component.id);
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                    child: Row(
                      children: [
                        Container(
                          width: 20,
                          height: 20,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(4),
                            color: const Color(0xFF8B5CF6).withOpacity(0.2),
                            border: Border.all(
                              color: const Color(0xFF8B5CF6).withOpacity(0.5),
                            ),
                          ),
                          child: Center(
                            child: Text(
                              _getComponentIcon(component.type),
                              style: const TextStyle(fontSize: 10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            component.type.toUpperCase(),
                            style: TextStyle(
                              color: isSelected ? const Color(0xFF8B5CF6) : Colors.grey.shade300,
                              fontSize: 12,
                              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              InkWell(
                onTap: () {
                  provider.deleteComponent(component.id);
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Icon(
                    Icons.close,
                    size: 16,
                    color: Colors.grey.shade600,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (hasChildren && isExpanded)
          Padding(
            padding: const EdgeInsets.only(left: 12),
            child: Column(
              children: component.children!
                  .map((child) => _buildComponentNode(child, provider))
                  .toList(),
            ),
          ),
      ],
    );
  }

  String _getComponentIcon(String type) {
    switch (type.toLowerCase()) {
      case 'button':
        return '🔘';
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      case 'input':
        return '⌨️';
      case 'container':
        return '📦';
      case 'row':
        return '↔️';
      case 'column':
        return '↕️';
      case 'stack':
        return '📚';
      default:
        return '◼️';
    }
  }
}
