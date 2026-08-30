async function loadInventoryDropdown() {
  const partsSelect = document.getElementById('modalPartsUsed');
  if (!partsSelect) return;

  try {
    const res = await fetch('/api/inventory');
    if (!res.ok) throw new Error('Failed to fetch inventory');
    const items = await res.json();

    partsSelect.innerHTML = '<option value="" disabled selected>Select Parts/Materials Used</option>';
    partsSelect.innerHTML += '<option value="none">None Required</option>';

    items.forEach(item => {
      const price = Number(item.unitPrice) || 0;
      const opt = document.createElement('option');
      opt.value = item._id;
      opt.textContent = `${item.itemName} - UGX ${price.toLocaleString()} (${item.quantityInStock} in stock)`;
      partsSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Error loading inventory dropdown:', err);
  }
}