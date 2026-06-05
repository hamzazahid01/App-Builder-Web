window.ButtonStyles = {
  FONT_OPTIONS: [
    "Inter", "Arial", "Helvetica", "Georgia", "Times New Roman",
    "Verdana", "Tahoma", "Trebuchet MS", "Courier New", "Roboto"
  ],

  ensure(component) {
    if (component.type !== "button") return;
    const s = component.styles;
    
    // Basic properties
    if (!s.padding) s.padding = { top: 10, right: 16, bottom: 10, left: 16 };
    if (!s.margin) s.margin = { top: 0, right: 0, bottom: 0, left: 0 };
    if (!s.fontStyle) s.fontStyle = { bold: true, italic: false, underline: false, lineThrough: false };
    if (!s.borderRadiusCorners) {
      const r = s.borderRadius ?? 10;
      s.borderRadiusCorners = { tl: r, tr: r, bl: r, br: r };
    }
    if (!s.shadow) {
      s.shadow = { enabled: false, color: "#000000", opacity: 0.25, blur: 8, spread: 0, offsetX: 0, offsetY: 4, insetEnabled: false, multiShadows: [] };
    }
    if (s.backgroundType === undefined) s.backgroundType = "solid";
    if (s.textAlign === undefined) s.textAlign = "center";
    if (s.fontFamily === undefined) s.fontFamily = "Inter";
    if (s.fontScale === undefined) s.fontScale = 1;
    if (s.widthMode === undefined) s.widthMode = "fill";
    if (s.heightMode === undefined) s.heightMode = "fill";
    
    // New typography properties
    if (s.fontWeight === undefined) s.fontWeight = "600";
    if (s.letterSpacing === undefined) s.letterSpacing = 0;
    if (s.lineHeight === undefined) s.lineHeight = 1.4;
    
    // Text effects
    if (!s.textShadow) s.textShadow = { enabled: false, color: "#000000", opacity: 0.25, blur: 4, offsetX: 0, offsetY: 2 };
    if (!s.textStroke) s.textStroke = { enabled: false, color: "#000000", width: 1, opacity: 1 };
    if (!s.textBackground) s.textBackground = { enabled: false, type: "solid", color: "#ffffff", opacity: 1, padding: { top: 4, right: 8, bottom: 4, left: 8 }, borderRadius: 4 };
    
    // Border properties
    if (s.borderEnabled === undefined) s.borderEnabled = false;
    if (s.borderWidth === undefined) s.borderWidth = 0;
    if (s.borderColor === undefined) s.borderColor = "#000000";
    if (s.borderStyle === undefined) s.borderStyle = "solid";
    
    // Glow
    if (s.glowEnabled === undefined) s.glowEnabled = false;
    if (s.glowColor === undefined) s.glowColor = "#ffffff";
    if (s.glowBlur === undefined) s.glowBlur = 0;
    if (s.glowSpread === undefined) s.glowSpread = 0;
    
    // States
    if (!s.states) {
      s.states = {
        normal: {},
        hover: { backgroundEnabled: false, backgroundColor: "#1d4ed8", scaleEnabled: false, scale: 1.05, shadowEnabled: false },
        active: { scaleEnabled: false, scale: 0.95, brightnessEnabled: false, brightness: 0.9 },
        disabled: { opacity: 0.6, grayscale: true },
        focus: { outlineEnabled: true, outlineColor: "#2563eb", outlineWidth: 2, ringEnabled: false, ringColor: "rgba(37, 99, 235, 0.3)", ringBlur: 4 }
      };
    }
    
    // Animation
    if (!s.animation) s.animation = { enabled: false, type: "none", duration: 300, delay: 0, easing: "ease", loop: false };
    if (!s.hoverAnimation) s.hoverAnimation = { enabled: false, type: "none", duration: 200 };
    if (!s.clickAnimation) s.clickAnimation = { enabled: false, type: "ripple", duration: 300 };
    
    // Interaction
    if (s.cursor === undefined) s.cursor = "pointer";
    if (!s.tooltip) s.tooltip = { enabled: false, text: "", position: "top" };
    
    // Responsive
    if (!s.responsive) s.responsive = { enabled: false, mobileScale: 0.85, tabletScale: 0.95, desktopScale: 1, hideOn: { mobile: false, tablet: false, desktop: false } };
    
    // Accessibility
    if (s.ariaLabel === undefined) s.ariaLabel = "";
    if (s.tabIndex === undefined) s.tabIndex = 0;
    if (s.keyboardShortcut === undefined) s.keyboardShortcut = "";
    if (s.screenReaderText === undefined) s.screenReaderText = "";
    
    // Icon props
    if (!component.props.icon) component.props.icon = { enabled: false, position: "left", symbol: "", svg: null, size: 16, color: "" };
    
    // Action props
    if (!component.props.action && component.props.onClick) {
      component.props.action = { ...component.props.onClick };
    }
    if (!component.props.action) {
      component.props.action = { type: "none", targetPageId: AppState?.app?.initialPageId || "", url: "", dialogText: "Message", customCode: "" };
    }
    if (!component.props.onClick) component.props.onClick = component.props.action;
  },

  computeFontSize(component) {
    if (component.styles.fontSizeManual && component.styles.fontSize) {
      return component.styles.fontSize;
    }
    const h = component.layout?.height ?? 44;
    const w = component.layout?.width ?? 130;
    const base = Math.min(h, w) * 0.34 * (component.styles.fontScale ?? 1);
    return Math.max(10, Math.min(36, Math.round(base)));
  },

  borderRadiusCss(component) {
    const c = component.styles.borderRadiusCorners;
    if (!c) return `${component.styles.borderRadius ?? 10}px`;
    return `${c.tl}px ${c.tr}px ${c.br}px ${c.bl}px`;
  },

  backgroundCss(component) {
    const s = component.styles;
    if (s.backgroundType === "transparent") return "transparent";
    if (s.backgroundType === "gradient") {
      return `linear-gradient(135deg, ${s.gradientStart || s.backgroundColor}, ${s.gradientEnd || "#1d4ed8"})`;
    }
    return s.backgroundColor || "#2563eb";
  },

  shadowCss(component) {
    const sh = component.styles.shadow;
    if (!sh?.enabled) return "none";
    const a = sh.opacity ?? 0.25;
    const hex = (sh.color || "#000000").replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16) || 0;
    const g = parseInt(hex.slice(2, 4), 16) || 0;
    const b = parseInt(hex.slice(4, 6), 16) || 0;
    return `${sh.offsetX ?? 0}px ${sh.offsetY ?? 4}px ${sh.blur ?? 8}px ${sh.spread ?? 0}px rgba(${r},${g},${b},${a})`;
  },

  applyToElement(el, component) {
    this.ensure(component);
    const s = component.styles;
    el.textContent = component.props.text || "Button";
    el.style.background = this.backgroundCss(component);
    el.style.color = s.textColor || "#ffffff";
    el.style.fontFamily = `"${s.fontFamily}", sans-serif`;
    el.style.fontSize = `${this.computeFontSize(component)}px`;
    el.style.fontWeight = s.fontStyle?.bold ? "700" : "400";
    el.style.fontStyle = s.fontStyle?.italic ? "italic" : "normal";
    el.style.textDecoration = [
      s.fontStyle?.underline ? "underline" : "",
      s.fontStyle?.lineThrough ? "line-through" : ""
    ].filter(Boolean).join(" ") || "none";
    el.style.textAlign = s.textAlign || "center";
    el.style.border = "none";
    el.style.borderRadius = this.borderRadiusCss(component);
    el.style.opacity = `${s.opacity ?? 1}`;
    el.style.boxShadow = this.shadowCss(component);
    el.style.padding = `${s.padding.top}px ${s.padding.right}px ${s.padding.bottom}px ${s.padding.left}px`;
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = s.textAlign === "left" ? "flex-start" : s.textAlign === "right" ? "flex-end" : "center";
    el.style.boxSizing = "border-box";
    el.style.cursor = AppState.runtimeMode ? "pointer" : "default";
    el.style.overflow = "hidden";
  }
};
