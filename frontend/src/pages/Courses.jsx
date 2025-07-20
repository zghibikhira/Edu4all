import { useState } from 'react';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'design', name: 'Design' },
    { id: 'development', name: 'Development' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'business', name: 'Business' },
    { id: 'photography', name: 'Photography' },
    { id: 'music', name: 'Music' },
    { id: 'fitness', name: 'Fitness' }
  ];

  const courses = [
    {
      id: 1,
      title: 'Starting SEO as your Home Based Business',
      instructor: 'John Smith',
      rating: 4.9,
      reviews: 128,
      price: 49.00,
      originalPrice: 99.00,
      duration: '4 Weeks',
      level: 'Advanced',
      lessons: 13,
      students: 2847,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80',
      category: 'marketing',
      featured: true
    },
    {
      id: 2,
      title: 'Java Programming Masterclass for Software Developers',
      instructor: 'Sarah Johnson',
      rating: 4.4,
      reviews: 210,
      price: 78.99,
      originalPrice: 129.00,
      duration: '3 Weeks',
      level: 'Beginner',
      lessons: 15,
      students: 3547,
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
      category: 'development'
    },
    {
      id: 3,
      title: 'Building A Better World One Student At A Time',
      instructor: 'Michael Brown',
      rating: 5.0,
      reviews: 315,
      price: 64.99,
      originalPrice: 89.00,
      duration: '10 Weeks',
      level: 'Advanced',
      lessons: 18,
      students: 2333,
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      category: 'business'
    },
    {
      id: 4,
      title: 'Master Your Personal Brand Like a Marketing Pro',
      instructor: 'Emily Davis',
      rating: 4.5,
      reviews: 418,
      price: 55.99,
      originalPrice: 79.00,
      duration: '6 Weeks',
      level: 'Intermediate',
      lessons: 20,
      students: 3838,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      category: 'marketing'
    },
    {
      id: 5,
      title: 'Complete Web Development Bootcamp 2024',
      instructor: 'David Wilson',
      rating: 4.7,
      reviews: 156,
      price: 89.99,
      originalPrice: 149.00,
      duration: '8 Weeks',
      level: 'Beginner',
      lessons: 25,
      students: 4123,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
      category: 'development'
    },
    {
      id: 6,
      title: 'Digital Photography Masterclass',
      instructor: 'Lisa Anderson',
      rating: 4.8,
      reviews: 89,
      price: 45.99,
      originalPrice: 69.00,
      duration: '5 Weeks',
      level: 'Intermediate',
      lessons: 12,
      students: 1567,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
      category: 'photography'
    },
    {
      id: 7,
      title: 'Business Strategy and Management',
      instructor: 'Robert Chen',
      rating: 4.6,
      reviews: 234,
      price: 67.99,
      originalPrice: 99.00,
      duration: '7 Weeks',
      level: 'Advanced',
      lessons: 16,
      students: 2987,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      category: 'business'
    },
    {
      id: 8,
      title: 'UI/UX Design Fundamentals',
      instructor: 'Maria Garcia',
      rating: 4.9,
      reviews: 167,
      price: 59.99,
      originalPrice: 89.00,
      duration: '4 Weeks',
      level: 'Beginner',
      lessons: 14,
      students: 2234,
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
      category: 'design'
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Courses</h1>
          <p className="text-xl opacity-90">Discover the best online courses from top instructors</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title or instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
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
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">View:</span>
            <button className="p-2 bg-blue-600 text-white rounded">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
              </svg>
            </button>
            <button className="p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {course.featured && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  {course.duration}
                </div>
                <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  {course.level}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">({course.rating})</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">by {course.instructor}</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{course.lessons} Lessons</span>
                  <span>{course.students} Students</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600">${course.price}</span>
                    <span className="text-gray-500 line-through ml-2">${course.originalPrice}</span>
                  </div>
                  <Link
                    to={`/course/${course.id}`}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm"
                  >
                    View Course
                  </Link>
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
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700">3</button>
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700">Next</button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Courses; 