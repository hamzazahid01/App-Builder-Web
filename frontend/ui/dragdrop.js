window.DragDrop = {
  initLibrary() {
    const library = document.getElementById("component-library");
    library.innerHTML = "";

    for (const item of ComponentCatalog) {
      const el = document.createElement("button");
      el.className = "library-item";
      el.textContent = item.label;
      el.draggable = true;
      el.type = "button";
      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ source: "library", type: item.type }));
      });
      library.appendChild(el);
    }
  },

  initCanvasDropzone() {
    const preview = document.getElementById("mobile-preview");
    preview.addEventListener("dragover", (e) => {
      e.preventDefault();
      preview.classList.add("dropzone-active");
    });

    preview.addEventListener("dragleave", () => preview.classList.remove("dropzone-active"));
    preview.addEventListener("drop", (e) => {
      e.preventDefault();
      preview.classList.remove("dropzone-active");
      if (AppState.runtimeMode) return;
      this.handleDrop(null, e.dataTransfer.getData("text/plain"));
    });

    preview.addEventListener("click", () => {
      if (AppState.runtimeMode) return;
      AppState.selectedId = null;
      AppState.selectedType = "page";
      Inspector.render();
      renderPreview();
    });
  },

  handleDrop(targetContainerId, payloadString) {
    if (AppState.runtimeMode) return;
    if (!payloadString) return;
    const payload = JSON.parse(payloadString);
    const page = StateUtils.getCurrentPage();
    if (!page) return;

    let targetList = page.components;
    if (targetContainerId) {
      const targetNode = StateUtils.findById(page.components, targetContainerId);
      if (!targetNode || !ComponentFactory.supportsChildren(targetNode.type)) return;
      targetList = targetNode.children;
    }

    if (payload.source === "library") {
      targetList.push(ComponentFactory.create(payload.type));
      renderPreview();
      return;
    }

    if (payload.source === "node") {
      if (payload.id === targetContainerId) return;
      const moved = StateUtils.removeById(page.components, payload.id);
      if (!moved) return;
      targetList.push(moved);
      renderPreview();
      Inspector.render();
    }
  }
};
