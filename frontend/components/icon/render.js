window.IconComponent.render = function(component) {
  const s = component.styles || {};
  const p = component.props || {};

  const wrapper = document.createElement("div");
  wrapper.className = "icon-element-wrapper";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = s.align === "center" ? "center" : (s.align === "right" ? "flex-end" : "flex-start");
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.paddingTop = `${s.padding?.top ?? 0}px`;
  wrapper.style.paddingRight = `${s.padding?.right ?? 0}px`;
  wrapper.style.paddingBottom = `${s.padding?.bottom ?? 0}px`;
  wrapper.style.paddingLeft = `${s.padding?.left ?? 0}px`;
  wrapper.style.marginTop = `${s.margin?.top ?? 0}px`;
  wrapper.style.marginRight = `${s.margin?.right ?? 0}px`;
  wrapper.style.marginBottom = `${s.margin?.bottom ?? 0}px`;
  wrapper.style.marginLeft = `${s.margin?.left ?? 0}px`;
  wrapper.style.background = (s.background && s.background.enabled && s.background.type === "solid") ? s.background.color : "transparent";
  if (s.background && s.background.enabled && s.background.type === "gradient") wrapper.style.backgroundImage = `linear-gradient(${s.background.gradientAngle ?? 90}deg, ${s.background.gradientStart}, ${s.background.gradientEnd})`;
  wrapper.style.border = s.borderEnabled ? `${s.borderWidth ?? 0}px ${s.borderStyle || 'solid'} ${s.borderColor || '#000'}` : "none";
  wrapper.style.borderRadius = `${s.borderRadiusCorners?.tl ?? s.borderRadius}px`;
  wrapper.style.boxShadow = buildBoxShadowString(s.shadow);

  let inner;
  if (p.svg) {
    inner = document.createElement("div");
    inner.className = "icon-svg";
    inner.style.display = "inline-flex";
    inner.style.width = s.widthMode === 'fixed' && s.width ? `${s.width}px` : 'auto';
    inner.style.height = s.heightMode === 'fixed' && s.height ? `${s.height}px` : 'auto';
    inner.innerHTML = p.svg;
    inner.style.color = s.color || '#000000';
    inner.querySelectorAll && inner.querySelectorAll('path').forEach((path) => {
      if (!path.getAttribute('fill') || path.getAttribute('fill') === 'currentColor') path.setAttribute('fill', s.color || '#000000');
    });
  } else if (p.src) {
    inner = document.createElement('img');
    inner.src = p.src;
    inner.alt = s.alt || 'Icon';
    inner.style.width = s.widthMode === 'fixed' && s.width ? `${s.width}px` : '100%';
    inner.style.height = s.heightMode === 'fixed' && s.height ? `${s.height}px` : '100%';
    inner.style.objectFit = 'contain';
  } else {
    inner = document.createElement('span');
    inner.textContent = p.symbol || '';
    inner.style.fontSize = `${s.fontSize ?? 24}px`;
    inner.style.lineHeight = '1';
    inner.style.display = 'inline-flex';
    inner.style.alignItems = 'center';
    inner.style.justifyContent = 'center';
    if (s.gradient && s.gradient.enabled) {
      inner.style.backgroundImage = `linear-gradient(${s.gradient.angle ?? 90}deg, ${s.gradient.start}, ${s.gradient.end})`;
      inner.style.webkitBackgroundClip = 'text';
      inner.style.backgroundClip = 'text';
      inner.style.color = 'transparent';
    } else {
      inner.style.color = s.color || '#000000';
    }
  }

  const tx = `rotate(${s.rotation ?? 0}deg) scaleX(${s.flipHorizontal ? -1 : 1}) scaleY(${s.flipVertical ? -1 : 1})`;
  inner.style.transform = tx;
  inner.style.opacity = s.opacity ?? 1;

  wrapper.appendChild(inner);

  if (s.states?.hover?.effect && s.states.hover.effect !== 'none') {
    const originalTransform = inner.style.transform || '';
    const originalFilter = inner.style.filter || '';
    wrapper.addEventListener('mouseenter', () => {
      if (s.states.hover.effect === 'scale') inner.style.transform = `${originalTransform} scale(1.12)`;
      if (s.states.hover.effect === 'rotate') inner.style.transform = `${originalTransform} rotate(8deg)`;
      if (s.states.hover.effect === 'glow') inner.style.filter = 'drop-shadow(0 0 12px rgba(0,0,0,0.35))';
      if (s.states.hover.effect === 'color' && !p.svg) inner.style.color = s.states.hover.color || s.color;
    });
    wrapper.addEventListener('mouseleave', () => {
      inner.style.transform = originalTransform;
      inner.style.filter = originalFilter;
      if (!p.svg) inner.style.color = s.color || '#000000';
    });
  }

  const runtimeHandler = (e) => {
    if (!AppState.runtimeMode) return;
    const action = component.props.action || component.props.onClick;
    if (action && action.type && action.type !== "none") {
      executeAction(action);
      return;
    }
    if (s.interaction?.clickable && s.interaction?.href) window.open(s.interaction.href, '_blank');
  };

  bindEditSelect(wrapper, component, runtimeHandler);
  return wrapper;
};
