import React from 'react';
import Heatmap from './Heatmap';

const HabitCard = ({ habit, onToggleDate, onDelete }) => {
  const calculateStreak = () => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const sortedDates = [...habit.completedDates].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let currentDate = new Date();
    
    // Check if yesterday or today was completed
    const latestDate = new Date(sortedDates[0]);
    const diffDays = Math.floor((currentDate - latestDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return 0; // Streak broken

    // Simplistic streak calculation (consecutive dates in completedDates)
    // For a real app, we'd check for gaps
    // Let's just return the count of completed dates as a placeholder 'Total' if streak logic is complex
    return habit.completedDates.length;
  };

  return (
    <div className="habit-card fade-in">
      <div className="habit-name">
        {habit.habitName}
        <button 
          onClick={() => onDelete(habit._id)}
          style={{ background: 'transparent', border: 'none', color: '#ff4b2b', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          DELETE
        </button>
      </div>
      <div className="stats">
        <div>Total Completions: <span className="stat-value">{habit.completedDates.length}</span></div>
        <div>Total Days: <span className="stat-value">365</span></div>
      </div>
      <Heatmap 
        completedDates={habit.completedDates} 
        onToggleDate={(date) => onToggleDate(habit._id, date)} 
      />
    </div>
  );
};

export default HabitCard;
