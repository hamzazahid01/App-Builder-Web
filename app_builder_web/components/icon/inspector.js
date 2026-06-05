window.IconComponent.buildInspector = function(panel, node) {
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
    content.appendChild(createField("Symbol / Emoji", createTextInput(iconProps.symbol || "", (v) => {
      iconProps.symbol = v;
      renderPreview();
    })));

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

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.appendChild(createButton("Upload SVG", () => svgInput.click()));
    actions.appendChild(createButton("Upload Image", () => imgInput.click()));
    actions.appendChild(createButton("Clear", () => { iconProps.svg = null; iconProps.src = null; renderPreview(); }));
    content.appendChild(actions);
  }, false));

  // Style
  panel.appendChild(createAccordion("Style", (content) => {
    content.appendChild(createField("Color", createColorInput(iconStyles.color || '#1f2937', (v) => {
      iconStyles.color = v;
      renderPreview();
    })));
    content.appendChild(createField("Use Gradient", createCheckbox(iconStyles.gradient?.enabled, (v) => {
      if (!iconStyles.gradient) iconStyles.gradient = {};
      iconStyles.gradient.enabled = v;
      renderPreview();
    })));
    if (iconStyles.gradient?.enabled) {
      content.appendChild(createField("Gradient Start", createColorInput(iconStyles.gradient.start || '#111827', (v) => {
        iconStyles.gradient.start = v;
        renderPreview();
      })));
      content.appendChild(createField("Gradient End", createColorInput(iconStyles.gradient.end || '#2563eb', (v) => {
        iconStyles.gradient.end = v;
        renderPreview();
      })));
    }
    content.appendChild(createField("Size", createRangeInput(iconStyles.fontSize ?? 24, 8, 256, 1, (v) => {
      iconStyles.fontSize = v;
      renderPreview();
    })));
    content.appendChild(createField("Opacity", createRangeInput(iconStyles.opacity ?? 1, 0, 1, 0.01, (v) => {
      iconStyles.opacity = v;
      renderPreview();
    })));
    content.appendChild(createField("Rotation", createStepper(iconStyles.rotation ?? 0, (v) => {
      iconStyles.rotation = v;
      renderPreview();
    }, 5)));
    content.appendChild(createField("Flip Horizontal", createCheckbox(iconStyles.flipHorizontal, (v) => {
      iconStyles.flipHorizontal = v;
      renderPreview();
    })));
    content.appendChild(createField("Flip Vertical", createCheckbox(iconStyles.flipVertical, (v) => {
      iconStyles.flipVertical = v;
      renderPreview();
    })));
  }, false));

  // Background & Border
  panel.appendChild(createAccordion("Background & Border", (content) => {
    content.appendChild(createField("Enable Background", createCheckbox(iconStyles.background?.enabled, (v) => {
      if (!iconStyles.background) iconStyles.background = {};
      iconStyles.background.enabled = v;
      renderPreview();
    })));
    if (iconStyles.background?.enabled) content.appendChild(createField("Background Color", createColorInput(iconStyles.background.color || '#ffffff', (v) => {
      iconStyles.background.color = v;
      renderPreview();
    })));
    content.appendChild(createField("Enable Border", createCheckbox(iconStyles.borderEnabled, (v) => {
      iconStyles.borderEnabled = v;
      renderPreview();
    })));
    if (iconStyles.borderEnabled) {
      content.appendChild(createField("Border Width", createStepper(iconStyles.borderWidth ?? 1, (v) => {
        iconStyles.borderWidth = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Border Color", createColorInput(iconStyles.borderColor || '#e5e7eb', (v) => {
        iconStyles.borderColor = v;
        renderPreview();
      })));
      content.appendChild(createField("Border Style", createSelect([
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' }
      ], iconStyles.borderStyle || 'solid', (v) => {
        iconStyles.borderStyle = v;
        renderPreview();
      })));
    }
    content.appendChild(createSpacingEditor('Padding', iconStyles.padding || { top: 6, right: 6, bottom: 6, left: 6 }, (k, v) => {
      iconStyles.padding[k] = v;
      renderPreview();
    }));
    content.appendChild(createField("Border Radius", createStepper(iconStyles.borderRadius ?? 8, (v) => {
      iconStyles.borderRadius = v;
      renderPreview();
    }, 1)));
  }, false));

  // Shadow
  panel.appendChild(createAccordion("Shadow", (content) => {
    content.appendChild(createField("Enable Shadow", createCheckbox(iconStyles.shadow?.enabled, (v) => {
      if (!iconStyles.shadow) iconStyles.shadow = {};
      iconStyles.shadow.enabled = v;
      renderPreview();
    })));
    if (iconStyles.shadow?.enabled) {
      content.appendChild(createField("Shadow Color", createColorInput(iconStyles.shadow.color || '#000000', (v) => {
        iconStyles.shadow.color = v;
        renderPreview();
      })));
      content.appendChild(createField("Opacity", createRangeInput(iconStyles.shadow.opacity ?? 0.12, 0, 1, 0.01, (v) => {
        iconStyles.shadow.opacity = v;
        renderPreview();
      })));
      content.appendChild(createField("Blur", createStepper(iconStyles.shadow.blur ?? 8, (v) => {
        iconStyles.shadow.blur = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Offset X", createStepper(iconStyles.shadow.offsetX ?? 0, (v) => {
        iconStyles.shadow.offsetX = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Offset Y", createStepper(iconStyles.shadow.offsetY ?? 2, (v) => {
        iconStyles.shadow.offsetY = v;
        renderPreview();
      }, 1)));
    }
  }, false));

  // Layout
  panel.appendChild(createAccordion("Layout", (content) => {
    content.appendChild(createField("Width Mode", createSelect([
      { value: 'auto', label: 'Auto' },
      { value: 'fixed', label: 'Fixed' }
    ], iconStyles.widthMode || 'auto', (v) => {
      iconStyles.widthMode = v;
      renderPreview();
    })));
    content.appendChild(createField("Height Mode", createSelect([
      { value: 'auto', label: 'Auto' },
      { value: 'fixed', label: 'Fixed' }
    ], iconStyles.heightMode || 'auto', (v) => {
      iconStyles.heightMode = v;
      renderPreview();
    })));
    content.appendChild(createField("Alignment", createSelect([
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' }
    ], iconStyles.align || 'center', (v) => {
      iconStyles.align = v;
      renderPreview();
    })));
    content.appendChild(createSpacingEditor('Margin', iconStyles.margin || { top: 0, right: 0, bottom: 0, left: 0 }, (k, v) => {
      iconStyles.margin[k] = v;
      renderPreview();
    }));
  }, false));

  // Action
  panel.appendChild(createAccordion("Action", (content) => {
    appendActionSettings(content, node, action);
  }, false));
};
