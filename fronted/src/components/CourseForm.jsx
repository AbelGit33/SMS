import React, { useState, useEffect } from 'react';
import { createCourse, updateCourse } from '../services/api';

const initialForm = { name: '', code: '', description: '', duration: '', fee: '', status: 'Active' };

export default function CourseForm({ onNavigate, editData }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || '',
        code: editData.code || '',
        description: editData.description || '',
        duration: editData.duration || '',
        fee: editData.fee || '',
        status: editData.status || 'Active',
      });
    }
  }, [editData]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.code.trim()) errs.code = 'Code is required';
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
        await updateCourse(editData.id, { ...form, fee: parseFloat(form.fee) || 0 });
      } else {
        await createCourse({ ...form, fee: parseFloat(form.fee) || 0 });
      }
      onNavigate('/courses');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1><i className={`fas ${editData ? 'fa-edit' : 'fa-plus-circle'}`}></i> {editData ? 'Edit Course' : 'Add New Course'}</h1>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Course Name *</label>
              <input type="text" name="name" placeholder="e.g. Bachelor of Computer Science" value={form.name} onChange={handleChange} className={errors.name ? 'error' : ''} />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Course Code *</label>
              <input type="text" name="code" placeholder="e.g. CS101" value={form.code} onChange={handleChange} className={errors.code ? 'error' : ''} />
              {errors.code && <span className="error-text">{errors.code}</span>}
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input type="text" name="duration" placeholder="e.g. 4 Years" value={form.duration} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Fee ($)</label>
              <input type="number" name="fee" placeholder="e.g. 5000" value={form.fee} onChange={handleChange} min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea name="description" placeholder="Enter course description" value={form.description} onChange={handleChange} rows={3} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => onNavigate('/courses')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <i className={`fas ${saving ? 'fa-spinner fa-spin' : editData ? 'fa-save' : 'fa-plus-circle'}`}></i>
              {saving ? ' Saving...' : editData ? ' Update Course' : ' Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
