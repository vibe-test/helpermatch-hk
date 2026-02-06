
import React from 'react';
import { ViewState } from '../types';

interface HomeViewProps {
  onNavigate: (view: ViewState) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
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
                在香港尋找您<br />最合適的家庭傭工
              </h1>
              <p className="text-xl opacity-90 mb-8 max-w-lg">
                我們為僱主和女傭提供最直接、透明的對接平台。超過10,000名活躍用戶正在使用。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => onNavigate('SEARCH_HELPERS')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition shadow-lg"
                >
                  開始搜尋女傭
                </button>
                <button 
                  onClick={() => onNavigate('AI_MATCH')}
                  className="bg-pink-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-pink-600 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>✨</span> AI 智能配對
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
              <div className="text-gray-500 font-medium">活躍女傭</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">3,000+</div>
              <div className="text-gray-500 font-medium">僱主招聘中</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">15,000+</div>
              <div className="text-gray-500 font-medium">成功案例</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-500 font-medium">直接對接</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">為什麼選擇 HelperMatch？</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">我們優化了傳統中介的繁瑣流程，讓找女傭變得簡單、快速、更智能。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">直接聯繫</h3>
              <p className="text-gray-600">無需支付高昂中介費，直接與合適的人選面試溝通。</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">AI 智能匹配</h3>
              <p className="text-gray-600">透過先進的 AI 技術，根據您的需求自動過濾最匹配的候選人。</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">真實評價</h3>
              <p className="text-gray-600">所有個人檔案均經過核實，並附有前任僱主的真實評價。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">準備好尋找您的得力助手了嗎？</h2>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => onNavigate('POST_JOB')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg transition shadow-xl"
            >
              立即刊登職位
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
