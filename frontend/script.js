window.addEventListener("DOMContentLoaded", () => {
  StateUtils.ensureBootstrap();
  AppState.selectedType = "page";

  DragDrop.initLibrary();
  DragDrop.initCanvasDropzone();
  PageManager.render();

  const deviceSelect = document.getElementById("device-select");
  applyDeviceFrame(deviceSelect.value);
  deviceSelect.addEventListener("change", (e) => applyDeviceFrame(e.target.value));

  document.getElementById("add-page-btn").addEventListener("click", () => PageManager.addPage());

  const runBtn = document.getElementById("run-app-btn");
  runBtn.addEventListener("click", () => {
    if (AppState.runtimeMode) {
      RuntimeEngine.stop();
      runBtn.textContent = "Run Runtime Flow";
      return;
    }
    RuntimeEngine.start();
    runBtn.textContent = "Stop Runtime";
  });

  document.getElementById("export-flutter-btn").addEventListener("click", () => {
    FlutterExport.downloadProject();
  });

  Inspector.render();
  renderPreview();
});