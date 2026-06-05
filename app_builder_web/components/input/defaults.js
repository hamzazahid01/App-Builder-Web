window.InputComponent = {
  type: "input",
  label: "Input",
  getDefaultLayout() {
    return { width: 280, height: 44 };
  },
  create() {
    return {
      ...ComponentFactory.createBase("input"),
      styles: {
        background: { enabled: false, type: "solid", color: "#ffffff", gradientStart: "#ffffff", gradientEnd: "#f8fafc", gradientAngle: 90 },
        color: "#0f172a",
        placeholderColor: "#94a3b8",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "400",
        fontStyle: { italic: false, underline: false, lineThrough: false },
        opacity: 1,
        borderEnabled: true,
        borderColor: "#cbd5e1",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 8,
        borderRadiusCorners: { tl: 8, tr: 8, bl: 8, br: 8 },
        shadow: { enabled: false, color: "#000000", opacity: 0.12, blur: 8, spread: 0, offsetX: 0, offsetY: 2, insetEnabled: false, intensity: "soft", multiShadows: [] },
        widthMode: "fixed",
        heightMode: "fixed",
        width: null,
        height: null,
        padding: boxSpacing(8, 12, 8, 12),
        margin: boxSpacing(4, 0, 4, 0),
        align: "left",
        states: {
          normal: {},
          focus: { borderColor: "#2563eb", shadowEnabled: true },
          hover: {},
          disabled: { opacity: 0.6 },
          error: { borderColor: "#dc2626" },
          success: { borderColor: "#16a34a" }
        },
        label: { enabled: false, text: "Label", position: "top", visible: true },
        helperText: { enabled: false, text: "Helper text", showCharCount: false },
        validation: { required: false, minLength: null, maxLength: null, pattern: null, customMessage: "" },
        readonly: false,
        disabled: false,
        autocomplete: true,
        mask: null,
        characterLimit: null,
        copyPaste: { copy: true, paste: true },
        visibleOn: { desktop: true, tablet: true, mobile: true },
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
};
window.ComponentRegistry.input = window.InputComponent;
