/*
  Oyera Auto Service Bay — Auth
  --------------------------------
  Talks to the real backend (server/routes/auth.js) instead of localStorage.
  The JWT proves who you are to the server on every request; a cached copy
  of the safe user object (name/email/role, no password) is kept in
  localStorage too, purely so the UI (nav, guards) can render instantly
  without an extra network round trip on every page load.
*/

(function () {
  const TOKEN_KEY = "oas_token";
  const USER_KEY = "oas_user";

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function getSession() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  async function registerUser({ name, email, phone, password, role }) {
    try {
      const data = await OASApi.apiRequest("/api/auth/register", {
        method: "POST",
        body: { name, email, phone, password, role },
      });
      setSession(data.token, data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function loginUser(email, password, role) {
    try {
      const data = await OASApi.apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password, role },
      });
      setSession(data.token, data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "index.html";
  }

  // Redirect helper for protected pages.
  // Usage at top of a protected page: OASAuth.requireRole(["admin", "technician"]);
  function requireRole(allowedRoles) {
    const user = getSession();
    if (!user || !allowedRoles.includes(user.role)) {
      window.location.href = "login.html";
    }
    return user;
  }

  function dashboardUrlForRole(role) {
    if (role === "admin" || role === "senior_technician" || role === "technician") return "inventory.html";
    return "dashboard-customer.html";
  }

  // ---- Nav injection ----
  // Looks for <li id="authNavSlot"></li> in the nav and fills it based on session state.
  function renderAuthNav() {
    const slot = document.getElementById("authNavSlot");
    if (!slot) return;

    const user = getSession();
    if (user) {
      slot.innerHTML = `<span class="nav-user-pill">Hi, <strong>${escapeHtml(user.name.split(" ")[0])}</strong></span>`;
      const dashLi = document.createElement("li");
      dashLi.innerHTML = `<a href="${dashboardUrlForRole(user.role)}">Dashboard</a>`;
      slot.after(dashLi);

      const logoutLi = document.createElement("li");
      logoutLi.innerHTML = `<a href="#" class="nav-logout-link" id="navLogoutBtn">Logout</a>`;
      dashLi.after(logoutLi);

      document.getElementById("navLogoutBtn").addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    } else {
      const loginLi = document.createElement("li");
      loginLi.innerHTML = `<a href="login.html">Login</a>`;
      slot.after(loginLi);

      const registerLi = document.createElement("li");
      registerLi.innerHTML = `<a href="register.html" class="nav-cta">Sign Up</a>`;
      loginLi.after(registerLi);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener("DOMContentLoaded", renderAuthNav);

  window.OASAuth = {
    registerUser,
    loginUser,
    logout,
    getSession,
    requireRole,
    dashboardUrlForRole,
  };
})();
