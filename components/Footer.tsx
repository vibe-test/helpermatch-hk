
import React from 'react';
import { ViewState } from '../types';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <span className="text-white text-xl font-bold">HelperMatch</span>
            </div>
            <p className="text-sm leading-relaxed">
              香港領先的家庭傭工對接平台，致力於透過透明的信息和先進的技術，為每個家庭找到最合適的幫手。
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">快速連結</h4>
            <ul className="space-y-4 text-sm">
              <li><button onClick={() => onNavigate('SEARCH_HELPERS')} className="hover:text-white transition">尋找女傭</button></li>
              <li><button onClick={() => onNavigate('SEARCH_JOBS')} className="hover:text-white transition">尋找工作</button></li>
              <li><button onClick={() => onNavigate('POST_JOB')} className="hover:text-white transition">刊登招聘</button></li>
              <li><button onClick={() => onNavigate('AI_MATCH')} className="hover:text-white transition text-pink-500">AI 智能配對</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">常見問題</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition">如何面試女傭？</a></li>
              <li><a href="#" className="hover:text-white transition">合約及保險資訊</a></li>
              <li><a href="#" className="hover:text-white transition">收費詳情</a></li>
              <li><a href="#" className="hover:text-white transition">中介服務條款</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">聯絡我們</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>香港中環德輔道中...</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📧</span>
                <span>support@helpermatch.hk</span>
              </li>
              <li className="flex items-start gap-2">
                <span>💬</span>
                <span>WhatsApp: +852 9876 5432</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 text-center text-xs">
          <p>© 2024 HelperMatch HK. All rights reserved. 勞工處牌照號碼: 12345678</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
