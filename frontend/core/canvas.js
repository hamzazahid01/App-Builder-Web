window.CanvasUtils = {
  MIN_SIZE: 24,
  HANDLES: ["nw", "n", "ne", "e", "se", "s", "sw", "w"],

  snap(value) {
    if (!AppState.snapToGrid) return Math.round(value);
    const grid = 8;
    return Math.round(value / grid) * grid;
  },

  getCanvasSize(canvasEl) {
    if (!canvasEl) return { width: 320, height: 640 };
    const w = canvasEl.clientWidth || canvasEl.offsetWidth || 0;
    const h = canvasEl.clientHeight || canvasEl.offsetHeight || 0;
    const frame = AppState.deviceMap[AppState.currentDeviceKey] || AppState.deviceMap["iphone-14"];
    return {
      width: Math.max(120, w || frame.width - 24),
      height: Math.max(120, h || frame.height - 100)
    };
  },

  clampToBounds(x, y, width, height, maxW, maxH) {
    const safeW = Math.max(this.MIN_SIZE * 2, maxW || 0);
    const safeH = Math.max(this.MIN_SIZE * 2, maxH || 0);
    const maxX = Math.max(0, safeW - width);
    const maxY = Math.max(0, safeH - height);
    return {
      x: this.snap(Math.max(0, Math.min(x, maxX))),
      y: this.snap(Math.max(0, Math.min(y, maxY))),
      width: Math.max(this.MIN_SIZE, Math.round(width)),
      height: Math.max(this.MIN_SIZE, Math.round(height))
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
