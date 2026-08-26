const mongoose = require('mongoose');


const addNewCustomerSchema = new mongoose.Schema({
  carName: { type:String, required: true },
  vehicelSizeCategory: { type: String, required: true },
  serviceCategory: { type: String, required: true},
  numberPlate: { type: String, required: true },
  serviceCost: { type: Number },
  labourFee:{type:Number,default:20000},
  assignedTechnician:{type:String},
  status:{ type: String,default:'pending'},
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('addNewCustomer', addNewCustomerSchema);