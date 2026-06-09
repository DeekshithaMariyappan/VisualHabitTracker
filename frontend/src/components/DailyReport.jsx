import React, { useState } from 'react';
import { format, subDays, addDays, parseISO } from 'date-fns';
import axios from 'axios';

const DailyReport = ({
  user,
  habits,
  onToggleDate,
  onUpdateUserLogs,
  token
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loadingType, setLoadingType] = useState(null); // tracking quick log loading

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

  const handlePrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleJumpToToday = () => {
    setSelectedDate(new Date());
  };

  // Positive habits calculations
  const totalPositive = habits.length;
  const completedHabits = habits.filter(habit => habit.completedDates?.includes(dateStr));
  const completedCount = completedHabits.length;
  const completionPercent = totalPositive > 0 ? Math.round((completedCount / totalPositive) * 100) : 0;

  // Unhealthy habits logs
  const getLogForType = (type) => {
    const log = user?.unhealthyHabitLogs?.find(l => l.habitType === type && l.date === dateStr);
    return log ? log.value : 0;
  };

  const handleAdjustUnhealthy = async (type, amount) => {
    setLoadingType(type);
    const currentVal = getLogForType(type);
    const newVal = Math.max(0, currentVal + amount);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/logs',
        { habitType: type, value: newVal, date: dateStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdateUserLogs(res.data.unhealthyHabitLogs);
    } catch (err) {
      console.error('Error adjusting daily report log:', err);
    } finally {
      setLoadingType(null);
    }
  };

  const unhealthyHabitTypes = [
    { key: 'videoGames', label: 'Video Games', icon: '🎮', unit: 'mins' },
    { key: 'mobileScreenTime', label: 'Screen Time', icon: '📱', unit: 'mins' },
    { key: 'junkFood', label: 'Junk Food', icon: '🍏', unit: 'count' },
    { key: 'lateSleep', label: 'Late Sleep', icon: '💤', unit: 'mins' }
  ];

  return (
    <div className="daily-report-card">
      <header className="report-header">
        <div>
          <h2 className="coach-title">Daily Activity Report</h2>
          <p className="coach-subtitle">Granular daily breakdown of positive achievements and lifestyle checks</p>
        </div>
        
        {/* Date Selector Navigation */}
        <div className="report-date-selector">
          <button className="date-nav-btn" onClick={handlePrevDay}>&larr;</button>
          <div className="date-display">
            <span className="date-text">{format(selectedDate, 'eeee, MMM d, yyyy')}</span>
            {!isToday && (
              <button className="jump-today-btn" onClick={handleJumpToToday}>
                Back to Today
              </button>
            )}
          </div>
          <button className="date-nav-btn" onClick={handleNextDay}>&rarr;</button>
        </div>
      </header>

      <div className="report-content-grid">
        {/* Positive Habits Section */}
        <div className="report-section-box">
          <div className="box-header">
            <h3 className="box-title">Positive Habit Checklist</h3>
            <span className="box-badge glow-green">
              {completedCount} / {totalPositive} Done ({completionPercent}%)
            </span>
          </div>

          <div className="report-progress-track">
            <div
              className="report-progress-bar"
              style={{ width: `${completionPercent}%`, backgroundColor: 'var(--primary-neon)' }}
            />
          </div>

          <div className="report-habit-list">
            {habits.length === 0 ? (
              <p className="report-empty-state">No habits tracked. Add a positive habit to see the checklist!</p>
            ) : (
              habits.map(habit => {
                const isCompleted = habit.completedDates?.includes(dateStr);
                const priorityClass = habit.priority?.toLowerCase() || 'medium';

                return (
                  <div key={habit._id} className={`report-habit-item-row ${isCompleted ? 'completed' : ''}`}>
                    <div className="report-habit-info">
                      <div className="report-habit-title-row">
                        <span className="report-habit-name">{habit.habitName}</span>
                        <span className={`priority-badge-pill ${priorityClass}`}>{habit.priority || 'Medium'}</span>
                      </div>
                      {habit.description && (
                        <p className="report-habit-desc">{habit.description}</p>
                      )}
                    </div>
                    
                    <button
                      className={`report-check-btn ${isCompleted ? 'checked' : ''}`}
                      onClick={() => onToggleDate(habit._id, dateStr)}
                    >
                      {isCompleted ? '✓ Completed' : '○ Pending'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Unhealthy Habits Section */}
        <div className="report-section-box">
          <div className="box-header">
            <h3 className="box-title">Lifestyle & Limit Violations</h3>
            <span className="box-badge" style={{ color: 'var(--secondary-neon)' }}>Limits Checked</span>
          </div>

          <div className="report-unhealthy-list">
            {unhealthyHabitTypes.map(item => {
              const actual = getLogForType(item.key);
              const limit = user?.unhealthyHabitLimits?.[item.key] || 0;
              const percent = limit > 0 ? Math.min(100, (actual / limit) * 100) : 0;
              const isOver = actual > limit;
              const isNear = actual >= limit * 0.8 && !isOver;
              const statusColor = actual === 0 ? 'var(--primary-neon)' : isOver ? '#ff3838' : isNear ? '#ffb300' : 'var(--primary-neon)';

              return (
                <div key={item.key} className="report-unhealthy-item">
                  <div className="unhealthy-item-top">
                    <span className="unhealthy-item-label">
                      {item.icon} {item.label}
                    </span>
                    <span className="unhealthy-item-values" style={{ color: statusColor }}>
                      {actual} / <span className="limit-cap">{limit}</span> {item.unit}
                    </span>
                  </div>

                  <div className="coach-progress-track" style={{ height: '6px', marginBottom: '10px' }}>
                    <div
                      className={`coach-progress-bar ${isOver ? 'over' : isNear ? 'near' : 'safe'}`}
                      style={{ width: `${percent}%`, backgroundColor: statusColor }}
                    />
                  </div>

                  <div className="unhealthy-item-actions">
                    <span className="unhealthy-status-text">
                      {actual === 0 ? '✨ Clean Sheet' : isOver ? '🚨 Exceeded Limit!' : isNear ? '⚠️ Approaching Limit' : '👍 Safe Zone'}
                    </span>
                    
                    <div className="quick-buttons">
                      <button
                        className="quick-btn plus"
                        onClick={() => handleAdjustUnhealthy(item.key, item.key === 'junkFood' ? 1 : 15)}
                        disabled={loadingType === item.key}
                      >
                        +{item.key === 'junkFood' ? '1' : '15m'}
                      </button>
                      <button
                        className="quick-btn minus"
                        onClick={() => handleAdjustUnhealthy(item.key, item.key === 'junkFood' ? -1 : -15)}
                        disabled={loadingType === item.key || actual === 0}
                      >
                        -{item.key === 'junkFood' ? '1' : '15m'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;
