function showDefaultProperties() {
  const panel = document.getElementById("properties-panel");
  if (!panel) return;

  panel.innerHTML = `
    <div class="empty-properties">
      <h3>Select a component</h3>
      <p>Click any DIV or Button in preview to edit styles.</p>
    </div>
  `;
}

function removeComponentById(targetId, nodes = appData) {
  const index = nodes.findIndex((node) => node.id === targetId);
  if (index !== -1) {
    nodes.splice(index, 1);
    return true;
  }

  for (const node of nodes) {
    if (!node.children || !Array.isArray(node.children)) {
      continue;
    }

    const removed = removeComponentById(targetId, node.children);
    if (removed) {
      return true;
    }
  }

  return false;
}

function deleteSelectedComponent(component) {
  if (!component) return;
  const removed = removeComponentById(component.id);
  if (!removed) return;

  selectedComponent = null;
  renderPreview();
  showDefaultProperties();
}
