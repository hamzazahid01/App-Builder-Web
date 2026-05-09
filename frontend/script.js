let appData = [];

let selectedComponent = null;


function addButtonComponent() {

  const button = createButton();

  appData.push(button);

  renderPreview();

}