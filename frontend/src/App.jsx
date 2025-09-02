import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Courses from './pages/Courses';
import Instructors from './pages/Instructors';
import About from './pages/About';
import Contact from './pages/Contact';
import CourseDetails from './pages/CourseDetails';
// removed unused StudentProfile
import StudentDashboard from './pages/student/Dashboard';
import StudentEvaluations from './pages/student/Evaluations';
import StudentCalendar from './pages/student/Calendar';
import MeetingReservation from './pages/student/MeetingReservation';
import TeacherDashboard from './pages/teacher/Dashboard';
import VideoSessions from './pages/teacher/VideoSessions';
import TeacherProfile from './pages/teacher/TeacherProfile';
// removed unused EnhancedTeacherProfile and FeedPage
import TeacherRatings from './pages/TeacherRatings';
import CreateEvaluation from './pages/CreateEvaluation';
import FileUploadDemo from './pages/FileUploadDemo';
import Complaints from './pages/Complaints';
import ComplaintsManagement from './pages/admin/ComplaintsManagement';
// removed unused TeacherEvolutionDashboard
import AdminDashboard from './pages/admin/Dashboard';
import Chat from './components/Chat';
import Wallet from './components/Wallet';
import SessionsPage from './pages/SessionsPage';
import TeacherEvolution from './pages/teacher/TeacherEvolution';
import NotificationPreferences from './pages/NotificationPreferences';
// removed unused StudentVideoSessions
import PurchaseHistory from './pages/student/PurchaseHistory';
import SlotBooking from './pages/student/SlotBooking';
import SlotManagement from './pages/teacher/SlotManagement';
import TeacherRankingPage from './pages/TeacherRanking';
import VideoSessionsPage from './pages/VideoSessions';
import FollowersPostsPage from './pages/FollowersPosts';
import StudentEvolution from './pages/student/Evolution';

export default function App() {
  // PayPal configuration
  const paypalOptions = {
    'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test',
    currency: 'EUR',
    intent: 'capture'
  };

  return (
    <ThemeProvider>
      <PayPalScriptProvider options={paypalOptions}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <ErrorBoundary>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/instructors" element={<Instructors />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/course/:id" element={<CourseDetails />} />
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="/evaluations" element={<StudentEvaluations />} />
                    <Route path="/create-evaluation" element={<CreateEvaluation />} />
                    <Route path="/calendar" element={<StudentCalendar />} />
                    <Route path="/meeting-reservation" element={<MeetingReservation />} />
                    <Route path="/slot-booking" element={<SlotBooking />} />
                    <Route path="/video-sessions" element={<VideoSessionsPage />} />
                    <Route path="/purchase-history" element={<PurchaseHistory />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/followers-posts" element={<FollowersPostsPage />} />
                    <Route path="/file-upload" element={<FileUploadDemo />} />
                    <Route path="/preferences" element={<NotificationPreferences />} />
                    <Route path="/student/evolution" element={<StudentEvolution />} />
                    <Route path="/sessions" element={<SessionsPage />} />
                    <Route path="/teacher-ratings" element={<TeacherRatings />} />
                    <Route path="/teacher-ranking" element={<TeacherRankingPage />} />
                    {/* Admin routes */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/complaints" element={<ComplaintsManagement />} />
                    {/* General complaints page */}
                    <Route path="/complaints" element={<Complaints />} />
                    {/* Teacher routes */}
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/profile" element={<TeacherProfile />} />
                    <Route path="/teacher/video-sessions" element={<VideoSessions />} />
                    <Route path="/teacher/slot-management" element={<SlotManagement />} />
                    <Route path="/teacher/evolution" element={<TeacherEvolution />} />
                    {/* Backward compatibility redirect for old path */}
                    <Route path="/teacher-dashboard" element={<Navigate to="/teacher/dashboard" replace />} />
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ErrorBoundary>
            </Router>
          </CartProvider>
        </AuthProvider>
      </PayPalScriptProvider>
    </ThemeProvider>
  );
}
