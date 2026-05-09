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

      const del = document.createElement("button");
      del.type = "button";
      del.className = "page-delete-btn";
      del.textContent = "×";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deletePage(page.id);
      });

      row.appendChild(btn);
      row.appendChild(del);
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
