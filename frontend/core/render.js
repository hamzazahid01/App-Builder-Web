function applySpacing(el, key, spacing = {}) {
  el.style[`${key}Top`] = `${spacing.top ?? 0}px`;
  el.style[`${key}Right`] = `${spacing.right ?? 0}px`;
  el.style[`${key}Bottom`] = `${spacing.bottom ?? 0}px`;
  el.style[`${key}Left`] = `${spacing.left ?? 0}px`;
}

function selectNode(component, e) {
  e.stopPropagation();
  AppState.selectedId = component.id;
  Inspector.render();
  renderPreview();
}

function addDnDBehavior(nodeEl, component) {
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
  return renderContainerNode(component);
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
  el.addEventListener("click", (e) => selectNode(component, e));
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

function renderContainerNode(component) {
  const el = document.createElement("div");
  el.style.width = component.styles.width ?? "100%";
  el.style.height = component.styles.height === "auto" ? "auto" : `${component.styles.height ?? 0}px`;
  el.style.backgroundColor = component.styles.backgroundColor ?? "transparent";
  el.style.border = `${component.styles.borderWidth ?? 0}px solid ${component.styles.borderColor ?? "transparent"}`;
  el.style.borderRadius = `${component.styles.borderRadius ?? 0}px`;
  el.style.opacity = `${component.styles.opacity ?? 1}`;
  el.style.display = "flex";
  el.style.flexDirection = component.styles.flexDirection ?? "column";
  el.style.gap = `${component.styles.gap ?? 0}px`;
  if (component.styles.boxShadow) el.style.boxShadow = component.styles.boxShadow;
  applySpacing(el, "padding", component.styles.padding);
  applySpacing(el, "margin", component.styles.margin);

  if (component.type === "navbar") {
    const title = document.createElement("strong");
    title.textContent = component.props.title;
    title.style.color = component.props.textColor ?? "#ffffff";
    el.appendChild(title);
  }

  for (const child of component.children) {
    el.appendChild(renderComponent(child));
  }

  if (AppState.selectedId === component.id) el.classList.add("selected-node");
  el.addEventListener("click", (e) => selectNode(component, e));
  addDnDBehavior(el, component);
  return el;
}

window.renderPreview = function renderPreview() {
  const preview = document.getElementById("mobile-preview");
  preview.innerHTML = "";
  for (const component of AppState.appData) {
    preview.appendChild(renderComponent(component));
  }
};

window.applyDeviceFrame = function applyDeviceFrame(deviceKey) {
  const frame = AppState.deviceMap[deviceKey];
  const preview = document.getElementById("mobile-preview");
  preview.style.width = `${frame.width}px`;
  preview.style.height = `${frame.height}px`;
};
