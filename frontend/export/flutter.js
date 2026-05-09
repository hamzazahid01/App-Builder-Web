function flutterColor(hex) {
  const clean = (hex || "#000000").replace("#", "");
  return `Color(0xFF${clean.toUpperCase()})`;
}

function edgeInsets(spacing = {}) {
  return `EdgeInsets.fromLTRB(${spacing.left ?? 0}, ${spacing.top ?? 0}, ${spacing.right ?? 0}, ${spacing.bottom ?? 0})`;
}

function mapMainAxis(justifyContent) {
  if (justifyContent === "center") return "MainAxisAlignment.center";
  if (justifyContent === "space-between") return "MainAxisAlignment.spaceBetween";
  if (justifyContent === "space-around") return "MainAxisAlignment.spaceAround";
  return "MainAxisAlignment.start";
}

function mapCrossAxis(alignItems) {
  if (alignItems === "center") return "CrossAxisAlignment.center";
  if (alignItems === "end") return "CrossAxisAlignment.end";
  if (alignItems === "stretch") return "CrossAxisAlignment.stretch";
  return "CrossAxisAlignment.start";
}

function renderAction(onClick) {
  if (!onClick || onClick.type === "custom") return "() {}";
  if (onClick.type === "navigate" && onClick.targetPageId) return `() => Navigator.pushNamed(context, '/${onClick.targetPageId}')`;
  if (onClick.type === "openUrl" && onClick.url) return `() => _openUrl('${onClick.url}')`;
  if (onClick.type === "showDialog") return `() => _showDialog(context, '${(onClick.dialogText || "Dialog").replace(/'/g, "\\'")}')`;
  return "() {}";
}

function renderFlutterNode(node, depth = 4) {
  const i = "  ".repeat(depth);
  const childWidgets = (node.children || []).map((c) => renderFlutterNode(c, depth + 2)).join(",\n");

  if (node.type === "button") {
    return `${i}Padding(
${i}  padding: ${edgeInsets(node.styles.margin)},
${i}  child: ElevatedButton(
${i}    style: ElevatedButton.styleFrom(
${i}      backgroundColor: ${flutterColor(node.styles.backgroundColor)},
${i}      foregroundColor: ${flutterColor(node.styles.textColor)},
${i}      padding: ${edgeInsets(node.styles.padding)},
${i}      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(${node.styles.borderRadius})),
${i}    ),
${i}    onPressed: ${renderAction(node.props.onClick)},
${i}    child: Text('${(node.props.text || "").replace(/'/g, "\\'")}'),
${i}  ),
${i})`;
  }

  if (node.type === "text") {
    return `${i}Padding(
${i}  padding: ${edgeInsets(node.styles.margin)},
${i}  child: Text(
${i}    '${(node.props.value || "").replace(/'/g, "\\'")}',
${i}    textAlign: TextAlign.${node.styles.textAlign},
${i}    style: TextStyle(fontSize: ${node.styles.fontSize}, color: ${flutterColor(node.styles.color)}, fontWeight: FontWeight.w400),
${i}  ),
${i})`;
  }

  if (node.type === "image") {
    return `${i}Padding(
${i}  padding: ${edgeInsets(node.styles.margin)},
${i}  child: ClipRRect(
${i}    borderRadius: BorderRadius.circular(${node.styles.borderRadius}),
${i}    child: Image.network('${node.props.src}', height: ${node.styles.height}, width: double.infinity, fit: BoxFit.${node.styles.fit}),
${i}  ),
${i})`;
  }

  if (node.type === "input") {
    return `${i}Padding(
${i}  padding: ${edgeInsets(node.styles.margin)},
${i}  child: TextField(
${i}    keyboardType: TextInputType.${node.props.inputType === "email" ? "emailAddress" : "text"},
${i}    obscureText: ${node.props.inputType === "password"},
${i}    decoration: InputDecoration(
${i}      hintText: '${(node.props.placeholder || "").replace(/'/g, "\\'")}',
${i}      contentPadding: ${edgeInsets(node.styles.padding)},
${i}      border: OutlineInputBorder(
${i}        borderRadius: BorderRadius.circular(${node.styles.borderRadius}),
${i}        borderSide: BorderSide(color: ${flutterColor(node.styles.borderColor)}, width: ${node.styles.borderWidth}),
${i}      ),
${i}    ),
${i}  ),
${i})`;
  }

  if (node.type === "spacer") return `${i}SizedBox(height: ${node.styles.height})`;
  if (node.type === "icon") return `${i}Text('${(node.props.symbol || "").replace(/'/g, "\\'")}', style: TextStyle(fontSize: ${node.styles.fontSize}, color: ${flutterColor(node.styles.color)}))`;

  if (node.type === "stack") {
    return `${i}Padding(
${i}  padding: ${edgeInsets(node.styles.margin)},
${i}  child: Container(
${i}    height: ${node.styles.height},
${i}    decoration: BoxDecoration(color: ${flutterColor(node.styles.backgroundColor)}, borderRadius: BorderRadius.circular(${node.styles.borderRadius || 10})),
${i}    child: Stack(children: [
${childWidgets}
${i}    ]),
${i}  ),
${i})`;
  }

  if (node.type === "center") {
    return `${i}Padding(
${i}  padding: ${edgeInsets(node.styles.margin)},
${i}  child: Container(
${i}    constraints: BoxConstraints(minHeight: ${node.styles.minHeight || 120}),
${i}    child: Center(
${i}      child: Column(mainAxisSize: MainAxisSize.min, children: [
${childWidgets}
${i}      ]),
${i}    ),
${i}  ),
${i})`;
  }

  const isRow = node.type === "row";
  const isColumn = node.type === "column" || node.type === "container" || node.type === "card";
  const layoutWidget = isRow ? "Row" : isColumn ? "Column" : "Column";
  return `${i}Padding(
${i}  padding: ${edgeInsets(node.styles.margin)},
${i}  child: Container(
${i}    width: ${node.styles.width === "100%" ? "double.infinity" : node.styles.width === "auto" ? "null" : node.styles.width},
${i}    padding: ${edgeInsets(node.styles.padding)},
${i}    decoration: BoxDecoration(
${i}      color: ${flutterColor(node.styles.backgroundColor || "#ffffff")},
${i}      borderRadius: BorderRadius.circular(${node.styles.borderRadius || 0}),
${i}      border: Border.all(color: ${flutterColor(node.styles.borderColor || "#ffffff")}, width: ${node.styles.borderWidth || 0}),
${i}    ),
${i}    child: ${layoutWidget}(
${i}      mainAxisAlignment: ${mapMainAxis(node.styles.justifyContent)},
${i}      crossAxisAlignment: ${mapCrossAxis(node.styles.alignItems)},
${i}      children: [
${childWidgets}
${i}      ],
${i}    ),
${i}  ),
${i})`;
}

