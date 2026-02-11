
import React, { useState, useEffect } from 'react';
import { Nationality, Experience, HelperProfile, WorkExperienceType } from '../types';

interface HelperSearchViewProps {
  user: any;
}

const HelperSearchView: React.FC<HelperSearchViewProps> = ({ user }) => {
  const [helpers, setHelpers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApprovedByContent, setIsApprovedByContent] = useState(false);
  const [price, setPrice] = useState(388); // Default price in HKD
  const [filters, setFilters] = useState({
    nationality: 'ALL',
    experience: 'ALL',
    workExperienceType: 'ALL',
    minYearsInHK: 0
  });
  const [selectedHelper, setSelectedHelper] = useState<any | null>(null);

  useEffect(() => {
    const checkApprovalAndFetch = async () => {
      setLoading(true);
      try {
        // 1. Check if user has permission
        if (user) {
          if (user.role === 'admin') {
            setIsApprovedByContent(true);
          } else if (user.role === 'helper') {
            setIsApprovedByContent(true); // 姐姐隨時可以睇姐姐資料 (自己類別)
          } else if (user.role === 'employer') {
            // 使用管理員設定的個人權限開關
            const canView = user.canViewHelpers === 1 || user.canViewHelpers === true;
            setIsApprovedByContent(canView);
          }
        } else {
          setIsApprovedByContent(false);
        }

        // 2. Fetch helpers
        const resHelpers = await fetch(`/api/helpers?role=${user?.role || ''}&viewerId=${user?.id || ''}`);
        const data = await resHelpers.json();
        setHelpers(data);

        // 3. Fetch pricing from settings
        try {
          const resSettings = await fetch('/api/settings');
          const settings = await resSettings.json();
          setPrice((settings.employerPrice || 38800) / 100); // Convert cents to HKD
        } catch (err) {
          console.error('Error fetching settings:', err);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkApprovalAndFetch();
  }, [user]);

  if (loading) return <div className="p-20 text-center font-bold">Loading...</div>;

  if (!isApprovedByContent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            To protect helper privacy, only accounts verified by the admin and **"approved to view"** can see helper details.
          </p>
          {!user ? (
            <p className="text-blue-600 font-bold text-lg">Please click "Login" in the top right corner.</p>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-left inline-block">
                <p><strong>Current Account Info:</strong></p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role === 'employer' ? 'Employer' : user.role === 'helper' ? 'Helper' : user.role}</p>
              </div>

              {user.role === 'employer' ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 text-yellow-800 p-6 rounded-2xl font-medium border border-yellow-100">
                    To protect helper privacy, employers must have at least one **"approved"** job posting to view helper details.<br />
                    If you haven't posted yet, please click "Post Job". If you have, please wait for admin approval.
                  </div>

                  <div className="bg-green-50 text-green-800 p-6 rounded-2xl font-medium border border-green-100 mt-4">
                    <p className="mb-4">Or upgrade to Premium to view all helpers instantly!</p>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/payments/create-checkout-session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: user.id })
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
      </div>
    );
  }

  const filteredHelpers = helpers.filter(helper => {
    const nationalityMatch = filters.nationality === 'ALL' || helper.nationality === filters.nationality;
    const experienceMatch = filters.experience === 'ALL' || helper.experience === filters.experience;
    const workExpMatch = filters.workExperienceType === 'ALL' || helper.workExperienceType === filters.workExperienceType;
    const yearsMatch = !filters.minYearsInHK || (helper.yearsInHK || 0) >= filters.minYearsInHK;

    return nationalityMatch && experienceMatch && workExpMatch && yearsMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Filters</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                <select
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  value={filters.nationality}
                  onChange={(e) => setFilters({ ...filters, nationality: e.target.value })}
                >
                  <option value="ALL">All</option>
                  {Object.values(Nationality).map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <select
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  value={filters.experience}
                  onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                >
                  <option value="ALL">All</option>
                  {Object.values(Experience).map(exp => <option key={exp} value={exp}>{exp}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience Type</label>
                <select
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  value={filters.workExperienceType}
                  onChange={(e) => setFilters({ ...filters, workExperienceType: e.target.value })}
                >
                  <option value="ALL">All</option>
                  {Object.values(WorkExperienceType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min. Years in HK</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  value={filters.minYearsInHK}
                  onChange={(e) => setFilters({ ...filters, minYearsInHK: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 font-medium">Can't find a suitable candidate?</p>
            <p className="text-xs text-blue-600 mt-1">Try our AI Smart Match feature to get recommendations.</p>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Search Results ({filteredHelpers.length})</h2>
            <div className="text-sm text-gray-500">Sort: Newest First</div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHelpers.map(helper => (
              <div key={helper.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col">
                <div className="relative h-64">
                  <img src={helper.imageUrl} alt={helper.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {helper.workExperienceType || helper.experience}
                  </div>
                  {helper.yearsInHK > 0 && (
                    <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {helper.yearsInHK} yrs in HK
                    </div>
                  )}
                </div>
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{helper.name}</h3>
                    <span className="text-gray-500 text-sm font-medium">{helper.age} years old</span>
                  </div>
                  <div className="text-blue-600 font-bold text-sm mb-4 uppercase tracking-wider">{helper.nationality}</div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {helper.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                    {helper.skills.length > 3 && <span className="text-gray-400 text-xs flex items-center font-bold">+{helper.skills.length - 3}</span>}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{helper.description}</p>
                </div>
                <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Salary Preference</div>
                    <div className="font-extrabold text-blue-600 text-lg">HK$ {helper.salary}</div>
                  </div>
                  <button
                    onClick={() => setSelectedHelper(helper)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all duration-200 active:scale-95"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Helper Detail Modal */}
      {selectedHelper && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scaleIn">
            <button
              onClick={() => setSelectedHelper(null)}
              className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white w-10 h-10 rounded-full flex items-center justify-center transition backdrop-blur-md"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="md:w-1/2 h-72 md:h-auto overflow-hidden">
              <img src={selectedHelper.imageUrl} alt={selectedHelper.name} className="w-full h-full object-cover" />
            </div>

            <div className="md:w-1/2 p-8 flex flex-col h-[60vh] md:h-auto overflow-y-auto">
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                  {selectedHelper.workExperienceType || selectedHelper.experience}
                </span>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{selectedHelper.name}</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                  {selectedHelper.nationality} • {selectedHelper.age} Years Old
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">In Hong Kong</p>
                    <p className="font-bold text-gray-900">{selectedHelper.yearsInHK || 0} Years</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expected Pay</p>
                    <p className="font-bold text-blue-600">HK$ {selectedHelper.salary}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3">Expertise & Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHelper.skills.map((skill: string) => (
                      <span key={skill} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHelper.languages.map((lang: string) => (
                      <span key={lang} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3">About {selectedHelper.name.split(' ')[0]}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {selectedHelper.description}
                  </p>
                </div>

                <div className="pt-4 mt-auto">
                  <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200 active:scale-95">
                    Contact Helper
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-widest">
                    Available: {selectedHelper.availability}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelperSearchView;
