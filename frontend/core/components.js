window.ComponentCatalog = [
  { type: "button", label: "Button" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "container", label: "Container" },
  { type: "input", label: "Input" },
  { type: "card", label: "Card" },
  { type: "row", label: "Row" },
  { type: "column", label: "Column" },
  { type: "stack", label: "Stack" },
  { type: "center", label: "Center" },
  { type: "icon", label: "Icon" },
  { type: "spacer", label: "Spacer" }
];

function boxSpacing(top = 8, right = 8, bottom = 8, left = 8) {
  return { top, right, bottom, left };
}

window.ComponentFactory = {
  create(type) {
    const common = {
      id: StateUtils.makeId(type),
      type,
      styles: {},
      props: {},
      children: []
    };

    if (type === "button") {
      return {
        ...common,
        styles: {
          backgroundColor: "#2563eb",
          textColor: "#ffffff",
          padding: boxSpacing(10, 16, 10, 16),
          margin: boxSpacing(),
          borderRadius: 10,
          fontSize: 14,
          fontWeight: "600",
          opacity: 1
        },
        props: {
          text: "Button",
          onClick: {
            type: "navigate",
            targetPageId: "",
            url: "",
            dialogText: "Hello from dialog",
            customCode: ""
          }
        }
      };
    }

    if (type === "text") {
      return {
        ...common,
        styles: { fontSize: 16, color: "#111827", fontWeight: "400", textAlign: "left", margin: boxSpacing(4, 0, 4, 0) },
        props: { value: "Text" }
      };
    }

    if (type === "container") {
      return {
        ...common,
        styles: {
          width: "100%",
          height: "auto",
          backgroundColor: "#f8fafc",
          padding: boxSpacing(12, 12, 12, 12),
          margin: boxSpacing(8, 0, 8, 0),
          borderColor: "#d1d5db",
          borderWidth: 1,
          borderRadius: 10,
          flexDirection: "column",
          gap: 8,
          opacity: 1,
          alignItems: "start",
          justifyContent: "start"
        }
      };
    }

    if (type === "image") {
      return {
        ...common,
        styles: { width: "100%", height: 140, borderRadius: 10, fit: "cover", margin: boxSpacing(8, 0, 8, 0) },
        props: { src: "https://placehold.co/600x300" }
      };
    }

    if (type === "input") {
      return {
        ...common,
        styles: { borderColor: "#cbd5e1", borderWidth: 1, borderRadius: 8, padding: boxSpacing(10, 10, 10, 10), margin: boxSpacing(8, 0, 8, 0) },
        props: { placeholder: "Enter text", inputType: "text" }
      };
    }

    if (type === "card") {
      const card = this.create("container");
      card.type = "card";
      card.styles.backgroundColor = "#ffffff";
      card.styles.boxShadow = "0 6px 16px rgba(15,23,42,0.12)";
      return card;
    }

    if (type === "row") {
      const row = this.create("container");
      row.type = "row";
      row.styles.flexDirection = "row";
      row.styles.width = "100%";
      return row;
    }

    if (type === "column") {
      const col = this.create("container");
      col.type = "column";
      col.styles.flexDirection = "column";
      return col;
    }

    if (type === "icon") {
      return {
        ...common,
        styles: { fontSize: 24, color: "#1f2937", margin: boxSpacing(8, 0, 8, 0) },
        props: { symbol: "⭐" }
      };
    }

    if (type === "spacer") {
      return {
        ...common,
        styles: { height: 24, margin: boxSpacing(2, 0, 2, 0) }
      };
    }

    if (type === "stack") {
      return {
        ...common,
        styles: {
          width: "100%",
          height: 180,
          backgroundColor: "#f1f5f9",
          margin: boxSpacing(8, 0, 8, 0),
          borderRadius: 10
        }
      };
    }

    if (type === "center") {
      return {
        ...common,
        styles: {
          width: "100%",
          minHeight: 120,
          backgroundColor: "#ffffff",
          margin: boxSpacing(8, 0, 8, 0),
          borderColor: "#d1d5db",
          borderWidth: 1,
          borderRadius: 10
        }
      };
    }

    return common;
  },

  supportsChildren(type) {
    return ["container", "card", "row", "column", "stack", "center"].includes(type);
  }
};
