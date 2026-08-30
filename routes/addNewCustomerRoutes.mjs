import express from 'express';
import Customer from '../models/addNewCustomer.mjs';

const router = express.Router();

router.post('/addnewcustomer', async (req, res) => {
  try {
    const {
      carName,
      vehicleSizeCategory,
      serviceCategory,
      numberPlate,
      serviceCost,
      labourFee = 20000,
      assignedTechnician,
      status
    } = req.body;

    const newCustomer = new Customer({
      carName,
      vehicleSizeCategory,
      serviceCategory,
      numberPlate,
      serviceCost: serviceCost ? Number(serviceCost) : undefined,
      labourFee: Number(labourFee),
      assignedTechnician,
      status
    });

    await newCustomer.save();
    console.log('Successfully saved to MongoDB!');

    return res.redirect('/dashboard.html');
  } catch (error) {
    console.error('Error adding customer:', error);
    return res.status(500).send('Server Error: Unable to save customer data.');
  }
});

export default router;