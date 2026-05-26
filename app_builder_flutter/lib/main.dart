import 'package:flutter/material.dart';
import 'widgets/topbar.dart';

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
          const Expanded(
            child: Center(
              child: Text(
                'Main content area',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
