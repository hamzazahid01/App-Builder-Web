window.PageManager = {
  render() {
    const panel = document.getElementById("page-tabs");
    if (!panel) return;
    panel.innerHTML = "";
    // render flat list of pages (no groups)
    for (const page of AppState.app.pages) this._renderPageItem(panel, page);
  },

  _renderPageItem(panel, page) {
    const row = document.createElement("div");
    row.className = `page-item ${page.id === AppState.app.currentPageId ? "active" : ""}`;
    row.draggable = true;
    row.dataset.pageId = page.id;

    row.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', page.id);
      row.classList.add('dragging');
    });
    row.addEventListener('dragend', () => row.classList.remove('dragging'));

    row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('drag-over'); });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('drag-over');
      const draggedId = e.dataTransfer.getData('text/plain');
      if (!draggedId || draggedId === page.id) return;
      const idxFrom = AppState.app.pages.findIndex(p => p.id === draggedId);
      const idxTo = AppState.app.pages.findIndex(p => p.id === page.id);
      if (idxFrom === -1 || idxTo === -1) return;
      const [item] = AppState.app.pages.splice(idxFrom, 1);
      AppState.app.pages.splice(idxTo, 0, item);
      StateUtils.pushHistorySnapshot();
      this.render();
    });

    row.addEventListener('click', (e) => {
      if (e.target.closest('.page-mini-btn') || e.target.closest('.page-rename-input') || e.target.closest('.page-toggle-btn')) return;
      StateUtils.setCurrentPage(page.id, false);
      AppState.selectedId = null;
      AppState.selectedType = 'page';
      Builder.refreshAll();
      this.render();
    });

    const header = document.createElement('div');
    header.className = 'page-item-header';

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "page-switch-btn";
    btn.textContent = page.name + (page.id === AppState.app.initialPageId ? " (Initial)" : "");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      StateUtils.setCurrentPage(page.id, false);
      AppState.selectedId = null;
      AppState.selectedType = "page";
      Builder.refreshAll();
      this.render();
    });
    header.appendChild(btn);

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'page-toggle-btn';
    toggleBtn.title = 'Show page actions';
    toggleBtn.textContent = '▼';
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const panel = row.parentElement;
      if (panel) {
        panel.querySelectorAll('.page-item.expanded').forEach((item) => {
          if (item !== row) {
            item.classList.remove('expanded');
            const otherToggle = item.querySelector('.page-toggle-btn');
            if (otherToggle) otherToggle.textContent = '▼';
          }
        });
      }
      row.classList.toggle('expanded');
      toggleBtn.textContent = row.classList.contains('expanded') ? '▲' : '▼';
    });
    header.appendChild(toggleBtn);
    row.appendChild(header);
    btn.addEventListener('dblclick', (e) => { e.stopPropagation(); this._startRename(page, btn, row); });

    const controls = document.createElement("div"); controls.className = "page-controls";

    const up = document.createElement("button"); up.type = "button"; up.className = "page-mini-btn"; up.textContent = "◀"; up.title = "Move page left";
    up.addEventListener("click", (e) => { e.stopPropagation(); this.reorderPage(page.id, -1); });

    const down = document.createElement("button"); down.type = "button"; down.className = "page-mini-btn"; down.textContent = "▶"; down.title = "Move page right";
    down.addEventListener("click", (e) => { e.stopPropagation(); this.reorderPage(page.id, 1); });

    const copy = document.createElement("button"); copy.type = "button"; copy.className = "page-mini-btn"; copy.textContent = "📋"; copy.title = "Duplicate page";
    copy.addEventListener("click", (e) => { e.stopPropagation(); this.duplicatePage(page.id); });

    const rename = document.createElement('button'); rename.type = 'button'; rename.className = 'page-mini-btn'; rename.textContent = '✎'; rename.title = "Rename page";
    rename.addEventListener('click', (e) => { e.stopPropagation(); this._startRename(page, btn, row); });

    const del = document.createElement("button"); del.type = "button"; del.className = "page-mini-btn danger"; del.textContent = "🗑"; del.title = "Delete page";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      if (AppState.app.pages.length <= 1) { this.showConfirm('Deleting this page will remove your only page. Are you sure?', () => {} , 'OK', 'Cancel'); return; }
      this.showConfirm(`Delete page \"${page.name}\"?`, () => this.deletePage(page.id));
    });

    controls.appendChild(up); controls.appendChild(down); controls.appendChild(copy); controls.appendChild(rename); controls.appendChild(del);
    row.appendChild(controls); panel.appendChild(row);
  },

  addPage() {
    const name = `Page ${AppState.app.pages.length + 1}`;
    const page = StateUtils.createDefaultPage(name);
    page.appBar.title = name;
    AppState.app.pages.push(page);
    StateUtils.setCurrentPage(page.id, false);
    AppState.selectedId = null;
    AppState.selectedType = "page";
    StateUtils.pushHistorySnapshot();
    Builder.refreshAll();
    this.render();
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
    StateUtils.pushHistorySnapshot();
    Builder.refreshAll();
    this.render();
  },

  reorderPage(pageId, offset) {
    const idx = AppState.app.pages.findIndex((p) => p.id === pageId);
    if (idx < 0) return;
    const target = idx + offset;
    if (target < 0 || target >= AppState.app.pages.length) return;
    const pages = AppState.app.pages;
    [pages[idx], pages[target]] = [pages[target], pages[idx]];
    StateUtils.pushHistorySnapshot();
    this.render();
  },

  deletePage(pageId) {
    if (AppState.app.pages.length <= 1) return;
    AppState.app.pages = AppState.app.pages.filter((p) => p.id !== pageId);
    if (AppState.app.initialPageId === pageId) AppState.app.initialPageId = AppState.app.pages[0].id;
    if (AppState.app.currentPageId === pageId) AppState.app.currentPageId = AppState.app.pages[0].id;
    if (AppState.app.splashScreen.nextScreenId === pageId) AppState.app.splashScreen.nextScreenId = AppState.app.initialPageId;
    StateUtils.pushHistorySnapshot();
    Builder.refreshAll();
    Toast.show("Page deleted");
    this.render();
  },

  showConfirm(message, onOk, okText = 'Yes', cancelText = 'Cancel') {
    const modal = document.getElementById('confirm-modal');
    const msg = document.getElementById('confirm-message');
    const ok = document.getElementById('confirm-ok');
    const cancel = document.getElementById('confirm-cancel');
    if (!modal || !msg || !ok || !cancel) { if (confirm(message)) onOk && onOk(); return; }
    msg.textContent = message; ok.textContent = okText; cancel.textContent = cancelText;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    const cleanup = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); ok.removeEventListener('click', onOkHandler); cancel.removeEventListener('click', onCancel); };
    const onOkHandler = () => { cleanup(); onOk && onOk(); };
    const onCancel = () => { cleanup(); };
    ok.addEventListener('click', onOkHandler);
    cancel.addEventListener('click', onCancel);
  },

  _startRename(page, btn, row) {
    const input = document.createElement('input'); input.type = 'text'; input.value = page.name; input.className = 'page-rename-input';
    btn.replaceWith(input); input.focus();
    const finish = () => { const val = input.value.trim(); if (val) { page.name = val; page.appBar = page.appBar || {}; page.appBar.title = val; StateUtils.pushHistorySnapshot(); } input.replaceWith(btn); this.render(); };
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); if (e.key === 'Escape') { input.value = page.name; input.blur(); } });
  },

  // groups removed: simplified pages UI
};
