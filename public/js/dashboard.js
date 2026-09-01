(async function () {
  const user = window.OAS.requireSession();
  if (!user) return;

  window.OASLayout.renderShell({ user, pageTitle: 'Dashboard', activeHref: '/dashboard' });

  if (user.role === 'admin') {
    document.getElementById('addCustomerBtn').classList.remove('d-none');
  }

  const tbody = document.getElementById('customerTableBody');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');

  function statusClass(status) {
    if (status === 'Available') return 'status-available';
    if (status === 'In Progress') return 'status-in-progress';
    return 'status-completed';
  }

  async function loadStats() {
    try {
      const stats = await window.OAS.apiFetch('/api/customers/stats');
      document.getElementById('statTotal').textContent = stats.total;
      document.getElementById('statAvailable').textContent = stats.available;
      document.getElementById('statInProgress').textContent = stats.inProgress;
      document.getElementById('statCompleted').textContent = stats.completed;
    } catch {
      // stats are non-critical — fail silently, table below still loads
    }
  }

  let debounceTimer = null;
  function debouncedLoad() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadCustomers, 250);
  }

  async function loadCustomers() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
    if (statusFilter.value) params.set('status', statusFilter.value);

    try {
      const data = await window.OAS.apiFetch(`/api/customers?${params.toString()}`);
      renderRows(data.customers);
    } catch (err) {
      tbody.innerHTML = '';
      emptyState.textContent = err.message;
      emptyState.classList.remove('d-none');
    }
  }

  function renderRows(customers) {
    if (!customers.length) {
      tbody.innerHTML = '';
      emptyState.textContent = 'No customers match your search.';
      emptyState.classList.remove('d-none');
      return;
    }
    emptyState.classList.add('d-none');

    tbody.innerHTML = customers
      .map((c) => {
        const techName = c.assignedTechnician ? window.OAS.escapeHtml(c.assignedTechnician.name) : '—';
        return `
          <tr data-id="${c._id}">
            <td>
              <div class="fw-semibold">${window.OAS.escapeHtml(c.name)}</div>
              <div class="text-muted small">${window.OAS.escapeHtml(c.phone)}</div>
            </td>
            <td>
              <div>${window.OAS.escapeHtml(c.vehiclePlate)}</div>
              <div class="text-muted small">${window.OAS.escapeHtml(c.vehicleType)}</div>
            </td>
            <td>${window.OAS.escapeHtml(c.phone)}</td>
            <td class="text-truncate" style="max-width:220px;">${window.OAS.escapeHtml(c.issueDescription)}</td>
            <td>${techName}</td>
            <td><span class="status-badge ${statusClass(c.status)}">${c.status}</span></td>
          </tr>`;
      })
      .join('');

    tbody.querySelectorAll('tr').forEach((row) => {
      row.addEventListener('click', () => {
        window.location.href = `/customer?id=${row.dataset.id}`;
      });
    });
  }

  searchInput.addEventListener('input', debouncedLoad);
  statusFilter.addEventListener('change', loadCustomers);

  // Technicians land on a queue that defaults to Available work.
  if (user.role === 'technician') {
    statusFilter.value = 'Available';
  }

  loadStats();
  loadCustomers();
})();
