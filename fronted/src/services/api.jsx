const API_URL = '/api';

function getHeaders() {
  const token = localStorage.getItem('sms_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
};

export const register = async (username, email, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
};

export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchStudents = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.course_id) query.set('course_id', params.course_id);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  const res = await fetch(`${API_URL}/students?${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchAllStudents = async () => {
  const res = await fetch(`${API_URL}/students/all`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchStudentStats = async () => {
  const res = await fetch(`${API_URL}/students/stats`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchStudent = async (id) => {
  const res = await fetch(`${API_URL}/students/${id}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createStudent = async (data) => {
  const res = await fetch(`${API_URL}/students`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateStudent = async (id, data) => {
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteStudent = async (id) => {
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: 'DELETE', headers: getHeaders(),
  });
  return handleResponse(res);
};

export const fetchCourses = async () => {
  const res = await fetch(`${API_URL}/courses`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchCourse = async (id) => {
  const res = await fetch(`${API_URL}/courses/${id}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createCourse = async (data) => {
  const res = await fetch(`${API_URL}/courses`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateCourse = async (id, data) => {
  const res = await fetch(`${API_URL}/courses/${id}`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteCourse = async (id) => {
  const res = await fetch(`${API_URL}/courses/${id}`, {
    method: 'DELETE', headers: getHeaders(),
  });
  return handleResponse(res);
};

export const fetchAttendance = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.date) query.set('date', params.date);
  if (params.student_id) query.set('student_id', params.student_id);
  if (params.course_id) query.set('course_id', params.course_id);
  if (params.page) query.set('page', params.page);
  const res = await fetch(`${API_URL}/attendance?${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchAttendanceStats = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.start_date) query.set('start_date', params.start_date);
  if (params.end_date) query.set('end_date', params.end_date);
  const res = await fetch(`${API_URL}/attendance/stats?${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchAttendanceDates = async () => {
  const res = await fetch(`${API_URL}/attendance/dates`, { headers: getHeaders() });
  return handleResponse(res);
};

export const markAttendance = async (records) => {
  const res = await fetch(`${API_URL}/attendance/mark`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify({ records }),
  });
  return handleResponse(res);
};

export const fetchStudentAttendance = async (studentId) => {
  const res = await fetch(`${API_URL}/attendance/student/${studentId}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchFees = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.student_id) query.set('student_id', params.student_id);
  if (params.page) query.set('page', params.page);
  const res = await fetch(`${API_URL}/fees?${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const fetchFeeStats = async () => {
  const res = await fetch(`${API_URL}/fees/stats`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createFee = async (data) => {
  const res = await fetch(`${API_URL}/fees`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateFee = async (id, data) => {
  const res = await fetch(`${API_URL}/fees/${id}`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteFee = async (id) => {
  const res = await fetch(`${API_URL}/fees/${id}`, {
    method: 'DELETE', headers: getHeaders(),
  });
  return handleResponse(res);
};

export const fetchActivity = async (limit = 20) => {
  const res = await fetch(`${API_URL}/activity?limit=${limit}`, { headers: getHeaders() });
  return handleResponse(res);
};
