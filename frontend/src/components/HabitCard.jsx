import React from 'react';
import Heatmap from './Heatmap';

const HabitCard = ({ habit, onToggleDate, onDelete }) => {
  
  // Real consecutive streak calculation
  const calculateStreak = () => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    // Sort completed dates descending (most recent first)
    const sortedDates = [...habit.completedDates].sort((a, b) => new Date(b) - new Date(a));
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if user completed the habit today or yesterday
    const hasToday = sortedDates.includes(todayStr);
    const hasYesterday = sortedDates.includes(yesterdayStr);
    
    if (!hasToday && !hasYesterday) return 0; // Streak broken

    let streak = 0;
    let checkDate = hasToday ? today : yesterday;
    
    // Iterate backwards daily to see how far the streak goes
    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(checkStr)) {
        streak++;
        // Decrement by 1 day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();
  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates?.includes(todayStr);
  const priorityClass = habit.priority?.toLowerCase() || 'medium';

  return (
    <div className="habit-card fade-in">
      <div className="habit-header-row">
        <div className="habit-name-wrapper">
          <span className="habit-name-text">{habit.habitName}</span>
          <span className={`priority-badge-pill ${priorityClass}`}>{habit.priority || 'Medium'}</span>
        </div>
        <button 
          onClick={() => onDelete(habit._id)}
          className="btn-delete-habit"
        >
          DELETE
        </button>
      </div>

      {habit.description && (
        <p className="habit-description-text">{habit.description}</p>
      )}

      <div className="stats" style={{ margin: '1.2rem 0' }}>
        <div>
          Total Logs: <span className="stat-value">{habit.completedDates.length} days</span>
        </div>
        <div>
          Current Streak: <span className="stat-value" style={{ color: streak > 0 ? 'var(--primary-neon)' : 'var(--text-secondary)' }}>
            🔥 {streak} {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      <div className="today-completion-toggle">
        <button
          className={`btn-toggle-today ${isCompletedToday ? 'completed' : ''}`}
          onClick={() => onToggleDate(habit._id, todayStr)}
        >
          {isCompletedToday ? '✓ Completed Today 🎉' : '○ Mark Completed Today'}
        </button>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Yearly Consistency Heatmap:
        </p>
        <Heatmap 
          completedDates={habit.completedDates} 
          onToggleDate={(date) => onToggleDate(habit._id, date)} 
        />
      </div>
    </div>
  );
};

export default HabitCard;
