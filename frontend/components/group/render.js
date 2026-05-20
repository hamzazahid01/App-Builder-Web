window.GroupComponent.render = function(component) {
  const el = document.createElement("div");
  el.className = "group-shell";
  el.dataset.componentId = component.id;
  el.dataset.componentType = "group";

  // Apply group styles
  const styles = component.styles || {};
  el.style.backgroundColor = styles.backgroundColor || "#f9fafb";
  el.style.borderWidth = `${styles.borderWidth || 2}px`;
  el.style.borderStyle = "solid";
  el.style.borderColor = styles.borderColor || "#d1d5db";
  el.style.borderRadius = `${styles.borderRadius || 8}px`;
  el.style.padding = `${styles.padding?.top || 8}px ${styles.padding?.right || 8}px ${styles.padding?.bottom || 8}px ${styles.padding?.left || 8}px`;
  el.style.boxSizing = "border-box";
  el.style.width = "100%";
  el.style.height = "100%";

  // Create inner canvas for children
  const innerCanvas = document.createElement("div");
  innerCanvas.className = "group-inner-canvas";
  innerCanvas.dataset.groupCanvas = "true";
  innerCanvas.dataset.groupId = component.id;
  innerCanvas.style.position = "absolute";
  innerCanvas.style.left = "0";
  innerCanvas.style.top = "0";
  innerCanvas.style.right = "0";
  innerCanvas.style.bottom = "0";
  innerCanvas.style.overflow = "visible";
  innerCanvas.style.pointerEvents = "auto";
  innerCanvas.style.zIndex = "0";
  el.appendChild(innerCanvas);

  // Render children if GroupChildren module exists
  if (window.GroupChildren) {
    GroupChildren.render(component, innerCanvas);
  } else if (!AppState.runtimeMode && (!component.children || component.children.length === 0)) {
    const hint = document.createElement("div");
    hint.className = "group-hint";
    hint.textContent = "Drag components here";
    hint.style.pointerEvents = "none";
    innerCanvas.appendChild(hint);
  }

  return el;
};
