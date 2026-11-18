import React, { useState, useEffect } from 'react';
import { fetchAttendance, fetchAllStudents, fetchCourses, markAttendance, fetchAttendanceStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [courseFilter, setCourseFilter] = useState('');
  const [marking, setMarking] = useState(false);
  const [statusMap, setStatusMap] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [a, s, c, st] = await Promise.all([
        fetchAttendance({ date }),
        fetchAllStudents(),
        fetchCourses(),
        fetchAttendanceStats(),
      ]);
      setRecords(a.records || []);
      setStudents(s || []);
      setCourses(c || []);
      setStats(st?.summary || null);

      const map = {};
      (a.records || []).forEach(r => { map[r.student_id] = r.status; });
      setStatusMap(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [date]);

  const filteredStudents = courseFilter
    ? students.filter(s => s.course_id == courseFilter)
    : students;

  const handleMarkAll = async (status) => {
    const records = filteredStudents.map(s => ({
      student_id: s.id,
      date,
      status,
    }));
    setMarking(true);
    try {
      await markAttendance(records);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setMarking(false);
    }
  };

  const handleMarkIndividual = async (studentId, status) => {
    try {
      await markAttendance([{ student_id: studentId, date, status }]);
      setStatusMap(prev => ({ ...prev, [studentId]: status }));
    } catch (err) {
      alert(err.message);
    }
  };

  const attendanceData = stats ? [
    { name: 'Present', count: stats.present },
    { name: 'Absent', count: stats.absent },
    { name: 'Late', count: stats.late },
    { name: 'Leave', count: stats.leave },
  ].filter(d => d.count > 0) : [];

  return (
    <div className="page">
      <div className="page-header">
        <h1><i className="fas fa-calendar-check"></i> Attendance</h1>
      </div>

      <div className="filters">
        <div className="form-group" style={{ margin: 0 }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="quick-actions">
          <button className="btn btn-sm btn-success" onClick={() => handleMarkAll('Present')} disabled={marking}>
            <i className="fas fa-check"></i> All Present
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleMarkAll('Absent')} disabled={marking}>
            <i className="fas fa-times"></i> All Absent
          </button>
        </div>
      </div>

      {stats && attendanceData.length > 0 && (
        <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
          <h3>Attendance Summary for {date}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#667eea" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-calendar-check"></i>
          <h3>No students found</h3>
          <p>{courseFilter ? 'No students in this course' : 'Add students first'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Course</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, idx) => {
                const currentStatus = statusMap[s.id] || 'Not Marked';
                return (
                  <tr key={s.id}>
                    <td>{idx + 1}</td>
                    <td>{s.name}</td>
                    <td><span className="badge badge-course">{s.course_name || '-'}</span></td>
                    <td>
                      <span className={`status-badge ${currentStatus.toLowerCase()}`}>{currentStatus}</span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className={`btn-att ${currentStatus === 'Present' ? 'active' : ''}`} onClick={() => handleMarkIndividual(s.id, 'Present')}>P</button>
                        <button className={`btn-att ${currentStatus === 'Absent' ? 'active abs' : ''}`} onClick={() => handleMarkIndividual(s.id, 'Absent')}>A</button>
                        <button className={`btn-att ${currentStatus === 'Late' ? 'active late' : ''}`} onClick={() => handleMarkIndividual(s.id, 'Late')}>L</button>
                        <button className={`btn-att ${currentStatus === 'Leave' ? 'active leave' : ''}`} onClick={() => handleMarkIndividual(s.id, 'Leave')}>LV</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
