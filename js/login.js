const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

// If already logged in, skip straight to the right dashboard.
const existing = OASAuth.getSession();
if (existing) {
  window.location.href = OASAuth.dashboardUrlForRole(existing.role);
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const role = document.getElementById("loginRole").value;
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const submitBtn = loginForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";
  loginError.classList.remove("visible");

  const result = await OASAuth.loginUser(email, password, role);

  submitBtn.disabled = false;
  submitBtn.textContent = "Log In";

  if (!result.ok) {
    loginError.textContent = result.error;
    loginError.classList.add("visible");
    return;
  }
  window.location.href = OASAuth.dashboardUrlForRole(result.user.role);
});
