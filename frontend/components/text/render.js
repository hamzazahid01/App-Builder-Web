window.TextComponent.render = function(component) {
  TextStyles.ensure(component);

  const wrapper = document.createElement("div");
  wrapper.className = "text-element-wrapper";
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.justifyContent = component.styles.verticalAlign === "center" ? "center" : component.styles.verticalAlign === "bottom" ? "flex-end" : "flex-start";
  wrapper.style.alignItems = "stretch";
  wrapper.style.marginTop = `${component.styles.margin?.top ?? 0}px`;
  wrapper.style.marginRight = `${component.styles.margin?.right ?? 0}px`;
  wrapper.style.marginBottom = `${component.styles.margin?.bottom ?? 0}px`;
  wrapper.style.marginLeft = `${component.styles.margin?.left ?? 0}px`;
  wrapper.style.overflow = component.styles.overflow === "scroll" ? "auto" : "visible";

  const backgroundWrapper = document.createElement("div");
  backgroundWrapper.className = "text-background-wrapper";
  backgroundWrapper.style.width = "100%";
  backgroundWrapper.style.height = "100%";
  backgroundWrapper.style.boxSizing = "border-box";
  backgroundWrapper.style.display = "flex";
  backgroundWrapper.style.alignItems = component.styles.verticalAlign === "center" ? "center" : component.styles.verticalAlign === "bottom" ? "flex-end" : "flex-start";
  backgroundWrapper.style.justifyContent = component.styles.textAlign === "center" ? "center" : component.styles.textAlign === "right" ? "flex-end" : "flex-start";
  backgroundWrapper.style.transition = "transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease";

  TextStyles.applyTextBackground(backgroundWrapper, component.styles.textBackground);

  const el = document.createElement("div");
  el.className = "text-element";
  el.style.minHeight = "1em";
  el.style.outline = "none";
  el.style.cursor = component.styles.interaction?.clickable ? "pointer" : "text";
  TextStyles.applyToElement(el, component);

  el.contentEditable = "true";
  el.spellcheck = false;
  el.addEventListener("input", () => {
    component.props.value = el.innerText;
    renderPreview();
  });
  el.addEventListener("blur", () => {
    component.props.value = el.innerText;
  });

  backgroundWrapper.appendChild(el);
  wrapper.appendChild(backgroundWrapper);

  const runtimeHandler = (e) => {
    if (!AppState.runtimeMode && document.activeElement === el) return;
    const action = component.props.action || component.props.onClick;
    if (action && action.type && action.type !== "none") {
      executeAction(action);
      return;
    }
    if (component.styles.interaction?.copyable && !component.styles.interaction?.clickable) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(component.props.value || "");
      }
      return;
    }
    if (component.styles.interaction?.clickable && component.styles.interaction?.href) {
      window.open(component.styles.interaction.href, "_blank");
    }
  };

  if (component.styles.interaction?.hoverEffect && component.styles.interaction.hoverEffect !== "none") {
    const originalTransform = backgroundWrapper.style.transform || "";
    const originalFilter = backgroundWrapper.style.filter || "";
    backgroundWrapper.addEventListener("mouseenter", () => {
      if (component.styles.interaction.hoverEffect === "underline") {
        el.style.textDecoration = `${TextStyles.computeTextDecorationCss(component.styles.textDecoration)} underline`;
      }
      if (component.styles.interaction.hoverEffect === "scale") {
        backgroundWrapper.style.transform = `${originalTransform} scale(1.03)`;
      }
      if (component.styles.interaction.hoverEffect === "color") {
        el.style.filter = "brightness(1.2)";
      }
    });
    backgroundWrapper.addEventListener("mouseleave", () => {
      el.style.textDecoration = TextStyles.computeTextDecorationCss(component.styles.textDecoration);
      backgroundWrapper.style.transform = originalTransform;
      backgroundWrapper.style.filter = originalFilter;
    });
  }

  if (component.styles.rotation) {
    wrapper.style.transform = `rotate(${component.styles.rotation}deg)`;
  }

  TextStyles.applyAnimation(wrapper, component.styles.animation);

  bindEditSelect(wrapper, component, runtimeHandler);
  return wrapper;
};
