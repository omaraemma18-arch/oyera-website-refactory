(async function () {
  const user = window.OAS.requireSession();
  if (!user) return;

  if (user.role !== 'admin') {
    window.location.href = '/dashboard';
    return;
  }

  window.OASLayout.renderShell({ user, pageTitle: 'Add New Customer', activeHref: '/addnewcustomer' });

  const form = document.getElementById('custForm');
  const formAlert = document.getElementById('formAlert');
  const successAlert = document.getElementById('successAlert');
  const submitBtn = document.getElementById('submitBtn');

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
      phone: document.getElementById('phone').value.trim(),
      vehiclePlate: document.getElementById('vehiclePlate').value.trim(),
      vehicleType: document.getElementById('vehicleType').value,
      issueDescription: document.getElementById('issueDescription').value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding…';

    try {
      await window.OAS.apiFetch('/api/customers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      successAlert.textContent = 'Customer added to the queue.';
      successAlert.classList.add('show');
      form.reset();
      form.classList.remove('was-validated');
    } catch (err) {
      formAlert.textContent = err.message;
      formAlert.classList.add('show');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Customer';
    }
  });
})();
