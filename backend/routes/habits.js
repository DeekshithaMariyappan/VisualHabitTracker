const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

// GET all habits for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a new habit for the logged-in user
router.post('/', auth, async (req, res) => {
  const habit = new Habit({
    habitName: req.body.habitName,
    description: req.body.description || '',
    priority: req.body.priority || 'Medium',
    user: req.user.id
  });

  try {
    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// TOGGLE a completed date on a user's habit
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found or access denied' });

    const date = req.body.date; // YYYY-MM-DD
    const index = habit.completedDates.indexOf(date);

    if (index === -1) {
      habit.completedDates.push(date);
    } else {
      habit.completedDates.splice(index, 1);
    }

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a user's habit
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found or access denied' });

    await habit.deleteOne();
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
