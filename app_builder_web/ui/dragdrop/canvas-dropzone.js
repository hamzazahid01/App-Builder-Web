window.DragDropCanvas = {
  init() {
    const preview = document.getElementById("mobile-preview");
    preview.addEventListener("click", (e) => {
      if (AppState.runtimeMode) return;
      if (e.target.closest(".canvas-node")) return;
      if (e.target.closest(".resize-handle")) return;
      if (!e.target.closest(".page-canvas")) return;
      AppState.selectedId = null;
      AppState.selectedType = "page";
      Builder.refreshAll();
    });
  }
};
