// api.js — shared fetch helper, auth storage, and small utilities used across pages.

const TOKEN_KEY = 'oas_token';
const USER_KEY = 'oas_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Every failure resolves to a short, friendly message — never a raw stack trace.
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, { ...options, headers });
  } catch {
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.error) || 'Something went wrong. Please try again.';
    if (res.status === 401) {
      clearSession();
      window.location.href = '/login';
    }
    throw new Error(message);
  }

  return data;
}

function formatUGX(amount) {
  const value = Number(amount) || 0;
  return 'UGX ' + value.toLocaleString('en-UG', { maximumFractionDigits: 0 });
}

// Redirects to /login if there is no session. Returns the stored user immediately
// (for fast UI paint) while the caller may still refresh it from /api/auth/me.
function requireSession() {
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) {
    window.location.href = '/login';
    return null;
  }
  return user;
}

function logout() {
  clearSession();
  window.location.href = '/login';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

window.OAS = { apiFetch, saveSession, clearSession, getStoredUser, requireSession, logout, formatUGX, escapeHtml };
