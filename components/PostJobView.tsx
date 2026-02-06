
import React, { useState } from 'react';
import { generateJobDescription } from '../services/geminiService';
import { JobPost } from '../types';

interface PostJobViewProps {
  onJobPosted: (job: Omit<JobPost, 'id' | 'postedAt'>) => void;
  user: any;
}

const PostJobView: React.FC<PostJobViewProps> = ({ onJobPosted, user }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    expiryDate: '',
    description: ''
  });
  const [aiPrompt, setAiPrompt] = useState('');

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const result = await generateJobDescription(aiPrompt);
    setFormData(prev => ({ ...prev, description: result }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location) return;
    onJobPosted({
      ...formData,
      requirements: ['煮飯', '照顧小孩'] // In a real app, this would be dynamic
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h2 className="text-3xl font-bold">刊登您的招聘需求</h2>
          <p className="opacity-80 mt-2">只需幾分鐘，即可開始接觸數千名優秀的家庭傭工候選人。</p>
        </div>

        <div className="p-8 space-y-8">
          {!user ? (
            <div className="bg-orange-50 border border-orange-200 p-12 rounded-3xl text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                為了確保招聘質素，只有已註冊並登入的用戶才可以刊登招聘廣告。
              </p>
              <button
                onClick={() => {
                  // The login modal is controlled by the Header, but for simplicity 
                  // we can suggest the user click the Login button in the header.
                  // Or we could pass down the openLogin function.
                  alert('請點擊頁面右上方的「登入」以繼續。');
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                立即登入/註冊
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-bold text-blue-900">AI 快速生成職位描述</h3>
                </div>
                <p className="text-sm text-blue-700 mb-4">輸入您的基本要求，AI 會為您撰寫專業的職位說明。</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例如：住在沙田，照顧老人..."
                    className="flex-1 p-3 border border-blue-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isGenerating ? '生成中...' : '生成描述'}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">招聘標題</label>
                  <input
                    required
                    type="text"
                    placeholder="例如：急聘完約印傭 (北角區)"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">工作地點</label>
                  <input
                    required
                    type="text"
                    placeholder="例如：將軍澳、半山"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">預算薪金 (HK$)</label>
                  <input
                    required
                    type="text"
                    placeholder="例如：5,000 - 6,000"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">招聘到期日</label>
                  <input
                    required
                    type="date"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">詳細職責及要求</label>
                  <textarea
                    required
                    rows={8}
                    placeholder="詳細描述您的需求..."
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl text-xl font-bold hover:bg-blue-700 transition shadow-lg">
                    確認發佈
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostJobView;
