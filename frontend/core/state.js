window.AppState = {
  appData: [],
  selectedId: null,
  draggedNodeId: null,
  deviceMap: {
    "iphone-se": { width: 320, height: 568 },
    "iphone-14": { width: 390, height: 844 },
    "android-small": { width: 360, height: 640 },
    "android-large": { width: 412, height: 915 }
  }
};

window.StateUtils = {
  makeId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  },

  findById(nodes, id) {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (!node.children) continue;
      const found = this.findById(node.children, id);
      if (found) return found;
    }
    return null;
  },

  removeById(nodes, id) {
    const idx = nodes.findIndex((n) => n.id === id);
    if (idx !== -1) {
      return nodes.splice(idx, 1)[0];
    }
    for (const node of nodes) {
      if (!node.children) continue;
      const removed = this.removeById(node.children, id);
      if (removed) return removed;
    }
    return null;
  }
};
