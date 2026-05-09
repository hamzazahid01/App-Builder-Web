

function createButton() {

  return {

    id: Date.now(),

    type: "button",

    text: "Click Me",

    styles: {

      // Layout
      width: "auto",
      height: "auto",
      margin: "10px",
      padding: "12px 20px",

      // Colors
      backgroundColor: "#2563eb",
      color: "#ffffff",

      // Border
      borderRadius: "10px",
      borderWidth: "0px",
      borderColor: "#000000",

      // Typography
      fontSize: "16px",
      fontWeight: "bold",
      textAlign: "center",

      // Effects
      opacity: 1,
      boxShadow: "none",

      // Flex
      alignSelf: "center"
    }

  };

}


/* ==============================
   RENDER BUTTON
============================== */

function renderButton(component) {

  const button = document.createElement("button");
  button.className = "app-node app-node-button";

  button.innerText = component.text;

  applyStyles(button, component.styles);


  // select component on click
  button.onclick = (e) => {
    e.stopPropagation();
    selectedComponent = component;
    showButtonProperties(component);
  };


  return button;

}


/* ==============================
   APPLY STYLES (CORE ENGINE)
============================== */

function applyStyles(el, styles) {

  el.style.width = styles.width;
  el.style.height = styles.height;

  el.style.margin = styles.margin;
  el.style.padding = styles.padding;

  el.style.backgroundColor = styles.backgroundColor;
  el.style.color = styles.color;

  el.style.borderRadius = styles.borderRadius;

  el.style.borderWidth = styles.borderWidth;
  el.style.borderColor = styles.borderColor;
  el.style.borderStyle = "solid";

  el.style.fontSize = styles.fontSize;
  el.style.fontWeight = styles.fontWeight;
  el.style.textAlign = styles.textAlign;

  el.style.opacity = styles.opacity;

  el.style.boxShadow = styles.boxShadow;

  el.style.cursor = "pointer";

}


/* ==============================
   PROPERTIES PANEL
============================== */

function showButtonProperties(component) {

  const panel = document.getElementById("properties-panel");

  panel.innerHTML = "";


  // TEXT
  panel.appendChild(label("Text"));
  panel.appendChild(textInput(component.text, (val) => {
    component.text = val;
    renderPreview();
  }));


  // BACKGROUND
  panel.appendChild(label("Background Color"));
  panel.appendChild(colorInput(component.styles.backgroundColor, (val) => {
    component.styles.backgroundColor = val;
    renderPreview();
  }));


  // TEXT COLOR
  panel.appendChild(label("Text Color"));
  panel.appendChild(colorInput(component.styles.color, (val) => {
    component.styles.color = val;
    renderPreview();
  }));


  // PADDING
  panel.appendChild(label("Padding"));
  panel.appendChild(textInput(component.styles.padding, (val) => {
    component.styles.padding = val;
    renderPreview();
  }));


  // MARGIN
  panel.appendChild(label("Margin"));
  panel.appendChild(textInput(component.styles.margin, (val) => {
    component.styles.margin = val;
    renderPreview();
  }));


  // BORDER RADIUS
  panel.appendChild(label("Border Radius"));
  panel.appendChild(textInput(component.styles.borderRadius, (val) => {
    component.styles.borderRadius = val;
    renderPreview();
  }));


  // FONT SIZE
  panel.appendChild(label("Font Size"));
  panel.appendChild(textInput(component.styles.fontSize, (val) => {
    component.styles.fontSize = val;
    renderPreview();
  }));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "prop-btn prop-btn-danger";
  deleteBtn.innerText = "Delete Component";
  deleteBtn.onclick = () => deleteSelectedComponent(component);
  panel.appendChild(deleteBtn);


}


/* ==============================
   HELPERS
============================== */

function label(text) {
  const el = document.createElement("label");
  el.className = "prop-label";
  el.innerText = text;
  return el;
}

function textInput(value, onChange) {
  const input = document.createElement("input");
  input.className = "prop-input";
  input.type = "text";
  input.value = value;

  input.oninput = (e) => onChange(e.target.value);

  return input;
}

function colorInput(value, onChange) {
  const input = document.createElement("input");
  input.className = "prop-color-input";
  input.type = "color";
  input.value = value;

  input.onchange = (e) => onChange(e.target.value);

  return input;
}
