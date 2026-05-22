window.SnapGuide = {
  SNAP_THRESHOLD: 10,
  overlay: null,
  activeGuides: [],

  init() {
    this.createOverlay();
  },

  createOverlay() {
    // Create SVG overlay for guide lines
    const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    overlay.className = "snap-guide-overlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "9999";
    overlay.style.display = "none";
    
    // Add style for guide lines
    const style = document.createElement("style");
    style.textContent = `
      .snap-guide-overlay {
        overflow: visible;
      }
      .snap-guide-line {
        stroke: #6366f1;
        stroke-width: 1;
        stroke-dasharray: 4 2;
        opacity: 0.8;
      }
      .snap-guide-center {
        stroke: #818cf8;
        stroke-width: 2;
        stroke-dasharray: 6 3;
        opacity: 0.9;
      }
    `;
    overlay.appendChild(style);
    
    this.overlay = overlay;
  },

  attachToCanvas(canvas) {
    if (!canvas || canvas.contains(this.overlay)) return;
    canvas.appendChild(this.overlay);
  },

  detachFromCanvas(canvas) {
    if (!canvas || !canvas.contains(this.overlay)) return;
    canvas.removeChild(this.overlay);
  },

  show() {
    if (this.overlay) this.overlay.style.display = "block";
  },

  hide() {
    if (this.overlay) {
      this.overlay.style.display = "none";
      this.clearGuides();
    }
  },

  clearGuides() {
    if (!this.overlay) return;
    // Remove all guide lines except the style element
    const lines = this.overlay.querySelectorAll(".snap-guide-line, .snap-guide-center");
    lines.forEach(line => line.remove());
    this.activeGuides = [];
  },

  drawLine(x1, y1, x2, y2, isCenter = false) {
    if (!this.overlay) return;
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.className = isCenter ? "snap-guide-center" : "snap-guide-line";
    
    this.overlay.appendChild(line);
    this.activeGuides.push(line);
  },

  calculateCenterSnap(layout, canvasSize) {
    const snaps = [];
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const elementCenterX = layout.x + layout.width / 2;
    const elementCenterY = layout.y + layout.height / 2;

    // Check horizontal center
    if (Math.abs(elementCenterX - centerX) <= this.SNAP_THRESHOLD) {
      snaps.push({
        type: "center-h",
        value: centerX - layout.width / 2,
        line: { x1: centerX, y1: 0, x2: centerX, y2: canvasSize.height }
      });
    }

    // Check vertical center
    if (Math.abs(elementCenterY - centerY) <= this.SNAP_THRESHOLD) {
      snaps.push({
        type: "center-v",
        value: centerY - layout.height / 2,
        line: { x1: 0, y1: centerY, x2: canvasSize.width, y2: centerY }
      });
    }

    return snaps;
  },

  calculateElementSnaps(layout, components, excludeId = null) {
    const snaps = [];
    const elementLeft = layout.x;
    const elementRight = layout.x + layout.width;
    const elementTop = layout.y;
    const elementBottom = layout.y + layout.height;
    const elementCenterX = layout.x + layout.width / 2;
    const elementCenterY = layout.y + layout.height / 2;

    components.forEach(comp => {
      if (comp.id === excludeId || !comp.layout) return;

      const compLeft = comp.layout.x;
      const compRight = comp.layout.x + comp.layout.width;
      const compTop = comp.layout.y;
      const compBottom = comp.layout.y + comp.layout.height;
      const compCenterX = comp.layout.x + comp.layout.width / 2;
      const compCenterY = comp.layout.y + comp.layout.height / 2;

      // Left edge alignment
      if (Math.abs(elementLeft - compLeft) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "left", value: compLeft, line: { x1: compLeft, y1: 0, x2: compLeft, y2: 0 } });
      }
      if (Math.abs(elementLeft - compRight) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "left-right", value: compRight, line: { x1: compRight, y1: 0, x2: compRight, y2: 0 } });
      }

      // Right edge alignment
      if (Math.abs(elementRight - compRight) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "right", value: compRight - layout.width, line: { x1: compRight, y1: 0, x2: compRight, y2: 0 } });
      }
      if (Math.abs(elementRight - compLeft) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "right-left", value: compLeft - layout.width, line: { x1: compLeft, y1: 0, x2: compLeft, y2: 0 } });
      }

      // Top edge alignment
      if (Math.abs(elementTop - compTop) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "top", value: compTop, line: { x1: 0, y1: compTop, x2: 0, y2: compTop } });
      }
      if (Math.abs(elementTop - compBottom) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "top-bottom", value: compBottom, line: { x1: 0, y1: compBottom, x2: 0, y2: compBottom } });
      }

      // Bottom edge alignment
      if (Math.abs(elementBottom - compBottom) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "bottom", value: compBottom - layout.height, line: { x1: 0, y1: compBottom, x2: 0, y2: compBottom } });
      }
      if (Math.abs(elementBottom - compTop) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "bottom-top", value: compTop - layout.height, line: { x1: 0, y1: compTop, x2: 0, y2: compTop } });
      }

      // Center alignment
      if (Math.abs(elementCenterX - compCenterX) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "center-x", value: compCenterX - layout.width / 2, line: { x1: compCenterX, y1: 0, x2: compCenterX, y2: 0 } });
      }
      if (Math.abs(elementCenterY - compCenterY) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "center-y", value: compCenterY - layout.height / 2, line: { x1: 0, y1: compCenterY, x2: 0, y2: compCenterY } });
      }
    });

    return snaps;
  },

  calculateSizeSnaps(width, height, components, excludeId = null) {
    const snaps = [];

    components.forEach(comp => {
      if (comp.id === excludeId || !comp.layout) return;

      // Width snapping
      if (Math.abs(width - comp.layout.width) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "width", value: comp.layout.width });
      }

      // Height snapping
      if (Math.abs(height - comp.layout.height) <= this.SNAP_THRESHOLD) {
        snaps.push({ type: "height", value: comp.layout.height });
      }
    });

    return snaps;
  },

  applySnaps(layout, snaps, canvasSize) {
    let newX = layout.x;
    let newY = layout.y;

    snaps.forEach(snap => {
      if (snap.type === "center-h" || snap.type === "center-x") {
        newX = snap.value;
      } else if (snap.type === "center-v" || snap.type === "center-y") {
        newY = snap.value;
      } else if (snap.type.startsWith("left") || snap.type.startsWith("right")) {
        newX = snap.value;
      } else if (snap.type.startsWith("top") || snap.type.startsWith("bottom")) {
        newY = snap.value;
      }
    });

    return { x: newX, y: newY };
  },

  renderGuides(snaps, canvasSize) {
    this.clearGuides();
    
    snaps.forEach(snap => {
      if (snap.line) {
        const isCenter = snap.type.includes("center");
        // Extend guide lines to full canvas
        const x1 = snap.line.x1 === 0 ? 0 : snap.line.x1;
        const y1 = snap.line.y1 === 0 ? 0 : snap.line.y1;
        const x2 = snap.line.x2 === 0 ? canvasSize.width : snap.line.x2;
        const y2 = snap.line.y2 === 0 ? canvasSize.height : snap.line.y2;
        this.drawLine(x1, y1, x2, y2, isCenter);
      }
    });
  }
};
