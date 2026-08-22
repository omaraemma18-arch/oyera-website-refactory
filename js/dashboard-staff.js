// Greeting + role badge (currentUser comes from js/dashboard-staff-guard.js, loaded earlier)
const roleLabel = currentUser.role.replace("_", " ");
document.getElementById("dashGreeting").innerHTML =
  "Welcome, " + currentUser.name + '<span class="dash-role-badge">' + roleLabel + "</span>";

// Only admin sees the Receipts tab.
if (window.isAdmin) {
  document.getElementById("receiptsTabBtn").style.display = "";
}

// Tab switching
document.querySelectorAll(".dash-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".dash-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".dash-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
    if (tab.dataset.tab === "receiptsPanel") renderReceipts();
  });
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatUGX(n) {
  return "UGX " + Number(n).toLocaleString();
}

// ---- Bookings panel rendering ----
const bookingsBody = document.getElementById("bookingsTableBody");
const bookingsEmpty = document.getElementById("bookingsEmpty");
const bookingSearch = document.getElementById("bookingSearch");
const bookingStatusFilter = document.getElementById("bookingStatusFilter");

let allBookings = [];

async function renderBookings() {
  try {
    allBookings = await OASBookings.getBookings();
  } catch (err) {
    bookingsBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--color-text-muted); padding:2rem;">Could not load bookings (${escapeHtml(err.message)}).</td></tr>`;
    return;
  }

  const q = bookingSearch.value.trim().toLowerCase();
  const statusFilter = bookingStatusFilter.value;
  const bookings = allBookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(q) || (b.vehicle || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  bookingsBody.innerHTML = "";
  if (bookings.length === 0) {
    bookingsEmpty.style.display = "block";
    return;
  }
  bookingsEmpty.style.display = "none";

  bookings.forEach((b) => {
    const tr = document.createElement("tr");
    const date = new Date(b.createdAt).toLocaleDateString();
    tr.innerHTML = `
      <td><strong>${escapeHtml(b.customerName)}</strong><br><span style="color:var(--color-text-muted);font-size:0.82rem;">${escapeHtml(b.customerEmail)}</span></td>
      <td>${escapeHtml(b.phone || "—")}</td>
      <td>${escapeHtml(b.vehicle || "—")}</td>
      <td>${escapeHtml(b.service)}</td>
      <td style="max-width:220px;">${escapeHtml(b.message || "—")}</td>
      <td>${date}</td>
      <td>
        <select class="status-select" data-id="${b.id}">
          <option ${b.status === "Pending" ? "selected" : ""}>Pending</option>
          <option ${b.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
          <option ${b.status === "Completed" ? "selected" : ""}>Completed</option>
          <option ${b.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
    `;
    bookingsBody.appendChild(tr);
  });

  bookingsBody.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async (e) => {
      select.disabled = true;
      try {
        await OASBookings.updateBookingStatus(e.target.dataset.id, e.target.value);
        await renderBookings();
      } catch (err) {
        alert("Could not update the booking: " + err.message);
        select.disabled = false;
      }
    });
  });
}

bookingSearch.addEventListener("input", renderBookings);
bookingStatusFilter.addEventListener("change", renderBookings);
renderBookings();

// ---- Receipts panel (admin only) ----
const receiptsBody = document.getElementById("receiptsTableBody");
const receiptsEmpty = document.getElementById("receiptsEmpty");
const receiptSearch = document.getElementById("receiptSearch");
const receiptStatusFilter = document.getElementById("receiptStatusFilter");

let allOrders = [];

async function renderReceipts() {
  if (!window.isAdmin || !receiptsBody) return;

  try {
    allOrders = await OASCartOrders.getOrders();
  } catch (err) {
    receiptsBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--color-text-muted); padding:2rem;">Could not load receipts (${escapeHtml(err.message)}).</td></tr>`;
    return;
  }

  const q = receiptSearch.value.trim().toLowerCase();
  const statusFilter = receiptStatusFilter.value;
  const orders = allOrders.filter((o) => {
    const matchesSearch = o.techName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  receiptsBody.innerHTML = "";
  if (orders.length === 0) {
    receiptsEmpty.style.display = "block";
    return;
  }
  receiptsEmpty.style.display = "none";

  orders.forEach((o) => {
    const tr = document.createElement("tr");
    const date = new Date(o.createdAt).toLocaleString();
    const itemSummary = o.items.map((i) => `${i.name} ×${i.qty}`).join(", ");
    tr.innerHTML = `
      <td><strong>${escapeHtml(o.techName)}</strong><br><span style="color:var(--color-text-muted);font-size:0.82rem;">${escapeHtml(o.techEmail)}</span></td>
      <td style="max-width:260px;">${escapeHtml(itemSummary)}</td>
      <td>${formatUGX(o.total)}</td>
      <td>${date}</td>
      <td><span class="booking-status booking-status--${o.status.toLowerCase()}">${o.status}</span></td>
      <td>
        ${
          o.status === "Pending"
            ? `<button type="button" class="inv-action-btn" data-issue-id="${o.id}">Issue Receipt</button>`
            : `<button type="button" class="inv-action-btn" data-view-id="${o.id}">View Receipt</button>`
        }
      </td>
    `;
    receiptsBody.appendChild(tr);
  });
}

receiptSearch.addEventListener("input", renderReceipts);
receiptStatusFilter.addEventListener("change", renderReceipts);

// ---- Receipt modal (issue + print) ----
const receiptModalOverlay = document.getElementById("receiptModalOverlay");
const receiptCloseBtn = document.getElementById("receiptCloseBtn");
const receiptPrintBtn = document.getElementById("receiptPrintBtn");

function showReceipt(order) {
  document.getElementById("receiptNo").textContent = "OAS-" + order.id.slice(-8).toUpperCase();
  document.getElementById("receiptTech").textContent = order.techName;
  document.getElementById("receiptDate").textContent = order.paidAt
    ? new Date(order.paidAt).toLocaleString()
    : "—";
  document.getElementById("receiptTotal").textContent = formatUGX(order.total);

  const itemsBody = document.getElementById("receiptItemsBody");
  itemsBody.innerHTML = order.items
    .map(
      (i) => `
        <tr>
          <td>${escapeHtml(i.name)}</td>
          <td>${i.qty}</td>
          <td>${formatUGX(i.cost)}</td>
          <td>${formatUGX(i.qty * i.cost)}</td>
        </tr>
      `
    )
    .join("");

  receiptModalOverlay.classList.add("open");
}

if (receiptsBody) {
  receiptsBody.addEventListener("click", async (e) => {
    const issueBtn = e.target.closest("button[data-issue-id]");
    const viewBtn = e.target.closest("button[data-view-id]");

    if (issueBtn) {
      const id = issueBtn.dataset.issueId;
      if (window.confirm("Confirm payment received and issue this receipt?")) {
        try {
          const order = await OASCartOrders.issueReceipt(id);
          await renderReceipts();
          showReceipt(order);
        } catch (err) {
          alert("Could not issue the receipt: " + err.message);
        }
      }
    } else if (viewBtn) {
      const id = viewBtn.dataset.viewId;
      const order = allOrders.find((o) => o.id === id);
      if (order) showReceipt(order);
    }
  });
}

if (receiptCloseBtn) {
  receiptCloseBtn.addEventListener("click", () => receiptModalOverlay.classList.remove("open"));
  receiptModalOverlay.addEventListener("click", (e) => {
    if (e.target === receiptModalOverlay) receiptModalOverlay.classList.remove("open");
  });
  receiptPrintBtn.addEventListener("click", () => window.print());
}
