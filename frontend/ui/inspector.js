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
