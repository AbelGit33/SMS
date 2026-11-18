const express = require('express');
const db = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const { date, student_id, course_id, page } = req.query;
  const result = db.findAttendance({ date, student_id, course_id, page: parseInt(page) || 1 });
  res.json(result);
});

router.get('/stats', (req, res) => {
  const summary = db.getAttendanceSummary();
  const recent = db.getRecentAttendance(10);
  res.json({ summary, recent });
});

router.get('/dates', (req, res) => {
  res.json(db.getAttendanceDates());
});

router.post('/mark', (req, res) => {
  const { records } = req.body;
  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'Records array is required' });
  }
  for (const r of records) {
    if (!r.student_id || !r.date || !r.status) continue;
    db.upsertAttendance(r.student_id, r.date, r.status, r.remark || '');
  }
  db.addActivity('attendance_marked', `${records.length} attendance records saved`);
  res.json({ message: `${records.length} attendance records saved` });
});

router.get('/student/:studentId', (req, res) => {
  const records = db.findAttendanceByStudent(req.params.studentId);
  const stats = db.getAttendanceStats(req.params.studentId);
  res.json({ records, stats });
});

module.exports = router;
