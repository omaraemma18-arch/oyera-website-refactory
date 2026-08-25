const express = require('express');
const router = express.Router();
const Inventory = require('../models/addInventory');


router.post('/addinventory', async (req, res) => {

  console.log('incoming data',req.body)
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    console.log('Successfully saved to MongoDB:', newItem);
  } catch (err) {
    console.error('Error saving inventory:', err);
  }

  
  return res.redirect('/dashboard');
});

module.exports = router;