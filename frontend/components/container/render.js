window.ContainerComponent.render = function(component) {
  ComponentFactory.syncContainerFlexDirection(component);

  const el = document.createElement("div");
  el.className = "container-shell";
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.boxSizing = "border-box";
  if (component.styles.backgroundColor) {
    el.style.backgroundColor = component.styles.backgroundColor;
  }
  el.style.border = `${component.styles.borderWidth ?? 0}px solid ${component.styles.borderColor ?? "#d1d5db"}`;
  el.style.borderRadius = `${component.styles.borderRadius ?? 10}px`;
  el.style.opacity = `${component.styles.opacity ?? 1}`;
  el.style.display = "flex";
  el.style.flexDirection = "column";
  el.style.overflow = "visible";
  if (component.styles.shadow) {
    el.style.boxShadow = buildBoxShadowString(component.styles.shadow);
  }

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
    if (e.target.closest(".canvas-node-inner")) return;
    e.stopPropagation();
    selectNode(component, e);
  });

  el.addEventListener("click", (e) => {
    if (AppState.runtimeMode) return;
    if (AppState.suppressCanvasClickUntil && Date.now() < AppState.suppressCanvasClickUntil) return;
    if (e.target.closest(".canvas-node")) return;
    if (e.target.closest(".canvas-node-inner")) return;
    e.stopPropagation();
    selectNode(component, e);
  });

  return el;
};
