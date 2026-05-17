window.TextStyles = {
  FONT_OPTIONS: [
    "Inter", "Arial", "Helvetica", "Georgia", "Times New Roman",
    "Verdana", "Tahoma", "Trebuchet MS", "Courier New", "Roboto",
    "Open Sans", "Lato", "Montserrat", "Playfair Display", "Raleway"
  ],

  TEXT_TYPES: {
    "heading1": { fontSize: 32, fontWeight: 700, lineHeight: 1.2 },
    "heading2": { fontSize: 28, fontWeight: 600, lineHeight: 1.3 },
    "heading3": { fontSize: 24, fontWeight: 600, lineHeight: 1.4 },
    "paragraph": { fontSize: 16, fontWeight: 400, lineHeight: 1.6 },
    "caption": { fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
    "label": { fontSize: 14, fontWeight: 500, lineHeight: 1.5 },
    "small": { fontSize: 12, fontWeight: 400, lineHeight: 1.5 },
    "custom": { fontSize: 16, fontWeight: 400, lineHeight: 1.5 }
  },

  FONT_WEIGHTS: [
    { value: "100", label: "Thin" },
    { value: "300", label: "Light" },
    { value: "400", label: "Regular" },
    { value: "500", label: "Medium" },
    { value: "600", label: "Semi Bold" },
    { value: "700", label: "Bold" },
    { value: "800", label: "Extra Bold" }
  ],

  ensure(component) {
    if (component.type !== "text") return;
    const s = component.styles;

    // Text content
    if (!s.textType) s.textType = "custom";
    if (!s.value && !component.props.value) component.props.value = "Text";

    // Text styling
    if (s.fontSize === undefined) s.fontSize = 16;
    if (s.fontFamily === undefined) s.fontFamily = "Inter";
    if (s.fontWeight === undefined) s.fontWeight = "400";
    if (s.fontStyle === undefined) s.fontStyle = "normal"; // normal or italic
    if (s.color === undefined) s.color = "#111827";
    if (s.textOpacity === undefined) s.textOpacity = 1;
    if (s.textFillType === undefined) s.textFillType = "solid";
    if (!s.textGradient) s.textGradient = { angle: 90, start: "#111827", end: "#2563eb" };

    // Text decorations
    if (!s.textDecoration) s.textDecoration = { underline: false, overline: false, lineThrough: false };

    // Spacing
    if (s.letterSpacing === undefined) s.letterSpacing = 0;
    if (s.lineHeight === undefined) s.lineHeight = 1.5;
    if (s.wordSpacing === undefined) s.wordSpacing = 0;

    // Alignment
    if (s.textAlign === undefined) s.textAlign = "left";
    if (s.verticalAlign === undefined) s.verticalAlign = "top";

    // Shadow
    if (!s.textShadow) {
      s.textShadow = {
        enabled: false,
        color: "#000000",
        opacity: 0.25,
        blur: 0,
        offsetX: 0,
        offsetY: 0,
        spread: 0,
        intensity: "soft"
      };
    }

    // Stroke/Outline
    if (!s.textStroke) {
      s.textStroke = {
        enabled: false,
        color: "#000000",
        width: 1,
        opacity: 1
      };
    }

    // Text Background
    if (!s.textBackground) {
      s.textBackground = {
        enabled: false,
        type: "solid",
        color: "#ffffff",
        opacity: 1,
        gradientAngle: 90,
        gradientStart: "#ffffff",
        gradientEnd: "#f8fafc",
        padding: { top: 4, right: 8, bottom: 4, left: 8 },
        borderRadius: 0
      };
    }
    if (s.textBackground.type === undefined) s.textBackground.type = "solid";

    // Layout
    if (s.widthMode === undefined) s.widthMode = "auto"; // auto, fixed, fill
    if (s.heightMode === undefined) s.heightMode = "auto"; // auto, fixed
    if (s.rotation === undefined) s.rotation = 0;

    // Overflow control
    if (s.overflow === undefined) s.overflow = "wrap"; // wrap, clip, ellipsis, scroll
    if (s.maxLines === undefined) s.maxLines = null;

    // Padding & Margin
    if (!s.padding) s.padding = { top: 0, right: 0, bottom: 0, left: 0 };
    if (!s.margin) s.margin = { top: 0, right: 0, bottom: 0, left: 0 };

    // Responsive
    if (!s.responsive) {
      s.responsive = {
        enabled: false,
        mobileScale: 0.85,
        tabletScale: 0.95
      };
    }

    // Animation
    if (!s.animation) {
      s.animation = {
        enabled: false,
        type: "none", // fade, slide, typing, bounce, glow
        duration: 1000,
        delay: 0,
        loop: false,
        speed: 1
      };
    }

    // Interaction
    if (!s.interaction) {
      s.interaction = {
        clickable: false,
        href: "",
        hoverEffect: "none",
        copyable: false
      };
    }
  },

  computeTextDecorationCss(decoration) {
    const parts = [];
    if (decoration?.underline) parts.push("underline");
    if (decoration?.overline) parts.push("overline");
    if (decoration?.lineThrough) parts.push("line-through");
    return parts.length > 0 ? parts.join(" ") : "none";
  },

  parseHexColorToRgba(value, alpha = 1) {
    if (!value) return `rgba(0,0,0,${alpha})`;
    if (typeof value !== "string") return `rgba(0,0,0,${alpha})`;
    if (value.startsWith("#")) {
      const hex = value.slice(1).trim();
      let r = 0, g = 0, b = 0;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length >= 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return value;
  },

  getResponsiveScale(styles) {
    if (!styles?.responsive?.enabled) return 1;
    const key = AppState.currentDeviceKey || "";
    const lower = key.toLowerCase();
    if (lower.includes("ipad") || lower.includes("tablet") || lower.includes("pro") || lower.includes("large")) {
      return styles.responsive.tabletScale ?? 0.95;
    }
    return styles.responsive.mobileScale ?? 0.85;
  },

  buildTextShadowString(shadow) {
    if (!shadow?.enabled) return "none";
    const shadows = [];
    const main = `${shadow.offsetX ?? 0}px ${shadow.offsetY ?? 0}px ${shadow.blur ?? 0}px ${shadow.spread ?? 0}px rgba(0,0,0,${(shadow.opacity ?? 0.25).toFixed(2)})`;
    shadows.push(main);
    if (shadow.multiShadows?.length) {
      shadow.multiShadows.forEach((layer) => {
        if (layer.enabled) {
          shadows.push(`${layer.offsetX ?? 0}px ${layer.offsetY ?? 0}px ${layer.blur ?? 0}px ${layer.spread ?? 0}px rgba(0,0,0,${(layer.opacity ?? 0.25).toFixed(2)})`);
        }
      });
    }
    if (shadow.glowEnabled) {
      shadows.push(`0 0 ${shadow.glowBlur ?? 10}px ${shadow.glowSpread ?? 0}px ${shadow.glowColor ?? "#ffffff"}`);
    }
    return shadows.join(", ");
  },

  applyTextBackground(el, background) {
    if (!background?.enabled) {
      el.style.backgroundImage = "none";
      el.style.backgroundColor = "transparent";
      el.style.borderRadius = "0px";
      el.style.padding = "0px";
      return;
    }
    if (background.type === "gradient") {
      el.style.backgroundImage = `linear-gradient(${background.gradientAngle ?? 90}deg, ${background.gradientStart}, ${background.gradientEnd})`;
      el.style.backgroundColor = "transparent";
    } else {
      el.style.backgroundImage = "none";
      el.style.backgroundColor = this.parseHexColorToRgba(background.color || "#ffffff", background.opacity ?? 1);
    }
    el.style.borderRadius = `${background.borderRadius ?? 0}px`;
    el.style.paddingTop = `${background.padding?.top ?? 0}px`;
    el.style.paddingRight = `${background.padding?.right ?? 0}px`;
    el.style.paddingBottom = `${background.padding?.bottom ?? 0}px`;
    el.style.paddingLeft = `${background.padding?.left ?? 0}px`;
  },

  applyAnimation(el, animation) {
    if (!animation?.enabled || animation.type === "none") return;
    const duration = Math.max(100, animation.duration ?? 1000);
    const delay = Math.max(0, animation.delay ?? 0);
    const loop = animation.loop ? "infinite" : "1";
    el.style.transition = "none";

    if (animation.type === "fade") {
      el.style.opacity = "0";
      requestAnimationFrame(() => {
        el.style.transition = `opacity ${duration}ms ease ${delay}ms`;
        el.style.opacity = "1";
      });
    }

    if (animation.type === "slide") {
      el.style.transform = "translateY(20px)";
      requestAnimationFrame(() => {
        el.style.transition = `transform ${duration}ms ease ${delay}ms`;
        el.style.transform = "translateY(0)";
      });
    }

    if (animation.type === "bounce") {
      el.style.transform = "scale(0.9)";
      requestAnimationFrame(() => {
        el.style.transition = `transform ${duration}ms cubic-bezier(.34,1.56,.64,1) ${delay}ms`;
        el.style.transform = "scale(1)";
      });
    }

    if (animation.type === "glow") {
      const glow = animation.glowColor || "#ffffff";
      el.style.filter = `drop-shadow(0 0 ${Math.max(10, duration / 100)}px ${glow})`;
      requestAnimationFrame(() => {
        el.style.transition = `filter ${duration}ms ease ${delay}ms`;
        el.style.filter = "none";
      });
    }

    if (animation.type === "typing") {
      const fullText = el.innerText || "Text";
      el.innerText = "";
      let index = 0;
      const interval = Math.max(20, duration / Math.max(fullText.length, 1));
      setTimeout(() => {
        const timer = setInterval(() => {
          if (index >= fullText.length) {
            clearInterval(timer);
            return;
          }
          el.innerText += fullText[index++] || "";
        }, interval);
      }, delay);
    }
  },

  shadowCss(shadow) {
    if (!shadow?.enabled) return "none";
    const x = shadow.offsetX ?? 0;
    const y = shadow.offsetY ?? 0;
    const blur = shadow.blur ?? 0;
    const spread = shadow.spread ?? 0;
    const opacity = shadow.opacity ?? 0.25;
    return `${x}px ${y}px ${blur}px rgba(0, 0, 0, ${opacity})`;
  },

  strokeCss(stroke) {
    if (!stroke?.enabled) return "none";
    const width = stroke.width ?? 1;
    const color = stroke.color ?? "#000000";
    return `${width}px ${color}`;
  },

  applyToElement(el, component) {
    this.ensure(component);
    const s = component.styles;
    const p = component.props;

    // Set text content using innerText to preserve multiline strings
    el.innerText = p.value || "Text";

    // Responsive font sizing
    const responsiveScale = this.getResponsiveScale(s);
    el.style.fontFamily = `"${s.fontFamily}", sans-serif`;
    el.style.fontSize = `${Math.max(8, Math.round((s.fontSize ?? 16) * responsiveScale))}px`;
    el.style.fontWeight = s.fontWeight || "400";
    el.style.fontStyle = s.fontStyle === "italic" ? "italic" : "normal";
    el.style.opacity = s.textOpacity ?? 1;

    // Fill type
    if (s.textFillType === "gradient") {
      el.style.color = "transparent";
      el.style.backgroundImage = `linear-gradient(${s.textGradient.angle ?? 90}deg, ${s.textGradient.start}, ${s.textGradient.end})`;
      el.style.webkitBackgroundClip = "text";
      el.style.backgroundClip = "text";
    } else if (s.textFillType === "transparent") {
      el.style.color = "transparent";
      el.style.backgroundImage = "none";
      el.style.webkitBackgroundClip = "";
      el.style.backgroundClip = "";
    } else {
      el.style.color = s.color || "#111827";
      el.style.backgroundImage = "none";
      el.style.webkitBackgroundClip = "";
      el.style.backgroundClip = "";
    }

    // Text decorations
    el.style.textDecoration = this.computeTextDecorationCss(s.textDecoration);

    // Spacing
    el.style.letterSpacing = `${s.letterSpacing ?? 0}px`;
    el.style.lineHeight = s.lineHeight ?? 1.5;
    el.style.wordSpacing = `${s.wordSpacing ?? 0}px`;
    el.style.textAlign = s.textAlign || "left";
    el.style.whiteSpace = s.overflow === "clip" || s.overflow === "ellipsis" ? "nowrap" : "pre-wrap";
    el.style.wordBreak = "break-word";

    // Text shadow
    el.style.textShadow = this.buildTextShadowString(s.textShadow);

    // Text stroke
    if (s.textStroke?.enabled) {
      const strokeColor = this.parseHexColorToRgba(s.textStroke.color || "#000000", s.textStroke.opacity ?? 1);
      el.style.webkitTextStroke = `${s.textStroke.width ?? 1}px ${strokeColor}`;
    } else {
      el.style.webkitTextStroke = "";
    }

    // Core layout
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.boxSizing = "border-box";
    el.style.display = "flex";
    el.style.alignItems = "flex-start";
    el.style.justifyContent = "flex-start";
    el.style.paddingTop = `${s.padding?.top ?? 0}px`;
    el.style.paddingRight = `${s.padding?.right ?? 0}px`;
    el.style.paddingBottom = `${s.padding?.bottom ?? 0}px`;
    el.style.paddingLeft = `${s.padding?.left ?? 0}px`;

    el.style.margin = "0";

    // Overflow control
    if (s.overflow === "clip") {
      el.style.overflow = "hidden";
      el.style.textOverflow = "clip";
    } else if (s.overflow === "ellipsis") {
      el.style.overflow = "hidden";
      el.style.textOverflow = "ellipsis";
    } else if (s.overflow === "scroll") {
      el.style.overflow = "auto";
    } else {
      el.style.overflow = "visible";
    }

    if (s.maxLines) {
      el.style.display = "-webkit-box";
      el.style.webkitLineClamp = s.maxLines;
      el.style.webkitBoxOrient = "vertical";
      el.style.overflow = "hidden";
    }

    // Rotation is applied at wrapper level to avoid affecting text flow.
  }
};
