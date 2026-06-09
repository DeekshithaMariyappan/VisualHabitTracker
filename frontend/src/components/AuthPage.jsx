import React, { useState } from 'react';
import axios from 'axios';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin) {
      if (!username) {
        setError('Please enter a username.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      // Assume local backend runs on PORT 5000
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        username,
        email,
        password
      });

      if (res.data && res.data.token) {
        onAuthSuccess(res.data.user, res.data.token);
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(
        err.response?.data?.message || 
        'Unable to connect to authentication server. Please check if backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Visual Side Banner (Shows Habit Activity) */}
      <div className="auth-banner">
        <div className="auth-banner-overlay"></div>
        <img 
          src="/habit_activity.png" 
          alt="Habit Activity Grid and Analytics" 
          className="auth-banner-image" 
        />
        <div className="auth-banner-text">
          <h2 className="banner-logo">Trace.Habit</h2>
          <p className="banner-tagline">Visualise Consistency. Break Limits. Master Habits.</p>
          
          <div className="banner-highlights">
            <div className="banner-highlight-item">
              <span className="highlight-dot green"></span>
              <div>
                <strong>365-Day Activity Grid</strong>
                <p>Track daily progress with glowing GitHub-style heatmaps.</p>
              </div>
            </div>
            <div className="banner-highlight-item">
              <span className="highlight-dot purple"></span>
              <div>
                <strong>Smart Limits Coach</strong>
                <p>Track and curb screen, junk food, and video game habits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <h3>{isLogin ? 'Welcome Back' : 'Get Started'}</h3>
            <p>{isLogin ? 'Log in to continue your streak' : 'Create an account to start tracking'}</p>
          </div>

          {error && <div className="auth-error-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="e.g. alex_streak"
                  className="form-input"
                  value={username}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="alex@example.com"
                className="form-input"
                value={email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  className="form-input"
                  value={confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-toggle-footer">
            <span>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="auth-toggle-link"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
