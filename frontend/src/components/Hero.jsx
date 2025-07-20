import { useState } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { number: '200+', label: 'Instructors' },
    { number: '3020', label: 'Online Courses' },
    { number: 'Top', label: 'Instructors' },
    { number: 'Online', label: 'Certifications' },
    { number: '6000', label: 'Members' }
  ];

  return (
    <section className="relative bg-gradient-to-br from-[#1E90FF]/10 via-white to-[#8E44AD]/10 py-20 overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1E90FF]/20 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#8E44AD]/20 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#1E90FF]/10 to-[#8E44AD]/10 rounded-full opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Get 2500+ <br />
              <span className="bg-gradient-to-r from-[#1E90FF] to-[#8E44AD] bg-clip-text text-transparent">
                Best Online Courses
              </span> <br />
              From Edu4All
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
            Empowering Learners Everywhere.
            Build your future with our online learning platform.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto lg:mx-0 mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Find courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-12 pr-32 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent text-lg"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#1E90FF] to-[#8E44AD] text-white px-6 py-2 rounded-full hover:from-[#1E90FF]/90 hover:to-[#8E44AD]/90 transition-all duration-300">
                  Search
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/courses"
                className="bg-gradient-to-r from-[#1E90FF] to-[#8E44AD] text-white px-8 py-4 rounded-full hover:from-[#1E90FF]/90 hover:to-[#8E44AD]/90 transition-all duration-300 font-semibold text-lg"
              >
                Explore Courses
              </Link>
              <Link
                to="/register"
                className="border-2 border-[#1E90FF] text-[#1E90FF] px-8 py-4 rounded-full hover:bg-[#1E90FF] hover:text-white transition-all duration-300 font-semibold text-lg"
              >
                Start Learning
              </Link>
            </div>
          </div>

          {/* Right Content - Image and Stats */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80"
                alt="Online learning"
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            
      

              {/* Floating Stats Cards */}
              <div className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#1E90FF] to-[#8E44AD] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">200+</div>
                    <div className="text-sm text-gray-600">Instructors</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#2ECC71] to-[#1E90FF] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">3020</div>
                    <div className="text-sm text-gray-600">Online Courses</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 -left-12 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#8E44AD] to-[#E74C3C] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">Top</div>
                    <div className="text-sm text-gray-600">Instructors</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 -right-12 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#FFB400] to-[#E74C3C] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">Online</div>
                    <div className="text-sm text-gray-600">Certifications</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-5 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
