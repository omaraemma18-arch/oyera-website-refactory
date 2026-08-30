document.addEventListener('DOMContentLoaded', () => {
  loadInventory();
});

async function loadInventory() {
  const tableBody = document.getElementById('inventoryTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch('/api/inventory');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const items = await res.json();

    tableBody.innerHTML = '';

    if (items.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No inventory items found.</td></tr>';
      return;
    }

    items.forEach(item => {
      const price = Number(item.unitPrice ?? item.price ?? 0);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-3 ps-3 text-light fw-semibold">${item.itemName || 'N/A'}</td>
        <td class="py-3"><span class="badge bg-secondary">${item.partNumber || 'N/A'}</span></td>
        <td class="py-3 text-light">${item.category || 'General'}</td>
        <td class="py-3"><span class="badge bg-info text-dark">${item.quantityInStock || 0}</span></td>
        <td class="py-3 fw-semibold text-warning">UGX ${price.toLocaleString()}</td>
        <td class="py-3 pe-3 text-end text-muted">${item.supplier || 'N/A'}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load inventory data: ${err.message}</td></tr>`;
  }
}