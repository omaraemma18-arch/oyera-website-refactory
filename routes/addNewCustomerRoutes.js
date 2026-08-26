const express = require('express');
const router = express.Router();

const Customer = require('../models/addNewCustomer');

router.post('/addnewcustomer', async (req, res) => {
  try {
    const {
      carName,
      vehicelSizeCategory,
      serviceCategory,
      numberPlate,
      serviceCost,
      labourFee,
      assignedTechnician,
      status
    } = req.body;

    const newCustomer = new Customer({
      carName,
      vehicelSizeCategory,
      serviceCategory: (serviceCategory), 
      numberPlate,
      serviceCost: serviceCost ? Number(serviceCost) : undefined,
      labourFee: labourFee ? Number(labourFee) : 20000,
      assignedTechnician,
      status
    });

    // saving to MongoDB
    await newCustomer.save();
console.log('Successfully saved to MongoDB!');
    
    res.redirect('/dashboard.html');
  } catch (error) {
    console.error('Error adding customer:', error);
    res.send('Server Error: Unable to save customer data.');
  }
});

module.exports = router;