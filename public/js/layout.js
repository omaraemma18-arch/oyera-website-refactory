// layout.js — renders the sidebar + topbar shell into #app-shell on every
// authenticated page, based on the logged-in user's role.

(function () {
  const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2', roles: ['admin', 'technician'] },
    { href: '/inventory', label: 'Inventory', icon: 'bi-box-seam', roles: ['admin', 'technician'] },
    { href: '/servicerecords', label: 'Service History', icon: 'bi-clock-history', roles: ['admin', 'technician'] },
    { href: '/addnewcustomer', label: 'Add New Customer', icon: 'bi-person-plus', roles: ['admin'] },
    { href: '/signup', label: 'Register Technician', icon: 'bi-person-badge', roles: ['admin'] },
  ];

  function initials(name) {
    if (!name) return '?';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  function renderShell({ user, pageTitle, activeHref }) {
    const shellRoot = document.getElementById('app-shell');
    const mainRoot = document.getElementById('page-content');
    if (!shellRoot || !mainRoot) return;

    const navHtml = NAV_ITEMS.filter((item) => item.roles.includes(user.role))
      .map((item) => {
        const active = item.href === activeHref ? 'active' : '';
        return `<a href="${item.href}" class="nav-link ${active}">
                  <i class="bi ${item.icon} nav-icon"></i>${item.label}
                </a>`;
      })
      .join('');

    shellRoot.innerHTML = `
      <aside class="app-sidebar" id="appSidebar">
        <div class="brand">
          Oyera Auto Service Bay
          <small>Service Bay Management</small>
        </div>
        <nav class="nav flex-column">
          ${navHtml}
          <a href="#" id="logoutLink" class="nav-link text-danger mt-2">
            <i class="bi bi-box-arrow-right nav-icon"></i>Logout
          </a>
        </nav>
      </aside>
    `;

    const topbar = document.createElement('div');
    topbar.className = 'app-topbar';
    topbar.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm btn-light border d-md-none" id="sidebarToggle"><i class="bi bi-list"></i></button>
        <h1 class="page-title">${pageTitle}</h1>
      </div>
      <div class="user-chip">
        <div class="avatar">${initials(user.name)}</div>
        <div class="who">
          <div class="uname">${user.name}</div>
          <div class="urole">${user.role}</div>
        </div>
      </div>
    `;

    mainRoot.parentElement.insertBefore(topbar, mainRoot);
    mainRoot.classList.add('app-main');

    document.getElementById('logoutLink').addEventListener('click', (e) => {
      e.preventDefault();
      window.OAS.logout();
    });

    const toggle = document.getElementById('sidebarToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        document.getElementById('appSidebar').classList.toggle('open');
      });
    }
  }

  window.OASLayout = { renderShell };
})();
