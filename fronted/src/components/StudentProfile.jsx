import React, { useState, useEffect } from 'react';
import { fetchStudent, fetchStudentAttendance, fetchStudentStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentProfile({ studentId, onNavigate }) {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!studentId) { setLoading(false); return; }
      try {
        setLoading(true);
        setError('');
        const [s, a] = await Promise.all([
          fetchStudent(studentId),
          fetchStudentAttendance(studentId),
        ]);
        setStudent(s);
        setAttendance(a);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (error) return <div className="error-container"><i className="fas fa-exclamation-triangle"></i> {error}</div>;
  if (!student) return <div className="empty-state"><h3>Student not found</h3></div>;

  const attStats = attendance?.stats || [];
  const attChartData = attStats.map(s => ({ name: s.status, count: s.count }));
  const attRecords = attendance?.records || [];

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => onNavigate('/students')}><i className="fas fa-arrow-left"></i> Back</button>
        <button className="btn btn-primary" onClick={() => onNavigate('/students/edit', student)}><i className="fas fa-edit"></i> Edit</button>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
          <div className="profile-info">
            <h1>{student.name}</h1>
            <p className="profile-meta">
              <span><i className="fas fa-envelope"></i> {student.email}</span>
              <span><i className="fas fa-phone"></i> {student.phone || 'N/A'}</span>
              <span><i className="fas fa-book"></i> {student.course_name || 'No course'}</span>
            </p>
          </div>
          <div className="profile-status">
            <span className={`status-badge large ${(student.status || 'Active').toLowerCase()}`}>{student.status || 'Active'}</span>
            <span className="profile-date">Enrolled: {student.enrollment_date}</span>
          </div>
        </div>
        <div className="profile-details">
          <div className="detail-item"><label>Gender</label><span>{student.gender || 'N/A'}</span></div>
          <div className="detail-item"><label>Date of Birth</label><span>{student.date_of_birth || 'N/A'}</span></div>
          <div className="detail-item"><label>Address</label><span>{student.address || 'N/A'}</span></div>
          <div className="detail-item"><label>Student ID</label><span>{student.id?.slice(0, 8)}...</span></div>
        </div>
      </div>

      <div className="profile-sections">
        <div className="card">
          <div className="card-header"><h3><i className="fas fa-calendar-check"></i> Attendance ({attRecords.length} records)</h3></div>
          {attChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#667eea" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state small"><p>No attendance records</p></div>}
        </div>

        <div className="card">
          <div className="card-header"><h3><i className="fas fa-money-bill-wave"></i> Fee Records</h3></div>
          {student.fees?.length > 0 ? (
            <div className="mini-table">
              {student.fees.map(f => (
                <div key={f.id} className="mini-row">
                  <span>${f.amount} <small>(paid: ${f.paid_amount})</small></span>
                  <span className={`status-badge ${f.status.toLowerCase()}`}>{f.status}</span>
                  <span>{f.due_date || 'No due date'}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state small"><p>No fee records</p></div>}
        </div>
      </div>
    </div>
  );
}
