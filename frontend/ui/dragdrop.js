window.DragDrop = {
  session: null,
  ghostEl: null,
  DRAG_THRESHOLD: 4,

  initLibrary() {
    const library = document.getElementById("component-library");
    library.innerHTML = "";

    for (const item of ComponentCatalog) {
      const el = document.createElement("button");
      el.className = "library-item";
      el.textContent = item.label;
      el.type = "button";
      el.addEventListener("pointerdown", (e) => {
        if (AppState.runtimeMode) return;
        e.preventDefault();
        this.startPlaceFromLibrary(item.type, e);
      });
      library.appendChild(el);
    }
  },

  initCanvasDropzone() {
    const preview = document.getElementById("mobile-preview");
    preview.addEventListener("click", (e) => {
      if (AppState.runtimeMode) return;
      if (e.target.closest(".canvas-node")) return;
      if (!e.target.closest(".page-canvas")) return;
      AppState.selectedId = null;
      AppState.selectedType = "page";
      Inspector.render();
      renderPreview();
    });

    document.addEventListener("pointermove", (e) => this.onPointerMove(e));
    document.addEventListener("pointerup", (e) => this.onPointerUp(e));
    document.addEventListener("pointercancel", (e) => this.onPointerUp(e));
  },

  getCanvasEl() {
    return document.querySelector(".page-canvas");
  },

  clientToCanvas(clientX, clientY, canvasEl) {
    const rect = canvasEl.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  },

  clampToCanvas(x, y, width, height, canvasEl) {
    const maxX = Math.max(0, canvasEl.clientWidth - width);
    const maxY = Math.max(0, canvasEl.clientHeight - height);
    return {
      x: Math.round(Math.max(0, Math.min(x, maxX))),
      y: Math.round(Math.max(0, Math.min(y, maxY)))
    };
  },

  startPlaceFromLibrary(type, e) {
    let canvas = this.getCanvasEl();
    if (!canvas) {
      renderPreview();
      canvas = this.getCanvasEl();
    }
    if (!canvas) return;

    const defaults = ComponentFactory.getDefaultLayout(type);
    const pos = this.clientToCanvas(e.clientX, e.clientY, canvas);
    const start = this.clampToCanvas(
      pos.x - defaults.width / 2,
      pos.y - defaults.height / 2,
      defaults.width,
      defaults.height,
      canvas
    );

    this.beginSession({
      mode: "place",
      type,
      pointerId: e.pointerId,
      canvasEl: canvas,
      offsetX: defaults.width / 2,
      offsetY: defaults.height / 2,
      layout: { width: defaults.width, height: defaults.height },
      pendingX: start.x,
      pendingY: start.y,
      startClientX: e.clientX,
      startClientY: e.clientY,
      moved: false
    });
    this.updateGhost(start.x, start.y, defaults.width, defaults.height, type);
    document.body.classList.add("canvas-placing");
  },

  startMoveComponent(component, wrapperEl, e) {
    if (AppState.runtimeMode) return;
    const canvas = wrapperEl.closest(".page-canvas");
    if (!canvas || !component.layout) return;

    e.stopPropagation();
    e.preventDefault();

    const pos = this.clientToCanvas(e.clientX, e.clientY, canvas);
    this.beginSession({
      mode: "move",
      componentId: component.id,
      component,
      pointerId: e.pointerId,
      canvasEl: canvas,
      wrapperEl,
      offsetX: pos.x - component.layout.x,
      offsetY: pos.y - component.layout.y,
      startClientX: e.clientX,
      startClientY: e.clientY,
      moved: false,
      selectedOnUp: false
    });

    try {
      wrapperEl.setPointerCapture(e.pointerId);
    } catch (_) {}
  },

  beginSession(session) {
    if (this.session) this.cancelSession();
    this.session = session;
    document.body.classList.add("canvas-dragging");
  },

  updateGhost(x, y, w, h, label) {
    if (!this.ghostEl) {
      this.ghostEl = document.createElement("div");
      this.ghostEl.className = "drag-ghost";
      document.body.appendChild(this.ghostEl);
    }
    const canvas = this.session?.canvasEl;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    this.ghostEl.style.left = `${rect.left + x}px`;
    this.ghostEl.style.top = `${rect.top + y}px`;
    this.ghostEl.style.width = `${w}px`;
    this.ghostEl.style.height = `${h}px`;
    this.ghostEl.dataset.label = label || "";
    this.ghostEl.textContent = ComponentCatalog.find((c) => c.type === label)?.label || "";
  },

  removeGhost() {
    if (this.ghostEl) {
      this.ghostEl.remove();
      this.ghostEl = null;
    }
  },

  onPointerMove(e) {
    const session = this.session;
    if (!session || e.pointerId !== session.pointerId) return;

    if (!session.moved) {
      const dx = e.clientX - (session.startClientX ?? e.clientX);
      const dy = e.clientY - (session.startClientY ?? e.clientY);
      if (Math.hypot(dx, dy) < this.DRAG_THRESHOLD) return;
      session.moved = true;
      if (session.mode === "move" && session.component) {
        StateUtils.bringToFront(session.component);
        AppState.selectedId = session.component.id;
        AppState.selectedType = "component";
      }
    }

    const pos = this.clientToCanvas(e.clientX, e.clientY, session.canvasEl);
    const x = pos.x - session.offsetX;
    const y = pos.y - session.offsetY;

    if (session.mode === "place") {
      const clamped = this.clampToCanvas(x, y, session.layout.width, session.layout.height, session.canvasEl);
      session.pendingX = clamped.x;
      session.pendingY = clamped.y;
      this.updateGhost(clamped.x, clamped.y, session.layout.width, session.layout.height, session.type);
      return;
    }

    if (session.mode === "move") {
      const page = StateUtils.getCurrentPage();
      const node = StateUtils.findById(page.components, session.componentId);
      if (!node?.layout) return;
      const clamped = this.clampToCanvas(x, y, node.layout.width, node.layout.height, session.canvasEl);
      node.layout.x = clamped.x;
      node.layout.y = clamped.y;
      if (session.wrapperEl) {
        session.wrapperEl.style.left = `${clamped.x}px`;
        session.wrapperEl.style.top = `${clamped.y}px`;
        session.wrapperEl.classList.add("is-dragging");
      }
    }
  },

  onPointerUp(e) {
    const session = this.session;
    if (!session || e.pointerId !== session.pointerId) return;

    if (session.mode === "place") {
      if (session.pendingX !== undefined) {
        this.placeComponent(session.type, session.pendingX, session.pendingY);
      }
    }

    if (session.mode === "move") {
      if (session.wrapperEl) {
        session.wrapperEl.classList.remove("is-dragging");
        try {
          session.wrapperEl.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      if (!session.moved && session.component) {
        AppState.selectedId = session.component.id;
        AppState.selectedType = "component";
        StateUtils.bringToFront(session.component);
        Inspector.render();
        renderPreview();
      }
    }

    this.finishSession(session.moved || session.mode === "place");
  },

  placeComponent(type, x, y) {
    const page = StateUtils.getCurrentPage();
    if (!page) return;
    const component = ComponentFactory.create(type);
    component.layout.x = x;
    component.layout.y = y;
    component.layout.zIndex = StateUtils.getNextZIndex(page);
    page.components.push(component);
    AppState.selectedId = component.id;
    AppState.selectedType = "component";
  },

  finishSession(commitHistory) {
    document.body.classList.remove("canvas-dragging", "canvas-placing");
    this.removeGhost();
    this.session = null;
    AppState.suppressCanvasClickUntil = Date.now() + 120;
    if (commitHistory) StateUtils.pushHistorySnapshot();
    renderPreview();
    Inspector.render();
  },

  cancelSession() {
    document.body.classList.remove("canvas-dragging", "canvas-placing");
    this.removeGhost();
    this.session = null;
  },

  attachNode(wrapperEl, component) {
    wrapperEl.addEventListener("pointerdown", (e) => {
      if (AppState.runtimeMode) return;
      if (e.button !== 0) return;
      if (e.target.closest("input, textarea, select")) return;
      this.startMoveComponent(component, wrapperEl, e);
    }, true);
  }
};
