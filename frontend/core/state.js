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
    pageGroups: [],
    pagePanelCollapsed: false,
    currentPageId: null,
    initialPageId: null,
    navigationStack: []
  },
  selectedId: null,
  selectedType: "none",
  draggedNodeId: null,
  suppressCanvasClickUntil: 0,
  clipboard: null,
  previewZoom: 1,
  snapToGrid: true,
  currentDeviceKey: "iphone-14",
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
    "iphone-se": { width: 320, height: 568, label: "iPhone SE" },
    "iphone-8": { width: 375, height: 667, label: "iPhone 8 / SE2" },
    "iphone-x": { width: 375, height: 812, label: "iPhone X / 11 Pro" },
    "iphone-12": { width: 390, height: 844, label: "iPhone 12 / 13" },
    "iphone-14": { width: 390, height: 844, label: "iPhone 14" },
    "iphone-14-plus": { width: 428, height: 926, label: "iPhone 14 Plus" },
    "iphone-14-pro": { width: 393, height: 852, label: "iPhone 14 Pro" },
    "iphone-14-pro-max": { width: 430, height: 932, label: "iPhone 14 Pro Max" },
    "iphone-15": { width: 393, height: 852, label: "iPhone 15" },
    "iphone-15-pro-max": { width: 430, height: 932, label: "iPhone 15 Pro Max" },
    "iphone-16-pro": { width: 402, height: 874, label: "iPhone 16 Pro" },
    "pixel-5": { width: 393, height: 851, label: "Pixel 5" },
    "pixel-7": { width: 412, height: 915, label: "Pixel 7 / 8" },
    "pixel-8-pro": { width: 448, height: 998, label: "Pixel 8 Pro" },
    "galaxy-s21": { width: 360, height: 800, label: "Galaxy S21" },
    "galaxy-s23": { width: 360, height: 780, label: "Galaxy S23" },
    "galaxy-s24": { width: 360, height: 780, label: "Galaxy S24" },
    "galaxy-s24-ultra": { width: 384, height: 824, label: "Galaxy S24 Ultra" },
    "galaxy-z-fold": { width: 344, height: 882, label: "Galaxy Z Fold (cover)" },
    "ipad-mini": { width: 744, height: 1133, label: "iPad Mini" },
    "android-small": { width: 360, height: 640, label: "Android Small" },
    "android-medium": { width: 384, height: 854, label: "Android Medium" },
    "android-large": { width: 412, height: 915, label: "Android Large" }
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

  ensureComponentLayout(component, index = 0) {
    if (component.layout) return;
    const size = ComponentFactory.getDefaultLayout(component.type);
    component.layout = {
      x: 12 + (index % 3) * 20,
      y: 12 + index * 72,
      width: size.width,
      height: size.height,
      zIndex: index + 1
    };
  },

  ensurePageCanvasLayout(page) {
    if (!page?.components) return;
    this.ensureListLayout(page.components);
  },

  ensureListLayout(list) {
    list.forEach((component, index) => {
      this.ensureComponentLayout(component, index);
      if (component.children?.length) this.ensureListLayout(component.children);
    });
  },

  findParentContext(componentId, nodes = null, parent = null) {
    const page = this.getCurrentPage();
    const list = nodes ?? page?.components;
    if (!list) return null;
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === componentId) {
        return { parentList: list, parentComponent: parent, index: i, component: list[i] };
      }
      if (list[i].children?.length) {
        const found = this.findParentContext(componentId, list[i].children, list[i]);
        if (found) return found;
      }
    }
    return null;
  },

  getNextZIndexInList(list) {
    let max = 0;
    for (const component of list) {
      const z = component.layout?.zIndex ?? 0;
      if (z > max) max = z;
    }
    return max + 1;
  },

  getNextZIndex(page) {
    return this.getNextZIndexInList(page.components);
  },

  bringToFront(component) {
    const ctx = this.findParentContext(component.id);
    if (!ctx || !component.layout) return;
    component.layout.zIndex = this.getNextZIndexInList(ctx.parentList);
  },

  sendToBack(component) {
    const ctx = this.findParentContext(component.id);
    if (!ctx || !component.layout) return;
    const list = ctx.parentList;
    let min = Infinity;
    for (const item of list) {
      const z = item.layout?.zIndex ?? 0;
      if (z < min) min = z;
    }
    component.layout.zIndex = Math.max(0, min - 1);
  },

  reIdComponentTree(node) {
    node.id = this.makeId(node.type);
    if (node.children?.length) {
      for (const child of node.children) this.reIdComponentTree(child);
    }
    return node;
  },

  duplicateComponent(componentId) {
    const page = this.getCurrentPage();
    if (!page) return null;
    const source = this.findById(page.components, componentId);
    const ctx = this.findParentContext(componentId);
    if (!source || !ctx) return null;
    const clone = this.cloneApp(source);
    this.reIdComponentTree(clone);
    if (!clone.layout) this.ensureComponentLayout(clone, ctx.parentList.length);
    clone.layout.x = (source.layout?.x ?? 0) + 16;
    clone.layout.y = (source.layout?.y ?? 0) + 16;
    clone.layout.zIndex = this.getNextZIndexInList(ctx.parentList);
    ctx.parentList.push(clone);
    return clone;
  },

  reparentComponent(componentId, newList, x, y) {
    const page = this.getCurrentPage();
    if (!page) return false;
    const ctx = this.findParentContext(componentId);
    if (!ctx) return false;
    if (ctx.parentList === newList) return false;
    const [node] = ctx.parentList.splice(ctx.index, 1);
    if (!node) return false;
    if (x !== undefined) node.layout.x = x;
    if (y !== undefined) node.layout.y = y;
    node.layout.zIndex = this.getNextZIndexInList(newList);
    newList.push(node);
    return true;
  },

  copyToClipboard(componentId) {
    const page = this.getCurrentPage();
    const source = this.findById(page?.components || [], componentId);
    if (!source) return;
    AppState.clipboard = this.cloneApp(source);
    Toast.show("Copied");
  },

  pasteFromClipboard() {
    if (!AppState.clipboard) {
      Toast.show("Nothing to paste", "error");
      return;
    }
    const page = this.getCurrentPage();
    if (!page) return;
    const clone = this.cloneApp(AppState.clipboard);
    this.reIdComponentTree(clone);
    this.ensureComponentLayout(clone, page.components.length);
    clone.layout.x += 20;
    clone.layout.y += 20;
    clone.layout.zIndex = this.getNextZIndexInList(page.components);
    page.components.push(clone);
    AppState.selectedId = clone.id;
    AppState.selectedType = "component";
    this.pushHistorySnapshot();
    Builder.refreshAll();
    Toast.show("Pasted");
  },

  nudgeComponent(componentId, dx, dy) {
    const node = this.findById(this.getCurrentPage()?.components || [], componentId);
    if (!node?.layout) return;
    node.layout.x = Math.max(0, node.layout.x + dx);
    node.layout.y = Math.max(0, node.layout.y + dy);
    renderPreview();
    Inspector.render();
  },

  canUndo() {
    return AppState.history.past.length > 1;
  },

  canRedo() {
    return AppState.history.future.length > 0;
  },

  deleteSelected() {
    const page = this.getCurrentPage();
    if (!page || !AppState.selectedId) return;
    StateUtils.removeById(page.components, AppState.selectedId);
    AppState.selectedId = null;
    AppState.selectedType = "page";
    this.pushHistorySnapshot();
    Builder.refreshAll();
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
      AppState.app = ComponentFactory.migrateApp(JSON.parse(raw));
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
