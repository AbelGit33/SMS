const express = require('express');
const db = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const { status, student_id, page } = req.query;
  const result = db.findFees({ status, student_id, page: parseInt(page) || 1 });
  res.json(result);
});

router.get('/stats', (req, res) => {
  res.json(db.getFeeStats());
});

router.post('/', (req, res) => {
  const { student_id, amount, paid_amount, due_date, payment_date, payment_method, remark } = req.body;
  if (!student_id || amount === undefined) {
    return res.status(400).json({ message: 'Student ID and amount are required' });
  }
  const student = db.findStudentById(student_id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const totalPaid = paid_amount || 0;
  const status = totalPaid >= amount ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid';

  const fee = db.createFee({
    student_id, amount: parseFloat(amount), paid_amount: totalPaid,
    due_date: due_date || null, status, payment_date: payment_date || null,
    payment_method: payment_method || '', remark: remark || '',
  });
  db.addActivity('fee_created', `Fee record for ${student.name}: $${amount}`);
  res.status(201).json({ ...fee, student_name: student.name, course_name: student.course_name });
});

router.put('/:id', (req, res) => {
  const existing = db.findFeeById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Fee record not found' });

  const { amount, paid_amount, due_date, payment_date, payment_method, status, remark } = req.body;
  const newPaid = paid_amount !== undefined ? paid_amount : existing.paid_amount;
  const newAmount = amount !== undefined ? amount : existing.amount;
  const newStatus = status || (newPaid >= newAmount ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid');

  const updated = db.updateFee(req.params.id, {
    amount: newAmount, paid_amount: newPaid, due_date: due_date || existing.due_date,
    status: newStatus, payment_date: payment_date || existing.payment_date,
    payment_method: payment_method || existing.payment_method,
    remark: remark !== undefined ? remark : existing.remark,
  });
  const student = db.findStudentById(updated.student_id);
  res.json({ ...updated, student_name: student ? student.name : 'Unknown', course_name: student ? student.course_name : null });
});

router.delete('/:id', (req, res) => {
  const existing = db.findFeeById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Fee record not found' });
  db.deleteFee(req.params.id);
  db.addActivity('fee_deleted', `Fee record #${req.params.id} deleted`);
  res.json({ message: 'Fee record deleted' });
});

module.exports = router;
