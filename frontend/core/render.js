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
  
  // Add double-click support for nested components
  wrapper.addEventListener("dblclick", (e) => {
    if (AppState.runtimeMode) return;
    e.stopPropagation();
    AppState.selectedId = component.id;
    AppState.selectedType = "component";
    StateUtils.bringToFront(component);
    Builder.refreshAll();
  });
  
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
  const componentModule = window.ComponentRegistry?.[component.type];
  if (componentModule?.render) return componentModule.render(component);

  const unknown = document.createElement("div");
  unknown.textContent = component.type;
  return unknown;
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

function buildBoxShadowString(shadow) {
  if (!shadow || !shadow.enabled) return "none";
  
  const shadows = [];
  
  const insetStr = shadow.insetEnabled ? "inset " : "";
  const mainShadow = `${insetStr}${shadow.offsetX ?? 0}px ${shadow.offsetY ?? 4}px ${shadow.blur ?? 8}px ${shadow.spread ?? 0}px rgba(0, 0, 0, ${(shadow.opacity ?? 0.25).toFixed(2)})`;
  shadows.push(mainShadow);
  
  if (shadow.multiShadows?.length > 0) {
    shadow.multiShadows.forEach(s => {
      if (s.enabled !== false) {
        const shadowStr = `${s.offsetX ?? 0}px ${s.offsetY ?? 0}px ${s.blur ?? 0}px ${s.spread ?? 0}px rgba(0, 0, 0, ${(s.opacity ?? 0.25).toFixed(2)})`;
        shadows.push(shadowStr);
      }
    });
  }
  
  if (shadow.glowEnabled) {
    const glowColor = shadow.glowColor ?? "#ffffff";
    const glowShadow = `0 0 ${shadow.glowBlur ?? 10}px ${shadow.glowSpread ?? 0}px ${glowColor}`;
    shadows.push(glowShadow);
  }
  
  return shadows.join(", ") || "none";
}

