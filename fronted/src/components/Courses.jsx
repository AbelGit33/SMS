import React, { useState, useEffect } from 'react';
import { fetchCourses, deleteCourse, fetchStudentStats } from '../services/api';

export default function Courses({ onNavigate }) {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [c, s] = await Promise.all([fetchCourses(), fetchStudentStats()]);
      setCourses(c || []);
      setStats(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete course "${name}"?`)) return;
    try {
      await deleteCourse(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const courseCountMap = {};
  stats?.courseStats?.forEach(c => { courseCountMap[c.name] = c.count; });

  return (
    <div className="page">
      <div className="page-header">
        <h1><i className="fas fa-book"></i> Courses</h1>
        <button className="btn btn-primary" onClick={() => onNavigate('/courses/add')}>
          <i className="fas fa-plus"></i> Add Course
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-book"></i>
          <h3>No courses yet</h3>
          <p>Click "Add Course" to create one</p>
        </div>
      ) : (
        <div className="grid-cards">
          {courses.map(c => (
            <div key={c.id} className="grid-card">
              <div className="grid-card-header">
                <div className="grid-card-icon"><i className="fas fa-book-open"></i></div>
                <div>
                  <h3>{c.name}</h3>
                  <span className="badge badge-code">{c.code}</span>
                </div>
              </div>
              <div className="grid-card-body">
                <p>{c.description || 'No description'}</p>
                <div className="grid-card-meta">
                  <span><i className="fas fa-clock"></i> {c.duration || 'N/A'}</span>
                  <span><i className="fas fa-dollar-sign"></i> ${c.fee || 0}</span>
                  <span><i className="fas fa-users"></i> {courseCountMap[c.name] || 0} students</span>
                </div>
                <span className={`status-badge ${(c.status || 'Active').toLowerCase()}`}>{c.status || 'Active'}</span>
              </div>
              <div className="grid-card-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => onNavigate('/courses/edit', c)}><i className="fas fa-edit"></i> Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id, c.name)}><i className="fas fa-trash"></i> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
