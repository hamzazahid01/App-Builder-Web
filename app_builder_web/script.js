function populateDeviceSelect() {
  const select = document.getElementById("device-select");
  if (!select) return;
  select.innerHTML = "";
  for (const [key, device] of Object.entries(AppState.deviceMap)) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = device.label || key;
    if (key === "iphone-14") opt.selected = true;
    select.appendChild(opt);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  StateUtils.restoreFromLocal();
  StateUtils.ensureBootstrap();
  ComponentFactory.migrateApp(AppState.app);
  StateUtils.migrateComponentLayouts();
  AppState.selectedType = "page";

  const titleLabel = document.getElementById("app-title-label");
  const projectName = document.getElementById("project-name");
  const appName = AppState.app.appName || "Untitled project";
  if (titleLabel) titleLabel.textContent = appName;
  if (projectName) projectName.textContent = appName;

  populateDeviceSelect();
  DragDrop.initLibrary();
  DragDrop.initCanvasDropzone();

  const deviceSelect = document.getElementById("device-select");
  AppState.currentDeviceKey = deviceSelect.value;
  applyDeviceFrame(deviceSelect.value);
  deviceSelect.addEventListener("change", (e) => applyDeviceFrame(e.target.value));
  updateScreenLabel();

  const themeToggle = document.getElementById("theme-toggle-btn");
  const saveButton = document.getElementById("save-btn");
  const exportButton = document.getElementById("export-btn");
  const profileButton = document.getElementById("profile-menu-btn");
  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const zoomValue = document.getElementById("zoom-value");
  const snapToggleBtn = document.getElementById("snap-toggle-btn");
  let zoomLevel = 1;

  function applyZoom(value) {
    zoomLevel = Math.min(1.4, Math.max(0.65, value));
    const wrapper = document.querySelector(".preview-frame-wrap");
    if (wrapper) wrapper.style.transform = `scale(${zoomLevel})`;
    if (zoomValue) zoomValue.textContent = `${Math.round(zoomLevel * 100)}%`;
  }

  applyZoom(1);

  zoomInBtn?.addEventListener("click", () => applyZoom(zoomLevel + 0.1));
  zoomOutBtn?.addEventListener("click", () => applyZoom(zoomLevel - 0.1));

  snapToggleBtn?.addEventListener("click", () => {
    AppState.snapEnabled = !AppState.snapEnabled;
    snapToggleBtn.style.opacity = AppState.snapEnabled ? "1" : "0.4";
    Toast.show(AppState.snapEnabled ? "Snapping enabled" : "Snapping disabled");
  });

  // Set initial button state
  if (snapToggleBtn) {
    snapToggleBtn.style.opacity = AppState.snapEnabled ? "1" : "0.4";
  }

  themeToggle?.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("theme-light");
    themeToggle.textContent = isLight ? "☀️" : "🌙";
  });

  saveButton?.addEventListener("click", () => {
    StateUtils.saveToLocal();
    Toast.show("Project saved");
  });

  exportButton?.addEventListener("click", () => {
    Toast.show("Export coming soon", "info");
  });

  profileButton?.addEventListener("click", () => {
    Toast.show("Profile menu not available in preview", "info");
  });

  // Pages UI
  // Ensure PageManager is available before wiring buttons. If not, dynamically load the script.
  function bindPagesUI() {
    const addPageBtn = document.getElementById('add-page-btn');
    if (addPageBtn && window.PageManager) addPageBtn.addEventListener('click', () => { PageManager.addPage(); PageManager.render(); });
    if (window.PageManager && typeof PageManager.render === 'function') PageManager.render();
  }

  if (window.PageManager) {
    bindPagesUI();
  } else {
    // try to load the pages script dynamically and bind after load
    const scriptUrl = 'ui/pages.js';
    const existing = Array.from(document.scripts).find(s => s.src && s.src.endsWith(scriptUrl));
    if (!existing) {
      const s = document.createElement('script');
      s.src = scriptUrl;
      s.onload = () => { bindPagesUI(); };
      s.onerror = () => console.warn('Failed to load pages script:', scriptUrl);
      document.body.appendChild(s);
    } else {
      // script tag exists but PageManager still undefined; bind after short delay
      setTimeout(() => { if (window.PageManager) bindPagesUI(); else console.warn('PageManager still not defined after delay'); }, 200);
    }
  }

  document.getElementById("undo-btn").addEventListener("click", () => {
    if (!StateUtils.canUndo()) return;
    StateUtils.undo();
    Builder.refreshAll();
  });

  document.getElementById("redo-btn").addEventListener("click", () => {
    if (!StateUtils.canRedo()) return;
    StateUtils.redo();
    Builder.refreshAll();
  });

  const runBtn = document.getElementById("run-app-btn");
  runBtn.addEventListener("click", () => {
    if (AppState.runtimeMode) {
      RuntimeEngine.stop();
      runBtn.textContent = "▶ App Preview";
      document.body.classList.remove("runtime-active");
      return;
    }
    RuntimeEngine.start();
    runBtn.textContent = "■ Stop Preview";
    document.body.classList.add("runtime-active");
  });

  Inspector.render();
  renderPreview();
  StateUtils.startWatcher();
});
