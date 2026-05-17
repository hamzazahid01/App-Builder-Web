function applySpacing(el, key, spacing = {}) {
  el.style[`${key}Top`] = `${spacing.top ?? 0}px`;
  el.style[`${key}Right`] = `${spacing.right ?? 0}px`;
  el.style[`${key}Bottom`] = `${spacing.bottom ?? 0}px`;
  el.style[`${key}Left`] = `${spacing.left ?? 0}px`;
}

function selectNode(component, e) {
  if (AppState.runtimeMode) return;
  e.stopPropagation();
  AppState.selectedId = component.id;
  AppState.selectedType = "component";
  StateUtils.bringToFront(component);
  Builder.refreshAll();
}

function applyCanvasLayout(wrapper, layout) {
  wrapper.style.position = "absolute";
  CanvasUtils.applyLayoutToWrapper(wrapper, layout);
}

function wrapCanvasNode(innerEl, component) {
  const wrapper = document.createElement("div");
  wrapper.className = "canvas-node app-node";
  wrapper.dataset.componentId = component.id;
  applyCanvasLayout(wrapper, component.layout);
  innerEl.classList.add("canvas-node-inner");
  innerEl.style.width = "100%";
  innerEl.style.height = "100%";
  innerEl.style.margin = "0";
  innerEl.style.boxSizing = "border-box";
  wrapper.appendChild(innerEl);
  if (AppState.selectedId === component.id) wrapper.classList.add("selected-node");
  if (!AppState.runtimeMode) DragDrop.attachNode(wrapper, component);
  return wrapper;
}

function renderComponentsOnCanvas(components, canvasEl) {
  const fragment = document.createDocumentFragment();
  components.forEach((component, index) => {
    StateUtils.ensureComponentLayout(component, index);
    const inner = renderComponent(component);
    fragment.appendChild(wrapCanvasNode(inner, component));
  });
  canvasEl.appendChild(fragment);
}

function bindEditSelect(el, component, runtimeHandler) {
  el.addEventListener("click", (e) => {
    if (AppState.runtimeMode) {
      if (runtimeHandler) runtimeHandler(e);
      return;
    }
    if (AppState.suppressCanvasClickUntil && Date.now() < AppState.suppressCanvasClickUntil) return;
    e.stopPropagation();
    selectNode(component, e);
  });
}

function executeAction(onClickAction) {
  if (!onClickAction || !AppState.runtimeMode) return;
  if (onClickAction.type === "none") return;
  if (onClickAction.type === "navigate" && onClickAction.targetPageId) {
    StateUtils.setCurrentPage(onClickAction.targetPageId, true);
    renderPreview();
    return;
  }
  if (onClickAction.type === "openUrl" && onClickAction.url) {
    window.open(onClickAction.url, "_blank");
    return;
  }
  if (onClickAction.type === "showDialog") {
    window.alert(onClickAction.dialogText || "Dialog");
    return;
  }
  if (onClickAction.type === "back") {
    if (AppState.app.navigationStack.length > 1) {
      AppState.app.navigationStack.pop();
      const previous = AppState.app.navigationStack[AppState.app.navigationStack.length - 1];
      if (previous) {
        StateUtils.setCurrentPage(previous, false);
        renderPreview();
      }
    }
  }
}

function renderComponent(component) {
  if (component.type === "button") return renderButton(component);
  if (component.type === "text") return renderTextNode(component);
  if (component.type === "image") return renderImageNode(component);
  if (component.type === "input") return renderInputNode(component);
  if (component.type === "icon") return renderIconNode(component);
  if (component.type === "container") return renderContainerNode(component);
  const unknown = document.createElement("div");
  unknown.textContent = component.type;
  return unknown;
}

function renderButton(component) {
  ButtonStyles.ensure(component);
  const el = document.createElement("button");
  el.type = "button";
  ButtonStyles.applyToElement(el, component);
  if (!AppState.runtimeMode) {
    el.style.pointerEvents = "none";
  } else {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = component.props.action || component.props.onClick;
      executeAction(action);
    });
  }
  return el;
}

function renderTextNode(component) {
  const el = document.createElement("p");
  el.textContent = component.props.value;
  el.style.fontSize = `${component.styles.fontSize}px`;
  el.style.color = component.styles.color;
  el.style.fontWeight = component.styles.fontWeight;
  el.style.textAlign = component.styles.textAlign;
  el.style.margin = "0";
  el.style.overflow = "hidden";
  bindEditSelect(el, component);
  return el;
}

