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
