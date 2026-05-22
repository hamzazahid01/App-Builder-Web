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

  // Convert pixel layout to percentage (0-1)
  pixelsToPercent(layout, deviceSize) {
    if (!deviceSize) return null;
    return {
      x: Math.max(0, Math.min(1, layout.x / deviceSize.width)),
      y: Math.max(0, Math.min(1, layout.y / deviceSize.height)),
      width: Math.max(0.01, Math.min(1, layout.width / deviceSize.width)),
      height: Math.max(0.01, Math.min(1, layout.height / deviceSize.height))
    };
  },

  // Convert percentage (0-1) to pixel layout
  percentToPixels(layoutPercent, deviceSize) {
    if (!layoutPercent || !deviceSize) return null;
    return {
      x: Math.round(layoutPercent.x * deviceSize.width),
      y: Math.round(layoutPercent.y * deviceSize.height),
      width: Math.max(this.MIN_SIZE, Math.round(layoutPercent.width * deviceSize.width)),
      height: Math.max(this.MIN_SIZE, Math.round(layoutPercent.height * deviceSize.height))
    };
  },

  // Calculate scale factor between devices
  getScaleFactor(targetDeviceKey, baseDeviceKey = null) {
    const baseKey = baseDeviceKey || AppState.app.baseDevice || "iphone-14";
    const baseDevice = AppState.deviceMap[baseKey];
    const targetDevice = AppState.deviceMap[targetDeviceKey];
    
    if (!baseDevice || !targetDevice) return 1;
    
    // Use width as primary scale factor (height can vary more between devices)
    return targetDevice.width / baseDevice.width;
  },

  // Scale style values based on device change
  scaleStyles(styles, scaleFactor) {
    if (!styles || scaleFactor === 1) return styles;
    
    const scaled = { ...styles };
    
    // Scale numeric style properties
    const scalableProps = [
      'fontSize', 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
      'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
      'borderWidth', 'borderRadius', 'borderTopWidth', 'borderBottomWidth',
      'borderLeftWidth', 'borderRightWidth', 'lineHeight', 'letterSpacing'
    ];
    
    scalableProps.forEach(prop => {
      if (typeof scaled[prop] === 'number') {
        scaled[prop] = Math.max(1, Math.round(scaled[prop] * scaleFactor));
      }
    });
    
    // Scale padding/margin objects
    if (scaled.padding && typeof scaled.padding === 'object') {
      scaled.padding = {
        top: Math.max(1, Math.round((scaled.padding.top || 0) * scaleFactor)),
        right: Math.max(1, Math.round((scaled.padding.right || 0) * scaleFactor)),
        bottom: Math.max(1, Math.round((scaled.padding.bottom || 0) * scaleFactor)),
        left: Math.max(1, Math.round((scaled.padding.left || 0) * scaleFactor))
      };
    }
    
    if (scaled.margin && typeof scaled.margin === 'object') {
      scaled.margin = {
        top: Math.max(1, Math.round((scaled.margin.top || 0) * scaleFactor)),
        right: Math.max(1, Math.round((scaled.margin.right || 0) * scaleFactor)),
        bottom: Math.max(1, Math.round((scaled.margin.bottom || 0) * scaleFactor)),
        left: Math.max(1, Math.round((scaled.margin.left || 0) * scaleFactor))
      };
    }
    
    return scaled;
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

    // Use elementFromPoint to find the actual element under cursor
    const element = document.elementFromPoint(clientX, clientY);
    if (!element) {
      return this.getFallbackTarget(clientX, clientY, page);
    }

    // Traverse up to find the closest group-inner-canvas
    let current = element;
    let closestGroupCanvas = null;

    while (current && current !== document.body) {
      if (current.classList.contains("group-inner-canvas")) {
        closestGroupCanvas = current;
        break;
      }
      current = current.parentElement;
    }

    if (closestGroupCanvas) {
      const comp = StateUtils.findById(page.components, closestGroupCanvas.dataset.groupId);
      if (comp) {
        if (!comp.children) comp.children = [];
        return {
          kind: "group",
          canvasEl: closestGroupCanvas,
          parentComponent: comp,
          list: comp.children
        };
      }
    }

    return this.getFallbackTarget(clientX, clientY, page);
  },

  getFallbackTarget(clientX, clientY, page) {
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
