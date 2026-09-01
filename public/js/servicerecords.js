(async function () {
  const user = window.OAS.requireSession();
  if (!user) return;

  window.OASLayout.renderShell({ user, pageTitle: 'Service History', activeHref: '/servicerecords' });

  const tbody = document.getElementById('recordsTableBody');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');

  let debounceTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadRecords, 250);
  });

  async function loadRecords() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());

    try {
      const data = await window.OAS.apiFetch(`/api/service-records?${params.toString()}`);
      renderRows(data.records);
    } catch (err) {
      tbody.innerHTML = '';
      emptyState.textContent = err.message;
      emptyState.classList.remove('d-none');
    }
  }

  function renderRows(records) {
    if (!records.length) {
      tbody.innerHTML = '';
      emptyState.textContent = 'No service records yet.';
      emptyState.classList.remove('d-none');
      return;
    }
    emptyState.classList.add('d-none');

    tbody.innerHTML = records
      .map((r) => {
        const materialsSummary = r.materialsUsed.length
          ? r.materialsUsed.map((m) => `${m.name} ×${m.quantity}`).join(', ')
          : '—';
        return `
          <tr>
            <td class="fw-semibold">${window.OAS.escapeHtml(r.customer?.name || 'Unknown')}</td>
            <td>${window.OAS.escapeHtml(r.customer?.vehiclePlate || '—')}</td>
            <td>${window.OAS.escapeHtml(r.technician?.name || 'Unknown')}</td>
            <td class="text-truncate" style="max-width:200px;">${window.OAS.escapeHtml(r.workDone)}</td>
            <td class="text-truncate" style="max-width:180px;">${window.OAS.escapeHtml(materialsSummary)}</td>
            <td>${window.OAS.formatUGX(r.labourFee)}</td>
            <td class="fw-semibold">${window.OAS.formatUGX(r.totalCost)}</td>
            <td class="text-muted small">${new Date(r.createdAt).toLocaleDateString()}</td>
          </tr>`;
      })
      .join('');
  }

  loadRecords();
})();
