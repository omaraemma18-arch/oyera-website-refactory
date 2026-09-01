import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: 'General' },
    supplier: { type: String, trim: true, default: '' },
    unitCost: { type: Number, required: true, min: 0 }, // UGX
    quantity: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('InventoryItem', inventoryItemSchema);
