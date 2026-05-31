import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/app_state_provider.dart';
import 'widgets/topbar.dart';
import 'widgets/left_panel.dart';
import 'widgets/right_panel.dart';
import 'widgets/center_panel.dart';
import 'widgets/keyboard_handler.dart';

void main() {
  runApp(const AppBuilderApp());
}

class AppBuilderApp extends StatelessWidget {
  const AppBuilderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppStateProvider(),
      child: MaterialApp(
        title: 'App Builder',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF0B1220),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF8B5CF6),
            brightness: Brightness.dark,
          ),
          useMaterial3: true,
        ),
        home: const AppBuilderHome(),
      ),
    );
  }
}

class AppBuilderHome extends StatelessWidget {
  const AppBuilderHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppStateProvider>(
      builder: (context, provider, child) {
        return KeyboardHandler(
          provider: provider,
          child: Scaffold(
            backgroundColor: const Color(0xFF0B1220),
            body: Column(
              children: [
                TopBar(
                projectName: 'My App',
                onSave: () {
                  provider.saveToLocal();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Project saved')),
                  );
                },
                onUndo: () {
                  provider.undo();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Undo')),
                  );
                },
                onRedo: () {
                  provider.redo();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Redo')),
                  );
                },
                onPreview: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Preview coming soon')),
                  );
                },
                onExport: () {
                  provider.exportToJson();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Project exported')),
                  );
                },
                onThemeToggle: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Theme toggle coming soon')),
                  );
                },
                onProfile: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Profile coming soon')),
                  );
                },
                canUndo: provider.canUndo(),
                canRedo: provider.canRedo(),
              ),
              Expanded(
                child: Row(
                  children: [
                    Consumer<AppStateProvider>(
                      builder: (context, provider, child) {
                        return SizedBox(
                          width: 320,
                          child: LeftPanel(
                            onAddTemplate: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Templates coming soon')),
                              );
                            },
                            onAddPage: () {
                              final newPage = provider.createDefaultPage('Page ${provider.app.pages.length + 1}');
                              provider.addPage(newPage);
                              provider.setCurrentPage(newPage.id);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Added ${newPage.name}')),
                              );
                            },
                          ),
                        );
                      },
                    ),
                    Expanded(
                      child: CenterPanel(),
                    ),
                    const SizedBox(
                      width: 320,
                      child: RightPanel(),
                    ),
                  ],
                ),
              ),
            ],
          ),
          ),
        );
      },
    );
  }
}
