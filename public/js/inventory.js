(async function () {
  const user = window.OAS.requireSession();
  if (!user) return;

  window.OASLayout.renderShell({ user, pageTitle: 'Inventory', activeHref: '/inventory' });

  const isAdmin = user.role === 'admin';
  if (isAdmin) {
    document.getElementById('addItemBtn').classList.remove('d-none');
    document.getElementById('actionsHeader').classList.remove('d-none');
  }

  const tbody = document.getElementById('invTableBody');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const deleteModalEl = document.getElementById('deleteModal');
  const deleteModal = new bootstrap.Modal(deleteModalEl);
  let pendingDeleteId = null;

  let debounceTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadItems, 250);
  });

  async function loadItems() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());

    try {
      const data = await window.OAS.apiFetch(`/api/inventory?${params.toString()}`);
      renderRows(data.items);
    } catch (err) {
      tbody.innerHTML = '';
      emptyState.textContent = err.message;
      emptyState.classList.remove('d-none');
    }
  }

  function renderRows(items) {
    if (!items.length) {
      tbody.innerHTML = '';
      emptyState.textContent = 'No inventory items found.';
      emptyState.classList.remove('d-none');
      return;
    }
    emptyState.classList.add('d-none');

    tbody.innerHTML = items
      .map((item) => {
        const lowStock = item.quantity <= 3;
        const actions = isAdmin
          ? `<td class="text-end">
               <a href="/addinventory?id=${item._id}" class="btn btn-sm btn-light border me-1"><i class="bi bi-pencil"></i></a>
               <button class="btn btn-sm btn-light border text-danger" data-id="${item._id}" data-name="${window.OAS.escapeHtml(item.name)}" data-action="delete"><i class="bi bi-trash"></i></button>
             </td>`
          : '';
        return `
          <tr>
            <td class="fw-semibold">${window.OAS.escapeHtml(item.name)}</td>
            <td>${window.OAS.escapeHtml(item.category || '—')}</td>
            <td>${window.OAS.escapeHtml(item.supplier || '—')}</td>
            <td>${window.OAS.formatUGX(item.unitCost)}</td>
            <td>${lowStock ? `<span class="text-danger fw-semibold">${item.quantity}</span>` : item.quantity}</td>
            ${actions}
          </tr>`;
      })
      .join('');

    tbody.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        pendingDeleteId = btn.dataset.id;
        document.getElementById('deleteItemName').textContent = `Remove "${btn.dataset.name}" from inventory.`;
        deleteModal.show();
      });
    });
  }

  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    try {
      await window.OAS.apiFetch(`/api/inventory/${pendingDeleteId}`, { method: 'DELETE' });
      deleteModal.hide();
      loadItems();
    } catch (err) {
      deleteModal.hide();
      alert(err.message);
    }
  });

  loadItems();
})();
