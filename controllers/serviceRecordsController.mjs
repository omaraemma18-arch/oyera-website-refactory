import serviceRecords from '../models/serviceRecords.mjs';

export const createServiceRecord = async (req, res) => {
  try {
    const {
      customerName,
      carPlate,
      servicesDone,
      partsAndOilsUsed,
      partNames,
      partQuantities,
      assignedTechnicians,
      totalCost
    } = req.body;

    const formattedServices = Array.isArray(servicesDone)
      ? servicesDone
      : servicesDone ? [servicesDone] : [];

    const formattedPartsAndOils = Array.isArray(partsAndOilsUsed)
      ? partsAndOilsUsed
      : partsAndOilsUsed ? [partsAndOilsUsed] : [];

    const formattedTechnicians = Array.isArray(assignedTechnicians)
      ? assignedTechnicians
      : assignedTechnicians ? [assignedTechnicians] : [];

    const dynamicParts = [];
    if (partNames) {
      const names = Array.isArray(partNames) ? partNames : [partNames];
      const quantities = Array.isArray(partQuantities) ? partQuantities : [partQuantities];

      names.forEach((name, index) => {
        if (name) {
          dynamicParts.push({
            partName: name,
            quantity: Number(quantities[index]) || 1
          });
        }
      });
    }

    const newRecord = new serviceRecords({
      customerName,
      carPlate,
      servicesDone: formattedServices,
      partsAndOilsUsed: formattedPartsAndOils,
      dynamicParts,
      assignedTechnicians: formattedTechnicians,
      totalCost: Number(totalCost)
    });

    await newRecord.save();

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Error saving record:', err);
    return res.status(500).send('Server error: Unable to save service record.');
  }
};