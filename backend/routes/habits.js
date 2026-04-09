const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// GET all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a new habit
router.post('/', async (req, res) => {
  const habit = new Habit({
    habitName: req.body.habitName
  });

  try {
    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// TOGGLE a completed date
router.patch('/:id/toggle', async (req, res) => {
  try {
    const habit = await Habit.findById(req.id || req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

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

// DELETE a habit
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findById(req.id || req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    await habit.deleteOne();
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
