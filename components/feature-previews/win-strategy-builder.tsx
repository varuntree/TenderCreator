'use client';

import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Users,
} from 'lucide-react';

type BuyerPain = {
  label: string;
  weight: string;
  progress: number;
};

const buyerPains: BuyerPain[] = [
  { label: 'Technical capability & experience', weight: '30%', progress: 85 },
  { label: 'Risk management & WHS', weight: '25%', progress: 78 },
  { label: 'Innovation & sustainability', weight: '20%', progress: 65 },
  { label: 'Value for money', weight: '25%', progress: 55 },
];

export function WinStrategyBuilderPreview() {
  return (
    <div className="relative w-full bg-gradient-to-br from-[#F8F8F4] to-white p-6 sm:p-8 md:p-10">
      {/* Impact Score Tag */}
      <div className="absolute -top-3 right-4 sm:right-8 bg-white rounded-lg px-3 py-1.5 shadow-lg border border-gray-100">
        <span className="text-xs sm:text-sm font-semibold text-gray-900">
          Impact on score: <span className="text-[#008F6B]">+12% (est.)</span>
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mt-4">
        {/* Left Column: Buyer Pains */}
        <section>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Buyer Pains & Weights{' '}
            <span className="text-base text-gray-500 font-normal">(Evaluation)</span>
          </h3>

          <div className="mt-6 space-y-6">
            {buyerPains.map((pain) => (
              <div key={pain.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {pain.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">
                    {pain.weight}
                  </span>
                </div>
                <div className="w-full bg-[#D6E8E3] rounded-full h-2.5">
                  <div
                    className="bg-[#008F6B] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${pain.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Win Themes */}
        <section className="md:pl-8 md:border-l md:border-gray-200">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
            Auto-generated Win Themes
          </h3>

          <div className="space-y-6">
            {/* Theme 1: Proven Track Record */}
            <div>
              <h4 className="text-base font-semibold text-gray-900">
                Proven capability in complex government projects
              </h4>
              <p className="text-gray-600 text-sm mt-1 mb-3">
                15+ years delivering similar contracts for state agencies
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#F1F1EC] text-gray-700 rounded-full px-3 py-1.5 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#008F6B]" />
                  ISO 9001:2015
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#F1F1EC] text-gray-700 rounded-full px-3 py-1.5 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  98% on-time
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#F1F1EC] text-gray-700 rounded-full px-3 py-1.5 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  23 contracts
                </span>
              </div>
            </div>

            {/* Theme 2: Safety-First Innovation */}
            <div>
              <h4 className="text-base font-semibold text-gray-900">
                Safety-first innovation driving sustainability
              </h4>
              <p className="text-gray-600 text-sm mt-1 mb-3">
                Zero harm culture with measurable carbon reduction outcomes
              </p>
              <div className="grid grid-cols-2 gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#F1F1EC] text-gray-700 rounded-full px-3 py-1.5 text-xs font-medium">
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  Carbon neutral &apos;24
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#F1F1EC] text-gray-700 rounded-full px-3 py-1.5 text-xs font-medium">
                  <Users className="w-3.5 h-3.5 text-gray-500" />
                  Zero LTI 36mo
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#F1F1EC] text-gray-700 rounded-full px-3 py-1.5 text-xs font-medium">
                  <CalendarCheck className="w-3.5 h-3.5 text-gray-500" />
                  NABERS 5 Star
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#F1F1EC] text-gray-700 rounded-full px-3 py-1.5 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                  ISO 45001
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
