# Frontend Architecture

## Loading model

The frontend currently uses browser globals and plain script tags instead of ES modules. Script order matters and is defined in `frontend/index.html`.

Current core order:

1. `frontend/core/state.js`
2. `frontend/core/components.js`
3. Component modules such as `frontend/components/button/defaults.js`
4. `frontend/core/canvas.js`
5. Style helpers
6. `frontend/core/render.js`
7. UI modules
8. `frontend/script.js`

## Global APIs

Important globals include:

- `window.AppState`
- `window.StateUtils`
- `window.ComponentFactory`
- `window.ComponentRegistry`
- `window.ComponentCatalog`
- `window.Builder`
- `window.Inspector`
- `window.DragDrop`
- `window.PageManager`
- `window.RuntimeEngine`

## Component module pattern

Component modules should register themselves into `window.ComponentRegistry`.

Example:

```js
window.ButtonComponent = {
  type: "button",
  label: "Button",
  getDefaultLayout() {
    return { width: 130, height: 44 };
  },
  create() {
    return {
      ...ComponentFactory.createBase("button"),
      styles: {},
      props: {}
    };
  }
};
window.ComponentRegistry.button = window.ButtonComponent;
```

## Adding a new component

1. Add a folder under `frontend/components/<type>/`.
2. Create `defaults.js` and register the component in `window.ComponentRegistry`.
3. Add the script tag after `core/components.js` in `frontend/index.html`.
4. Add component CSS under `frontend/styles/components/<type>.css`.
5. Create `render.js` and add render method to the component module.
6. Add the render script tag after defaults in `frontend/index.html`.
7. Create `inspector.js` for component-specific inspector logic (optional, in future phases).

## CSS module pattern

The app loads one CSS entrypoint: `frontend/styles/main.css`.

CSS is split by responsibility:

- `frontend/styles/base/`
- `frontend/styles/layout/`
- `frontend/styles/components/`
- `frontend/styles/ui/`
- `frontend/styles/themes/`

`frontend/style.css` is retained as the legacy source reference, but `frontend/index.html` now loads `frontend/styles/main.css`.

## Inspector module pattern

Inspector UI is split into shared utilities:

- `frontend/ui/inspector/fields.js` - field creation helpers
- `frontend/ui/inspector/accordions.js` - accordion and spacing editors
- `frontend/ui/inspector/actions.js` - action settings builder
- `frontend/ui/inspector.js` - main inspector logic

Component-specific inspectors can be added to `components/<type>/inspector.js` in future phases.

## Drag/drop module pattern

Drag/drop functionality is split into shared utilities:

- `frontend/ui/dragdrop/library.js` - component library rendering
- `frontend/ui/dragdrop/ghost.js` - ghost element creation and updates
- `frontend/ui/dragdrop/canvas-dropzone.js` - canvas click and drop handling
- `frontend/ui/dragdrop/resize.js` - resize handle creation
- `frontend/ui/dragdrop.js` - main drag/drop session coordination

## Refactor status

- `ComponentFactory` now supports registry-based `create()` delegation.
- `ComponentFactory.createBase()` provides shared component object creation.
- All components (button, text, image, input, icon, container) have defaults modules.
- All components have render modules.
- `renderComponent()` delegates to `window.ComponentRegistry[type].render`.
- CSS now loads through `frontend/styles/main.css` and is split into base, layout, component, UI, and theme modules.
- Inspector is split into shared utility modules (fields, accordions, actions).
- Drag/drop is split into shared utility modules (library, ghost, canvas-dropzone, resize).

## Next safe phases

- Smoke test: component add, select, edit, drag, save, undo/redo.
- Split remaining component-specific inspector logic from `ui/inspector.js` into component folders.
- Commit and push changes to GitHub.