function renderImageNode(component) {
  const el = document.createElement("img");
  el.src = component.props.src;
  el.alt = "Builder image";
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.borderRadius = `${component.styles.borderRadius}px`;
  el.style.objectFit = component.styles.fit;
  el.style.margin = "0";
  el.draggable = false;
  bindEditSelect(el, component);
  return el;
}

function renderInputNode(component) {
  const el = document.createElement("input");
  el.type = component.props.inputType;
  el.placeholder = component.props.placeholder;
  el.readOnly = !AppState.runtimeMode;
  el.style.borderStyle = "solid";
  el.style.borderColor = component.styles.borderColor;
  el.style.borderWidth = `${component.styles.borderWidth}px`;
  el.style.borderRadius = `${component.styles.borderRadius}px`;
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.pointerEvents = AppState.runtimeMode ? "auto" : "none";
  el.style.boxSizing = "border-box";
  applySpacing(el, "padding", component.styles.padding);
  return el;
}

function renderIconNode(component) {
  const el = document.createElement("div");
  el.textContent = component.props.symbol;
  el.style.fontSize = `${component.styles.fontSize}px`;
  el.style.color = component.styles.color;
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.height = "100%";
  bindEditSelect(el, component);
  return el;
}

function getAlignItemsValue(value) {
  if (value === "center") return "center";
  if (value === "end") return "flex-end";
  if (value === "stretch") return "stretch";
  return "flex-start";
}

function getJustifyContentValue(value) {
  if (value === "center") return "center";
  if (value === "space-between") return "space-between";
  if (value === "space-around") return "space-around";
  return "flex-start";
}

function renderContainerNode(component) {
  ComponentFactory.syncContainerFlexDirection(component);

  const el = document.createElement("div");
  el.className = "container-shell";
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.boxSizing = "border-box";
  el.style.backgroundColor = component.styles.backgroundColor ?? "#f8fafc";
  el.style.border = `${component.styles.borderWidth ?? 0}px solid ${component.styles.borderColor ?? "#d1d5db"}`;
  el.style.borderRadius = `${component.styles.borderRadius ?? 10}px`;
  el.style.opacity = `${component.styles.opacity ?? 1}`;
  el.style.display = "flex";
  el.style.flexDirection = "column";
  el.style.overflow = "visible";

  const label = document.createElement("div");
  label.className = "container-layout-badge";
  label.textContent = component.styles.flexDirection === "row" ? "Row" : "Column";
  el.appendChild(label);

  const innerCanvas = document.createElement("div");
  innerCanvas.className = "container-canvas";
  innerCanvas.dataset.containerId = component.id;
  innerCanvas.style.position = "relative";
  innerCanvas.style.flex = "1";
  innerCanvas.style.width = "100%";
  innerCanvas.style.minHeight = "100%";
  innerCanvas.style.height = "100%";
  innerCanvas.style.overflow = "visible";
  innerCanvas.style.pointerEvents = "auto";
  applySpacing(innerCanvas, "padding", component.styles.padding);

  if (!AppState.runtimeMode && (!component.children || component.children.length === 0)) {
    const hint = document.createElement("div");
    hint.className = "container-hint";
    hint.textContent = "Yahan components drop karein";
    innerCanvas.appendChild(hint);
  } else if (component.children?.length) {
    renderComponentsOnCanvas(component.children, innerCanvas);
  }

  el.appendChild(innerCanvas);

  innerCanvas.addEventListener("pointerdown", (e) => {
    if (AppState.runtimeMode) return;
    if (e.target.closest(".canvas-node")) return;
    e.stopPropagation();
    selectNode(component, e);
  });

  el.addEventListener("click", (e) => {
    if (AppState.runtimeMode) return;
    if (AppState.suppressCanvasClickUntil && Date.now() < AppState.suppressCanvasClickUntil) return;
    if (e.target.closest(".canvas-node")) return;
    e.stopPropagation();
    selectNode(component, e);
  });

  return el;
}

function renderSplashScreen(preview) {
  const splash = AppState.app.splashScreen;
  preview.innerHTML = "";
  const screen = document.createElement("div");
  screen.className = "splash-screen";
  screen.style.backgroundColor = splash.backgroundColor;

  const logo = document.createElement("img");
  logo.className = "splash-logo";
  logo.src = splash.logoImage;
  logo.alt = "Splash Logo";
  const title = document.createElement("h1");
  title.className = "splash-title";
  title.textContent = splash.titleText;

  screen.appendChild(logo);
  screen.appendChild(title);
  preview.appendChild(screen);
}

