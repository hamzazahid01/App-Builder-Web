window.LayersPanel = {
  render() {
    const panel = document.getElementById("layers-panel");
    if (!panel) return;
    panel.innerHTML = "";
    const page = StateUtils.getCurrentPage();
    if (!page) {
      panel.innerHTML = `<div class="empty-state">No page</div>`;
      return;
    }

    const sorted = [...page.components].sort(
      (a, b) => (b.layout?.zIndex ?? 0) - (a.layout?.zIndex ?? 0)
    );

    if (sorted.length === 0) {
      panel.innerHTML = `<div class="empty-state">No components on this page</div>`;
      return;
    }

    for (const node of sorted) {
      panel.appendChild(this.buildRow(node, 0));
    }
  },

  buildRow(node, depth) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `layer-row depth-${depth} ${node.id === AppState.selectedId ? "active" : ""}`;
    row.style.paddingLeft = `${10 + depth * 14}px`;
    row.innerHTML = `<span class="layer-type">${node.type}</span><span class="layer-label">${this.label(node)}</span>`;
    row.addEventListener("click", () => {
      AppState.selectedId = node.id;
      AppState.selectedType = "component";
      Builder.refreshAll();
    });

    return row;
  },

  label(node) {
    if (node.type === "text") return node.props.value?.slice(0, 24) || "Text";
    if (node.type === "button") return node.props.text || "Button";
    if (node.type === "input") return node.props.placeholder || "Input";
    if (node.type === "image") return "Image";
    if (node.type === "icon") return node.props.symbol || "Icon";
    return node.type;
  }
};
