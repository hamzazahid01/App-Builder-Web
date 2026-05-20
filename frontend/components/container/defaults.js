window.ContainerComponent = {
  type: "container",
  label: "Container",
  getDefaultLayout() {
    return { width: 300, height: 200 };
  },
  create() {
    const container = {
      ...ComponentFactory.createBase("container"),
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
    ComponentFactory.syncContainerFlexDirection(container);
    return container;
  }
};
window.ComponentRegistry.container = window.ContainerComponent;
