/*
  Oyera Auto Service Bay — Bookings
  -------------------------------------
  Talks to the real backend (server/routes/bookings.js) instead of localStorage.
*/

(function () {
  function normalize(b) {
    return {
      id: b._id,
      customerName: b.customerName,
      customerEmail: b.customerEmail,
      phone: b.phone,
      vehicle: b.vehicle,
      service: b.service,
      message: b.message,
      status: b.status,
      createdAt: b.createdAt,
    };
  }

  // Staff: every booking.
  async function getBookings() {
    const data = await OASApi.apiRequest("/api/bookings");
    return data.bookings.map(normalize);
  }

  // Customer: only their own bookings (server figures out "own" from the JWT).
  async function getBookingsForCustomer() {
    const data = await OASApi.apiRequest("/api/bookings/mine");
    return data.bookings.map(normalize);
  }

  async function createBooking({ phone, vehicle, service, message }) {
    const data = await OASApi.apiRequest("/api/bookings", {
      method: "POST",
      body: { phone, vehicle, service, message },
    });
    return normalize(data.booking);
  }

  async function updateBookingStatus(id, status) {
    const data = await OASApi.apiRequest("/api/bookings/" + id, {
      method: "PUT",
      body: { status },
    });
    return normalize(data.booking);
  }

  window.OASBookings = {
    getBookings,
    getBookingsForCustomer,
    createBooking,
    updateBookingStatus,
  };
})();
