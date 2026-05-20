window.InputComponent.buildInspector = function(panel, node) {
  const inputStyles = node.styles || {};
  const inputProps = node.props || {};

  // Basic props
  panel.appendChild(createAccordion("Basic", (content) => {
    content.appendChild(createField("Placeholder", createTextInput(inputProps.placeholder || "Enter text", (v) => {
      inputProps.placeholder = v;
      renderPreview();
    })));
    content.appendChild(createField("Input Type", createSelect([
      { value: "text", label: "Text" },
      { value: "textarea", label: "Text Area" },
      { value: "number", label: "Number" },
      { value: "email", label: "Email" },
      { value: "password", label: "Password" },
      { value: "select", label: "Dropdown" },
      { value: "checkbox", label: "Checkbox" },
      { value: "radio", label: "Radio" },
      { value: "file", label: "File Upload" },
      { value: "otp", label: "OTP" },
      { value: "range", label: "Range Slider" }
    ], inputProps.inputType || "text", (v) => {
      inputProps.inputType = v;
      renderPreview();
      Inspector.render();
    })));
  }, true));

  // Typography
  panel.appendChild(createAccordion("Typography", (content) => {
    content.appendChild(createField("Font Family", createFontPicker(inputStyles.fontFamily || "Inter", (v) => {
      inputStyles.fontFamily = v;
      renderPreview();
    })));
    content.appendChild(createField("Font Size", createStepper(inputStyles.fontSize ?? 14, (v) => {
      inputStyles.fontSize = v;
      renderPreview();
    }, 1)));
    content.appendChild(createField("Font Weight", createSelect([
      { value: "400", label: "Regular" },
      { value: "500", label: "Medium" },
      { value: "600", label: "SemiBold" },
      { value: "700", label: "Bold" }
    ], inputStyles.fontWeight || "400", (v) => {
      inputStyles.fontWeight = v;
      renderPreview();
    })));
    content.appendChild(createField("Text Color", createColorInput(inputStyles.color || '#0f172a', (v) => {
      inputStyles.color = v;
      renderPreview();
    })));
    content.appendChild(createField("Placeholder Color", createColorInput(inputStyles.placeholderColor || '#94a3b8', (v) => {
      inputStyles.placeholderColor = v;
      renderPreview();
    })));
  }, false));

  // Background
  panel.appendChild(createAccordion("Background", (content) => {
    content.appendChild(createField("Enable Background", createCheckbox(inputStyles.background?.enabled, (v) => {
      if (!inputStyles.background) inputStyles.background = {};
      inputStyles.background.enabled = v;
      renderPreview();
    })));
    if (inputStyles.background?.enabled) {
      content.appendChild(createField("Background Color", createColorInput(inputStyles.background.color || '#ffffff', (v) => {
        inputStyles.background.color = v;
        renderPreview();
      })));
    }
  }, false));

  // Border
  panel.appendChild(createAccordion("Border", (content) => {
    content.appendChild(createField("Enable Border", createCheckbox(inputStyles.borderEnabled, (v) => {
      inputStyles.borderEnabled = v;
      renderPreview();
    })));
    if (inputStyles.borderEnabled) {
      content.appendChild(createField("Border Width", createStepper(inputStyles.borderWidth ?? 1, (v) => {
        inputStyles.borderWidth = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Border Color", createColorInput(inputStyles.borderColor || '#cbd5e1', (v) => {
        inputStyles.borderColor = v;
        renderPreview();
      })));
      content.appendChild(createField("Border Style", createSelect([
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' }
      ], inputStyles.borderStyle || 'solid', (v) => {
        inputStyles.borderStyle = v;
        renderPreview();
      })));
    }
    content.appendChild(createField("Radius Top Left", createStepper(inputStyles.borderRadiusCorners?.tl ?? inputStyles.borderRadius, (v) => {
      inputStyles.borderRadiusCorners.tl = v;
      renderPreview();
    }, 1)));
    content.appendChild(createField("Radius Top Right", createStepper(inputStyles.borderRadiusCorners?.tr ?? inputStyles.borderRadius, (v) => {
      inputStyles.borderRadiusCorners.tr = v;
      renderPreview();
    }, 1)));
    content.appendChild(createField("Radius Bottom Left", createStepper(inputStyles.borderRadiusCorners?.bl ?? inputStyles.borderRadius, (v) => {
      inputStyles.borderRadiusCorners.bl = v;
      renderPreview();
    }, 1)));
    content.appendChild(createField("Radius Bottom Right", createStepper(inputStyles.borderRadiusCorners?.br ?? inputStyles.borderRadius, (v) => {
      inputStyles.borderRadiusCorners.br = v;
      renderPreview();
    }, 1)));
  }, false));

  // Shadow
  panel.appendChild(createAccordion("Shadow", (content) => {
    content.appendChild(createField("Enable Shadow", createCheckbox(inputStyles.shadow?.enabled, (v) => {
      if (!inputStyles.shadow) inputStyles.shadow = {};
      inputStyles.shadow.enabled = v;
      renderPreview();
    })));
    if (inputStyles.shadow?.enabled) {
      content.appendChild(createField("Shadow Color", createColorInput(inputStyles.shadow.color || '#000000', (v) => {
        inputStyles.shadow.color = v;
        renderPreview();
      })));
      content.appendChild(createField("Opacity", createRangeInput(inputStyles.shadow.opacity ?? 0.12, 0, 1, 0.01, (v) => {
        inputStyles.shadow.opacity = v;
        renderPreview();
      })));
      content.appendChild(createField("Blur", createStepper(inputStyles.shadow.blur ?? 8, (v) => {
        inputStyles.shadow.blur = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Offset X", createStepper(inputStyles.shadow.offsetX ?? 0, (v) => {
        inputStyles.shadow.offsetX = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Offset Y", createStepper(inputStyles.shadow.offsetY ?? 2, (v) => {
        inputStyles.shadow.offsetY = v;
        renderPreview();
      }, 1)));
    }
  }, false));

  // Layout
  panel.appendChild(createAccordion("Layout", (content) => {
    content.appendChild(createField("Width Mode", createSelect([
      { value: 'fixed', label: 'Fixed' },
      { value: 'auto', label: 'Auto' },
      { value: 'fill', label: 'Fill' }
    ], inputStyles.widthMode || 'fixed', (v) => {
      inputStyles.widthMode = v;
      renderPreview();
    })));
    content.appendChild(createField("Height Mode", createSelect([
      { value: 'fixed', label: 'Fixed' },
      { value: 'auto', label: 'Auto' }
    ], inputStyles.heightMode || 'fixed', (v) => {
      inputStyles.heightMode = v;
      renderPreview();
    })));
    content.appendChild(createField("Alignment", createSelect([
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' }
    ], inputStyles.align || 'left', (v) => {
      inputStyles.align = v;
      renderPreview();
    })));
    content.appendChild(createSpacingEditor('Padding', inputStyles.padding || { top: 8, right: 12, bottom: 8, left: 12 }, (k, v) => {
      inputStyles.padding[k] = v;
      renderPreview();
    }));
    content.appendChild(createSpacingEditor('Margin', inputStyles.margin || { top: 4, right: 0, bottom: 4, left: 0 }, (k, v) => {
      inputStyles.margin[k] = v;
      renderPreview();
    }));
  }, false));

  // Label & Helper
  panel.appendChild(createAccordion("Label & Helper", (content) => {
    content.appendChild(createField("Show Label", createCheckbox(inputStyles.label?.enabled, (v) => {
      if (!inputStyles.label) inputStyles.label = {};
      inputStyles.label.enabled = v;
      renderPreview();
    })));
    if (inputStyles.label?.enabled) {
      content.appendChild(createField("Label Text", createTextInput(inputStyles.label.text || 'Label', (v) => {
        inputStyles.label.text = v;
        renderPreview();
      })));
      content.appendChild(createField("Label Position", createSelect([
        { value: 'top', label: 'Top' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' }
      ], inputStyles.label.position || 'top', (v) => {
        inputStyles.label.position = v;
        renderPreview();
      })));
    }
    content.appendChild(createField("Helper Text", createTextInput(inputStyles.helperText?.text || '', (v) => {
      if (!inputStyles.helperText) inputStyles.helperText = {};
      inputStyles.helperText.text = v;
      renderPreview();
    })));
    content.appendChild(createField("Show Character Count", createCheckbox(inputStyles.helperText?.showCharCount, (v) => {
      if (!inputStyles.helperText) inputStyles.helperText = {};
      inputStyles.helperText.showCharCount = v;
      renderPreview();
    })));
  }, false));

  // Validation
  panel.appendChild(createAccordion("Validation", (content) => {
    content.appendChild(createField("Required", createCheckbox(inputStyles.validation?.required, (v) => {
      if (!inputStyles.validation) inputStyles.validation = {};
      inputStyles.validation.required = v;
      renderPreview();
    })));
    content.appendChild(createField("Min Length", createStepper(inputStyles.validation?.minLength ?? 0, (v) => {
      if (!inputStyles.validation) inputStyles.validation = {};
      inputStyles.validation.minLength = v || null;
      renderPreview();
    }, 1)));
    content.appendChild(createField("Max Length", createStepper(inputStyles.validation?.maxLength ?? 0, (v) => {
      if (!inputStyles.validation) inputStyles.validation = {};
      inputStyles.validation.maxLength = v || null;
      renderPreview();
    }, 1)));
    content.appendChild(createField("Pattern (regex)", createTextInput(inputStyles.validation?.pattern || '', (v) => {
      if (!inputStyles.validation) inputStyles.validation = {};
      inputStyles.validation.pattern = v;
      renderPreview();
    })));
    content.appendChild(createField("Error Message", createTextInput(inputStyles.validation?.customMessage || '', (v) => {
      if (!inputStyles.validation) inputStyles.validation = {};
      inputStyles.validation.customMessage = v;
      renderPreview();
    })));
  }, false));

  // Advanced
  panel.appendChild(createAccordion("Advanced", (content) => {
    content.appendChild(createField("Autocomplete", createCheckbox(inputStyles.autocomplete, (v) => {
      inputStyles.autocomplete = v;
      renderPreview();
    })));
    content.appendChild(createField("Read Only", createCheckbox(inputStyles.readonly, (v) => {
      inputStyles.readonly = v;
      renderPreview();
    })));
    content.appendChild(createField("Disabled", createCheckbox(inputStyles.disabled, (v) => {
      inputStyles.disabled = v;
      renderPreview();
    })));
    content.appendChild(createField("Character Limit", createStepper(inputStyles.characterLimit ?? 0, (v) => {
      inputStyles.characterLimit = v || null;
      renderPreview();
    }, 1)));
  }, false));
};
