(function () {
  // Storage now lives in js/inventory-data.js, backed by the real API.
  // Mongo ids are strings (ObjectIds), not numbers — every id below is a string.
  let items = [];

  // ---- Element references ------------------------------------------------
  const tableBody = document.getElementById("invTableBody");
  const emptyState = document.getElementById("invEmpty");
  const searchInput = document.getElementById("invSearch");
  const categoryFilter = document.getElementById("invCategoryFilter");
  const addBtn = document.getElementById("invAddBtn");

  const statCount = document.getElementById("statCount");
  const statUnits = document.getElementById("statUnits");
  const statValue = document.getElementById("statValue");
  const statLow = document.getElementById("statLow");

  const modalOverlay = document.getElementById("invModalOverlay");
  const modalTitle = document.getElementById("invModalTitle");
  const form = document.getElementById("invForm");
  const cancelBtn = document.getElementById("invCancelBtn");

  const fieldId = document.getElementById("invItemId");
  const fieldName = document.getElementById("invName");
  const fieldCategory = document.getElementById("invCategory");
  const fieldSupplier = document.getElementById("invSupplier");
  const fieldCost = document.getElementById("invCost");
  const fieldQty = document.getElementById("invQty");

  // Bail out quietly if this script somehow loads on a page without the inventory markup.
  if (!tableBody) return;

  // ---- Helpers ------------------------------------------------------------
  function formatUGX(n) {
    return "UGX " + Number(n).toLocaleString();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function showLoadError(err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--color-text-muted); padding:2rem;">
      Could not reach the server (${escapeHtml(err.message)}). Is the backend running?
    </td></tr>`;
  }

  async function refreshItems() {
    items = await OASInventory.getItems();
  }

  function populateCategoryFilter() {
    const categories = Array.from(new Set(items.map((i) => i.category))).sort();
    categoryFilter.innerHTML = '<option value="All">All Categories</option>';
    categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      categoryFilter.appendChild(opt);
    });
  }

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    const cat = categoryFilter.value;
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q);
      const matchesCategory = cat === "All" || item.category === cat;
      return matchesSearch && matchesCategory;
    });
  }

  function renderStats() {
    const totalUnits = items.reduce((sum, i) => sum + i.qty, 0);
    const totalValue = items.reduce((sum, i) => sum + i.qty * i.cost, 0);
    const lowCount = items.filter((i) => i.qty <= OASInventory.LOW_STOCK_THRESHOLD).length;

    statCount.textContent = items.length;
    statUnits.textContent = totalUnits;
    statValue.textContent = formatUGX(totalValue);
    statLow.textContent = lowCount;
  }

  function renderTable() {
    const filtered = getFiltered();
    tableBody.innerHTML = "";

    if (filtered.length === 0) {
      emptyState.style.display = "block";
      renderStats();
      return;
    }
    emptyState.style.display = "none";

    filtered.forEach((item) => {
      const isLow = item.qty <= OASInventory.LOW_STOCK_THRESHOLD;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="inv-part-name">${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(item.supplier)}</td>
        <td>${formatUGX(item.cost)}</td>
        <td>${item.qty}</td>
        <td><span class="inv-status ${isLow ? "inv-status--low" : "inv-status--ok"}">${isLow ? "Low Stock" : "OK"}</span></td>
        <td>${formatUGX(item.qty * item.cost)}</td>
        <td>
          <span class="inv-row-actions">
            <button type="button" class="inv-action-btn" data-action="cart" data-id="${item.id}" ${item.qty <= 0 ? "disabled" : ""}>🛒 Add</button>
            ${
              window.canManageInventory
                ? `<button type="button" class="inv-action-btn" data-action="edit" data-id="${item.id}">Edit</button>
                   <button type="button" class="inv-action-btn danger" data-action="delete" data-id="${item.id}">Delete</button>`
                : ""
            }
          </span>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderStats();
  }

  // ---- Modal handling -------------------------------------------------------
  function openModal(item) {
    if (!window.canManageInventory) return; // read-only technicians can't add/edit
    if (item) {
      modalTitle.textContent = "Edit Item";
      fieldId.value = item.id;
      fieldName.value = item.name;
      fieldCategory.value = item.category;
      fieldSupplier.value = item.supplier;
      fieldCost.value = item.cost;
      fieldQty.value = item.qty;
    } else {
      modalTitle.textContent = "Add New Item";
      form.reset();
      fieldId.value = "";
    }
    modalOverlay.classList.add("open");
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
  }

  addBtn.addEventListener("click", () => openModal(null));
  cancelBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!window.canManageInventory) return;
    const id = fieldId.value || null;
    const payload = {
      name: fieldName.value.trim(),
      category: fieldCategory.value,
      supplier: fieldSupplier.value.trim(),
      cost: Number(fieldCost.value) || 0,
      qty: Number(fieldQty.value) || 0,
    };
    if (!payload.name) return;

    const saveBtn = form.querySelector('button[type="submit"]');
    saveBtn.disabled = true;
    try {
      if (id) {
        await OASInventory.updateItem(id, payload);
      } else {
        await OASInventory.addItem(payload);
      }
      await refreshItems();
      populateCategoryFilter();
      renderTable();
      closeModal();
    } catch (err) {
      alert("Could not save the item: " + err.message);
    } finally {
      saveBtn.disabled = false;
    }
  });

  // ---- Row actions (event delegation) ----------------------------------------
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (action === "cart") {
      addToCart(item);
    } else if (action === "edit") {
      openModal(item);
    } else if (action === "delete") {
      if (!window.canManageInventory) return;
      if (window.confirm(`Remove "${item.name}" from inventory?`)) {
        try {
          await OASInventory.deleteItem(id);
          await refreshItems();
          populateCategoryFilter();
          renderTable();
        } catch (err) {
          alert("Could not delete the item: " + err.message);
        }
      }
    }
  });

  // ---- Search / filter ---------------------------------------------------
  searchInput.addEventListener("input", renderTable);
  categoryFilter.addEventListener("change", renderTable);

  // ---- Cart (client-side staging area — submitted to the server as itemId/qty pairs) ----
  const CART_KEY = "oas_cart";
  const cartBtn = document.getElementById("cartBtn");
  const cartCount = document.getElementById("cartCount");
  const cartModalOverlay = document.getElementById("cartModalOverlay");
  const cartCloseBtn = document.getElementById("cartCloseBtn");
  const cartClearBtn = document.getElementById("cartClearBtn");
  const cartSubmitBtn = document.getElementById("cartSubmitBtn");
  const cartBody = document.getElementById("cartBody");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartGrandTotal = document.getElementById("cartGrandTotal");

  function loadCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function addToCart(item) {
    const cart = loadCart();
    const existing = cart.find((line) => line.itemId === item.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, item.qty);
    } else {
      cart.push({ itemId: item.id, qty: 1 });
    }
    saveCart(cart);
    renderCartBadge();
  }

  function renderCartBadge() {
    const cart = loadCart();
    const totalItems = cart.reduce((sum, line) => sum + line.qty, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? "inline-flex" : "none";
  }

  function renderCart() {
    const cart = loadCart();
    cartBody.innerHTML = "";

    if (cart.length === 0) {
      cartEmpty.style.display = "block";
      cartGrandTotal.textContent = formatUGX(0);
      return;
    }
    cartEmpty.style.display = "none";

    let grandTotal = 0;

    cart.forEach((line) => {
      const item = items.find((i) => i.id === line.itemId);
      if (!item) return; // item was deleted from inventory since being added to cart

      const lineTotal = item.cost * line.qty;
      grandTotal += lineTotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="inv-part-name">${escapeHtml(item.name)}</td>
        <td>${formatUGX(item.cost)}</td>
        <td>
          <input type="number" class="cart-qty-input" min="1" max="${item.qty}" value="${line.qty}" data-id="${item.id}">
        </td>
        <td>${formatUGX(lineTotal)}</td>
        <td><button type="button" class="inv-action-btn danger" data-remove-id="${item.id}">Remove</button></td>
      `;
      cartBody.appendChild(row);
    });

    cartGrandTotal.textContent = formatUGX(grandTotal);
  }

  function openCart() {
    renderCart();
    cartModalOverlay.classList.add("open");
  }

  function closeCart() {
    cartModalOverlay.classList.remove("open");
  }

  if (window.isJuniorTechnician) {
    cartSubmitBtn.style.display = "";
  }

  cartSubmitBtn.addEventListener("click", async () => {
    const cart = loadCart();
    if (cart.length === 0) return;

    cartSubmitBtn.disabled = true;
    try {
      await OASCartOrders.createOrder({
        items: cart.map((line) => ({ itemId: line.itemId, qty: line.qty })),
      });
      saveCart([]);
      renderCartBadge();
      closeCart();
      alert("Submitted! An admin will issue your receipt once you've paid.");
    } catch (err) {
      alert("Could not submit the cart: " + err.message);
    } finally {
      cartSubmitBtn.disabled = false;
    }
  });

  cartBtn.addEventListener("click", openCart);
  cartCloseBtn.addEventListener("click", closeCart);
  cartModalOverlay.addEventListener("click", (e) => {
    if (e.target === cartModalOverlay) closeCart();
  });

  cartClearBtn.addEventListener("click", () => {
    if (loadCart().length === 0) return;
    if (window.confirm("Clear all items from the cart?")) {
      saveCart([]);
      renderCartBadge();
      renderCart();
    }
  });

  // Quantity edits inside the cart (plain number input, no +/- buttons)
  cartBody.addEventListener("change", (e) => {
    if (!e.target.classList.contains("cart-qty-input")) return;
    const id = e.target.dataset.id;
    const item = items.find((i) => i.id === id);
    let qty = Number(e.target.value) || 1;
    qty = Math.max(1, Math.min(qty, item ? item.qty : qty));

    const cart = loadCart();
    const line = cart.find((l) => l.itemId === id);
    if (line) line.qty = qty;
    saveCart(cart);
    renderCart();
    renderCartBadge();
  });

  // Remove a line from the cart
  cartBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-remove-id]");
    if (!btn) return;
    const id = btn.dataset.removeId;
    saveCart(loadCart().filter((l) => l.itemId !== id));
    renderCart();
    renderCartBadge();
  });

  // ---- Init ---------------------------------------------------------------
  async function init() {
    const addFullPageLink = document.getElementById("invAddFullPageLink");
    const readOnlyNote = document.getElementById("readOnlyNote");

    if (window.canManageInventory) {
      addBtn.style.display = "";
      addFullPageLink.style.display = "";
    } else {
      readOnlyNote.style.display = "block";
    }

    try {
      await refreshItems();
      populateCategoryFilter();
      renderTable();
      renderCartBadge();
    } catch (err) {
      showLoadError(err);
    }
  }

  init();
})();
