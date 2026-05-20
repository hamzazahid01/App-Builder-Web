window.GroupComponent = {
  type: "group",
  label: "Group",
  
  getDefaultLayout() {
    return { width: 300, height: 200 };
  },
  
  create() {
    return {
      ...ComponentFactory.createBase("group"),
      styles: {
        backgroundColor: "#f9fafb",
        borderWidth: 2,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: { top: 8, right: 8, bottom: 8, left: 8 }
      },
      props: {
        name: "Group"
      }
    };
  }
};

window.ComponentRegistry.group = window.GroupComponent;
