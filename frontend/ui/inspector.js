function deleteSelectedComponent() {
  StateUtils.deleteSelected();
}

function buildSimplePagePanel(panel, page) {
  panel.appendChild(createAccordion("Screen", (content) => {
    content.appendChild(createField("Background color", createColorInput(page.backgroundColor, (v) => {
      page.backgroundColor = v;
      renderPreview();
    })));
    content.appendChild(createField("Screen name", createTextInput(page.name, (v) => {
      page.name = v;
      updateScreenLabel();
    })));
    content.appendChild(createField("Top bar title (App Preview)", createTextInput(page.appBar.title || page.name, (v) => {
      page.appBar.title = v;
      page.appBar.enabled = true;
    })));
  }, true));

  const hint = document.createElement("p");
  hint.className = "inspector-hint";
  hint.textContent = "Drag components from the left and place them on the screen. Click on any element to change its settings.";
  panel.appendChild(hint);
}

function buildComponentAccordions(panel, node) {
  const componentModule = window.ComponentRegistry?.[node.type];
  if (componentModule?.buildInspector) {
    componentModule.buildInspector(panel, node);
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "danger-btn";
    deleteBtn.textContent = "Remove";
    deleteBtn.addEventListener("click", deleteSelectedComponent);
    panel.appendChild(deleteBtn);
    return;
  }

  panel.appendChild(createAccordion("Advanced layout", (content) => {
    if (node.layout) {
      content.appendChild(createField("Left (X)", createStepper(node.layout.x, (v) => {
        node.layout.x = Math.max(0, v);
        renderPreview();
      })));
      content.appendChild(createField("Top (Y)", createStepper(node.layout.y, (v) => {
        node.layout.y = Math.max(0, v);
        renderPreview();
      })));
      content.appendChild(createField("Width Mode", createSelect([
        { value: "auto", label: "Auto" },
        { value: "fixed", label: "Fixed" },
        { value: "fill", label: "Fill" }
      ], node.styles.widthMode || "auto", (v) => {
        node.styles.widthMode = v;
        renderPreview();
      })));
      content.appendChild(createField("Width", createStepper(node.layout.width, (v) => {
        node.layout.width = Math.max(24, v);
        renderPreview();
      })));
      content.appendChild(createField("Height Mode", createSelect([
        { value: "auto", label: "Auto" },
        { value: "fixed", label: "Fixed" }
      ], node.styles.heightMode || "auto", (v) => {
        node.styles.heightMode = v;
        renderPreview();
      })));
      content.appendChild(createField("Height", createStepper(node.layout.height, (v) => {
        node.layout.height = Math.max(24, v);
        renderPreview();
      })));
    }
    if (node.styles.padding) {
      content.appendChild(createSpacingEditor("Inner spacing", node.styles.padding, (k, v) => {
        node.styles.padding[k] = v;
        renderPreview();
      }));
    }
  }, false));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "danger-btn";
  deleteBtn.textContent = "Remove";
  deleteBtn.addEventListener("click", deleteSelectedComponent);
  panel.appendChild(deleteBtn);
}

window.Inspector = {
  render() {
    const panel = document.getElementById("properties-panel");
    panel.innerHTML = "";
    const page = StateUtils.getCurrentPage();
    if (!page) {
      panel.innerHTML = `<div class="empty-state">No screen found.</div>`;
      return;
    }

    if (AppState.selectedType !== "component" || !AppState.selectedId) {
      panel.appendChild(createInspectorHeader("Screen settings", "Edit page layout, background, and navigation."));
      buildSimplePagePanel(panel, page);
      return;
    }

    const node = StateUtils.findById(page.components, AppState.selectedId);
    if (node) {
      const title = `${node.type.charAt(0).toUpperCase() + node.type.slice(1)} settings`;
      const subtitle = node.props?.text || node.props?.value || node.props?.placeholder || `${node.type} component`;
      panel.appendChild(createInspectorHeader(title, subtitle));
    }
    if (!node) {
      AppState.selectedId = null;
      AppState.selectedType = "page";
      this.render();
      return;
    }
    buildComponentAccordions(panel, node);
  }
};