function renderPage(preview, page) {
  preview.innerHTML = "";
  preview.style.backgroundColor = page.backgroundColor;

  const root = document.createElement("div");
  root.className = "page-root";
  root.style.backgroundColor = page.backgroundColor;
  root.style.minHeight = "100%";
  applySpacing(root, "padding", page.layout.padding);
  if (page.layout.safeArea) {
    root.style.paddingTop = `${(page.layout.padding.top ?? 0) + 20}px`;
    root.style.paddingBottom = `${(page.layout.padding.bottom ?? 0) + 14}px`;
  }
  root.style.display = "flex";
  root.style.flexDirection = "column";
  root.style.overflow = "hidden";

  if (AppState.runtimeMode && page.appBar.enabled) {
    const appBar = document.createElement("div");
    appBar.className = "page-appbar";
    appBar.style.backgroundColor = page.appBar.backgroundColor;
    appBar.style.color = page.appBar.textColor;
    appBar.textContent = page.appBar.title || page.name;
    root.appendChild(appBar);
  }

  StateUtils.ensurePageCanvasLayout(page);

  const frame = AppState.deviceMap[AppState.currentDeviceKey] || { width: 390, height: 844 };
  const canvasH = Math.max(400, frame.height - (AppState.runtimeMode && page.appBar.enabled ? 56 : 24));

  const body = document.createElement("div");
  body.className = "page-body page-canvas";
  body.style.position = "relative";
  body.style.flex = "1";
  body.style.width = "100%";
  body.style.minHeight = `${canvasH}px`;
  body.style.height = `${canvasH}px`;

  if (!AppState.runtimeMode && page.components.length === 0) {
    const hint = document.createElement("div");
    hint.className = "canvas-hint";
    hint.textContent = "Library se component chunein aur screen par kahin bhi rakhein";
    body.appendChild(hint);
  } else {
    renderComponentsOnCanvas(page.components, body);
  }

  root.appendChild(body);
  preview.appendChild(root);
}

window.renderPreview = function renderPreview() {
  const preview = document.getElementById("mobile-preview");
  const page = StateUtils.getCurrentPage();
  if (!page) {
    preview.innerHTML = "<div class='empty-state'>No pages available.</div>";
    return;
  }

  if (AppState.runtimeMode && AppState.runtimeScreen === "splash" && AppState.app.splashScreen.enabled) {
    renderSplashScreen(preview);
    return;
  }

  renderPage(preview, page);
  updateScreenLabel();
};

window.applyDeviceFrame = function applyDeviceFrame(deviceKey) {
  AppState.currentDeviceKey = deviceKey;
  const frame = AppState.deviceMap[deviceKey];
  const preview = document.getElementById("mobile-preview");
  preview.style.width = `${frame.width}px`;
  preview.style.height = `${frame.height}px`;
  renderPreview();
};

window.updateScreenLabel = function updateScreenLabel() {
  const page = StateUtils.getCurrentPage();
  const el = document.getElementById("screen-label");
  if (el && page) el.textContent = page.name || "Screen";
};

window.RuntimeEngine = {
  start() {
    AppState.runtimeMode = true;
    AppState.runtimeScreen = AppState.app.splashScreen.enabled ? "splash" : "page";
    AppState.app.navigationStack = [];
    AppState.selectedId = null;
    AppState.selectedType = "none";
    Builder.refreshAll();

    if (AppState.app.splashScreen.enabled) {
      if (AppState.runtimeSplashTimer) clearTimeout(AppState.runtimeSplashTimer);
      const duration = Number(AppState.app.splashScreen.duration || 2) * 1000;
      AppState.runtimeSplashTimer = setTimeout(() => {
        AppState.runtimeScreen = "page";
        StateUtils.setCurrentPage(AppState.app.splashScreen.nextScreenId || AppState.app.initialPageId, true);
        renderPreview();
      }, duration);
    } else {
      StateUtils.setCurrentPage(AppState.app.initialPageId, true);
      renderPreview();
    }
  },

  stop() {
    AppState.runtimeMode = false;
    AppState.runtimeScreen = "page";
    if (AppState.runtimeSplashTimer) clearTimeout(AppState.runtimeSplashTimer);
    AppState.runtimeSplashTimer = null;
    Builder.refreshAll();
  }
};
