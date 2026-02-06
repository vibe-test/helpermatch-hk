
import React, { useState, useEffect } from 'react';
import { Nationality, Experience, HelperProfile } from '../types';

interface HelperSearchViewProps {
  user: any;
}

const HelperSearchView: React.FC<HelperSearchViewProps> = ({ user }) => {
  const [helpers, setHelpers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApprovedByContent, setIsApprovedByContent] = useState(false);
  const [filters, setFilters] = useState({
    nationality: 'ALL',
    experience: 'ALL'
  });

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
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkApprovalAndFetch();
  }, [user]);

  if (loading) return <div className="p-20 text-center font-bold">載入中...</div>;

  if (!isApprovedByContent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">存取受限</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            為了保護姐姐的隱私，只有經管理員驗證並 **「獲准查看」** 的帳號才可以查看姐姐的詳細資料。
          </p>
          {!user ? (
            <p className="text-blue-600 font-bold text-lg">請先點擊頁面右上方的「登入/註冊」</p>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-left inline-block">
                <p><strong>目前帳號資訊：</strong></p>
                <p>電郵：{user.email}</p>
                <p>身份：{user.role === 'employer' ? '僱主' : user.role === 'helper' ? '姐姐' : user.role}</p>
              </div>

              {user.role === 'employer' ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 text-yellow-800 p-6 rounded-2xl font-medium border border-yellow-100">
                    為了保護姐姐隱私，僱主必須至少有一個 **「已通過審核」** 的招聘廣告，才可以查看姐姐資料。<br />
                    如果您尚未刊登，請點擊上方「刊登招聘廣告」；如果已刊登，請耐心等候管理員審核。
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
    return (filters.nationality === 'ALL' || helper.nationality === filters.nationality) &&
      (filters.experience === 'ALL' || helper.experience === filters.experience);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4">篩選條件</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">國籍</label>
                <select
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  value={filters.nationality}
                  onChange={(e) => setFilters({ ...filters, nationality: e.target.value })}
                >
                  <option value="ALL">全部</option>
                  {Object.values(Nationality).map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">經驗</label>
                <select
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  value={filters.experience}
                  onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                >
                  <option value="ALL">全部</option>
                  {Object.values(Experience).map(exp => <option key={exp} value={exp}>{exp}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 font-medium">找不到合適的人選？</p>
            <p className="text-xs text-blue-600 mt-1">試試我們的 AI 智能配對功能，讓我們為您推薦。</p>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">搜尋結果 ({filteredHelpers.length})</h2>
            <div className="text-sm text-gray-500">排序: 最新優先</div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHelpers.map(helper => (
              <div key={helper.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col">
                <div className="relative h-64">
                  <img src={helper.imageUrl} alt={helper.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {helper.experience}
                  </div>
                </div>
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{helper.name}</h3>
                    <span className="text-gray-500 text-sm">{helper.age}歲</span>
                  </div>
                  <div className="text-blue-600 font-medium text-sm mb-4">{helper.nationality}</div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {helper.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {helper.skills.length > 3 && <span className="text-gray-400 text-xs flex items-center">+{helper.skills.length - 3}</span>}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{helper.description}</p>
                </div>
                <div className="p-5 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">薪資要求</div>
                    <div className="font-bold text-gray-900">HK$ {helper.salary}</div>
                  </div>
                  <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition">
                    查看檔案
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperSearchView;
