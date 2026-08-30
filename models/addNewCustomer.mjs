import mongoose from 'mongoose';

const addNewCustomerSchema = new mongoose.Schema({
  carName: { type: String, required: true },
  vehicleSizeCategory: { type: String, required: true },
  serviceCategory: { type: String, required: true },
  numberPlate: { type: String, required: true },
  serviceCost: { type: Number },
  labourFee: { type: Number, default: 20000 },
  assignedTechnician: { type: String },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('addNewCustomer', addNewCustomerSchema);