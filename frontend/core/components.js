window.ComponentCatalog = [
  { type: "button", label: "Button" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "container", label: "Container" },
  { type: "input", label: "Input" },
  { type: "icon", label: "Icon" }
];

const REMOVED_TYPES = new Set(["spacer", "center", "row", "column", "stack", "card"]);
const CONVERT_TO_CONTAINER = new Set(["row", "column", "stack", "center", "card"]);

function boxSpacing(top = 0, right = 0, bottom = 0, left = 0) {
  return { top, right, bottom, left };
}

const DEFAULT_CANVAS_LAYOUTS = {
  button: { width: 130, height: 44 },
  text: { width: 200, height: 36 },
  image: { width: 280, height: 150 },
  input: { width: 280, height: 44 },
  icon: { width: 48, height: 48 },
  container: { width: 300, height: 200 }
};

window.ComponentFactory = {
  getDefaultLayout(type) {
    return { ...(DEFAULT_CANVAS_LAYOUTS[type] || { width: 260, height: 120 }) };
  },

  createLayout(type, x = 16, y = 16, zIndex = 1) {
    const size = this.getDefaultLayout(type);
    return { x, y, width: size.width, height: size.height, zIndex };
  },

  detectFlexDirection(component) {
    const w = component.layout?.width ?? 300;
    const h = component.layout?.height ?? 200;
    return w >= h ? "row" : "column";
  },

  syncContainerFlexDirection(component) {
    if (component.type !== "container" || !component.styles) return;
    component.styles.flexDirection = this.detectFlexDirection(component);
  },

  create(type) {
    const common = {
      id: StateUtils.makeId(type),
      type,
      styles: {},
      props: {},
      children: [],
      layout: this.createLayout(type)
    };

    if (type === "button") {
      return {
        ...common,
        styles: {
          backgroundColor: "#2563eb",
          textColor: "#ffffff",
          padding: boxSpacing(10, 16, 10, 16),
          borderRadius: 10,
          fontSize: 14,
          fontWeight: "600",
          opacity: 1
        },
        props: {
          text: "Button",
          onClick: {
            type: "navigate",
            targetPageId: "",
            url: "",
            dialogText: "Hello from dialog",
            customCode: "",
            back: false
          }
        }
      };
    }

    if (type === "text") {
      return {
        ...common,
        styles: { fontSize: 16, color: "#111827", fontWeight: "400", textAlign: "left" },
        props: { value: "Text" }
      };
    }

    if (type === "container") {
      const container = {
        ...common,
        styles: {
          backgroundColor: "#f8fafc",
          padding: boxSpacing(8, 8, 8, 8),
          borderColor: "#d1d5db",
          borderWidth: 1,
          borderRadius: 10,
          gap: 8,
          opacity: 1,
          alignItems: "start",
          justifyContent: "start",
          flexDirection: "column"
        },
        props: { layoutMode: "auto" }
      };
      this.syncContainerFlexDirection(container);
      return container;
    }

    if (type === "image") {
      return {
        ...common,
        styles: { borderRadius: 10, fit: "cover" },
        props: { src: "https://placehold.co/600x300" }
      };
    }

    if (type === "input") {
      return {
        ...common,
        styles: {
          borderColor: "#cbd5e1",
          borderWidth: 1,
          borderRadius: 8,
          padding: boxSpacing(10, 10, 10, 10)
        },
        props: { placeholder: "Enter text", inputType: "text" }
      };
    }

    if (type === "icon") {
      return {
        ...common,
        styles: { fontSize: 24, color: "#1f2937" },
        props: { symbol: "⭐" }
      };
    }

    return common;
  },

  supportsChildren(type) {
    return type === "container";
  },

  migrateComponent(node) {
    if (!node) return null;
    if (REMOVED_TYPES.has(node.type) && !CONVERT_TO_CONTAINER.has(node.type)) return null;

    if (CONVERT_TO_CONTAINER.has(node.type)) {
      node.type = "container";
      if (!node.children) node.children = [];
      if (!node.props) node.props = { layoutMode: "auto" };
      node.props.layoutMode = "auto";
    }

    if (node.children?.length) {
      node.children = node.children.map((c) => this.migrateComponent(c)).filter(Boolean);
    }

    if (!node.layout) {
      const size = this.getDefaultLayout(node.type);
      node.layout = { x: 8, y: 8, width: size.width, height: size.height, zIndex: 1 };
    }

    if (node.type === "container") this.syncContainerFlexDirection(node);
    return node;
  },

  migrateApp(app) {
    for (const page of app.pages) {
      page.components = (page.components || [])
        .map((c) => this.migrateComponent(c))
        .filter(Boolean);
      StateUtils.ensurePageCanvasLayout(page);
    }
    return app;
  }
};
