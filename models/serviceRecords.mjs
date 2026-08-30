
import mongoose from 'mongoose';

const serviceRecordsSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  carPlate: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  servicesDone: [{
    type: String,
    required: true
  }],
  partsAndOilsUsed: [{
    type: String
  }],
  dynamicParts: [{
    partName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 }
  }],
  assignedTechnicians: [{
    type: String,
    required: true
  }],
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('serviceRecords', serviceRecordsSchema);