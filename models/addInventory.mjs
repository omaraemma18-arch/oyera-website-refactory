import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    partNumber: { type: String, required: true, trim: true, uppercase: true },
    category: { type: String, required: true },
    quantityInStock: { type: Number, required: true, min: 0, default: 0 },
    unitPrice: { type: Number, required: true, min: 0, default: 0 },
    supplier: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Inventory', inventorySchema);