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
  TextStyles.ensure(component);

  const wrapper = document.createElement("div");
  wrapper.className = "text-element-wrapper";
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.justifyContent = component.styles.verticalAlign === "center" ? "center" : component.styles.verticalAlign === "bottom" ? "flex-end" : "flex-start";
  wrapper.style.alignItems = "stretch";
  wrapper.style.marginTop = `${component.styles.margin?.top ?? 0}px`;
  wrapper.style.marginRight = `${component.styles.margin?.right ?? 0}px`;
  wrapper.style.marginBottom = `${component.styles.margin?.bottom ?? 0}px`;
  wrapper.style.marginLeft = `${component.styles.margin?.left ?? 0}px`;
  wrapper.style.overflow = component.styles.overflow === "scroll" ? "auto" : "visible";

  const backgroundWrapper = document.createElement("div");
  backgroundWrapper.className = "text-background-wrapper";
  backgroundWrapper.style.width = "100%";
  backgroundWrapper.style.height = "100%";
  backgroundWrapper.style.boxSizing = "border-box";
  backgroundWrapper.style.display = "flex";
  backgroundWrapper.style.alignItems = component.styles.verticalAlign === "center" ? "center" : component.styles.verticalAlign === "bottom" ? "flex-end" : "flex-start";
  backgroundWrapper.style.justifyContent = component.styles.textAlign === "center" ? "center" : component.styles.textAlign === "right" ? "flex-end" : "flex-start";
  backgroundWrapper.style.transition = "transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease";

  TextStyles.applyTextBackground(backgroundWrapper, component.styles.textBackground);

  const el = document.createElement("div");
  el.className = "text-element";
  el.style.minHeight = "1em";
  el.style.outline = "none";
  el.style.cursor = component.styles.interaction?.clickable ? "pointer" : "text";
  TextStyles.applyToElement(el, component);

  el.contentEditable = "true";
  el.spellcheck = false;
  el.addEventListener("input", () => {
    component.props.value = el.innerText;
    renderPreview();
  });
  el.addEventListener("blur", () => {
    component.props.value = el.innerText;
  });

  backgroundWrapper.appendChild(el);
  wrapper.appendChild(backgroundWrapper);

  const runtimeHandler = (e) => {
    if (!AppState.runtimeMode) return;
    if (document.activeElement === el) return;
    if (component.styles.interaction?.copyable && !component.styles.interaction?.clickable) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(component.props.value || "");
      }
    }
    if (component.styles.interaction?.clickable && component.styles.interaction?.href) {
      window.open(component.styles.interaction.href, "_blank");
    }
  };

  if (component.styles.interaction?.hoverEffect && component.styles.interaction.hoverEffect !== "none") {
    const originalTransform = backgroundWrapper.style.transform || "";
    const originalFilter = backgroundWrapper.style.filter || "";
    backgroundWrapper.addEventListener("mouseenter", () => {
      if (component.styles.interaction.hoverEffect === "underline") {
        el.style.textDecoration = `${TextStyles.computeTextDecorationCss(component.styles.textDecoration)} underline`;
      }
      if (component.styles.interaction.hoverEffect === "scale") {
        backgroundWrapper.style.transform = `${originalTransform} scale(1.03)`;
      }
      if (component.styles.interaction.hoverEffect === "color") {
        el.style.filter = "brightness(1.2)";
      }
    });
    backgroundWrapper.addEventListener("mouseleave", () => {
      el.style.textDecoration = TextStyles.computeTextDecorationCss(component.styles.textDecoration);
      backgroundWrapper.style.transform = originalTransform;
      backgroundWrapper.style.filter = originalFilter;
    });
  }

  if (component.styles.rotation) {
    wrapper.style.transform = `rotate(${component.styles.rotation}deg)`;
  }

  TextStyles.applyAnimation(wrapper, component.styles.animation);

  bindEditSelect(wrapper, component, runtimeHandler);
  return wrapper;
}

