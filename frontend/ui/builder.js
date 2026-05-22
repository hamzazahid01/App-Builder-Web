window.Builder = {
  refreshAll() {
    // Store accordion open states before refresh
    const openAccordions = [];
    document.querySelectorAll('.accordion.open').forEach(acc => {
      if (acc.dataset.accordionId) {
        openAccordions.push(acc.dataset.accordionId);
      }
    });
    
    Inspector.render();
    renderPreview();
    if (typeof updateScreenLabel === "function") updateScreenLabel();
    const undo = document.getElementById("undo-btn");
    const redo = document.getElementById("redo-btn");
    if (undo) undo.disabled = !StateUtils.canUndo();
    if (redo) redo.disabled = !StateUtils.canRedo();
    
    // Restore accordion open states after refresh
    openAccordions.forEach(id => {
      const accordion = document.querySelector(`.accordion[data-accordion-id="${id}"]`);
      if (accordion) {
        accordion.classList.add('open');
      }
    });
  }
};
