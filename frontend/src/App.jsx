import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HabitCard from './components/HabitCard';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import RecommendationCoach from './components/RecommendationCoach';
import AddHabitModal from './components/AddHabitModal';
import DailyReport from './components/DailyReport';
import './index.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [habits, setHabits] = useState([]);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appInitializing, setAppInitializing] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Set auth header helper
  const setAuthHeader = (jwtToken) => {
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Initialize and check current user
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        setAuthHeader(token);
        try {
          const res = await axios.get(`${API_BASE_URL}/auth/me`);
          setUser(res.data);
          // Fetch habits after successful auth
          await fetchHabits(token);
        } catch (err) {
          console.error('Session validation failed:', err);
          handleLogout();
        }
      }
      setAppInitializing(false);
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const fetchHabits = async (jwtToken) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/habits`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setHabits(res.data);
    } catch (err) {
      console.error('Error fetching habits:', err);
    }
  };

  const handleAuthSuccess = async (userData, jwtToken) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setAuthHeader(jwtToken);
    setLoading(true);

    // Fetch habits for user
    try {
      const habitsRes = await axios.get(`${API_BASE_URL}/habits`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setHabits(habitsRes.data);
    } catch (err) {
      console.error('Error checking initial habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setHabits([]);
    setSelectedHabitId(null);
    setAuthHeader(null);
  };

  // Add a new habit from sidebar/dashboard
  const handleAddHabit = async (habitData) => {
    // habitData can be a string (from quick add) or an object (from detailed modal)
    const payload = typeof habitData === 'string'
      ? { habitName: habitData, description: '', priority: 'Medium' }
      : habitData;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/habits`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHabits([res.data, ...habits]);
      return res.data;
    } catch (err) {
      console.error('Error creating habit:', err);
      throw err;
    }
  };

  // Toggle completion dates
  const handleToggleDate = async (habitId, date) => {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/habits/${habitId}/toggle`,
        { date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHabits(habits.map(h => h._id === habitId ? res.data : h));
    } catch (err) {
      console.error('Error toggling completion date:', err);
    }
  };

  // Delete habit
  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit from your dashboard?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/habits/${habitId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHabits(habits.filter(h => h._id !== habitId));
      if (selectedHabitId === habitId) setSelectedHabitId(null);
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  // Update unhealthy logs state locally
  const handleUpdateUserLogs = (updatedLogs) => {
    setUser({ ...user, unhealthyHabitLogs: updatedLogs });
  };

  // Update unhealthy limits state locally
  const handleUpdateUserLimits = (updatedLimits) => {
    setUser({ ...user, unhealthyHabitLimits: updatedLimits });
  };

  // Calculate consistency score
  const getConsistencyScore = () => {
    if (habits.length === 0) return 0;
    const totalCompletions = habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0);
    return Math.min(100, Math.round((totalCompletions / (habits.length * 30)) * 100)); // normalized out of active days
  };

  const totalCompletions = habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0);

  if (appInitializing) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#030305',
        color: '#fff',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ letterSpacing: '2px', color: 'var(--primary-neon)', marginBottom: '1rem' }}>TRACE.HABIT</h2>
          <div style={{ color: '#888', fontSize: '0.9rem' }}>Initializing SaaS Workspace...</div>
        </div>
      </div>
    );
  }

  // If not logged in, render the AuthPage
  if (!token || !user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Filter habits if selected in sidebar
  const displayedHabits = selectedHabitId 
    ? habits.filter(h => h._id === selectedHabitId)
    : habits;

  return (
    <div className="saas-workspace">
      {/* Sidebar navigation */}
      <Sidebar 
        user={user} 
        habits={habits} 
        onAddHabit={handleAddHabit} 
        onLogout={handleLogout}
        selectedHabitId={selectedHabitId}
        setSelectedHabitId={setSelectedHabitId}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Panel Content */}
      <main className="main-workspace">
        <header className="workspace-header">
          <div className="dashboard-title-area">
            <h2>Welcome Back, {user.username}!</h2>
            <p>Here is your daily SaaS habit tracker and limits dashboard.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span className="saas-badge" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
              ⚡ Streak Protected
            </span>
          </div>
        </header>

        {/* Overview Stats Badges */}
        <section className="overview-row">
          <div className="overview-card blue">
            <h4 className="overview-title">Active Trackers</h4>
            <div className="overview-value">{habits.length}</div>
            <p className="overview-desc">Positive habits being logged</p>
          </div>
          <div className="overview-card green">
            <h4 className="overview-title">Total Completions</h4>
            <div className="overview-value">{totalCompletions}</div>
            <p className="overview-desc">All completions historically</p>
          </div>
          <div className="overview-card purple">
            <h4 className="overview-title">Consistency Ratio</h4>
            <div className="overview-value">{getConsistencyScore()}%</div>
            <p className="overview-desc">Score based on 30-day index</p>
          </div>
        </section>

        {/* Detailed Daily Activity Report Section */}
        <section style={{ marginBottom: '3rem' }}>
          <DailyReport
            user={user}
            habits={habits}
            onToggleDate={handleToggleDate}
            onUpdateUserLogs={handleUpdateUserLogs}
            token={token}
          />
        </section>

        {/* Smart Limits & Coaching recommendations */}
        <section>
          <RecommendationCoach 
            user={user} 
            onUpdateUserLogs={handleUpdateUserLogs}
            onUpdateUserLimits={handleUpdateUserLimits}
          />
        </section>

        {/* Active Positive Habits heatmaps */}
        <section>
          <h3 className="habit-section-heading">
            {selectedHabitId ? 'Filtered Habit Activity' : 'Your Positive Habit Heatmaps'}
          </h3>
          
          {loading ? (
            <div style={{ color: '#888', padding: '2rem 0' }}>Syncing with SaaS databases...</div>
          ) : (
            <div className="habit-list">
              {displayedHabits.length === 0 ? (
                <div className="overview-card" style={{ textAlign: 'center', padding: '3.5rem', color: '#888', border: '1px dashed rgba(188, 19, 254, 0.4)' }}>
                  {selectedHabitId ? (
                    'Selected habit was not found.'
                  ) : (
                    <div>
                      <h3 style={{ color: '#fff', marginBottom: '0.8rem', fontSize: '1.4rem' }}>No positive habits logged yet!</h3>
                      <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                        Your habit tracker is empty. Create a positive tracker with details like priority levels and custom descriptions to kick off your consistency logs!
                      </p>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.8rem 1.6rem', background: 'var(--primary-neon)', color: '#000', border: 'none', fontWeight: 'bold', borderRadius: '8px' }}
                        onClick={() => setIsAddModalOpen(true)}
                      >
                        ✨ Add Your First Habit
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                displayedHabits.map(habit => (
                  <div key={habit._id} className={selectedHabitId ? "highlighted-card" : ""}>
                    <HabitCard 
                      habit={habit}
                      onToggleDate={handleToggleDate}
                      onDelete={handleDeleteHabit}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      {/* Add Habit Detailed Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddHabit}
      />
    </div>
  );
}

export default App;
