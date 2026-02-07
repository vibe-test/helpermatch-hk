
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [user, setUser] = useState<any>(null);

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
        console.error('Failed to post job');
        // Handle error (e.g., show notification)
      }
    } catch (error) {
      console.error('Error posting job:', error);
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
      default:
        return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header currentView={currentView} onNavigate={setCurrentView} user={user} setUser={setUser} />
      <main className="flex-grow">
        {renderView()}
      </main>
      <Footer onNavigate={setCurrentView} />
    </div>
  );
};

export default App;
