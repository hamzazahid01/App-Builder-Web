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
  const addPageBtn = document.getElementById('add-page-btn');
  if (addPageBtn) addPageBtn.addEventListener('click', () => {
    PageManager.addPage();
    PageManager.render();
  });
  if (window.PageManager && typeof PageManager.render === 'function') PageManager.render();

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
