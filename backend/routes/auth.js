const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check for existing user
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    user = new User({
      username,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        unhealthyHabitLimits: user.unhealthyHabitLimits,
        unhealthyHabitLogs: user.unhealthyHabitLogs
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        unhealthyHabitLimits: user.unhealthyHabitLimits,
        unhealthyHabitLogs: user.unhealthyHabitLogs
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET api/auth/me
// @desc    Get user profile data
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// @route   PUT api/auth/limits
// @desc    Update limits for unhealthy habits
// @access  Private
router.put('/limits', auth, async (req, res) => {
  const { videoGames, mobileScreenTime, junkFood, lateSleep } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (videoGames !== undefined) user.unhealthyHabitLimits.videoGames = videoGames;
    if (mobileScreenTime !== undefined) user.unhealthyHabitLimits.mobileScreenTime = mobileScreenTime;
    if (junkFood !== undefined) user.unhealthyHabitLimits.junkFood = junkFood;
    if (lateSleep !== undefined) user.unhealthyHabitLimits.lateSleep = lateSleep;

    await user.save();
    res.json({ unhealthyHabitLimits: user.unhealthyHabitLimits });
  } catch (err) {
    console.error('Limits update error:', err);
    res.status(500).json({ message: 'Server error updating thresholds' });
  }
});

// @route   POST api/auth/logs
// @desc    Add or update dynamic unhealthy habit logs
// @access  Private
router.post('/logs', auth, async (req, res) => {
  const { habitType, value, date } = req.body;

  if (!habitType || value === undefined || !date) {
    return res.status(400).json({ message: 'Please provide habitType, value and date' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if a log entry for this habit type and date already exists
    const existingLogIdx = user.unhealthyHabitLogs.findIndex(
      log => log.habitType === habitType && log.date === date
    );

    if (existingLogIdx > -1) {
      // Update existing
      user.unhealthyHabitLogs[existingLogIdx].value = value;
    } else {
      // Add new log entry
      user.unhealthyHabitLogs.push({ habitType, value, date });
    }

    await user.save();
    res.json({ unhealthyHabitLogs: user.unhealthyHabitLogs });
  } catch (err) {
    console.error('Logs update error:', err);
    res.status(500).json({ message: 'Server error updating habit logs' });
  }
});

module.exports = router;
