function createButton() {

  return {

    id: Date.now(),

    type: "button",

    text: "Click Me",

    styles: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      padding: "12px 20px",
      margin: "10px",
      borderRadius: "10px",
      width: "auto",
      textAlign: "center"
    }

  };

}



function renderButton(component) {

  const button = document.createElement("button");

  button.innerText = component.text;

  button.style.backgroundColor =
    component.styles.backgroundColor;

  button.style.color =
    component.styles.color;

  button.style.padding =
    component.styles.padding;

  button.style.margin =
    component.styles.margin;

  button.style.borderRadius =
    component.styles.borderRadius;

  button.style.width =
    component.styles.width;

  button.style.textAlign =
    component.styles.textAlign;

  button.style.border = "none";

  button.style.cursor = "pointer";



  // SELECT COMPONENT
  button.onclick = () => {

    selectedComponent = component;

    showButtonProperties(component);

  };



  return button;

}



function showButtonProperties(component) {

  const panel =
    document.getElementById("properties-panel");

  panel.innerHTML = `

    <label>Button Text</label>
    <input
      type="text"
      value="${component.text}"
      oninput="updateButtonText('${component.id}', this.value)"
    >

    <label>Background Color</label>
    <input
      type="color"
      value="${component.styles.backgroundColor}"
      onchange="updateButtonBackground('${component.id}', this.value)"
    >

    <label>Text Color</label>
    <input
      type="color"
      value="${component.styles.color}"
      onchange="updateButtonColor('${component.id}', this.value)"
    >

  `;

}



function updateButtonText(id, value) {

  const component =
    appData.find(item => item.id == id);

  component.text = value;

  renderPreview();

}



function updateButtonBackground(id, value) {

  const component =
    appData.find(item => item.id == id);

  component.styles.backgroundColor = value;

  renderPreview();

}



function updateButtonColor(id, value) {

  const component =
    appData.find(item => item.id == id);

  component.styles.color = value;

  renderPreview();

}