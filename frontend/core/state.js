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
  history: {
    past: [],
    future: [],
    max: 60,
    watcherLastHash: "",
    isApplying: false
  },
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
  },

  cloneApp(app) {
    return JSON.parse(JSON.stringify(app));
  },

  appHash() {
    return JSON.stringify(AppState.app);
  },

  pushHistorySnapshot() {
    if (AppState.history.isApplying) return;
    const hash = this.appHash();
    if (hash === AppState.history.watcherLastHash) return;
    AppState.history.past.push(this.cloneApp(AppState.app));
    if (AppState.history.past.length > AppState.history.max) {
      AppState.history.past.shift();
    }
    AppState.history.future = [];
    AppState.history.watcherLastHash = hash;
    this.saveToLocal();
  },

  undo() {
    if (AppState.history.past.length < 2) return;
    AppState.history.isApplying = true;
    const current = AppState.history.past.pop();
    AppState.history.future.push(current);
    AppState.app = this.cloneApp(AppState.history.past[AppState.history.past.length - 1]);
    AppState.selectedId = null;
    AppState.selectedType = "page";
    AppState.history.watcherLastHash = this.appHash();
    AppState.history.isApplying = false;
    this.saveToLocal();
  },

  redo() {
    if (AppState.history.future.length === 0) return;
    AppState.history.isApplying = true;
    const snapshot = AppState.history.future.pop();
    AppState.app = this.cloneApp(snapshot);
    AppState.history.past.push(this.cloneApp(snapshot));
    AppState.selectedId = null;
    AppState.selectedType = "page";
    AppState.history.watcherLastHash = this.appHash();
    AppState.history.isApplying = false;
    this.saveToLocal();
  },

  saveToLocal() {
    localStorage.setItem("app_builder_state_v2", JSON.stringify(AppState.app));
  },

  restoreFromLocal() {
    const raw = localStorage.getItem("app_builder_state_v2");
    if (!raw) return false;
    try {
      AppState.app = JSON.parse(raw);
      return true;
    } catch (err) {
      return false;
    }
  },

  startWatcher() {
    this.pushHistorySnapshot();
    if (AppState._stateWatcherTimer) clearInterval(AppState._stateWatcherTimer);
    AppState._stateWatcherTimer = setInterval(() => this.pushHistorySnapshot(), 450);
  }
};
