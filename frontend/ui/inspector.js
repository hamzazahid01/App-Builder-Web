function createField(label, inputEl) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  const l = document.createElement("label");
  l.textContent = label;
  wrap.appendChild(l);
  wrap.appendChild(inputEl);
  return wrap;
}

function createTextInput(value, onChange) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value ?? "";
  input.addEventListener("input", (e) => onChange(e.target.value));
  return input;
}

function createSelect(options, value, onChange) {
  const select = document.createElement("select");
  for (const opt of options) {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    if (opt.value === value) o.selected = true;
    select.appendChild(o);
  }
  select.addEventListener("change", (e) => onChange(e.target.value));
  return select;
}

function createColorInput(value, onChange) {
  const input = document.createElement("input");
  input.type = "color";
  input.value = value ?? "#000000";
  input.addEventListener("input", (e) => onChange(e.target.value));
  return input;
}

function createStepper(value, onChange, step = 1) {
  const wrap = document.createElement("div");
  wrap.className = "stepper";
  const input = document.createElement("input");
  input.type = "number";
  input.value = Number(value ?? 0);
  input.addEventListener("input", (e) => onChange(Number(e.target.value)));
  const btns = document.createElement("div");
  btns.className = "stepper-buttons";
  const up = document.createElement("button");
  up.type = "button";
  up.textContent = "▲";
  up.addEventListener("click", () => {
    input.value = Number(input.value) + step;
    onChange(Number(input.value));
  });
  const down = document.createElement("button");
  down.type = "button";
  down.textContent = "▼";
  down.addEventListener("click", () => {
    input.value = Number(input.value) - step;
    onChange(Number(input.value));
  });
  btns.appendChild(up);
  btns.appendChild(down);
  wrap.appendChild(input);
  wrap.appendChild(btns);
  return wrap;
}

function createSpacingEditor(title, spacingObj, onChange) {
  const wrap = document.createElement("div");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "group-toggle";
  toggle.textContent = `${title} (expand)`;
  const grid = document.createElement("div");
  grid.className = "group-grid";
  grid.style.display = "none";

  const keys = ["top", "right", "bottom", "left"];
  for (const key of keys) {
    grid.appendChild(createField(key, createStepper(spacingObj[key], (v) => onChange(key, v), 1)));
  }

  toggle.addEventListener("click", () => {
    const open = grid.style.display === "grid";
    grid.style.display = open ? "none" : "grid";
    toggle.textContent = `${title} (${open ? "expand" : "collapse"})`;
  });

  wrap.appendChild(toggle);
  wrap.appendChild(grid);
  return wrap;
}

function createAccordion(title, buildContentFn) {
  const tpl = document.getElementById("accordion-template");
  const root = tpl.content.firstElementChild.cloneNode(true);
  root.querySelector(".accordion-title").textContent = title;
  const content = root.querySelector(".accordion-content");
  buildContentFn(content);

  const trigger = root.querySelector(".accordion-trigger");
  trigger.addEventListener("click", () => root.classList.toggle("open"));
  root.classList.add("open");
  return root;
}

function deleteSelected() {
  if (!AppState.selectedId) return;
  StateUtils.removeById(AppState.appData, AppState.selectedId);
  AppState.selectedId = null;
  renderPreview();
  Inspector.render();
}

