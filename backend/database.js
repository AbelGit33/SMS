const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'data.json');

const DEFAULT_DATA = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@sms.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      created_at: new Date().toISOString(),
    },
  ],
  students: [],
  courses: [],
  attendance: [],
  fees: [],
  activity_logs: [],
  counters: { users: 1 },
};

let data = null;

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      data = JSON.parse(raw);
      if (!data.counters) data.counters = { users: 1 };
    } else {
      data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      save();
    }
  } catch {
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    save();
  }
}

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

load();

module.exports = {
  // Users
  findUserByUsername(username) {
    return data.users.find(u => u.username === username || u.email === username) || null;
  },
  findUserById(id) {
    return data.users.find(u => u.id === id) || null;
  },
  createUser(username, email, hash) {
    data.counters.users += 1;
    const user = { id: data.counters.users, username, email, password: hash, role: 'admin', created_at: new Date().toISOString() };
    data.users.push(user);
    save();
    return user;
  },

  // Students
  findStudents(filters = {}) {
    let result = [...data.students];
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.course_name || '').toLowerCase().includes(term)
      );
    }
    if (filters.status) result = result.filter(s => s.status === filters.status);
    if (filters.course_id) result = result.filter(s => s.course_id == filters.course_id);
    const total = result.length;
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;
    const paginated = result.slice(offset, offset + limit);
    return { students: paginated.map(this.enrichStudent), total, page, limit };
  },
  findAllStudents() {
    return data.students.map(this.enrichStudent);
  },
  enrichStudent(s) {
    const course = data.courses.find(c => c.id == s.course_id);
    return { ...s, course_name: course ? course.name : null };
  },
  findStudentById(id) {
    const s = data.students.find(st => st.id === id);
    if (!s) return null;
    const enriched = this.enrichStudent(s);
    enriched.attendance = data.attendance.filter(a => a.student_id === id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);
    enriched.fees = data.fees.filter(f => f.student_id === id).sort((a, b) => new Date(b.due_date || 0) - new Date(a.due_date || 0));
    return enriched;
  },
  createStudent(student) {
    if (!student.id) student.id = uuidv4();
    student.created_at = new Date().toISOString();
    student.updated_at = student.created_at;
    data.students.push(student);
    save();
    return this.enrichStudent(student);
  },
  updateStudent(id, updates) {
    const idx = data.students.findIndex(s => s.id === id);
    if (idx === -1) return null;
    data.students[idx] = { ...data.students[idx], ...updates, updated_at: new Date().toISOString() };
    save();
    return this.enrichStudent(data.students[idx]);
  },
  deleteStudent(id) {
    const idx = data.students.findIndex(s => s.id === id);
    if (idx === -1) return false;
    data.students.splice(idx, 1);
    data.attendance = data.attendance.filter(a => a.student_id !== id);
    data.fees = data.fees.filter(f => f.student_id !== id);
    save();
    return true;
  },
  getStudentStats() {
    const total = data.students.length;
    const active = data.students.filter(s => s.status === 'Active').length;
    const inactive = data.students.filter(s => s.status === 'Inactive').length;
    const graduated = data.students.filter(s => s.status === 'Graduated').length;
    return { total, active, inactive, graduated };
  },
  getCourseStats() {
    return data.courses.map(c => ({
      name: c.name,
      count: data.students.filter(s => s.course_id == c.id).length,
    }));
  },

  // Courses
  findCourses() {
    return data.courses;
  },
  findCourseById(id) {
    const c = data.courses.find(c => c.id == id);
    if (!c) return null;
    return { ...c, studentCount: data.students.filter(s => s.course_id == id).length };
  },
  findCourseByCode(code) {
    return data.courses.find(c => c.code === code) || null;
  },
  createCourse(course) {
    const maxId = data.courses.reduce((m, c) => Math.max(m, c.id || 0), 0);
    course.id = maxId + 1;
    course.created_at = new Date().toISOString();
    data.courses.push(course);
    save();
    return course;
  },
  updateCourse(id, updates) {
    const idx = data.courses.findIndex(c => c.id == id);
    if (idx === -1) return null;
    data.courses[idx] = { ...data.courses[idx], ...updates };
    save();
    return data.courses[idx];
  },
  deleteCourse(id) {
    const idx = data.courses.findIndex(c => c.id == id);
    if (idx === -1) return false;
    data.courses.splice(idx, 1);
    save();
    return true;
  },

  // Attendance
  findAttendance(filters = {}) {
    let result = data.attendance.map(a => {
      const student = data.students.find(s => s.id === a.student_id);
      const course = student ? data.courses.find(c => c.id == student.course_id) : null;
      return { ...a, student_name: student ? student.name : 'Unknown', course_id: student ? student.course_id : null, course_name: course ? course.name : null };
    });
    if (filters.date) result = result.filter(a => a.date === filters.date);
    if (filters.student_id) result = result.filter(a => a.student_id === filters.student_id);
    if (filters.course_id) result = result.filter(a => a.course_id == filters.course_id);
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = result.length;
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;
    return { records: result.slice(offset, offset + limit), total, page, limit };
  },
  findAttendanceByStudent(studentId) {
    return data.attendance.filter(a => a.student_id === studentId).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 60);
  },
  getAttendanceStats(studentId) {
    const records = studentId ? data.attendance.filter(a => a.student_id === studentId) : data.attendance;
    const result = { present: 0, absent: 0, late: 0, leave: 0 };
    records.forEach(r => { if (result[r.status.toLowerCase()] !== undefined) result[r.status.toLowerCase()]++; });
    return result;
  },
  getAttendanceSummary() {
    const total = data.attendance.length;
    const stats = this.getAttendanceStats();
    return { total, ...stats };
  },
  getRecentAttendance(limit = 10) {
    const grouped = {};
    data.attendance.forEach(a => {
      if (!grouped[a.date]) grouped[a.date] = { total: 0, present: 0, absent: 0 };
      grouped[a.date].total++;
      if (a.status === 'Present') grouped[a.date].present++;
      if (a.status === 'Absent') grouped[a.date].absent++;
    });
    return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, limit).map(([date, vals]) => ({ date, ...vals }));
  },
  getAttendanceDates() {
    return [...new Set(data.attendance.map(a => a.date))].sort().reverse().slice(0, 30);
  },
  upsertAttendance(student_id, date, status, remark) {
    const idx = data.attendance.findIndex(a => a.student_id === student_id && a.date === date);
    if (idx >= 0) {
      data.attendance[idx] = { ...data.attendance[idx], status, remark: remark || '' };
    } else {
      data.attendance.push({
        id: data.attendance.length + 1,
        student_id, date, status, remark: remark || '',
        created_at: new Date().toISOString(),
      });
    }
    save();
  },

  // Fees
  findFees(filters = {}) {
    let result = data.fees.map(f => {
      const student = data.students.find(s => s.id === f.student_id);
      const course = student ? data.courses.find(c => c.id == student.course_id) : null;
      return { ...f, student_name: student ? student.name : 'Unknown', student_email: student ? student.email : '', course_name: course ? course.name : null };
    });
    if (filters.status) result = result.filter(f => f.status === filters.status);
    if (filters.student_id) result = result.filter(f => f.student_id === filters.student_id);
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const total = result.length;
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;
    return { fees: result.slice(offset, offset + limit), total, page, limit };
  },
  getFeeStats() {
    const totalAmount = data.fees.reduce((s, f) => s + (f.amount || 0), 0);
    const totalPaid = data.fees.reduce((s, f) => s + (f.paid_amount || 0), 0);
    const byStatus = {};
    data.fees.forEach(f => {
      if (!byStatus[f.status]) byStatus[f.status] = { status: f.status, count: 0, total: 0, paid: 0 };
      byStatus[f.status].count++;
      byStatus[f.status].total += f.amount || 0;
      byStatus[f.status].paid += f.paid_amount || 0;
    });
    const monthly = {};
    data.fees.filter(f => f.status === 'Paid').forEach(f => {
      const month = (f.payment_date || f.created_at || '').slice(0, 7);
      if (month) { monthly[month] = (monthly[month] || 0) + (f.paid_amount || 0); }
    });
    return {
      totalAmount,
      totalPaid,
      totalDue: totalAmount - totalPaid,
      byStatus: Object.values(byStatus),
      monthly: Object.entries(monthly).map(([month, collected]) => ({ month, collected })),
    };
  },
  createFee(fee) {
    const maxId = data.fees.reduce((m, f) => Math.max(m, f.id || 0), 0);
    fee.id = maxId + 1;
    fee.created_at = new Date().toISOString();
    data.fees.push(fee);
    save();
    return fee;
  },
  findFeeById(id) {
    return data.fees.find(f => f.id == id) || null;
  },
  updateFee(id, updates) {
    const idx = data.fees.findIndex(f => f.id == id);
    if (idx === -1) return null;
    data.fees[idx] = { ...data.fees[idx], ...updates };
    save();
    return data.fees[idx];
  },
  deleteFee(id) {
    const idx = data.fees.findIndex(f => f.id == id);
    if (idx === -1) return false;
    data.fees.splice(idx, 1);
    save();
    return true;
  },

  // Activity Logs
  addActivity(action, details, userId = null) {
    data.activity_logs.push({ id: data.activity_logs.length + 1, user_id: userId, action, details, created_at: new Date().toISOString() });
    save();
  },
  getActivity(limit = 20) {
    return data.activity_logs.slice(-limit).reverse().map(a => {
      const user = data.users.find(u => u.id === a.user_id);
      return { ...a, username: user ? user.username : null };
    });
  },
};
