import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import BottomNav from './components/common/BottomNav';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import DayDetails from './pages/DayDetails';
import TopicDetails from './pages/TopicDetails';
import TopicQuiz from './pages/TopicQuiz';
import WeeklyTests from './pages/WeeklyTests';
import TestSession from './pages/TestSession';
import Revision from './pages/Revision';
import Mistakes from './pages/Mistakes';
import Formulas from './pages/Formulas';
import PYQs from './pages/PYQs';
import Progress from './pages/Progress';

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/day/:dayNumber" element={<DayDetails />} />
          <Route path="/topic/:topicId" element={<TopicDetails />} />
          <Route path="/topic/:topicId/quiz" element={<TopicQuiz />} />
          <Route path="/tests/weekly" element={<WeeklyTests />} />
          <Route path="/test/:testId" element={<TestSession />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="/mistakes" element={<Mistakes />} />
          <Route path="/formulas" element={<Formulas />} />
          <Route path="/pyqs" element={<PYQs />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
