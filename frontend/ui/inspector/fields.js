function createField(label, inputEl) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  const l = document.createElement("label");
  l.textContent = label;
  wrap.appendChild(l);
  wrap.appendChild(inputEl);
  return wrap;
}

function createTextInput(value, onChange) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value ?? "";
  input.addEventListener("input", (e) => onChange(e.target.value));
  return input;
}

function createButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = "secondary-btn";
  button.addEventListener("click", onClick);
  return button;
}

function createSelect(options, value, onChange) {
  const select = document.createElement("select");
  for (const opt of options) {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    if (opt.value === value) o.selected = true;
    select.appendChild(o);
  }
  select.addEventListener("change", (e) => onChange(e.target.value));
  return select;
}

function createColorInput(value, onChange) {
  const input = document.createElement("input");
  input.type = "color";
  input.value = value ?? "#000000";
  input.addEventListener("input", (e) => onChange(e.target.value));
  return input;
}

function createCheckbox(value, onChange) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = !!value;
  input.addEventListener("change", (e) => onChange(e.target.checked));
  return input;
}

function createStepper(value, onChange, step = 1) {
  const wrap = document.createElement("div");
  wrap.className = "stepper";
  const input = document.createElement("input");
  input.type = "number";
  input.step = `${step}`;
  input.value = Number(value ?? 0);
  input.addEventListener("input", (e) => onChange(Number(e.target.value)));
  const btns = document.createElement("div");
  btns.className = "stepper-buttons";
  const up = document.createElement("button");
  up.type = "button";
  up.textContent = "▲";
  up.addEventListener("click", () => {
    input.value = Number(input.value) + step;
    onChange(Number(input.value));
  });
  const down = document.createElement("button");
  down.type = "button";
  down.textContent = "▼";
  down.addEventListener("click", () => {
    input.value = Number(input.value) - step;
    onChange(Number(input.value));
  });
  btns.appendChild(up);
  btns.appendChild(down);
  wrap.appendChild(input);
  wrap.appendChild(btns);
  return wrap;
}

function createRangeInput(value, min, max, step, onChange) {
  const input = document.createElement("input");
  input.type = "range";
  input.min = `${min}`;
  input.max = `${max}`;
  input.step = `${step}`;
  input.value = Number(value ?? min);
  input.addEventListener("input", (e) => onChange(parseFloat(e.target.value)));
  return input;
}

function createFontPicker(current, onChange) {
  const grid = document.createElement("div");
  grid.className = "font-picker-grid";
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
  grid.style.gap = "8px";
  grid.style.marginTop = "8px";
  for (const font of TextStyles.FONT_OPTIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = font;
    button.style.fontFamily = font;
    button.style.padding = "10px 12px";
    button.style.borderRadius = "8px";
    button.style.border = font === current ? "2px solid #2563eb" : "1px solid #d1d5db";
    button.style.background = font === current ? "#eff6ff" : "#ffffff";
    button.style.cursor = "pointer";
    button.style.textAlign = "left";
    button.addEventListener("click", () => onChange(font));
    grid.appendChild(button);
  }
  return grid;
}
