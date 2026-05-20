window.ButtonComponent.buildInspector = function(panel, node) {
  ButtonStyles.ensure(node);
  const action = node.props.action || node.props.onClick;
  node.props.action = action;
  node.props.onClick = action;

  panel.appendChild(createAccordion("Button Text", (content) => {
    content.appendChild(createField("Text", createTextInput(node.props.text, (v) => {
      node.props.text = v;
      renderPreview();
    })));
  }, true));

  panel.appendChild(createAccordion("Action", (content) => {
    content.appendChild(createField("When tapped", createSelect([
      { value: "none", label: "Nothing" },
      { value: "showDialog", label: "Show message" },
      { value: "openUrl", label: "Open website" },
      { value: "navigate", label: "Go to screen" },
      { value: "back", label: "Go back" }
    ], action.type || "none", (v) => {
      action.type = v;
      node.props.onClick = action;
      Inspector.render();
    })));
    if (action.type === "showDialog") {
      content.appendChild(createField("Message", createTextInput(action.dialogText, (v) => {
        action.dialogText = v;
        renderPreview();
      })));
    }
    if (action.type === "openUrl") {
      content.appendChild(createField("Website URL", createTextInput(action.url, (v) => {
        action.url = v;
      })));
    }
    if (action.type === "navigate") {
      const pages = AppState.app.pages.map((p) => ({ value: p.id, label: p.name }));
      if (pages.length) {
        content.appendChild(createField("Screen", createSelect(pages, action.targetPageId || pages[0].value, (v) => {
          action.targetPageId = v;
        })));
      }
    }
  }, false));

  panel.appendChild(createAccordion("Style", (content) => {
    content.appendChild(createField("Background type", createSelect([
      { value: "solid", label: "Solid color" },
      { value: "gradient", label: "Gradient" },
      { value: "transparent", label: "Transparent" }
    ], node.styles.backgroundType, (v) => {
      node.styles.backgroundType = v;
      renderPreview();
    })));
    if (node.styles.backgroundType === "solid" || node.styles.backgroundType === "transparent") {
      content.appendChild(createField("Background color", createColorInput(node.styles.backgroundColor, (v) => {
        node.styles.backgroundColor = v;
        renderPreview();
      })));
    }
    if (node.styles.backgroundType === "gradient") {
      content.appendChild(createField("Gradient start", createColorInput(node.styles.gradientStart, (v) => {
        node.styles.gradientStart = v;
        renderPreview();
      })));
      content.appendChild(createField("Gradient end", createColorInput(node.styles.gradientEnd, (v) => {
        node.styles.gradientEnd = v;
        renderPreview();
      })));
    }
    content.appendChild(createField("Text color", createColorInput(node.styles.textColor, (v) => {
      node.styles.textColor = v;
      renderPreview();
    })));
    content.appendChild(createField("Font", createFontGrid(node.styles.fontFamily, (v) => {
      node.styles.fontFamily = v;
      renderPreview();
      Inspector.render();
    })));
    const styleRow = document.createElement("div");
    styleRow.className = "style-chip-row";
    const fs = node.styles.fontStyle;
    styleRow.appendChild(createStyleToggle("B", fs.bold, (v) => { fs.bold = v; renderPreview(); }));
    styleRow.appendChild(createStyleToggle("I", fs.italic, (v) => { fs.italic = v; renderPreview(); }));
    styleRow.appendChild(createStyleToggle("U", fs.underline, (v) => { fs.underline = v; renderPreview(); }));
    styleRow.appendChild(createStyleToggle("S", fs.lineThrough, (v) => { fs.lineThrough = v; renderPreview(); }));
    content.appendChild(createField("Text style", styleRow));
    content.appendChild(createField("Opacity", createRange((node.styles.opacity ?? 1) * 100, 0, 100, 1, (v) => {
      node.styles.opacity = v / 100;
      renderPreview();
    })));
    content.appendChild(createField("Round corners", createStepper(node.styles.borderRadius, (v) => {
      node.styles.borderRadius = v;
      const c = node.styles.borderRadiusCorners;
      c.tl = c.tr = c.bl = c.br = v;
      renderPreview();
    })));
    content.appendChild(createField("Shadow", createCheckbox(node.styles.shadow.enabled, (v) => {
      node.styles.shadow.enabled = v;
      renderPreview();
    })));
    if (node.styles.shadow.enabled) {
      content.appendChild(createField("Shadow color", createColorInput(node.styles.shadow.color, (v) => {
        node.styles.shadow.color = v;
        renderPreview();
      })));
      content.appendChild(createField("Blur", createStepper(node.styles.shadow.blur, (v) => {
        node.styles.shadow.blur = v;
        renderPreview();
      })));
      content.appendChild(createField("Left/Right offset", createStepper(node.styles.shadow.offsetX, (v) => {
        node.styles.shadow.offsetX = v;
        renderPreview();
      })));
      content.appendChild(createField("Up/Down offset", createStepper(node.styles.shadow.offsetY, (v) => {
        node.styles.shadow.offsetY = v;
        renderPreview();
      })));
      content.appendChild(createField("Shadow strength", createRange((node.styles.shadow.opacity ?? 0.25) * 100, 0, 100, 1, (v) => {
        node.styles.shadow.opacity = v / 100;
        renderPreview();
      })));
    }
  }, false));

  panel.appendChild(createAccordion("Manual Layout", (content) => {
    content.appendChild(createField("Text align", createSelect([
      { value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }
    ], node.styles.textAlign, (v) => {
      node.styles.textAlign = v;
      renderPreview();
    })));
    content.appendChild(createSpacingEditor("Padding", node.styles.padding, (k, v) => {
      node.styles.padding[k] = v;
      renderPreview();
    }));
    if (node.layout) {
      content.appendChild(createField("Position X", createStepper(node.layout.x, (v) => {
        node.layout.x = Math.max(0, v);
        renderPreview();
      })));
      content.appendChild(createField("Position Y", createStepper(node.layout.y, (v) => {
        node.layout.y = Math.max(0, v);
        renderPreview();
      })));
      content.appendChild(createField("Width", createStepper(node.layout.width, (v) => {
        node.layout.width = Math.max(24, v);
        renderPreview();
      })));
      content.appendChild(createField("Height", createStepper(node.layout.height, (v) => {
        node.layout.height = Math.max(24, v);
        renderPreview();
      })));
    }
    content.appendChild(createField("Manual text size", createCheckbox(node.styles.fontSizeManual, (v) => {
      node.styles.fontSizeManual = v;
      Inspector.render();
    })));
    if (node.styles.fontSizeManual) {
      content.appendChild(createField("Text size", createStepper(node.styles.fontSize, (v) => {
        node.styles.fontSize = v;
        renderPreview();
      })));
    } else {
      const note = document.createElement("p");
      note.className = "inspector-note";
      note.textContent = "Text size button ke size ke sath automatically change hoti hai.";
      content.appendChild(note);
    }
  }, false));
};
