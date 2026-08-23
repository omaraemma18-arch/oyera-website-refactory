const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  loginRole: { type: String, required: true },
  loginEmail: { type: String, required: true, unique: true },
  loginPassword: { type: String, required: true }
});

module.exports = mongoose.model('user', userSchema);