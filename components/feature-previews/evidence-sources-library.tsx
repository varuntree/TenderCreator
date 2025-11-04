'use client';

import { Check, Contact, FileStack, FileText, Search } from 'lucide-react';

type LibraryItem = {
  id: string;
  icon: typeof FileText;
  title: string;
  type: string;
  citedCount: number;
  usedIn?: string[];
};

const libraryItems: LibraryItem[] = [
  {
    id: 'iso-9001',
    icon: FileText,
    title: 'ISO 9001:2015 Certificate',
    type: 'Certification',
    citedCount: 8,
  },
  {
    id: 'uni-facilities',
    icon: FileStack,
    title: 'Case Study: University Facilities',
    type: 'Case Study',
    citedCount: 14,
    usedIn: ['Technical Capability S2.1', 'Past Performance Q4', 'Project Team A3', 'References Schedule B'],
  },
  {
    id: 'whs-plan',
    icon: FileText,
    title: 'WHS Management Plan 2025',
    type: 'Policy',
    citedCount: 6,
  },
  {
    id: 'cv-sarah',
    icon: Contact,
    title: 'CV: Sarah Chen (Project Director)',
    type: 'CV',
    citedCount: 5,
  },
];

export function EvidenceSourcesLibraryPreview() {
  return (
    <div className="relative w-full bg-gradient-to-br from-[#F8F8F4] to-white p-6 sm:p-8 md:p-10">
      {/* Traceability Tag */}
      <div className="absolute -top-3 right-4 sm:right-8 bg-white rounded-lg px-3 py-1.5 shadow-lg border border-gray-100">
        <span className="text-xs sm:text-sm font-semibold text-gray-900">
          Traceability · Compliance
        </span>
      </div>

      {/* Search Bar */}
      <div className="mb-8 relative mt-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search certificates, case studies, policies, CVs..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#EAEAEA] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008F6B] text-sm sm:text-base placeholder:text-gray-500"
        />
      </div>

      {/* Library Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {libraryItems.map((item) => {
          const IconComponent = item.icon;
          const hasPopover = item.id === 'uni-facilities';

          return (
            <div
              key={item.id}
              className={`relative bg-white rounded-xl p-4 flex items-start space-x-4 shadow-sm ${hasPopover ? 'group' : ''}`}
            >
              <div className="p-2 bg-[#D6E8E3] rounded-lg shrink-0">
                <IconComponent className="w-6 h-6 text-[#008F6B]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {item.title}
                </p>
                <p className="text-sm text-gray-600 mb-2">{item.type}</p>
                <span className="inline-flex items-center gap-1 bg-[#D6E8E3] border border-[#A3E6D3] text-[#008F6B] rounded-full px-2 py-0.5 text-xs font-medium">
                  Cited {item.citedCount} places
                </span>
              </div>

              {/* Popover for Rail Upgrade item */}
              {hasPopover && item.usedIn && (
                <div className="absolute right-0 top-1/2 translate-x-[calc(100%+0.75rem)] -translate-y-1/2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none md:pointer-events-auto z-10">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Used in:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {item.usedIn.map((place) => (
                      <li key={place} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#008F6B] shrink-0" />
                        <span>{place}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
