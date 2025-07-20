import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
// import { useParams } from 'react-router-dom';

const InstructorProfile = () => {
  // const { id } = useParams(); // Will be used when connecting to real API
  const [activeTab, setActiveTab] = useState('courses');
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      await updateProfile(form);
      setSuccess('Profil mis à jour avec succès !');
      setEditing(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  // Mock instructor data - in a real app, this would come from an API
  const instructor = {
    id: 1,
    name: 'Jane Seymour',
    role: 'UI/UX Designer',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    rating: 4.9,
    reviews: 234,
    students: 1200,
    courses: 12,
    experience: '8+ years',
    languages: ['English', 'Spanish'],
    bio: 'Expert UI/UX designer with 8+ years of experience in creating beautiful and functional user interfaces. I specialize in user-centered design, creating intuitive and engaging digital experiences that users love.',
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping', 'User Testing', 'Design Systems', 'Mobile Design'],
    education: [
      {
        degree: 'Bachelor of Design',
        school: 'Design Institute of Technology',
        year: '2015'
      },
      {
        degree: 'UX Design Certification',
        school: 'Google UX Design',
        year: '2020'
      }
    ],
    instructorCourses: [
      {
        id: 1,
        title: 'Complete UI/UX Design Bootcamp',
        rating: 4.9,
        students: 847,
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80'
      },
      {
        id: 2,
        title: 'Figma Masterclass: From Beginner to Pro',
        rating: 4.8,
        students: 623,
        price: 67.99,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80'
      },
      {
        id: 3,
        title: 'Mobile App Design Principles',
        rating: 4.7,
        students: 445,
        price: 54.99,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80'
      }
    ],
    instructorReviews: [
      {
        id: 1,
        user: 'Sarah Johnson',
        rating: 5,
        date: '2 weeks ago',
        course: 'Complete UI/UX Design Bootcamp',
        comment: 'Jane is an excellent instructor! Her course is well-structured and she explains complex design concepts in a way that\'s easy to understand. I\'ve learned so much!'
      },
      {
        id: 2,
        user: 'Michael Brown',
        rating: 5,
        date: '1 month ago',
        course: 'Figma Masterclass',
        comment: 'Great course with practical examples. Jane provides valuable insights from her real-world experience. Highly recommended!'
      },
      {
        id: 3,
        user: 'Emily Davis',
        rating: 4,
        date: '3 weeks ago',
        course: 'Mobile App Design Principles',
        comment: 'Very informative course. The instructor is knowledgeable and responsive to questions. The practical projects helped me understand the concepts better.'
      }
    ]
  };

  const tabs = [
    { id: 'courses', label: 'Courses' },
    { id: 'about', label: 'About' },
    { id: 'reviews', label: 'Reviews' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Instructor Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Instructor Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{instructor.name}</h1>
                  <p className="text-xl text-blue-600 mb-4">{instructor.role}</p>
                  <p className="text-gray-600 mb-6">{instructor.bio}</p>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-5 h-5 ${i < Math.floor(instructor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-600 ml-2">({instructor.rating})</span>
                    </div>
                    <span className="text-gray-600">{instructor.reviews} reviews</span>
                    <span className="text-gray-600">{instructor.students} students</span>
                    <span className="text-gray-600">{instructor.courses} courses</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Instructor Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-semibold">{instructor.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Languages</span>
                    <span className="font-semibold">{instructor.languages.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Students</span>
                    <span className="font-semibold">{instructor.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Courses</span>
                    <span className="font-semibold">{instructor.courses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-semibold">{instructor.rating}/5</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold mt-6">
                  Follow Instructor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Tab Navigation */}
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/upload-teacher-video"
                  className="p-4 rounded-lg border-2 bg-indigo-50 border-indigo-200 text-indigo-700 hover:shadow-md transition-shadow flex items-center space-x-3"
                >
                  <span className="text-2xl">🎥</span>
                  <div>
                    <h3 className="font-medium">Uploader une vidéo</h3>
                    <p className="text-sm opacity-75">Ajouter une vidéo de cours ou d’introduction</p>
                  </div>
                </Link>
              </div>
            </div>
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Courses by {instructor.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {instructor.instructorCourses.map((course) => (
                    <div key={course.id} className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">{course.title}</h4>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-2">({course.rating})</span>
                          </div>
                          <span className="text-sm text-gray-600">{course.students} students</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">${course.price}</span>
                          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm">
                            View Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {instructor.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Education</h3>
                  <div className="space-y-4">
                    {instructor.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-blue-600 pl-4">
                        <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
                        <p className="text-gray-600">{edu.school}</p>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {instructor.languages.map((language, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">Student Reviews</h3>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < Math.floor(instructor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600 ml-2">{instructor.rating} out of 5</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {instructor.instructorReviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{review.user}</h4>
                        <div className="flex items-center">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-blue-600 mb-2">{review.course}</p>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {!editing ? (
        <button onClick={() => setEditing(true)} className="btn btn-primary">Edit Profile</button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Prénom" />
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Nom" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
          <button type="submit" className="btn btn-success">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
        </form>
      )}
      {success && <div className="text-green-600 mt-2">{success}</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default InstructorProfile; 