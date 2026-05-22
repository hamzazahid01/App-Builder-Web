window.ComponentCatalog = [
  { type: "button", label: "Button" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "input", label: "Input" },
  { type: "icon", label: "Icon" },
  { type: "group", label: "Group" }
];

window.ComponentRegistry = window.ComponentRegistry || {};

const REMOVED_TYPES = new Set(["spacer", "center", "row", "column", "stack", "card"]);

function boxSpacing(top = 0, right = 0, bottom = 0, left = 0) {
  return { top, right, bottom, left };
}

const DEFAULT_CANVAS_LAYOUTS = {
  button: { width: 130, height: 44 },
  text: { width: 200, height: 36 },
  image: { width: 280, height: 150 },
  input: { width: 280, height: 44 },
  icon: { width: 48, height: 48 },
  group: { width: 300, height: 200 }
};

window.ComponentFactory = {
  getDefaultLayout(type) {
    return { ...(DEFAULT_CANVAS_LAYOUTS[type] || { width: 260, height: 120 }) };
  },

  createLayout(type, x = 16, y = 16, zIndex = 1, deviceSize = null) {
    const size = this.getDefaultLayout(type);
    const layout = { x, y, width: size.width, height: size.height, zIndex };
    
    // Calculate percentages if device size is provided
    if (deviceSize) {
      layout.layoutPercent = {
        x: x / deviceSize.width,
        y: y / deviceSize.height,
        width: size.width / deviceSize.width,
        height: size.height / deviceSize.height
      };
    }
    
    return layout;
  },

  createBase(type) {
    return {
      id: StateUtils.makeId(type),
      type,
      styles: {},
      props: {},
      children: [],
      layout: this.createLayout(type)
    };
  },

  create(type) {
    const componentModule = window.ComponentRegistry?.[type];
    if (componentModule?.create) return componentModule.create();

    const common = {
      id: StateUtils.makeId(type),
      type,
      styles: {},
      props: {},
      children: [],
      layout: this.createLayout(type)
    };

    return common;
  },

  migrateComponent(node) {
    if (!node) return null;
    if (REMOVED_TYPES.has(node.type)) return null;

    if (node.children?.length) {
      node.children = node.children.map((c) => this.migrateComponent(c)).filter(Boolean);
    }

    if (!node.layout) {
      const size = this.getDefaultLayout(node.type);
      node.layout = { x: 8, y: 8, width: size.width, height: size.height, zIndex: 1 };
    }

    if (node.type === "button") ButtonStyles.ensure(node);
    return node;
  },

  migrateApp(app) {
    for (const page of app.pages || []) {
      page.components = (page.components || [])
        .map((c) => this.migrateComponent(c))
        .filter(Boolean);
    }
    if (!app.pages?.length) return app;
    if (!app.initialPageId) app.initialPageId = app.pages[0].id;
    if (!app.currentPageId) app.currentPageId = app.pages[0].id;
    if (!app.splashScreen.nextScreenId) app.splashScreen.nextScreenId = app.initialPageId;
    for (const page of app.pages) StateUtils.ensurePageCanvasLayout(page);
    return app;
  }
};
