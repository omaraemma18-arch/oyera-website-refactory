import addNewCustomer from '../models/addNewCustomer.mjs';

export const createNewCustomer = async (req, res) => {
  try {
    const {
      carName,
      vehicleSizeCategory,
      serviceCategory,
      numberPlate,
      assignedTechnician,
      serviceCost,
      labourFee,
      status
    } = req.body;

    const newCustomer = new addNewCustomer({
      carName,
      vehicleSizeCategory,
      serviceCategory,
      numberPlate,
      assignedTechnician,
      serviceCost: Number(serviceCost),
      labourFee: Number(labourFee),
      status
    });

    await newCustomer.save();
    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Error adding new customer job:', err);
    return res.status(500).send('Server error: Unable to add customer.');
  }
};