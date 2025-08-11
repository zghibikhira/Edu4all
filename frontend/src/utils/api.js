import axios from 'axios';

// Configuration de base d'axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authAPI = {
  // Inscription
  register: (userData) => api.post('/auth/register', userData),
  
  // Connexion
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Déconnexion
  logout: () => api.post('/auth/logout'),
  
  // Obtenir le profil
  getProfile: () => api.get('/auth/profile'),
  
  // Mettre à jour le profil
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Mot de passe oublié
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Réinitialiser le mot de passe
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// Services de statistiques
export const statsAPI = {
  // Obtenir les statistiques globales
  getGlobalStats: () => api.get('/auth/stats'),
};

// Services pour les enseignants
export const teacherAPI = {
  getAll: () => api.get('/auth/teachers'),
  // Obtenir le profil enseignant
  getProfile: () => api.get('/auth/teacher/profile'),
  
  // Mettre à jour le profil enseignant
  updateProfile: (profileData) => api.put('/auth/teacher/profile', profileData),
};

// Services pour les étudiants
export const studentAPI = {
  // Obtenir le profil étudiant
  getProfile: () => api.get('/auth/student/profile'),
  
  // Mettre à jour le profil étudiant
  updateProfile: (profileData) => api.put('/auth/student/profile', profileData),
}; 

export const purchaseAPI = {
  // Acheter un cours
  purchaseCourse: (courseId) => api.post(`/purchases/purchase/${courseId}`),
}; 