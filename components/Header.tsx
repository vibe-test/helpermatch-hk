
import React, { useState } from 'react';
import { ViewState } from '../types';

import LoginModal from './LoginModal';
import AuthModal from './LoginModal'; // This is now AuthModal internally after the swap

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: any;
  setUser: (user: any) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    if (currentView === 'ADMIN') {
      onNavigate('HOME');
    }
  };

  return (
    <>
      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('HOME')}>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 hidden sm:block">HelperMatch</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => onNavigate('SEARCH_HELPERS')}
                className={`${currentView === 'SEARCH_HELPERS' ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-500 font-medium`}
              >
                Find Helpers
              </button>
              <button
                onClick={() => onNavigate('SEARCH_JOBS')}
                className={`${currentView === 'SEARCH_JOBS' ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-500 font-medium`}
              >
                Find Jobs
              </button>
              <button
                onClick={() => onNavigate('AI_MATCH')}
                className="text-pink-600 hover:text-pink-500 font-bold flex items-center gap-1"
              >
                <span className="animate-pulse">✨</span> AI Match
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => onNavigate('ADMIN')}
                  className={`${currentView === 'ADMIN' ? 'text-blue-600' : 'text-purple-600'} hover:text-purple-500 font-bold flex items-center gap-1`}
                >
                  ⚙️ Admin
                </button>
              )}
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('POST_JOB')}
                className="hidden sm:block bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition"
              >
                Post Job
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {user.name[0]}
                    </div>
                    <span className="font-medium text-gray-700 hidden sm:block">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-gray-600 font-medium hover:text-blue-600 transition"
                >
                  Login
                </button>
              )}

              <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg">
            <button onClick={() => { onNavigate('SEARCH_HELPERS'); setIsMenuOpen(false); }} className="block w-full text-left font-medium">Find Helpers</button>
            <button onClick={() => { onNavigate('SEARCH_JOBS'); setIsMenuOpen(false); }} className="block w-full text-left font-medium">Find Jobs</button>
            <button onClick={() => { onNavigate('AI_MATCH'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-pink-600">AI Match</button>
            <button onClick={() => { onNavigate('POST_JOB'); setIsMenuOpen(false); }} className="block w-full bg-blue-600 text-white p-2 rounded-md text-center">Post Job</button>
            {user && (
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-900">{user.name}</span>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="text-red-500 font-bold"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
