window.GroupComponent.buildInspector = function(panel, node) {
  // Group Name section
  panel.appendChild(createAccordion("Group Name", (content) => {
    content.appendChild(createField("Name", createTextInput(node.props.name || "Group", (v) => {
      node.props.name = v;
      renderPreview();
    })));
  }, true));

  // Background section
  panel.appendChild(createAccordion("Background", (content) => {
    content.appendChild(createField("Background color", createColorInput(node.styles.backgroundColor || "#f9fafb", (v) => {
      node.styles.backgroundColor = v;
      renderPreview();
    })));
  }, false));

  // Border section
  panel.appendChild(createAccordion("Border", (content) => {
    content.appendChild(createField("Border width", createStepper(node.styles.borderWidth || 2, (v) => {
      node.styles.borderWidth = v;
      renderPreview();
    })));
    content.appendChild(createField("Border color", createColorInput(node.styles.borderColor || "#d1d5db", (v) => {
      node.styles.borderColor = v;
      renderPreview();
    })));
    content.appendChild(createField("Border radius", createStepper(node.styles.borderRadius || 8, (v) => {
      node.styles.borderRadius = v;
      renderPreview();
    })));
  }, false));

  // Padding section
  panel.appendChild(createAccordion("Padding", (content) => {
    content.appendChild(createSpacingEditor("Padding", node.styles.padding || {}, (k, v) => {
      node.styles.padding[k] = v;
      renderPreview();
    }));
  }, false));

  // Children section - list all children with select buttons
  panel.appendChild(createAccordion("Components", (content) => {
    if (!node.children || node.children.length === 0) {
      const empty = document.createElement("p");
      empty.className = "inspector-note";
      empty.textContent = "Group mein koi component nahi hai";
      content.appendChild(empty);
      return;
    }

    const listContainer = document.createElement("div");
    listContainer.className = "component-list";

    node.children.forEach((child, index) => {
      const row = document.createElement("div");
      row.className = "component-item";
      row.dataset.componentId = child.id;

      const typeLabel = document.createElement("span");
      typeLabel.className = "component-type";
      typeLabel.textContent = child.type;
      row.appendChild(typeLabel);

      const nameLabel = document.createElement("span");
      nameLabel.className = "component-name";
      nameLabel.textContent = child.props?.text || child.props?.value || child.props?.placeholder || `Component ${index + 1}`;
      row.appendChild(nameLabel);

      const selectBtn = document.createElement("button");
      selectBtn.type = "button";
      selectBtn.className = "component-select-btn";
      selectBtn.textContent = "Select";
      selectBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        AppState.selectedId = child.id;
        AppState.selectedType = "component";
        StateUtils.bringToFront(child);
        Builder.refreshAll();
      });
      row.appendChild(selectBtn);

      row.addEventListener("click", () => {
        AppState.selectedId = child.id;
        AppState.selectedType = "component";
        StateUtils.bringToFront(child);
        Builder.refreshAll();
      });

      listContainer.appendChild(row);
    });

    content.appendChild(listContainer);
  }, false));

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "danger-btn";
  deleteBtn.textContent = "Remove Group";
  deleteBtn.addEventListener("click", () => {
    // Move children to page level before deleting group
    if (node.children && node.children.length > 0) {
      const page = StateUtils.getCurrentPage();
      if (page) {
        node.children.forEach(child => {
          StateUtils.reparentComponent(child.id, page.components, child.layout.x, child.layout.y);
        });
      }
    }
    StateUtils.deleteSelected();
  });
  panel.appendChild(deleteBtn);
};
