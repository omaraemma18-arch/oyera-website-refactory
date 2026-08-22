// Only admin, senior technician, and technician may view this page at all.
const currentUser = OASAuth.requireRole(["admin", "senior_technician", "technician"]);

// Inventory can only be edited by admin or senior technician.
// Regular technicians get a read-only view + cart.
window.canManageInventory = !!currentUser && (currentUser.role === "admin" || currentUser.role === "senior_technician");

// Only admin issues receipts.
window.isAdmin = !!currentUser && currentUser.role === "admin";

// Regular (non-senior) technicians submit their cart for payment instead of managing stock directly.
window.isJuniorTechnician = !!currentUser && currentUser.role === "technician";
