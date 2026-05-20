window.ImageComponent.buildInspector = function(panel, node) {
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
  panel.appendChild(fileInput);

  panel.appendChild(createAccordion("Image Source", (content) => {
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
  }, true));

  panel.appendChild(createAccordion("Fit & Size", (content) => {
    content.appendChild(createField("Object Fit", createSelect([
      { value: "cover", label: "Cover" },
      { value: "contain", label: "Contain" },
      { value: "fill", label: "Fill" },
      { value: "none", label: "None" },
      { value: "scale-down", label: "Scale Down" }
    ], node.styles.objectFit || "cover", (v) => {
      node.styles.objectFit = v;
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

    content.appendChild(createField("Height Mode", createSelect([
      { value: "auto", label: "Auto" },
      { value: "fixed", label: "Fixed" },
      { value: "fill", label: "Fill" }
    ], node.styles.heightMode || "auto", (v) => {
      node.styles.heightMode = v;
      renderPreview();
    })));
  }, false));

  panel.appendChild(createAccordion("Border & Radius", (content) => {
    content.appendChild(createField("Enable Border", createCheckbox(node.styles.borderEnabled, (v) => {
      node.styles.borderEnabled = v;
      renderPreview();
    })));

    if (node.styles.borderEnabled) {
      content.appendChild(createField("Border Width", createStepper(node.styles.borderWidth ?? 0, (v) => {
        node.styles.borderWidth = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Border Color", createColorInput(node.styles.borderColor || '#e5e7eb', (v) => {
        node.styles.borderColor = v;
        renderPreview();
      })));
    }

    content.appendChild(createField("Border Radius", createStepper(node.styles.borderRadius ?? 0, (v) => {
      node.styles.borderRadius = v;
      renderPreview();
    }, 1)));
  }, false));

  panel.appendChild(createAccordion("Shadow", (content) => {
    content.appendChild(createField("Enable Shadow", createCheckbox(node.styles.shadow?.enabled, (v) => {
      if (!node.styles.shadow) node.styles.shadow = {};
      node.styles.shadow.enabled = v;
      renderPreview();
    })));

    if (node.styles.shadow?.enabled) {
      content.appendChild(createField("Shadow Color", createColorInput(node.styles.shadow.color || '#000000', (v) => {
        node.styles.shadow.color = v;
        renderPreview();
      })));
      content.appendChild(createField("Opacity", createRangeInput(node.styles.shadow.opacity ?? 0.12, 0, 1, 0.01, (v) => {
        node.styles.shadow.opacity = v;
        renderPreview();
      })));
      content.appendChild(createField("Blur", createStepper(node.styles.shadow.blur ?? 8, (v) => {
        node.styles.shadow.blur = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Offset X", createStepper(node.styles.shadow.offsetX ?? 0, (v) => {
        node.styles.shadow.offsetX = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Offset Y", createStepper(node.styles.shadow.offsetY ?? 2, (v) => {
        node.styles.shadow.offsetY = v;
        renderPreview();
      }, 1)));
    }
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
};
