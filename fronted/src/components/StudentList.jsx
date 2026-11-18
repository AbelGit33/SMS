import React, { useState, useEffect } from 'react';
import { fetchStudents, deleteStudent, fetchCourses } from '../services/api';

export default function StudentList({ onNavigate }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchStudents({ search, status: statusFilter, course_id: courseFilter, page, limit });
      setStudents(data.students || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses().then(setCourses).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, courseFilter]);

  useEffect(() => {
    load();
  }, [search, statusFilter, courseFilter, page]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    try {
      await deleteStudent(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page">
      <div className="page-header">
        <h1><i className="fas fa-user-graduate"></i> Students</h1>
        <button className="btn btn-primary" onClick={() => onNavigate('/students/add')}>
          <i className="fas fa-plus"></i> Add Student
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search by name, email, course..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}><i className="fas fa-times"></i></button>}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Graduated">Graduated</option>
        </select>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {error && <div className="error-banner"><i className="fas fa-exclamation-circle"></i> {error}</div>}

      {loading ? (
        <div className="loading-container"><div className="spinner"></div><p>Loading students...</p></div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-user-graduate"></i>
          <h3>{search || statusFilter || courseFilter ? 'No students match your filters' : 'No students yet'}</h3>
          <p>{search || statusFilter || courseFilter ? 'Try different filters' : 'Click "Add Student" to get started'}</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Enrolled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s.id}>
                    <td>{(page - 1) * limit + idx + 1}</td>
                    <td><span className="clickable-link" onClick={() => onNavigate('/students/profile', s.id)}>{s.name}</span></td>
                    <td>{s.email}</td>
                    <td>{s.phone || '-'}</td>
                    <td><span className="badge badge-course">{s.course_name || '-'}</span></td>
                    <td>{s.enrollment_date}</td>
                    <td><span className={`status-badge ${(s.status || 'Active').toLowerCase()}`}>{s.status || 'Active'}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-action btn-edit" onClick={() => onNavigate('/students/edit', s)} title="Edit"><i className="fas fa-pen"></i></button>
                        <button className="btn-action btn-view" onClick={() => onNavigate('/students/profile', s.id)} title="View"><i className="fas fa-eye"></i></button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(s.id, s.name)} title="Delete"><i className="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}><i className="fas fa-chevron-left"></i></button>
              <span>Page {page} of {totalPages} ({total} total)</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><i className="fas fa-chevron-right"></i></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
