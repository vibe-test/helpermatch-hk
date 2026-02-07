
import React, { useState } from 'react';
import { getSmartMatch } from '../services/geminiService';

import { HelperProfile } from '../types';

const SmartMatchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [matches, setMatches] = useState<HelperProfile[]>([]);

  const handleMatch = async () => {
    if (!query) return;
    setIsLoading(true);

    try {
      const [aiRes, helpersRes] = await Promise.all([
        getSmartMatch(query),
        fetch('/api/helpers').then(res => res.json())
      ]);

      setAiResult(aiRes);

      if (aiRes && helpersRes) {
        const filtered = helpersRes.filter((h: HelperProfile) =>
          h.nationality === aiRes.nationality ||
          aiRes.skills.some((s: string) => h.skills.includes(s))
        );
        setMatches(filtered);
      }
    } catch (error) {
      console.error("Match error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">✨ AI Smart Match</h2>
        <p className="text-gray-600 text-xl">Describe your needs in natural language, and AI will find the best match.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-12">
        <textarea
          className="w-full p-6 text-xl border-2 border-blue-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition"
          rows={3}
          placeholder="e.g. I need a Filipino helper who can cook Chinese food and take care of a toddler, preferably finished contract..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleMatch}
            disabled={isLoading || !query}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-full text-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'AI Analyzing...' : 'Start Matching Now'}
          </button>
        </div>
      </div>

      {aiResult && (
        <div className="animate-fadeIn space-y-12">
          <div className="bg-pink-50 border border-pink-100 p-8 rounded-3xl">
            <h3 className="text-pink-900 font-bold text-xl mb-4 flex items-center gap-2">
              <span>🤖</span> AI Analysis & Suggestion
            </h3>
            <p className="text-pink-800 text-lg mb-6 leading-relaxed">{aiResult.summary}</p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white px-4 py-2 rounded-xl text-pink-600 border border-pink-200 text-sm font-bold">
                Target Nationality: {aiResult.nationality}
              </div>
              <div className="bg-white px-4 py-2 rounded-xl text-pink-600 border border-pink-200 text-sm font-bold">
                Experience Requirement: {aiResult.experience}
              </div>
              {aiResult.skills.map((s: string) => (
                <div key={s} className="bg-white px-4 py-2 rounded-xl text-gray-600 border border-gray-200 text-sm">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-8">Candidates we found for you ({matches.length})</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {matches.map(helper => (
                <div key={helper.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:-translate-y-1 transition duration-300">
                  <div className="relative h-56">
                    <img src={helper.imageUrl} alt={helper.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      95% Match
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-2">{helper.name}</h4>
                    <p className="text-gray-600 text-sm mb-4">{helper.description}</p>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                      Contact for Interview
                    </button>
                  </div>
                </div>
              ))}
              {matches.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500">
                  No perfect matches found. Try adjusting your requirements.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMatchView;
