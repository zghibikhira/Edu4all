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
  getAll: (query = '') => api.get(`/auth/teachers${query}`),
  // Obtenir le profil enseignant
  getProfile: () => api.get('/auth/teacher/profile'),
  
  // Mettre à jour le profil enseignant
  updateProfile: (profileData) => api.put('/auth/teacher/profile', profileData),
  // Dashboard endpoints (role enseignant)
  getDashboardSummary: (query = '') => api.get(`/teachers/me/dashboard/summary${query}`),
  getDashboardEarnings: (interval = 'month') => api.get(`/teachers/me/dashboard/earnings?interval=${interval}`),
  getDashboardRatings: () => api.get('/teachers/me/dashboard/ratings'),
  getDashboardFollowers: (query = '') => api.get(`/teachers/me/dashboard/followers${query}`),
  getDashboardPostsEngagement: () => api.get('/teachers/me/dashboard/posts/engagement'),
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

// Services de notifications
export const notificationAPI = {
  // Obtenir les notifications
  getNotifications: (params) => api.get('/notifications', { params }),
  
  // Obtenir le nombre de notifications non lues
  getUnreadCount: () => api.get('/notifications/unread-count'),
  
  // Marquer une notification comme lue
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  
  // Marquer toutes les notifications comme lues
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  
  // Supprimer une notification
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

// Services de préférences utilisateur
export const preferencesAPI = {
  // Obtenir les préférences
  getPreferences: () => api.get('/preferences'),
  
  // Mettre à jour les préférences
  updatePreferences: (preferences) => api.put('/preferences', preferences),
  
  // Réinitialiser les préférences
  resetPreferences: () => api.post('/preferences/reset'),
};

// Services de plaintes
export const complaintAPI = {
  // Créer une plainte
  createComplaint: (complaintData) => api.post('/complaints', complaintData),
  
  // Obtenir les plaintes de l'utilisateur
  getUserComplaints: (params) => api.get('/complaints/mine', { params }),
  
  // Obtenir une plainte par ID
  getComplaintById: (complaintId) => api.get(`/complaints/${complaintId}`),
  
  // Admin: Obtenir toutes les plaintes
  getAdminComplaints: (params) => api.get('/complaints/admin/all', { params }),
  
  // Admin: Mettre à jour une plainte
  updateComplaint: (complaintId, updateData) => api.patch(`/complaints/admin/${complaintId}`, updateData),
  
  // Admin: Escalader une plainte
  escalateComplaint: (complaintId, escalatedTo) => api.post(`/complaints/admin/${complaintId}/escalate`, { escalatedTo }),
  
  // Admin: Obtenir les statistiques des plaintes
  getComplaintStats: () => api.get('/complaints/admin/stats'),
  
  // Admin: Obtenir une URL signée pour une preuve
  getEvidenceUrl: (complaintId, index) => api.get(`/complaints/admin/${complaintId}/evidence/${index}/url`),
};

// Services de modération
export const moderationAPI = {
  // Créer une action de modération
  createModerationAction: (actionData) => api.post('/moderation/actions', actionData),
  
  // Admin: Obtenir toutes les actions de modération
  getAdminModerationActions: (params) => api.get('/moderation/actions', { params }),
  
  // Obtenir les actions de modération d'un utilisateur
  getUserModerationActions: (userId, params) => api.get(`/moderation/actions/user/${userId}`, { params }),
  
  // Admin: Révoquer une action de modération
  revokeModerationAction: (actionId, reason) => api.patch(`/moderation/actions/${actionId}/revoke`, { reason }),
  
  // Admin: Obtenir les statistiques de modération
  getModerationStats: () => api.get('/moderation/stats'),
  
  // Admin: Vérifier le statut de modération d'un utilisateur
  checkUserModerationStatus: (userId) => api.get(`/moderation/user/${userId}/status`),
};

// Export the main api instance for direct use
export { api }; 