window.Inspector = {
  render() {
    const panel = document.getElementById("properties-panel");
    panel.innerHTML = "";
    if (!AppState.selectedId) {
      panel.innerHTML = `<div class="empty-state">Select a component to edit its properties.</div>`;
      return;
    }

    const node = StateUtils.findById(AppState.appData, AppState.selectedId);
    if (!node) {
      panel.innerHTML = `<div class="empty-state">Component not found.</div>`;
      return;
    }

    panel.appendChild(createAccordion("General", (content) => {
      content.appendChild(createField("Type", createTextInput(node.type, () => {})));
      content.querySelector("input").disabled = true;
      if (node.type === "button") {
        content.appendChild(createField("Text", createTextInput(node.props.text, (v) => { node.props.text = v; renderPreview(); })));
      }
      if (node.type === "text") {
        content.appendChild(createField("Value", createTextInput(node.props.value, (v) => { node.props.value = v; renderPreview(); })));
      }
      if (node.type === "image") {
        content.appendChild(createField("Source URL", createTextInput(node.props.src, (v) => { node.props.src = v; renderPreview(); })));
      }
      if (node.type === "input") {
        content.appendChild(createField("Placeholder", createTextInput(node.props.placeholder, (v) => { node.props.placeholder = v; renderPreview(); })));
        content.appendChild(createField("Input Type", createSelect([
          { value: "text", label: "text" }, { value: "email", label: "email" }, { value: "password", label: "password" }
        ], node.props.inputType, (v) => { node.props.inputType = v; renderPreview(); })));
      }
    }));

    panel.appendChild(createAccordion("Layout", (content) => {
      if (node.styles.width !== undefined) content.appendChild(createField("Width", createTextInput(node.styles.width, (v) => { node.styles.width = v; renderPreview(); })));
      if (node.styles.height !== undefined) {
        if (typeof node.styles.height === "number") {
          content.appendChild(createField("Height", createStepper(node.styles.height, (v) => { node.styles.height = v; renderPreview(); })));
        } else {
          content.appendChild(createField("Height", createTextInput(node.styles.height, (v) => { node.styles.height = v; renderPreview(); })));
        }
      }
      if (node.styles.flexDirection !== undefined) {
        content.appendChild(createField("Direction", createSelect([
          { value: "row", label: "row" }, { value: "column", label: "column" }
        ], node.styles.flexDirection, (v) => { node.styles.flexDirection = v; renderPreview(); })));
      }
      if (node.styles.gap !== undefined) content.appendChild(createField("Gap", createStepper(node.styles.gap, (v) => { node.styles.gap = v; renderPreview(); })));
      if (node.styles.padding) content.appendChild(createSpacingEditor("Padding", node.styles.padding, (k, v) => { node.styles.padding[k] = v; renderPreview(); }));
      if (node.styles.margin) content.appendChild(createSpacingEditor("Margin", node.styles.margin, (k, v) => { node.styles.margin[k] = v; renderPreview(); }));
    }));

    panel.appendChild(createAccordion("Style", (content) => {
      if (node.styles.backgroundColor !== undefined) content.appendChild(createField("Background", createColorInput(node.styles.backgroundColor, (v) => { node.styles.backgroundColor = v; renderPreview(); })));
      if (node.styles.textColor !== undefined) content.appendChild(createField("Text Color", createColorInput(node.styles.textColor, (v) => { node.styles.textColor = v; renderPreview(); })));
      if (node.styles.color !== undefined) content.appendChild(createField("Color", createColorInput(node.styles.color, (v) => { node.styles.color = v; renderPreview(); })));
      if (node.styles.borderColor !== undefined) content.appendChild(createField("Border Color", createColorInput(node.styles.borderColor, (v) => { node.styles.borderColor = v; renderPreview(); })));
      if (node.styles.borderWidth !== undefined) content.appendChild(createField("Border Width", createStepper(node.styles.borderWidth, (v) => { node.styles.borderWidth = v; renderPreview(); })));
      if (node.styles.borderRadius !== undefined) content.appendChild(createField("Border Radius", createStepper(node.styles.borderRadius, (v) => { node.styles.borderRadius = v; renderPreview(); })));
      if (node.styles.fontSize !== undefined) content.appendChild(createField("Font Size", createStepper(node.styles.fontSize, (v) => { node.styles.fontSize = v; renderPreview(); })));
      if (node.styles.fontWeight !== undefined) content.appendChild(createField("Font Weight", createTextInput(node.styles.fontWeight, (v) => { node.styles.fontWeight = v; renderPreview(); })));
      if (node.styles.textAlign !== undefined) content.appendChild(createField("Align", createSelect([
        { value: "left", label: "left" }, { value: "center", label: "center" }, { value: "right", label: "right" }
      ], node.styles.textAlign, (v) => { node.styles.textAlign = v; renderPreview(); })));
      if (node.styles.fit !== undefined) content.appendChild(createField("Image Fit", createSelect([
        { value: "cover", label: "cover" }, { value: "contain", label: "contain" }
      ], node.styles.fit, (v) => { node.styles.fit = v; renderPreview(); })));
      if (node.styles.opacity !== undefined) content.appendChild(createField("Opacity", createStepper(node.styles.opacity, (v) => { node.styles.opacity = Math.max(0, Math.min(1, Number(v))); renderPreview(); }, 0.1)));
    }));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "danger-btn";
    deleteBtn.textContent = "Delete Component";
    deleteBtn.addEventListener("click", deleteSelected);
    panel.appendChild(deleteBtn);
  }
};
