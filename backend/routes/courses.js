const express = require('express');
const db = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  res.json(db.findCourses());
});

router.get('/:id', (req, res) => {
  const course = db.findCourseById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

router.post('/', (req, res) => {
  const { name, code, description, duration, fee, status } = req.body;
  if (!name || !code) {
    return res.status(400).json({ message: 'Name and code are required' });
  }
  if (db.findCourseByCode(code)) {
    return res.status(409).json({ message: 'Course code already exists' });
  }
  const course = db.createCourse({ name, code, description: description || '', duration: duration || '', fee: fee || 0, status: status || 'Active' });
  db.addActivity('course_created', `Course "${name}" created`);
  res.status(201).json(course);
});

router.put('/:id', (req, res) => {
  const existing = db.findCourseById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Course not found' });

  const { name, code, description, duration, fee, status } = req.body;

  if (code && code !== existing.code) {
    const dup = db.findCourseByCode(code);
    if (dup) return res.status(409).json({ message: 'Course code already in use' });
  }

  const updated = db.updateCourse(req.params.id, {
    name: name || existing.name,
    code: code || existing.code,
    description: description !== undefined ? description : existing.description,
    duration: duration !== undefined ? duration : existing.duration,
    fee: fee !== undefined ? fee : existing.fee,
    status: status || existing.status,
  });
  db.addActivity('course_updated', `Course "${updated.name}" updated`);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const existing = db.findCourseById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Course not found' });
  db.deleteCourse(req.params.id);
  db.addActivity('course_deleted', `Course "${existing.name}" deleted`);
  res.json({ message: 'Course deleted successfully' });
});

module.exports = router;
