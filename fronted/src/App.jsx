import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import StudentProfile from './components/StudentProfile';
import Courses from './components/Courses';
import CourseForm from './components/CourseForm';
import Attendance from './components/Attendance';
import Fees from './components/Fees';
import FeeForm from './components/FeeForm';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState(() => {
    return localStorage.getItem('sms_view') || '/';
  });
  const [viewParams, setViewParams] = useState(null);

  useEffect(() => {
    localStorage.setItem('sms_view', view);
  }, [view]);

  const navigate = (path, params = null) => {
    setView(path);
    setViewParams(params);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (view) {
      case '/':
        return <Dashboard onNavigate={navigate} />;
      case '/students':
        return <StudentList onNavigate={navigate} />;
      case '/students/add':
        return <StudentForm onNavigate={navigate} editData={null} />;
      case '/students/edit':
        return <StudentForm onNavigate={navigate} editData={viewParams} />;
      case '/students/profile':
        return <StudentProfile studentId={viewParams} onNavigate={navigate} />;
      case '/courses':
        return <Courses onNavigate={navigate} />;
      case '/courses/add':
        return <CourseForm onNavigate={navigate} editData={null} />;
      case '/courses/edit':
        return <CourseForm onNavigate={navigate} editData={viewParams} />;
      case '/attendance':
        return <Attendance onNavigate={navigate} />;
      case '/fees':
        return <Fees onNavigate={navigate} />;
      case '/fees/add':
        return <FeeForm onNavigate={navigate} editData={null} />;
      case '/fees/edit':
        return <FeeForm onNavigate={navigate} editData={viewParams} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <Layout currentPath={view} onNavigate={navigate}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
