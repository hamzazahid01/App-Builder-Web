window.CanvasUtils = {
  MIN_SIZE: 24,
  HANDLES: ["nw", "n", "ne", "e", "se", "s", "sw", "w"],

  clampToBounds(x, y, width, height, maxW, maxH) {
    const maxX = Math.max(0, maxW - width);
    const maxY = Math.max(0, maxH - height);
    return {
      x: Math.round(Math.max(0, Math.min(x, maxX))),
      y: Math.round(Math.max(0, Math.min(y, maxY))),
      width: Math.max(this.MIN_SIZE, width),
      height: Math.max(this.MIN_SIZE, height)
    };
  },

  clientToCanvas(clientX, clientY, canvasEl) {
    const rect = canvasEl.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  },

  applyResize(start, handle, dx, dy) {
    let { x, y, width, height } = { ...start };
    if (handle.includes("e")) width = start.width + dx;
    if (handle.includes("w")) {
      width = start.width - dx;
      x = start.x + (start.width - width);
    }
    if (handle.includes("s")) height = start.height + dy;
    if (handle.includes("n")) {
      height = start.height - dy;
      y = start.y + (start.height - height);
    }
    width = Math.max(this.MIN_SIZE, Math.round(width));
    height = Math.max(this.MIN_SIZE, Math.round(height));
    return { x: Math.round(x), y: Math.round(y), width, height };
  },

  applyLayoutToWrapper(wrapper, layout) {
    wrapper.style.left = `${layout.x}px`;
    wrapper.style.top = `${layout.y}px`;
    wrapper.style.width = `${layout.width}px`;
    wrapper.style.height = `${layout.height}px`;
    wrapper.style.zIndex = `${layout.zIndex ?? 1}`;
  },

  findDropTarget(clientX, clientY) {
    const page = StateUtils.getCurrentPage();
    if (!page) return null;

    const containerCanvases = [...document.querySelectorAll(".container-canvas")]
      .map((el) => {
        const comp = StateUtils.findById(page.components, el.dataset.containerId);
        return { el, z: comp?.layout?.zIndex ?? 0 };
      })
      .sort((a, b) => b.z - a.z);

    for (const { el } of containerCanvases) {
      const rect = el.getBoundingClientRect();
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) continue;
      const container = StateUtils.findById(page.components, el.dataset.containerId);
      if (!container) continue;
      return {
        kind: "container",
        canvasEl: el,
        parentComponent: container,
        list: container.children
      };
    }

    const pageCanvas = document.querySelector(".page-canvas");
    if (!pageCanvas) return null;
    const rect = pageCanvas.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
    return {
      kind: "page",
      canvasEl: pageCanvas,
      parentComponent: null,
      list: page.components
    };
  }
};
