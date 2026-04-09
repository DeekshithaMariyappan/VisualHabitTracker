import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HabitCard from './components/HabitCard';
import './index.css';

const API_BASE_URL = 'http://localhost:5000/api/habits';

function App() {
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await axios.get(API_BASE_URL);
      setHabits(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching habits:', err);
      setLoading(false);
    }
  };

  const addHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const res = await axios.post(API_BASE_URL, { habitName: newHabitName });
      setHabits([res.data, ...habits]);
      setNewHabitName('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding habit:', err);
    }
  };

  const toggleDate = async (habitId, date) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/${habitId}/toggle`, { date });
      setHabits(habits.map(h => h._id === habitId ? res.data : h));
    } catch (err) {
      console.error('Error toggling date:', err);
    }
  };

  const deleteHabit = async (habitId) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/${habitId}`);
      setHabits(habits.filter(h => h._id !== habitId));
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Trace.Habit</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Add Habit
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Habits...</div>
      ) : (
        <div className="habit-list">
          {habits.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '4rem' }}>
              No habits found. Start by adding one!
            </div>
          ) : (
            habits.map(habit => (
              <HabitCard 
                key={habit._id} 
                habit={habit} 
                onToggleDate={toggleDate} 
                onDelete={deleteHabit}
              />
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary-neon)' }}>New Habit</h2>
            <form onSubmit={addHabit}>
              <div className="form-group">
                <label>Habit Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Morning Run"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-primary" style={{ borderColor: '#666', color: '#666' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
