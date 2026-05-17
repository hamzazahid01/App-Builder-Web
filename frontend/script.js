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
  AppState.selectedType = "page";

  const titleLabel = document.getElementById("app-title-label");
  if (titleLabel) titleLabel.textContent = AppState.app.appName || "App Builder";

  populateDeviceSelect();
  DragDrop.initLibrary();
  DragDrop.initCanvasDropzone();

  const deviceSelect = document.getElementById("device-select");
  AppState.currentDeviceKey = deviceSelect.value;
  applyDeviceFrame(deviceSelect.value);
  deviceSelect.addEventListener("change", (e) => applyDeviceFrame(e.target.value));
  updateScreenLabel();

  // Pages UI
  // Ensure PageManager is available before wiring buttons. If not, dynamically load the script.
  function bindPagesUI() {
    const addPageBtn = document.getElementById('add-page-btn');
    if (addPageBtn && window.PageManager) addPageBtn.addEventListener('click', () => { PageManager.addPage(); PageManager.render(); });

    const togglePagesBtn = document.getElementById('toggle-pages-btn');
    const createGroupBtn = document.getElementById('create-group-btn');
    if (togglePagesBtn) togglePagesBtn.addEventListener('click', () => {
      AppState.app.pagePanelCollapsed = !AppState.app.pagePanelCollapsed;
      const panel = document.getElementById('pages-panel');
      if (AppState.app.pagePanelCollapsed) panel.classList.add('collapsed'); else panel.classList.remove('collapsed');
    });
    if (createGroupBtn && window.PageManager) createGroupBtn.addEventListener('click', () => { const name = prompt('Group name:'); if (!name) return; PageManager.createGroup(name); });
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
