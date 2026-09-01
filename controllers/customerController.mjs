import Customer from '../models/Customer.mjs';

// GET /api/customers?search=&status=
export async function listCustomers(req, res) {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      const re = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ name: re }, { phone: re }, { vehiclePlate: re }];
    }

    const customers = await Customer.find(filter)
      .populate('assignedTechnician', 'name')
      .sort({ createdAt: -1 });

    res.json({ customers });
  } catch {
    res.status(500).json({ error: 'Could not load customers. Please try again.' });
  }
}

// GET /api/customers/stats — counts for the dashboard cards
export async function customerStats(req, res) {
  try {
    const [available, inProgress, completed, total] = await Promise.all([
      Customer.countDocuments({ status: 'Available' }),
      Customer.countDocuments({ status: 'In Progress' }),
      Customer.countDocuments({ status: 'Completed' }),
      Customer.countDocuments({}),
    ]);
    res.json({ available, inProgress, completed, total });
  } catch {
    res.status(500).json({ error: 'Could not load dashboard stats.' });
  }
}

// GET /api/customers/:id
export async function getCustomer(req, res) {
  try {
    const customer = await Customer.findById(req.params.id).populate('assignedTechnician', 'name');
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });
    res.json({ customer });
  } catch {
    res.status(404).json({ error: 'Customer not found.' });
  }
}

// POST /api/customers — admin only
export async function createCustomer(req, res) {
  try {
    const { name, phone, vehiclePlate, vehicleType, issueDescription } = req.body;

    if (!name || !phone || !vehiclePlate || !vehicleType || !issueDescription) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }
    const validTypes = ['Small', 'Commercial', 'Heavy'];
    if (!validTypes.includes(vehicleType)) {
      return res.status(400).json({ error: 'Please choose a valid vehicle type.' });
    }

    const customer = await Customer.create({
      name,
      phone,
      vehiclePlate,
      vehicleType,
      issueDescription,
    });

    res.status(201).json({ customer });
  } catch {
    res.status(500).json({ error: 'Could not add the customer. Please try again.' });
  }
}

// PUT /api/customers/:id/claim — technician picks up an available customer to work on
export async function claimCustomer(req, res) {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });

    if (customer.status !== 'Available') {
      return res.status(400).json({ error: 'This customer is no longer available.' });
    }

    customer.status = 'In Progress';
    customer.assignedTechnician = req.user.id;
    await customer.save();

    res.json({ customer });
  } catch {
    res.status(500).json({ error: 'Could not update the customer. Please try again.' });
  }
}
