window.ButtonComponent.buildInspector = function(panel, node) {
  ButtonStyles.ensure(node);
  const action = node.props.action || node.props.onClick;
  node.props.action = action;
  node.props.onClick = action;

  // Content Section
  panel.appendChild(createAccordion("Content", (content) => {
    content.appendChild(createField("Button Text", createTextInput(node.props.text, (v) => {
      node.props.text = v;
      renderPreview();
    })));
    
    content.appendChild(createField("Icon", createCheckbox(node.props.icon?.enabled, (v) => {
      if (!node.props.icon) node.props.icon = {};
      node.props.icon.enabled = v;
      Inspector.render();
    })));
    
    if (node.props.icon?.enabled) {
      content.appendChild(createField("Icon Symbol", createTextInput(node.props.icon.symbol || "", (v) => {
        node.props.icon.symbol = v;
        renderPreview();
      })));
      content.appendChild(createField("Icon Position", createSelect([
        { value: "left", label: "Left" },
        { value: "right", label: "Right" }
      ], node.props.icon.position || "left", (v) => {
        node.props.icon.position = v;
        renderPreview();
      })));
      content.appendChild(createField("Icon Size", createStepper(node.props.icon.size || 16, (v) => {
        node.props.icon.size = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Icon Color", createColorInput(node.props.icon.color || "", (v) => {
        node.props.icon.color = v;
        renderPreview();
      })));
    }
  }, true, "content"));

  // Typography Section
  panel.appendChild(createAccordion("Typography", (content) => {
    content.appendChild(createField("Font Family", createFontPicker(node.styles.fontFamily, (v) => {
      node.styles.fontFamily = v;
      renderPreview();
    })));
    
    content.appendChild(createField("Font Size", createStepper(node.styles.fontSize, (v) => {
      node.styles.fontSize = v;
      renderPreview();
    }, 1)));
    
    content.appendChild(createField("Font Weight", createSelect([
      { value: "400", label: "Regular" },
      { value: "500", label: "Medium" },
      { value: "600", label: "SemiBold" },
      { value: "700", label: "Bold" }
    ], node.styles.fontWeight || "600", (v) => {
      node.styles.fontWeight = v;
      renderPreview();
    })));
    
    const styleRow = document.createElement("div");
    styleRow.className = "style-chip-row";
    const fs = node.styles.fontStyle;
    styleRow.appendChild(createStyleToggle("B", fs.bold, (v) => { fs.bold = v; renderPreview(); }));
    styleRow.appendChild(createStyleToggle("I", fs.italic, (v) => { fs.italic = v; renderPreview(); }));
    styleRow.appendChild(createStyleToggle("U", fs.underline, (v) => { fs.underline = v; renderPreview(); }));
    styleRow.appendChild(createStyleToggle("S", fs.lineThrough, (v) => { fs.lineThrough = v; renderPreview(); }));
    content.appendChild(createField("Style", styleRow));
    
    content.appendChild(createField("Letter Spacing", createStepper(node.styles.letterSpacing || 0, (v) => {
      node.styles.letterSpacing = v;
      renderPreview();
    }, 0.5)));
    
    content.appendChild(createField("Line Height", createStepper(node.styles.lineHeight || 1.4, (v) => {
      node.styles.lineHeight = v;
      renderPreview();
    }, 0.1)));
    
    content.appendChild(createField("Text Align", createSelect([
      { value: "left", label: "Left" },
      { value: "center", label: "Center" },
      { value: "right", label: "Right" }
    ], node.styles.textAlign || "center", (v) => {
      node.styles.textAlign = v;
      renderPreview();
    })));
    
    // Text Effects
    content.appendChild(createField("Text Shadow", createCheckbox(node.styles.textShadow?.enabled, (v) => {
      if (!node.styles.textShadow) node.styles.textShadow = {};
      node.styles.textShadow.enabled = v;
      Inspector.render();
    })));
    
    if (node.styles.textShadow?.enabled) {
      content.appendChild(createField("Shadow Color", createColorInput(node.styles.textShadow.color || "#000000", (v) => {
        node.styles.textShadow.color = v;
        renderPreview();
      })));
      content.appendChild(createField("Blur", createStepper(node.styles.textShadow.blur || 4, (v) => {
        node.styles.textShadow.blur = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Offset X", createStepper(node.styles.textShadow.offsetX || 0, (v) => {
        node.styles.textShadow.offsetX = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Offset Y", createStepper(node.styles.textShadow.offsetY || 2, (v) => {
        node.styles.textShadow.offsetY = v;
        renderPreview();
      }, 1)));
    }
    
    content.appendChild(createField("Text Stroke", createCheckbox(node.styles.textStroke?.enabled, (v) => {
      if (!node.styles.textStroke) node.styles.textStroke = {};
      node.styles.textStroke.enabled = v;
      Inspector.render();
    })));
    
    if (node.styles.textStroke?.enabled) {
      content.appendChild(createField("Stroke Color", createColorInput(node.styles.textStroke.color || "#000000", (v) => {
        node.styles.textStroke.color = v;
        renderPreview();
      })));
      content.appendChild(createField("Stroke Width", createStepper(node.styles.textStroke.width || 1, (v) => {
        node.styles.textStroke.width = v;
        renderPreview();
      }, 0.5)));
    }
  }, false, "typography"));

  // Colors Section
  panel.appendChild(createAccordion("Colors", (content) => {
    content.appendChild(createField("Background Type", createSelect([
      { value: "solid", label: "Solid" },
      { value: "gradient", label: "Gradient" },
      { value: "transparent", label: "Transparent" }
    ], node.styles.backgroundType, (v) => {
      node.styles.backgroundType = v;
      renderPreview();
    })));
    
    if (node.styles.backgroundType === "solid" || node.styles.backgroundType === "transparent") {
      content.appendChild(createField("Background Color", createColorInput(node.styles.backgroundColor, (v) => {
        node.styles.backgroundColor = v;
        renderPreview();
      })));
    }
    
    if (node.styles.backgroundType === "gradient") {
      content.appendChild(createField("Gradient Start", createColorInput(node.styles.gradientStart, (v) => {
        node.styles.gradientStart = v;
        renderPreview();
      })));
      content.appendChild(createField("Gradient End", createColorInput(node.styles.gradientEnd, (v) => {
        node.styles.gradientEnd = v;
        renderPreview();
      })));
      content.appendChild(createField("Gradient Angle", createStepper(node.styles.gradientAngle || 90, (v) => {
        node.styles.gradientAngle = v;
        renderPreview();
      }, 5)));
    }
    
    content.appendChild(createField("Text Color", createColorInput(node.styles.textColor, (v) => {
      node.styles.textColor = v;
      renderPreview();
    })));
    
    content.appendChild(createField("Opacity", createRange((node.styles.opacity ?? 1) * 100, 0, 100, 1, (v) => {
      node.styles.opacity = v / 100;
      renderPreview();
    })));
    
    // Border
    content.appendChild(createField("Enable Border", createCheckbox(node.styles.borderEnabled, (v) => {
      node.styles.borderEnabled = v;
      renderPreview();
    })));
    
    if (node.styles.borderEnabled) {
      content.appendChild(createField("Border Width", createStepper(node.styles.borderWidth || 0, (v) => {
        node.styles.borderWidth = v;
        renderPreview();
      }, 1)));
      content.appendChild(createField("Border Color", createColorInput(node.styles.borderColor || "#000000", (v) => {
        node.styles.borderColor = v;
        renderPreview();
      })));
      content.appendChild(createField("Border Style", createSelect([
        { value: "solid", label: "Solid" },
        { value: "dashed", label: "Dashed" },
        { value: "dotted", label: "Dotted" }
      ], node.styles.borderStyle || "solid", (v) => {
        node.styles.borderStyle = v;
        renderPreview();
      })));
    }
    
    content.appendChild(createField("Border Radius", createStepper(node.styles.borderRadius, (v) => {
      node.styles.borderRadius = v;
      const c = node.styles.borderRadiusCorners;
      c.tl = c.tr = c.bl = c.br = v;
      renderPreview();
    })));
    
    // Shadow
    content.appendChild(createField("Shadow", createCheckbox(node.styles.shadow.enabled, (v) => {
      node.styles.shadow.enabled = v;
      renderPreview();
    })));
    
    if (node.styles.shadow.enabled) {
      content.appendChild(createField("Shadow Color", createColorInput(node.styles.shadow.color, (v) => {
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
    
    // Glow
    content.appendChild(createField("Glow Effect", createCheckbox(node.styles.glowEnabled, (v) => {
      node.styles.glowEnabled = v;
      renderPreview();
    })));
    
    if (node.styles.glowEnabled) {
      content.appendChild(createField("Glow Color", createColorInput(node.styles.glowColor || "#ffffff", (v) => {
        node.styles.glowColor = v;
        renderPreview();
      })));
      content.appendChild(createField("Glow Blur", createStepper(node.styles.glowBlur || 0, (v) => {
        node.styles.glowBlur = v;
        renderPreview();
      })));
    }
  }, false, "colors"));

  // States Section
  panel.appendChild(createAccordion("States", (content) => {
    content.appendChild(createField("Hover State", createCheckbox(node.styles.states?.hover?.scaleEnabled, (v) => {
      if (!node.styles.states) node.styles.states = {};
      if (!node.styles.states.hover) node.styles.states.hover = {};
      node.styles.states.hover.scaleEnabled = v;
      renderPreview();
    })));
    
    if (node.styles.states?.hover?.scaleEnabled) {
      content.appendChild(createField("Hover Scale", createStepper(node.styles.states.hover.scale || 1.05, (v) => {
        node.styles.states.hover.scale = v;
        renderPreview();
      }, 0.01)));
    }
    
    content.appendChild(createField("Active State", createCheckbox(node.styles.states?.active?.scaleEnabled, (v) => {
      if (!node.styles.states) node.styles.states = {};
      if (!node.styles.states.active) node.styles.states.active = {};
      node.styles.states.active.scaleEnabled = v;
      renderPreview();
    })));
    
    if (node.styles.states?.active?.scaleEnabled) {
      content.appendChild(createField("Active Scale", createStepper(node.styles.states.active.scale || 0.95, (v) => {
        node.styles.states.active.scale = v;
        renderPreview();
      }, 0.01)));
    }
    
    content.appendChild(createField("Disabled State", createCheckbox(node.styles.states?.disabled?.opacity !== undefined, (v) => {
      if (!node.styles.states) node.styles.states = {};
      if (!node.styles.states.disabled) node.styles.states.disabled = {};
      if (v) {
        node.styles.states.disabled.opacity = 0.6;
        node.styles.states.disabled.grayscale = true;
      } else {
        node.styles.states.disabled.opacity = 1;
        node.styles.states.disabled.grayscale = false;
      }
      renderPreview();
    }
  }, false, "states"));

  // Layout Section
  panel.appendChild(createAccordion("Layout", (content) => {
    content.appendChild(createSpacingEditor("Padding", node.styles.padding, (k, v) => {
      node.styles.padding[k] = v;
      renderPreview();
    })));
    
    content.appendChild(createSpacingEditor("Margin", node.styles.margin, (k, v) => {
      node.styles.margin[k] = v;
      renderPreview();
    })));
    
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
    
    content.appendChild(createField("Width Mode", createSelect([
      { value: "auto", label: "Auto" },
      { value: "fixed", label: "Fixed" },
      { value: "fill", label: "Fill" }
    ], node.styles.widthMode || "fill", (v) => {
      node.styles.widthMode = v;
      renderPreview();
    })));
    
    content.appendChild(createField("Height Mode", createSelect([
      { value: "auto", label: "Auto" },
      { value: "fixed", label: "Fixed" },
      { value: "fill", label: "Fill" }
    ], node.styles.heightMode || "fill", (v) => {
      node.styles.heightMode = v;
      renderPreview();
    })));
  }, false, "layout"));

  // Animation Section
  panel.appendChild(createAccordion("Animation", (content) => {
    content.appendChild(createField("Entrance Animation", createCheckbox(node.styles.animation?.enabled, (v) => {
      if (!node.styles.animation) node.styles.animation = {};
      node.styles.animation.enabled = v;
      Inspector.render();
    })));
    
    if (node.styles.animation?.enabled) {
      content.appendChild(createField("Animation Type", createSelect([
        { value: "none", label: "None" },
        { value: "fade", label: "Fade" },
        { value: "slide", label: "Slide" },
        { value: "scale", label: "Scale" },
        { value: "bounce", label: "Bounce" }
      ], node.styles.animation.type || "none", (v) => {
        node.styles.animation.type = v;
        renderPreview();
      })));
      content.appendChild(createField("Duration (ms)", createStepper(node.styles.animation.duration || 300, (v) => {
        node.styles.animation.duration = v;
        renderPreview();
      }, 50)));
      content.appendChild(createField("Delay (ms)", createStepper(node.styles.animation.delay || 0, (v) => {
        node.styles.animation.delay = v;
        renderPreview();
      }, 50)));
    }
    
    content.appendChild(createField("Hover Animation", createCheckbox(node.styles.hoverAnimation?.enabled, (v) => {
      if (!node.styles.hoverAnimation) node.styles.hoverAnimation = {};
      node.styles.hoverAnimation.enabled = v;
      Inspector.render();
    })));
    
    if (node.styles.hoverAnimation?.enabled) {
      content.appendChild(createField("Hover Animation Type", createSelect([
        { value: "none", label: "None" },
        { value: "scale", label: "Scale" },
        { value: "bounce", label: "Bounce" },
        { value: "shake", label: "Shake" }
      ], node.styles.hoverAnimation.type || "none", (v) => {
        node.styles.hoverAnimation.type = v;
        renderPreview();
      })));
    }
    
    content.appendChild(createField("Click Animation", createCheckbox(node.styles.clickAnimation?.enabled, (v) => {
      if (!node.styles.clickAnimation) node.styles.clickAnimation = {};
      node.styles.clickAnimation.enabled = v;
      Inspector.render();
    })));
    
    if (node.styles.clickAnimation?.enabled) {
      content.appendChild(createField("Click Animation Type", createSelect([
        { value: "ripple", label: "Ripple" },
        { value: "scale", label: "Scale" },
        { value: "bounce", label: "Bounce" }
      ], node.styles.clickAnimation.type || "ripple", (v) => {
        node.styles.clickAnimation.type = v;
        renderPreview();
      })));
    }
  }, false, "animation"));

  // Interaction Section
  panel.appendChild(createAccordion("Interaction", (content) => {
    content.appendChild(createField("Cursor", createSelect([
      { value: "pointer", label: "Pointer" },
      { value: "default", label: "Default" },
      { value: "not-allowed", label: "Not Allowed" }
    ], node.styles.cursor || "pointer", (v) => {
      node.styles.cursor = v;
      renderPreview();
    })));
    
    content.appendChild(createField("Tooltip", createCheckbox(node.styles.tooltip?.enabled, (v) => {
      if (!node.styles.tooltip) node.styles.tooltip = {};
      node.styles.tooltip.enabled = v;
      Inspector.render();
    })));
    
    if (node.styles.tooltip?.enabled) {
      content.appendChild(createField("Tooltip Text", createTextInput(node.styles.tooltip.text || "", (v) => {
        node.styles.tooltip.text = v;
        renderPreview();
      })));
      content.appendChild(createField("Tooltip Position", createSelect([
        { value: "top", label: "Top" },
        { value: "bottom", label: "Bottom" },
        { value: "left", label: "Left" },
        { value: "right", label: "Right" }
      ], node.styles.tooltip.position || "top", (v) => {
        node.styles.tooltip.position = v;
        renderPreview();
      })));
    }
    
    content.appendChild(createField("Aria Label", createTextInput(node.styles.ariaLabel || "", (v) => {
      node.styles.ariaLabel = v;
      renderPreview();
    })));
  }, false, "interaction"));

  // Responsive Section
  panel.appendChild(createAccordion("Responsive", (content) => {
    content.appendChild(createField("Enable Responsive", createCheckbox(node.styles.responsive?.enabled, (v) => {
      if (!node.styles.responsive) node.styles.responsive = {};
      node.styles.responsive.enabled = v;
      Inspector.render();
    })));
    
    if (node.styles.responsive?.enabled) {
      content.appendChild(createField("Mobile Scale", createRange((node.styles.responsive.mobileScale || 0.85) * 100, 50, 150, 1, (v) => {
        node.styles.responsive.mobileScale = v / 100;
        renderPreview();
      })));
      content.appendChild(createField("Tablet Scale", createRange((node.styles.responsive.tabletScale || 0.95) * 100, 50, 150, 1, (v) => {
        node.styles.responsive.tabletScale = v / 100;
        renderPreview();
      })));
    }
    
    content.appendChild(createField("Hide on Mobile", createCheckbox(node.styles.responsive?.hideOn?.mobile, (v) => {
      if (!node.styles.responsive) node.styles.responsive = {};
      if (!node.styles.responsive.hideOn) node.styles.responsive.hideOn = {};
      node.styles.responsive.hideOn.mobile = v;
      renderPreview();
    })));
    content.appendChild(createField("Hide on Tablet", createCheckbox(node.styles.responsive?.hideOn?.tablet, (v) => {
      if (!node.styles.responsive) node.styles.responsive = {};
      if (!node.styles.responsive.hideOn) node.styles.responsive.hideOn = {};
      node.styles.responsive.hideOn.tablet = v;
      renderPreview();
    })));
    content.appendChild(createField("Hide on Desktop", createCheckbox(node.styles.responsive?.hideOn?.desktop, (v) => {
      if (!node.styles.responsive) node.styles.responsive = {};
      if (!node.styles.responsive.hideOn) node.styles.responsive.hideOn = {};
      node.styles.responsive.hideOn.desktop = v;
      renderPreview();
    })));
  }, false, "responsive"));

  // Action Section
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
  }, false, "action"));
};
