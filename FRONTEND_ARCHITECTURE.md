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
4. Add the component to `window.ComponentCatalog` or generate the catalog from the registry in a later refactor.
5. Add render and inspector modules when that phase is completed.

## Refactor status

- `ComponentFactory` now supports registry-based `create()` delegation.
- `ComponentFactory.createBase()` provides shared component object creation.
- `button` and `container` have first-pass defaults modules.
- `renderComponent()` now checks `window.ComponentRegistry[type].render` before falling back to legacy render functions.

## Next safe phases

- Move remaining defaults from `core/components.js` into component folders.
- Move render functions from `core/render.js` into component render modules.
- Split `ui/inspector.js` into shared field utilities and component-specific inspector modules.
- Split `ui/dragdrop.js` only after component and render modules are stable.
