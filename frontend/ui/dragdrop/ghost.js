window.DragDropGhost = {
  create(type, x, y, width, height, canvas) {
    const ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    ghost.textContent = type;
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
    ghost.style.width = `${width}px`;
    ghost.style.height = `${height}px`;
    canvas.appendChild(ghost);
    return ghost;
  },

  update(ghost, x, y, width, height) {
    if (!ghost) return;
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
    ghost.style.width = `${width}px`;
    ghost.style.height = `${height}px`;
  },

  remove(ghost) {
    if (ghost && ghost.parentNode) {
      ghost.parentNode.removeChild(ghost);
    }
  }
};
