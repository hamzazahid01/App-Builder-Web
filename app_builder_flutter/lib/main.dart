import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/app_state_provider.dart';
import 'widgets/topbar.dart';
import 'widgets/left_panel.dart';
import 'widgets/right_panel.dart';
import 'widgets/center_panel.dart';

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
    return Scaffold(
      backgroundColor: const Color(0xFF0B1220),
      body: Column(
        children: [
          Container(
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF070B16).withOpacity(0.78),
              border: Border(
                bottom: BorderSide(
                  color: Colors.white.withOpacity(0.08),
                  width: 1,
                ),
              ),
            ),
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
                const Expanded(
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
    );
  }
}
