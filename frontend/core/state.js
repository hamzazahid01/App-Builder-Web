window.AppState = {
  app: {
    appName: "My No-Code App",
    theme: "light",
    primaryColor: "#2563eb",
    fontFamily: "Inter",
    splashScreen: {
      enabled: true,
      backgroundColor: "#111827",
      logoImage: "https://placehold.co/120x120",
      titleText: "Welcome",
      duration: 2,
      nextScreenId: null
    },
    pages: [],
    currentPageId: null,
    initialPageId: null,
    navigationStack: []
  },
  selectedId: null,
  selectedType: "none",
  draggedNodeId: null,
  runtimeMode: false,
  runtimeSplashTimer: null,
  runtimeScreen: "page",
  deviceMap: {
    "iphone-se": { width: 320, height: 568 },
    "iphone-14": { width: 390, height: 844 },
    "android-small": { width: 360, height: 640 },
    "android-large": { width: 412, height: 915 }
  }
};

window.StateUtils = {
  makeId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  },

  createDefaultPage(name = "Home Page") {
    return {
      id: this.makeId("page"),
      name,
      components: [],
      backgroundColor: "#f8fafc",
      appBar: {
        enabled: true,
        title: name,
        backgroundColor: "#ffffff",
        textColor: "#0f172a"
      },
      layout: {
        padding: { top: 12, right: 12, bottom: 12, left: 12 },
        alignment: "top",
        scrollBehavior: "scroll",
        safeArea: true
      }
    };
  },

  getCurrentPage() {
    return AppState.app.pages.find((p) => p.id === AppState.app.currentPageId) || null;
  },

  setCurrentPage(pageId, pushToStack = true) {
    const page = AppState.app.pages.find((p) => p.id === pageId);
    if (!page) return;
    if (pushToStack) AppState.app.navigationStack.push(pageId);
    AppState.app.currentPageId = pageId;
  },

  ensureBootstrap() {
    if (AppState.app.pages.length > 0) return;
    const home = this.createDefaultPage("Home Page");
    AppState.app.pages.push(home);
    AppState.app.currentPageId = home.id;
    AppState.app.initialPageId = home.id;
    AppState.app.splashScreen.nextScreenId = home.id;
  },

  findById(nodes, id) {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (!node.children) continue;
      const found = this.findById(node.children, id);
      if (found) return found;
    }
    return null;
  },

  removeById(nodes, id) {
    const idx = nodes.findIndex((n) => n.id === id);
    if (idx !== -1) return nodes.splice(idx, 1)[0];
    for (const node of nodes) {
      if (!node.children) continue;
      const removed = this.removeById(node.children, id);
      if (removed) return removed;
    }
    return null;
  }
};
