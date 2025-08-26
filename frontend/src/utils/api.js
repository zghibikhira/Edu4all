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
  // Admin ranking endpoints
  getAdminRanking: (params) => api.get('/teachers/admin/ranking/list', { params }),
  recomputeAdminRanking: () => api.post('/teachers/admin/ranking/recompute'),
  
  // Teacher Evolution endpoints
  getEvolution: (params) => api.get('/teachers/evolution', { params }),
  getEvolutionById: (teacherId, params) => api.get(`/teachers/${teacherId}/evolution`, { params }),
  getEvolutionStats: () => api.get('/teachers/evolution/stats'),
  getEvolutionHistory: (params) => api.get('/teachers/evolution/history', { params }),
  calculateEvolution: (data) => api.post('/teachers/evolution/calculate', data),
  getEvolutionLeaderboard: (params) => api.get('/teachers/evolution/leaderboard', { params })
};

// Services pour les étudiants
export const studentAPI = {
  // Obtenir le profil étudiant
  getProfile: () => api.get('/auth/student/profile'),
  
  // Mettre à jour le profil étudiant
  updateProfile: (profileData) => api.put('/auth/student/profile', profileData),

  // Dashboard endpoints (role étudiant)
  getDashboardStats: () => api.get('/students/me/dashboard/stats'),
  getDashboardActivity: () => api.get('/students/me/dashboard/activity'),
  getDashboardCourses: () => api.get('/students/me/dashboard/courses'),
  getDashboardEvaluations: () => api.get('/students/me/dashboard/evaluations'),
  getDashboardMeetings: () => api.get('/students/me/dashboard/meetings'),
  getDashboardProgress: () => api.get('/students/me/dashboard/progress'),
};

// Services de dashboard
export const dashboardAPI = {
  // Statistiques générales du dashboard
  getStats: () => api.get('/dashboard/stats'),
  
  // Activité récente
  getRecentActivity: () => api.get('/dashboard/activity'),
  
  // Cours de l'étudiant
  getStudentCourses: () => api.get('/dashboard/student/courses'),
  
  // Évaluations de l'étudiant
  getStudentEvaluations: () => api.get('/dashboard/student/evaluations'),
  
  // Meetings de l'étudiant
  getStudentMeetings: () => api.get('/dashboard/student/meetings'),
  
  // Progression de l'étudiant
  getStudentProgress: () => api.get('/dashboard/student/progress'),
  
  // Wallet de l'étudiant
  getStudentWallet: () => api.get('/dashboard/student/wallet'),
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

// Services de commentaires
export const commentAPI = {
  // Créer un commentaire
  createComment: (commentData) => api.post('/comments', commentData),
  
  // Obtenir les commentaires d'une entité
  getComments: (entityType, entityId, params) => api.get(`/comments/${entityType}/${entityId}`, { params }),
  
  // Mettre à jour un commentaire
  updateComment: (commentId, updateData) => api.put(`/comments/${commentId}`, updateData),
  
  // Supprimer un commentaire
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  
  // Réagir à un commentaire (like/dislike)
  reactToComment: (commentId, reaction) => api.post(`/comments/${commentId}/react`, { reaction }),
  
  // Signaler un commentaire
  reportComment: (commentId, reason) => api.post(`/comments/${commentId}/report`, { reason }),
};

// Services de suivi (follows)
export const followAPI = {
  // Suivre un enseignant
  followTeacher: (teacherId) => api.post(`/follows/teachers/${teacherId}/follow`),
  
  // Ne plus suivre un enseignant
  unfollowTeacher: (teacherId) => api.delete(`/follows/teachers/${teacherId}/follow`),
  
  // Vérifier le statut de suivi
  checkFollowStatus: (teacherId) => api.get(`/follows/teachers/${teacherId}/follow-status`),
  
  // Obtenir les followers d'un enseignant
  getTeacherFollowers: (teacherId, params) => api.get(`/follows/teachers/${teacherId}/followers`, { params }),
  
  // Obtenir les enseignants suivis par l'utilisateur
  getFollowingTeachers: (params) => api.get('/follows/me/following', { params }),
  
  // Obtenir les statistiques de suivi
  getFollowStats: (teacherId) => api.get(`/follows/teachers/${teacherId}/follow-stats`),
};

// Services de posts
export const postAPI = {
  // Créer un post
  createPost: (postData) => api.post('/posts', postData),
  
  // Obtenir le feed de l'utilisateur
  getFeed: (params) => api.get('/posts/feed', { params }),
  
  // Obtenir un post spécifique
  getPost: (postId) => api.get(`/posts/${postId}`),
  
  // Mettre à jour un post
  updatePost: (postId, updateData) => api.put(`/posts/${postId}`, updateData),
  
  // Supprimer un post
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  
  // Obtenir les posts d'un enseignant
  getTeacherPosts: (teacherId, params) => api.get(`/posts/teachers/${teacherId}/posts`, { params }),
  
  // Liker/unliker un post
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),
  
  // Partager un post
  sharePost: (postId) => api.post(`/posts/${postId}/share`),
  
  // Signaler un post
  reportPost: (postId, reason) => api.post(`/posts/${postId}/report`, { reason }),
  
  // Obtenir les statistiques des posts d'un enseignant
  getTeacherPostStats: (teacherId) => api.get(`/posts/teachers/${teacherId}/post-stats`),
};

