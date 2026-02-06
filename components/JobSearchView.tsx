import React, { useState, useEffect } from 'react';
import { JobPost } from '../types';

interface JobSearchViewProps {
  jobs: JobPost[];
  user: any;
}

const JobSearchView: React.FC<JobSearchViewProps> = ({ jobs, user }) => {
  const [loading, setLoading] = useState(true);
  const [isApprovedByContent, setIsApprovedByContent] = useState(false);

  useEffect(() => {
    const checkApproval = async () => {
      setLoading(true);
      try {
        if (user) {
          if (user.role === 'admin') {
            setIsApprovedByContent(true);
          } else if (user.role === 'employer') {
            setIsApprovedByContent(true); // 僱主隨時可以睇招聘資料 (自己類別)
          } else if (user.role === 'helper') {
            // 使用管理員設定的個人權限開關
            const canView = user.canViewJobs === 1 || user.canViewJobs === true;
            setIsApprovedByContent(canView);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkApproval();
  }, [user]);

  if (loading) return <div className="p-20 text-center font-bold">載入中...</div>;

  if (!isApprovedByContent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">存取受限</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            為了確保招聘質素，只有已驗證並獲批准的 **「姐姐」** 帳號才可以查看最新的招聘資料。
          </p>
          {!user ? (
            <p className="text-green-600 font-bold text-lg">請先點擊頁面右上方的「登入/註冊」</p>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-left inline-block">
                <p><strong>目前帳號資訊：</strong></p>
                <p>電郵：{user.email}</p>
                <p>身份：{user.role === 'employer' ? '僱主' : user.role === 'helper' ? '姐姐' : user.role}</p>
              </div>

              {user.role === 'helper' ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 text-yellow-800 p-6 rounded-2xl font-medium border border-yellow-100">
                    為了確保招聘質素，姐姐必須至少有一個 **「已通過審核」** 的個人檔案，才可以查看招聘資料。<br />
                    如果您尚未填寫，請前往個人中心；如果已填寫，請耐心等候管理員審核。
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">最新招聘職位</h2>
          <p className="text-gray-500 mt-2">尋找適合您的理想僱主</p>
        </div>
        <div className="hidden sm:block">
          <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">
            篩選地區
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
                  {job.postedAt === '剛剛' && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">最新</span>}
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">招聘中</span>
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
                      到期日: {job.expiryDate}
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
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                  立即申請
                </button>
                <button className="text-blue-600 text-sm font-medium hover:underline">
                  保存職位
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500">暫時沒有招聘職位</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearchView;
