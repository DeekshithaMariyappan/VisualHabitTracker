import React, { useState } from 'react';
import axios from 'axios';

const RecommendationCoach = ({ user, onUpdateUserLogs, onUpdateUserLimits }) => {
  const [activeTab, setActiveTab] = useState('videoGames');
  const [logValue, setLogValue] = useState('');
  const [isEditingLimits, setIsEditingLimits] = useState(false);
  
  // Local state for limits editor
  const [limitsForm, setLimitsForm] = useState({
    videoGames: user?.unhealthyHabitLimits?.videoGames || 60,
    mobileScreenTime: user?.unhealthyHabitLimits?.mobileScreenTime || 120,
    junkFood: user?.unhealthyHabitLimits?.junkFood || 1,
    lateSleep: user?.unhealthyHabitLimits?.lateSleep || 0
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get current date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to get today's log value for a habit type
  const getTodayLog = (type) => {
    const log = user?.unhealthyHabitLogs?.find(l => l.habitType === type && l.date === todayStr);
    return log ? log.value : 0;
  };

  const currentLimit = user?.unhealthyHabitLimits?.[activeTab] ?? 60;
  const currentActual = getTodayLog(activeTab);

  // Dynamic coaching recommendations
  const getCoachingAdvice = () => {
    const percent = currentLimit > 0 ? (currentActual / currentLimit) * 100 : 0;

    const advices = {
      videoGames: {
        safe: "🎮 Gamified moderation: Gaming is a great escape, and you're keeping it in a healthy, focused zone! Rest your eyes for 5 minutes.",
        approaching: "⚠️ Attention: You are near your daily gaming threshold. Consider shifting your engagement to a physical activity or reading to restore cognitive baseline.",
        exceeded: "🚨 Limit Exceeded: High artificial dopamine saturation detected. Your brain is fatigued! Shutdown the game, step outside for a 10-minute screen-free walk to restore natural neuro-receptors."
      },
      mobileScreenTime: {
        safe: "📱 Mobile discipline: Brilliant screen boundary management! Limiting screen glow preserves cognitive focus and eye wellness.",
        approaching: "⚠️ Blue-light warning: You are approaching your limit. Artificial screens suppress melatonin by 50%. Switch your mobile to Grayscale mode to reduce impulse scrolling.",
        exceeded: "🚨 Limit Exceeded: Blue light over-exposure. This can cause headache, fatigue, and poor deep sleep. Turn off notifications, put your phone in a drawer, and read a physical paper book now."
      },
      junkFood: {
        safe: "🍏 Nutritional control: Superb choice staying off refined sugars and trans-fats today. Your biological energy levels will remain stable!",
        approaching: "⚠️ Boundary reached: You've reached your junk food quota. If you feel cravings, drink sparkling water or eat mixed almonds to curb sweet cravings naturally.",
        exceeded: "🚨 Limit Exceeded: Sugar spike alert! Refined trans-fats slow down cell oxygenation and cause lethargy. Flush out toxins by drinking 500ml of mineral water right now."
      },
      lateSleep: {
        safe: "💤 Circadian rhythm: Your sleep onset boundaries are fully aligned with your natural clock. Prepare for deep REM recovery!",
        approaching: "⚠️ Sleep delay: You are staying up past optimal recovery windows. Dim house lights, close all electronics, and prepare for bed to guarantee cellular reset.",
        exceeded: "🚨 Late sleep alert: Core cognitive recovery happens between 10 PM and 2 AM. Turn off all glowing devices immediately and do a 4-7-8 breathing sequence to trigger melatonin."
      }
    };

    if (currentActual === 0) {
      return `🌟 Perfect Score! You haven't logged any ${activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()} activity today. Maintain this clean sheet to unlock maximum cognitive focus!`;
    }

    if (currentActual > currentLimit) {
      return advices[activeTab].exceeded;
    } else if (currentActual >= currentLimit * 0.8) {
      return advices[activeTab].approaching;
    } else {
      return advices[activeTab].safe;
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(logValue);
    if (isNaN(val) || val < 0) return;

    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/auth/logs',
        { habitType: activeTab, value: val, date: todayStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onUpdateUserLogs(res.data.unhealthyHabitLogs);
      setLogValue('');
      setMessage('Daily activity logged successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error logging activity:', err);
      setMessage(err.response?.data?.message || 'Error logging activity');
    } finally {
      setLoading(false);
    }
  };

  const handleLimitSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'http://localhost:5000/api/auth/limits',
        limitsForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onUpdateUserLimits(res.data.unhealthyHabitLimits);
      setIsEditingLimits(false);
      setMessage('Personal thresholds updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating limits:', err);
      setMessage(err.response?.data?.message || 'Error updating limits');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickIncrement = async (amount) => {
    setLoading(true);
    const newValue = Math.max(0, currentActual + amount);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/auth/logs',
        { habitType: activeTab, value: newValue, date: todayStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdateUserLogs(res.data.unhealthyHabitLogs);
    } catch (err) {
      console.error('Quick increment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const percent = currentLimit > 0 ? Math.min(100, (currentActual / currentLimit) * 100) : 0;
  const isOverLimit = currentActual > currentLimit;
  const isNearLimit = currentActual >= currentLimit * 0.8 && !isOverLimit;

  // Custom status color helper
  const getStatusColor = () => {
    if (currentActual === 0) return 'var(--primary-neon)';
    if (isOverLimit) return '#ff3838';
    if (isNearLimit) return '#ffb300';
    return 'var(--primary-neon)';
  };

  return (
    <div className="coach-card">
      <div className="coach-header">
        <div>
          <h2 className="coach-title">Smart Limits & Recommendations</h2>
          <p className="coach-subtitle">AI Health Guard to limit unhealthy digital and lifestyle habits</p>
        </div>
        <button 
          className="btn-primary limit-settings-btn"
          onClick={() => setIsEditingLimits(!isEditingLimits)}
        >
          {isEditingLimits ? 'Close Settings' : '🔧 Adjust Targets'}
        </button>
      </div>

      {message && <div className="coach-alert-toast">{message}</div>}

      {isEditingLimits ? (
        /* Edit Limits View */
        <form onSubmit={handleLimitSubmit} className="limits-editor-form fade-in">
          <h3 className="editor-title">Define Your Ideal Daily Boundaries</h3>
          
          <div className="editor-grid">
            <div className="form-group">
              <label>🎮 Video Games Limit (mins)</label>
              <input
                type="number"
                className="form-input"
                value={limitsForm.videoGames}
                onChange={(e) => setLimitsForm({ ...limitsForm, videoGames: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>📱 Mobile Screen Time (mins)</label>
              <input
                type="number"
                className="form-input"
                value={limitsForm.mobileScreenTime}
                onChange={(e) => setLimitsForm({ ...limitsForm, mobileScreenTime: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>🍏 Junk Food Limit (counts)</label>
              <input
                type="number"
                className="form-input"
                value={limitsForm.junkFood}
                onChange={(e) => setLimitsForm({ ...limitsForm, junkFood: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>💤 Delayed Sleep Limit (mins past 12am)</label>
              <input
                type="number"
                className="form-input"
                value={limitsForm.lateSleep}
                onChange={(e) => setLimitsForm({ ...limitsForm, lateSleep: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>

          <div className="editor-buttons">
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ background: 'var(--primary-neon)', color: '#000' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Boundaries'}
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ borderColor: '#555', color: '#888' }}
              onClick={() => setIsEditingLimits(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* Dynamic Coach Screen */
        <div className="coach-tabs-layout">
          {/* Navigation Tabs */}
          <div className="coach-tabs">
            <button 
              className={`coach-tab ${activeTab === 'videoGames' ? 'active' : ''}`}
              onClick={() => setActiveTab('videoGames')}
            >
              🎮 Games
            </button>
            <button 
              className={`coach-tab ${activeTab === 'mobileScreenTime' ? 'active' : ''}`}
              onClick={() => setActiveTab('mobileScreenTime')}
            >
              📱 Mobile
            </button>
            <button 
              className={`coach-tab ${activeTab === 'junkFood' ? 'active' : ''}`}
              onClick={() => setActiveTab('junkFood')}
            >
              🍏 Junk Food
            </button>
            <button 
              className={`coach-tab ${activeTab === 'lateSleep' ? 'active' : ''}`}
              onClick={() => setActiveTab('lateSleep')}
            >
              💤 Late Sleep
            </button>
          </div>

          {/* Tab Panel */}
          <div className="coach-panel fade-in">
            <div className="coach-panel-split">
              {/* Gauges & Indicators */}
              <div className="gauge-side">
                <div className="gauge-heading">
                  <span className="gauge-label">
                    {activeTab.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  </span>
                  <span className="gauge-numbers" style={{ color: getStatusColor() }}>
                    {currentActual} / <span className="limit-cap">{currentLimit}</span> {activeTab === 'junkFood' ? 'times' : 'mins'}
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="coach-progress-track">
                  <div 
                    className={`coach-progress-bar ${isOverLimit ? 'over' : isNearLimit ? 'near' : 'safe'}`}
                    style={{ 
                      width: `${percent}%`,
                      backgroundColor: getStatusColor()
                    }}
                  ></div>
                </div>

                {/* Quick Increment Actions */}
                <div className="quick-logs">
                  <span className="quick-title">Quick Log:</span>
                  <div className="quick-buttons">
                    <button 
                      className="quick-btn plus"
                      onClick={() => handleQuickIncrement(activeTab === 'junkFood' ? 1 : 15)}
                      disabled={loading}
                    >
                      +{activeTab === 'junkFood' ? '1 Item' : '15m'}
                    </button>
                    <button 
                      className="quick-btn minus"
                      onClick={() => handleQuickIncrement(activeTab === 'junkFood' ? -1 : -15)}
                      disabled={loading || currentActual === 0}
                    >
                      -{activeTab === 'junkFood' ? '1 Item' : '15m'}
                    </button>
                  </div>
                </div>

                {/* Manual Log Form */}
                <form onSubmit={handleLogSubmit} className="manual-log-form">
                  <input
                    type="number"
                    className="sidebar-input form-input-small"
                    placeholder={`Custom ${activeTab === 'junkFood' ? 'count' : 'mins'} (e.g. 45)`}
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    min="0"
                  />
                  <button type="submit" className="btn-primary log-submit" disabled={loading || !logValue}>
                    Set Value
                  </button>
                </form>
              </div>

              {/* Coaching & Tips Pane */}
              <div className="coaching-advice-box" style={{ borderColor: getStatusColor() + '44' }}>
                <div className="coach-bubble-glow" style={{ boxShadow: `0 0 30px ${getStatusColor()}15` }}></div>
                <h4 className="advice-title" style={{ color: getStatusColor() }}>Coaching Insights</h4>
                <p className="advice-text">{getCoachingAdvice()}</p>
                <div className="advice-footer">
                  <span className="coach-avatar-indicator">🤖 Smart Coach AI</span>
                  <span className="date-indicator">Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCoach;
