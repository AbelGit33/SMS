import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { fetchStudentStats, fetchAttendanceStats, fetchFeeStats, fetchActivity, fetchAllStudents } from '../services/api';

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a18cd1'];

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [feeSummary, setFeeSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [s, a, f, act, allStud] = await Promise.all([
          fetchStudentStats(),
          fetchAttendanceStats(),
          fetchFeeStats(),
          fetchActivity(10),
          fetchAllStudents(),
        ]);
        setStats(s);
        setAttendanceSummary(a?.summary || null);
        setFeeSummary(f);
        setActivity(act);
        setRecentStudents((allStud || []).sort((a, b) => new Date(b.created_at || b.enrollment_date) - new Date(a.created_at || a.enrollment_date)).slice(0, 6));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><p>Loading dashboard...</p></div>;
  }

  if (error) {
    return <div className="error-container"><i className="fas fa-exclamation-triangle"></i> <p>{error}</p></div>;
  }

  const courseData = stats?.courseStats?.map(c => ({ name: c.name || 'Unassigned', count: c.count })) || [];
  const attendancePie = attendanceSummary ? [
    { name: 'Present', value: attendanceSummary.present },
    { name: 'Absent', value: attendanceSummary.absent },
    { name: 'Late', value: attendanceSummary.late },
    { name: 'Leave', value: attendanceSummary.leave },
  ].filter(d => d.value > 0) : [];

  const totalStudents = stats?.total || 0;
  const dueAmount = feeSummary?.totalDue || 0;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1><i className="fas fa-chart-pie"></i> Dashboard</h1>
        <p>Overview of your Student Management System</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary" onClick={() => onNavigate('/students')}>
          <div className="stat-icon"><i className="fas fa-user-graduate"></i></div>
          <div className="stat-info"><h3>{stats.total}</h3><p>Total Students</p></div>
          <div className="stat-change"><i className="fas fa-arrow-right"></i></div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info"><h3>{stats.active}</h3><p>Active</p></div>
          <div className="stat-change">{totalStudents > 0 ? Math.round((stats.active / totalStudents) * 100) : 0}%</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon"><i className="fas fa-pause-circle"></i></div>
          <div className="stat-info"><h3>{stats.inactive}</h3><p>Inactive</p></div>
          <div className="stat-change">{totalStudents > 0 ? Math.round((stats.inactive / totalStudents) * 100) : 0}%</div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon"><i className="fas fa-award"></i></div>
          <div className="stat-info"><h3>{stats.graduated}</h3><p>Graduated</p></div>
          <div className="stat-change">{totalStudents > 0 ? Math.round((stats.graduated / totalStudents) * 100) : 0}%</div>
        </div>
      </div>

      <div className="stats-grid secondary">
        <div className="stat-card accent">
          <div className="stat-icon"><i className="fas fa-book"></i></div>
          <div className="stat-info"><h3>{courseData.length}</h3><p>Courses</p></div>
          <div className="stat-change" onClick={() => onNavigate('/courses')} style={{cursor:'pointer'}}><i className="fas fa-arrow-right"></i></div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon"><i className="fas fa-money-bill-wave"></i></div>
          <div className="stat-info"><h3>${(feeSummary?.totalDue || 0).toFixed(2)}</h3><p>Total Due</p></div>
          <div className="stat-change">${(feeSummary?.totalPaid || 0).toFixed(2)} collected</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
          <div className="stat-info">
            <h3>{attendanceSummary ? Math.round((attendanceSummary.present / (attendanceSummary.total || 1)) * 100) : 0}%</h3>
            <p>Attendance Rate</p>
          </div>
          <div className="stat-change">{attendanceSummary?.total || 0} total records</div>
        </div>
      </div>

      <div className="charts-grid">
        {courseData.length > 0 && (
          <div className="chart-card">
            <h3><i className="fas fa-chart-bar"></i> Students per Course</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#667eea" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {attendancePie.length > 0 && (
          <div className="chart-card">
            <h3><i className="fas fa-chart-pie"></i> Attendance Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={attendancePie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {attendancePie.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="dashboard-bottom-grid">
        <div className="card">
          <div className="card-header">
            <h3><i className="fas fa-clock"></i> Recent Students</h3>
            <button className="btn btn-sm btn-primary" onClick={() => onNavigate('/students')}>View All</button>
          </div>
          <div className="recent-list">
            {recentStudents.length === 0 ? (
              <div className="empty-state small"><p>No students enrolled yet</p></div>
            ) : recentStudents.map(s => (
              <div key={s.id} className="recent-item" onClick={() => onNavigate('/students/profile', s.id)} style={{ cursor: 'pointer' }}>
                <div className="recent-avatar">{s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                <div className="recent-info">
                  <strong>{s.name}</strong>
                  <span>{s.course_name || 'No course'}</span>
                </div>
                <span className={`status-badge ${(s.status || 'Active').toLowerCase()}`}>{s.status || 'Active'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3><i className="fas fa-history"></i> Recent Activity</h3>
          </div>
          <div className="activity-list">
            {activity.length === 0 ? (
              <div className="empty-state small"><p>No recent activity</p></div>
            ) : activity.map((a, idx) => (
              <div key={a.id || idx} className="activity-item">
                <div className="activity-icon">
                  <i className={`fas ${a.action?.includes('created') ? 'fa-plus-circle' : a.action?.includes('updated') ? 'fa-edit' : a.action?.includes('deleted') ? 'fa-trash' : 'fa-info-circle'}`}></i>
                </div>
                <div className="activity-info">
                  <span className="activity-action">{a.action?.replace(/_/g, ' ')}</span>
                  <span className="activity-details">{a.details}</span>
                </div>
                <span className="activity-time">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
