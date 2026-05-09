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

function createCheckbox(value, onChange) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = !!value;
  input.addEventListener("change", (e) => onChange(e.target.checked));
  return input;
}

function createStepper(value, onChange, step = 1) {
  const wrap = document.createElement("div");
  wrap.className = "stepper";
  const input = document.createElement("input");
  input.type = "number";
  input.step = `${step}`;
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
  for (const key of ["top", "right", "bottom", "left"]) {
    grid.appendChild(createField(key, createStepper(spacingObj[key], (v) => onChange(key, v))));
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

function deleteSelectedComponent() {
  const page = StateUtils.getCurrentPage();
  if (!page || !AppState.selectedId) return;
  StateUtils.removeById(page.components, AppState.selectedId);
  AppState.selectedId = null;
  AppState.selectedType = "page";
  renderPreview();
  Inspector.render();
}

function rerenderAll() {
  renderPreview();
  Inspector.render();
  PageManager.render();
}

function buildAppAccordions(panel) {
  panel.appendChild(createAccordion("App Config", (content) => {
    content.appendChild(createField("App Name", createTextInput(AppState.app.appName, (v) => { AppState.app.appName = v; })));
    content.appendChild(createField("Theme", createSelect([{ value: "light", label: "light" }, { value: "dark", label: "dark" }], AppState.app.theme, (v) => { AppState.app.theme = v; })));
    content.appendChild(createField("Primary Color", createColorInput(AppState.app.primaryColor, (v) => { AppState.app.primaryColor = v; })));
    content.appendChild(createField("Font Family", createTextInput(AppState.app.fontFamily, (v) => { AppState.app.fontFamily = v; })));
  }));

  panel.appendChild(createAccordion("Splash Screen", (content) => {
    const splash = AppState.app.splashScreen;
    content.appendChild(createField("Enabled", createCheckbox(splash.enabled, (v) => { splash.enabled = v; rerenderAll(); })));
    content.appendChild(createField("Background", createColorInput(splash.backgroundColor, (v) => { splash.backgroundColor = v; rerenderAll(); })));
    content.appendChild(createField("Logo URL", createTextInput(splash.logoImage, (v) => { splash.logoImage = v; rerenderAll(); })));
    content.appendChild(createField("Title", createTextInput(splash.titleText, (v) => { splash.titleText = v; rerenderAll(); })));
    content.appendChild(createField("Duration (sec)", createStepper(splash.duration, (v) => { splash.duration = Math.max(1, v); rerenderAll(); })));
    content.appendChild(createField("Next Screen", createSelect(
      AppState.app.pages.map((p) => ({ value: p.id, label: p.name })),
      splash.nextScreenId || AppState.app.initialPageId,
      (v) => { splash.nextScreenId = v; rerenderAll(); }
    )));
  }));
}

function buildPageAccordions(panel, page) {
  panel.appendChild(createAccordion("Page Meta", (content) => {
    content.appendChild(createField("Page Name", createTextInput(page.name, (v) => {
      page.name = v;
      if (page.appBar.enabled && !page.appBar.title) page.appBar.title = v;
      PageManager.render();
    })));
    content.appendChild(createField("Set Initial Page", createCheckbox(page.id === AppState.app.initialPageId, (v) => {
      if (v) {
        AppState.app.initialPageId = page.id;
        if (!AppState.app.splashScreen.nextScreenId) AppState.app.splashScreen.nextScreenId = page.id;
        PageManager.render();
      }
    })));
  }));

  panel.appendChild(createAccordion("Page Canvas", (content) => {
    content.appendChild(createField("Background", createColorInput(page.backgroundColor, (v) => { page.backgroundColor = v; renderPreview(); })));
    content.appendChild(createSpacingEditor("Page Padding", page.layout.padding, (k, v) => { page.layout.padding[k] = v; renderPreview(); }));
    content.appendChild(createField("Alignment", createSelect([
      { value: "top", label: "top" }, { value: "center", label: "center" }, { value: "bottom", label: "bottom" }, { value: "stretch", label: "stretch" }
    ], page.layout.alignment, (v) => { page.layout.alignment = v; renderPreview(); })));
    content.appendChild(createField("Scroll", createSelect([
      { value: "scroll", label: "scroll" }, { value: "fixed", label: "fixed" }
    ], page.layout.scrollBehavior, (v) => { page.layout.scrollBehavior = v; renderPreview(); })));
    content.appendChild(createField("Safe Area", createCheckbox(page.layout.safeArea, (v) => { page.layout.safeArea = v; renderPreview(); })));
  }));

  panel.appendChild(createAccordion("App Bar", (content) => {
    content.appendChild(createField("Enabled", createCheckbox(page.appBar.enabled, (v) => { page.appBar.enabled = v; renderPreview(); })));
    content.appendChild(createField("Title", createTextInput(page.appBar.title, (v) => { page.appBar.title = v; renderPreview(); })));
    content.appendChild(createField("Background", createColorInput(page.appBar.backgroundColor, (v) => { page.appBar.backgroundColor = v; renderPreview(); })));
    content.appendChild(createField("Text Color", createColorInput(page.appBar.textColor, (v) => { page.appBar.textColor = v; renderPreview(); })));
  }));
}

function buildComponentAccordions(panel, node) {
  panel.appendChild(createAccordion("General", (content) => {
    content.appendChild(createField("Type", createTextInput(node.type, () => {})));
    content.querySelector("input").disabled = true;
    if (node.type === "button") {
      content.appendChild(createField("Text", createTextInput(node.props.text, (v) => { node.props.text = v; renderPreview(); })));
      content.appendChild(createField("Action Type", createSelect([
        { value: "navigate", label: "navigate" },
        { value: "openUrl", label: "openUrl" },
        { value: "showDialog", label: "showDialog" },
        { value: "custom", label: "custom" }
      ], node.props.onClick.type, (v) => { node.props.onClick.type = v; Inspector.render(); })));
      if (node.props.onClick.type === "navigate") {
        content.appendChild(createField("Target Page", createSelect(
          AppState.app.pages.map((p) => ({ value: p.id, label: p.name })),
          node.props.onClick.targetPageId,
          (v) => { node.props.onClick.targetPageId = v; }
        )));
      } else if (node.props.onClick.type === "openUrl") {
        content.appendChild(createField("URL", createTextInput(node.props.onClick.url, (v) => { node.props.onClick.url = v; })));
      } else if (node.props.onClick.type === "showDialog") {
        content.appendChild(createField("Dialog Text", createTextInput(node.props.onClick.dialogText, (v) => { node.props.onClick.dialogText = v; })));
      } else {
        content.appendChild(createField("Custom Code", createTextInput(node.props.onClick.customCode, (v) => { node.props.onClick.customCode = v; })));
      }
    }
    if (node.type === "text") content.appendChild(createField("Value", createTextInput(node.props.value, (v) => { node.props.value = v; renderPreview(); })));
    if (node.type === "image") content.appendChild(createField("Source URL", createTextInput(node.props.src, (v) => { node.props.src = v; renderPreview(); })));
    if (node.type === "input") {
      content.appendChild(createField("Placeholder", createTextInput(node.props.placeholder, (v) => { node.props.placeholder = v; renderPreview(); })));
      content.appendChild(createField("Input Type", createSelect([
        { value: "text", label: "text" }, { value: "email", label: "email" }, { value: "password", label: "password" }
      ], node.props.inputType, (v) => { node.props.inputType = v; renderPreview(); })));
    }
  }));

  panel.appendChild(createAccordion("Layout", (content) => {
    if (node.styles.width !== undefined) content.appendChild(createField("Width", createTextInput(node.styles.width, (v) => { node.styles.width = v; renderPreview(); })));
    if (node.styles.height !== undefined) content.appendChild(createField("Height", createStepper(node.styles.height, (v) => { node.styles.height = v; renderPreview(); })));
    if (node.styles.minHeight !== undefined) content.appendChild(createField("Min Height", createStepper(node.styles.minHeight, (v) => { node.styles.minHeight = v; renderPreview(); })));
    if (node.styles.flexDirection !== undefined) content.appendChild(createField("Direction", createSelect([
      { value: "row", label: "row" }, { value: "column", label: "column" }
    ], node.styles.flexDirection, (v) => { node.styles.flexDirection = v; renderPreview(); })));
    if (node.styles.alignItems !== undefined) content.appendChild(createField("Align Items", createSelect([
      { value: "start", label: "start" }, { value: "center", label: "center" }, { value: "end", label: "end" }, { value: "stretch", label: "stretch" }
    ], node.styles.alignItems, (v) => { node.styles.alignItems = v; renderPreview(); })));
    if (node.styles.justifyContent !== undefined) content.appendChild(createField("Justify Content", createSelect([
      { value: "start", label: "start" }, { value: "center", label: "center" }, { value: "space-between", label: "space-between" }, { value: "space-around", label: "space-around" }
    ], node.styles.justifyContent, (v) => { node.styles.justifyContent = v; renderPreview(); })));
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
  deleteBtn.addEventListener("click", deleteSelectedComponent);
  panel.appendChild(deleteBtn);
}

window.Inspector = {
  render() {
    const panel = document.getElementById("properties-panel");
    panel.innerHTML = "";
    const page = StateUtils.getCurrentPage();
    if (!page) {
      panel.innerHTML = `<div class="empty-state">No page found.</div>`;
      return;
    }

    if (AppState.selectedType !== "component" || !AppState.selectedId) {
      buildAppAccordions(panel);
      buildPageAccordions(panel, page);
      return;
    }

    const node = StateUtils.findById(page.components, AppState.selectedId);
    if (!node) {
      AppState.selectedId = null;
      AppState.selectedType = "page";
      this.render();
      return;
    }
    buildComponentAccordions(panel, node);
  }
};
