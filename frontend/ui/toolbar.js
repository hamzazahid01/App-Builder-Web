window.Toolbar = {
  init() {
    document.getElementById("btn-new-project")?.addEventListener("click", () => ProjectIO.newProject());
    document.getElementById("btn-starter")?.addEventListener("click", () => ProjectIO.loadStarterTemplate());
    document.getElementById("btn-export-json")?.addEventListener("click", () => ProjectIO.downloadJson());
    document.getElementById("btn-import-json")?.addEventListener("click", () => {
      document.getElementById("import-file-input")?.click();
    });
    document.getElementById("import-file-input")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) ProjectIO.importFromFile(file);
      e.target.value = "";
    });
    document.getElementById("btn-shortcuts")?.addEventListener("click", () => this.toggleShortcuts(true));
    document.getElementById("shortcuts-close")?.addEventListener("click", () => this.toggleShortcuts(false));
    document.querySelector(".shortcuts-backdrop")?.addEventListener("click", () => this.toggleShortcuts(false));

    document.getElementById("zoom-range")?.addEventListener("input", (e) => {
      AppState.previewZoom = Number(e.target.value) / 100;
      this.applyZoom();
    });

    document.getElementById("snap-toggle")?.addEventListener("change", (e) => {
      AppState.snapToGrid = e.target.checked;
    });

    this.update();
  },

  applyZoom() {
    const wrap = document.querySelector(".preview-frame-wrap");
    if (!wrap) return;
    wrap.style.transform = `scale(${AppState.previewZoom})`;
    wrap.style.transformOrigin = "top center";
  },

  toggleShortcuts(open) {
    document.getElementById("shortcuts-modal")?.classList.toggle("open", open);
  },

  update() {
    const undo = document.getElementById("undo-btn");
    const redo = document.getElementById("redo-btn");
    if (undo) undo.disabled = !StateUtils.canUndo();
    if (redo) redo.disabled = !StateUtils.canRedo();
    const snap = document.getElementById("snap-toggle");
    if (snap) snap.checked = AppState.snapToGrid;
    const zoom = document.getElementById("zoom-range");
    if (zoom) zoom.value = Math.round(AppState.previewZoom * 100);
    this.applyZoom();
    Builder.updateSaveStatus();
  }
};
