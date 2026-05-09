function flutterColor(hex) {
  const clean = (hex || "#000000").replace("#", "");
  return `Color(0xFF${clean.toUpperCase()})`;
}

function edgeInsets(spacing = {}) {
  return `EdgeInsets.fromLTRB(${spacing.left ?? 0}, ${spacing.top ?? 0}, ${spacing.right ?? 0}, ${spacing.bottom ?? 0})`;
}

function renderFlutterNode(node, depth = 2) {
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
${i}    onPressed: () {},
${i}    child: Text("${node.props.text}", style: TextStyle(fontSize: ${node.styles.fontSize}, fontWeight: FontWeight.w600)),
${i}  ),
${i})`;
  }

  if (node.type === "text") {
    return `${i}Padding(
${i}  padding: ${edgeInsets(node.styles.margin)},
${i}  child: Text("${node.props.value}", textAlign: TextAlign.${node.styles.textAlign}, style: TextStyle(fontSize: ${node.styles.fontSize}, color: ${flutterColor(node.styles.color)})),
${i})`;
  }

  if (node.type === "image") {
    return `${i}Padding(
${i}  padding: ${edgeInsets(node.styles.margin)},
${i}  child: ClipRRect(
${i}    borderRadius: BorderRadius.circular(${node.styles.borderRadius}),
${i}    child: Image.network("${node.props.src}", height: ${node.styles.height}, width: double.infinity, fit: BoxFit.${node.styles.fit}),
${i}  ),
${i})`;
  }

  if (node.type === "input") {
    return `${i}Padding(
${i}  padding: ${edgeInsets(node.styles.margin)},
${i}  child: TextField(
${i}    decoration: InputDecoration(
${i}      hintText: "${node.props.placeholder}",
${i}      contentPadding: ${edgeInsets(node.styles.padding)},
${i}      border: OutlineInputBorder(
${i}        borderRadius: BorderRadius.circular(${node.styles.borderRadius}),
${i}        borderSide: BorderSide(color: ${flutterColor(node.styles.borderColor)}, width: ${node.styles.borderWidth}),
${i}      ),
${i}    ),
${i}  ),
${i})`;
  }

  if (node.type === "spacer") {
    return `${i}SizedBox(height: ${node.styles.height})`;
  }

  if (node.type === "icon") {
    return `${i}Padding(padding: ${edgeInsets(node.styles.margin)}, child: Text("${node.props.symbol}", style: TextStyle(fontSize: ${node.styles.fontSize})))`;
  }

  const isRow = node.type === "row";
  const layoutWidget = isRow ? "Row" : "Column";
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
${i}      crossAxisAlignment: CrossAxisAlignment.start,
${i}      children: [
${childWidgets}
${i}      ],
${i}    ),
${i}  ),
${i})`;
}

window.FlutterExport = {
  generateMainDart() {
    const widgets = AppState.appData.map((node) => renderFlutterNode(node)).join(",\n");
    return `import 'package:flutter/material.dart';

void main() => runApp(const GeneratedApp());

class GeneratedApp extends StatelessWidget {
  const GeneratedApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
${widgets}
              ],
            ),
          ),
        ),
      ),
    );
  }
}
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
