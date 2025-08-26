import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      
      // Test connection first
      try {
        const healthCheck = await fetch('http://localhost:5000/api/health');
        console.log('Health check response:', healthCheck.status);
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        setMessage('Erreur de connexion au serveur. Vérifiez que le backend est démarré sur le port 5000.');
        setLoading(false);
        return;
      }
      
      const result = await login(form);
      console.log('Login result:', result);

      if (result.success) {
        setMessage('Connexion réussie !');
        setSuccess(true);
        console.log('Login successful, navigating to appropriate dashboard...');
        
        // Get user role from the auth context
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('User data from localStorage:', user);
        let dashboardPath = '/dashboard'; // Default to student dashboard
        
        if (user && user.role) {
          console.log('User role:', user.role);
          const role = (user.role || '').toLowerCase();
          switch (role) {
            case 'enseignant':
            case 'teacher':
              dashboardPath = '/teacher/dashboard';
              break;
            case 'admin':
              dashboardPath = '/admin/dashboard';
              break;
            case 'etudiant':
            case 'student':
            default:
              dashboardPath = '/dashboard';
              break;
          }
        }
        
        console.log('Redirecting to dashboard:', dashboardPath);
        // Navigate to appropriate dashboard after successful login
        setTimeout(() => navigate(dashboardPath), 1000);
      } else {
        setMessage(result.error || 'Erreur lors de la connexion.');
        setSuccess(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message === 'Network Error') {
        setMessage('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
      } else {
        setMessage(err.response?.data?.message || 'Erreur lors de la connexion.');
      }
      setSuccess(false);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F5F5] py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg flex flex-col items-center">
        {/* Back to Home Button */}
        <div className="w-full mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-[#1E90FF] hover:text-[#187bcd] transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>
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
        
        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 font-inter">
            Pas encore de compte ?{' '}
            <Link 
              to="/register" 
              className="text-[#1E90FF] hover:text-[#187bcd] font-semibold transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
