(async function () {
  const user = window.OAS.requireSession();
  if (!user) return;

  window.OASLayout.renderShell({ user, pageTitle: 'Customer Details', activeHref: '/dashboard' });

  const params = new URLSearchParams(window.location.search);
  const customerId = params.get('id');
  const alertBox = document.getElementById('pageAlert');

  function statusClass(status) {
    if (status === 'Available') return 'status-available';
    if (status === 'In Progress') return 'status-in-progress';
    return 'status-completed';
  }

  function showError(msg) {
    alertBox.textContent = msg;
    alertBox.classList.add('show');
  }

  if (!customerId) {
    showError('No customer was specified.');
    return;
  }

  try {
    const { customer } = await window.OAS.apiFetch(`/api/customers/${customerId}`);

    document.getElementById('customerCard').classList.remove('d-none');
    document.getElementById('custName').textContent = customer.name;
    document.getElementById('custPhone').textContent = customer.phone;
    document.getElementById('custPlate').textContent = customer.vehiclePlate;
    document.getElementById('custType').textContent = customer.vehicleType;
    document.getElementById('custTech').textContent = customer.assignedTechnician
      ? customer.assignedTechnician.name
      : 'Unassigned';
    document.getElementById('custCreated').textContent = new Date(customer.createdAt).toLocaleString();
    document.getElementById('custIssue').textContent = customer.issueDescription;

    const statusEl = document.getElementById('custStatus');
    statusEl.textContent = customer.status;
    statusEl.classList.add(statusClass(customer.status));

    const actionArea = document.getElementById('actionArea');

    if (user.role === 'technician') {
      if (customer.status === 'Available') {
        actionArea.innerHTML = `
          <p class="text-muted small">Claim this customer to begin working on their vehicle.</p>
          <button class="btn btn-oas w-100" id="startWorkBtn">Start Work</button>`;
        document.getElementById('startWorkBtn').addEventListener('click', async (e) => {
          const btn = e.target;
          btn.disabled = true;
          btn.textContent = 'Starting…';
          try {
            await window.OAS.apiFetch(`/api/customers/${customerId}/claim`, { method: 'PUT' });
            window.location.href = `/addservicerecord?customerId=${customerId}`;
          } catch (err) {
            showError(err.message);
            btn.disabled = false;
            btn.textContent = 'Start Work';
          }
        });
      } else if (customer.status === 'In Progress') {
        actionArea.innerHTML = `
          <p class="text-muted small">This vehicle is in progress. Log the completed work below.</p>
          <a href="/addservicerecord?customerId=${customerId}" class="btn btn-oas w-100">Add Service Record</a>`;
      } else {
        actionArea.innerHTML = `<p class="text-muted small mb-0">This job is already completed. See Service History for the full record.</p>`;
      }
    } else {
      actionArea.innerHTML = `<p class="text-muted small mb-0">Admins can view customer details here. Technicians handle claiming and logging work from their dashboard.</p>`;
    }
  } catch (err) {
    showError(err.message);
  }
})();
