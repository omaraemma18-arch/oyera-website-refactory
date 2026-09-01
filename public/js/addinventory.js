(async function () {
  const user = window.OAS.requireSession();
  if (!user) return;

  if (user.role !== 'admin') {
    window.location.href = '/dashboard';
    return;
  }

  window.OASLayout.renderShell({ user, pageTitle: 'Inventory', activeHref: '/inventory' });

  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('id');
  const isEdit = Boolean(itemId);

  if (isEdit) {
    document.getElementById('formTitle').textContent = 'Edit Inventory Item';
    document.getElementById('submitBtn').textContent = 'Save Changes';
  }

  const form = document.getElementById('itemForm');
  const formAlert = document.getElementById('formAlert');
  const successAlert = document.getElementById('successAlert');
  const submitBtn = document.getElementById('submitBtn');

  if (isEdit) {
    try {
      const { item } = await window.OAS.apiFetch(`/api/inventory/${itemId}`);
      document.getElementById('name').value = item.name;
      document.getElementById('category').value = item.category || '';
      document.getElementById('supplier').value = item.supplier || '';
      document.getElementById('unitCost').value = item.unitCost;
      document.getElementById('quantity').value = item.quantity;
    } catch (err) {
      formAlert.textContent = err.message;
      formAlert.classList.add('show');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formAlert.classList.remove('show');
    successAlert.classList.remove('show');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const payload = {
      name: document.getElementById('name').value.trim(),
      category: document.getElementById('category').value.trim(),
      supplier: document.getElementById('supplier').value.trim(),
      unitCost: Number(document.getElementById('unitCost').value),
      quantity: Number(document.getElementById('quantity').value),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = isEdit ? 'Saving…' : 'Adding…';

    try {
      if (isEdit) {
        await window.OAS.apiFetch(`/api/inventory/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await window.OAS.apiFetch('/api/inventory', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      successAlert.textContent = 'Saved. Redirecting to inventory…';
      successAlert.classList.add('show');
      setTimeout(() => (window.location.href = '/inventory'), 700);
    } catch (err) {
      formAlert.textContent = err.message;
      formAlert.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? 'Save Changes' : 'Add Item';
    }
  });
})();
