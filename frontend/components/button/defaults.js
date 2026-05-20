window.ButtonComponent = {
  type: "button",
  label: "Button",
  getDefaultLayout() {
    return { width: 130, height: 44 };
  },
  create() {
    const btn = {
      ...ComponentFactory.createBase("button"),
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
};
window.ComponentRegistry.button = window.ButtonComponent;
