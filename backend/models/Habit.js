const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  habitName: {
    type: String,
    required: true,
    trim: true
  },
  createdDate: {
    type: String, // Storing as YYYY-MM-DD for consistency
    default: () => new Date().toISOString().split('T')[0]
  },
  completedDates: {
    type: [String], // Array of YYYY-MM-DD strings
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
