const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habitName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
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
