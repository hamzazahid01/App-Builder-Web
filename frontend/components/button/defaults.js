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
        // Background
        backgroundType: "solid",
        backgroundColor: "#2563eb",
        gradientStart: "#2563eb",
        gradientEnd: "#1d4ed8",
        gradientAngle: 90,
        
        // Typography
        textColor: "#ffffff",
        fontFamily: "Inter",
        fontSize: 14,
        fontSizeManual: false,
        fontScale: 1,
        fontWeight: "600",
        fontStyle: { bold: true, italic: false, underline: false, lineThrough: false },
        letterSpacing: 0,
        lineHeight: 1.4,
        textAlign: "center",
        
        // Text Effects
        textShadow: {
          enabled: false,
          color: "#000000",
          opacity: 0.25,
          blur: 4,
          offsetX: 0,
          offsetY: 2
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
          padding: boxSpacing(4, 8, 4, 8),
          borderRadius: 4
        },
        
        // Layout
        padding: boxSpacing(10, 16, 10, 16),
        margin: boxSpacing(0, 0, 0, 0),
        borderRadius: 10,
        borderRadiusCorners: { tl: 10, tr: 10, bl: 10, br: 10 },
        opacity: 1,
        widthMode: "fill",
        heightMode: "fill",
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
        
        // Border
        borderEnabled: false,
        borderWidth: 0,
        borderColor: "#000000",
        borderStyle: "solid",
        
        // Shadow
        shadow: {
          enabled: false,
          color: "#000000",
          opacity: 0.25,
          blur: 8,
          spread: 0,
          offsetX: 0,
          offsetY: 4,
          insetEnabled: false,
          multiShadows: []
        },
        
        // Glow
        glowEnabled: false,
        glowColor: "#ffffff",
        glowBlur: 0,
        glowSpread: 0,
        
        // States
        states: {
          normal: {},
          hover: {
            backgroundEnabled: false,
            backgroundColor: "#1d4ed8",
            scaleEnabled: false,
            scale: 1.05,
            shadowEnabled: false
          },
          active: {
            scaleEnabled: false,
            scale: 0.95,
            brightnessEnabled: false,
            brightness: 0.9
          },
          disabled: {
            opacity: 0.6,
            grayscale: true
          },
          focus: {
            outlineEnabled: true,
            outlineColor: "#2563eb",
            outlineWidth: 2,
            ringEnabled: false,
            ringColor: "rgba(37, 99, 235, 0.3)",
            ringBlur: 4
          }
        },
        
        // Animation
        animation: {
          enabled: false,
          type: "none",
          duration: 300,
          delay: 0,
          easing: "ease",
          loop: false
        },
        hoverAnimation: {
          enabled: false,
          type: "none",
          duration: 200
        },
        clickAnimation: {
          enabled: false,
          type: "ripple",
          duration: 300
        },
        
        // Interaction
        cursor: "pointer",
        tooltip: {
          enabled: false,
          text: "",
          position: "top"
        },
        longPressAction: {
          enabled: false,
          action: {
            type: "none",
            targetPageId: "",
            url: "",
            dialogText: "",
            customCode: ""
          }
        },
        
        // Responsive
        responsive: {
          enabled: false,
          mobileScale: 0.85,
          tabletScale: 0.95,
          desktopScale: 1,
          hideOn: {
            mobile: false,
            tablet: false,
            desktop: false
          }
        },
        
        // Accessibility
        ariaLabel: "",
        tabIndex: 0,
        keyboardShortcut: "",
        screenReaderText: ""
      },
      props: {
        text: "Button",
        icon: {
          enabled: false,
          position: "left",
          symbol: "",
          svg: null,
          size: 16,
          color: ""
        },
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
