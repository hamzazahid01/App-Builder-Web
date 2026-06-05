window.Keyboard = {
  init() {
    document.addEventListener("keydown", (e) => this.onKeyDown(e));
  },

  isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  },

  onKeyDown(e) {
    if (AppState.runtimeMode) return;
    if (this.isTypingTarget(e.target)) return;

    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      if (StateUtils.canUndo()) {
        StateUtils.undo();
        Builder.refreshAll();
        Toast.show("Undo");
      }
      return;
    }

    if ((mod && e.key === "y") || (mod && e.shiftKey && e.key === "z")) {
      e.preventDefault();
      if (StateUtils.canRedo()) {
        StateUtils.redo();
        Builder.refreshAll();
        Toast.show("Redo");
      }
      return;
    }

    if (mod && e.key === "c" && AppState.selectedId) {
      e.preventDefault();
      StateUtils.copyToClipboard(AppState.selectedId);
      return;
    }

    if (mod && e.key === "v") {
      e.preventDefault();
      StateUtils.pasteFromClipboard();
      return;
    }

    if (mod && e.key === "d" && AppState.selectedId) {
      e.preventDefault();
      const clone = StateUtils.duplicateComponent(AppState.selectedId);
      if (clone) {
        AppState.selectedId = clone.id;
        StateUtils.pushHistorySnapshot();
        Builder.refreshAll();
        Toast.show("Duplicated");
      }
      return;
    }

    if ((e.key === "Delete" || e.key === "Backspace") && AppState.selectedId) {
      e.preventDefault();
      StateUtils.deleteSelected();
      return;
    }

    if (e.key === "Escape") {
      AppState.selectedId = null;
      AppState.selectedType = "page";
      Builder.refreshAll();
      return;
    }

    if (AppState.selectedId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      const step = e.shiftKey ? 8 : 1;
      const map = {
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0]
      };
      const [dx, dy] = map[e.key];
      StateUtils.nudgeComponent(AppState.selectedId, dx, dy);
      StateUtils.pushHistorySnapshot();
    }
  }
};
