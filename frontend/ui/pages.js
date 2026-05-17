window.PageManager = {
  render() {
    const panel = document.getElementById("pages-panel");
    panel.innerHTML = "";
    // group pages by groupId if groups exist
    const groups = AppState.app.pageGroups || [];
    const ungrouped = [];
    const groupedMap = {};
    for (const g of groups) groupedMap[g.id] = { group: g, pages: [] };

    for (const page of AppState.app.pages) {
      if (page.groupId && groupedMap[page.groupId]) groupedMap[page.groupId].pages.push(page);
      else ungrouped.push(page);
    }

    // render groups first
    for (const g of groups) {
      const hdr = document.createElement('div');
      hdr.className = 'page-group-header';
      hdr.textContent = g.name;
      panel.appendChild(hdr);
      const list = groupedMap[g.id].pages;
      for (const page of list) this._renderPageItem(panel, page);
    }

    // render ungrouped pages
    for (const page of ungrouped) this._renderPageItem(panel, page);
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

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('drag-over');
      const draggedId = e.dataTransfer.getData('text/plain');
      if (!draggedId || draggedId === page.id) return;
      // find indices
      const idxFrom = AppState.app.pages.findIndex(p => p.id === draggedId);
      const idxTo = AppState.app.pages.findIndex(p => p.id === page.id);
      if (idxFrom === -1 || idxTo === -1) return;
      const [item] = AppState.app.pages.splice(idxFrom, 1);
      AppState.app.pages.splice(idxTo, 0, item);
      StateUtils.pushHistorySnapshot();
      this.render();
    });

    // thumbnail
    const thumb = document.createElement('div');
    thumb.className = 'page-thumb';
    if (page.thumbnail) {
      const img = document.createElement('img');
      img.src = page.thumbnail;
      img.alt = page.name;
      thumb.appendChild(img);
    } else {
      const initials = document.createElement('div');
      initials.className = 'page-initials';
      const txt = (page.name || '').split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase();
      initials.textContent = txt || page.name?.slice(0,2).toUpperCase() || 'P';
      thumb.appendChild(initials);
    }
    row.appendChild(thumb);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "page-switch-btn";
    btn.textContent = page.name + (page.id === AppState.app.initialPageId ? " (Initial)" : "");
    btn.addEventListener("click", () => {
      StateUtils.setCurrentPage(page.id, false);
      AppState.selectedId = null;
      AppState.selectedType = "page";
      Builder.refreshAll();
    });

    // double-click to rename inline
    btn.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this._startRename(page, btn, row);
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

    const rename = document.createElement('button');
    rename.type = 'button';
    rename.className = 'page-mini-btn';
    rename.textContent = '✎';
    rename.addEventListener('click', (e) => { e.stopPropagation(); this._startRename(page, btn, row); });

    const assign = document.createElement('select');
    assign.className = 'page-assign-select';
    const optNone = document.createElement('option'); optNone.value=''; optNone.textContent='No group';
    assign.appendChild(optNone);
    for (const g of AppState.app.pageGroups || []) {
      const o = document.createElement('option'); o.value = g.id; o.textContent = g.name; if (page.groupId === g.id) o.selected = true; assign.appendChild(o);
    }
    assign.addEventListener('change', (e) => { page.groupId = e.target.value || null; StateUtils.pushHistorySnapshot(); this.render(); });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "page-mini-btn danger";
    del.textContent = "×";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      // confirm delete
      if (AppState.app.pages.length <= 1) {
        this.showConfirm('Deleting this page will remove your only page. Are you sure?', () => {} , 'OK', 'Cancel');
        return;
      }
      this.showConfirm(`Delete page \"${page.name}\"?`, () => this.deletePage(page.id));
    });

    controls.appendChild(up);
    controls.appendChild(down);
    controls.appendChild(copy);
    controls.appendChild(rename);
    controls.appendChild(assign);
    controls.appendChild(del);
    row.appendChild(controls);
    panel.appendChild(row);
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
  },

  reorderPage(pageId, offset) {
    const idx = AppState.app.pages.findIndex((p) => p.id === pageId);
    if (idx < 0) return;

  showConfirm(message, onOk, okText = 'Yes', cancelText = 'Cancel') {
    const modal = document.getElementById('confirm-modal');
    const msg = document.getElementById('confirm-message');
    const ok = document.getElementById('confirm-ok');
    const cancel = document.getElementById('confirm-cancel');
    if (!modal || !msg || !ok || !cancel) {
      if (confirm(message)) onOk && onOk();
      return;
    }
    msg.textContent = message;
    ok.textContent = okText;
    cancel.textContent = cancelText;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const cleanup = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); ok.removeEventListener('click', onOkHandler); cancel.removeEventListener('click', onCancel); };
    const onOkHandler = () => { cleanup(); onOk && onOk(); };
    const onCancel = () => { cleanup(); };
    ok.addEventListener('click', onOkHandler);
    cancel.addEventListener('click', onCancel);
  },

  _startRename(page, btn, row) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = page.name;
    input.className = 'page-rename-input';
    btn.replaceWith(input);
    input.focus();
    const finish = () => {
      const val = input.value.trim();
      if (val) {
        page.name = val;
        page.appBar = page.appBar || {};
        page.appBar.title = val;
        StateUtils.pushHistorySnapshot();
      }
      input.replaceWith(btn);
      this.render();
    };
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); if (e.key === 'Escape') { input.value = page.name; input.blur(); } });
  },

  createGroup(name) {
    const id = StateUtils.makeId('group');
    AppState.app.pageGroups = AppState.app.pageGroups || [];
    AppState.app.pageGroups.push({ id, name });
    StateUtils.pushHistorySnapshot();
    this.render();
  }
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
    if (AppState.app.initialPageId === pageId) {
      AppState.app.initialPageId = AppState.app.pages[0].id;
    }
    if (AppState.app.currentPageId === pageId) {
      AppState.app.currentPageId = AppState.app.pages[0].id;
    }
    if (AppState.app.splashScreen.nextScreenId === pageId) {
      AppState.app.splashScreen.nextScreenId = AppState.app.initialPageId;
    }
    StateUtils.pushHistorySnapshot();
    Builder.refreshAll();
    Toast.show("Page deleted");
  }


  showConfirm(message, onOk, okText = 'Yes', cancelText = 'Cancel') {
    const modal = document.getElementById('confirm-modal');
    const msg = document.getElementById('confirm-message');
    const ok = document.getElementById('confirm-ok');
    const cancel = document.getElementById('confirm-cancel');
    if (!modal || !msg || !ok || !cancel) {
      if (confirm(message)) onOk && onOk();
      return;
    }
    msg.textContent = message;
    ok.textContent = okText;
    cancel.textContent = cancelText;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const cleanup = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); ok.removeEventListener('click', onOkHandler); cancel.removeEventListener('click', onCancel); };
    const onOkHandler = () => { cleanup(); onOk && onOk(); };
    const onCancel = () => { cleanup(); };
    ok.addEventListener('click', onOkHandler);
    cancel.addEventListener('click', onCancel);
  },

  _startRename(page, btn, row) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = page.name;
    input.className = 'page-rename-input';
    btn.replaceWith(input);
    input.focus();
    const finish = () => {
      const val = input.value.trim();
      if (val) {
        page.name = val;
        page.appBar = page.appBar || {};
        page.appBar.title = val;
        StateUtils.pushHistorySnapshot();
      }
      input.replaceWith(btn);
      this.render();
    };
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); if (e.key === 'Escape') { input.value = page.name; input.blur(); } });
  },

  createGroup(name) {
    const id = StateUtils.makeId('group');
    AppState.app.pageGroups = AppState.app.pageGroups || [];
    AppState.app.pageGroups.push({ id, name });
    StateUtils.pushHistorySnapshot();
    this.render();
  }
};
