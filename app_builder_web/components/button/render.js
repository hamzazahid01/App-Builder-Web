window.ButtonComponent.render = function(component) {
  ButtonStyles.ensure(component);
  const el = document.createElement("button");
  el.type = "button";
  ButtonStyles.applyToElement(el, component);
  if (!AppState.runtimeMode) {
    el.style.pointerEvents = "none";
  } else {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = component.props.action || component.props.onClick;
      executeAction(action);
    });
  }
  return el;
};
