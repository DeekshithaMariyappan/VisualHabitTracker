import React, { useState } from 'react';

const Sidebar = ({
  user,
  habits,
  onAddHabit,
  onLogout,
  selectedHabitId,
  setSelectedHabitId,
  onOpenAddModal
}) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddHabit(newHabitName.trim());
      setNewHabitName('');
    } catch (err) {
      console.error('Error adding habit from sidebar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="sidebar">
      {/* SaaS Logo */}
      <div className="sidebar-brand">
        <h1 className="logo sidebar-logo">Trace</h1>
      </div>

      {/* User Section */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="user-info">
          <span className="username">{user?.username || 'Active User'}</span>
          <button className="btn-logout" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ADD HABITS FIELD SECTION */}
      <div className="sidebar-section">
        <h3 className="section-title">Add Habits</h3>
        <button
          className="btn-primary"
          style={{ width: '100%', marginBottom: '0.8rem', fontSize: '0.85rem', padding: '0.6rem', background: 'transparent', border: '1px solid var(--secondary-neon)', color: 'var(--secondary-neon)' }}
          onClick={onOpenAddModal}
        >
          ✨ New Habit (Detailed)
        </button>
        <form onSubmit={handleSubmit} className="sidebar-add-form">
          <input
            type="text"
            className="sidebar-input"
            placeholder="Quick add..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="sidebar-add-btn"
            disabled={isSubmitting || !newHabitName.trim()}
          >
            {isSubmitting ? '...' : '+'}
          </button>
        </form>
      </div>

      {/* TRACK HABITS NAVIGATION SECTION */}
      <div className="sidebar-section scrollable-section">
        <h3 className="section-title">Track Habits</h3>
        <div className="sidebar-habit-list">
          <button
            className={`sidebar-habit-item ${selectedHabitId === null ? 'active' : ''}`}
            onClick={() => setSelectedHabitId(null)}
          >
            <span className="dot-all"></span>
            <span className="habit-title-text">All Activities</span>
            <span className="badge">{habits.length}</span>
          </button>

          {habits.length === 0 ? (
            <div className="sidebar-empty">No habits tracking. Add one above!</div>
          ) : (
            habits.map(habit => {
              const completedCount = habit.completedDates?.length || 0;
              const isSelected = selectedHabitId === habit._id;

              return (
                <button
                  key={habit._id}
                  className={`sidebar-habit-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedHabitId(habit._id)}
                >
                  <span className="dot-habit"></span>
                  <span className="habit-title-text">{habit.habitName}</span>
                  <span className="badge glow-green">{completedCount}d</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <p>Target: 100% Consistency</p>
      </div>
    </aside>
  );
};

export default Sidebar;
