import React, { useState, useEffect } from 'react';
import { createStudent, updateStudent, fetchCourses } from '../services/api';

const initialForm = { name: '', email: '', phone: '', course_id: '', enrollment_date: '', status: 'Active', address: '', date_of_birth: '', gender: '' };

export default function StudentForm({ onNavigate, editData }) {
  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses().then(setCourses).catch(() => {});
    if (editData) {
      setForm({
        name: editData.name || '',
        email: editData.email || '',
        phone: editData.phone || '',
        course_id: editData.course_id || '',
        enrollment_date: editData.enrollment_date || '',
        status: editData.status || 'Active',
        address: editData.address || '',
        date_of_birth: editData.date_of_birth || '',
        gender: editData.gender || '',
      });
    }
  }, [editData]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
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
      if (editData) {
        await updateStudent(editData.id, form);
      } else {
        await createStudent(form);
      }
      onNavigate('/students');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1><i className={`fas ${editData ? 'fa-edit' : 'fa-plus-circle'}`}></i> {editData ? 'Edit Student' : 'Add New Student'}</h1>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" placeholder="Enter full name" value={form.name} onChange={handleChange} className={errors.name ? 'error' : ''} />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" placeholder="Enter email address" value={form.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" placeholder="Enter phone number" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Course</label>
              <select name="course_id" value={form.course_id} onChange={handleChange}>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Enrollment Date</label>
              <input type="date" name="enrollment_date" value={form.enrollment_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
            </div>
            <div className="form-group full-width">
              <label>Address</label>
              <input type="text" name="address" placeholder="Enter address" value={form.address} onChange={handleChange} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => onNavigate('/students')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <i className={`fas ${saving ? 'fa-spinner fa-spin' : editData ? 'fa-save' : 'fa-plus-circle'}`}></i>
              {saving ? ' Saving...' : editData ? ' Update Student' : ' Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
