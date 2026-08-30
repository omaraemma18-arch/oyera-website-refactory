import mongoose from 'mongoose';

const addNewCustomerSchema = new mongoose.Schema(
  {
    carName: {
      type: String,
      required: true,
      trim: true
    },
    numberPlate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: 'UNKNOWN'
    },
    serviceCategory: {
      type: String,
      required: true,
      default: 'General Service'
    },
    assignedTechnician: {
      type: String,
      required: true,
      default: 'Unassigned'
    },
    vehicleSizeCategory: {
      type: String,
      enum: ['small', 'commercial', 'heavy'],
      default: 'small'
    },
    serviceCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    labourFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'pending'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('AddNewCustomer', addNewCustomerSchema);