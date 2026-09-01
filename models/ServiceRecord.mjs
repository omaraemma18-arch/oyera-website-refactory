import mongoose from 'mongoose';

const materialLineSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    name: { type: String, required: true }, // snapshot, in case item is edited later
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 }, // snapshot at time of use, UGX
  },
  { _id: false }
);

const serviceRecordSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workDone: { type: String, required: true, trim: true },
    materialsUsed: { type: [materialLineSchema], default: [] },
    labourFee: { type: Number, required: true, min: 0 }, // UGX
    materialsCost: { type: Number, required: true, min: 0 }, // UGX, computed
    totalCost: { type: Number, required: true, min: 0 }, // UGX, computed
  },
  { timestamps: true }
);

export default mongoose.model('ServiceRecord', serviceRecordSchema);
