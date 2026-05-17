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

function createAccordion(title, buildContentFn, openByDefault = false) {
  const tpl = document.getElementById("accordion-template");
  const root = tpl.content.firstElementChild.cloneNode(true);
  root.querySelector(".accordion-title").textContent = title;
  const content = root.querySelector(".accordion-content");
  buildContentFn(content);
  const trigger = root.querySelector(".accordion-trigger");
  trigger.addEventListener("click", () => root.classList.toggle("open"));
  if (openByDefault) root.classList.add("open");
  return root;
}

function deleteSelectedComponent() {
  StateUtils.deleteSelected();
}

function buildSimplePagePanel(panel, page) {
  panel.appendChild(createAccordion("Screen", (content) => {
    content.appendChild(createField("Background color", createColorInput(page.backgroundColor, (v) => {
      page.backgroundColor = v;
      renderPreview();
    })));
    content.appendChild(createField("Screen name", createTextInput(page.name, (v) => {
      page.name = v;
      updateScreenLabel();
    })));
    content.appendChild(createField("Top bar title (App Preview)", createTextInput(page.appBar.title || page.name, (v) => {
      page.appBar.title = v;
      page.appBar.enabled = true;
    })));
  }, true));

  const hint = document.createElement("p");
  hint.className = "inspector-hint";
  hint.textContent = "Left se component utha kar screen par rakhein. Kisi cheez par click karke settings badlein.";
  panel.appendChild(hint);
}

function buildComponentAccordions(panel, node) {
  if (node.type === "button") {
    buildButtonInspector(panel, node);
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "danger-btn";
    deleteBtn.textContent = "Remove";
    deleteBtn.addEventListener("click", deleteSelectedComponent);
    panel.appendChild(deleteBtn);
    return;
  }

  panel.appendChild(createAccordion("Basic", (content) => {
    if (node.type === "text") {
      content.appendChild(createField("Text", createTextInput(node.props.value, (v) => {
        node.props.value = v;
        renderPreview();
      })));
    }
    if (node.type === "image") {
      content.appendChild(createField("Image link", createTextInput(node.props.src, (v) => {
        node.props.src = v;
        renderPreview();
      })));
    }
    if (node.type === "input") {
      content.appendChild(createField("Placeholder", createTextInput(node.props.placeholder, (v) => {
        node.props.placeholder = v;
        renderPreview();
      })));
    }
    if (node.type === "icon") {
      content.appendChild(createField("Icon", createTextInput(node.props.symbol, (v) => {
        node.props.symbol = v;
        renderPreview();
      })));
    }
    if (node.type === "container") {
      content.appendChild(createField("Background", createColorInput(node.styles.backgroundColor, (v) => {
        node.styles.backgroundColor = v;
        renderPreview();
      })));
      const dir = ComponentFactory.detectFlexDirection(node);
      const info = document.createElement("p");
      info.className = "inspector-note";
      info.textContent = dir === "row"
        ? "Andar ke items side-by-side (wide box)"
        : "Andar ke items upar-neeche (tall box)";
      content.appendChild(info);
    }
  }, true));

  panel.appendChild(createAccordion("Advanced layout", (content) => {
    if (node.layout) {
      content.appendChild(createField("Left (X)", createStepper(node.layout.x, (v) => {
        node.layout.x = Math.max(0, v);
        renderPreview();
      })));
      content.appendChild(createField("Top (Y)", createStepper(node.layout.y, (v) => {
        node.layout.y = Math.max(0, v);
        renderPreview();
      })));
      content.appendChild(createField("Width", createStepper(node.layout.width, (v) => {
        node.layout.width = Math.max(24, v);
        if (node.type === "container") ComponentFactory.syncContainerFlexDirection(node);
        renderPreview();
      })));
      content.appendChild(createField("Height", createStepper(node.layout.height, (v) => {
        node.layout.height = Math.max(24, v);
        if (node.type === "container") ComponentFactory.syncContainerFlexDirection(node);
        renderPreview();
      })));
    }
    if (node.styles.padding) {
      content.appendChild(createSpacingEditor("Inner spacing", node.styles.padding, (k, v) => {
        node.styles.padding[k] = v;
        renderPreview();
      }));
    }
  }, false));

  panel.appendChild(createAccordion("Advanced style", (content) => {
    if (node.styles.backgroundColor !== undefined && node.type !== "container") {
      content.appendChild(createField("Background", createColorInput(node.styles.backgroundColor, (v) => {
        node.styles.backgroundColor = v;
        renderPreview();
      })));
    }
    if (node.styles.textColor !== undefined) {
      content.appendChild(createField("Text color", createColorInput(node.styles.textColor, (v) => {
        node.styles.textColor = v;
        renderPreview();
      })));
    }
    if (node.styles.color !== undefined) {
      content.appendChild(createField("Color", createColorInput(node.styles.color, (v) => {
        node.styles.color = v;
        renderPreview();
      })));
    }
    if (node.styles.borderColor !== undefined) {
      content.appendChild(createField("Border color", createColorInput(node.styles.borderColor, (v) => {
        node.styles.borderColor = v;
        renderPreview();
      })));
    }
    if (node.styles.borderWidth !== undefined) {
      content.appendChild(createField("Border thickness", createStepper(node.styles.borderWidth, (v) => {
        node.styles.borderWidth = v;
        renderPreview();
      })));
    }
    if (node.styles.borderRadius !== undefined) {
      content.appendChild(createField("Round corners", createStepper(node.styles.borderRadius, (v) => {
        node.styles.borderRadius = v;
        renderPreview();
      })));
    }
    if (node.styles.fontSize !== undefined) {
      content.appendChild(createField("Text size", createStepper(node.styles.fontSize, (v) => {
        node.styles.fontSize = v;
        renderPreview();
      })));
    }
    if (node.styles.textAlign !== undefined) {
      content.appendChild(createField("Text align", createSelect([
        { value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }
      ], node.styles.textAlign, (v) => {
        node.styles.textAlign = v;
        renderPreview();
      })));
    }
    if (node.styles.fit !== undefined) {
      content.appendChild(createField("Image fit", createSelect([
        { value: "cover", label: "Fill" }, { value: "contain", label: "Fit inside" }
      ], node.styles.fit, (v) => {
        node.styles.fit = v;
        renderPreview();
      })));
    }
    if (node.type === "input") {
      content.appendChild(createField("Input type", createSelect([
        { value: "text", label: "Text" }, { value: "email", label: "Email" }, { value: "password", label: "Password" }
      ], node.props.inputType, (v) => {
        node.props.inputType = v;
        renderPreview();
      })));
    }
  }, false));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "danger-btn";
  deleteBtn.textContent = "Remove";
  deleteBtn.addEventListener("click", deleteSelectedComponent);
  panel.appendChild(deleteBtn);
}

window.Inspector = {
  render() {
    const panel = document.getElementById("properties-panel");
    panel.innerHTML = "";
    const page = StateUtils.getCurrentPage();
    if (!page) {
      panel.innerHTML = `<div class="empty-state">No screen found.</div>`;
      return;
    }

    if (AppState.selectedType !== "component" || !AppState.selectedId) {
      buildSimplePagePanel(panel, page);
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
