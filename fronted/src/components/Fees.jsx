import React, { useState, useEffect } from 'react';
import { fetchFees, fetchFeeStats, deleteFee, fetchAllStudents } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#43e97b', '#fa709a', '#ffa726', '#667eea'];

export default function Fees({ onNavigate }) {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [f, s] = await Promise.all([
        fetchFees({ status: statusFilter, page, limit }),
        fetchFeeStats(),
      ]);
      setFees(f.fees || []);
      setTotal(f.total || 0);
      setStats(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { load(); }, [statusFilter, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee record?')) return;
    try {
      await deleteFee(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const pieData = stats?.byStatus?.map(s => ({ name: s.status, value: s.total })) || [];
  const monthlyData = stats?.monthly?.slice().reverse() || [];

  return (
    <div className="page">
      <div className="page-header">
        <h1><i className="fas fa-money-bill-wave"></i> Fees Management</h1>
        <button className="btn btn-primary" onClick={() => onNavigate('/fees/add')}>
          <i className="fas fa-plus"></i> Add Fee Record
        </button>
      </div>

      {stats && (
        <div className="stats-grid secondary">
          <div className="stat-card info">
            <div className="stat-icon"><i className="fas fa-dollar-sign"></i></div>
            <div className="stat-info"><h3>${(stats.totalAmount || 0).toFixed(2)}</h3><p>Total Fees</p></div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
            <div className="stat-info"><h3>${(stats.totalPaid || 0).toFixed(2)}</h3><p>Paid</p></div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon"><i className="fas fa-exclamation-circle"></i></div>
            <div className="stat-info"><h3>${(stats.totalDue || 0).toFixed(2)}</h3><p>Due</p></div>
          </div>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3><i className="fas fa-chart-pie"></i> Fee Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: $${value}`}>
                  {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {monthlyData.length > 0 && (
            <div className="chart-card">
              <h3><i className="fas fa-chart-line"></i> Monthly Collection</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="collected" fill="#43e97b" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div className="filters">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : fees.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-money-bill-wave"></i>
          <h3>No fee records</h3>
          <p>Click "Add Fee Record" to create one</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f, idx) => {
                  const due = f.amount - f.paid_amount;
                  return (
                    <tr key={f.id}>
                      <td>{(page - 1) * limit + idx + 1}</td>
                      <td>{f.student_name}</td>
                      <td><span className="badge badge-course">{f.course_name || '-'}</span></td>
                      <td>${f.amount.toFixed(2)}</td>
                      <td>${f.paid_amount.toFixed(2)}</td>
                      <td className={due > 0 ? 'text-danger' : 'text-success'}>${due.toFixed(2)}</td>
                      <td>{f.due_date || '-'}</td>
                      <td><span className={`status-badge ${f.status.toLowerCase()}`}>{f.status}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-action btn-edit" onClick={() => onNavigate('/fees/edit', f)}><i className="fas fa-pen"></i></button>
                          <button className="btn-action btn-delete" onClick={() => handleDelete(f.id)}><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}><i className="fas fa-chevron-left"></i></button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><i className="fas fa-chevron-right"></i></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
