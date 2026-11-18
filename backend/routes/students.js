const express = require('express');
const db = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const { search, status, course_id, page, limit } = req.query;
  const result = db.findStudents({ search, status, course_id, page: parseInt(page) || 1, limit: parseInt(limit) || 50 });
  res.json(result);
});

router.get('/all', (req, res) => {
  res.json(db.findAllStudents());
});

router.get('/stats', (req, res) => {
  const stats = db.getStudentStats();
  const courseStats = db.getCourseStats();
  res.json({ ...stats, courseStats });
});

router.get('/:id', (req, res) => {
  const student = db.findStudentById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
});

router.post('/', (req, res) => {
  const { name, email, phone, course_id, enrollment_date, status, address, date_of_birth, gender } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  const dup = db.findAllStudents().find(s => s.email === email);
  if (dup) return res.status(409).json({ message: 'A student with this email already exists' });

  const student = db.createStudent({
    name, email, phone: phone || '', course_id: course_id || null,
    enrollment_date: enrollment_date || new Date().toISOString().split('T')[0],
    status: status || 'Active', address: address || '', date_of_birth: date_of_birth || '', gender: gender || '',
  });
  db.addActivity('student_created', `Student "${name}" created`);
  res.status(201).json(student);
});

router.put('/:id', (req, res) => {
  const existing = db.findStudentById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Student not found' });

  const { name, email, phone, course_id, enrollment_date, status, address, date_of_birth, gender } = req.body;

  if (email && email !== existing.email) {
    const dup = db.findAllStudents().find(s => s.email === email && s.id !== req.params.id);
    if (dup) return res.status(409).json({ message: 'Email already in use' });
  }

  const updated = db.updateStudent(req.params.id, {
    name: name || existing.name,
    email: email || existing.email,
    phone: phone !== undefined ? phone : existing.phone,
    course_id: course_id !== undefined ? course_id : existing.course_id,
    enrollment_date: enrollment_date || existing.enrollment_date,
    status: status || existing.status,
    address: address !== undefined ? address : existing.address,
    date_of_birth: date_of_birth !== undefined ? date_of_birth : existing.date_of_birth,
    gender: gender !== undefined ? gender : existing.gender,
  });
  db.addActivity('student_updated', `Student "${updated.name}" updated`);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const existing = db.findStudentById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Student not found' });
  db.deleteStudent(req.params.id);
  db.addActivity('student_deleted', `Student "${existing.name}" deleted`);
  res.json({ message: 'Student deleted successfully' });
});

module.exports = router;
