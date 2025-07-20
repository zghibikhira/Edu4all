import { useState } from 'react';
import { Link } from 'react-router-dom';

const Instructors = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const subjects = [
    { id: 'all', name: 'All Subjects' },
    { id: 'design', name: 'Design' },
    { id: 'development', name: 'Development' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'business', name: 'Business' },
    { id: 'photography', name: 'Photography' },
    { id: 'music', name: 'Music' },
    { id: 'fitness', name: 'Fitness' }
  ];

  const instructors = [
    {
      id: 1,
      name: 'Jane Seymour',
      role: 'UI/UX Designer',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      rating: 4.9,
      reviews: 234,
      students: 1200,
      courses: 12,
      subjects: ['design', 'ui-ux'],
      bio: 'Expert UI/UX designer with 8+ years of experience in creating beautiful and functional user interfaces.',
      hourlyRate: 45,
      languages: ['English', 'Spanish'],
      verified: true,
      featured: true
    },
    {
      id: 2,
      name: 'Edward Norton',
      role: 'Full Stack Developer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      rating: 4.8,
      reviews: 189,
      students: 2100,
      courses: 18,
      subjects: ['development', 'javascript', 'react'],
      bio: 'Senior full-stack developer specializing in modern web technologies and cloud architecture.',
      hourlyRate: 55,
      languages: ['English', 'French'],
      verified: true
    },
    {
      id: 3,
      name: 'Penelope Cruz',
      role: 'Digital Marketing Expert',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      rating: 4.7,
      reviews: 156,
      students: 1800,
      courses: 15,
      subjects: ['marketing', 'seo', 'social-media'],
      bio: 'Digital marketing strategist helping businesses grow their online presence and reach.',
      hourlyRate: 40,
      languages: ['English', 'Italian'],
      verified: true
    },
    {
      id: 4,
      name: 'John Travolta',
      role: 'WordPress Developer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      rating: 4.6,
      reviews: 298,
      students: 2500,
      courses: 22,
      subjects: ['development', 'wordpress', 'php'],
      bio: 'WordPress expert with extensive experience in theme development and plugin creation.',
      hourlyRate: 35,
      languages: ['English'],
      verified: true
    },
    {
      id: 5,
      name: 'Sarah Johnson',
      role: 'Business Strategy Consultant',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      rating: 4.9,
      reviews: 145,
      students: 950,
      courses: 8,
      subjects: ['business', 'strategy', 'management'],
      bio: 'Business consultant helping startups and established companies develop effective growth strategies.',
      hourlyRate: 65,
      languages: ['English', 'German'],
      verified: true
    },
    {
      id: 6,
      name: 'Michael Brown',
      role: 'Photography Instructor',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      rating: 4.8,
      reviews: 89,
      students: 650,
      courses: 6,
      subjects: ['photography', 'editing'],
      bio: 'Professional photographer teaching the art of capturing stunning images and post-processing.',
      hourlyRate: 30,
      languages: ['English'],
      verified: true
    }
  ];

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSubject = selectedSubject === 'all' || instructor.subjects.includes(selectedSubject);
    const matchesSearch = instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instructor.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Instructors</h1>
          <p className="text-xl opacity-90">Learn from the best experts in their fields</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Instructors</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Highest Rated</option>
                <option value="students">Most Students</option>
                <option value="courses">Most Courses</option>
                <option value="rate-low">Rate: Low to High</option>
                <option value="rate-high">Rate: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredInstructors.length} of {instructors.length} instructors
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredInstructors.map((instructor) => (
            <div key={instructor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-64 object-cover"
                />
                {instructor.featured && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
                {instructor.verified && (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{instructor.name}</h3>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < Math.floor(instructor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">({instructor.rating})</span>
                  </div>
                </div>
                <p className="text-blue-600 font-medium mb-3">{instructor.role}</p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{instructor.bio}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Students:</span>
                    <span className="font-semibold ml-2">{instructor.students}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Courses:</span>
                    <span className="font-semibold ml-2">{instructor.courses}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rate:</span>
                    <span className="font-semibold ml-2">${instructor.hourlyRate}/hr</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reviews:</span>
                    <span className="font-semibold ml-2">{instructor.reviews}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {instructor.languages.map((language, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {language}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <Link
                    to={`/instructor/${instructor.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center font-medium"
                  >
                    View Profile
                  </Link>
                  <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700">2</button>
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700">Next</button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Instructors; 