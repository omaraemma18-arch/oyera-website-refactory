(async function () {
  const user = window.OAS.requireSession();
  if (!user) return;

  if (user.role !== 'technician') {
    window.location.href = '/dashboard';
    return;
  }

  window.OASLayout.renderShell({ user, pageTitle: 'Add Service Record', activeHref: '/dashboard' });

  const params = new URLSearchParams(window.location.search);
  const customerId = params.get('customerId');
  const formAlert = document.getElementById('formAlert');

  function showError(msg) {
    formAlert.textContent = msg;
    formAlert.classList.add('show');
  }

  if (!customerId) {
    showError('No customer was specified. Go back to the dashboard and select a customer first.');
    return;
  }

  let inventoryItems = [];

  // Load customer summary + inventory options in parallel
  try {
    const [custData, invData] = await Promise.all([
      window.OAS.apiFetch(`/api/customers/${customerId}`),
      window.OAS.apiFetch('/api/inventory'),
    ]);

    const c = custData.customer;
    document.getElementById('custSummary').classList.remove('d-none');
    document.getElementById('sumName').textContent = c.name;
    document.getElementById('sumVehicle').textContent = `${c.vehiclePlate} — ${c.vehicleType}`;
    document.getElementById('sumIssue').textContent = c.issueDescription;

    inventoryItems = invData.items;
  } catch (err) {
    showError(err.message);
    return;
  }

  const materialRows = document.getElementById('materialRows');
  const template = document.getElementById('materialRowTemplate');

  function itemOptionsHtml(selectedId) {
    return inventoryItems
      .map((it) => {
        const selected = it._id === selectedId ? 'selected' : '';
        return `<option value="${it._id}" data-cost="${it.unitCost}" data-stock="${it.quantity}" ${selected}>${window.OAS.escapeHtml(it.name)} (${it.quantity} in stock)</option>`;
      })
      .join('');
  }

  function addMaterialRow() {
    const node = template.content.cloneNode(true);
    const row = node.querySelector('.material-row');
    const select = row.querySelector('.item-select');
    select.innerHTML = '<option value="">Choose item…</option>' + itemOptionsHtml();

    select.addEventListener('change', () => recalc());
    row.querySelector('.qty-input').addEventListener('input', () => recalc());
    row.querySelector('.remove-row').addEventListener('click', () => {
      row.remove();
      recalc();
    });

    materialRows.appendChild(row);
  }

  document.getElementById('addMaterialBtn').addEventListener('click', addMaterialRow);

  function recalc() {
    let materialsTotal = 0;

    materialRows.querySelectorAll('.material-row').forEach((row) => {
      const select = row.querySelector('.item-select');
      const qtyInput = row.querySelector('.qty-input');
      const lineCostEl = row.querySelector('.line-cost');

      const opt = select.options[select.selectedIndex];
      const unitCost = opt ? Number(opt.dataset.cost || 0) : 0;
      const qty = Number(qtyInput.value) || 0;
      const lineCost = unitCost * qty;

      lineCostEl.textContent = window.OAS.formatUGX(lineCost);
      materialsTotal += lineCost;
    });

    const labourFee = Number(document.getElementById('labourFee').value) || 0;
    const total = materialsTotal + labourFee;

    document.getElementById('materialsSubtotal').textContent = window.OAS.formatUGX(materialsTotal);
    document.getElementById('labourSubtotal').textContent = window.OAS.formatUGX(labourFee);
    document.getElementById('grandTotal').textContent = window.OAS.formatUGX(total);
  }

  document.getElementById('labourFee').addEventListener('input', recalc);

  // Start with one empty material row
  addMaterialRow();
  recalc();

  const form = document.getElementById('recordForm');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formAlert.classList.remove('show');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const materials = [];
    let stockError = null;

    materialRows.querySelectorAll('.material-row').forEach((row) => {
      const select = row.querySelector('.item-select');
      const qtyInput = row.querySelector('.qty-input');
      const itemId = select.value;
      const qty = Number(qtyInput.value) || 0;
      if (!itemId || qty <= 0) return;

      const opt = select.options[select.selectedIndex];
      const stock = Number(opt.dataset.stock || 0);
      if (qty > stock) {
        stockError = `Not enough "${opt.textContent}" in stock.`;
      }
      materials.push({ itemId, quantity: qty });
    });

    if (stockError) {
      showError(stockError);
      return;
    }

    const payload = {
      customerId,
      workDone: document.getElementById('workDone').value.trim(),
      materials,
      labourFee: Number(document.getElementById('labourFee').value),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      await window.OAS.apiFetch('/api/service-records', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      window.location.href = '/servicerecords';
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Complete & Save';
    }
  });
})();
