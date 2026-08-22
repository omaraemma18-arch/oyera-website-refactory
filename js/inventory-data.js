/*
  Oyera Auto Service Bay — Inventory Data
  ------------------------------------------
  Talks to the real backend (server/routes/inventory.js) instead of localStorage.
  All functions are async now — every call site needs to `await` them.
*/

(function () {
  const CATEGORIES = ["Engine Oil", "Gearbox Oil", "Brake Fluid", "Filters", "Brake Pads", "Tyres", "Other"];
  const LOW_STOCK_THRESHOLD = 5;

  function normalize(item) {
    return {
      id: item._id,
      name: item.name,
      category: item.category,
      supplier: item.supplier,
      cost: item.cost,
      qty: item.qty,
    };
  }

  async function getItems() {
    const data = await OASApi.apiRequest("/api/inventory");
    return data.items.map(normalize);
  }

  async function addItem(payload) {
    const data = await OASApi.apiRequest("/api/inventory", { method: "POST", body: payload });
    return normalize(data.item);
  }

  async function updateItem(id, payload) {
    const data = await OASApi.apiRequest("/api/inventory/" + id, { method: "PUT", body: payload });
    return normalize(data.item);
  }

  async function deleteItem(id) {
    await OASApi.apiRequest("/api/inventory/" + id, { method: "DELETE" });
  }

  // Convenience used by the +/- style adjustments that used to exist client-side.
  async function adjustQty(id, delta, currentItem) {
    const newQty = Math.max(0, currentItem.qty + delta);
    return updateItem(id, {
      name: currentItem.name,
      category: currentItem.category,
      supplier: currentItem.supplier,
      cost: currentItem.cost,
      qty: newQty,
    });
  }

  window.OASInventory = {
    CATEGORIES,
    LOW_STOCK_THRESHOLD,
    getItems,
    addItem,
    updateItem,
    deleteItem,
    adjustQty,
  };
})();
