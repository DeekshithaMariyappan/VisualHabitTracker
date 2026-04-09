import React from 'react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

const Heatmap = ({ completedDates, onToggleDate }) => {
  const today = new Date();
  const startDate = subDays(today, 364); // Last 365 days
  
  const dates = eachDayOfInterval({
    start: startDate,
    end: today
  });

  // Group dates into weeks (for grid layout)
  // But CSS Grid auto-flow column is easier
  
  return (
    <div className="heatmap-container">
      <div className="heatmap-grid" style={{
        display: 'grid',
        gridTemplateRows: 'repeat(7, 12px)',
        gridAutoFlow: 'column',
        gap: '3px'
      }}>
        {dates.map((date, i) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isCompleted = completedDates.includes(dateStr);
          
          return (
            <div
              key={dateStr}
              className={`heatmap-cell ${isCompleted ? 'completed' : ''}`}
              title={`${dateStr} ${isCompleted ? '(Completed)' : ''}`}
              onClick={() => onToggleDate(dateStr)}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: '#666' }}>
        <span>{format(startDate, 'MMM d, yyyy')}</span>
        <span>{format(today, 'MMM d, yyyy')}</span>
      </div>
    </div>
  );
};

export default Heatmap;