function renderPageWidget(page) {
  const widgets = page.components.map((node) => renderFlutterNode(node)).join(",\n");
  return `class ${page.id.replace(/[^a-zA-Z0-9]/g, "")}Page extends StatelessWidget {
  const ${page.id.replace(/[^a-zA-Z0-9]/g, "")}Page({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ${flutterColor(page.backgroundColor)},
      appBar: ${page.appBar.enabled ? `AppBar(backgroundColor: ${flutterColor(page.appBar.backgroundColor)}, title: Text('${(page.appBar.title || page.name).replace(/'/g, "\\'")}', style: TextStyle(color: ${flutterColor(page.appBar.textColor)})), iconTheme: IconThemeData(color: ${flutterColor(page.appBar.textColor)}))` : "null"},
      body: ${page.layout.safeArea ? "SafeArea(" : ""}${page.layout.scrollBehavior === "scroll" ? "SingleChildScrollView(" : ""}Padding(
        padding: ${edgeInsets(page.layout.padding)},
        child: Column(
          crossAxisAlignment: ${page.layout.alignment === "stretch" ? "CrossAxisAlignment.stretch" : page.layout.alignment === "center" ? "CrossAxisAlignment.center" : "CrossAxisAlignment.start"},
          mainAxisAlignment: ${page.layout.alignment === "bottom" ? "MainAxisAlignment.end" : "MainAxisAlignment.start"},
          children: [
${widgets}
          ],
        ),
      )${page.layout.scrollBehavior === "scroll" ? ")" : ""}${page.layout.safeArea ? ")" : ""},
    );
  }
}
`;
}

window.FlutterExport = {
  generateMainDart() {
    const app = AppState.app;
    const routeLines = app.pages.map((p) => `        '/${p.id}': (_) => const ${p.id.replace(/[^a-zA-Z0-9]/g, "")}Page(),`).join("\n");
    const pageClasses = app.pages.map((p) => renderPageWidget(p)).join("\n");
    const splashPageName = "SplashScreenPage";
    return `import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

void main() => runApp(const GeneratedApp());

class GeneratedApp extends StatelessWidget {
  const GeneratedApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${app.appName.replace(/'/g, "\\'")}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: '${app.fontFamily.replace(/'/g, "\\'")}',
        colorScheme: ColorScheme.fromSeed(seedColor: ${flutterColor(app.primaryColor)}),
        brightness: ${app.theme === "dark" ? "Brightness.dark" : "Brightness.light"},
      ),
      initialRoute: '${app.splashScreen.enabled ? "/splash" : `/${app.initialPageId}`}',
      routes: {
${routeLines}
        '/splash': (_) => const ${splashPageName}(),
      },
    );
  }
}

class ${splashPageName} extends StatefulWidget {
  const ${splashPageName}({super.key});

  @override
  State<${splashPageName}> createState() => _${splashPageName}State();
}

class _${splashPageName}State extends State<${splashPageName}> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: ${Math.max(1, Number(app.splashScreen.duration || 2))}), () {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/${app.splashScreen.nextScreenId || app.initialPageId}');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ${flutterColor(app.splashScreen.backgroundColor)},
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network('${app.splashScreen.logoImage}', width: 110, height: 110, fit: BoxFit.cover),
            ),
            const SizedBox(height: 12),
            Text('${(app.splashScreen.titleText || "").replace(/'/g, "\\'")}', style: const TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

Future<void> _openUrl(String url) async {
  final uri = Uri.parse(url);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri);
  }
}

void _showDialog(BuildContext context, String text) {
  showDialog(
    context: context,
    builder: (_) => AlertDialog(title: const Text('Dialog'), content: Text(text)),
  );
}

${pageClasses}
`;
  },

  downloadProject() {
    const mainDart = this.generateMainDart();
    const blob = new Blob([mainDart], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "main.dart";
    a.click();
    URL.revokeObjectURL(url);
  }
};
