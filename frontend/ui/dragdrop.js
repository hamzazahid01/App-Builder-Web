window.DragDrop = {
  session: null,
  ghostEl: null,
  DRAG_THRESHOLD: 4,
  libraryGroups: [
    { title: "Basic", icon: "🧩", types: ["text", "button", "input"] },
    { title: "Layout", icon: "▢", types: ["container"] },
    { title: "Media", icon: "🖼️", types: ["image", "icon"] },
    { title: "Navigation", icon: "🧭", types: [] },
    { title: "Advanced", icon: "⚙️", types: [] }
  ],

  initLibrary() {
    const search = document.getElementById("component-search");
    if (search) {
      search.addEventListener("input", (e) => this.renderLibrary(e.target.value));
    }
    this.renderLibrary("");
  },

  renderLibrary(filter = "") {
    const container = document.getElementById("component-categories");
    if (!container) return;
    container.innerHTML = "";

    const catalog = Array.isArray(window.ComponentCatalog) ? window.ComponentCatalog : [];
    if (!catalog.length) {
      container.innerHTML = `<div class="category-empty">Component library unavailable.<br/>Please check ` +
        `that core/components.js is loaded.</div>`;
      return;
    }

    const query = (filter || "").trim().toLowerCase();
    const items = catalog
      .filter((item) => !query || item.label.toLowerCase().includes(query));

    const itemsWrapper = document.createElement("div");
    itemsWrapper.className = "category-items";

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "category-empty";
      empty.textContent = query ? "No components match your search." : "No components are available right now.";
      itemsWrapper.appendChild(empty);
    } else {
      for (const item of items) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "component-item";
        card.innerHTML = `<span>${item.label}</span><span class="component-badge">${item.icon || '➕'}</span>`;
        card.addEventListener("pointerdown", (e) => {
          if (AppState.runtimeMode) return;
          e.preventDefault();
          this.startPlaceFromLibrary(item.type, e);
        });
        itemsWrapper.appendChild(card);
      }
    }

    container.appendChild(itemsWrapper);
  },

  initCanvasDropzone() {
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

    document.addEventListener("pointermove", (e) => this.onPointerMove(e));
    document.addEventListener("pointerup", (e) => this.onPointerUp(e));
    document.addEventListener("pointercancel", (e) => this.onPointerUp(e));
  },

  startPlaceFromLibrary(type, e) {
    const pageCanvas = document.querySelector(".page-canvas");
    let target = CanvasUtils.findDropTarget(e.clientX, e.clientY);
    if (type === "container") {
      target = { kind: "page", canvasEl: pageCanvas, list: StateUtils.getCurrentPage()?.components };
    }
    let canvas = type === "container" ? pageCanvas : (target?.canvasEl ?? pageCanvas);
    if (!canvas) {
      renderPreview();
      canvas = document.querySelector(".page-canvas");
    }
    if (!canvas) return;

    const defaults = ComponentFactory.getDefaultLayout(type);
    const pos = CanvasUtils.clientToCanvas(e.clientX, e.clientY, canvas);
    const size = CanvasUtils.getCanvasSize(canvas);
    const start = CanvasUtils.clampToBounds(
      pos.x - defaults.width / 2,
      pos.y - defaults.height / 2,
      defaults.width,
      defaults.height,
      size.width,
      size.height
    );

    this.beginSession({
      mode: "place",
      type,
      pointerId: e.pointerId,
      canvasEl: canvas,
      dropTarget: target,
      offsetX: defaults.width / 2,
      offsetY: defaults.height / 2,
      layout: { width: defaults.width, height: defaults.height },
      pendingX: start.x,
      pendingY: start.y,
      startClientX: e.clientX,
      startClientY: e.clientY,
      moved: false
    });
    this.updateGhost(start.x, start.y, defaults.width, defaults.height, type, canvas);
    document.body.classList.add("canvas-placing");
  },

  startMoveComponent(component, wrapperEl, e) {
    if (AppState.runtimeMode) return;
    if (e.target.closest(".resize-handle")) return;
    const canvas = wrapperEl.closest(".page-canvas, .container-canvas");
    if (!canvas || !component.layout) return;

    e.stopPropagation();
    e.preventDefault();

    const pos = CanvasUtils.clientToCanvas(e.clientX, e.clientY, canvas);
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
      moved: false
    });

    try {
      wrapperEl.setPointerCapture(e.pointerId);
    } catch (_) {}
  },

  startResize(component, wrapperEl, handle, e) {
    if (AppState.runtimeMode) return;
    const canvas = wrapperEl.closest(".page-canvas, .container-canvas");
    if (!canvas || !component.layout) return;

    e.stopPropagation();
    e.preventDefault();

    document.body.classList.add("canvas-resizing");
    this.beginSession({
      mode: "resize",
      componentId: component.id,
      component,
      handle,
      pointerId: e.pointerId,
      canvasEl: canvas,
      wrapperEl,
      startLayout: { ...component.layout },
      startClientX: e.clientX,
      startClientY: e.clientY,
      moved: true
    });

    AppState.selectedId = component.id;
    AppState.selectedType = "component";
    StateUtils.bringToFront(component);

    try {
      wrapperEl.setPointerCapture(e.pointerId);
    } catch (_) {}
  },

  beginSession(session) {
    if (this.session) this.cancelSession();
    this.session = session;
    document.body.classList.add("canvas-dragging");
  },

  updateGhost(x, y, w, h, label, canvasEl) {
    if (!this.ghostEl) {
      this.ghostEl = document.createElement("div");
      this.ghostEl.className = "drag-ghost";
      document.body.appendChild(this.ghostEl);
    }
    const canvas = canvasEl || this.session?.canvasEl;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    this.ghostEl.style.left = `${rect.left + x}px`;
    this.ghostEl.style.top = `${rect.top + y}px`;
    this.ghostEl.style.width = `${w}px`;
    this.ghostEl.style.height = `${h}px`;
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

    if (session.mode === "place") {
      let target = CanvasUtils.findDropTarget(e.clientX, e.clientY);
      const pageCanvas = document.querySelector(".page-canvas");
      if (session.type === "container") {
        target = { kind: "page", canvasEl: pageCanvas, list: StateUtils.getCurrentPage()?.components };
      }
      const canvas = session.type === "container" ? pageCanvas : (target?.canvasEl ?? session.canvasEl);
      session.canvasEl = canvas;
      session.dropTarget = target;
      const pos = CanvasUtils.clientToCanvas(e.clientX, e.clientY, canvas);
      const x = pos.x - session.offsetX;
      const y = pos.y - session.offsetY;
      const cs = CanvasUtils.getCanvasSize(canvas);
      const clamped = CanvasUtils.clampToBounds(
        x, y, session.layout.width, session.layout.height, cs.width, cs.height
      );
      session.pendingX = clamped.x;
      session.pendingY = clamped.y;
      this.updateGhost(clamped.x, clamped.y, session.layout.width, session.layout.height, session.type, canvas);
      return;
    }

    if (!session.moved && session.mode !== "resize") {
      const dx = e.clientX - session.startClientX;
      const dy = e.clientY - session.startClientY;
      if (Math.hypot(dx, dy) < this.DRAG_THRESHOLD) return;
      session.moved = true;
      if (session.mode === "move" && session.component) {
        StateUtils.bringToFront(session.component);
        AppState.selectedId = session.component.id;
        AppState.selectedType = "component";
      }
    }

    const component = session.component || StateUtils.findById(StateUtils.getCurrentPage().components, session.componentId);
    if (!component?.layout) return;

    if (session.mode === "resize") {
      const dx = e.clientX - session.startClientX;
      const dy = e.clientY - session.startClientY;
      const next = CanvasUtils.applyResize(session.startLayout, session.handle, dx, dy);
      const cs = CanvasUtils.getCanvasSize(session.canvasEl);
      const clamped = CanvasUtils.clampToBounds(
        next.x, next.y, next.width, next.height, cs.width, cs.height
      );
      Object.assign(component.layout, clamped);
      if (component.type === "container") ComponentFactory.syncContainerFlexDirection(component);
      if (session.wrapperEl) CanvasUtils.applyLayoutToWrapper(session.wrapperEl, component.layout);
      return;
    }

    if (session.mode === "move") {
      const pos = CanvasUtils.clientToCanvas(e.clientX, e.clientY, session.canvasEl);
      const cs = CanvasUtils.getCanvasSize(session.canvasEl);
      const clamped = CanvasUtils.clampToBounds(
        pos.x - session.offsetX,
        pos.y - session.offsetY,
        component.layout.width,
        component.layout.height,
        cs.width,
        cs.height
      );
      component.layout.x = clamped.x;
      component.layout.y = clamped.y;
      if (session.wrapperEl) {
        CanvasUtils.applyLayoutToWrapper(session.wrapperEl, component.layout);
        session.wrapperEl.classList.add("is-dragging");
      }
    }
  },

  onPointerUp(e) {
    const session = this.session;
    if (!session || e.pointerId !== session.pointerId) return;

    if (session.mode === "place" && session.pendingX !== undefined) {
      const target = CanvasUtils.findDropTarget(e.clientX, e.clientY) ?? session.dropTarget;
      this.placeComponent(session.type, session.pendingX, session.pendingY, target);
    }

    if (session.mode === "move" && session.component) {
      if (session.moved) {
        const target = CanvasUtils.findDropTarget(e.clientX, e.clientY);
        const ctx = StateUtils.findParentContext(session.component.id);
        if (
          target &&
          ctx &&
          target.list !== ctx.parentList &&
          session.component.type !== "container"
        ) {
          StateUtils.reparentComponent(
            session.component.id,
            target.list,
            session.component.layout.x,
            session.component.layout.y
          );
        }
      }
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
      }
    }

    if (session.mode === "resize" && session.wrapperEl) {
      try {
        session.wrapperEl.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    this.finishSession(session.moved || session.mode === "place" || session.mode === "resize");
  },

  placeComponent(type, x, y, target) {
    const page = StateUtils.getCurrentPage();
    if (!page) return;
    const component = ComponentFactory.create(type);
    const pageCanvas = document.querySelector(".page-canvas");
    const pageSize = CanvasUtils.getCanvasSize(pageCanvas);

    let list = page.components;
    let canvasEl = pageCanvas;
    if (type === "container") {
      list = page.components;
      canvasEl = pageCanvas;
    } else if (target?.kind === "container" && target.list) {
      list = target.list;
      canvasEl = target.canvasEl;
    }

    const bounds = CanvasUtils.getCanvasSize(canvasEl);
    const clamped = CanvasUtils.clampToBounds(x, y, component.layout.width, component.layout.height, bounds.width, bounds.height);
    component.layout.x = clamped.x;
    component.layout.y = clamped.y;
    component.layout.width = clamped.width;
    component.layout.height = clamped.height;
    component.layout.zIndex = StateUtils.getNextZIndexInList(list);
    list.push(component);

    AppState.selectedId = component.id;
    AppState.selectedType = "component";
  },

  finishSession(commitHistory) {
    document.body.classList.remove("canvas-dragging", "canvas-placing", "canvas-resizing");
    this.removeGhost();
    this.session = null;
    AppState.suppressCanvasClickUntil = Date.now() + 120;
    if (commitHistory) StateUtils.pushHistorySnapshot();
    Builder.refreshAll();
  },

  cancelSession() {
    document.body.classList.remove("canvas-dragging", "canvas-placing", "canvas-resizing");
    this.removeGhost();
    this.session = null;
  },

  attachNode(wrapperEl, component) {
    wrapperEl.style.pointerEvents = "auto";
    wrapperEl.addEventListener("pointerdown", (e) => {
      if (AppState.runtimeMode) return;
      if (e.button !== 0) return;
      if (e.target.closest(".resize-handle")) return;
      e.stopPropagation();
      e.preventDefault();
      this.startMoveComponent(component, wrapperEl, e);
    }, true);

    if (AppState.selectedId !== component.id || AppState.runtimeMode) return;

    for (const handle of CanvasUtils.HANDLES) {
      const handleEl = document.createElement("div");
      handleEl.className = `resize-handle resize-${handle}`;
      handleEl.dataset.handle = handle;
      handleEl.addEventListener("pointerdown", (e) => {
        this.startResize(component, wrapperEl, handle, e);
      });
      wrapperEl.appendChild(handleEl);
    }
  }
};
