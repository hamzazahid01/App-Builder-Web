window.DragDropResize = {
  handles: [
    { dir: "nw", cursor: "nwse-resize" },
    { dir: "n", cursor: "ns-resize" },
    { dir: "ne", cursor: "nesw-resize" },
    { dir: "e", cursor: "ew-resize" },
    { dir: "se", cursor: "nwse-resize" },
    { dir: "s", cursor: "ns-resize" },
    { dir: "sw", cursor: "nesw-resize" },
    { dir: "w", cursor: "ew-resize" }
  ],

  createHandles(wrapper, component) {
    if (!wrapper || !component) return;
    for (const { dir, cursor } of this.handles) {
      const handle = document.createElement("div");
      handle.className = `resize-handle resize-${dir}`;
      handle.style.cursor = cursor;
      handle.addEventListener("pointerdown", (e) => {
        if (AppState.runtimeMode) return;
        e.stopPropagation();
        window.DragDrop.startResize(component, wrapper, dir, e);
      });
      wrapper.appendChild(handle);
    }
  },

  removeHandles(wrapper) {
    if (!wrapper) return;
    const handles = wrapper.querySelectorAll(".resize-handle");
    handles.forEach(h => h.remove());
  }
};
