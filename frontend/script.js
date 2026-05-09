let appData = [];

let selectedComponent = null;


function addButtonComponent() {

  const button = createButton();

  appData.push(button);

  renderPreview();

}

function addDivComponent() {

  const div = createDiv();

  appData.push(div);

  renderPreview();

}

window.addEventListener("DOMContentLoaded", () => {
  const preview = document.getElementById("mobile-preview");
  preview.addEventListener("click", clearSelectedComponent);
  showDefaultProperties();
  renderPreview();
});