// Services d'évaluation des enseignants
export const teacherRatingAPI = {
  // Créer une évaluation d'enseignant
  createTeacherRating: (ratingData) => api.post('/teacher-ratings', ratingData),
  
  // Obtenir les évaluations d'un enseignant
  getTeacherRatings: (teacherId, params) => api.get(`/teacher-ratings/${teacherId}`, { params }),
  
  // Obtenir les statistiques d'un enseignant
  getTeacherStats: (teacherId) => api.get(`/teacher-ratings/${teacherId}/stats`),
  
  // Obtenir les meilleurs enseignants
  getTopTeachers: (params) => api.get('/teacher-ratings/top', { params }),
  
  // Mettre à jour une évaluation
  updateTeacherRating: (ratingId, updateData) => api.put(`/teacher-ratings/${ratingId}`, updateData),
  
  // Supprimer une évaluation
  deleteTeacherRating: (ratingId) => api.delete(`/teacher-ratings/${ratingId}`),
  
  // Admin: Modérer une évaluation
  moderateRating: (ratingId, moderationData) => api.patch(`/teacher-ratings/${ratingId}/moderate`, moderationData),
};

// Services de sessions vidéo
export const videoSessionAPI = {
  // Créer une session vidéo
  createSession: (sessionData) => api.post('/sessions', sessionData),
  
  // Obtenir toutes les sessions
  getSessions: (params) => api.get('/sessions', { params }),
  
  // Obtenir une session spécifique
  getSession: (sessionId) => api.get(`/sessions/${sessionId}`),
  
  // Mettre à jour une session
  updateSession: (sessionId, updateData) => api.put(`/sessions/${sessionId}`, updateData),
  
  // Supprimer une session
  deleteSession: (sessionId) => api.delete(`/sessions/${sessionId}`),
  
  // S'inscrire à une session
  enrollInSession: (sessionId) => api.post(`/sessions/${sessionId}/enroll`),
  
  // Rejoindre une session
  joinSession: (sessionId) => api.post(`/sessions/${sessionId}/join`),
  
  // Obtenir les sessions d'un enseignant
  getTeacherSessions: (teacherId, params) => api.get(`/sessions/teacher/${teacherId}`, { params }),
  
  // Obtenir les sessions d'un étudiant
  getStudentSessions: (params) => api.get('/sessions/student', { params }),
  
  // Publier une session
  publishSession: (sessionId) => api.patch(`/sessions/${sessionId}/publish`),
  
  // Annuler une session
  cancelSession: (sessionId, reason) => api.patch(`/sessions/${sessionId}/cancel`, { reason }),
};

// Export the main api instance for direct use
export { api }; 