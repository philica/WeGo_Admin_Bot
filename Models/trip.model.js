const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true
  },
  date:{
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  isDeleted:{
    type:Boolean,
    required: true,
    default: false

  }
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;