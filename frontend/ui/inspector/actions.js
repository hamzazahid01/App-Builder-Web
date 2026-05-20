function appendActionSettings(content, node, action) {
  const pages = (AppState.app.pages || []).map((p) => ({ value: p.id, label: p.name || "Untitled" }));
  content.appendChild(createField("Action", createSelect([
    { value: "none", label: "None" },
    { value: "navigate", label: "Go to screen" },
    { value: "openUrl", label: "Open website" },
    { value: "showDialog", label: "Show message" },
    { value: "back", label: "Go back" }
  ], action.type || "none", (v) => {
    action.type = v;
    if (v === "navigate" && !action.targetPageId && pages.length) action.targetPageId = pages[0].value;
    node.props.action = action;
    renderPreview();
    Inspector.render();
  })));

  if (action.type === "navigate" && pages.length) {
    content.appendChild(createField("Target screen", createSelect(pages, action.targetPageId || pages[0].value, (v) => {
      action.targetPageId = v;
      renderPreview();
    })));
  }
  if (action.type === "openUrl") {
    content.appendChild(createField("Website URL", createTextInput(action.url || "", (v) => {
      action.url = v;
      renderPreview();
    })));
  }
  if (action.type === "showDialog") {
    content.appendChild(createField("Message", createTextInput(action.dialogText || "", (v) => {
      action.dialogText = v;
      renderPreview();
    })));
  }
}
