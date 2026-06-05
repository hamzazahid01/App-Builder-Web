window.InspectorPresets = {
  buttonPresets: [
    {
      id: "primary",
      name: "Primary",
      styles: {
        backgroundType: "solid",
        backgroundColor: "#2563eb",
        textColor: "#ffffff",
        borderRadius: 10,
        shadow: { enabled: true, color: "#000000", opacity: 0.25, blur: 8, spread: 0, offsetX: 0, offsetY: 4 }
      }
    },
    {
      id: "secondary",
      name: "Secondary",
      styles: {
        backgroundType: "solid",
        backgroundColor: "#64748b",
        textColor: "#ffffff",
        borderRadius: 10,
        shadow: { enabled: false }
      }
    },
    {
      id: "success",
      name: "Success",
      styles: {
        backgroundType: "solid",
        backgroundColor: "#16a34a",
        textColor: "#ffffff",
        borderRadius: 10,
        shadow: { enabled: true, color: "#000000", opacity: 0.2, blur: 6, spread: 0, offsetX: 0, offsetY: 3 }
      }
    },
    {
      id: "danger",
      name: "Danger",
      styles: {
        backgroundType: "solid",
        backgroundColor: "#dc2626",
        textColor: "#ffffff",
        borderRadius: 10,
        shadow: { enabled: true, color: "#000000", opacity: 0.25, blur: 8, spread: 0, offsetX: 0, offsetY: 4 }
      }
    },
    {
      id: "warning",
      name: "Warning",
      styles: {
        backgroundType: "solid",
        backgroundColor: "#f59e0b",
        textColor: "#ffffff",
        borderRadius: 10,
        shadow: { enabled: true, color: "#000000", opacity: 0.2, blur: 6, spread: 0, offsetX: 0, offsetY: 3 }
      }
    },
    {
      id: "ghost",
      name: "Ghost",
      styles: {
        backgroundType: "transparent",
        backgroundColor: "transparent",
        textColor: "#2563eb",
        borderRadius: 10,
        borderEnabled: true,
        borderWidth: 1,
        borderColor: "#2563eb",
        shadow: { enabled: false }
      }
    },
    {
      id: "gradient",
      name: "Gradient",
      styles: {
        backgroundType: "gradient",
        gradientStart: "#667eea",
        gradientEnd: "#764ba2",
        textColor: "#ffffff",
        borderRadius: 10,
        shadow: { enabled: true, color: "#000000", opacity: 0.3, blur: 12, spread: 0, offsetX: 0, offsetY: 4 }
      }
    },
    {
      id: "outline",
      name: "Outline",
      styles: {
        backgroundType: "transparent",
        backgroundColor: "transparent",
        textColor: "#2563eb",
        borderRadius: 10,
        borderEnabled: true,
        borderWidth: 2,
        borderColor: "#2563eb",
        shadow: { enabled: false }
      }
    }
  ],

  customPresets: [],

  applyPreset(component, presetId) {
    const preset = this.buttonPresets.find(p => p.id === presetId) || this.customPresets.find(p => p.id === presetId);
    if (!preset) return false;

    Object.keys(preset.styles).forEach(key => {
      if (typeof preset.styles[key] === 'object' && preset.styles[key] !== null) {
        component.styles[key] = { ...component.styles[key], ...preset.styles[key] };
      } else {
        component.styles[key] = preset.styles[key];
      }
    });

    renderPreview();
    return true;
  },

  saveCustomPreset(component, name) {
    const preset = {
      id: `custom_${Date.now()}`,
      name: name || `Custom ${this.customPresets.length + 1}`,
      styles: JSON.parse(JSON.stringify(component.styles))
    };
    this.customPresets.push(preset);
    return preset;
  },

  deleteCustomPreset(presetId) {
    const index = this.customPresets.findIndex(p => p.id === presetId);
    if (index > -1) {
      this.customPresets.splice(index, 1);
      return true;
    }
    return false;
  },

  getAllPresets() {
    return [...this.buttonPresets, ...this.customPresets];
  },

  createPresetDropdown(panel, component) {
    const presetContainer = document.createElement("div");
    presetContainer.className = "preset-dropdown";

    const label = document.createElement("label");
    label.textContent = "Button Preset";
    label.style.fontSize = "12px";
    label.style.color = "var(--inspector-text-secondary)";
    label.style.fontWeight = "600";
    label.style.display = "block";
    label.style.marginBottom = "6px";
    presetContainer.appendChild(label);

    const select = document.createElement("select");
    select.style.width = "100%";
    select.style.padding = "10px 12px";
    select.style.borderRadius = "8px";
    select.style.border = "1px solid var(--inspector-field-border)";
    select.style.background = "var(--inspector-field-bg)";
    select.style.color = "var(--inspector-text-primary)";
    select.style.fontSize = "13px";
    select.style.outline = "none";
    select.style.cursor = "pointer";

    const presets = this.getAllPresets();
    presets.forEach(preset => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.name;
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      if (e.target.value) {
        this.applyPreset(component, e.target.value);
      }
    });

    presetContainer.appendChild(select);
    return presetContainer;
  }
};
