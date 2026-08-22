/*
  Oyera Auto Service Bay — API helper
  --------------------------------------
  Thin wrapper around fetch() that adds the JWT (if logged in) and
  turns non-2xx responses into thrown errors with a readable message.
  Same-origin: the Express server serves both the API and these static
  files, so no base URL is needed.
*/

(function () {
  const TOKEN_KEY = "oas_token";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  async function apiRequest(path, { method = "GET", body } = {}) {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    const res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      // Non-JSON response (e.g. server not running) — fall through with empty data.
    }

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  window.OASApi = { apiRequest, getToken, TOKEN_KEY };
})();
