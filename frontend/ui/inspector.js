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

function createButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = "secondary-btn";
  button.addEventListener("click", onClick);
  return button;
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

function createRangeInput(value, min, max, step, onChange) {
  const input = document.createElement("input");
  input.type = "range";
  input.min = `${min}`;
  input.max = `${max}`;
  input.step = `${step}`;
  input.value = Number(value ?? min);
  input.addEventListener("input", (e) => onChange(parseFloat(e.target.value)));
  return input;
}

function createFontPicker(current, onChange) {
  const grid = document.createElement("div");
  grid.className = "font-picker-grid";
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
  grid.style.gap = "8px";
  grid.style.marginTop = "8px";
  for (const font of TextStyles.FONT_OPTIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = font;
    button.style.fontFamily = font;
    button.style.padding = "10px 12px";
    button.style.borderRadius = "8px";
    button.style.border = font === current ? "2px solid #2563eb" : "1px solid #d1d5db";
    button.style.background = font === current ? "#eff6ff" : "#ffffff";
    button.style.cursor = "pointer";
    button.style.textAlign = "left";
    button.addEventListener("click", () => onChange(font));
    grid.appendChild(button);
  }
  return grid;
}

function appendActionSettings(content, node, action) {
  const pages = (AppState.app.pages || []).map((p) => ({ value: p.id, label: p.name || "Untitled" }));
  content.appendChild(createField("Action", createSelect([
    { value: "none", label: "None" },
    { value: "navigate", label: "Go to screen" },
    { value: "openUrl", label: "Open website" },
    { value: "showDialog", label: "Show message" },
    { value: "back", label: "Go back" }
  ], action.type || "none", (v) => {
    action.type = v;
    if (v === "navigate" && !action.targetPageId && pages.length) action.targetPageId = pages[0].value;
    node.props.action = action;
    renderPreview();
    Inspector.render();
  })));

  if (action.type === "navigate" && pages.length) {
    content.appendChild(createField("Target screen", createSelect(pages, action.targetPageId || pages[0].value, (v) => {
      action.targetPageId = v;
      renderPreview();
    })));
  }
  if (action.type === "openUrl") {
    content.appendChild(createField("Website URL", createTextInput(action.url || "", (v) => {
      action.url = v;
      renderPreview();
    })));
  }
  if (action.type === "showDialog") {
    content.appendChild(createField("Message", createTextInput(action.dialogText || "", (v) => {
      action.dialogText = v;
      renderPreview();
    })));
  }
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
      const action = node.props.action || {
        type: "none",
        targetPageId: AppState?.app?.initialPageId || "",
        url: "",
        dialogText: "Message",
        customCode: ""
      };
      node.props.action = action;
      // Text content
      const textArea = document.createElement("textarea");
      textArea.value = node.props.value || "Text";
      textArea.style.width = "100%";
      textArea.style.minHeight = "60px";
      textArea.style.padding = "8px";
      textArea.style.fontSize = "12px";
      textArea.style.fontFamily = "monospace";
      textArea.style.border = "1px solid #d1d5db";
      textArea.style.borderRadius = "4px";
      textArea.style.boxSizing = "border-box";
      textArea.addEventListener("input", (e) => {
        node.props.value = e.target.value;
        renderPreview();
      });
      content.appendChild(createField("Text Content", textArea));

      // Text Type
      content.appendChild(createField("Text Type", createSelect([
        { value: "heading1", label: "Heading 1" },
        { value: "heading2", label: "Heading 2" },
        { value: "heading3", label: "Heading 3" },
        { value: "paragraph", label: "Paragraph" },
        { value: "caption", label: "Caption" },
        { value: "label", label: "Label" },
        { value: "small", label: "Small Text" },
        { value: "custom", label: "Custom" }
      ], node.styles.textType || "custom", (v) => {
        node.styles.textType = v;
        const preset = TextStyles.TEXT_TYPES[v];
        if (preset && v !== "custom") {
          node.styles.fontSize = preset.fontSize;
          node.styles.fontWeight = preset.fontWeight.toString();
          node.styles.lineHeight = preset.lineHeight;
        }
        renderPreview();
      })));

      const deleteTextButton = document.createElement("button");
      deleteTextButton.type = "button";
      deleteTextButton.className = "danger-btn";
      deleteTextButton.textContent = "Delete Text";
      deleteTextButton.addEventListener("click", deleteSelectedComponent);
      content.appendChild(deleteTextButton);
    }
    if (node.type === "image") {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          node.props.src = reader.result;
          node.props.source = "upload";
          renderPreview();
        };
        reader.readAsDataURL(file);
      });
      content.appendChild(fileInput);

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.flexWrap = "wrap";
      actions.style.gap = "8px";
      actions.appendChild(createButton("Upload Image", () => fileInput.click()));
      actions.appendChild(createButton("Replace Image", () => fileInput.click()));
      actions.appendChild(createButton("Remove Image", () => {
        node.props.src = node.styles.placeholderSrc;
        node.props.source = "url";
        renderPreview();
      }));
      actions.appendChild(createButton("Duplicate", () => {
        StateUtils.duplicateComponent(node.id);
        renderPreview();
      }));
      content.appendChild(actions);

      content.appendChild(createField("Image URL", createTextInput(node.props.src, (v) => {
        node.props.src = v;
        node.props.source = "url";
        renderPreview();
      })));

      content.appendChild(createField("Alt Text", createTextInput(node.props.alt || "", (v) => {
        node.props.alt = v;
        renderPreview();
      })));
    }
    if (node.type === "input") {
      const inputStyles = node.styles;
      const inputProps = node.props;

      // Basic
      panel.appendChild(createAccordion("Input Basic", (content) => {
        content.appendChild(createField("Type", createSelect([
          { value: "text", label: "Text" },
          { value: "email", label: "Email" },
          { value: "password", label: "Password" },
          { value: "number", label: "Number" },
          { value: "phone", label: "Phone" },
          { value: "url", label: "URL" },
          { value: "search", label: "Search" },
          { value: "textarea", label: "Multiline" },
          { value: "date", label: "Date" },
          { value: "time", label: "Time" },
          { value: "file", label: "File" },
          { value: "color", label: "Color" },
          { value: "range", label: "Range" },
          { value: "checkbox", label: "Checkbox" },
          { value: "radio", label: "Radio" },
          { value: "select", label: "Dropdown" },
          { value: "otp", label: "OTP" }
        ], inputProps.inputType || "text", (v) => {
          inputProps.inputType = v;
          renderPreview();
        })));

        content.appendChild(createField("Placeholder", createTextInput(inputProps.placeholder || "", (v) => {
          inputProps.placeholder = v;
          renderPreview();
        })));

        content.appendChild(createField("Default Value", createTextInput(inputProps.value || "", (v) => {
          inputProps.value = v;
          renderPreview();
        })));

        content.appendChild(createField("Editable", createCheckbox(!inputStyles.readonly, (v) => {
          inputStyles.readonly = !v;
          renderPreview();
        })));
      }, false));

      // Style
      panel.appendChild(createAccordion("Style", (content) => {
        content.appendChild(createField("Background", createCheckbox(inputStyles.background?.enabled, (v) => {
          if (!inputStyles.background) inputStyles.background = { enabled: false, type: 'solid', color: '#ffffff' };
          inputStyles.background.enabled = v;
          renderPreview();
        })));
        if (inputStyles.background?.enabled) {
          content.appendChild(createField("Background Color", createColorInput(inputStyles.background.color || '#ffffff', (v) => {
            inputStyles.background.color = v; renderPreview();
          })));
        }

        content.appendChild(createField("Text Color", createColorInput(inputStyles.color || '#0f172a', (v) => {
          inputStyles.color = v; renderPreview();
        })));

        content.appendChild(createField("Placeholder Color", createColorInput(inputStyles.placeholderColor || '#94a3b8', (v) => {
          inputStyles.placeholderColor = v; renderPreview();
        })));

        content.appendChild(createField("Font", createFontPicker(inputStyles.fontFamily || 'Inter', (v) => {
          inputStyles.fontFamily = v; renderPreview();
        })));

        content.appendChild(createField("Font Size", createRangeInput(inputStyles.fontSize ?? 14, 8, 48, 1, (v) => {
          inputStyles.fontSize = v; renderPreview();
        })));

        content.appendChild(createField("Opacity", createRangeInput(inputStyles.opacity ?? 1, 0, 1, 0.01, (v) => {
          inputStyles.opacity = v; renderPreview();
        })));
      }, false));

      // Border & Corners
      panel.appendChild(createAccordion("Border & Corners", (content) => {
        content.appendChild(createField("Enable Border", createCheckbox(inputStyles.borderEnabled, (v) => {
          inputStyles.borderEnabled = v; renderPreview();
        })));
        if (inputStyles.borderEnabled) {
          content.appendChild(createField("Border Width", createStepper(inputStyles.borderWidth ?? 1, (v) => { inputStyles.borderWidth = Math.max(0, v); renderPreview(); }, 1)));
          content.appendChild(createField("Border Color", createColorInput(inputStyles.borderColor || '#cbd5e1', (v) => { inputStyles.borderColor = v; renderPreview(); })));
          content.appendChild(createField("Border Style", createSelect([{value:'solid',label:'Solid'},{value:'dashed',label:'Dashed'},{value:'dotted',label:'Dotted'}], inputStyles.borderStyle || 'solid', (v) => { inputStyles.borderStyle = v; renderPreview(); })));
        }

        content.appendChild(createField("Radius Top Left", createStepper(inputStyles.borderRadiusCorners?.tl ?? inputStyles.borderRadius, (v) => { inputStyles.borderRadiusCorners.tl = v; renderPreview(); }, 1)));
        content.appendChild(createField("Radius Top Right", createStepper(inputStyles.borderRadiusCorners?.tr ?? inputStyles.borderRadius, (v) => { inputStyles.borderRadiusCorners.tr = v; renderPreview(); }, 1)));
        content.appendChild(createField("Radius Bottom Left", createStepper(inputStyles.borderRadiusCorners?.bl ?? inputStyles.borderRadius, (v) => { inputStyles.borderRadiusCorners.bl = v; renderPreview(); }, 1)));
        content.appendChild(createField("Radius Bottom Right", createStepper(inputStyles.borderRadiusCorners?.br ?? inputStyles.borderRadius, (v) => { inputStyles.borderRadiusCorners.br = v; renderPreview(); }, 1)));
      }, false));

      // Shadow
      panel.appendChild(createAccordion("Shadow", (content) => {
        content.appendChild(createField("Enable Shadow", createCheckbox(inputStyles.shadow?.enabled, (v) => { if (!inputStyles.shadow) inputStyles.shadow = {}; inputStyles.shadow.enabled = v; renderPreview(); })));
        if (inputStyles.shadow?.enabled) {
          content.appendChild(createField("Shadow Color", createColorInput(inputStyles.shadow.color || '#000000', (v) => { inputStyles.shadow.color = v; renderPreview(); })));
          content.appendChild(createField("Opacity", createRangeInput(inputStyles.shadow.opacity ?? 0.12, 0, 1, 0.01, (v) => { inputStyles.shadow.opacity = v; renderPreview(); })));
          content.appendChild(createField("Blur", createStepper(inputStyles.shadow.blur ?? 8, (v) => { inputStyles.shadow.blur = v; renderPreview(); }, 1)));
          content.appendChild(createField("Offset X", createStepper(inputStyles.shadow.offsetX ?? 0, (v) => { inputStyles.shadow.offsetX = v; renderPreview(); }, 1)));
          content.appendChild(createField("Offset Y", createStepper(inputStyles.shadow.offsetY ?? 2, (v) => { inputStyles.shadow.offsetY = v; renderPreview(); }, 1)));
        }
      }, false));

      // Layout
      panel.appendChild(createAccordion("Layout", (content) => {
        content.appendChild(createField("Width Mode", createSelect([{value:'fixed',label:'Fixed'},{value:'auto',label:'Auto'},{value:'fill',label:'Fill'}], inputStyles.widthMode || 'fixed', (v) => { inputStyles.widthMode = v; renderPreview(); })));
        content.appendChild(createField("Height Mode", createSelect([{value:'fixed',label:'Fixed'},{value:'auto',label:'Auto'}], inputStyles.heightMode || 'fixed', (v) => { inputStyles.heightMode = v; renderPreview(); })));
        content.appendChild(createField("Alignment", createSelect([{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}], inputStyles.align || 'left', (v) => { inputStyles.align = v; renderPreview(); })));
        content.appendChild(createSpacingEditor('Padding', inputStyles.padding || {top:8,right:12,bottom:8,left:12}, (k,v) => { inputStyles.padding[k] = v; renderPreview(); }));
        content.appendChild(createSpacingEditor('Margin', inputStyles.margin || {top:4,right:0,bottom:4,left:0}, (k,v) => { inputStyles.margin[k] = v; renderPreview(); }));
      }, false));

      // Label & Helper
      panel.appendChild(createAccordion("Label & Helper", (content) => {
        content.appendChild(createField("Show Label", createCheckbox(inputStyles.label?.enabled, (v) => { if (!inputStyles.label) inputStyles.label = {}; inputStyles.label.enabled = v; renderPreview(); })));
        if (inputStyles.label?.enabled) {
          content.appendChild(createField("Label Text", createTextInput(inputStyles.label.text || 'Label', (v) => { inputStyles.label.text = v; renderPreview(); })));
          content.appendChild(createField("Label Position", createSelect([{value:'top',label:'Top'},{value:'left',label:'Left'},{value:'right',label:'Right'}], inputStyles.label.position || 'top', (v) => { inputStyles.label.position = v; renderPreview(); })));
        }
        content.appendChild(createField("Helper Text", createTextInput(inputStyles.helperText?.text || '', (v) => { if (!inputStyles.helperText) inputStyles.helperText = {}; inputStyles.helperText.text = v; renderPreview(); })));
        content.appendChild(createField("Show Character Count", createCheckbox(inputStyles.helperText?.showCharCount, (v) => { if (!inputStyles.helperText) inputStyles.helperText = {}; inputStyles.helperText.showCharCount = v; renderPreview(); })));
      }, false));

      // Validation
      panel.appendChild(createAccordion("Validation", (content) => {
        content.appendChild(createField("Required", createCheckbox(inputStyles.validation?.required, (v) => { if (!inputStyles.validation) inputStyles.validation = {}; inputStyles.validation.required = v; renderPreview(); })));
        content.appendChild(createField("Min Length", createStepper(inputStyles.validation?.minLength ?? 0, (v) => { if (!inputStyles.validation) inputStyles.validation = {}; inputStyles.validation.minLength = v || null; renderPreview(); }, 1)));
        content.appendChild(createField("Max Length", createStepper(inputStyles.validation?.maxLength ?? 0, (v) => { if (!inputStyles.validation) inputStyles.validation = {}; inputStyles.validation.maxLength = v || null; renderPreview(); }, 1)));
        content.appendChild(createField("Pattern (regex)", createTextInput(inputStyles.validation?.pattern || '', (v) => { if (!inputStyles.validation) inputStyles.validation = {}; inputStyles.validation.pattern = v; renderPreview(); })));
        content.appendChild(createField("Error Message", createTextInput(inputStyles.validation?.customMessage || '', (v) => { if (!inputStyles.validation) inputStyles.validation = {}; inputStyles.validation.customMessage = v; renderPreview(); })));
      }, false));

      // Advanced
      panel.appendChild(createAccordion("Advanced", (content) => {
        content.appendChild(createField("Autocomplete", createCheckbox(inputStyles.autocomplete, (v) => { inputStyles.autocomplete = v; renderPreview(); })));
        content.appendChild(createField("Read Only", createCheckbox(inputStyles.readonly, (v) => { inputStyles.readonly = v; renderPreview(); })));
        content.appendChild(createField("Disabled", createCheckbox(inputStyles.disabled, (v) => { inputStyles.disabled = v; renderPreview(); })));
        content.appendChild(createField("Character Limit", createStepper(inputStyles.characterLimit ?? 0, (v) => { inputStyles.characterLimit = v || null; renderPreview(); }, 1)));
      }, false));
    }
    if (node.type === "icon") {
      const iconStyles = node.styles;
      const iconProps = node.props;
      const action = iconProps.action || {
        type: "none",
        targetPageId: AppState?.app?.initialPageId || "",
        url: "",
        dialogText: "Message",
        customCode: ""
      };
      iconProps.action = action;

      // Source & Library
      panel.appendChild(createAccordion("Icon Source", (content) => {
        content.appendChild(createField("Symbol / Emoji", createTextInput(iconProps.symbol || "", (v) => { iconProps.symbol = v; renderPreview(); })));

        // SVG upload
        const svgInput = document.createElement("input");
        svgInput.type = "file";
        svgInput.accept = ".svg";
        svgInput.style.display = "none";
        svgInput.addEventListener("change", (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => { iconProps.svg = r.result; iconProps.src = null; iconProps.library = 'custom'; renderPreview(); };
          r.readAsText(f);
        });
        content.appendChild(svgInput);
        const imgInput = document.createElement("input");
        imgInput.type = "file";
        imgInput.accept = "image/png,image/jpeg,image/webp";
        imgInput.style.display = "none";
        imgInput.addEventListener("change", (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => { iconProps.src = r.result; iconProps.svg = null; iconProps.library = 'upload'; renderPreview(); };
          r.readAsDataURL(f);
        });
        content.appendChild(imgInput);

        const actions = document.createElement("div"); actions.style.display = "flex"; actions.style.gap = "8px";
        actions.appendChild(createButton("Upload SVG", () => svgInput.click()));
        actions.appendChild(createButton("Upload Image", () => imgInput.click()));
        actions.appendChild(createButton("Clear", () => { iconProps.svg = null; iconProps.src = null; renderPreview(); }));
        content.appendChild(actions);
      }, false));

      // Style
      panel.appendChild(createAccordion("Style", (content) => {
        content.appendChild(createField("Color", createColorInput(iconStyles.color || '#1f2937', (v) => { iconStyles.color = v; renderPreview(); })));
        content.appendChild(createField("Use Gradient", createCheckbox(iconStyles.gradient?.enabled, (v) => { if (!iconStyles.gradient) iconStyles.gradient = {}; iconStyles.gradient.enabled = v; renderPreview(); })));
        if (iconStyles.gradient?.enabled) {
          content.appendChild(createField("Gradient Start", createColorInput(iconStyles.gradient.start || '#111827', (v) => { iconStyles.gradient.start = v; renderPreview(); })));
          content.appendChild(createField("Gradient End", createColorInput(iconStyles.gradient.end || '#2563eb', (v) => { iconStyles.gradient.end = v; renderPreview(); })));
        }
        content.appendChild(createField("Size", createRangeInput(iconStyles.fontSize ?? 24, 8, 256, 1, (v) => { iconStyles.fontSize = v; renderPreview(); })));
        content.appendChild(createField("Opacity", createRangeInput(iconStyles.opacity ?? 1, 0, 1, 0.01, (v) => { iconStyles.opacity = v; renderPreview(); })));
        content.appendChild(createField("Rotation", createStepper(iconStyles.rotation ?? 0, (v) => { iconStyles.rotation = v; renderPreview(); }, 5)));
        content.appendChild(createField("Flip Horizontal", createCheckbox(iconStyles.flipHorizontal, (v) => { iconStyles.flipHorizontal = v; renderPreview(); })));
        content.appendChild(createField("Flip Vertical", createCheckbox(iconStyles.flipVertical, (v) => { iconStyles.flipVertical = v; renderPreview(); })));
      }, false));

      // Background & Border
      panel.appendChild(createAccordion("Background & Border", (content) => {
        content.appendChild(createField("Enable Background", createCheckbox(iconStyles.background?.enabled, (v) => { if (!iconStyles.background) iconStyles.background = {}; iconStyles.background.enabled = v; renderPreview(); })));
        if (iconStyles.background?.enabled) content.appendChild(createField("Background Color", createColorInput(iconStyles.background.color || '#ffffff', (v) => { iconStyles.background.color = v; renderPreview(); })));
        content.appendChild(createField("Enable Border", createCheckbox(iconStyles.borderEnabled, (v) => { iconStyles.borderEnabled = v; renderPreview(); })));
        if (iconStyles.borderEnabled) {
          content.appendChild(createField("Border Width", createStepper(iconStyles.borderWidth ?? 1, (v) => { iconStyles.borderWidth = v; renderPreview(); }, 1)));
          content.appendChild(createField("Border Color", createColorInput(iconStyles.borderColor || '#e5e7eb', (v) => { iconStyles.borderColor = v; renderPreview(); })));
          content.appendChild(createField("Border Style", createSelect([{value:'solid',label:'Solid'},{value:'dashed',label:'Dashed'},{value:'dotted',label:'Dotted'}], iconStyles.borderStyle || 'solid', (v) => { iconStyles.borderStyle = v; renderPreview(); })));
        }
        content.appendChild(createSpacingEditor('Padding', iconStyles.padding || {top:6,right:6,bottom:6,left:6}, (k,v) => { iconStyles.padding[k] = v; renderPreview(); }));
        content.appendChild(createField("Border Radius", createStepper(iconStyles.borderRadius ?? 8, (v) => { iconStyles.borderRadius = v; renderPreview(); }, 1)));
      }, false));

      // Shadow
      panel.appendChild(createAccordion("Shadow", (content) => {
        content.appendChild(createField("Enable Shadow", createCheckbox(iconStyles.shadow?.enabled, (v) => { if (!iconStyles.shadow) iconStyles.shadow = {}; iconStyles.shadow.enabled = v; renderPreview(); })));
        if (iconStyles.shadow?.enabled) {
          content.appendChild(createField("Shadow Color", createColorInput(iconStyles.shadow.color || '#000000', (v) => { iconStyles.shadow.color = v; renderPreview(); })));
          content.appendChild(createField("Opacity", createRangeInput(iconStyles.shadow.opacity ?? 0.12, 0, 1, 0.01, (v) => { iconStyles.shadow.opacity = v; renderPreview(); })));
          content.appendChild(createField("Blur", createStepper(iconStyles.shadow.blur ?? 8, (v) => { iconStyles.shadow.blur = v; renderPreview(); }, 1)));
          content.appendChild(createField("Offset X", createStepper(iconStyles.shadow.offsetX ?? 0, (v) => { iconStyles.shadow.offsetX = v; renderPreview(); }, 1)));
          content.appendChild(createField("Offset Y", createStepper(iconStyles.shadow.offsetY ?? 2, (v) => { iconStyles.shadow.offsetY = v; renderPreview(); }, 1)));
        }
      }, false));

      // Layout
      panel.appendChild(createAccordion("Layout", (content) => {
        content.appendChild(createField("Width Mode", createSelect([{value:'auto',label:'Auto'},{value:'fixed',label:'Fixed'}], iconStyles.widthMode || 'auto', (v) => { iconStyles.widthMode = v; renderPreview(); })));
        content.appendChild(createField("Height Mode", createSelect([{value:'auto',label:'Auto'},{value:'fixed',label:'Fixed'}], iconStyles.heightMode || 'auto', (v) => { iconStyles.heightMode = v; renderPreview(); })));
        content.appendChild(createField("Alignment", createSelect([{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}], iconStyles.align || 'center', (v) => { iconStyles.align = v; renderPreview(); })));
        content.appendChild(createSpacingEditor('Margin', iconStyles.margin || {top:0,right:0,bottom:0,left:0}, (k,v) => { iconStyles.margin[k] = v; renderPreview(); }));
      }, false));

      // Interaction & Animation
      panel.appendChild(createAccordion("Interaction & Animation", (content) => {
        appendActionSettings(content, node, action);
        content.appendChild(createField("Clickable", createCheckbox(iconStyles.interaction?.clickable, (v) => { if (!iconStyles.interaction) iconStyles.interaction = {}; iconStyles.interaction.clickable = v; renderPreview(); })));
        if (iconStyles.interaction?.clickable) content.appendChild(createField("Link URL", createTextInput(iconStyles.interaction.href || '', (v) => { iconStyles.interaction.href = v; renderPreview(); })));
        content.appendChild(createField("Hover Effect", createSelect([{value:'none',label:'None'},{value:'scale',label:'Scale'},{value:'rotate',label:'Rotate'},{value:'glow',label:'Glow'},{value:'color',label:'Color Change'}], iconStyles.states?.hover?.effect || 'none', (v) => { if (!iconStyles.states) iconStyles.states = {}; if (!iconStyles.states.hover) iconStyles.states.hover = {}; iconStyles.states.hover.effect = v; renderPreview(); })));
        content.appendChild(createField("Animation", createCheckbox(iconStyles.animation?.enabled, (v) => { if (!iconStyles.animation) iconStyles.animation = {}; iconStyles.animation.enabled = v; renderPreview(); })));
        if (iconStyles.animation?.enabled) {
          content.appendChild(createField("Type", createSelect([{value:'none',label:'None'},{value:'fade',label:'Fade'},{value:'pulse',label:'Pulse'},{value:'rotate',label:'Rotate'}], iconStyles.animation.type || 'none', (v) => { iconStyles.animation.type = v; renderPreview(); })));
          content.appendChild(createField("Duration", createStepper(iconStyles.animation.duration ?? 600, (v) => { iconStyles.animation.duration = v; renderPreview(); }, 50)));
        }
      }, false));

      // Advanced
      panel.appendChild(createAccordion("Advanced", (content) => {
        content.appendChild(createField("Alt / Label", createTextInput(iconStyles.alt || '', (v) => { iconStyles.alt = v; renderPreview(); })));
        content.appendChild(createField("Visible on Desktop", createCheckbox(iconStyles.visibleOn?.desktop, (v) => { if (!iconStyles.visibleOn) iconStyles.visibleOn = {}; iconStyles.visibleOn.desktop = v; renderPreview(); })));
        content.appendChild(createField("Visible on Tablet", createCheckbox(iconStyles.visibleOn?.tablet, (v) => { if (!iconStyles.visibleOn) iconStyles.visibleOn = {}; iconStyles.visibleOn.tablet = v; renderPreview(); })));
        content.appendChild(createField("Visible on Mobile", createCheckbox(iconStyles.visibleOn?.mobile, (v) => { if (!iconStyles.visibleOn) iconStyles.visibleOn = {}; iconStyles.visibleOn.mobile = v; renderPreview(); })));
      }, false));
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

  // Text styling sections - only show for text components
  if (node.type === "text") {
    // Typography section
    panel.appendChild(createAccordion("Typography", (content) => {
      content.appendChild(createField("Font", createFontPicker(node.styles.fontFamily || "Inter", (v) => {
        node.styles.fontFamily = v;
        renderPreview();
      })));

      const fontSizeWrapper = document.createElement("div");
      fontSizeWrapper.style.display = "flex";
      fontSizeWrapper.style.alignItems = "center";
      fontSizeWrapper.style.gap = "8px";
      const fontSizeSlider = createRangeInput(node.styles.fontSize || 16, 8, 72, 1, (v) => {
        node.styles.fontSize = Math.max(8, Math.round(v));
        fontSizeStepper.querySelector("input").value = node.styles.fontSize;
        renderPreview();
      });
      const fontSizeStepper = createStepper(node.styles.fontSize || 16, (v) => {
        node.styles.fontSize = Math.max(8, v);
        fontSizeSlider.value = node.styles.fontSize;
        renderPreview();
      }, 1);
      fontSizeWrapper.appendChild(fontSizeSlider);
      fontSizeWrapper.appendChild(fontSizeStepper);
      content.appendChild(createField("Size", fontSizeWrapper));

      content.appendChild(createField("Weight", createSelect(
        TextStyles.FONT_WEIGHTS,
        node.styles.fontWeight || "400",
        (v) => {
          node.styles.fontWeight = v;
          renderPreview();
        }
      )));

      content.appendChild(createField("Style", createSelect([
        { value: "normal", label: "Normal" },
        { value: "italic", label: "Italic" }
      ], node.styles.fontStyle || "normal", (v) => {
        node.styles.fontStyle = v;
        renderPreview();
      })));

      content.appendChild(createField("Line Height", createStepper(node.styles.lineHeight || 1.5, (v) => {
        node.styles.lineHeight = Math.max(0.5, v);
        renderPreview();
      }, 0.1)));

      content.appendChild(createField("Letter Spacing", createStepper(node.styles.letterSpacing || 0, (v) => {
        node.styles.letterSpacing = v;
        renderPreview();
      }, 0.5)));

      content.appendChild(createField("Word Spacing", createStepper(node.styles.wordSpacing || 0, (v) => {
        node.styles.wordSpacing = v;
        renderPreview();
      }, 0.5)));
    }, false));

    // Text Color & Opacity
    panel.appendChild(createAccordion("Colors & Effects", (content) => {
      content.appendChild(createField("Text Fill", createSelect([
        { value: "solid", label: "Solid" },
        { value: "gradient", label: "Gradient" },
        { value: "transparent", label: "Transparent" }
      ], node.styles.textFillType || "solid", (v) => {
        node.styles.textFillType = v;
        renderPreview();
      })));

      if (node.styles.textFillType === "solid") {
        content.appendChild(createField("Text Color", createColorInput(node.styles.color || "#111827", (v) => {
          node.styles.color = v;
          renderPreview();
        })));
      }

      if (node.styles.textFillType === "gradient") {
        content.appendChild(createField("Gradient Start", createColorInput(node.styles.textGradient?.start || "#111827", (v) => {
          node.styles.textGradient.start = v;
          renderPreview();
        })));
        content.appendChild(createField("Gradient End", createColorInput(node.styles.textGradient?.end || "#2563eb", (v) => {
          node.styles.textGradient.end = v;
          renderPreview();
        })));
        content.appendChild(createField("Gradient Angle", createStepper(node.styles.textGradient?.angle ?? 90, (v) => {
          node.styles.textGradient.angle = v;
          renderPreview();
        }, 5)));
      }

      const opacityInput = createRangeInput(node.styles.textOpacity ?? 1, 0, 1, 0.05, (v) => {
        node.styles.textOpacity = v;
        renderPreview();
      });
      content.appendChild(createField("Opacity", opacityInput));

      // Text Decorations
      const decorWrap = document.createElement("div");
      decorWrap.style.display = "flex";
      decorWrap.style.gap = "12px";
      decorWrap.style.flexWrap = "wrap";

      const underlineCheck = createCheckbox(node.styles.textDecoration?.underline, (v) => {
        node.styles.textDecoration.underline = v;
        renderPreview();
      });
      decorWrap.appendChild(createField("Underline", underlineCheck));

      const overlineCheck = createCheckbox(node.styles.textDecoration?.overline, (v) => {
        node.styles.textDecoration.overline = v;
        renderPreview();
      });
      decorWrap.appendChild(createField("Overline", overlineCheck));

      const strikeCheck = createCheckbox(node.styles.textDecoration?.lineThrough, (v) => {
        node.styles.textDecoration.lineThrough = v;
        renderPreview();
      });
      decorWrap.appendChild(createField("Strike", strikeCheck));

      content.appendChild(decorWrap);
    }, false));

    // Text Alignment
    panel.appendChild(createAccordion("Alignment", (content) => {
      content.appendChild(createField("Horizontal", createSelect([
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
        { value: "justify", label: "Justify" }
      ], node.styles.textAlign || "left", (v) => {
        node.styles.textAlign = v;
        renderPreview();
      })));

      content.appendChild(createField("Vertical", createSelect([
        { value: "top", label: "Top" },
        { value: "center", label: "Center" },
        { value: "bottom", label: "Bottom" }
      ], node.styles.verticalAlign || "top", (v) => {
        node.styles.verticalAlign = v;
        renderPreview();
      })));
    }, false));

    // Text Shadow
    panel.appendChild(createAccordion("Text Shadow", (content) => {
      content.appendChild(createField("Enable", createCheckbox(node.styles.textShadow?.enabled, (v) => {
        node.styles.textShadow.enabled = v;
        renderPreview();
      })));

      if (node.styles.textShadow?.enabled) {
        content.appendChild(createField("Shadow Color", createColorInput(node.styles.textShadow.color || "#000000", (v) => {
          node.styles.textShadow.color = v;
          renderPreview();
        })));

        const shadowOpacity = document.createElement("input");
        shadowOpacity.type = "range";
        shadowOpacity.min = "0";
        shadowOpacity.max = "1";
        shadowOpacity.step = "0.1";
        shadowOpacity.value = node.styles.textShadow.opacity ?? 0.25;
        shadowOpacity.addEventListener("input", (e) => {
          node.styles.textShadow.opacity = parseFloat(e.target.value);
          renderPreview();
        });
        content.appendChild(createField("Opacity", shadowOpacity));

        content.appendChild(createField("Blur", createStepper(node.styles.textShadow.blur ?? 0, (v) => {
          node.styles.textShadow.blur = Math.max(0, v);
          renderPreview();
        }, 1)));

        content.appendChild(createField("Offset X", createStepper(node.styles.textShadow.offsetX ?? 0, (v) => {
          node.styles.textShadow.offsetX = v;
          renderPreview();
        }, 1)));

        content.appendChild(createField("Offset Y", createStepper(node.styles.textShadow.offsetY ?? 0, (v) => {
          node.styles.textShadow.offsetY = v;
          renderPreview();
        }, 1)));

        content.appendChild(createField("Intensity", createSelect([
          { value: "soft", label: "Soft" },
          { value: "medium", label: "Medium" },
          { value: "hard", label: "Hard" }
        ], node.styles.textShadow.intensity || "soft", (v) => {
          node.styles.textShadow.intensity = v;
          renderPreview();
        })));

        node.styles.textShadow.multiShadows = node.styles.textShadow.multiShadows || [];
        const addLayer = document.createElement("button");
        addLayer.type = "button";
        addLayer.textContent = "Add Shadow Layer";
        addLayer.addEventListener("click", () => {
          node.styles.textShadow.multiShadows.push({ enabled: true, offsetX: 0, offsetY: 0, blur: 4, spread: 0, opacity: 0.15 });
          renderPreview();
        });
        content.appendChild(addLayer);

        node.styles.textShadow.multiShadows.forEach((layer, index) => {
          const layerField = document.createElement("div");
          layerField.style.border = "1px solid #e5e7eb";
          layerField.style.borderRadius = "8px";
          layerField.style.padding = "10px";
          layerField.style.marginTop = "10px";
          layerField.style.backgroundColor = "#f9fafb";

          layerField.appendChild(createField(`Layer ${index + 1}`, createCheckbox(layer.enabled, (v) => {
            layer.enabled = v;
            renderPreview();
          })));
          layerField.appendChild(createField("Offset X", createStepper(layer.offsetX ?? 0, (v) => {
            layer.offsetX = v;
            renderPreview();
          }, 1)));
          layerField.appendChild(createField("Offset Y", createStepper(layer.offsetY ?? 0, (v) => {
            layer.offsetY = v;
            renderPreview();
          }, 1)));
          layerField.appendChild(createField("Blur", createStepper(layer.blur ?? 4, (v) => {
            layer.blur = v;
            renderPreview();
          }, 1)));
          layerField.appendChild(createField("Spread", createStepper(layer.spread ?? 0, (v) => {
            layer.spread = v;
            renderPreview();
          }, 1)));
          const layerOpacity = createRangeInput(layer.opacity ?? 0.15, 0, 1, 0.05, (v) => {
            layer.opacity = v;
            renderPreview();
          });
          layerField.appendChild(createField("Opacity", layerOpacity));
          const removeLayer = document.createElement("button");
          removeLayer.type = "button";
          removeLayer.textContent = "Remove Layer";
          removeLayer.addEventListener("click", () => {
            node.styles.textShadow.multiShadows.splice(index, 1);
            renderPreview();
          });
          layerField.appendChild(removeLayer);
          content.appendChild(layerField);
        });
      }
    }, false));

    // Text Stroke/Outline
    panel.appendChild(createAccordion("Text Outline", (content) => {
      content.appendChild(createField("Enable", createCheckbox(node.styles.textStroke?.enabled, (v) => {
        node.styles.textStroke.enabled = v;
        renderPreview();
      })));

      if (node.styles.textStroke?.enabled) {
        content.appendChild(createField("Color", createColorInput(node.styles.textStroke.color || "#000000", (v) => {
          node.styles.textStroke.color = v;
          renderPreview();
        })));

        content.appendChild(createField("Width", createStepper(node.styles.textStroke.width ?? 1, (v) => {
          node.styles.textStroke.width = Math.max(0, v);
          renderPreview();
        }, 0.5)));

        const strokeOpacity = document.createElement("input");
        strokeOpacity.type = "range";
        strokeOpacity.min = "0";
        strokeOpacity.max = "1";
        strokeOpacity.step = "0.1";
        strokeOpacity.value = node.styles.textStroke.opacity ?? 1;
        strokeOpacity.addEventListener("input", (e) => {
          node.styles.textStroke.opacity = parseFloat(e.target.value);
          renderPreview();
        });
        content.appendChild(createField("Opacity", strokeOpacity));
      }
    }, false));

    // Text Background
    panel.appendChild(createAccordion("Text Background", (content) => {
      content.appendChild(createField("Enable", createCheckbox(node.styles.textBackground?.enabled, (v) => {
        node.styles.textBackground.enabled = v;
        renderPreview();
      })));

      if (node.styles.textBackground?.enabled) {
        content.appendChild(createField("Background Type", createSelect([
          { value: "solid", label: "Solid" },
          { value: "gradient", label: "Gradient" }
        ], node.styles.textBackground.type || "solid", (v) => {
          node.styles.textBackground.type = v;
          renderPreview();
        })));

        if (node.styles.textBackground.type === "solid") {
          content.appendChild(createField("Color", createColorInput(node.styles.textBackground.color || "#ffffff", (v) => {
            node.styles.textBackground.color = v;
            renderPreview();
          })));
        }

        if (node.styles.textBackground.type === "gradient") {
          content.appendChild(createField("Gradient Start", createColorInput(node.styles.textBackground.gradientStart || "#ffffff", (v) => {
            node.styles.textBackground.gradientStart = v;
            renderPreview();
          })));
          content.appendChild(createField("Gradient End", createColorInput(node.styles.textBackground.gradientEnd || "#f8fafc", (v) => {
            node.styles.textBackground.gradientEnd = v;
            renderPreview();
          })));
          content.appendChild(createField("Gradient Angle", createStepper(node.styles.textBackground.gradientAngle ?? 90, (v) => {
            node.styles.textBackground.gradientAngle = v;
            renderPreview();
          }, 5)));
        }

        const bgOpacity = createRangeInput(node.styles.textBackground.opacity ?? 1, 0, 1, 0.05, (v) => {
          node.styles.textBackground.opacity = v;
          renderPreview();
        });
        content.appendChild(createField("Opacity", bgOpacity));

        content.appendChild(createField("Border Radius", createStepper(node.styles.textBackground.borderRadius ?? 0, (v) => {
          node.styles.textBackground.borderRadius = Math.max(0, v);
          renderPreview();
        }, 2)));

        content.appendChild(createSpacingEditor("Padding", node.styles.textBackground.padding || { top: 4, right: 8, bottom: 4, left: 8 }, (k, v) => {
          node.styles.textBackground.padding[k] = v;
          renderPreview();
        }));
      }
    }, false));

    // Overflow & Layout
    panel.appendChild(createAccordion("Text Layout", (content) => {
      content.appendChild(createField("Overflow", createSelect([
        { value: "wrap", label: "Wrap" },
        { value: "clip", label: "Clip" },
        { value: "ellipsis", label: "Ellipsis (...)" },
        { value: "scroll", label: "Scroll" }
      ], node.styles.overflow || "wrap", (v) => {
        node.styles.overflow = v;
        renderPreview();
      })));

      content.appendChild(createField("Max Lines", createStepper(node.styles.maxLines ?? 0, (v) => {
        node.styles.maxLines = v > 0 ? v : null;
        renderPreview();
      }, 1)));

      content.appendChild(createField("Rotation", createStepper(node.styles.rotation ?? 0, (v) => {
        node.styles.rotation = v;
        renderPreview();
      }, 5)));

      content.appendChild(createSpacingEditor("Padding", node.styles.padding || { top: 0, right: 0, bottom: 0, left: 0 }, (k, v) => {
        node.styles.padding[k] = v;
        renderPreview();
      }));

      content.appendChild(createSpacingEditor("Margin", node.styles.margin || { top: 0, right: 0, bottom: 0, left: 0 }, (k, v) => {
        node.styles.margin[k] = v;
        renderPreview();
      }));
    }, false));

    // Responsive & Animation
    panel.appendChild(createAccordion("Advanced", (content) => {
      // Responsive
      content.appendChild(createField("Responsive", createCheckbox(node.styles.responsive?.enabled, (v) => {
        node.styles.responsive.enabled = v;
        renderPreview();
      })));

      if (node.styles.responsive?.enabled) {
        content.appendChild(createField("Mobile Scale", createStepper(node.styles.responsive.mobileScale ?? 0.85, (v) => {
          node.styles.responsive.mobileScale = Math.max(0.5, v);
          renderPreview();
        }, 0.05)));

        content.appendChild(createField("Tablet Scale", createStepper(node.styles.responsive.tabletScale ?? 0.95, (v) => {
          node.styles.responsive.tabletScale = Math.max(0.5, v);
          renderPreview();
        }, 0.05)));
      }

      // Animation
      content.appendChild(createField("Animation", createCheckbox(node.styles.animation?.enabled, (v) => {
        node.styles.animation.enabled = v;
        renderPreview();
      })));

      if (node.styles.animation?.enabled) {
        content.appendChild(createField("Type", createSelect([
          { value: "none", label: "None" },
          { value: "fade", label: "Fade In" },
          { value: "slide", label: "Slide" },
          { value: "typing", label: "Typing" },
          { value: "bounce", label: "Bounce" },
          { value: "glow", label: "Glow" }
        ], node.styles.animation.type || "none", (v) => {
          node.styles.animation.type = v;
          renderPreview();
        })));

        content.appendChild(createField("Duration (ms)", createStepper(node.styles.animation.duration ?? 1000, (v) => {
          node.styles.animation.duration = Math.max(100, v);
          renderPreview();
        }, 100)));

        content.appendChild(createField("Delay (ms)", createStepper(node.styles.animation.delay ?? 0, (v) => {
          node.styles.animation.delay = Math.max(0, v);
          renderPreview();
        }, 100)));

        content.appendChild(createField("Speed", createStepper(node.styles.animation.speed ?? 1, (v) => {
          node.styles.animation.speed = Math.max(0.5, v);
          renderPreview();
        }, 0.1)));

        content.appendChild(createField("Loop", createCheckbox(node.styles.animation.loop, (v) => {
          node.styles.animation.loop = v;
          renderPreview();
        })));
      }

      appendActionSettings(content, node, action);

      // Interaction
      content.appendChild(createField("Clickable", createCheckbox(node.styles.interaction?.clickable, (v) => {
        node.styles.interaction.clickable = v;
        renderPreview();
      })));

      if (node.styles.interaction?.clickable) {
        content.appendChild(createField("Link URL", createTextInput(node.styles.interaction.href || "", (v) => {
          node.styles.interaction.href = v;
          renderPreview();
        })));

        content.appendChild(createField("Hover Effect", createSelect([
          { value: "none", label: "None" },
          { value: "underline", label: "Underline" },
          { value: "scale", label: "Scale" },
          { value: "color", label: "Color Change" }
        ], node.styles.interaction.hoverEffect || "none", (v) => {
          node.styles.interaction.hoverEffect = v;
          renderPreview();
        })));
      }

      content.appendChild(createField("Copyable", createCheckbox(node.styles.interaction?.copyable, (v) => {
        node.styles.interaction.copyable = v;
        renderPreview();
      })));
    }, false));
  }

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
      content.appendChild(createField("Width Mode", createSelect([
        { value: "auto", label: "Auto" },
        { value: "fixed", label: "Fixed" },
        { value: "fill", label: "Fill" }
      ], node.styles.widthMode || "auto", (v) => {
        node.styles.widthMode = v;
        renderPreview();
      })));
      content.appendChild(createField("Width", createStepper(node.layout.width, (v) => {
        node.layout.width = Math.max(24, v);
        if (node.type === "container") ComponentFactory.syncContainerFlexDirection(node);
        renderPreview();
      })));
      content.appendChild(createField("Height Mode", createSelect([
        { value: "auto", label: "Auto" },
        { value: "fixed", label: "Fixed" }
      ], node.styles.heightMode || "auto", (v) => {
        node.styles.heightMode = v;
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

  if (node.type === "image") {
    const imageStyles = node.styles;

    panel.appendChild(createAccordion("Image Display", (content) => {
      content.appendChild(createField("Display Type", createSelect([
        { value: "normal", label: "Normal" },
        { value: "rounded", label: "Rounded" },
        { value: "circular", label: "Circular" },
        { value: "avatar", label: "Avatar" },
        { value: "banner", label: "Banner" },
        { value: "thumbnail", label: "Thumbnail" },
        { value: "cover", label: "Cover" }
      ], imageStyles.displayType || "normal", (v) => {
        imageStyles.displayType = v;
        if (v === "circular" || v === "avatar") {
          imageStyles.borderRadiusCorners = { tl: 9999, tr: 9999, bl: 9999, br: 9999 };
        }
        renderPreview();
      })));

      content.appendChild(createField("Fit", createSelect([
        { value: "cover", label: "Cover" },
        { value: "contain", label: "Contain" },
        { value: "fill", label: "Fill" },
        { value: "none", label: "None" },
        { value: "scale-down", label: "Scale Down" }
      ], imageStyles.fit || "cover", (v) => {
        imageStyles.fit = v;
        renderPreview();
      })));

      content.appendChild(createField("Opacity", createRangeInput(imageStyles.opacity ?? 1, 0, 1, 0.05, (v) => {
        imageStyles.opacity = v;
        renderPreview();
      })));

      content.appendChild(createField("Alt Text", createTextInput(node.props.alt || "", (v) => {
        node.props.alt = v;
        renderPreview();
      })));
    }, false));

    panel.appendChild(createAccordion("Border & Shape", (content) => {
      content.appendChild(createField("Enable Border", createCheckbox(imageStyles.borderEnabled, (v) => {
        imageStyles.borderEnabled = v;
        renderPreview();
      })));

      if (imageStyles.borderEnabled) {
        content.appendChild(createField("Border Width", createStepper(imageStyles.borderWidth ?? 1, (v) => {
          imageStyles.borderWidth = Math.max(0, v);
          renderPreview();
        }, 1)));
        content.appendChild(createField("Border Color", createColorInput(imageStyles.borderColor || "#000000", (v) => {
          imageStyles.borderColor = v;
          renderPreview();
        })));
        content.appendChild(createField("Border Style", createSelect([
          { value: "solid", label: "Solid" },
          { value: "dashed", label: "Dashed" },
          { value: "dotted", label: "Dotted" }
        ], imageStyles.borderStyle || "solid", (v) => {
          imageStyles.borderStyle = v;
          renderPreview();
        })));
      }

      content.appendChild(createField("Radius Top Left", createStepper(imageStyles.borderRadiusCorners?.tl ?? imageStyles.borderRadius, (v) => {
        imageStyles.borderRadiusCorners.tl = Math.max(0, v);
        renderPreview();
      }, 1)));
      content.appendChild(createField("Radius Top Right", createStepper(imageStyles.borderRadiusCorners?.tr ?? imageStyles.borderRadius, (v) => {
        imageStyles.borderRadiusCorners.tr = Math.max(0, v);
        renderPreview();
      }, 1)));
      content.appendChild(createField("Radius Bottom Left", createStepper(imageStyles.borderRadiusCorners?.bl ?? imageStyles.borderRadius, (v) => {
        imageStyles.borderRadiusCorners.bl = Math.max(0, v);
        renderPreview();
      }, 1)));
      content.appendChild(createField("Radius Bottom Right", createStepper(imageStyles.borderRadiusCorners?.br ?? imageStyles.borderRadius, (v) => {
        imageStyles.borderRadiusCorners.br = Math.max(0, v);
        renderPreview();
      }, 1)));
    }, false));

    panel.appendChild(createAccordion("Background & Overlay", (content) => {
      content.appendChild(createField("Enable Background", createCheckbox(imageStyles.background?.enabled, (v) => {
        imageStyles.background.enabled = v;
        renderPreview();
      })));
      if (imageStyles.background?.enabled) {
        content.appendChild(createField("Background Type", createSelect([
          { value: "solid", label: "Solid" },
          { value: "gradient", label: "Gradient" }
        ], imageStyles.background.type || "solid", (v) => {
          imageStyles.background.type = v;
          renderPreview();
        })));
        if (imageStyles.background.type === "solid") {
          content.appendChild(createField("Color", createColorInput(imageStyles.background.color || "#ffffff", (v) => {
            imageStyles.background.color = v;
            renderPreview();
          })));
        }
        if (imageStyles.background.type === "gradient") {
          content.appendChild(createField("Gradient Start", createColorInput(imageStyles.background.gradientStart || "#ffffff", (v) => {
            imageStyles.background.gradientStart = v;
            renderPreview();
          })));
          content.appendChild(createField("Gradient End", createColorInput(imageStyles.background.gradientEnd || "#f8fafc", (v) => {
            imageStyles.background.gradientEnd = v;
            renderPreview();
          })));
          content.appendChild(createField("Gradient Angle", createStepper(imageStyles.background.gradientAngle ?? 90, (v) => {
            imageStyles.background.gradientAngle = v;
            renderPreview();
          }, 5)));
        }
      }

      content.appendChild(createField("Enable Overlay", createCheckbox(imageStyles.overlay?.enabled, (v) => {
        imageStyles.overlay.enabled = v;
        renderPreview();
      })));
      if (imageStyles.overlay?.enabled) {
        content.appendChild(createField("Overlay Type", createSelect([
          { value: "color", label: "Color" },
          { value: "gradient", label: "Gradient" }
        ], imageStyles.overlay.type || "color", (v) => {
          imageStyles.overlay.type = v;
          renderPreview();
        })));
        content.appendChild(createField("Overlay Color", createColorInput(imageStyles.overlay.color || "#000000", (v) => {
          imageStyles.overlay.color = v;
          renderPreview();
        })));
        content.appendChild(createField("Opacity", createRangeInput(imageStyles.overlay.opacity ?? 0.2, 0, 1, 0.05, (v) => {
          imageStyles.overlay.opacity = v;
          renderPreview();
        })));
      }
    }, false));

    panel.appendChild(createAccordion("Image Shadow", (content) => {
      content.appendChild(createField("Enable Shadow", createCheckbox(imageStyles.shadow?.enabled, (v) => {
        imageStyles.shadow.enabled = v;
        renderPreview();
      })));
      if (imageStyles.shadow?.enabled) {
        content.appendChild(createField("Shadow Color", createColorInput(imageStyles.shadow.color || "#000000", (v) => {
          imageStyles.shadow.color = v;
          renderPreview();
        })));
        content.appendChild(createField("Opacity", createRangeInput(imageStyles.shadow.opacity ?? 0.25, 0, 1, 0.05, (v) => {
          imageStyles.shadow.opacity = v;
          renderPreview();
        })));
        content.appendChild(createField("Blur", createStepper(imageStyles.shadow.blur ?? 8, (v) => {
          imageStyles.shadow.blur = Math.max(0, v);
          renderPreview();
        }, 1)));
        content.appendChild(createField("Spread", createStepper(imageStyles.shadow.spread ?? 0, (v) => {
          imageStyles.shadow.spread = v;
          renderPreview();
        }, 1)));
        content.appendChild(createField("Offset X", createStepper(imageStyles.shadow.offsetX ?? 0, (v) => {
          imageStyles.shadow.offsetX = v;
          renderPreview();
        }, 1)));
        content.appendChild(createField("Offset Y", createStepper(imageStyles.shadow.offsetY ?? 0, (v) => {
          imageStyles.shadow.offsetY = v;
          renderPreview();
        }, 1)));
        content.appendChild(createField("Intensity", createSelect([
          { value: "soft", label: "Soft" },
          { value: "medium", label: "Medium" },
          { value: "hard", label: "Hard" }
        ], imageStyles.shadow.intensity || "soft", (v) => {
          imageStyles.shadow.intensity = v;
          renderPreview();
        })));
      }
    }, false));

    panel.appendChild(createAccordion("Image Layout", (content) => {
      content.appendChild(createField("Width Mode", createSelect([
        { value: "auto", label: "Auto" },
        { value: "fixed", label: "Fixed" },
        { value: "fill", label: "Fill" }
      ], imageStyles.widthMode || "fixed", (v) => {
        imageStyles.widthMode = v;
        renderPreview();
      })));
      content.appendChild(createField("Height Mode", createSelect([
        { value: "auto", label: "Auto" },
        { value: "fixed", label: "Fixed" }
      ], imageStyles.heightMode || "fixed", (v) => {
        imageStyles.heightMode = v;
        renderPreview();
      })));
      content.appendChild(createField("Aspect Ratio Lock", createCheckbox(imageStyles.aspectRatioLocked, (v) => {
        imageStyles.aspectRatioLocked = v;
        renderPreview();
      })));
      content.appendChild(createField("Rotation", createStepper(imageStyles.rotation ?? 0, (v) => {
        imageStyles.rotation = v;
        renderPreview();
      }, 5)));
      content.appendChild(createField("Flip Horizontal", createCheckbox(imageStyles.flipHorizontal, (v) => {
        imageStyles.flipHorizontal = v;
        renderPreview();
      })));
      content.appendChild(createField("Flip Vertical", createCheckbox(imageStyles.flipVertical, (v) => {
        imageStyles.flipVertical = v;
        renderPreview();
      })));
      content.appendChild(createSpacingEditor("Padding", imageStyles.padding || { top: 0, right: 0, bottom: 0, left: 0 }, (k, v) => {
        imageStyles.padding[k] = v;
        renderPreview();
      }));
      content.appendChild(createSpacingEditor("Margin", imageStyles.margin || { top: 0, right: 0, bottom: 0, left: 0 }, (k, v) => {
        imageStyles.margin[k] = v;
        renderPreview();
      }));
    }, false));

    panel.appendChild(createAccordion("Image Filters", (content) => {
      content.appendChild(createField("Brightness", createRangeInput(imageStyles.filters.brightness ?? 1, 0, 2, 0.05, (v) => {
        imageStyles.filters.brightness = v;
        renderPreview();
      })));
      content.appendChild(createField("Contrast", createRangeInput(imageStyles.filters.contrast ?? 1, 0, 2, 0.05, (v) => {
        imageStyles.filters.contrast = v;
        renderPreview();
      })));
      content.appendChild(createField("Saturation", createRangeInput(imageStyles.filters.saturation ?? 1, 0, 2, 0.05, (v) => {
        imageStyles.filters.saturation = v;
        renderPreview();
      })));
      content.appendChild(createField("Blur", createRangeInput(imageStyles.filters.blur ?? 0, 0, 20, 1, (v) => {
        imageStyles.filters.blur = v;
        renderPreview();
      })));
      content.appendChild(createField("Grayscale", createRangeInput(imageStyles.filters.grayscale ?? 0, 0, 1, 0.05, (v) => {
        imageStyles.filters.grayscale = v;
        renderPreview();
      })));
      content.appendChild(createField("Sepia", createRangeInput(imageStyles.filters.sepia ?? 0, 0, 1, 0.05, (v) => {
        imageStyles.filters.sepia = v;
        renderPreview();
      })));
      content.appendChild(createField("Hue Rotate", createStepper(imageStyles.filters.hueRotate ?? 0, (v) => {
        imageStyles.filters.hueRotate = v;
        renderPreview();
      }, 15)));
    }, false));

    panel.appendChild(createAccordion("Interaction", (content) => {
      content.appendChild(createField("Clickable", createCheckbox(imageStyles.interaction?.clickable, (v) => {
        imageStyles.interaction.clickable = v;
        renderPreview();
      })));
      if (imageStyles.interaction?.clickable) {
        content.appendChild(createField("Link URL", createTextInput(imageStyles.interaction.href || "", (v) => {
          imageStyles.interaction.href = v;
          renderPreview();
        })));
        content.appendChild(createField("Hover Effect", createSelect([
          { value: "none", label: "None" },
          { value: "zoom", label: "Zoom" },
          { value: "glow", label: "Glow" }
        ], imageStyles.interaction.hoverEffect || "none", (v) => {
          imageStyles.interaction.hoverEffect = v;
          renderPreview();
        })));
        content.appendChild(createField("Zoom on Hover", createCheckbox(imageStyles.interaction.zoomOnHover, (v) => {
          imageStyles.interaction.zoomOnHover = v;
          renderPreview();
        })));
      }
    }, false));

    panel.appendChild(createAccordion("Advanced", (content) => {
      content.appendChild(createField("Lazy load", createCheckbox(imageStyles.lazyLoad, (v) => {
        imageStyles.lazyLoad = v;
        renderPreview();
      })));
      content.appendChild(createField("Image visible on desktop", createCheckbox(imageStyles.visibleOn.desktop, (v) => {
        imageStyles.visibleOn.desktop = v;
        renderPreview();
      })));
      content.appendChild(createField("Image visible on tablet", createCheckbox(imageStyles.visibleOn.tablet, (v) => {
        imageStyles.visibleOn.tablet = v;
        renderPreview();
      })));
      content.appendChild(createField("Image visible on mobile", createCheckbox(imageStyles.visibleOn.mobile, (v) => {
        imageStyles.visibleOn.mobile = v;
        renderPreview();
      })));
      content.appendChild(createField("Animation", createCheckbox(imageStyles.animation?.enabled, (v) => {
        imageStyles.animation.enabled = v;
        renderPreview();
      })));
      if (imageStyles.animation?.enabled) {
        content.appendChild(createField("Type", createSelect([
          { value: "none", label: "None" },
          { value: "fade", label: "Fade" },
          { value: "slide", label: "Slide" },
          { value: "zoom", label: "Zoom" },
          { value: "rotate", label: "Rotate" },
          { value: "float", label: "Floating" }
        ], imageStyles.animation.type || "none", (v) => {
          imageStyles.animation.type = v;
          renderPreview();
        })));
        content.appendChild(createField("Duration", createStepper(imageStyles.animation.duration ?? 1000, (v) => {
          imageStyles.animation.duration = Math.max(100, v);
          renderPreview();
        }, 100)));
        content.appendChild(createField("Delay", createStepper(imageStyles.animation.delay ?? 0, (v) => {
          imageStyles.animation.delay = Math.max(0, v);
          renderPreview();
        }, 100)));
        content.appendChild(createField("Loop", createCheckbox(imageStyles.animation.loop, (v) => {
          imageStyles.animation.loop = v;
          renderPreview();
        })));
      }
    }, false));
  }

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

  // Add shadow customization for containers
  if (node.type === "container") {
    panel.appendChild(createAccordion("Shadow Settings", (content) => {
      // Initialize shadow if not exists
      if (!node.styles.shadow) {
        node.styles.shadow = {
          enabled: false,
          color: "#000000",
          opacity: 0.25,
          blur: 8,
          spread: 0,
          offsetX: 0,
          offsetY: 4,
          insetEnabled: false,
          insetBlur: 0,
          insetOffsetX: 0,
          insetOffsetY: 0,
          multiShadows: [],
          glowEnabled: false,
          glowColor: "#ffffff",
          glowBlur: 0,
          glowSpread: 0,
          presetType: "none",
          intensity: "medium"
        };
      }

      // 1. Shadow Enable/Disable
      content.appendChild(createField("Enable Shadow", createCheckbox(node.styles.shadow.enabled, (v) => {
        node.styles.shadow.enabled = v;
        renderPreview();
      })));

      if (node.styles.shadow.enabled) {
        // 2. Horizontal Shadow Position
        content.appendChild(createField("Horizontal Offset", createStepper(node.styles.shadow.offsetX ?? 0, (v) => {
          node.styles.shadow.offsetX = v;
          renderPreview();
        }, 1)));

        // 3. Vertical Shadow Position
        content.appendChild(createField("Vertical Offset", createStepper(node.styles.shadow.offsetY ?? 4, (v) => {
          node.styles.shadow.offsetY = v;
          renderPreview();
        }, 1)));

        // 4. Blur Settings
        content.appendChild(createField("Blur Radius", createStepper(node.styles.shadow.blur ?? 8, (v) => {
          node.styles.shadow.blur = Math.max(0, v);
          renderPreview();
        }, 1)));

        // 5. Spread Settings
        content.appendChild(createField("Spread Radius", createStepper(node.styles.shadow.spread ?? 0, (v) => {
          node.styles.shadow.spread = v;
          renderPreview();
        }, 1)));

        // 6. Shadow Color
        content.appendChild(createField("Shadow Color", createColorInput(node.styles.shadow.color ?? "#000000", (v) => {
          node.styles.shadow.color = v;
          renderPreview();
        })));

        // 7. Shadow Opacity
        const opacityInput = document.createElement("input");
        opacityInput.type = "range";
        opacityInput.min = "0";
        opacityInput.max = "1";
        opacityInput.step = "0.05";
        opacityInput.value = node.styles.shadow.opacity ?? 0.25;
        opacityInput.addEventListener("input", (e) => {
          node.styles.shadow.opacity = parseFloat(e.target.value);
          renderPreview();
        });
        content.appendChild(createField("Shadow Opacity", opacityInput));

        // 8. Shadow Intensity
        content.appendChild(createField("Shadow Intensity", createSelect([
          { value: "light", label: "Light Shadow" },
          { value: "medium", label: "Medium Shadow" },
          { value: "strong", label: "Strong Shadow" }
        ], node.styles.shadow.intensity ?? "medium", (v) => {
          node.styles.shadow.intensity = v;
          if (v === "light") {
            node.styles.shadow.blur = 4;
            node.styles.shadow.spread = 0;
            node.styles.shadow.opacity = 0.1;
          } else if (v === "medium") {
            node.styles.shadow.blur = 8;
            node.styles.shadow.spread = 0;
            node.styles.shadow.opacity = 0.25;
          } else if (v === "strong") {
            node.styles.shadow.blur = 16;
            node.styles.shadow.spread = 4;
            node.styles.shadow.opacity = 0.4;
          }
          renderPreview();
        })));

        // 10. Inner Shadow
        content.appendChild(createField("Enable Inner Shadow", createCheckbox(node.styles.shadow.insetEnabled, (v) => {
          node.styles.shadow.insetEnabled = v;
          renderPreview();
        })));

        if (node.styles.shadow.insetEnabled) {
          content.appendChild(createField("Inner Shadow Blur", createStepper(node.styles.shadow.insetBlur ?? 0, (v) => {
            node.styles.shadow.insetBlur = Math.max(0, v);
            renderPreview();
          }, 1)));

          content.appendChild(createField("Inner Shadow Offset X", createStepper(node.styles.shadow.insetOffsetX ?? 0, (v) => {
            node.styles.shadow.insetOffsetX = v;
            renderPreview();
          }, 1)));

          content.appendChild(createField("Inner Shadow Offset Y", createStepper(node.styles.shadow.insetOffsetY ?? 0, (v) => {
            node.styles.shadow.insetOffsetY = v;
            renderPreview();
          }, 1)));
        }

        // 11. Glow Effect
        content.appendChild(createField("Enable Glow", createCheckbox(node.styles.shadow.glowEnabled, (v) => {
          node.styles.shadow.glowEnabled = v;
          renderPreview();
        })));

        if (node.styles.shadow.glowEnabled) {
          content.appendChild(createField("Glow Color", createColorInput(node.styles.shadow.glowColor ?? "#ffffff", (v) => {
            node.styles.shadow.glowColor = v;
            renderPreview();
          })));

          content.appendChild(createField("Glow Blur", createStepper(node.styles.shadow.glowBlur ?? 0, (v) => {
            node.styles.shadow.glowBlur = Math.max(0, v);
            renderPreview();
          }, 1)));

          content.appendChild(createField("Glow Spread", createStepper(node.styles.shadow.glowSpread ?? 0, (v) => {
            node.styles.shadow.glowSpread = v;
            renderPreview();
          }, 1)));
        }

        // 13. Shadow Style Presets
        content.appendChild(createField("Preset Style", createSelect([
          { value: "none", label: "Custom" },
          { value: "soft", label: "Soft Shadow" },
          { value: "hard", label: "Hard Shadow" },
          { value: "floating", label: "Floating Shadow" },
          { value: "neumorphism", label: "Neumorphism Shadow" },
          { value: "material", label: "Material Shadow" }
        ], node.styles.shadow.presetType ?? "none", (v) => {
          node.styles.shadow.presetType = v;
          if (v === "soft") {
            node.styles.shadow.blur = 12;
            node.styles.shadow.spread = 0;
            node.styles.shadow.offsetX = 0;
            node.styles.shadow.offsetY = 4;
            node.styles.shadow.opacity = 0.08;
          } else if (v === "hard") {
            node.styles.shadow.blur = 0;
            node.styles.shadow.spread = 0;
            node.styles.shadow.offsetX = 2;
            node.styles.shadow.offsetY = 2;
            node.styles.shadow.opacity = 0.5;
          } else if (v === "floating") {
            node.styles.shadow.blur = 24;
            node.styles.shadow.spread = 8;
            node.styles.shadow.offsetX = 0;
            node.styles.shadow.offsetY = 8;
            node.styles.shadow.opacity = 0.3;
          } else if (v === "neumorphism") {
            node.styles.shadow.blur = 16;
            node.styles.shadow.spread = -2;
            node.styles.shadow.offsetX = -4;
            node.styles.shadow.offsetY = -4;
            node.styles.shadow.opacity = 0.25;
          } else if (v === "material") {
            node.styles.shadow.blur = 8;
            node.styles.shadow.spread = 0;
            node.styles.shadow.offsetX = 0;
            node.styles.shadow.offsetY = 4;
            node.styles.shadow.opacity = 0.2;
          }
          renderPreview();
        })));
      }

      const hint = document.createElement("p");
      hint.className = "inspector-note";
      hint.textContent = "Configure shadow effects for the container";
      content.appendChild(hint);
    }, false));
  }

  // Add components section for containers
  if (node.type === "container" && node.children?.length > 0) {
    panel.appendChild(createAccordion("Components", (content) => {
      const listContainer = document.createElement("div");
      listContainer.style.display = "flex";
      listContainer.style.flexDirection = "column";
      listContainer.style.gap = "8px";

      node.children.forEach((child) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.style.padding = "8px 12px";
        btn.style.textAlign = "left";
        btn.style.backgroundColor = "#f3f4f6";
        btn.style.border = "1px solid #d1d5db";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "14px";
        btn.style.transition = "all 0.2s";
        btn.textContent = `${child.type} ${child.props?.text || child.props?.value || child.props?.placeholder || ""}`.trim();
        
        btn.addEventListener("mouseover", () => {
          btn.style.backgroundColor = "#e5e7eb";
        });
        btn.addEventListener("mouseout", () => {
          btn.style.backgroundColor = "#f3f4f6";
        });
        
        btn.addEventListener("click", () => {
          AppState.selectedId = child.id;
          AppState.selectedType = "component";
          StateUtils.bringToFront(child);
          Builder.refreshAll();
        });

        listContainer.appendChild(btn);
      });

      content.appendChild(listContainer);
    }, false));
  }

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
