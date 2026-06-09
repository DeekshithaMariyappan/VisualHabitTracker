const mongoose = require('mongoose');

const unhealthyHabitLogSchema = new mongoose.Schema({
  habitType: {
    type: String,
    required: true,
    enum: ['videoGames', 'mobileScreenTime', 'junkFood', 'lateSleep']
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  unhealthyHabitLimits: {
    videoGames: { type: Number, default: 60 }, // minutes
    mobileScreenTime: { type: Number, default: 120 }, // minutes
    junkFood: { type: Number, default: 1 }, // counts
    lateSleep: { type: Number, default: 0 } // minutes past midnight
  },
  unhealthyHabitLogs: [unhealthyHabitLogSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
