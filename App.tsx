
import React, { useState, useEffect } from 'react';
import { ViewState, JobPost } from './types';
import { MOCK_JOBS } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import HelperSearchView from './components/HelperSearchView';
import JobSearchView from './components/JobSearchView';
import PostJobView from './components/PostJobView';
import SmartMatchView from './components/SmartMatchView';
import AdminDashboard from './components/AdminDashboard';
import HelperProfileUpload from './components/HelperProfileUpload';
import ChatView from './components/ChatView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [user, setUser] = useState<any>(null);
  const [targetChatUserId, setTargetChatUserId] = useState<string | null>(null);

  // Initialize jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`/api/jobs?role=${user?.role || ''}&viewerId=${user?.id || ''}`);
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        } else {
          console.error('Failed to fetch jobs');
          setJobs(MOCK_JOBS); // Fallback
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs(MOCK_JOBS); // Fallback
      }
    };

    fetchJobs();
  }, [user]);

  // Handle Payment Verification
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get('session_id');

    if (sessionId) {
      fetch('/api/payments/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
            setCurrentView('PAYMENT_SUCCESS');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.error('Payment verification failed:', data.error);
          }
        })
        .catch(err => console.error('Error verifying payment:', err));
    }
  }, []);

  const handlePostJob = async (newJob: Omit<JobPost, 'id' | 'postedAt'>) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newJob, userId: user?.id }),
      });

      if (response.ok) {
        alert('Job post submitted! It will be visible after admin approval.');
        setCurrentView('HOME');
      } else {
        const errorData = await response.json();
        console.error('Failed to post job:', errorData);
        alert(`Failed to post job: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error posting job:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return <HomeView onNavigate={setCurrentView} />;
      case 'SEARCH_HELPERS':
        return <HelperSearchView user={user} />;
      case 'SEARCH_JOBS':
        return <JobSearchView jobs={jobs} user={user} />;
      case 'POST_JOB':
        return <PostJobView onJobPosted={handlePostJob} user={user} />;
      case 'AI_MATCH':
        return <SmartMatchView />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'HELPER_PROFILE':
        return <HelperProfileUpload user={user} onSuccess={() => setCurrentView('SEARCH_HELPERS')} />;
      case 'PAYMENT_SUCCESS':
        return (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
              <p className="text-gray-600 mb-8">
                Your account has been upgraded. You now have full access to view all helper profiles.
              </p>
              <button
                onClick={() => setCurrentView('SEARCH_HELPERS')}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition w-full"
              >
                Browse Helpers
              </button>
            </div>
          </div>
        );
      case 'MESSAGES':
        return <ChatView user={user} targetUserId={targetChatUserId} />;
      default:
        return <HomeView onNavigate={setCurrentView} />;
    }
  };

  const handleStartChat = (targetUserId: string) => {
    if (!user) {
      alert('Please login first to send messages');
      return;
    }
    setTargetChatUserId(targetUserId);
    setCurrentView('MESSAGES');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header currentView={currentView} onNavigate={setCurrentView} user={user} setUser={setUser} />
      <main className="flex-grow">
        {currentView === 'SEARCH_HELPERS' ? <HelperSearchView user={user} onStartChat={handleStartChat} /> :
          currentView === 'SEARCH_JOBS' ? <JobSearchView jobs={jobs} user={user} onStartChat={handleStartChat} /> :
            renderView()}
      </main>
      <Footer onNavigate={setCurrentView} />
    </div>
  );
};

export default App;
