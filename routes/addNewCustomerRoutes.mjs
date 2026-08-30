import express from 'express';
import AddNewCustomer from '../models/addNewCustomer.mjs';

const router = express.Router();

router.post('/addnewcustomer', async (req, res) => {
  try {
    const { carName, numberPlate, serviceCategory, assignedTechnician, vehicleSizeCategory, serviceCost, labourFee } = req.body;

    const customerData = {
      carName: carName && carName.trim() !== '' ? carName.trim() : 'Unknown Vehicle',
      numberPlate: numberPlate && numberPlate.trim() !== '' ? numberPlate.trim().toUpperCase() : 'UNKNOWN',
      serviceCategory: serviceCategory || 'General Service',
      assignedTechnician: assignedTechnician && assignedTechnician.trim() !== '' ? assignedTechnician.trim() : 'Unassigned',
      vehicleSizeCategory: vehicleSizeCategory || 'small',
      serviceCost: Number(serviceCost) || 0,
      labourFee: Number(labourFee) || 0,
      status: 'active'
    };

    const customer = new AddNewCustomer(customerData);
    await customer.save();

    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      return res.redirect('/dashboard');
    }

    return res.status(201).json({ success: true, message: 'Customer added successfully.' });
  } catch (error) {
    console.error('Error adding customer:', error);
    return res.status(500).json({ error: 'Failed to add customer: ' + error.message });
  }
});

router.get('/api/customers', async (req, res) => {
  try {
    const customers = await AddNewCustomer.find().sort({ createdAt: -1 });
    return res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ error: 'Failed to fetch customer list.' });
  }
});

export default router;