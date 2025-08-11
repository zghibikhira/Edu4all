import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Footer from './components/Footer';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Protected from './pages/Protected';
import Courses from './pages/Courses';
import Instructors from './pages/Instructors';
import About from './pages/About';
import Contact from './pages/Contact';
import CourseDetails from './pages/CourseDetails';
import StudentProfile from './pages/student/Profile.jsx';
import StudentDashboard from './pages/student/Dashboard';
import StudentEvaluations from './pages/student/Evaluations.jsx';
import PurchaseHistory from './pages/student/PurchaseHistory.jsx';
import StudentVideoSessions from './pages/student/VideoSessions.jsx';
import InstructorProfile from './pages/teacher/InstructorProfile.jsx';
import TeacherDashboard from './pages/teacher/Dashboard.jsx';
import VideoSessions from './pages/teacher/VideoSessions.jsx';
import UploadTeacherVideo from './pages/teacher/UploadTeacherVideo.jsx';
import DefineSlots from './pages/teacher/DefineSlots.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import Teachers from './pages/Teachers';
import CreateEvaluation from './pages/CreateEvaluation';
import FileUploadDemo from './pages/FileUploadDemo';
import TeacherRatings from './pages/TeacherRatings.jsx';
import CalendarView from './components/CalendarView';
import Chat from './components/Chat';
import Wallet from './components/Wallet';
import SessionsPage from './pages/SessionsPage';
import { CartProvider } from './contexts/CartContext';

export default function App() {
  // PayPal configuration
  const paypalOptions = {
    'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test',
    currency: 'EUR',
    intent: 'capture'
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Layout>
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/protected" element={<Protected />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/instructors" element={<Instructors />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/course/:id" element={<CourseDetails />} />
                  <Route path="/profile" element={<Protected><StudentProfile /></Protected>} />
                  <Route path="/dashboard" element={<Protected><StudentDashboard /></Protected>} />
                  <Route path="/teacher-dashboard" element={<Protected><TeacherDashboard /></Protected>} />
                  <Route path="/teacher/video-sessions" element={<Protected><VideoSessions /></Protected>} />
                  <Route path="/admin-dashboard" element={<Protected><AdminDashboard /></Protected>} />
                  <Route path="/admin/users" element={<Protected><AdminUsers /></Protected>} />
                  <Route path="/evaluations" element={<Protected><StudentEvaluations /></Protected>} />
                  <Route path="/purchase-history" element={<Protected><PurchaseHistory /></Protected>} />
                  <Route path="/student/video-sessions" element={<Protected><StudentVideoSessions /></Protected>} />
                  <Route path="/evaluations/create" element={<Protected><CreateEvaluation /></Protected>} />
                  <Route path="/file-upload-demo" element={<FileUploadDemo />} />
                  <Route path="/teacher-ratings" element={<TeacherRatings />} />
                  <Route path="/instructor/:id" element={<InstructorProfile />} />
                  <Route path="/upload-teacher-video" element={<UploadTeacherVideo />} />
                  <Route path="/define-slots" element={<Protected><DefineSlots /></Protected>} />
                  <Route path="/teachers" element={<Teachers />} />
                  <Route path="/calendar" element={<Protected><CalendarView /></Protected>} />
                  <Route path="/chat" element={<Protected><Chat /></Protected>} />
                  <Route path="/wallet" element={<Protected><Wallet /></Protected>} />
                  <Route path="/teacher/sessions" element={<Protected><SessionsPage /></Protected>} />
                </Routes>
              </main>
              <Footer />
            </Layout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  );
}
