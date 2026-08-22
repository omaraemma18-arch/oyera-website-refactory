const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("registerError");

const existing = OASAuth.getSession();
if (existing) {
  window.location.href = OASAuth.dashboardUrlForRole(existing.role);
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const role = document.getElementById("regRole").value;
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const phone = document.getElementById("regPhone").value;
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regPasswordConfirm").value;

  registerError.classList.remove("visible");

  if (password !== confirm) {
    registerError.textContent = "Passwords don't match.";
    registerError.classList.add("visible");
    return;
  }

  const submitBtn = registerForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  const result = await OASAuth.registerUser({ name, email, phone, password, role });

  submitBtn.disabled = false;
  submitBtn.textContent = "Create Account";

  if (!result.ok) {
    registerError.textContent = result.error;
    registerError.classList.add("visible");
    return;
  }
  window.location.href = OASAuth.dashboardUrlForRole(role);
});
