# App Builder Website - Codebase Overview

## Quick Summary
This is a **no-code visual app builder** for mobile apps (iPhone/Android) with drag-and-drop component placement, live preview, and property inspection. The architecture uses:
- **Core State Management** (state.js) 
- **Component Factory** (components.js) to define component types
- **Render Engine** (render.js) to build DOM elements
- **UI Modules** (inspector, dragdrop, keyboard, toolbar) for editing

---

## 1. How Containers are Defined as Components

### Location: [frontend/core/components.js](frontend/core/components.js)

**Container Definition:**
```javascript
if (type === "container") {
  return {
    ...common,
    styles: { /* ... */ },
    props: {},
    children: []  // Key: containers hold child components
  };
}
```

**Key Characteristics:**
- **Type**: `"container"` (alongside button, text, image, input, icon)
- **Children Property**: Containers have a `children` array to store nested components
- **Flex Layout**: Auto-detects flex direction (row/column) based on width/height ratio
- **Styles**: Supports backgroundColor, border, borderRadius, opacity, padding
- **Default Size**: 300x200px

### Layout Detection:
```javascript
detectFlexDirection(component) {
  const w = component.layout?.width ?? 300;
  const h = component.layout?.height ?? 200;
  return w >= h ? "row" : "column";  // Wide = row, Tall = column
}
```

### Component Factory:
The `ComponentFactory` object in [frontend/core/components.js](frontend/core/components.js) has:
- `create(type)` - Creates any component type with defaults
- `getDefaultLayout(type)` - Returns default size (container: 300x200)
- `syncContainerFlexDirection()` - Auto-updates flex direction on resize
- Default canvas layouts for all component types

---

## 2. Double-Click Editing Work

### Status: **NOT CURRENTLY IMPLEMENTED**
There is **NO double-click inline editing** in the current codebase.

**What Exists Instead:**
- Click to select a component
- Properties appear in the **Inspector Panel** (right side)
- Edit properties in the inspector (no inline editing)

**Evidence:**
- No `dblclick` event listeners found in any files
- No `contentEditable` attributes used
- [keyboard.js](frontend/ui/keyboard.js) handles Escape to deselect, but no double-click logic

### How to Add Double-Click Editing:
You would need to:
1. Add `dblclick` listeners to [render.js](frontend/core/render.js) for text/button components
2. Make specific properties `contentEditable` or swap in an `<input>` element
3. Exit edit mode on blur/Enter key
4. Update component properties and call `renderPreview()`

---

## 3. Component Properties Inspector

### Location: [frontend/ui/inspector.js](frontend/ui/inspector.js) + [frontend/ui/button-inspector.js](frontend/ui/button-inspector.js)

### Main Inspector (inspector.js):
The `Inspector` object has a `render()` method that:
1. Clears the properties panel
2. Builds different UIs based on component type and selected element
3. Shows three accordion sections:
   - **Basic** - Component-specific properties (text, image link, placeholder, icon, background)
   - **Advanced layout** - Position (X, Y), Size (Width, Height), Padding
   - **Advanced style** - Colors, borders, radius, opacity, text alignment, image fit, input type

### Helper UI Factories in [inspector.js](frontend/ui/inspector.js):
- `createTextInput()` - Text field
- `createColorInput()` - Color picker
- `createSelect()` - Dropdown selector
- `createCheckbox()` - Boolean toggle
- `createStepper()` - Number input with +/- buttons
- `createRange()` - Slider (0-100)
- `createSpacingEditor()` - 4-side margin/padding editor
- `createAccordion()` - Collapsible section with template
- `createField()` - Label + input wrapper

### Button Inspector (button-inspector.js):
Specialized inspector for buttons with:
- **Button Text** section - Edit button text
- **Action** section - Set button actions (Nothing, Show message, Open website, Navigate, Go back)
- **Style** section - Background (solid/gradient/transparent), text color, font, font styles, opacity, corner radius, shadow toggle + shadow properties

### Shadow Properties:
```javascript
shadow: {
  enabled: boolean,
  color: "#000000",
  opacity: 0.25,
  blur: 8,
  spread: 0,
  offsetX: 0,
  offsetY: 4
}
```

### Update Flow:
1. User changes a value in inspector
2. Triggers `onChange` callback → updates component data
3. Calls `renderPreview()` to redraw canvas
4. May call `Inspector.render()` to update UI (e.g., font family change)

---

## 4. Drag and Drop System

### Location: [frontend/ui/dragdrop.js](frontend/ui/dragdrop.js)

### Three Drag Modes:

#### **Mode 1: Place from Library**
```javascript
startPlaceFromLibrary(type, e)
```
- User drags a component type from the library (left sidebar)
- Creates a "ghost" preview element following the cursor
- On drop: calls `placeComponent()` to add to canvas

#### **Mode 2: Move Component**
```javascript
startMoveComponent(component, wrapperEl, e)
```
- User drags an existing component on the canvas
- Tracks pointer movement with threshold (DRAG_THRESHOLD: 4px)
- Applies clamping to keep component within canvas bounds
- Supports reparenting: can drag component from one container to another

#### **Mode 3: Resize Component**
```javascript
startResize(component, wrapperEl, handle, e)
```
- User drags a resize handle (8 handles: top, bottom, left, right, corners)
- Applies directional size changes based on handle position
- Clamps final size to canvas bounds

### Key Functions:

