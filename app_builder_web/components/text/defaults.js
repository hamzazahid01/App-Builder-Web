window.TextComponent = {
  type: "text",
  label: "Text",
  getDefaultLayout() {
    return { width: 200, height: 36 };
  },
  create() {
    const text = {
      ...ComponentFactory.createBase("text"),
      styles: {
        textType: "custom",
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "400",
        fontStyle: "normal",
        color: "#111827",
        textOpacity: 1,
        textDecoration: { underline: false, overline: false, lineThrough: false },
        letterSpacing: 0,
        lineHeight: 1.5,
        wordSpacing: 0,
        textAlign: "left",
        verticalAlign: "top",
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
        textStroke: {
          enabled: false,
          color: "#000000",
          width: 1,
          opacity: 1
        },
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
        widthMode: "auto",
        heightMode: "auto",
        manuallyResized: false,
        rotation: 0,
        overflow: "wrap",
        maxLines: null,
        padding: boxSpacing(0, 0, 0, 0),
        margin: boxSpacing(0, 0, 0, 0),
        responsive: {
          enabled: false,
          mobileScale: 0.85,
          tabletScale: 0.95
        },
        animation: {
          enabled: false,
          type: "none",
          duration: 1000,
          delay: 0,
          loop: false,
          speed: 1
        },
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
    
    // Auto-size text component based on default content
    const dimensions = CanvasUtils.measureTextDimensions(text.props.value, text.styles);
    text.layout.width = dimensions.width;
    text.layout.height = dimensions.height;
    
    return text;
  }
};
window.ComponentRegistry.text = window.TextComponent;
