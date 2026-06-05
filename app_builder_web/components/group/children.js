window.GroupChildren = {
  /**
   * Renders all child components inside a group's inner canvas
   * @param {Object} group - The group component
   * @param {HTMLElement} innerCanvas - The group's inner canvas element
   */
  render(group, innerCanvas) {
    innerCanvas.innerHTML = "";

    if (!group.children || group.children.length === 0) {
      if (!AppState.runtimeMode) {
        const hint = document.createElement("div");
        hint.className = "group-hint";
        hint.textContent = "Drag components here";
        hint.style.pointerEvents = "none";
        innerCanvas.appendChild(hint);
      }
      return;
    }

    const fragment = document.createDocumentFragment();
    group.children.forEach((child, index) => {
      StateUtils.ensureComponentLayout(child, index);
      const childEl = this.renderChild(child, group);
      if (childEl) {
        fragment.appendChild(childEl);
      }
    });
    innerCanvas.appendChild(fragment);
  },

  /**
   * Renders a single child component inside group
   * @param {Object} child - The child component
   * @param {Object} group - The parent group
   * @returns {HTMLElement} The wrapped child element
   */
  renderChild(child, group) {
    const inner = window.renderComponent ? window.renderComponent(child) : null;
    if (!inner) return null;

    const wrapper = this.wrapChild(inner, child, group);
    return wrapper;
  },

  /**
   * Wraps a child component with proper event handling
   * @param {HTMLElement} innerEl - The rendered child element
   * @param {Object} child - The child component
   * @param {Object} group - The parent group
   * @returns {HTMLElement} The wrapped element
   */
  wrapChild(innerEl, child, group) {
    const wrapper = document.createElement("div");
    wrapper.className = "canvas-node app-node group-nested-node";
    wrapper.dataset.componentId = child.id;
    wrapper.dataset.groupChild = "true";
    wrapper.dataset.parentId = group.id;

    this.applyChildLayout(wrapper, child);

    innerEl.classList.add("canvas-node-inner");
    innerEl.style.width = "100%";
    innerEl.style.height = "100%";
    innerEl.style.margin = "0";
    innerEl.style.boxSizing = "border-box";
    wrapper.appendChild(innerEl);

    if (AppState.selectedId === child.id) {
      wrapper.classList.add("selected-node");
    }

    if (!AppState.runtimeMode) {
      // Pass group context for nested drag/drop
      wrapper.dataset.groupId = group.id;
      DragDrop.attachNode(wrapper, child);
    }

    innerEl.addEventListener("dblclick", (e) => {
      if (AppState.runtimeMode) return;
      e.stopPropagation();
      AppState.selectedId = child.id;
      AppState.selectedType = "component";
      StateUtils.bringToFront(child);
      Builder.refreshAll();
    });

    return wrapper;
  },

  /**
   * Applies layout to a child element relative to group
   * @param {HTMLElement} el - The child wrapper element
   * @param {Object} child - The child component
   */
  applyChildLayout(el, child) {
    if (!child.layout) return;

    el.style.position = "absolute";
    el.style.left = `${child.layout.x}px`;
    el.style.top = `${child.layout.y}px`;
    el.style.width = `${child.layout.width}px`;
    el.style.height = `${child.layout.height}px`;
    el.style.boxSizing = "border-box";
  },

  /**
   * Adds a child to group
   * @param {Object} group - The parent group
   * @param {Object} child - The child component to add
   * @param {number} x - X position relative to group
   * @param {number} y - Y position relative to group
   */
  addChild(group, child, x = 12, y = 12) {
    if (!group.children) {
      group.children = [];
    }

    child.layout.x = x;
    child.layout.y = y;
    group.children.push(child);
  },

  /**
   * Removes a child from group
   * @param {Object} group - The parent group
   * @param {string} childId - The child component ID to remove
   * @returns {boolean} Whether removal was successful
   */
  removeChild(group, childId) {
    if (!group.children) return false;

    const index = group.children.findIndex(c => c.id === childId);
    if (index > -1) {
      group.children.splice(index, 1);
      return true;
    }
    return false;
  },

  /**
   * Finds a child component by ID within group
   * @param {Object} group - The parent group
   * @param {string} childId - The child component ID
   * @returns {Object|null} The child component or null
   */
  findChild(group, childId) {
    if (!group.children) return null;
    return group.children.find(c => c.id === childId) || null;
  }
};
