'use client';

import { ListFilter } from 'lucide-react';
import { useState } from 'react';

type Answer = {
  id: string;
  title: string;
  tags: string[];
  description: string;
  fitScore: number;
  lastReviewed: string;
};

const answers: Answer[] = [
  {
    id: 'risk-management',
    title: 'Risk Management Framework',
    tags: ['Risk', 'Governance', 'Compliance'],
    description: 'Comprehensive risk identification, mitigation...',
    fitScore: 94,
    lastReviewed: '2 days ago',
  },
  {
    id: 'stakeholder-engagement',
    title: 'Stakeholder Engagement Strategy',
    tags: ['Communication', 'Methodology', 'Governance'],
    description: 'Multi-tiered engagement approach with commu...',
    fitScore: 88,
    lastReviewed: '5 days ago',
  },
];

const CircularProgress = ({ score }: { score: number }) => {
  return (
    <div className="relative w-14 h-14 shrink-0">
      {/* Background circle */}
      <svg className="w-14 h-14 transform -rotate-90">
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke="#D6E8E3"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke="#008F6B"
          strokeWidth="4"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 24}`}
          strokeDashoffset={`${2 * Math.PI * 24 * (1 - score / 100)}`}
          strokeLinecap="round"
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-lg text-gray-900">{score}%</span>
      </div>
    </div>
  );
};

export function AnswerLibraryReusePreview() {
  const [useProfile, setUseProfile] = useState(true);

  return (
    <div className="relative w-full bg-gradient-to-br from-[#F8F8F4] to-white p-6 sm:p-8 md:p-10">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
        {/* Sort Button */}
        <button className="flex items-center gap-2 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ListFilter className="w-4 h-4" />
          <span className="text-sm">Sort: Fit score</span>
        </button>

        {/* Toggle Switch */}
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={useProfile}
              onChange={(e) => setUseProfile(e.target.checked)}
            />
            <div
              className={`block w-10 h-6 rounded-full transition-colors ${
                useProfile ? 'bg-[#008F6B]' : 'bg-gray-300'
              }`}
            />
            <div
              className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                useProfile ? 'transform translate-x-4' : ''
              }`}
            />
          </div>
          <span className="ml-3 text-sm font-medium text-gray-700">
            Use Company Profile
          </span>
        </label>
      </div>

      {/* Answer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {answers.map((answer) => (
          <div
            key={answer.id}
            className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start gap-4">
              {/* Left Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {answer.title}
                </h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2 text-sm text-gray-500">
                  {answer.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{answer.description}</p>
              </div>
              {/* Right Score Circle */}
              <CircularProgress score={answer.fitScore} />
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Last reviewed {answer.lastReviewed}
              </span>
              <button className="bg-[#008F6B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0F5C4B] transition-colors">
                Insert
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
