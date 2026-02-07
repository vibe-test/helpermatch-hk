
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
              HK's leading domestic helper platform, dedicated to finding the perfect match for every family through transparency and advanced technology.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><button onClick={() => onNavigate('SEARCH_HELPERS')} className="hover:text-white transition">Find Helpers</button></li>
              <li><button onClick={() => onNavigate('SEARCH_JOBS')} className="hover:text-white transition">Find Jobs</button></li>
              <li><button onClick={() => onNavigate('POST_JOB')} className="hover:text-white transition">Post a Job</button></li>
              <li><button onClick={() => onNavigate('AI_MATCH')} className="hover:text-white transition text-pink-500">AI Smart Match</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">FAQ</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition">How to interview?</a></li>
              <li><a href="#" className="hover:text-white transition">Contract & Insurance</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing Details</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Des Voeux Road Central, HK</span>
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
          <p>© 2024 HelperMatch HK. All rights reserved. Labour Dept License: 12345678</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
