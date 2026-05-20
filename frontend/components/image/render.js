window.ImageComponent.render = function(component) {
  const s = component.styles;
  const wrapper = document.createElement("div");
  wrapper.className = "image-element-wrapper";
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";
  wrapper.style.position = "relative";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.overflow = s.crop?.enabled ? "hidden" : "visible";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = s.align === "center" ? "center" : s.align === "right" ? "flex-end" : "flex-start";
  wrapper.style.justifyContent = s.align === "center" ? "center" : "flex-start";
  wrapper.style.backgroundColor = s.background.enabled && s.background.type === "solid" ? s.background.color : "transparent";
  if (s.background.enabled && s.background.type === "gradient") {
    wrapper.style.backgroundImage = `linear-gradient(${s.background.gradientAngle ?? 90}deg, ${s.background.gradientStart}, ${s.background.gradientEnd})`;
  } else {
    wrapper.style.backgroundImage = "none";
  }
  wrapper.style.borderRadius = s.displayType === "circle" ? "50%" : `${s.borderRadiusCorners?.tl ?? s.borderRadius}px ${s.borderRadiusCorners?.tr ?? s.borderRadius}px ${s.borderRadiusCorners?.br ?? s.borderRadius}px ${s.borderRadiusCorners?.bl ?? s.borderRadius}px`;
  wrapper.style.borderWidth = s.borderEnabled ? `${s.borderWidth}px` : "0px";
  wrapper.style.borderStyle = s.borderEnabled ? s.borderStyle : "none";
  wrapper.style.borderColor = s.borderColor;
  wrapper.style.boxShadow = buildBoxShadowString(s.shadow);
  wrapper.style.opacity = s.opacity ?? 1;
  wrapper.style.marginTop = `${s.margin?.top ?? 0}px`;
  wrapper.style.marginRight = `${s.margin?.right ?? 0}px`;
  wrapper.style.marginBottom = `${s.margin?.bottom ?? 0}px`;
  wrapper.style.marginLeft = `${s.margin?.left ?? 0}px`;
  wrapper.style.paddingTop = `${s.padding?.top ?? 0}px`;
  wrapper.style.paddingRight = `${s.padding?.right ?? 0}px`;
  wrapper.style.paddingBottom = `${s.padding?.bottom ?? 0}px`;
  wrapper.style.paddingLeft = `${s.padding?.left ?? 0}px`;
  wrapper.style.transform = s.rotation ? `rotate(${s.rotation}deg)` : "";

  const image = document.createElement("img");
  image.src = component.props.src || component.props.srcUrl || s.placeholderSrc;
  image.alt = component.props.alt || "Image";
  image.loading = s.lazyLoad ? "lazy" : "eager";
  image.style.width = "100%";
  image.style.height = "100%";
  image.style.objectFit = s.fit || "cover";
  image.style.objectPosition = `${50 + (s.crop?.x ?? 0)}% ${50 + (s.crop?.y ?? 0)}%`;
  image.style.filter = buildImageFilterString(s.filters);
  image.style.transform = `${s.crop?.rotation ? `rotate(${s.crop.rotation}deg) ` : ""}scaleX(${s.flipHorizontal ? -1 : 1}) scaleY(${s.flipVertical ? -1 : 1})`;
  image.style.display = "block";
  image.style.margin = "0";
  image.draggable = false;

  if (!s.crop?.enabled) {
    image.style.width = "100%";
    image.style.height = "100%";
  }

  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.pointerEvents = "none";
  if (s.overlay.enabled) {
    if (s.overlay.type === "gradient") {
      overlay.style.backgroundImage = `linear-gradient(${s.overlay.gradientAngle ?? 90}deg, ${s.overlay.gradientStart}, ${s.overlay.gradientEnd})`;
    } else {
      overlay.style.backgroundColor = s.overlay.color;
    }
    overlay.style.opacity = s.overlay.opacity ?? 0.2;
  } else {
    overlay.style.background = "none";
    overlay.style.opacity = "0";
  }

  wrapper.appendChild(image);
  wrapper.appendChild(overlay);

  const runtimeHandler = (e) => {
    if (!AppState.runtimeMode) return;
    if (s.interaction?.clickable && s.interaction?.href) {
      window.open(s.interaction.href, "_blank");
    }
  };

  if (s.interaction?.hoverEffect && s.interaction.hoverEffect !== "none") {
    const originalFilter = wrapper.style.filter || "";
    const originalTransform = wrapper.style.transform || "";
    wrapper.addEventListener("mouseenter", () => {
      if (s.interaction.hoverEffect === "zoom") {
        wrapper.style.transform = `${originalTransform} scale(1.05)`;
      }
      if (s.interaction.hoverEffect === "glow") {
        wrapper.style.filter = "drop-shadow(0 0 12px rgba(255,255,255,0.6))";
      }
    });
    wrapper.addEventListener("mouseleave", () => {
      wrapper.style.transform = originalTransform;
      wrapper.style.filter = originalFilter;
    });
  }

  bindEditSelect(wrapper, component, runtimeHandler);
  return wrapper;
};
