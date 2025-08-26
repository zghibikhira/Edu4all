import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import StudentProfile from './pages/student/Profile';
import StudentDashboard from './pages/student/Dashboard';
import StudentEvaluations from './pages/student/Evaluations';
import StudentCalendar from './pages/student/Calendar';
import MeetingReservation from './pages/student/MeetingReservation';
import TeacherDashboard from './pages/teacher/Dashboard';
import VideoSessions from './pages/teacher/VideoSessions';
import TeacherProfile from './pages/teacher/TeacherProfile';
import EnhancedTeacherProfile from './pages/teacher/EnhancedTeacherProfile';
import FeedPage from './pages/Feed';
import TeacherRatings from './pages/TeacherRatings';
import CreateEvaluation from './pages/CreateEvaluation';
import FileUploadDemo from './pages/FileUploadDemo';
import Complaints from './pages/Complaints';
import ComplaintsManagement from './pages/admin/ComplaintsManagement';
import TeacherEvolutionDashboard from './pages/admin/TeacherEvolutionDashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Chat from './components/Chat';
import Wallet from './components/Wallet';
import SessionsPage from './pages/SessionsPage';
import TeacherEvolution from './pages/teacher/TeacherEvolution';

// Import student video sessions page
import StudentVideoSessions from './pages/student/VideoSessions';
import PurchaseHistory from './pages/student/PurchaseHistory';
import SlotBooking from './pages/student/SlotBooking';
import SlotManagement from './pages/teacher/SlotManagement';
import TeacherRankingPage from './pages/TeacherRanking';
import VideoSessionsPage from './pages/VideoSessions';
import FollowersPostsPage from './pages/FollowersPosts';

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
