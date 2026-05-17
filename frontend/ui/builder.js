window.Builder = {
  refreshAll() {
    Inspector.render();
    renderPreview();
    if (typeof updateScreenLabel === "function") updateScreenLabel();
    const undo = document.getElementById("undo-btn");
    const redo = document.getElementById("redo-btn");
    if (undo) undo.disabled = !StateUtils.canUndo();
    if (redo) redo.disabled = !StateUtils.canRedo();
  }
};
