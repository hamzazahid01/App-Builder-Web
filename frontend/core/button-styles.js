window.ButtonStyles = {
  FONT_OPTIONS: [
    "Inter", "Arial", "Helvetica", "Georgia", "Times New Roman",
    "Verdana", "Tahoma", "Trebuchet MS", "Courier New", "Roboto"
  ],

  ensure(component) {
    if (component.type !== "button") return;
    const s = component.styles;
    if (!s.padding) s.padding = { top: 10, right: 16, bottom: 10, left: 16 };
    if (!s.fontStyle) s.fontStyle = { bold: true, italic: false, underline: false, lineThrough: false };
    if (!s.borderRadiusCorners) {
      const r = s.borderRadius ?? 10;
      s.borderRadiusCorners = { tl: r, tr: r, bl: r, br: r };
    }
    if (!s.shadow) {
      s.shadow = { enabled: false, color: "#000000", opacity: 0.25, blur: 8, spread: 0, offsetX: 0, offsetY: 4 };
    }
    if (s.backgroundType === undefined) s.backgroundType = "solid";
    if (s.textAlign === undefined) s.textAlign = "center";
    if (s.fontFamily === undefined) s.fontFamily = "Inter";
    if (s.fontScale === undefined) s.fontScale = 1;
    if (s.widthMode === undefined) s.widthMode = "fill";
    if (s.heightMode === undefined) s.heightMode = "fill";
    if (!component.props.action && component.props.onClick) {
      component.props.action = { ...component.props.onClick };
    }
    if (!component.props.action) {
      component.props.action = { type: "none", targetPageId: "", url: "", dialogText: "Hello", customCode: "" };
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
