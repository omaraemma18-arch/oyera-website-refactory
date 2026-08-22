// Guard: only customers may view this page.
const currentUser = OASAuth.requireRole(["customer"]);

document.getElementById("dashGreeting").textContent = "Welcome, " + currentUser.name;

// Tab switching
document.querySelectorAll(".dash-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".dash-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".dash-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
    if (tab.dataset.tab === "myBookingsPanel") renderMyBookings();
  });
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---- Book a service ----
const bookingForm = document.getElementById("bookingForm");
const bookingNote = document.getElementById("bookingNote");

const bkVehicle = document.getElementById("bkVehicle");
const bkPhone = document.getElementById("bkPhone");
const bkService = document.getElementById("bkService");

const PHONE_PATTERN = /^(?:\+256|0)7\d{8}$/; // e.g. 0712345678 or +256712345678

const validators = {
  bkVehicle: (val) => (val.trim().length >= 3 ? "" : "Enter your vehicle's type, make & model."),
  bkPhone: (val) =>
    PHONE_PATTERN.test(val.trim().replace(/\s+/g, ""))
      ? ""
      : "Enter a valid Ugandan number, e.g. 0712 345 678.",
  bkService: (val) => (val ? "" : "Select the service you need."),
};

function validateField(input) {
  const message = validators[input.id](input.value);
  const errorEl = document.getElementById(input.id + "Error");
  if (message) {
    input.classList.add("invalid");
    input.classList.remove("valid");
    errorEl.textContent = message;
  } else {
    input.classList.remove("invalid");
    input.classList.add("valid");
    errorEl.textContent = "";
  }
  return !message;
}

[bkVehicle, bkPhone, bkService].forEach((input) => {
  // Live feedback as the person types/selects, and again on blur.
  input.addEventListener("input", () => validateField(input));
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("change", () => validateField(input));
});

bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const results = [bkVehicle, bkPhone, bkService].map(validateField);
  const allValid = results.every(Boolean);

  if (!allValid) {
    bookingNote.textContent = "Please fix the highlighted fields above.";
    bookingNote.style.color = "#f87171";
    const firstInvalid = [bkVehicle, bkPhone, bkService].find((el) => el.classList.contains("invalid"));
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const submitBtn = bookingForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    await OASBookings.createBooking({
      phone: bkPhone.value,
      vehicle: bkVehicle.value,
      service: bkService.value,
      message: document.getElementById("bkMessage").value,
    });
    bookingForm.reset();
    [bkVehicle, bkPhone, bkService].forEach((el) => el.classList.remove("valid", "invalid"));
    bookingNote.textContent = "Booking requested! Check the \"My Bookings\" tab to track its status.";
    bookingNote.style.color = "#4ade80";
  } catch (err) {
    bookingNote.textContent = "Could not submit the booking: " + err.message;
    bookingNote.style.color = "#f87171";
  } finally {
    submitBtn.disabled = false;
  }
});

// ---- My bookings ----
const myBookingsBody = document.getElementById("myBookingsBody");
const myBookingsEmpty = document.getElementById("myBookingsEmpty");

async function renderMyBookings() {
  let bookings;
  try {
    bookings = await OASBookings.getBookingsForCustomer();
  } catch (err) {
    myBookingsBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--color-text-muted); padding:2rem;">Could not load your bookings (${escapeHtml(err.message)}).</td></tr>`;
    return;
  }

  myBookingsBody.innerHTML = "";

  if (bookings.length === 0) {
    myBookingsEmpty.style.display = "block";
    return;
  }
  myBookingsEmpty.style.display = "none";

  bookings.forEach((b) => {
    const tr = document.createElement("tr");
    const date = new Date(b.createdAt).toLocaleDateString();
    tr.innerHTML = `
      <td>${escapeHtml(b.vehicle || "—")}</td>
      <td>${escapeHtml(b.service)}</td>
      <td style="max-width:220px;">${escapeHtml(b.message || "—")}</td>
      <td>${date}</td>
      <td><span class="booking-status booking-status--${b.status.toLowerCase()}">${b.status}</span></td>
    `;
    myBookingsBody.appendChild(tr);
  });
}

renderMyBookings();
