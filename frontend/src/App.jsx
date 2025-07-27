import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import InstructorProfile from './pages/teacher/InstructorProfile.jsx';
import UploadTeacherVideo from './pages/teacher/UploadTeacherVideo.jsx';
import DefineSlots from './pages/teacher/DefineSlots.jsx';
import Teachers from './pages/Teachers';
import CreateEvaluation from './pages/CreateEvaluation';
import FileUploadDemo from './pages/FileUploadDemo';
import CalendarView from './components/CalendarView';

export default function App() {
  return (
    <AuthProvider>
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
              <Route path="/evaluations" element={<Protected><StudentEvaluations /></Protected>} />
              <Route path="/evaluations/create" element={<Protected><CreateEvaluation /></Protected>} />
              <Route path="/file-upload-demo" element={<FileUploadDemo />} />
              <Route path="/instructor/:id" element={<InstructorProfile />} />
              <Route path="/upload-teacher-video" element={<UploadTeacherVideo />} />
              <Route path="/define-slots" element={<Protected><DefineSlots /></Protected>} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/calendar" element={<Protected><CalendarView /></Protected>} />
            </Routes>
          </main>
          <Footer />
        </Layout>
      </Router>
    </AuthProvider>
  );
}
