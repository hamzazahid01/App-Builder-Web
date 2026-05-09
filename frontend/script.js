window.addEventListener("DOMContentLoaded", () => {
  DragDrop.initLibrary();
  DragDrop.initCanvasDropzone();

  const deviceSelect = document.getElementById("device-select");
  applyDeviceFrame(deviceSelect.value);
  deviceSelect.addEventListener("change", (e) => applyDeviceFrame(e.target.value));

  document.getElementById("export-flutter-btn").addEventListener("click", () => {
    FlutterExport.downloadProject();
  });

  Inspector.render();
  renderPreview();
});