function renderImageNode(component) {
  const s = component.styles;
  const wrapper = document.createElement("div");
  wrapper.className = "image-element-wrapper";
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";
  wrapper.style.position = "relative";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.overflow = s.crop?.enabled ? "hidden" : "visible";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = s.align === "center" ? "center" : s.align === "right" ? "flex-end" : "flex-start";
  wrapper.style.justifyContent = s.align === "center" ? "center" : "flex-start";
  wrapper.style.backgroundColor = s.background.enabled && s.background.type === "solid" ? s.background.color : "transparent";
  if (s.background.enabled && s.background.type === "gradient") {
    wrapper.style.backgroundImage = `linear-gradient(${s.background.gradientAngle ?? 90}deg, ${s.background.gradientStart}, ${s.background.gradientEnd})`;
  } else {
    wrapper.style.backgroundImage = "none";
  }
  wrapper.style.borderRadius = s.displayType === "circle" ? "50%" : `${s.borderRadiusCorners?.tl ?? s.borderRadius}px ${s.borderRadiusCorners?.tr ?? s.borderRadius}px ${s.borderRadiusCorners?.br ?? s.borderRadius}px ${s.borderRadiusCorners?.bl ?? s.borderRadius}px`;
  wrapper.style.borderWidth = s.borderEnabled ? `${s.borderWidth}px` : "0px";
  wrapper.style.borderStyle = s.borderEnabled ? s.borderStyle : "none";
  wrapper.style.borderColor = s.borderColor;
  wrapper.style.boxShadow = buildBoxShadowString(s.shadow);
  wrapper.style.opacity = s.opacity ?? 1;
  wrapper.style.marginTop = `${s.margin?.top ?? 0}px`;
  wrapper.style.marginRight = `${s.margin?.right ?? 0}px`;
  wrapper.style.marginBottom = `${s.margin?.bottom ?? 0}px`;
  wrapper.style.marginLeft = `${s.margin?.left ?? 0}px`;
  wrapper.style.paddingTop = `${s.padding?.top ?? 0}px`;
  wrapper.style.paddingRight = `${s.padding?.right ?? 0}px`;
  wrapper.style.paddingBottom = `${s.padding?.bottom ?? 0}px`;
  wrapper.style.paddingLeft = `${s.padding?.left ?? 0}px`;
  wrapper.style.transform = s.rotation ? `rotate(${s.rotation}deg)` : "";

  const image = document.createElement("img");
  image.src = component.props.src || component.props.srcUrl || s.placeholderSrc;
  image.alt = component.props.alt || "Image";
  image.loading = s.lazyLoad ? "lazy" : "eager";
  image.style.width = "100%";
  image.style.height = "100%";
  image.style.objectFit = s.fit || "cover";
  image.style.objectPosition = `${50 + (s.crop?.x ?? 0)}% ${50 + (s.crop?.y ?? 0)}%`;
  image.style.filter = buildImageFilterString(s.filters);
  image.style.transform = `${s.crop?.rotation ? `rotate(${s.crop.rotation}deg) ` : ""}scaleX(${s.flipHorizontal ? -1 : 1}) scaleY(${s.flipVertical ? -1 : 1})`;
  image.style.display = "block";
  image.style.margin = "0";
  image.draggable = false;

  if (!s.crop?.enabled) {
    image.style.width = "100%";
    image.style.height = "100%";
  }

  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.pointerEvents = "none";
  if (s.overlay.enabled) {
    if (s.overlay.type === "gradient") {
      overlay.style.backgroundImage = `linear-gradient(${s.overlay.gradientAngle ?? 90}deg, ${s.overlay.gradientStart}, ${s.overlay.gradientEnd})`;
    } else {
      overlay.style.backgroundColor = s.overlay.color;
    }
    overlay.style.opacity = s.overlay.opacity ?? 0.2;
  } else {
    overlay.style.background = "none";
    overlay.style.opacity = "0";
  }

  wrapper.appendChild(image);
  wrapper.appendChild(overlay);

  const runtimeHandler = (e) => {
    if (!AppState.runtimeMode) return;
    if (s.interaction?.clickable && s.interaction?.href) {
      window.open(s.interaction.href, "_blank");
    }
  };

  if (s.interaction?.hoverEffect && s.interaction.hoverEffect !== "none") {
    const originalFilter = wrapper.style.filter || "";
    const originalTransform = wrapper.style.transform || "";
    wrapper.addEventListener("mouseenter", () => {
      if (s.interaction.hoverEffect === "zoom") {
        wrapper.style.transform = `${originalTransform} scale(1.05)`;
      }
      if (s.interaction.hoverEffect === "glow") {
        wrapper.style.filter = "drop-shadow(0 0 12px rgba(255,255,255,0.6))";
      }
    });
    wrapper.addEventListener("mouseleave", () => {
      wrapper.style.transform = originalTransform;
      wrapper.style.filter = originalFilter;
    });
  }

  bindEditSelect(wrapper, component, runtimeHandler);
  return wrapper;
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

function buildBoxShadowString(shadow) {
  if (!shadow || !shadow.enabled) return "none";
  
  const shadows = [];
  
  // Main shadow
  const insetStr = shadow.insetEnabled ? "inset " : "";
  const mainShadow = `${insetStr}${shadow.offsetX ?? 0}px ${shadow.offsetY ?? 4}px ${shadow.blur ?? 8}px ${shadow.spread ?? 0}px rgba(0, 0, 0, ${(shadow.opacity ?? 0.25).toFixed(2)})`;
  shadows.push(mainShadow);
  
  // Multiple shadows
  if (shadow.multiShadows?.length > 0) {
    shadow.multiShadows.forEach(s => {
      if (s.enabled !== false) {
        const shadowStr = `${s.offsetX ?? 0}px ${s.offsetY ?? 0}px ${s.blur ?? 0}px ${s.spread ?? 0}px rgba(0, 0, 0, ${(s.opacity ?? 0.25).toFixed(2)})`;
        shadows.push(shadowStr);
      }
    });
  }
  
  // Glow effect
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

function renderContainerNode(component) {
  ComponentFactory.syncContainerFlexDirection(component);

  const el = document.createElement("div");
  el.className = "container-shell";
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.boxSizing = "border-box";
  // Use transparent background if not explicitly set
  if (component.styles.backgroundColor) {
    el.style.backgroundColor = component.styles.backgroundColor;
  }
  el.style.border = `${component.styles.borderWidth ?? 0}px solid ${component.styles.borderColor ?? "#d1d5db"}`;
  el.style.borderRadius = `${component.styles.borderRadius ?? 10}px`;
  el.style.opacity = `${component.styles.opacity ?? 1}`;
  el.style.display = "flex";
  el.style.flexDirection = "column";
  el.style.overflow = "visible";  
  // Apply shadow styles
  if (component.styles.shadow) {
    el.style.boxShadow = buildBoxShadowString(component.styles.shadow);
  }
  // Badge is now hidden - do not render it

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
  
  // Ensure children are draggable within container
  innerCanvas.dataset.isContainerCanvas = "true";

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
