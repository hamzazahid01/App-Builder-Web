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

function createAccordion(title, buildContentFn, openByDefault = false) {
  const tpl = document.getElementById("accordion-template");
  const root = tpl.content.firstElementChild.cloneNode(true);
  root.querySelector(".accordion-title").textContent = title;
  const content = root.querySelector(".accordion-content");
  buildContentFn(content);
  const trigger = root.querySelector(".accordion-trigger");
  trigger.addEventListener("click", () => root.classList.toggle("open"));
  if (openByDefault) root.classList.add("open");
  return root;
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
