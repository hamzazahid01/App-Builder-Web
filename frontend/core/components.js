window.ComponentCatalog = [
  { type: "button", label: "Button" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "container", label: "Container" },
  { type: "input", label: "Input" },
  { type: "icon", label: "Icon" }
];

window.ComponentRegistry = window.ComponentRegistry || {};

const REMOVED_TYPES = new Set(["spacer", "center", "row", "column", "stack", "card"]);
const CONVERT_TO_CONTAINER = new Set(["row", "column", "stack", "center", "card"]);

function boxSpacing(top = 0, right = 0, bottom = 0, left = 0) {
  return { top, right, bottom, left };
}

const DEFAULT_CANVAS_LAYOUTS = {
  button: { width: 130, height: 44 },
  text: { width: 200, height: 36 },
  image: { width: 280, height: 150 },
  input: { width: 280, height: 44 },
  icon: { width: 48, height: 48 },
  container: { width: 300, height: 200 }
};

window.ComponentFactory = {
  getDefaultLayout(type) {
    return { ...(DEFAULT_CANVAS_LAYOUTS[type] || { width: 260, height: 120 }) };
  },

  createLayout(type, x = 16, y = 16, zIndex = 1) {
    const size = this.getDefaultLayout(type);
    return { x, y, width: size.width, height: size.height, zIndex };
  },

  createBase(type) {
    return {
      id: StateUtils.makeId(type),
      type,
      styles: {},
      props: {},
      children: [],
      layout: this.createLayout(type)
    };
  },

  detectFlexDirection(component) {
    const w = component.layout?.width ?? 300;
    const h = component.layout?.height ?? 200;
    return w >= h ? "row" : "column";
  },

  syncContainerFlexDirection(component) {
    if (component.type !== "container" || !component.styles) return;
    component.styles.flexDirection = this.detectFlexDirection(component);
  },

  create(type) {
    const componentModule = window.ComponentRegistry?.[type];
    if (componentModule?.create) return componentModule.create();

    const common = {
      id: StateUtils.makeId(type),
      type,
      styles: {},
      props: {},
      children: [],
      layout: this.createLayout(type)
    };

    if (type === "button") {
      const btn = {
        ...common,
        styles: {
          backgroundType: "solid",
          backgroundColor: "#2563eb",
          gradientStart: "#2563eb",
          gradientEnd: "#1d4ed8",
          textColor: "#ffffff",
          fontFamily: "Inter",
          fontSize: 14,
          fontSizeManual: false,
          fontScale: 1,
          fontStyle: { bold: true, italic: false, underline: false, lineThrough: false },
          textAlign: "center",
          padding: boxSpacing(10, 16, 10, 16),
          borderRadius: 10,
          borderRadiusCorners: { tl: 10, tr: 10, bl: 10, br: 10 },
          opacity: 1,
          shadow: { enabled: false, color: "#000000", opacity: 0.25, blur: 8, spread: 0, offsetX: 0, offsetY: 4 },
          widthMode: "fill",
          heightMode: "fill"
        },
        props: {
          text: "Button",
          action: {
            type: "none",
            targetPageId: AppState?.app?.initialPageId || "",
            url: "",
            dialogText: "Message",
            customCode: ""
          },
          onClick: null
        }
      };
      btn.props.onClick = btn.props.action;
      return btn;
    }

    if (type === "text") {
      const text = {
        ...common,
        styles: {
          // Text content
          textType: "custom",
          
          // Typography
          fontSize: 16,
          fontFamily: "Inter",
          fontWeight: "400",
          fontStyle: "normal",
          
          // Color & Opacity
          color: "#111827",
          textOpacity: 1,
          
          // Text Decorations
          textDecoration: { underline: false, overline: false, lineThrough: false },
          
          // Spacing
          letterSpacing: 0,
          lineHeight: 1.5,
          wordSpacing: 0,
          
          // Alignment
          textAlign: "left",
          verticalAlign: "top",
          
          // Text Fill and shadow
          textFillType: "solid",
          textGradient: {
            angle: 90,
            start: "#111827",
            end: "#2563eb"
          },
          textShadow: {
            enabled: false,
            color: "#000000",
            opacity: 0.25,
            blur: 0,
            offsetX: 0,
            offsetY: 0,
            spread: 0,
            intensity: "soft",
            presetType: "none",
            multiShadows: [],
            glowEnabled: false,
            glowColor: "#ffffff",
            glowBlur: 0,
            glowSpread: 0
          },
          
          // Text Stroke
          textStroke: {
            enabled: false,
            color: "#000000",
            width: 1,
            opacity: 1
          },
          
          // Text Background
          textBackground: {
            enabled: false,
            type: "solid",
            color: "#ffffff",
            opacity: 1,
            gradientAngle: 90,
            gradientStart: "#ffffff",
            gradientEnd: "#f8fafc",
            padding: boxSpacing(4, 8, 4, 8),
            borderRadius: 0
          },
          
          // Layout
          widthMode: "auto",
          heightMode: "auto",
          rotation: 0,
          
          // Overflow
          overflow: "wrap",
          maxLines: null,
          
          // Padding & Margin
          padding: boxSpacing(0, 0, 0, 0),
          margin: boxSpacing(0, 0, 0, 0),
          
          // Responsive
          responsive: {
            enabled: false,
            mobileScale: 0.85,
            tabletScale: 0.95
          },
          
          // Animation
          animation: {
            enabled: false,
            type: "none",
            duration: 1000,
            delay: 0,
            loop: false,
            speed: 1
          },
          
          // Interaction
          interaction: {
            clickable: false,
            href: "",
            hoverEffect: "none",
            copyable: false
          }
        },
        props: {
          value: "Text",
          action: {
            type: "none",
            targetPageId: AppState?.app?.initialPageId || "",
            url: "",
            dialogText: "Message",
            customCode: ""
          }
        }
      };
      TextStyles.ensure(text);
      return text;
    }

    if (type === "container") {
      const container = {
        ...common,
        styles: {
          backgroundColor: null,
          padding: boxSpacing(8, 8, 8, 8),
          borderColor: "#d1d5db",
          borderWidth: 1,
          borderRadius: 10,
          gap: 8,
          opacity: 1,
          alignItems: "start",
          justifyContent: "start",
          flexDirection: "column",
          shadow: {
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
          }
        },
        props: { layoutMode: "auto" }
      };
      this.syncContainerFlexDirection(container);
      return container;
    }

    if (type === "image") {
      return {
        ...common,
        styles: {
          sourceType: "url",
          displayType: "normal",
          fit: "cover",
          borderEnabled: false,
          borderWidth: 0,
          borderColor: "#000000",
          borderStyle: "solid",
          borderRadius: 10,
          borderRadiusCorners: { tl: 10, tr: 10, bl: 10, br: 10 },
          opacity: 1,
          background: {
            enabled: false,
            type: "solid",
            color: "#ffffff",
            gradientAngle: 90,
            gradientStart: "#ffffff",
            gradientEnd: "#f8fafc"
          },
          shadow: {
            enabled: false,
            color: "#000000",
            opacity: 0.25,
            blur: 8,
            spread: 0,
            offsetX: 0,
            offsetY: 4,
            insetEnabled: false,
            multiShadows: [],
            glowEnabled: false,
            glowColor: "#ffffff",
            glowBlur: 0,
            glowSpread: 0,
            presetType: "none",
            intensity: "medium"
          },
          widthMode: "fixed",
          heightMode: "fixed",
          aspectRatioLocked: true,
          rotation: 0,
          flipHorizontal: false,
          flipVertical: false,
          align: "center",
          padding: boxSpacing(0, 0, 0, 0),
          margin: boxSpacing(0, 0, 0, 0),
          crop: {
            enabled: false,
            mode: "free",
            aspectRatio: null,
            zoom: 1,
            x: 0,
            y: 0,
            rotation: 0
          },
          filters: {
            brightness: 1,
            contrast: 1,
            saturation: 1,
            blur: 0,
            grayscale: 0,
            sepia: 0,
            hueRotate: 0
          },
          overlay: {
            enabled: false,
            type: "color",
            color: "#000000",
            gradientAngle: 90,
            gradientStart: "#000000",
            gradientEnd: "#ffffff",
            opacity: 0.2
          },
          interaction: {
            clickable: false,
            href: "",
            popup: false,
            hoverEffect: "none",
            zoomOnHover: false,
            clickAnimation: "none"
          },
          animation: {
            enabled: false,
            type: "none",
            duration: 1000,
            delay: 0,
            loop: false,
            speed: 1
          },
          responsive: {
            enabled: false,
            mobileScale: 0.9,
            tabletScale: 0.95
          },
          lazyLoad: false,
          altText: "Image",
          placeholderSrc: "https://placehold.co/600x300",
          visibleOn: {
            desktop: true,
            tablet: true,
            mobile: true
          }
        },
        props: {
          src: "https://placehold.co/600x300",
          alt: "Image",
          source: "url",
          srcUrl: "https://placehold.co/600x300"
        }
      };
    }

    if (type === "input") {
      return {
        ...common,
        styles: {
          // Basic appearance
          background: { enabled: false, type: "solid", color: "#ffffff", gradientStart: "#ffffff", gradientEnd: "#f8fafc", gradientAngle: 90 },
          color: "#0f172a",
          placeholderColor: "#94a3b8",
          fontFamily: "Inter",
          fontSize: 14,
          fontWeight: "400",
          fontStyle: { italic: false, underline: false, lineThrough: false },
          opacity: 1,

          // Border & corners
          borderEnabled: true,
          borderColor: "#cbd5e1",
          borderWidth: 1,
          borderStyle: "solid",
          borderRadius: 8,
          borderRadiusCorners: { tl: 8, tr: 8, bl: 8, br: 8 },

          // Shadow
          shadow: { enabled: false, color: "#000000", opacity: 0.12, blur: 8, spread: 0, offsetX: 0, offsetY: 2, insetEnabled: false, intensity: "soft", multiShadows: [] },

          // Layout
          widthMode: "fixed",
          heightMode: "fixed",
          width: null,
          height: null,
          padding: boxSpacing(8, 12, 8, 12),
          margin: boxSpacing(4, 0, 4, 0),
          align: "left",

          // States
          states: {
            normal: {},
            focus: { borderColor: "#2563eb", shadowEnabled: true },
            hover: {},
            disabled: { opacity: 0.6 },
            error: { borderColor: "#dc2626" },
            success: { borderColor: "#16a34a" }
          },

          // Label & helper
          label: { enabled: false, text: "Label", position: "top", visible: true },
          helperText: { enabled: false, text: "Helper text", showCharCount: false },

          // Validation
          validation: { required: false, minLength: null, maxLength: null, pattern: null, customMessage: "" },

          // Advanced
          readonly: false,
          disabled: false,
          autocomplete: true,
          mask: null,
          characterLimit: null,
          copyPaste: { copy: true, paste: true },
          visibleOn: { desktop: true, tablet: true, mobile: true },

          // Interaction & animation
          interaction: { clickable: false },
          animation: { enabled: false, type: "none", duration: 500, delay: 0, loop: false, speed: 1 }
        },
        props: {
          placeholder: "Enter text",
          value: "",
          inputType: "text",
          options: ["Option 1", "Option 2"],
          accept: "",
          multiple: false
        }
      };
    }

    if (type === "icon") {
      return {
        ...common,
        styles: {
          // Source
          source: { type: "library", library: "builtin", name: "star", svg: null, src: null },

          // Appearance
          color: "#1f2937",
          gradient: { enabled: false, start: "#111827", end: "#2563eb", angle: 90 },
          opacity: 1,
          fontSize: 24,
          rotation: 0,
          flipHorizontal: false,
          flipVertical: false,

          // Background & border
          background: { enabled: false, type: "solid", color: "transparent", gradientStart: "#ffffff", gradientEnd: "#f8fafc", gradientAngle: 90 },
          borderEnabled: false,
          borderWidth: 0,
          borderColor: "#e5e7eb",
          borderStyle: "solid",
          borderRadius: 8,
          borderRadiusCorners: { tl: 8, tr: 8, bl: 8, br: 8 },
          padding: boxSpacing(6, 6, 6, 6),

          // Shadow
          shadow: { enabled: false, color: "#000000", opacity: 0.12, blur: 8, spread: 0, offsetX: 0, offsetY: 2, insetEnabled: false, multiShadows: [] },

          // Layout
          widthMode: "auto",
          heightMode: "auto",
          width: null,
          height: null,
          margin: boxSpacing(0, 0, 0, 0),
          align: "center",

          // States
          states: { hover: {}, active: {}, disabled: {}, selected: {} },

          // Interaction & animation
          interaction: { clickable: false, href: "" },
          animation: { enabled: false, type: "none", duration: 600, delay: 0, loop: false, speed: 1 },

          // Accessibility
          alt: "Icon",
          visibleOn: { desktop: true, tablet: true, mobile: true }
        },
        props: {
          symbol: "⭐",
          svg: null,
          src: null,
          library: "builtin",
          name: "star",
          action: {
            type: "none",
            targetPageId: AppState?.app?.initialPageId || "",
            url: "",
            dialogText: "Message",
            customCode: ""
          }
        }
      };
    }

    return common;
  },

  supportsChildren(type) {
    return type === "container";
  },

  migrateComponent(node) {
    if (!node) return null;
    if (REMOVED_TYPES.has(node.type) && !CONVERT_TO_CONTAINER.has(node.type)) return null;

    if (CONVERT_TO_CONTAINER.has(node.type)) {
      node.type = "container";
      if (!node.children) node.children = [];
      if (!node.props) node.props = { layoutMode: "auto" };
      node.props.layoutMode = "auto";
    }

    if (node.children?.length) {
      node.children = node.children.map((c) => this.migrateComponent(c)).filter(Boolean);
    }

    if (!node.layout) {
      const size = this.getDefaultLayout(node.type);
      node.layout = { x: 8, y: 8, width: size.width, height: size.height, zIndex: 1 };
    }

    if (node.type === "container") this.syncContainerFlexDirection(node);
    if (node.type === "button") ButtonStyles.ensure(node);
    return node;
  },

  migrateApp(app) {
    for (const page of app.pages || []) {
      page.components = (page.components || [])
        .map((c) => this.migrateComponent(c))
        .filter(Boolean);
    }
    if (!app.pages?.length) return app;
    if (!app.initialPageId) app.initialPageId = app.pages[0].id;
    if (!app.currentPageId) app.currentPageId = app.pages[0].id;
    if (!app.splashScreen.nextScreenId) app.splashScreen.nextScreenId = app.initialPageId;
    for (const page of app.pages) StateUtils.ensurePageCanvasLayout(page);
    return app;
  }
};
