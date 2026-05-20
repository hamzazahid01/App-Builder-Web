function deleteSelectedComponent() {
  StateUtils.deleteSelected();
}

function buildSimplePagePanel(panel, page) {
  panel.appendChild(createAccordion("Background", (content) => {
    content.appendChild(createField("Background Type", createSelect([
      { value: "solid", label: "Solid Color" },
      { value: "gradient", label: "Gradient" },
      { value: "image", label: "Image" }
    ], page.backgroundType || "solid", (v) => {
      page.backgroundType = v;
      renderPreview();
      Inspector.render();
    })));
    
    content.appendChild(createField("Background Color", createColorInput(page.backgroundColor, (v) => {
      page.backgroundColor = v;
      renderPreview();
    })));
    
    // Gradient settings
    if (page.backgroundType === "gradient") {
      content.appendChild(createField("Gradient Start", createColorInput(page.gradientStart || "#2563eb", (v) => {
        page.gradientStart = v;
        renderPreview();
      })));
      
      content.appendChild(createField("Gradient End", createColorInput(page.gradientEnd || "#7c3aed", (v) => {
        page.gradientEnd = v;
        renderPreview();
      })));
      
      content.appendChild(createField("Gradient Direction", createSelect([
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
        { value: "diagonal", label: "Diagonal" }
      ], page.gradientDirection || "horizontal", (v) => {
        page.gradientDirection = v;
        renderPreview();
      })));
    }
    
    // Image settings
    if (page.backgroundType === "image") {
      content.appendChild(createField("Image URL", createTextInput(page.backgroundImage || "", (v) => {
        page.backgroundImage = v;
        renderPreview();
      })));
      
      content.appendChild(createField("Background Fit", createSelect([
        { value: "cover", label: "Cover" },
        { value: "contain", label: "Contain" },
        { value: "fill", label: "Fill" },
        { value: "stretch", label: "Stretch" }
      ], page.backgroundFit || "cover", (v) => {
        page.backgroundFit = v;
        renderPreview();
      })));
      
      content.appendChild(createField("Background Opacity", createRange(page.backgroundOpacity || 1, 0, 1, 0.1, (v) => {
        page.backgroundOpacity = v;
        renderPreview();
      })));
      
      content.appendChild(createField("Background Blur", createRange(page.backgroundBlur || 0, 0, 20, 1, (v) => {
        page.backgroundBlur = v;
        renderPreview();
      })));
    }
  }, true));

  panel.appendChild(createAccordion("Screen Settings", (content) => {
    content.appendChild(createField("Screen name", createTextInput(page.name, (v) => {
      page.name = v;
      updateScreenLabel();
    })));
    
    content.appendChild(createField("Orientation", createSelect([
      { value: "portrait", label: "Portrait" },
      { value: "landscape", label: "Landscape" },
      { value: "auto", label: "Auto" }
    ], page.orientation || "portrait", (v) => {
      page.orientation = v;
      renderPreview();
    })));
    
    content.appendChild(createField("Safe Area Padding", createCheckbox(page.safeAreaPadding !== false, (v) => {
      page.safeAreaPadding = v;
      renderPreview();
    })));
    
    content.appendChild(createField("Scroll", createCheckbox(page.scroll !== false, (v) => {
      page.scroll = v;
      renderPreview();
    })));
  }, false));

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
    
    // Add search bar
    panel.appendChild(createInspectorSearch());
    
    buildComponentAccordions(panel, node);
  }
};

function createInspectorSearch() {
  const searchContainer = document.createElement("div");
  searchContainer.className = "inspector-search";
  
  const searchIcon = document.createElement("span");
  searchIcon.className = "inspector-search-icon";
  searchIcon.textContent = "🔍";
  
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search properties...";
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    filterInspectorProperties(query);
  });
  
  searchContainer.appendChild(searchIcon);
  searchContainer.appendChild(searchInput);
  return searchContainer;
}

function filterInspectorProperties(query) {
  const panel = document.getElementById("properties-panel");
  const accordions = panel.querySelectorAll(".accordion");
  
  accordions.forEach(accordion => {
    const title = accordion.querySelector(".accordion-title")?.textContent?.toLowerCase() || "";
    const fields = accordion.querySelectorAll(".field label");
    
    let hasMatch = title.includes(query);
    
    if (!hasMatch) {
      fields.forEach(field => {
        const labelText = field.textContent?.toLowerCase() || "";
        if (labelText.includes(query)) {
          hasMatch = true;
        }
      });
    }
    
    if (hasMatch || query === "") {
      accordion.style.display = "block";
      if (query !== "" && hasMatch) {
        accordion.classList.add("open");
      }
    } else {
      accordion.style.display = "none";
    }
  });
}
