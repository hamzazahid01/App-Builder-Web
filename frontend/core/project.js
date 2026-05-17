window.ProjectIO = {
  exportJson() {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      app: StateUtils.cloneApp(AppState.app)
    };
    return JSON.stringify(payload, null, 2);
  },

  downloadJson() {
    const blob = new Blob([this.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(AppState.app.appName || "app").replace(/[^a-z0-9]+/gi, "_")}_project.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.show("Project JSON downloaded");
  },

  importFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const app = data.app || data;
        AppState.app = ComponentFactory.migrateApp(app);
        if (!AppState.app.currentPageId && AppState.app.pages[0]) {
          AppState.app.currentPageId = AppState.app.pages[0].id;
        }
        AppState.selectedId = null;
        AppState.selectedType = "page";
        AppState.clipboard = null;
        StateUtils.pushHistorySnapshot();
        Builder.refreshAll();
        Toast.show("Project imported");
      } catch (err) {
        Toast.show("Invalid project file", "error");
      }
    };
    reader.readAsText(file);
  },

  newProject() {
    if (!confirm("Start a new project? Unsaved work stays in browser until you export.")) return;
    AppState.app = {
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
    };
    StateUtils.ensureBootstrap();
    AppState.selectedId = null;
    AppState.selectedType = "page";
    AppState.clipboard = null;
    StateUtils.pushHistorySnapshot();
    Builder.refreshAll();
    Toast.show("New project created");
  },

  loadStarterTemplate() {
    const home = StateUtils.createDefaultPage("Home");
    home.components = [
      ComponentFactory.create("text"),
      ComponentFactory.create("button"),
      ComponentFactory.create("image")
    ];
    home.components[0].props.value = "Welcome!";
    home.components[0].layout = { x: 24, y: 80, width: 320, height: 40, zIndex: 1 };
    home.components[0].styles.fontSize = 22;
    home.components[0].styles.textAlign = "center";

    home.components[1].layout = { x: 95, y: 140, width: 180, height: 48, zIndex: 2 };
    home.components[1].props.text = "Get Started";
    home.components[1].props.onClick.targetPageId = home.id;

    home.components[2].layout = { x: 24, y: 210, width: 320, height: 160, zIndex: 1 };

    const login = StateUtils.createDefaultPage("Login");
    login.components = [ComponentFactory.create("input"), ComponentFactory.create("button")];
    login.components[0].layout = { x: 24, y: 120, width: 320, height: 44, zIndex: 1 };
    login.components[0].props.placeholder = "Email";
    login.components[1].layout = { x: 24, y: 180, width: 320, height: 48, zIndex: 2 };
    login.components[1].props.text = "Sign In";

    home.components[1].props.onClick.targetPageId = login.id;

    AppState.app.pages = [home, login];
    AppState.app.currentPageId = home.id;
    AppState.app.initialPageId = home.id;
    AppState.app.splashScreen.nextScreenId = home.id;
    AppState.app.appName = "Demo App";
    StateUtils.pushHistorySnapshot();
    Builder.refreshAll();
    Toast.show("Starter template loaded");
  }
};
