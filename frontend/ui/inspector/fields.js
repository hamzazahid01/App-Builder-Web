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

function createStyleToggle(label, value, onChange) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = value ? "style-toggle active" : "style-toggle";
  button.addEventListener("click", () => onChange(!value));
  return button;
}

function createRange(value, min, max, step, onChange) {
  const input = document.createElement("input");
  input.type = "range";
  input.min = `${min}`;
  input.max = `${max}`;
  input.step = `${step}`;
  input.value = Number(value ?? min);
  input.addEventListener("input", (e) => onChange(parseFloat(e.target.value)));
  return input;
}

function createFileUpload(currentValue, onChange, accept = "image/*") {
  const wrapper = document.createElement("div");
  wrapper.className = "file-upload-wrapper";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = accept;
  fileInput.style.display = "none";

  const uploadBtn = document.createElement("button");
  uploadBtn.type = "button";
  uploadBtn.className = "file-upload-btn";
  uploadBtn.textContent = currentValue ? "Change Image" : "Upload Image";
  uploadBtn.style.padding = "8px 12px";
  uploadBtn.style.borderRadius = "6px";
  uploadBtn.style.border = "1px solid var(--inspector-field-border)";
  uploadBtn.style.background = "rgba(99, 102, 241, 0.2)";
  uploadBtn.style.color = "#818cf8";
  uploadBtn.style.cursor = "pointer";
  uploadBtn.style.fontSize = "12px";
  uploadBtn.style.fontWeight = "500";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "file-remove-btn";
  removeBtn.textContent = "Remove";
  removeBtn.style.padding = "8px 12px";
  removeBtn.style.borderRadius = "6px";
  removeBtn.style.border = "1px solid var(--inspector-field-border)";
  removeBtn.style.background = "rgba(239, 68, 68, 0.15)";
  removeBtn.style.color = "#f87171";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.fontSize = "12px";
  removeBtn.style.fontWeight = "500";
  removeBtn.style.display = currentValue ? "inline-block" : "none";

  const preview = document.createElement("div");
  preview.className = "image-preview";
  preview.style.marginTop = "8px";
  preview.style.borderRadius = "6px";
  preview.style.overflow = "hidden";
  preview.style.display = currentValue ? "block" : "none";
  preview.style.maxHeight = "120px";

  if (currentValue) {
    const img = document.createElement("img");
    img.src = currentValue;
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.objectFit = "cover";
    preview.appendChild(img);
  }

  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;

      // Extract image dimensions
      const img = new Image();
      img.onload = () => {
        const result = {
          dataUrl: dataUrl,
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height
        };
        onChange(result);

        // Update preview
        preview.innerHTML = "";
        const previewImg = document.createElement("img");
        previewImg.src = dataUrl;
        previewImg.style.width = "100%";
        previewImg.style.height = "auto";
        previewImg.style.objectFit = "cover";
        preview.appendChild(previewImg);
        preview.style.display = "block";
        uploadBtn.textContent = "Change Image";
        removeBtn.style.display = "inline-block";
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener("click", () => {
    onChange(null);
    preview.innerHTML = "";
    preview.style.display = "none";
    uploadBtn.textContent = "Upload Image";
    removeBtn.style.display = "none";
    fileInput.value = "";
  });

  wrapper.appendChild(uploadBtn);
  wrapper.appendChild(removeBtn);
  wrapper.appendChild(fileInput);
  wrapper.appendChild(preview);

  return wrapper;
}
