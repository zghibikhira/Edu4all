import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      console.log('Attempting login with:', form);
      const result = await login(form);
      console.log('Login result:', result);

      if (result.success) {
        setMessage('Connexion réussie !');
        setSuccess(true);
        console.log('Login successful, navigating to profile...');
        // Navigate to profile page after successful login
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setMessage(result.error || 'Erreur lors de la connexion.');
        setSuccess(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage(err.response?.data?.message || 'Erreur lors de la connexion.');
      setSuccess(false);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F5F5] py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#1E90FF] to-[#8E44AD] rounded-full flex items-center justify-center mb-2">
            <span className="text-white font-bold text-3xl font-poppins">E</span>
          </div>
          <h2 className="text-3xl font-bold font-poppins text-[#1E90FF] mb-1">Login</h2>
          <p className="text-gray-500 font-inter text-sm">Welcome back! Please login to your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-lg w-full p-3 font-inter focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg w-full p-3 font-inter focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1E90FF] to-[#8E44AD] text-white py-3 rounded-lg font-bold font-poppins shadow hover:from-[#187bcd] hover:to-[#6c3483] transition-all duration-200 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center font-inter font-semibold ${success ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
        )}
      </div>
    </div>
  );
}
