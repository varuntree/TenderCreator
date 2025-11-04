'use client';

import { CheckSquare, List, PlusSquare, ShieldCheck, Users } from 'lucide-react';

type Criterion = {
  name: string;
  weight: number;
  rating: number;
  maxRating: number;
};

const criteria: Criterion[] = [
  { name: 'Technical capability', weight: 30, rating: 4, maxRating: 5 },
  { name: 'Methodology & approach', weight: 25, rating: 4, maxRating: 5 },
  { name: 'Risk & WHS management', weight: 20, rating: 3, maxRating: 5 },
  { name: 'Value for money', weight: 15, rating: 3, maxRating: 5 },
  { name: 'Local content & workforce', weight: 10, rating: 4, maxRating: 5 },
];

const projectedScore = 76;

export function EvaluationScorePredictorPreview() {
  return (
    <div className="relative w-full bg-gradient-to-br from-[#F8F8F4] to-white p-4 sm:p-6 md:p-8 overflow-hidden">
      {/* Top Section: Title + Projected Score */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Evaluation Score Predictor
          </h1>
          <p className="text-sm sm:text-base text-gray-700 mt-1">
            See how your draft might score—before you submit.
          </p>
        </div>
        <div className="flex-shrink-0 bg-white rounded-xl shadow-md border border-gray-100 px-4 py-3">
          <p className="text-xs font-medium text-gray-700">Projected score</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {projectedScore}
            <span className="text-2xl text-gray-500">/100</span>
          </p>
        </div>
      </div>

      {/* Bottom Section: Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Gauge + Recommendations */}
        <div className="space-y-6">
          {/* Gauge Chart */}
          <div className="flex justify-center w-full overflow-hidden">
            <div className="w-full max-w-[280px]">
              <svg className="w-full h-auto" viewBox="0 0 200 110" preserveAspectRatio="xMidYMid meet">
                {/* Background Arc */}
                <path
                  d="M 10 90 A 90 90 0 0 1 190 90"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* Orange segment */}
                <path
                  d="M 10 90 A 90 90 0 0 1 40.92 14.86"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* Yellow segment */}
                <path
                  d="M 40.92 14.86 A 90 90 0 0 1 159.08 14.86"
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* Green segment */}
                <path
                  d="M 159.08 14.86 A 90 90 0 0 1 190 90"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* Score Text */}
                <text
                  x="100"
                  y="75"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#303030"
                  className="font-bold"
                  style={{ fontSize: '3rem' }}
                >
                  {projectedScore}
                </text>
              </svg>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Recommendations
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <CheckSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Strengthen WHS plan</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <PlusSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Add pricing breakdown</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Include 3 referees</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <List className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Expand case studies</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Weighted Criteria */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Weighted criteria
          </h2>

          {/* Criteria List */}
          <div className="space-y-4 text-sm">
            {criteria.map((criterion) => (
              <div key={criterion.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-gray-900 truncate">
                      {criterion.name}
                    </span>
                    <span className="text-gray-600 ml-2 flex-shrink-0 text-xs">
                      {criterion.weight}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#16A34A] h-2 rounded-full transition-all"
                        style={{
                          width: `${(criterion.rating / criterion.maxRating) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="font-medium text-gray-700 text-xs flex-shrink-0">
                      {criterion.rating}/{criterion.maxRating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Logo */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
            <ShieldCheck className="w-4 h-4 text-[#008F6B]" />
            <span className="font-bold text-gray-700 text-sm">TenderCreator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
