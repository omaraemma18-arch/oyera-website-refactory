import mongoose from 'mongoose';

const serviceRecordSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AddNewCustomer',
      required: true
    },
    carName: {
      type: String,
      required: true,
      trim: true
    },
    numberPlate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    serviceCategory: {
      type: String,
      required: true
    },
    assignedTechnician: {
      type: String,
      required: true
    },
    partsUsed: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Inventory'
        },
        quantity: {
          type: Number,
          default: 1
        }
      }
    ],
    notes: {
      type: String,
      default: 'Routine Maintenance Completed'
    },
    totalCost: {
      type: Number,
      required: true
    },
    completedDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('ServiceRecord', serviceRecordSchema);