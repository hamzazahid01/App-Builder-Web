
/* =========================
   CREATE DIV COMPONENT
========================= */

function createDiv() {

  return {

    id: Date.now(),
    type: "div",

    styles: {

      // SIZE
      width: "100%",
      height: "auto",

      // VISUAL
      backgroundColor: "#ffffff",
      opacity: 1,

      // PADDING (individual)
      padding: {
        top: "10px",
        right: "10px",
        bottom: "10px",
        left: "10px"
      },

      // MARGIN (individual)
      margin: {
        top: "10px",
        right: "10px",
        bottom: "10px",
        left: "10px"
      },

      // BORDER
      borderColor: "#ddd",
      borderWidth: "1px",
      borderRadius: "10px",
      borderStyle: "solid",

      // LAYOUT
      direction: "column", // row | column
      gap: "10px"

    },

    children: []

  };

}


/* =========================
   RENDER DIV (NESTED)
========================= */

function renderDiv(component) {

  const div = document.createElement("div");
  div.className = "app-node app-node-div";

  const s = component.styles;


  // SIZE
  div.style.width = s.width;
  div.style.height = s.height;


  // BACKGROUND
  div.style.backgroundColor = s.backgroundColor;
  div.style.opacity = s.opacity;


  // PADDING
  div.style.paddingTop = s.padding.top;
  div.style.paddingRight = s.padding.right;
  div.style.paddingBottom = s.padding.bottom;
  div.style.paddingLeft = s.padding.left;


  // MARGIN
  div.style.marginTop = s.margin.top;
  div.style.marginRight = s.margin.right;
  div.style.marginBottom = s.margin.bottom;
  div.style.marginLeft = s.margin.left;


  // BORDER
  div.style.borderColor = s.borderColor;
  div.style.borderWidth = s.borderWidth;
  div.style.borderStyle = s.borderStyle;
  div.style.borderRadius = s.borderRadius;


  // FLEX LAYOUT
  div.style.display = "flex";
  div.style.flexDirection = s.direction;
  div.style.gap = s.gap;


  // SELECT COMPONENT
  div.onclick = (e) => {
    e.stopPropagation();
    selectedComponent = component;
    showDivProperties(component);
  };


  // CHILDREN RENDERING
  component.children.forEach(child => {

    if (child.type === "button") {
      div.appendChild(renderButton(child));
    }

    if (child.type === "div") {
      div.appendChild(renderDiv(child));
    }

  });


  return div;

}


/* =========================
   PROPERTIES PANEL
========================= */

function showDivProperties(component) {

  const panel = document.getElementById("properties-panel");

  panel.innerHTML = "";


  // TITLE
  panel.appendChild(title("DIV Properties"));


  // SIZE
  panel.appendChild(section("Size"));

  panel.appendChild(input("Width", component.styles.width, (v) => {
    component.styles.width = v;
    renderPreview();
  }));

  panel.appendChild(input("Height", component.styles.height, (v) => {
    component.styles.height = v;
    renderPreview();
  }));


  // BACKGROUND
  panel.appendChild(section("Background"));

  panel.appendChild(color("Background", component.styles.backgroundColor, (v) => {
    component.styles.backgroundColor = v;
    renderPreview();
  }));


  panel.appendChild(input("Opacity", component.styles.opacity, (v) => {
    component.styles.opacity = v;
    renderPreview();
  }));


  // PADDING
  panel.appendChild(section("Padding"));

  panel.appendChild(input("Top", component.styles.padding.top, (v) => {
    component.styles.padding.top = v;
    renderPreview();
  }));

  panel.appendChild(input("Right", component.styles.padding.right, (v) => {
    component.styles.padding.right = v;
    renderPreview();
  }));

  panel.appendChild(input("Bottom", component.styles.padding.bottom, (v) => {
    component.styles.padding.bottom = v;
    renderPreview();
  }));

  panel.appendChild(input("Left", component.styles.padding.left, (v) => {
    component.styles.padding.left = v;
    renderPreview();
  }));


  // MARGIN
  panel.appendChild(section("Margin"));

  panel.appendChild(input("Top", component.styles.margin.top, (v) => {
    component.styles.margin.top = v;
    renderPreview();
  }));

  panel.appendChild(input("Right", component.styles.margin.right, (v) => {
    component.styles.margin.right = v;
    renderPreview();
  }));

  panel.appendChild(input("Bottom", component.styles.margin.bottom, (v) => {
    component.styles.margin.bottom = v;
    renderPreview();
  }));

  panel.appendChild(input("Left", component.styles.margin.left, (v) => {
    component.styles.margin.left = v;
    renderPreview();
  }));


  // BORDER
  panel.appendChild(section("Border"));

  panel.appendChild(color("Border Color", component.styles.borderColor, (v) => {
    component.styles.borderColor = v;
    renderPreview();
  }));

  panel.appendChild(input("Border Radius", component.styles.borderRadius, (v) => {
    component.styles.borderRadius = v;
    renderPreview();
  }));


  // LAYOUT
  panel.appendChild(section("Layout"));

  panel.appendChild(input("Direction (row/column)", component.styles.direction, (v) => {
    component.styles.direction = v;
    renderPreview();
  }));

  panel.appendChild(input("Gap", component.styles.gap, (v) => {
    component.styles.gap = v;
    renderPreview();
  }));


  // ADD CHILD COMPONENTS
  panel.appendChild(section("Add Inside"));

  const btn1 = document.createElement("button");
  btn1.className = "prop-btn";
  btn1.innerText = "Add Button Inside";

  btn1.onclick = () => {
    component.children.push(createButton());
    renderPreview();
  };

  panel.appendChild(btn1);


  const btn2 = document.createElement("button");
  btn2.className = "prop-btn";
  btn2.innerText = "Add DIV Inside";

  btn2.onclick = () => {
    component.children.push(createDiv());
    renderPreview();
  };

  panel.appendChild(btn2);

}


/* =========================
   UI HELPERS
========================= */

function title(text) {
  const el = document.createElement("h2");
  el.className = "prop-title";
  el.innerText = text;
  return el;
}

function section(text) {
  const el = document.createElement("h3");
  el.className = "prop-section";
  el.innerText = text;
  return el;
}

function input(labelText, value, onChange) {

  const wrapper = document.createElement("div");
  wrapper.className = "prop-field";

  const label = document.createElement("label");
  label.className = "prop-label";
  label.innerText = labelText;

  const input = document.createElement("input");
  input.className = "prop-input";
  input.type = "text";
  input.value = value;

  input.oninput = (e) => onChange(e.target.value);

  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return wrapper;
}

function color(labelText, value, onChange) {

  const wrapper = document.createElement("div");
  wrapper.className = "prop-field";

  const label = document.createElement("label");
  label.className = "prop-label";
  label.innerText = labelText;

  const input = document.createElement("input");
  input.className = "prop-color-input";
  input.type = "color";
  input.value = value;

  input.onchange = (e) => onChange(e.target.value);

  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return wrapper;
}