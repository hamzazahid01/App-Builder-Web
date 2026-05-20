window.IconComponent = {
  type: "icon",
  label: "Icon",
  getDefaultLayout() {
    return { width: 48, height: 48 };
  },
  create() {
    return {
      ...ComponentFactory.createBase("icon"),
      styles: {
        source: { type: "library", library: "builtin", name: "star", svg: null, src: null },
        color: "#1f2937",
        gradient: { enabled: false, start: "#111827", end: "#2563eb", angle: 90 },
        opacity: 1,
        fontSize: 24,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
        background: { enabled: false, type: "solid", color: "transparent", gradientStart: "#ffffff", gradientEnd: "#f8fafc", gradientAngle: 90 },
        borderEnabled: false,
        borderWidth: 0,
        borderColor: "#e5e7eb",
        borderStyle: "solid",
        borderRadius: 8,
        borderRadiusCorners: { tl: 8, tr: 8, bl: 8, br: 8 },
        padding: boxSpacing(6, 6, 6, 6),
        shadow: { enabled: false, color: "#000000", opacity: 0.12, blur: 8, spread: 0, offsetX: 0, offsetY: 2, insetEnabled: false, multiShadows: [] },
        widthMode: "auto",
        heightMode: "auto",
        width: null,
        height: null,
        margin: boxSpacing(0, 0, 0, 0),
        align: "center",
        states: { hover: {}, active: {}, disabled: {}, selected: {} },
        interaction: { clickable: false, href: "" },
        animation: { enabled: false, type: "none", duration: 600, delay: 0, loop: false, speed: 1 },
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
};
window.ComponentRegistry.icon = window.IconComponent;
