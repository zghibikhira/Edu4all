import { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Register() {
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    phone: '',
    role: 'etudiant',
    termsAccepted: false,
    privacyAccepted: false,
    studentInfo: { level: 'college' },
    teacherInfo: { subjects: [] }
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name === 'level') {
      setForm(prev => ({
        ...prev,
        studentInfo: { ...prev.studentInfo, level: value }
      }));
    } else if (name === 'subjects') {
      const subjects = value.split(',').map(s => s.trim()).filter(s => s);
      setForm(prev => ({
        ...prev,
        teacherInfo: { ...prev.teacherInfo, subjects }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      setMessage(res.data.message);
      // Clear form on success
      if (res.data.success) {
        setForm({ 
          firstName: '', 
          lastName: '', 
          email: '', 
          password: '', 
          phone: '',
          role: 'etudiant',
          termsAccepted: false,
          privacyAccepted: false,
          studentInfo: { level: 'college' },
          teacherInfo: { subjects: [] }
        });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l'inscription.");
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto my-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-[#1E90FF] mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              name="firstName"
              type="text"
              placeholder="First Name"
              className="border rounded w-full p-2"
              onChange={handleChange}
              value={form.firstName}
              required
            />
            <input
              name="lastName"
              type="text"
              placeholder="Last Name"
              className="border rounded w-full p-2"
              onChange={handleChange}
              value={form.lastName}
              required
            />
          </div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border rounded w-full p-2"
            onChange={handleChange}
            value={form.email}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border rounded w-full p-2"
            onChange={handleChange}
            value={form.password}
            required
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone (optional)"
            className="border rounded w-full p-2"
            onChange={handleChange}
            value={form.phone}
          />
          <select
            name="role"
            className="border rounded w-full p-2"
            onChange={handleChange}
            value={form.role}
          >
            <option value="etudiant">Etudiant</option>
            <option value="enseignant">Enseignant</option>
          </select>

          {/* Student-specific fields */}
          {form.role === 'etudiant' && (
            <select
              name="level"
              className="border rounded w-full p-2"
              onChange={handleChange}
              value={form.studentInfo.level}
              required
            >
              <option value="primaire">Primary</option>
              <option value="college">Middle School</option>
              <option value="lycee">High School</option>
              <option value="superieur">Higher Education</option>
            </select>
          )}

          {/* Teacher-specific fields */}
          {form.role === 'enseignant' && (
            <input
              name="subjects"
              type="text"
              placeholder="Subjects (comma separated)"
              className="border rounded w-full p-2"
              onChange={handleChange}
              value={form.teacherInfo.subjects.join(', ')}
              required
            />
          )}

          {/* Terms and Privacy */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                name="termsAccepted"
                type="checkbox"
                onChange={handleChange}
                checked={form.termsAccepted}
                className="mr-2"
                required
              />
              <span className="text-sm">I accept the terms of service</span>
            </label>
            <label className="flex items-center">
              <input
                name="privacyAccepted"
                type="checkbox"
                onChange={handleChange}
                checked={form.privacyAccepted}
                className="mr-2"
                required
              />
              <span className="text-sm">I accept the privacy policy</span>
            </label>
          </div>

          <button type="submit" className="bg-[#1E90FF] text-white px-4 py-2 rounded w-full">
            Register
          </button>
        </form>
        {message && (
          <p className={`mt-2 ${message.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
      <Footer />
    </>
  );
}
