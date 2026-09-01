import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    vehiclePlate: { type: String, required: true, trim: true, uppercase: true },
    vehicleType: {
      type: String,
      enum: ['Small', 'Commercial', 'Heavy'],
      required: true,
    },
    issueDescription: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Available', 'In Progress', 'Completed'],
      default: 'Available',
    },
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Customer', customerSchema);
