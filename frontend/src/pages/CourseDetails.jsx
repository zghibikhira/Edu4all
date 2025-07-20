import { useState } from 'react';
// import { useParams } from 'react-router-dom';

const CourseDetails = () => {
  // const { id } = useParams(); // Will be used when connecting to real API
  const [activeTab, setActiveTab] = useState('overview');

  // Mock course data - in a real app, this would come from an API
  const course = {
    id: 1,
    title: 'Starting SEO as your Home Based Business',
    instructor: {
      name: 'John Smith',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      rating: 4.9,
      students: 2847,
      courses: 12,
      bio: 'Expert SEO consultant with 8+ years of experience helping businesses grow their online presence.'
    },
    rating: 4.9,
    reviews: 128,
    price: 49.00,
    originalPrice: 99.00,
    duration: '4 Weeks',
    level: 'Advanced',
    lessons: 13,
    students: 2847,
    language: 'English',
    lastUpdated: 'December 2023',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80',
    description: 'Learn how to start and grow a successful SEO business from home. This comprehensive course covers everything from basic SEO principles to advanced strategies for ranking websites.',
    whatYouWillLearn: [
      'Understand the fundamentals of SEO and search engine algorithms',
      'Learn keyword research and optimization techniques',
      'Master on-page and off-page SEO strategies',
      'Develop a business plan for your SEO services',
      'Build a client base and manage projects effectively',
      'Use advanced SEO tools and analytics',
      'Create effective content marketing strategies',
      'Implement local SEO for small businesses'
    ],
    requirements: [
      'Basic computer skills and internet knowledge',
      'No prior SEO experience required',
      'Willingness to learn and practice',
      'Access to a computer with internet connection'
    ],
    curriculum: [
      {
        week: 1,
        title: 'Introduction to SEO',
        lessons: [
          { title: 'What is SEO and why it matters', duration: '15 min', type: 'video' },
          { title: 'How search engines work', duration: '20 min', type: 'video' },
          { title: 'SEO vs other marketing methods', duration: '10 min', type: 'video' },
          { title: 'Setting up your workspace', duration: '15 min', type: 'video' }
        ]
      },
      {
        week: 2,
        title: 'Keyword Research',
        lessons: [
          { title: 'Understanding search intent', duration: '25 min', type: 'video' },
          { title: 'Keyword research tools', duration: '30 min', type: 'video' },
          { title: 'Long-tail keywords', duration: '20 min', type: 'video' },
          { title: 'Keyword mapping exercise', duration: '45 min', type: 'assignment' }
        ]
      },
      {
        week: 3,
        title: 'On-Page SEO',
        lessons: [
          { title: 'Title tags and meta descriptions', duration: '25 min', type: 'video' },
          { title: 'Header tags and content structure', duration: '30 min', type: 'video' },
          { title: 'Internal linking strategies', duration: '20 min', type: 'video' },
          { title: 'Image optimization', duration: '15 min', type: 'video' }
        ]
      },
      {
        week: 4,
        title: 'Business Development',
        lessons: [
          { title: 'Creating your service packages', duration: '30 min', type: 'video' },
          { title: 'Pricing strategies', duration: '25 min', type: 'video' },
          { title: 'Client acquisition methods', duration: '35 min', type: 'video' },
          { title: 'Final project: Business plan', duration: '60 min', type: 'assignment' }
        ]
      }
    ],
    courseReviews: [
      {
        id: 1,
        user: 'Sarah Johnson',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Excellent course! John explains complex SEO concepts in a way that\'s easy to understand. I\'ve already started implementing what I learned and seeing results.'
      },
      {
        id: 2,
        user: 'Michael Brown',
        rating: 4,
        date: '1 month ago',
        comment: 'Great content and practical exercises. The instructor is knowledgeable and responsive to questions. Highly recommended for anyone wanting to learn SEO.'
      },
      {
        id: 3,
        user: 'Emily Davis',
        rating: 5,
        date: '3 weeks ago',
        comment: 'This course exceeded my expectations. The step-by-step approach and real-world examples make it easy to follow along and apply the knowledge.'
      }
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 ml-2">({course.rating})</span>
                </div>
                <span className="text-gray-600">{course.reviews} reviews</span>
                <span className="text-gray-600">{course.students} students enrolled</span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Created by {course.instructor.name}</span>
                <span>•</span>
                <span>Last updated {course.lastUpdated}</span>
                <span>•</span>
                <span>{course.language}</span>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-lg shadow-lg p-6 sticky top-4">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-blue-600">${course.price}</span>
                    <span className="text-gray-500 line-through ml-2">${course.originalPrice}</span>
                  </div>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">50% OFF</span>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold mb-4">
                  Enroll Now
                </button>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course includes:</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{course.lessons} hours on-demand video</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Downloadable resources</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Certificate of completion</span>
                  </div>
                </div>
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
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.whatYouWillLearn.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-gray-500 mr-3">•</span>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">Course Content</h3>
                  <span className="text-sm text-gray-600">{course.lessons} lessons • {course.duration}</span>
                </div>
                
                <div className="space-y-4">
                  {course.curriculum.map((week, weekIndex) => (
                    <div key={weekIndex} className="border rounded-lg">
                      <div className="p-4 bg-gray-50 border-b">
                        <h4 className="font-semibold text-gray-800">Week {week.week}: {week.title}</h4>
                      </div>
                      <div className="divide-y">
                        {week.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="p-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-700">{lesson.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{lesson.duration}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{lesson.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div className="space-y-6">
                <div className="flex items-start space-x-6">
                  <img
                    src={course.instructor.image}
                    alt={course.instructor.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.instructor.name}</h3>
                    <p className="text-gray-600 mb-4">{course.instructor.bio}</p>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < Math.floor(course.instructor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-600 ml-2">({course.instructor.rating})</span>
                      </div>
                      <span className="text-gray-600">{course.instructor.students} students</span>
                      <span className="text-gray-600">{course.instructor.courses} courses</span>
                    </div>
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
                        <svg key={i} className={`w-5 h-5 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600 ml-2">{course.rating} out of 5</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {course.reviews.map((review) => (
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
                      <p className="text-gray-700">{review.comment}</p>
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

export default CourseDetails; 