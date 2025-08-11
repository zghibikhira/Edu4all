import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import FileUploadEnhanced from '../../components/FileUploadEnhanced';
import EvaluationList from '../../components/EvaluationList';
import CalendarView from '../../components/CalendarView';
import ChatSummary from '../../components/ChatSummary';
import WalletSummary from '../../components/WalletSummary';
import jsPDF from 'jspdf';
import EvaluationForm from '../../components/EvaluationForm';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadResults, setUploadResults] = useState([]);
  const [bookedMeetings, setBookedMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [instructorRatings, setInstructorRatings] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [evalFormCourse, setEvalFormCourse] = useState(null);
  const [evalFormSession, setEvalFormSession] = useState(null);
  const [evalFormTeacher, setEvalFormTeacher] = useState(null);
  const [evalSuccess, setEvalSuccess] = useState(false);
  const navigate = useNavigate();

  // Fetch student's booked meetings
  useEffect(() => {
    if (user && user.role === 'etudiant') {
      setLoadingMeetings(true);
      fetch(`http://localhost:5000/api/meetings/student/${user._id}`)
        .then(res => res.json())
        .then(data => {
          setBookedMeetings(data);
          setLoadingMeetings(false);
        })
        .catch(err => {
          console.error('Error fetching meetings:', err);
          setLoadingMeetings(false);
        });
    }
  }, [user]);

  // Fetch purchased courses
  useEffect(() => {
    if (user && user.role === 'etudiant') {
      fetch(`http://localhost:5000/api/purchases`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPurchasedCourses(data.data?.purchases || []);
          }
        })
        .catch(err => console.error('Error fetching purchases:', err));
    }
  }, [user]);

  // Fetch instructor ratings
  useEffect(() => {
    fetch(`http://localhost:5000/api/evaluations/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Mock instructor ratings for now
          setInstructorRatings([
            { name: 'John Doe', rating: 5 },
            { name: 'Emily Clark', rating: 5 },
            { name: 'Michael Lee', rating: 5 },
            { name: 'Sarah Brown', rating: 4 }
          ]);
        }
      })
      .catch(err => console.error('Error fetching ratings:', err));
  }, []);

  // Fetch comments
  useEffect(() => {
    // Mock comments for now
    setComments([
      { id: 1, author: 'Alice Williams', text: 'Thanks for great courses!', date: '2023-07-22' },
      { id: 2, author: 'David Miller', text: 'Very informative session.', date: '2023-07-21' },
      { id: 3, author: 'Jessica Taylor', text: 'Could you provide more examples?', date: '2023-07-20' }
    ]);
  }, []);

  const handleFileUpload = (results) => {
    setUploadResults(results);
  };

  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: `${user.firstName} ${user.lastName}`,
        text: newComment,
        date: new Date().toISOString().split('T')[0]
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleExportPDF = () => {
    if (filteredCourses.length === 0) {
      alert('Aucun cours à exporter');
      return;
    }

    setIsExportingPDF(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Add title with styling
        doc.setFontSize(24);
        doc.setTextColor(44, 62, 80);
        doc.text('Historique des Cours Achetés', 20, 25);
        
        // Add student info
        doc.setFontSize(12);
        doc.setTextColor(52, 73, 94);
        doc.text(`Étudiant: ${user.firstName} ${user.lastName}`, 20, 40);
        doc.text(`Email: ${user.email}`, 20, 48);
        doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 20, 56);
        
        // Add separator line
        doc.setDrawColor(52, 73, 94);
        doc.line(20, 65, 190, 65);
        
        // Create table header
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Cours achetés:', 20, 80);
        
        // Table headers
        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        doc.text('N°', 20, 95);
        doc.text('Titre du cours', 35, 95);
        doc.text('Date d\'achat', 120, 95);
        doc.text('Prix', 170, 95);
        
        // Table header line
        doc.line(20, 100, 190, 100);
        
        // Add course data
        let yPosition = 110;
        let pageNumber = 1;
        
        filteredCourses.forEach((course, index) => {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
            pageNumber++;
            
            // Add page header
            doc.setFontSize(12);
            doc.setTextColor(52, 73, 94);
            doc.text(`Page ${pageNumber}`, 20, 15);
          }
          
          // Course number
          doc.setFontSize(10);
          doc.setTextColor(44, 62, 80);
          doc.text(`${index + 1}`, 20, yPosition);
          
          // Course title (truncate if too long)
          const title = course.course?.title || 'Cours';
          const truncatedTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
          doc.text(truncatedTitle, 35, yPosition);
          
          // Purchase date
          const purchaseDate = new Date(course.purchasedAt).toLocaleDateString('fr-FR');
          doc.text(purchaseDate, 120, yPosition);
          
          // Price
          const price = course.course?.price ? `${course.course.price} €` : 'N/A';
          doc.text(price, 170, yPosition);
          
          yPosition += 12;
        });
        
        // Add summary at the end
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text(`Total des cours achetés: ${filteredCourses.length}`, 20, yPosition + 10);
        
        // Add footer
        doc.setFontSize(8);
        doc.setTextColor(127, 140, 141);
        doc.text('Généré par Edu4All Platform', 20, 280);
        
        // Save the PDF with a descriptive filename
        const filename = `historique-cours-${user.firstName}-${user.lastName}-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        // Show success message
        alert(`PDF exporté avec succès: ${filename}`);
      } catch (error) {
        console.error('Erreur lors de l\'export PDF:', error);
        alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
      } finally {
        setIsExportingPDF(false);
      }
    }, 500);
  };

  const filteredCourses = purchasedCourses.filter(course => {
    if (courseFilter === 'all') return true;
    if (courseFilter === 'recent') {
      const purchaseDate = new Date(course.purchasedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return purchaseDate > thirtyDaysAgo;
    }
    return true;
  });

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600">Veuillez vous connecter pour accéder au tableau de bord.</p>
          <Link to="/login" className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Évaluations",
      value: user.role === 'enseignant' ? "12 créées" : "8 assignées",
      icon: "📊",
      color: "bg-blue-500",
      link: "/evaluations"
    },
    {
      title: "Cours",
      value: user.role === 'enseignant' ? "5 enseignés" : `${purchasedCourses.length} achetés`,
      icon: "📚",
      color: "bg-green-500",
      link: "/courses"
    },
    {
      title: "Meetings",
      value: user.role === 'etudiant' ? `${bookedMeetings.length} réservés` : "Fichiers",
      icon: user.role === 'etudiant' ? "📅" : "📁",
      color: "bg-purple-500",
      link: user.role === 'etudiant' ? "#meetings" : "#files"
    },
    {
      title: "Progression",
      value: user.role === 'etudiant' ? "78%" : "92%",
      icon: "📈",
      color: "bg-orange-500",
      link: "#progress"
    }
  ];

  const quickActions = [
    {
      title: "Créer une évaluation",
      description: "Assigner un nouveau devoir ou projet",
      icon: "📝",
      link: "/evaluations/create",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
      showFor: ['enseignant']
    },
    {
      title: "Créer un créneau",
      description: "Définir vos disponibilités pour les meetings",
      icon: "🗓️",
      link: "/define-slots",
      color: "bg-teal-50 border-teal-200",
      textColor: "text-teal-700",
      showFor: ['enseignant']
    },
    {
      title: "Réserver un meeting",
      description: "Voir les créneaux disponibles et réserver",
      icon: "📅",
      link: "/calendar",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700",
      showFor: ['etudiant']
    },
    {
      title: "Upload de fichiers",
      description: "Partager des documents ou vidéos",
      icon: "📤",
      link: "#files",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700",
      showFor: ['enseignant', 'etudiant']
    },
    {
      title: "Voir mes évaluations",
      description: "Consulter et gérer les évaluations",
      icon: "📋",
      link: "/evaluations",
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-700",
      showFor: ['enseignant', 'etudiant']
    },
    {
      title: "Mon profil",
      description: "Modifier mes informations personnelles",
      icon: "👤",
      link: "/profile",
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-700",
      showFor: ['enseignant', 'etudiant']
    },
    {
      title: "Voir les enseignants",
      description: "Consulter la liste des enseignants",
      icon: "👨‍🏫",
      link: "/teachers",
      color: "bg-cyan-50 border-cyan-200",
      textColor: "text-cyan-700",
      showFor: ['etudiant']
    },
    {
      title: "Mes meetings",
      description: "Voir mes créneaux réservés",
      icon: "📅",
      link: "#meetings",
      color: "bg-indigo-50 border-indigo-200",
      textColor: "text-indigo-700",
      showFor: ['etudiant']
    },
    {
      title: "Chat",
      description: "Discuter avec les autres utilisateurs",
      icon: "💬",
      link: "/chat",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
      showFor: ['etudiant', 'enseignant']
    },
    {
      title: "Mon Wallet",
      description: "Gérer mon solde et mes transactions",
      icon: "💰",
      link: "/wallet",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700",
      showFor: ['etudiant', 'enseignant']
    },
    {
      title: "Historique des achats",
      description: "Consulter tous mes cours achetés",
      icon: "📚",
      link: "/purchase-history",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
      showFor: ['etudiant']
    },
    {
      title: "Sessions Visio",
      description: "Rejoindre des sessions de visioconférence",
      icon: "🎥",
      link: "/student/video-sessions",
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-700",
      showFor: ['etudiant']
    },
    {
      title: "Évaluer les Enseignants",
      description: "Donner votre avis sur les enseignants",
      icon: "⭐",
      link: "/teacher-ratings",
      color: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-700",
      showFor: ['etudiant']
    },
    {
      title: "Uploader une vidéo",
      description: "Ajouter une vidéo de cours ou d'introduction",
      icon: "🎥",
      link: "/upload-teacher-video",
      color: "bg-indigo-50 border-indigo-200",
      textColor: "text-indigo-700",
      showFor: ['enseignant']
    }
  ];

  const recentActivities = [
    {
      type: "evaluation",
      title: "Devoir de mathématiques soumis",
      time: "Il y a 2 heures",
      icon: "📝",
      color: "text-green-600"
    },
    {
      type: "file",
      title: "Vidéo de cours uploadée",
      time: "Il y a 1 jour",
      icon: "🎥",
      color: "text-blue-600"
    },
    {
      type: "course",
      title: "Nouveau cours disponible",
      time: "Il y a 2 jours",
      icon: "📚",
      color: "text-purple-600"
    }
  ];

  const formatMeetingDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-gray-600">
                Bienvenue, {user.firstName} {user.lastName} ({user.role})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                  {stat.icon}
                </div>
              </div>
              <Link to={stat.link} className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800">
                Voir plus →
              </Link>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions
              .filter(action => action.showFor.includes(user.role))
              .map((action, index) => {
                if (action.title === 'Upload de fichiers') {
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${action.color} ${action.textColor} hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => navigate('/file-upload-demo')}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{action.icon}</span>
                        <div>
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm opacity-75">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (action.title === 'Mes meetings') {
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${action.color} ${action.textColor} hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => setActiveTab('meetings')}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{action.icon}</span>
                        <div>
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm opacity-75">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className={`p-4 rounded-lg border-2 ${action.color} ${action.textColor} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{action.icon}</span>
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm opacity-75">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Sprint 6: Course History, Instructor Ratings, Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Course History */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Historique des Cours Achetés</h3>
              <div className="flex gap-2">
                <Link
                  to="/purchase-history"
                  className="px-3 py-1 rounded text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Voir tout
                </Link>
                <button 
                  onClick={handleExportPDF} 
                  disabled={isExportingPDF || filteredCourses.length === 0}
                  className={`px-3 py-1 rounded text-sm ${
                    isExportingPDF || filteredCourses.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isExportingPDF 
                    ? 'Export en cours...' 
                    : `Export PDF (${filteredCourses.length} cours)`
                  }
                </button>
              </div>
            </div>
            <div className="mb-3">
              <select 
                value={courseFilter} 
                onChange={(e) => setCourseFilter(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">Tous les cours</option>
                <option value="recent">30 derniers jours</option>
              </select>
            </div>
            {filteredCourses.length > 0 ? (
              <div className="space-y-3">
                {filteredCourses.slice(0, 5).map((course) => (
                  <div key={course._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{course.course?.title || 'Cours'}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>📅 {new Date(course.purchasedAt).toLocaleDateString('fr-FR')}</span>
                        <span>💰 {course.amount} {course.currency}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          course.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.status === 'completed' ? 'Terminé' : 
                           course.status === 'pending' ? 'En attente' : 'Échoué'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/course/${course.course?._id}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Accéder
                      </Link>
                    </div>
                  </div>
                ))}
                {filteredCourses.length > 5 && (
                  <div className="text-center pt-2">
                    <Link
                      to="/purchase-history"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Voir {filteredCourses.length - 5} cours supplémentaires →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun cours acheté</p>
            )}
          </div>

          {/* Instructor Ratings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Évaluations des Enseignants</h3>
            <div className="space-y-3">
              {instructorRatings.map((instructor, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{instructor.name}</span>
                  <span className="text-yellow-500">{renderStars(instructor.rating)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Commentaires</h3>
          <div className="space-y-3 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{comment.author}</span>
                    <p className="text-gray-700">{comment.text}</p>
                    <span className="text-sm text-gray-500">{comment.date}</span>
                  </div>
                  <button className="text-red-500 text-sm">Signaler</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrire un commentaire..."
              className="flex-1 border rounded px-3 py-2"
            />
            <button 
              onClick={handlePostComment}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Poster
            </button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Vue d\'ensemble', icon: '📊' },
                { id: 'meetings', name: 'Mes meetings', icon: '📅', showFor: ['etudiant'] },
                { id: 'evaluations', name: 'Évaluations', icon: '📝' },
                { id: 'files', name: 'Fichiers', icon: '📁' },
                { id: 'recent', name: 'Activités récentes', icon: '🕒' }
              ].filter(tab => !tab.showFor || tab.showFor.includes(user.role))
                .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activities */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Activités récentes</h3>
                    <div className="space-y-3">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-xl">{activity.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques rapides</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-700">Évaluations en attente</span>
                        <span className="font-bold text-blue-700">3</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700">Cours en cours</span>
                        <span className="font-bold text-green-700">2</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-700">Meetings réservés</span>
                        <span className="font-bold text-purple-700">{bookedMeetings.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Wallet and Chat Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WalletSummary />
                  <ChatSummary />
                </div>
                
                {/* Calendar Integration */}
                <div>
                  <CalendarView />
                </div>
              </div>
            )}

            {/* Meetings Tab */}
            {activeTab === 'meetings' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mes meetings réservés</h3>
                {loadingMeetings ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des meetings...</p>
                  </div>
                ) : bookedMeetings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookedMeetings.map((meeting) => (
                      <div key={meeting._id} className="bg-white border rounded-lg shadow-sm p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {meeting.teacher?.firstName?.charAt(0) || 'T'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {meeting.teacher?.firstName} {meeting.teacher?.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{meeting.teacher?.subject || 'Matière non spécifiée'}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">📅</span>
                            <span className="text-sm text-gray-700">{formatMeetingDate(meeting.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">📝</span>
                            <span className="text-sm text-gray-700">{meeting.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">📧</span>
                            <span className="text-sm text-gray-700">{meeting.teacher?.email}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Réservé
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📅</span>
                    <p className="text-gray-500">Aucun meeting réservé</p>
                    <p className="text-sm text-gray-400 mt-2">Allez sur le calendrier pour réserver un créneau</p>
                  </div>
                )}
              </div>
            )}

            {/* Evaluations Tab */}
            {activeTab === 'evaluations' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Mes évaluations</h3>
                  {user.role === 'etudiant' && (
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      onClick={() => {
                        setEvalFormCourse(purchasedCourses[0] ? purchasedCourses[0].course : null);
                        setEvalFormSession(null);
                        setEvalFormTeacher(purchasedCourses[0] ? purchasedCourses[0].course?.teacher : null);
                        setShowEvalForm(true);
                      }}
                    >
                      Évaluer un cours/enseignant
                    </button>
                  )}
                </div>
                <EvaluationList userRole={user.role} />
                {/* Modal for EvaluationForm */}
                {showEvalForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                        onClick={() => setShowEvalForm(false)}
                      >
                        &times;
                      </button>
                      <EvaluationForm
                        course={evalFormCourse}
                        session={evalFormSession}
                        teacher={evalFormTeacher}
                        onSubmit={async (data) => {
                          // Connect to backend
                          const res = await fetch('/api/evaluations', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({
                              ...data,
                              studentId: user._id
                            })
                          });
                          if (res.ok) {
                            setEvalSuccess(true);
                            setTimeout(() => {
                              setShowEvalForm(false);
                              setEvalSuccess(false);
                            }, 1500);
                          }
                        }}
                      />
                      {evalSuccess && (
                        <div className="text-green-600 text-center mt-4 font-semibold">Évaluation envoyée !</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Gestion des fichiers</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Upload Section */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Upload de fichiers</h4>
                    <FileUploadEnhanced
                      accept="all"
                      onUploadComplete={handleFileUpload}
                      maxFiles={5}
                      maxSize={50}
                      showPreview={true}
                      simulateUpload={false}
                    />
                  </div>

                  {/* Upload Results */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Fichiers récents</h4>
                    {uploadResults.length > 0 ? (
                      <div className="space-y-2">
                        {uploadResults.map((result, index) => (
                          <div key={index} className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600">✅</span>
                              <span className="font-medium text-green-800">{result.filename}</span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                              Uploadé avec succès
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-gray-50 rounded-lg">
                        <span className="text-4xl mb-4 block">📁</span>
                        <p className="text-gray-500">Aucun fichier uploadé récemment</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activities Tab */}
            {activeTab === 'recent' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Toutes les activités</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 ${activity.color} bg-opacity-10 rounded-full flex items-center justify-center`}>
                        <span className="text-xl">{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Voir détails
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 