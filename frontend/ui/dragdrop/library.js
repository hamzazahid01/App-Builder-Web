window.DragDropLibrary = {
  libraryGroups: [
    { title: "Basic", icon: "🧩", types: ["text", "button", "input"] },
    { title: "Media", icon: "🖼️", types: ["image", "icon"] },
    { title: "Navigation", icon: "🧭", types: [] },
    { title: "Advanced", icon: "⚙️", types: [] }
  ],

  init() {
    const search = document.getElementById("component-search");
    if (search) {
      search.addEventListener("input", (e) => this.render(e.target.value));
    }
    this.render("");
  },

  render(filter = "") {
    const container = document.getElementById("component-categories");
    if (!container) return;
    container.innerHTML = "";

    const catalog = Array.isArray(window.ComponentCatalog) ? window.ComponentCatalog : [];
    if (!catalog.length) {
      container.innerHTML = `<div class="category-empty">Component library unavailable.<br/>Please check ` +
        `that core/components.js is loaded.</div>`;
      return;
    }

    const query = (filter || "").trim().toLowerCase();
    const items = catalog
      .filter((item) => !query || item.label.toLowerCase().includes(query));

    const itemsWrapper = document.createElement("div");
    itemsWrapper.className = "category-items";

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "category-empty";
      empty.textContent = query ? "No components match your search." : "No components are available right now.";
      itemsWrapper.appendChild(empty);
    } else {
      for (const item of items) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "component-item";
        card.innerHTML = `<span>${item.label}</span><span class="component-badge">${item.icon || '➕'}</span>`;
        card.addEventListener("pointerdown", (e) => {
          if (AppState.runtimeMode) return;
          e.preventDefault();
          window.DragDrop.startPlaceFromLibrary(item.type, e);
        });
        itemsWrapper.appendChild(card);
      }
    }

    container.appendChild(itemsWrapper);
  }
};
