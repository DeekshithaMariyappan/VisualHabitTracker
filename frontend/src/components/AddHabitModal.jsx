import React, { useState } from 'react';

const AddHabitModal = ({ isOpen, onClose, onSave }) => {
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!habitName.trim()) {
      setError('Habit name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSave({
        habitName: habitName.trim(),
        description: description.trim(),
        priority
      });
      // Reset form
      setHabitName('');
      setDescription('');
      setPriority('Medium');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Create New Tracker</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </header>

        {error && <div className="auth-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Habit Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Read 10 Pages, Gym Session"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-input"
              placeholder="What does success look like for this habit?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows="3"
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label>Priority Level</label>
            <div className="priority-selector">
              {['Low', 'Medium', 'High'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`priority-btn ${level.toLowerCase()} ${priority === level ? 'active' : ''}`}
                  onClick={() => setPriority(level)}
                  disabled={isSubmitting}
                >
                  <span className={`priority-indicator ${level.toLowerCase()}`} />
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-primary"
              style={{ borderColor: 'rgba(255, 255, 255, 0.15)', color: 'var(--text-secondary)' }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ background: 'var(--primary-neon)', color: '#000', border: 'none' }}
              disabled={isSubmitting || !habitName.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
