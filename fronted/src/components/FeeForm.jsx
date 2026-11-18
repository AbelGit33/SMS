import React, { useState, useEffect } from 'react';
import { createFee, updateFee, fetchAllStudents } from '../services/api';

const initialForm = { student_id: '', amount: '', paid_amount: '0', due_date: '', payment_date: '', payment_method: 'Cash', remark: '' };

export default function FeeForm({ onNavigate, editData }) {
  const [form, setForm] = useState(initialForm);
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAllStudents().then(setStudents).catch(() => {});
    if (editData) {
      setForm({
        student_id: editData.student_id || '',
        amount: editData.amount || '',
        paid_amount: editData.paid_amount || '0',
        due_date: editData.due_date || '',
        payment_date: editData.payment_date || '',
        payment_method: editData.payment_method || 'Cash',
        remark: editData.remark || '',
      });
    }
  }, [editData]);

  const validate = () => {
    const errs = {};
    if (!form.student_id) errs.student_id = 'Select a student';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Valid amount required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        amount: parseFloat(form.amount),
        paid_amount: parseFloat(form.paid_amount) || 0,
      };
      if (editData) {
        await updateFee(editData.id, data);
      } else {
        await createFee(data);
      }
      onNavigate('/fees');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1><i className={`fas ${editData ? 'fa-edit' : 'fa-plus-circle'}`}></i> {editData ? 'Edit Fee Record' : 'Add Fee Record'}</h1>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {!editData && (
              <div className="form-group full-width">
                <label>Student *</label>
                <select name="student_id" value={form.student_id} onChange={handleChange} className={errors.student_id ? 'error' : ''}>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
                {errors.student_id && <span className="error-text">{errors.student_id}</span>}
              </div>
            )}
            {editData && (
              <div className="form-group full-width">
                <label>Student</label>
                <input type="text" value={editData.student_name || 'N/A'} disabled />
              </div>
            )}
            <div className="form-group">
              <label>Amount ($) *</label>
              <input type="number" name="amount" placeholder="0.00" value={form.amount} onChange={handleChange} min="0" step="0.01" className={errors.amount ? 'error' : ''} />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>
            <div className="form-group">
              <label>Paid Amount ($)</label>
              <input type="number" name="paid_amount" placeholder="0.00" value={form.paid_amount} onChange={handleChange} min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" name="due_date" value={form.due_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Payment Date</label>
              <input type="date" name="payment_date" value={form.payment_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select name="payment_method" value={form.payment_method} onChange={handleChange}>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Remark</label>
              <input type="text" name="remark" placeholder="Any notes" value={form.remark} onChange={handleChange} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => onNavigate('/fees')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <i className={`fas ${saving ? 'fa-spinner fa-spin' : editData ? 'fa-save' : 'fa-plus-circle'}`}></i>
              {saving ? ' Saving...' : editData ? ' Update Fee' : ' Add Fee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
