window.InputComponent.render = function(component) {
  const s = component.styles || {};
  const p = component.props || {};

  const wrapper = document.createElement("div");
  wrapper.className = "input-element-wrapper";
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = s.label?.position === "left" ? "row" : "column";
  wrapper.style.alignItems = s.label?.position === "left" ? "center" : "stretch";
  wrapper.style.justifyContent = s.align === "center" ? "center" : (s.align === "right" ? "flex-end" : "flex-start");
  wrapper.style.marginTop = `${s.margin?.top ?? 0}px`;
  wrapper.style.marginRight = `${s.margin?.right ?? 0}px`;
  wrapper.style.marginBottom = `${s.margin?.bottom ?? 0}px`;
  wrapper.style.marginLeft = `${s.margin?.left ?? 0}px`;

  let labelEl = null;
  if (s.label?.enabled) {
    labelEl = document.createElement("label");
    labelEl.className = "input-label";
    labelEl.textContent = s.label.text || "Label";
    labelEl.style.marginBottom = s.label.position === "top" ? "6px" : "0px";
    if (s.label.position === "left") labelEl.style.marginRight = "8px";
    wrapper.appendChild(labelEl);
  }

  let inputEl;
  const type = p.inputType || "text";
  const makeInput = (t) => {
    const i = document.createElement("input");
    i.type = t;
    return i;
  };

  if (type === "textarea" || type === "multiline") {
    inputEl = document.createElement("textarea");
    inputEl.rows = Math.max(3, Math.floor((component.layout?.height || 80) / 24));
  } else if (type === "select") {
    inputEl = document.createElement("select");
    (p.options || []).forEach(opt => {
      const o = document.createElement("option"); o.value = opt; o.textContent = opt; inputEl.appendChild(o);
    });
  } else if (type === "otp") {
    const otpLen = p.otpLength || 4;
    inputEl = document.createElement("div");
    inputEl.className = "otp-wrapper";
    inputEl.style.display = "flex";
    inputEl.style.gap = "8px";
    for (let i = 0; i < otpLen; i++) {
      const box = document.createElement("input");
      box.type = "text";
      box.maxLength = 1;
      box.style.width = "36px";
      box.style.height = "40px";
      box.style.textAlign = "center";
      box.style.boxSizing = "border-box";
      inputEl.appendChild(box);
    }
  } else if (type === "checkbox" || type === "radio") {
    inputEl = makeInput(type);
  } else {
    inputEl = (type === "file") ? makeInput("file") : makeInput(type === "range" ? "range" : type);
  }

  if (inputEl.tagName === "INPUT" || inputEl.tagName === "TEXTAREA" || inputEl.tagName === "SELECT") {
    if (p.placeholder) inputEl.placeholder = p.placeholder;
    if (p.value && inputEl.tagName !== "SELECT") inputEl.value = p.value;
    inputEl.readOnly = !!s.readonly || !!s.disabled || !AppState.runtimeMode;
    inputEl.disabled = !!s.disabled;
    if (p.accept) inputEl.accept = p.accept;
    if (p.multiple) inputEl.multiple = true;
    inputEl.style.width = "100%";
    inputEl.style.height = "100%";
    inputEl.style.boxSizing = "border-box";
    inputEl.style.borderStyle = s.borderEnabled ? s.borderStyle || "solid" : "none";
    inputEl.style.borderColor = s.borderEnabled ? s.borderColor : "transparent";
    inputEl.style.borderWidth = s.borderEnabled ? `${s.borderWidth}px` : "0px";
    inputEl.style.borderRadius = `${s.borderRadiusCorners?.tl ?? s.borderRadius}px`;
    inputEl.style.background = (s.background && s.background.enabled && s.background.type === "solid") ? s.background.color : "transparent";
    inputEl.style.color = s.color || "#000000";
    inputEl.style.paddingTop = `${s.padding?.top ?? 6}px`;
    inputEl.style.paddingRight = `${s.padding?.right ?? 8}px`;
    inputEl.style.paddingBottom = `${s.padding?.bottom ?? 6}px`;
    inputEl.style.paddingLeft = `${s.padding?.left ?? 8}px`;
    inputEl.style.fontSize = `${s.fontSize ?? 14}px`;
    inputEl.style.fontFamily = s.fontFamily || "Inter";
    if (s.opacity != null) inputEl.style.opacity = `${s.opacity}`;
  }

  const helper = document.createElement("div");
  helper.className = "input-helper";
  helper.style.fontSize = "12px";
  helper.style.color = "#6b7280";
  helper.style.marginTop = "6px";
  if (s.helperText?.enabled) helper.textContent = s.helperText.text || "";

  const charCount = document.createElement("span");
  charCount.className = "char-count";
  charCount.style.marginLeft = "8px";
  charCount.style.fontSize = "11px";
  charCount.style.color = "#94a3b8";

  function validateAndUpdate() {
    let val = "";
    if (inputEl.tagName === "DIV" && inputEl.classList.contains("otp-wrapper")) {
      val = Array.from(inputEl.querySelectorAll("input")).map(i => i.value).join("");
    } else if (inputEl.tagName === "SELECT") {
      val = inputEl.value;
    } else {
      val = inputEl.value ?? "";
    }

    let error = null;
    const v = s.validation || {};
    if (v.required && !val) error = v.customMessage || "This field is required";
    if (!error && v.minLength != null && val.length < v.minLength) error = v.customMessage || `Minimum ${v.minLength} characters`;
    if (!error && v.maxLength != null && val.length > v.maxLength) error = v.customMessage || `Maximum ${v.maxLength} characters`;
    if (!error && v.pattern) {
      try {
        const re = new RegExp(v.pattern);
        if (!re.test(val)) error = v.customMessage || "Invalid format";
      } catch (e) { }
    }
    if (!error && p.inputType === "email") {
      const ok = /\S+@\S+\.\S+/.test(val);
      if (val && !ok) error = v.customMessage || "Invalid email";
    }

    if (error) {
      helper.textContent = error;
      helper.style.color = "#dc2626";
      if (inputEl.style) inputEl.style.borderColor = s.states?.error?.borderColor || "#dc2626";
    } else {
      if (s.helperText?.enabled) helper.textContent = s.helperText.text || ""; else helper.textContent = "";
      helper.style.color = "#6b7280";
      if (inputEl.style) inputEl.style.borderColor = s.borderEnabled ? s.borderColor : "transparent";
    }

    if (s.characterLimit != null) {
      charCount.textContent = `${val.length}/${s.characterLimit}`;
    } else {
      charCount.textContent = "";
    }

    component.props.value = val;
  }

  if (inputEl.tagName === "DIV" && inputEl.classList.contains("otp-wrapper")) {
    inputEl.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("input", () => { validateAndUpdate(); });
    });
  } else if (inputEl.tagName === "SELECT") {
    inputEl.addEventListener("change", () => { validateAndUpdate(); });
  } else {
    inputEl.addEventListener("input", () => { validateAndUpdate(); });
  }

  inputEl.addEventListener("focus", () => {
    if (s.states?.focus) {
      inputEl.style.borderColor = s.states.focus.borderColor || inputEl.style.borderColor;
      if (s.states.focus.shadowEnabled && s.shadow) inputEl.style.boxShadow = buildBoxShadowString({ ...s.shadow, enabled: true });
    }
  });
  inputEl.addEventListener("blur", () => { validateAndUpdate(); if (s.shadow) inputEl.style.boxShadow = s.shadow?.enabled ? buildBoxShadowString(s.shadow) : "none"; });

  let filePreview = null;
  if (p.inputType === "file") {
    filePreview = document.createElement("div");
    filePreview.style.marginTop = "6px";
    filePreview.style.fontSize = "12px";
    filePreview.style.color = "#374151";
    inputEl.addEventListener("change", (e) => {
      const files = e.target.files || [];
      filePreview.textContent = Array.from(files).map(f => f.name).join(", ");
    });
  }

  wrapper.appendChild(inputEl);
  if (labelEl && s.label?.position === "bottom") wrapper.appendChild(labelEl);
  const helperWrap = document.createElement("div");
  helperWrap.style.display = "flex";
  helperWrap.style.alignItems = "center";
  helperWrap.appendChild(helper);
  helperWrap.appendChild(charCount);
  wrapper.appendChild(helperWrap);
  if (filePreview) wrapper.appendChild(filePreview);

  const runtimeHandler = (e) => {
    if (!AppState.runtimeMode) return;
    if (s.interaction?.clickable && s.interaction?.href) {
      window.open(s.interaction.href, "_blank");
    }
  };

  bindEditSelect(wrapper, component, runtimeHandler);
  validateAndUpdate();
  return wrapper;
};
