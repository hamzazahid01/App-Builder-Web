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
  Inspector.render();
  renderPreview();
}

function applyCanvasLayout(wrapper, layout) {
  wrapper.style.position = "absolute";
  wrapper.style.left = `${layout.x}px`;
  wrapper.style.top = `${layout.y}px`;
  wrapper.style.width = `${layout.width}px`;
  wrapper.style.height = `${layout.height}px`;
  wrapper.style.zIndex = `${layout.zIndex ?? 1}`;
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

function getCurrentComponentTree() {
  const page = StateUtils.getCurrentPage();
  return page ? page.components : [];
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

function executeAction(onClickAction) {
  if (!onClickAction || !AppState.runtimeMode) return;
  if (onClickAction.type === "navigate" &&  onClickAction.targetPageId) {
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

function renderComponent(component) {
  if (component.type === "button") return renderButton(component);
  if (component.type === "text") return renderTextNode(component);
  if (component.type === "image") return renderImageNode(component);
  if (component.type === "input") return renderInputNode(component);
  if (component.type === "icon") return renderIconNode(component);
  if (component.type === "spacer") return renderSpacerNode(component);
  if (component.type === "stack") return renderStackNode(component);
  if (component.type === "center") return renderCenterNode(component);
  return renderFlexContainerNode(component);
}

function renderButton(component) {
  const el = document.createElement("button");
  el.textContent = component.props.text;
  el.style.backgroundColor = component.styles.backgroundColor;
  el.style.color = component.styles.textColor;
  el.style.border = "none";
  el.style.borderRadius = `${component.styles.borderRadius}px`;
  el.style.fontSize = `${component.styles.fontSize}px`;
  el.style.fontWeight = component.styles.fontWeight;
  el.style.opacity = `${component.styles.opacity}`;
  el.style.cursor = "pointer";
  applySpacing(el, "padding", component.styles.padding);
  el.style.width = "100%";
  el.style.height = "100%";
  bindEditSelect(el, component, (e) => {
    e.stopPropagation();
    executeAction(component.props.onClick);
  });
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
  bindEditSelect(el, component);
  return el;
}

function renderInputNode(component) {
  const el = document.createElement("input");
  el.type = component.props.inputType;
  el.placeholder = component.props.placeholder;
  el.style.borderStyle = "solid";
  el.style.borderColor = component.styles.borderColor;
  el.style.borderWidth = `${component.styles.borderWidth}px`;
  el.style.borderRadius = `${component.styles.borderRadius}px`;
  el.style.width = "100%";
  el.style.height = "100%";
  applySpacing(el, "padding", component.styles.padding);
  bindEditSelect(el, component);
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

function renderSpacerNode(component) {
  const el = document.createElement("div");
  el.style.height = "100%";
  el.style.width = "100%";
  el.style.backgroundColor = "rgba(148, 163, 184, 0.25)";
  bindEditSelect(el, component);
  return el;
}

function renderFlexContainerNode(component) {
  const el = document.createElement("div");
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.minHeight = "0";
  el.style.backgroundColor = component.styles.backgroundColor ?? "transparent";
  el.style.border = `${component.styles.borderWidth ?? 0}px solid ${component.styles.borderColor ?? "transparent"}`;
  el.style.borderRadius = `${component.styles.borderRadius ?? 0}px`;
  el.style.opacity = `${component.styles.opacity ?? 1}`;
  el.style.display = "flex";
  el.style.flexDirection = component.styles.flexDirection ?? "column";
  el.style.alignItems = getAlignItemsValue(component.styles.alignItems);
  el.style.justifyContent = getJustifyContentValue(component.styles.justifyContent);
  el.style.gap = `${component.styles.gap ?? 0}px`;
  if (component.styles.boxShadow) el.style.boxShadow = component.styles.boxShadow;
  applySpacing(el, "padding", component.styles.padding);
  el.style.overflow = "auto";

  for (const child of component.children) {
    el.appendChild(renderComponent(child));
  }

  bindEditSelect(el, component);
  return el;
}

function renderStackNode(component) {
  const el = document.createElement("div");
  el.style.position = "relative";
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.backgroundColor = component.styles.backgroundColor ?? "#f1f5f9";
  el.style.borderRadius = `${component.styles.borderRadius ?? 10}px`;
  for (const child of component.children) {
    const childEl = renderComponent(child);
    childEl.style.position = "absolute";
    childEl.style.left = "0";
    childEl.style.top = "0";
    el.appendChild(childEl);
  }
  bindEditSelect(el, component);
  return el;
}

function renderCenterNode(component) {
  const el = document.createElement("div");
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.minHeight = "0";
  el.style.backgroundColor = component.styles.backgroundColor ?? "#ffffff";
  el.style.border = `${component.styles.borderWidth ?? 0}px solid ${component.styles.borderColor ?? "transparent"}`;
  el.style.borderRadius = `${component.styles.borderRadius ?? 0}px`;
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  for (const child of component.children) {
    el.appendChild(renderComponent(child));
  }
  bindEditSelect(el, component);
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
  root.style.alignItems = page.layout.alignment === "center" ? "center" : page.layout.alignment === "stretch" ? "stretch" : "flex-start";
  root.style.justifyContent = page.layout.alignment === "bottom" ? "flex-end" : "flex-start";
  root.style.overflowY = page.layout.scrollBehavior === "fixed" ? "hidden" : "auto";

  if (page.appBar.enabled) {
    const appBar = document.createElement("div");
    appBar.className = "page-appbar";
    appBar.style.backgroundColor = page.appBar.backgroundColor;
    appBar.style.color = page.appBar.textColor;
    appBar.textContent = page.appBar.title || page.name;
    root.appendChild(appBar);
  }

  StateUtils.ensurePageCanvasLayout(page);

  const body = document.createElement("div");
  body.className = "page-body page-canvas";
  body.style.position = "relative";
  body.style.flex = "1";
  body.style.width = "100%";
  body.style.minHeight = "480px";

  if (!AppState.runtimeMode && page.components.length === 0) {
    const hint = document.createElement("div");
    hint.className = "canvas-hint";
    hint.textContent = "Library se component chunein aur screen par kahin bhi rakhein";
    body.appendChild(hint);
  }

  for (const component of page.components) {
    const inner = renderComponent(component);
    body.appendChild(wrapCanvasNode(inner, component));
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
};

window.applyDeviceFrame = function applyDeviceFrame(deviceKey) {
  const frame = AppState.deviceMap[deviceKey];
  const preview = document.getElementById("mobile-preview");
  preview.style.width = `${frame.width}px`;
  preview.style.height = `${frame.height}px`;
};

window.RuntimeEngine = {
  start() {
    AppState.runtimeMode = true;
    AppState.runtimeScreen = AppState.app.splashScreen.enabled ? "splash" : "page";
    AppState.app.navigationStack = [];
    AppState.selectedId = null;
    AppState.selectedType = "none";
    Inspector.render();
    renderPreview();

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
    renderPreview();
    Inspector.render();
  }
};
