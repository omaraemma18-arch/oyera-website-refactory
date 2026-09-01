(async function () {
  const user = window.OAS.requireSession();
  if (!user) return;

  if (user.role !== 'admin') {
    window.location.href = '/dashboard';
    return;
  }

  window.OASLayout.renderShell({ user, pageTitle: 'Register Technician', activeHref: '/signup' });

  const form = document.getElementById('regForm');
  const formAlert = document.getElementById('formAlert');
  const successAlert = document.getElementById('successAlert');
  const submitBtn = document.getElementById('submitBtn');

  function showError(msg) {
    successAlert.classList.remove('show');
    formAlert.textContent = msg;
    formAlert.classList.add('show');
  }
  function showSuccess(msg) {
    formAlert.classList.remove('show');
    successAlert.textContent = msg;
    successAlert.classList.add('show');
  }

  async function loadTechnicians() {
    const listEl = document.getElementById('techList');
    try {
      const data = await window.OAS.apiFetch('/api/auth/technicians');
      if (!data.technicians.length) {
        listEl.innerHTML = '<div class="empty-state py-2">No technicians registered yet.</div>';
        return;
      }
      listEl.innerHTML = data.technicians
        .map(
          (t) => `<div class="d-flex justify-content-between border-bottom py-2">
                    <span>${window.OAS.escapeHtml(t.name)}</span>
                    <span class="text-muted">${window.OAS.escapeHtml(t.email)}</span>
                  </div>`
        )
        .join('');
    } catch (err) {
      listEl.innerHTML = `<div class="text-danger small">${window.OAS.escapeHtml(err.message)}</div>`;
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

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating…';

    try {
      await window.OAS.apiFetch('/api/auth/register-technician', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      showSuccess(`${name} can now log in as a technician.`);
      form.reset();
      form.classList.remove('was-validated');
      loadTechnicians();
    } catch (err) {
      showError(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });

  loadTechnicians();
})();
