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
  Inspector.render();
  renderPreview();
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

function addDnDBehavior(nodeEl, component) {
  if (AppState.runtimeMode) return;
  nodeEl.classList.add("app-node");
  nodeEl.dataset.componentId = component.id;
  nodeEl.draggable = true;

  nodeEl.addEventListener("dragstart", (e) => {
    AppState.draggedNodeId = component.id;
    e.dataTransfer.setData("text/plain", JSON.stringify({ source: "node", id: component.id }));
  });

  if (!ComponentFactory.supportsChildren(component.type)) return;

  nodeEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    nodeEl.classList.add("dropzone-active");
  });

  nodeEl.addEventListener("dragleave", () => nodeEl.classList.remove("dropzone-active"));
  nodeEl.addEventListener("drop", (e) => {
    e.preventDefault();
    nodeEl.classList.remove("dropzone-active");
    DragDrop.handleDrop(component.id, e.dataTransfer.getData("text/plain"));
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
  applySpacing(el, "margin", component.styles.margin);
  if (AppState.selectedId === component.id) el.classList.add("selected-node");
  el.addEventListener("click", (e) => {
    if (AppState.runtimeMode) {
      e.stopPropagation();
      executeAction(component.props.onClick);
      return;
    }
    selectNode(component, e);
  });
  addDnDBehavior(el, component);
  return el;
}

function renderTextNode(component) {
  const el = document.createElement("p");
  el.textContent = component.props.value;
  el.style.fontSize = `${component.styles.fontSize}px`;
  el.style.color = component.styles.color;
  el.style.fontWeight = component.styles.fontWeight;
  el.style.textAlign = component.styles.textAlign;
  applySpacing(el, "margin", component.styles.margin);
  if (AppState.selectedId === component.id) el.classList.add("selected-node");
  el.addEventListener("click", (e) => selectNode(component, e));
  addDnDBehavior(el, component);
  return el;
}

function renderImageNode(component) {
  const el = document.createElement("img");
  el.src = component.props.src;
  el.alt = "Builder image";
  el.style.width = component.styles.width;
  el.style.height = `${component.styles.height}px`;
  el.style.borderRadius = `${component.styles.borderRadius}px`;
  el.style.objectFit = component.styles.fit;
  applySpacing(el, "margin", component.styles.margin);
  if (AppState.selectedId === component.id) el.classList.add("selected-node");
  el.addEventListener("click", (e) => selectNode(component, e));
  addDnDBehavior(el, component);
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
  applySpacing(el, "padding", component.styles.padding);
  applySpacing(el, "margin", component.styles.margin);
  if (AppState.selectedId === component.id) el.classList.add("selected-node");
  el.addEventListener("click", (e) => selectNode(component, e));
  addDnDBehavior(el, component);
  return el;
}

function renderIconNode(component) {
  const el = document.createElement("div");
  el.textContent = component.props.symbol;
  el.style.fontSize = `${component.styles.fontSize}px`;
  el.style.color = component.styles.color;
  applySpacing(el, "margin", component.styles.margin);
  if (AppState.selectedId === component.id) el.classList.add("selected-node");
  el.addEventListener("click", (e) => selectNode(component, e));
  addDnDBehavior(el, component);
  return el;
}

function renderSpacerNode(component) {
  const el = document.createElement("div");
  el.style.height = `${component.styles.height}px`;
  el.style.width = "100%";
  applySpacing(el, "margin", component.styles.margin);
  if (AppState.selectedId === component.id) el.classList.add("selected-node");
  el.addEventListener("click", (e) => selectNode(component, e));
  addDnDBehavior(el, component);
  return el;
}

function renderFlexContainerNode(component) {
  const el = document.createElement("div");
  el.style.width = component.styles.width ?? "100%";
  el.style.height = component.styles.height === "auto" ? "auto" : `${component.styles.height ?? 0}px`;
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
  applySpacing(el, "margin", component.styles.margin);

  for (const child of component.children) {
    el.appendChild(renderComponent(child));
  }

  if (AppState.selectedId === component.id) el.classList.add("selected-node");
  el.addEventListener("click", (e) => selectNode(component, e));
  addDnDBehavior(el, component);
  return el;
}

function renderStackNode(component) {
  const el = document.createElement("div");
  el.style.position = "relative";
  el.style.width = component.styles.width ?? "100%";
  el.style.height = `${component.styles.height ?? 180}px`;
  el.style.backgroundColor = component.styles.backgroundColor ?? "#f1f5f9";
  el.style.borderRadius = `${component.styles.borderRadius ?? 10}px`;
  applySpacing(el, "margin", component.styles.margin);
  for (const child of component.children) {
    const childEl = renderComponent(child);
    childEl.style.position = "absolute";
    childEl.style.left = "0";
    childEl.style.top = "0";
    el.appendChild(childEl);
  }
  if (AppState.selectedId === component.id) el.classList.add("selected-node");
  el.addEventListener("click", (e) => selectNode(component, e));
  addDnDBehavior(el, component);
  return el;
}

function renderCenterNode(component) {
  const el = document.createElement("div");
  el.style.width = component.styles.width ?? "100%";
  el.style.minHeight = `${component.styles.minHeight ?? 120}px`;
  el.style.backgroundColor = component.styles.backgroundColor ?? "#ffffff";
  el.style.border = `${component.styles.borderWidth ?? 0}px solid ${component.styles.borderColor ?? "transparent"}`;
  el.style.borderRadius = `${component.styles.borderRadius ?? 0}px`;
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  applySpacing(el, "margin", component.styles.margin);
  for (const child of component.children) {
    el.appendChild(renderComponent(child));
  }
  if (AppState.selectedId === component.id) el.classList.add("selected-node");
  el.addEventListener("click", (e) => selectNode(component, e));
  addDnDBehavior(el, component);
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

  const body = document.createElement("div");
  body.className = "page-body";
  body.style.display = "flex";
  body.style.flexDirection = "column";
  body.style.width = "100%";
  body.style.gap = "8px";

  for (const component of page.components) {
    body.appendChild(renderComponent(component));
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
