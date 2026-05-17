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

function boxSpacing(top = 0, right = 0, bottom = 0, left = 0) {
  return { top, right, bottom, left };
}

const DEFAULT_CANVAS_LAYOUTS = {
  button: { width: 130, height: 44 },
  text: { width: 200, height: 36 },
  image: { width: 280, height: 150 },
  input: { width: 280, height: 44 },
  icon: { width: 48, height: 48 },
  spacer: { width: 280, height: 24 },
  container: { width: 300, height: 200 },
  card: { width: 300, height: 200 },
  row: { width: 300, height: 120 },
  column: { width: 280, height: 200 },
  stack: { width: 300, height: 180 },
  center: { width: 300, height: 160 }
};

window.ComponentFactory = {
  getDefaultLayout(type) {
    return { ...(DEFAULT_CANVAS_LAYOUTS[type] || { width: 260, height: 120 }) };
  },

  createLayout(type, x = 16, y = 16, zIndex = 1) {
    const size = this.getDefaultLayout(type);
    return { x, y, width: size.width, height: size.height, zIndex };
  },

  create(type) {
    const common = {
      id: StateUtils.makeId(type),
      type,
      styles: {},
      props: {},
      children: [],
      layout: this.createLayout(type)
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
            customCode: "",
            back: false
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
