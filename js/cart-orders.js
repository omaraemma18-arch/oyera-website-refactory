/*
  Oyera Auto Service Bay — Cart Orders / Receipts
  ---------------------------------------------------
  Talks to the real backend (server/routes/cartOrders.js) instead of localStorage.
  Prices are looked up server-side from the real inventory — the client only
  ever sends { itemId, qty } pairs, never prices, so a tampered request
  can't under-price an order.
*/

(function () {
  function normalize(o) {
    return {
      id: o._id,
      techName: o.techName,
      techEmail: o.techEmail,
      items: o.items, // [{ name, qty, cost }] — snapshotted server-side at submit time
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
      paidAt: o.paidAt,
    };
  }

  // Admin only.
  async function getOrders() {
    const data = await OASApi.apiRequest("/api/cart-orders");
    return data.orders.map(normalize);
  }

  // items: [{ itemId, qty }]
  async function createOrder({ items }) {
    const data = await OASApi.apiRequest("/api/cart-orders", { method: "POST", body: { items } });
    return normalize(data.order);
  }

  // Admin only — marks paid and returns the order for printing.
  async function issueReceipt(id) {
    const data = await OASApi.apiRequest("/api/cart-orders/" + id + "/issue", { method: "PUT" });
    return normalize(data.order);
  }

  window.OASCartOrders = { getOrders, createOrder, issueReceipt };
})();