| Function | Purpose |
|----------|---------|
| `initCanvasDropzone()` | Setup canvas as drop target |
| `initLibrary()` | Init component library buttons |
| `beginSession()` | Start drag session (place/move/resize) |
| `updateGhost()` | Update ghost element position during drag |
| `onPointerMove()` | Track mouse/pointer movement |
| `onPointerUp()` | Finalize drag operation |
| `placeComponent()` | Add new component to canvas |
| `finishSession()` | Clean up, save history, refresh UI |
| `attachNode()` | Attach move/resize handlers to component |

### Drop Target Detection:
```javascript
CanvasUtils.findDropTarget(clientX, clientY)
```
Determines if dropping over a container (nested) or page (top-level)

### Coordinate System:
- Converts client coordinates → canvas coordinates
- Accounts for canvas position and zoom level
- Clamps to canvas bounds with minimum size (24x24px)

---

## 5. Component Shadows and Styles

### Shadow Handling

#### Location: [frontend/core/button-styles.js](frontend/core/button-styles.js) + [render.js](frontend/core/render.js)

**Shadow Data Structure:**
```javascript
shadow: {
  enabled: boolean,        // Toggle shadow on/off
  color: "#000000",        // Hex color
  opacity: 0.25,          // Alpha (0-1)
  blur: 8,                // Blur radius in px
  spread: 0,              // Spread radius in px
  offsetX: 0,             // Horizontal offset in px
  offsetY: 4              // Vertical offset in px
}
```

**CSS Generation** (shadowCss method):
```javascript
// Converts color hex to RGB + opacity
// Returns: "0px 4px 8px 0px rgba(0,0,0,0.25)"
const shadowCss = (component) => {
  const sh = component.styles.shadow;
  if (!sh?.enabled) return "none";
  const hex = sh.color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `${sh.offsetX}px ${sh.offsetY}px ${sh.blur}px ${sh.spread}px rgba(${r},${g},${b},${sh.opacity})`;
}
```

### Button Styles (ButtonStyles Object)

#### Styling Properties:
- **Background**: solid color, gradient, or transparent
- **Text**: color, font family, font size, font styles (bold, italic, underline, strikethrough)
- **Border**: radius (uniform or per-corner), color, width
- **Layout**: width/height mode (fill), padding (top/right/bottom/left)
- **Effects**: opacity, shadow

#### Apply Method:
```javascript
applyToElement(el, component)
```
- Ensures shadow/style data exists
- Applies computed font size (adaptive based on button height/width)
- Sets all CSS properties on element
- Handles gradient backgrounds
- Applies text decorations

### Container Styles (render.js):

```javascript
renderContainerNode(component) {
  const el = document.createElement("div");
  el.style.backgroundColor = component.styles.backgroundColor;
  el.style.border = `${borderWidth}px solid ${borderColor}`;
  el.style.borderRadius = `${borderRadius}px`;
  el.style.opacity = component.styles.opacity;
  el.style.display = "flex";
  el.style.flexDirection = component.styles.flexDirection;
  // ... creates inner canvas for children
}
```

### Other Component Styles (text, image, input, icon):

| Component | Key Styles |
|-----------|-----------|
| **Text** | fontSize, color, fontWeight, textAlign |
| **Image** | borderRadius, objectFit, fit (cover/contain) |
| **Input** | borderColor, borderWidth, borderRadius, borderStyle, padding |
| **Icon** | fontSize, color, alignment |

### Style Application Flow:
1. Component has `styles` object with CSS properties
2. Render function reads `styles`
3. Applies to DOM element via `el.style.*`
4. Inspector allows editing any style
5. Changes trigger `renderPreview()` → redraw canvas

---

## File Structure Reference

```
frontend/
├── core/
│   ├── components.js      → Component factory, type definitions, defaults
│   ├── render.js          → DOM rendering engine, event binding
│   ├── button-styles.js   → Button-specific styling and shadow logic
│   ├── project.js         → Project I/O (import/export JSON)
│   ├── state.js           → Global app state, history, utilities
│   └── canvas.js          → Canvas coordinate math, bounds clamping
├── ui/
│   ├── inspector.js       → Properties panel UI builder
│   ├── button-inspector.js → Button-specific properties
│   ├── dragdrop.js        → Drag, place, resize logic
│   ├── keyboard.js        → Keyboard shortcuts (Ctrl+Z, Delete, Arrow keys)
│   ├── builder.js         → Main refresh orchestrator
│   ├── toolbar.js         → Top toolbar UI
│   ├── pages.js           → Page/screen management UI
│   ├── layers.js          → Layer panel UI
│   └── toast.js           → Toast notifications
├── components/
│   ├── button.js          → Button component definition (legacy)
│   └── div.js             → Div/container definition (legacy)
├── export/
│   └── flutter.js         → Export to Flutter code
└── index.html, script.js, style.css
```

---

## Key Architecture Patterns

1. **Reactive State**: AppState drives all rendering
2. **Event-Driven**: Click/drag/keyboard → state change → UI refresh
3. **Component Factory**: Single `ComponentFactory.create(type)` for all types
4. **Render-on-Change**: `renderPreview()` rebuilds entire canvas
5. **History Stack**: Undo/redo via snapshot cloning
6. **Hierarchical**: Components → Pages → App structure
7. **Nested Containers**: Containers have `.children` array for nesting

---

## Summary Table

| Question | Answer |
|----------|--------|
| **Containers?** | Type="container" with children[], auto flex-direction detection |
| **Double-click edit?** | Not implemented (use inspector panel instead) |
| **Inspector?** | [inspector.js](frontend/ui/inspector.js) builds dynamic UI panels per component type |
| **Drag & drop?** | 3 modes (place/move/resize) with ghost preview, bounds clamping, reparenting |
| **Shadows/styles?** | ButtonStyles handles shadow rendering; each component type has style object |