function buildImageFilterString(filters) {
  if (!filters) return "";
  const parts = [];
  if (filters.brightness != null) parts.push(`brightness(${filters.brightness})`);
  if (filters.contrast != null) parts.push(`contrast(${filters.contrast})`);
  if (filters.saturation != null) parts.push(`saturate(${filters.saturation})`);
  if (filters.blur != null && filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.grayscale != null && filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale})`);
  if (filters.sepia != null && filters.sepia > 0) parts.push(`sepia(${filters.sepia})`);
  if (filters.hueRotate != null && filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  return parts.join(" ");
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

function hexToRgba(hex, alpha = 1) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function blendColors(hex1, hex2, opacity) {
  // Remove # if present
  hex1 = hex1.replace('#', '');
  hex2 = hex2.replace('#', '');
  
  // Parse hex values
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  // Blend colors based on opacity
  const r = Math.round(r1 * opacity + r2 * (1 - opacity));
  const g = Math.round(g1 * opacity + g2 * (1 - opacity));
  const b = Math.round(b1 * opacity + b2 * (1 - opacity));
  
  return `rgb(${r}, ${g}, ${b})`;
}

function renderPage(preview, page) {
  preview.innerHTML = "";
  preview.style.backgroundColor = "";
  
  // Add scroll-enabled class to preview when scroll is enabled
  if (page.scroll !== false) {
    preview.classList.add('scroll-enabled');
  } else {
    preview.classList.remove('scroll-enabled');
  }
  
  // Add scroll-enabled class to preview-frame-wrap when scroll is enabled
  const frameWrap = preview.closest('.preview-frame-wrap');
  if (frameWrap) {
    if (page.scroll !== false) {
      frameWrap.classList.add('scroll-enabled');
    } else {
      frameWrap.classList.remove('scroll-enabled');
    }
  }
  
  // Don't set height on preview when manual height is set - let screen determine height

  const frame = AppState.deviceMap[AppState.currentDeviceKey] || { width: 390, height: 844 };
  const screen = document.createElement("div");
  screen.className = "device-screen";
  
  // Add scroll-enabled class when scroll is enabled
  if (page.scroll !== false) {
    screen.classList.add('scroll-enabled');
  }
  
  // Add runtime-mode-scroll class to hide scrollbar in runtime mode
  if (AppState.runtimeMode) {
    screen.classList.add('runtime-mode-scroll');
  }
  
  screen.style.width = `${frame.width}px`;
  screen.style.maxWidth = "100%";
  
  // Set screen height based on scroll and manual height settings
  if (page.scroll !== false) {
    // When scroll is enabled, use fixed height from device frame
    screen.style.height = `${frame.height}px`;
    screen.style.aspectRatio = "none";
  } else {
    // When scroll is disabled, use aspect ratio to constrain height
    screen.style.height = "auto";
    screen.style.aspectRatio = `${frame.width}/${frame.height}`;
  }
  
  // Set screen background to fade-to color
  const fadeColor = page.backgroundFadeColor || "#ffffff";
  screen.style.backgroundColor = fadeColor;

  const root = document.createElement("div");
  root.className = "page-root";
  root.style.position = "relative";
  root.style.height = "100%";
  root.style.minHeight = "0";
  
  // Set root background to fade-to color so it shows through when background layer is transparent
  root.style.backgroundColor = fadeColor;
  
  // Create background layer
  const backgroundLayer = document.createElement("div");
  backgroundLayer.className = "page-background-layer";
  backgroundLayer.style.position = "absolute";
  backgroundLayer.style.top = "0";
  backgroundLayer.style.left = "0";
  backgroundLayer.style.right = "0";
  backgroundLayer.style.bottom = "0";
  backgroundLayer.style.zIndex = "0";
  
  // Handle background type
  const bgType = page.backgroundType || "solid";
  const opacity = page.backgroundOpacity !== undefined ? page.backgroundOpacity : 1;
  
  if (bgType === "solid") {
    // Simple approach: background color with opacity
    const r = parseInt(page.backgroundColor.substring(1, 3), 16);
    const g = parseInt(page.backgroundColor.substring(3, 5), 16);
    const b = parseInt(page.backgroundColor.substring(5, 7), 16);
    backgroundLayer.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else if (bgType === "gradient") {
    const direction = page.gradientDirection || "horizontal";
    let gradientDirection = "to right";
    if (direction === "vertical") gradientDirection = "to bottom";
    else if (direction === "diagonal") gradientDirection = "to bottom right";
    
    const r1 = parseInt((page.gradientStart || "#2563eb").substring(1, 3), 16);
    const g1 = parseInt((page.gradientStart || "#2563eb").substring(3, 5), 16);
    const b1 = parseInt((page.gradientStart || "#2563eb").substring(5, 7), 16);
    
    const r2 = parseInt((page.gradientEnd || "#7c3aed").substring(1, 3), 16);
    const g2 = parseInt((page.gradientEnd || "#7c3aed").substring(3, 5), 16);
    const b2 = parseInt((page.gradientEnd || "#7c3aed").substring(5, 7), 16);
    
    backgroundLayer.style.background = `linear-gradient(${gradientDirection}, rgba(${r1}, ${g1}, ${b1}, ${opacity}), rgba(${r2}, ${g2}, ${b2}, ${opacity}))`;
  } else if (bgType === "image" && page.backgroundImage) {
    backgroundLayer.style.backgroundImage = `url(${page.backgroundImage})`;
    
    // Handle background fit options
    const fit = page.backgroundFit || "cover";
    if (fit === "contain") {
      backgroundLayer.style.backgroundSize = "contain";
      backgroundLayer.style.backgroundPosition = "center";
    } else if (fit === "cover") {
      backgroundLayer.style.backgroundSize = "cover";
      backgroundLayer.style.backgroundPosition = "center";
    } else if (fit === "fill") {
      backgroundLayer.style.backgroundSize = "100% 100%";
      backgroundLayer.style.backgroundPosition = "center";
    } else if (fit === "auto") {
      backgroundLayer.style.backgroundSize = "auto";
      backgroundLayer.style.backgroundPosition = "center";
    }
    
    backgroundLayer.style.backgroundRepeat = "no-repeat";
    backgroundLayer.style.opacity = opacity;
    if (page.backgroundBlur) {
      backgroundLayer.style.filter = `blur(${page.backgroundBlur}px)`;
    }
  } else {
    const r = parseInt(page.backgroundColor.substring(1, 3), 16);
    const g = parseInt(page.backgroundColor.substring(3, 5), 16);
    const b = parseInt(page.backgroundColor.substring(5, 7), 16);
    backgroundLayer.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  root.appendChild(backgroundLayer);
  
  // Create content layer
  const contentLayer = document.createElement("div");
  contentLayer.className = "page-content-layer";
  contentLayer.style.position = "relative";
  contentLayer.style.zIndex = "1";
  
  // Handle scroll - set height based on scroll setting
  if (page.scroll !== false) {
    // When scroll is enabled, don't constrain height to allow content to grow
    contentLayer.style.height = "auto";
    contentLayer.style.minHeight = "100%";
    
    // If manual height is set in preview mode, use it on contentLayer
    if (!AppState.runtimeMode && page.scrollManualHeight) {
      contentLayer.style.height = `${page.scrollManualHeight}px`;
      contentLayer.style.minHeight = "auto";
    }
  } else {
    // When scroll is disabled, constrain height to fit within container
    contentLayer.style.height = "100%";
    contentLayer.style.minHeight = "0";
  }
  
  applySpacing(contentLayer, "padding", page.layout.padding);
  
  // Handle safe area padding
  if (page.safeAreaPadding !== false) {
    contentLayer.style.paddingTop = `${(page.layout.padding.top ?? 0) + 20}px`;
    contentLayer.style.paddingBottom = `${(page.layout.padding.bottom ?? 0) + 14}px`;
  }
  
  contentLayer.style.display = "flex";
  contentLayer.style.flexDirection = "column";
  
  // Handle scroll
  if (page.scroll !== false) {
    contentLayer.style.overflow = "auto";
  } else {
    contentLayer.style.overflow = "hidden";
  }

  // Do not render the in-app appBar inside the mobile preview to keep
  // the preview clean. The appBar was previously shown when
  // `AppState.runtimeMode && page.appBar.enabled` was true.

  StateUtils.ensurePageCanvasLayout(page);

  const body = document.createElement("div");
  body.className = "page-body page-canvas";
  body.style.position = "relative";
  body.style.flex = "1";
  body.style.width = "100%";
  
  // Handle scroll - set height based on scroll setting
  if (page.scroll !== false) {
    // When scroll is enabled, don't constrain height to allow content to grow
    body.style.height = "auto";
    body.style.minHeight = "100%";
    
    // If manual height is set in preview mode, use it and clear minHeight
    if (!AppState.runtimeMode && page.scrollManualHeight) {
      body.style.height = `${page.scrollManualHeight}px`;
      body.style.minHeight = "auto";
    }
  } else {
    // When scroll is disabled, constrain height to fit within container
    body.style.height = "100%";
    body.style.minHeight = "0";
  }

  if (!AppState.runtimeMode && page.components.length === 0) {
    const hint = document.createElement("div");
    hint.className = "canvas-hint";
    hint.textContent = "Library se component chunein aur screen par kahin bhi rakhein";
    body.appendChild(hint);
  } else {
    renderComponentsOnCanvas(page.components, body);
  }

  contentLayer.appendChild(body);
  root.appendChild(contentLayer);
  screen.appendChild(root);
  preview.appendChild(screen);
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
  const preview = document.getElementById("mobile-preview");
  if (!preview) return;
  preview.dataset.device = deviceKey;
  renderPreview();
};

window.updateScreenLabel = function updateScreenLabel() {
  const page = StateUtils.getCurrentPage();
  const el = document.getElementById("screen-label");
  if (!el || !page) return;
  // Hide the page name when runtime preview is active (mobile preview clean view)
  if (AppState.runtimeMode) {
    el.textContent = "";
    return;
  }
  el.textContent = page.name || "Screen";
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
