import React, { useState, useEffect } from 'react';
import { JobPost } from '../types';

interface JobSearchViewProps {
  jobs: JobPost[];
  user: any;
  onStartChat?: (userId: string) => void;
}

const JobSearchView: React.FC<JobSearchViewProps> = ({ jobs, user, onStartChat }) => {
  const [loading, setLoading] = useState(true);
  const [isApprovedByContent, setIsApprovedByContent] = useState(false);
  const [price, setPrice] = useState(388); // Default price in HKD
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkApproval = async () => {
      setLoading(true);
      try {
        if (user) {
          const userRes = await fetch(`/api/users/${user.id}`);
          if (userRes.ok) {
            const latestUser = await userRes.json();

            if (latestUser.role === 'admin' || latestUser.role === 'employer') {
              setIsApprovedByContent(true);
              setDebugInfo({ status: 'Authorized', latestUser });
            } else if (latestUser.role === 'helper') {
              const hasPermission = latestUser.canViewJobs === 1 || latestUser.canViewJobs === true;
              const profileRes = await fetch(`/api/helpers?userId=${latestUser.id}&admin=true`);
              const profiles = await profileRes.json();

              const approvedProfile = Array.isArray(profiles) && profiles.find((p: any) => p.status === 'approved');
              const hasApprovedProfile = !!approvedProfile;

              setDebugInfo({
                latestUser,
                hasPermission,
                hasApprovedProfile,
                profileCount: Array.isArray(profiles) ? profiles.length : 0,
                firstProfileStatus: Array.isArray(profiles) && profiles.length > 0 ? profiles[0].status : 'none'
              });

              setIsApprovedByContent(hasPermission || hasApprovedProfile);
            }
          }
        }
      } catch (error: any) {
        console.error('Error:', error);
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/settings');
        const settings = await res.json();
        setPrice((settings.helperPrice || 38800) / 100);
      } catch (err) {
        console.error(err);
      }
    };

    checkApproval();
    fetchPrice();
  }, [user]);

  if (loading) return <div className="p-20 text-center font-bold">Loading...</div>;

  if (!isApprovedByContent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            To ensure recruitment quality, only verified and approved **"helper"** accounts can view the latest job postings.
          </p>
          {!user ? (
            <p className="text-green-600 font-bold text-lg">Please click "Login" in the top right corner.</p>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-left inline-block">
                <p><strong>Current Account Info:</strong></p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role === 'employer' ? 'Employer' : user.role === 'helper' ? 'Helper' : user.role}</p>
                {debugInfo && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p>Status: {debugInfo.latestUser?.status}</p>
                    <p>Job Permission: {debugInfo.hasPermission ? 'Yes' : 'No'}</p>
                    <p>Approved Profile: {debugInfo.hasApprovedProfile ? 'Yes' : 'No'}</p>
                    <p>Profiles Found: {debugInfo.profileCount}</p>
                    {debugInfo.profileCount > 0 && <p>First Profile Status: {debugInfo.firstProfileStatus}</p>}
                  </div>
                )}
              </div>

              {user.role === 'helper' ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 text-yellow-800 p-6 rounded-2xl font-medium border border-yellow-100">
                    To ensure recruitment quality, helpers must have at least one **"approved"** profile to view job postings.<br />
                    If you haven't filled it out, please go to your profile. If you have, please wait for admin approval.
                  </div>

                  <div className="bg-green-50 text-green-800 p-6 rounded-2xl font-medium border border-green-100 mt-4">
                    <p className="mb-4">Or upgrade to Premium to view all jobs instantly!</p>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/payments/create-checkout-session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: user.id, planId: 'premium_helper' })
                          });
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            alert('Payment initialization failed: ' + (data.error || 'Unknown error'));
                          }
                        } catch (err) {
                          console.error(err);
                          alert('Error initiating payment');
                        }
                      }}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
                    >
                      Upgrade for HK${price}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div >
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Latest Job Postings</h2>
          <p className="text-gray-500 mt-2">Find your ideal employer</p>
        </div>
        <div className="hidden sm:block">
          <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">
            Filter Region
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {jobs.length > 0 ? jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 transition group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold group-hover:text-blue-600 transition">{job.title}</h3>
                  {job.postedAt === 'Just now' && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">New</span>}
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Hiring</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {job.postedAt}
                  </span>
                  {job.expiryDate && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Expiry Date: {job.expiryDate}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 line-clamp-2">{job.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.requirements.map(req => (
                    <span key={req} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[140px]">
                <button
                  onClick={() => {
                    const jobUserId = (job as any).userId;
                    if (jobUserId && onStartChat) {
                      onStartChat(jobUserId);
                    } else {
                      alert('This employer has not linked a user account or messaging is unavailable.');
                    }
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Contact Employer
                </button>
                <button className="text-blue-600 text-sm font-medium hover:underline">
                  Save Job
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500">No job postings at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearchView;
