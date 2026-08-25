const mongoose = require('mongoose');


const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  cost: { type: Number, required: true },
  supplier: { type: String },
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('Inventory', inventorySchema);