(function () {
  // If already logged in, skip straight to the dashboard.
  if (localStorage.getItem('oas_token')) {
    window.location.replace('/dashboard');
    return;
  }

  const form = document.getElementById('loginForm');
  const alertBox = document.getElementById('formAlert');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(message) {
    alertBox.textContent = message;
    alertBox.classList.add('show');
  }
  function hideAlert() {
    alertBox.classList.remove('show');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in…';

    try {
      const data = await window.OAS.apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      window.OAS.saveSession(data.token, data.user);
      window.location.href = '/dashboard';
    } catch (err) {
      showAlert(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
    }
  });
})();
