window.TextComponent.buildInspector = function(panel, node) {
  let action = node.props.action || {
    type: "none",
    targetPageId: AppState?.app?.initialPageId || "",
    url: "",
    dialogText: "Message",
    customCode: ""
  };
  node.props.action = action;

  panel.appendChild(createAccordion("Content", (content) => {
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
      // Reset manual resize flag and auto-size text component based on content
      node.styles.manuallyResized = false;
      const dimensions = CanvasUtils.measureTextDimensions(node.props.value, node.styles);
      node.layout.width = dimensions.width;
      node.layout.height = dimensions.height;
      renderPreview();
    });
    content.appendChild(createField("Text Content", textArea));

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
        // Auto-size text component when text type changes (only if not manually resized)
        if (!node.styles.manuallyResized) {
          const dimensions = CanvasUtils.measureTextDimensions(node.props.value, node.styles);
          node.layout.width = dimensions.width;
          node.layout.height = dimensions.height;
        }
      }
      renderPreview();
    })));
  }, true));

  panel.appendChild(createAccordion("Typography", (content) => {
    content.appendChild(createField("Font", createFontPicker(node.styles.fontFamily || "Inter", (v) => {
      node.styles.fontFamily = v;
      // Auto-size text component when font family changes (only if not manually resized)
      if (!node.styles.manuallyResized) {
        const dimensions = CanvasUtils.measureTextDimensions(node.props.value, node.styles);
        node.layout.width = dimensions.width;
        node.layout.height = dimensions.height;
      }
      renderPreview();
    })));

    const fontSizeWrapper = document.createElement("div");
    fontSizeWrapper.style.display = "flex";
    fontSizeWrapper.style.alignItems = "center";
    fontSizeWrapper.style.gap = "8px";
    const fontSizeSlider = createRangeInput(node.styles.fontSize || 16, 8, 72, 1, (v) => {
      node.styles.fontSize = Math.max(8, Math.round(v));
      fontSizeStepper.querySelector("input").value = node.styles.fontSize;
      // Auto-size text component when font size changes (only if not manually resized)
      if (!node.styles.manuallyResized) {
        const dimensions = CanvasUtils.measureTextDimensions(node.props.value, node.styles);
        node.layout.width = dimensions.width;
        node.layout.height = dimensions.height;
      }
      renderPreview();
    });
    const fontSizeStepper = createStepper(node.styles.fontSize || 16, (v) => {
      node.styles.fontSize = Math.max(8, v);
      fontSizeSlider.value = node.styles.fontSize;
      // Auto-size text component when font size changes via stepper (only if not manually resized)
      if (!node.styles.manuallyResized) {
        const dimensions = CanvasUtils.measureTextDimensions(node.props.value, node.styles);
        node.layout.width = dimensions.width;
        node.layout.height = dimensions.height;
      }
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
      // Auto-size text component when line height changes (only if not manually resized)
      if (!node.styles.manuallyResized) {
        const dimensions = CanvasUtils.measureTextDimensions(node.props.value, node.styles);
        node.layout.width = dimensions.width;
        node.layout.height = dimensions.height;
      }
      renderPreview();
    }, 0.1)));

    content.appendChild(createField("Letter Spacing", createStepper(node.styles.letterSpacing || 0, (v) => {
      node.styles.letterSpacing = v;
      // Auto-size text component when letter spacing changes (only if not manually resized)
      if (!node.styles.manuallyResized) {
        const dimensions = CanvasUtils.measureTextDimensions(node.props.value, node.styles);
        node.layout.width = dimensions.width;
        node.layout.height = dimensions.height;
      }
      renderPreview();
    }, 0.5)));

    content.appendChild(createField("Word Spacing", createStepper(node.styles.wordSpacing || 0, (v) => {
      node.styles.wordSpacing = v;
      // Auto-size text component when word spacing changes (only if not manually resized)
      if (!node.styles.manuallyResized) {
        const dimensions = CanvasUtils.measureTextDimensions(node.props.value, node.styles);
        node.layout.width = dimensions.width;
        node.layout.height = dimensions.height;
      }
      renderPreview();
    }, 0.5)));
  }, false));

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

  panel.appendChild(createAccordion("Spacing", (content) => {
    content.appendChild(createSpacingEditor('Padding', node.styles.padding || { top: 0, right: 0, bottom: 0, left: 0 }, (k, v) => {
      node.styles.padding[k] = v;
      renderPreview();
    }));
    content.appendChild(createSpacingEditor('Margin', node.styles.margin || { top: 0, right: 0, bottom: 0, left: 0 }, (k, v) => {
      node.styles.margin[k] = v;
      renderPreview();
    }));
  }, false));

  panel.appendChild(createAccordion("Action", (content) => {
    appendActionSettings(content, node, action);
  }, false));
};
