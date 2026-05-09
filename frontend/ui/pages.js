window.PageManager = {
  render() {
    const panel = document.getElementById("pages-panel");
    panel.innerHTML = "";

    for (const page of AppState.app.pages) {
      const row = document.createElement("div");
      row.className = `page-item ${page.id === AppState.app.currentPageId ? "active" : ""}`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "page-switch-btn";
      btn.textContent = page.name + (page.id === AppState.app.initialPageId ? " (Initial)" : "");
      btn.addEventListener("click", () => {
        StateUtils.setCurrentPage(page.id, false);
        AppState.selectedId = null;
        AppState.selectedType = "page";
        renderPreview();
        Inspector.render();
        this.render();
      });

      row.appendChild(btn);

      const controls = document.createElement("div");
      controls.className = "page-controls";

      const up = document.createElement("button");
      up.type = "button";
      up.className = "page-mini-btn";
      up.textContent = "↑";
      up.addEventListener("click", (e) => {
        e.stopPropagation();
        this.reorderPage(page.id, -1);
      });

      const down = document.createElement("button");
      down.type = "button";
      down.className = "page-mini-btn";
      down.textContent = "↓";
      down.addEventListener("click", (e) => {
        e.stopPropagation();
        this.reorderPage(page.id, 1);
      });

      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "page-mini-btn";
      copy.textContent = "⎘";
      copy.addEventListener("click", (e) => {
        e.stopPropagation();
        this.duplicatePage(page.id);
      });

      const del = document.createElement("button");
      del.type = "button";
      del.className = "page-mini-btn danger";
      del.textContent = "×";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deletePage(page.id);
      });

      controls.appendChild(up);
      controls.appendChild(down);
      controls.appendChild(copy);
      controls.appendChild(del);
      row.appendChild(controls);
      panel.appendChild(row);
    }
  },

  addPage() {
    const name = `Page ${AppState.app.pages.length + 1}`;
    const page = StateUtils.createDefaultPage(name);
    page.appBar.title = name;
    AppState.app.pages.push(page);
    StateUtils.setCurrentPage(page.id, false);
    AppState.selectedId = null;
    AppState.selectedType = "page";
    this.render();
    Inspector.render();
    renderPreview();
  },

  duplicatePage(pageId) {
    const source = AppState.app.pages.find((p) => p.id === pageId);
    if (!source) return;
    const clone = JSON.parse(JSON.stringify(source));
    clone.id = StateUtils.makeId("page");
    clone.name = `${source.name} Copy`;
    clone.appBar.title = clone.name;
    AppState.app.pages.push(clone);
    StateUtils.setCurrentPage(clone.id, false);
    this.render();
    Inspector.render();
    renderPreview();
  },

  reorderPage(pageId, offset) {
    const idx = AppState.app.pages.findIndex((p) => p.id === pageId);
    if (idx < 0) return;
    const target = idx + offset;
    if (target < 0 || target >= AppState.app.pages.length) return;
    const pages = AppState.app.pages;
    [pages[idx], pages[target]] = [pages[target], pages[idx]];
    this.render();
  },

  deletePage(pageId) {
    if (AppState.app.pages.length <= 1) return;
    AppState.app.pages = AppState.app.pages.filter((p) => p.id !== pageId);
    if (AppState.app.initialPageId === pageId) {
      AppState.app.initialPageId = AppState.app.pages[0].id;
    }
    if (AppState.app.currentPageId === pageId) {
      AppState.app.currentPageId = AppState.app.pages[0].id;
    }
    if (AppState.app.splashScreen.nextScreenId === pageId) {
      AppState.app.splashScreen.nextScreenId = AppState.app.initialPageId;
    }
    this.render();
    Inspector.render();
    renderPreview();
  }
};
