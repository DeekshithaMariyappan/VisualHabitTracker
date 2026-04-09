require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const habitRoutes = require('./routes/habits');
app.use('/api/habits', habitRoutes);

app.get('/', (req, res) => {
  res.send('Habit Tracker API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
