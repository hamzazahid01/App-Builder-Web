function createSpacingEditor(title, spacingObj, onChange) {
  const wrap = document.createElement("div");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "group-toggle";
  toggle.textContent = `${title} (expand)`;
  const grid = document.createElement("div");
  grid.className = "group-grid";
  grid.style.display = "none";
  for (const key of ["top", "right", "bottom", "left"]) {
    grid.appendChild(createField(key, createStepper(spacingObj[key], (v) => onChange(key, v))));
  }
  toggle.addEventListener("click", () => {
    const open = grid.style.display === "grid";
    grid.style.display = open ? "none" : "grid";
    toggle.textContent = `${title} (${open ? "expand" : "collapse"})`;
  });
  wrap.appendChild(toggle);
  wrap.appendChild(grid);
  return wrap;
}

function createAccordion(title, buildContentFn, openByDefault = false, section = null, id = null) {
  const tpl = document.getElementById("accordion-template");
  const root = tpl.content.firstElementChild.cloneNode(true);
  
  // Set unique ID for state tracking
  if (id) {
    root.dataset.accordionId = id;
  }
  
  // Set section attribute for color coding
  if (section) {
    root.dataset.section = section;
  }
  
  const trigger = root.querySelector(".accordion-trigger");
  
  // Create header content with icon
  const headerContent = document.createElement("div");
  headerContent.className = "accordion-header-content";
  
  // Add icon wrapper
  const iconWrapper = document.createElement("div");
  iconWrapper.className = "accordion-icon-wrapper";
  iconWrapper.textContent = getSectionIcon(section);
  headerContent.appendChild(iconWrapper);
  
  // Add title
  const titleEl = document.createElement("span");
  titleEl.className = "accordion-title";
  titleEl.textContent = title;
  headerContent.appendChild(titleEl);
  
  trigger.innerHTML = "";
  trigger.appendChild(headerContent);
  
  // Add chevron
  const chevron = document.createElement("span");
  chevron.className = "accordion-chevron";
  chevron.textContent = "▼";
  chevron.style.fontSize = "10px";
  trigger.appendChild(chevron);
  
  const content = root.querySelector(".accordion-content");
  buildContentFn(content);
  
  trigger.addEventListener("click", () => {
    root.classList.toggle("open");
  });
  
  // Keyboard navigation
  trigger.setAttribute("tabindex", "0");
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      root.classList.toggle("open");
    }
  });
  
  if (openByDefault) root.classList.add("open");
  return root;
}

function getSectionIcon(section) {
  const icons = {
    content: "📝",
    typography: "Aa",
    colors: "🎨",
    states: "⚡",
    layout: "📐",
    animation: "✨",
    interaction: "👆",
    responsive: "📱",
    action: "🔗",
    default: "▸"
  };
  return icons[section] || icons.default;
}

function createInspectorHeader(title, subtitle) {
  const header = document.createElement("div");
  header.className = "inspector-selected-header";
  header.innerHTML = `
    <div class="inspector-selected-copy">
      <div class="inspector-selected-title">${title}</div>
      <p class="inspector-selected-subtitle">${subtitle}</p>
    </div>
    <div class="inspector-selected-actions">
      <button type="button" class="topbar-icon-btn" title="Duplicate">⎘</button>
      <button type="button" class="topbar-icon-btn" title="Delete">×</button>
    </div>
  `;
  return header;
}
