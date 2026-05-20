window.ContainerComponent.buildInspector = function(panel, node) {
  panel.appendChild(createAccordion("Container Style", (content) => {
    content.appendChild(createField("Background Color", createColorInput(node.styles.backgroundColor, (v) => {
      node.styles.backgroundColor = v;
      renderPreview();
    })));

    const dir = ComponentFactory.detectFlexDirection(node);
    const info = document.createElement("p");
    info.className = "inspector-note";
    info.textContent = dir === "row"
      ? "Andar ke items side-by-side (wide box)"
      : "Andar ke items upar-neeche (tall box)";
    content.appendChild(info);
  }, true));

  panel.appendChild(createAccordion("Layout", (content) => {
    content.appendChild(createField("Width", createStepper(node.layout.width, (v) => {
      node.layout.width = Math.max(24, v);
      ComponentFactory.syncContainerFlexDirection(node);
      renderPreview();
    }, 1)));

    content.appendChild(createField("Height", createStepper(node.layout.height, (v) => {
      node.layout.height = Math.max(24, v);
      ComponentFactory.syncContainerFlexDirection(node);
      renderPreview();
    }, 1)));
  }, false));

  panel.appendChild(createAccordion("Border", (content) => {
    content.appendChild(createField("Border Width", createStepper(node.styles.borderWidth ?? 0, (v) => {
      node.styles.borderWidth = v;
      renderPreview();
    }, 1)));

    content.appendChild(createField("Border Color", createColorInput(node.styles.borderColor || '#d1d5db', (v) => {
      node.styles.borderColor = v;
      renderPreview();
    })));

    content.appendChild(createField("Border Radius", createStepper(node.styles.borderRadius ?? 10, (v) => {
      node.styles.borderRadius = v;
      renderPreview();
    }, 1)));
  }, false));

  panel.appendChild(createAccordion("Shadow", (content) => {
    content.appendChild(createField("Enable Shadow", createCheckbox(node.styles.shadow?.enabled, (v) => {
      if (!node.styles.shadow) node.styles.shadow = {};
      node.styles.shadow.enabled = v;
      renderPreview();
    })));

    if (node.styles.shadow?.enabled) {
      content.appendChild(createField("Shadow Color", createColorInput(node.styles.shadow.color || '#000000', (v) => {
        node.styles.shadow.color = v;
        renderPreview();
      })));
      content.appendChild(createField("Opacity", createRangeInput(node.styles.shadow.opacity ?? 0.12, 0, 1, 0.01, (v) => {
        node.styles.shadow.opacity = v;
        renderPreview();
      })));
      content.appendChild(createField("Blur", createStepper(node.styles.shadow.blur ?? 8, (v) => {
        node.styles.shadow.blur = v;
        renderPreview();
      }, 1)));
    }
  }, false));

  panel.appendChild(createAccordion("Padding", (content) => {
    content.appendChild(createSpacingEditor('Padding', node.styles.padding || { top: 12, right: 12, bottom: 12, left: 12 }, (k, v) => {
      node.styles.padding[k] = v;
      renderPreview();
    })));
  }, false));
};
