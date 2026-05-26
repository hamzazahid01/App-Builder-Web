import 'package:flutter/material.dart';
import 'widgets/topbar.dart';
import 'widgets/left_panel.dart';
import 'widgets/right_panel.dart';

void main() {
  runApp(const AppBuilderApp());
}

class AppBuilderApp extends StatelessWidget {
  const AppBuilderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
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
    );
  }
}

class AppBuilderHome extends StatelessWidget {
  const AppBuilderHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          TopBar(
            projectName: 'Untitled project',
            onSave: () => print('Save clicked'),
            onUndo: () => print('Undo clicked'),
            onRedo: () => print('Redo clicked'),
            onPreview: () => print('Preview clicked'),
            onExport: () => print('Export clicked'),
            onThemeToggle: () => print('Theme toggle clicked'),
            onProfile: () => print('Profile clicked'),
          ),
          Expanded(
            child: Row(
              children: [
                LeftPanel(
                  onAddTemplate: () => print('Add template clicked'),
                  onAddPage: () => print('Add page clicked'),
                ),
                const Expanded(
                  child: Center(
                    child: Text(
                      'Main canvas area',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),
                const RightPanel(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
