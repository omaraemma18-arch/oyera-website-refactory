// Guard: only admin & senior technician may add items (matches inventory.html's manage permission).
const currentUser = OASAuth.requireRole(["admin", "senior_technician"]);

const form = document.getElementById("addItemForm");
const errorBox = document.getElementById("addItemError");
const successBox = document.getElementById("addItemSuccess");
const submitBtn = document.getElementById("addItemSubmitBtn");

const itemName = document.getElementById("itemName");
const itemCategory = document.getElementById("itemCategory");
const itemSupplier = document.getElementById("itemSupplier");
const itemCost = document.getElementById("itemCost");
const itemQty = document.getElementById("itemQty");

const requiredFields = [itemName, itemCost, itemQty];

// Cached locally so validation can run synchronously as the person types;
// refreshed on load and after every successful add.
let knownItems = [];

async function refreshKnownItems() {
  try {
    knownItems = await OASInventory.getItems();
  } catch (err) {
    console.error("Could not load existing inventory for duplicate-name checking:", err);
  }
}

function isDuplicateName(name) {
  const normalized = name.trim().toLowerCase();
  return knownItems.some((i) => i.name.trim().toLowerCase() === normalized);
}

const validators = {
  itemName: (val) => {
    const trimmed = val.trim();
    if (trimmed.length < 2) return "Enter the item's name (at least 2 characters).";
    if (isDuplicateName(trimmed)) return "An item with this name already exists.";
    return "";
  },
  itemCost: (val) => {
    if (val === "" || Number.isNaN(Number(val))) return "Enter a valid unit cost.";
    if (Number(val) < 0) return "Unit cost can't be negative.";
    return "";
  },
  itemQty: (val) => {
    if (val === "" || Number.isNaN(Number(val))) return "Enter a valid quantity.";
    if (Number(val) < 0) return "Quantity can't be negative.";
    if (!Number.isInteger(Number(val))) return "Quantity must be a whole number.";
    return "";
  },
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
  updateSubmitState();
  return !message;
}

// Submit stays disabled until every required field currently passes validation.
function updateSubmitState() {
  const allValid = requiredFields.every((input) => validators[input.id](input.value) === "");
  submitBtn.disabled = !allValid;
  submitBtn.classList.toggle("btn-disabled", !allValid);
}

requiredFields.forEach((input) => {
  input.addEventListener("input", () => validateField(input));
  input.addEventListener("blur", () => validateField(input));
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  successBox.classList.remove("visible");
  errorBox.classList.remove("visible");

  const results = requiredFields.map(validateField);
  if (!results.every(Boolean)) {
    errorBox.textContent = "Please fix the highlighted fields below.";
    errorBox.classList.add("visible");
    const firstInvalid = requiredFields.find((el) => el.classList.contains("invalid"));
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  submitBtn.disabled = true;
  try {
    await OASInventory.addItem({
      name: itemName.value.trim(),
      category: itemCategory.value,
      supplier: itemSupplier.value.trim(),
      cost: Number(itemCost.value) || 0,
      qty: Number(itemQty.value) || 0,
    });

    await refreshKnownItems();
    form.reset();
    requiredFields.forEach((el) => el.classList.remove("valid", "invalid"));
    successBox.textContent = "Item added to inventory. Add another, or head back to the inventory.";
    successBox.classList.add("visible");
    itemName.focus();
  } catch (err) {
    errorBox.textContent = "Could not add the item: " + err.message;
    errorBox.classList.add("visible");
  } finally {
    updateSubmitState();
  }
});

// Init: load existing items for duplicate checking, then set the initial (disabled) button state.
refreshKnownItems().then(updateSubmitState);
