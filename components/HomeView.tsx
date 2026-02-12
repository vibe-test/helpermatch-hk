
import React from 'react';
import { ViewState } from '../types';

interface HomeViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, user }) => {
  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="h-full w-full fill-current">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Find Your Perfect<br />Domestic Helper in HK
              </h1>
              <p className="text-xl opacity-90 mb-8 max-w-lg">
                We provide the most direct and transparent platform for employers and helpers. Over 10,000 active users.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('SEARCH_HELPERS')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition shadow-lg"
                >
                  Find Helpers
                </button>
                <button
                  onClick={() => onNavigate('AI_MATCH')}
                  className="bg-pink-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-pink-600 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>✨</span> AI Smart Match
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://picsum.photos/seed/home/600/400"
                alt="Domestic Helper"
                className="rounded-2xl shadow-2xl border-4 border-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-gray-500 font-medium">Active Helpers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">3,000+</div>
              <div className="text-gray-500 font-medium">Job Postings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">15,000+</div>
              <div className="text-gray-500 font-medium">Success Stories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-500 font-medium">Direct Contact</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose HelperMatch?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We've optimized the traditional process to make finding a helper simple, fast, and smart.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Direct Contact</h3>
              <p className="text-gray-600">No high agency fees. Interview and communicate with candidates directly.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">AI Smart Match</h3>
              <p className="text-gray-600">Use advanced AI technology to automatically filter the best candidates for your needs.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Verified Profiles</h3>
              <p className="text-gray-600">All profiles are verified and include real reviews from previous employers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Ready to find your perfect helper?</h2>
          <div className="flex justify-center gap-4">
            {(!user || user.role === 'employer' || user.role === 'admin') ? (
              <button
                onClick={() => onNavigate('POST_JOB')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg transition shadow-xl"
              >
                Post a Job Now
              </button>
            ) : (
              <button
                onClick={() => onNavigate('SEARCH_JOBS')}
                className="bg-pink-600 hover:bg-pink-500 text-white px-10 py-4 rounded-full font-bold text-lg transition shadow-xl"
              >
                Browse Latest Jobs
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
