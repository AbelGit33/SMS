import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

export default function Login() {
  const { loginUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await login(username, password);
      loginUser(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h1>Student Management System</h1>
            <p>Sign in to your admin account</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
            <div className="form-group">
              <label><i className="fas fa-user"></i> Username or Email</label>
              <input
                type="text" placeholder="Enter your username" value={username}
                onChange={(e) => setUsername(e.target.value)} autoFocus
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-lock"></i> Password</label>
              <input
                type="password" placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Signing in...</> : <><i className="fas fa-sign-in-alt"></i> Sign In</>}
            </button>
          </form>
          <div className="login-footer">
            <p>Default: <strong>admin</strong> / <strong>admin123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
