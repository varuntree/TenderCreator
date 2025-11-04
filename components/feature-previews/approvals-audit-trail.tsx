'use client';

import { ShieldCheck } from 'lucide-react';

type Section = {
  name: string;
  owner: string;
  due: string;
  status: 'Reviewed' | 'Needs review';
};

type TimelineItem = {
  id: string;
  initials: string;
  role: string;
  color: string;
  dueDay: string;
  dueDate: string;
};

const sections: Section[] = [
  { name: 'Executive Summary', owner: 'Sarah', due: 'Mon 4 Nov', status: 'Reviewed' },
  { name: 'Technical Capability', owner: 'Michael', due: 'Wed 6 Nov', status: 'Reviewed' },
  { name: 'Methodology & Approach', owner: 'Sarah', due: 'Fri 8 Nov', status: 'Needs review' },
  { name: 'Pricing Schedule', owner: 'James', due: 'Mon 11 Nov', status: 'Needs review' },
];

const timeline: TimelineItem[] = [
  { id: '1', initials: 'SC', role: 'Bid Owner', color: '#6495ED', dueDay: 'Due Mon', dueDate: '4 Nov' },
  { id: '2', initials: 'MT', role: 'Tech Writer', color: '#9370DB', dueDay: 'Wed 6', dueDate: 'Nov' },
  { id: '3', initials: 'JK', role: 'Reviewer', color: '#DB7093', dueDay: 'Fri 8', dueDate: 'Nov' },
  { id: '4', initials: 'DH', role: 'Approver', color: '#A9A9A9', dueDay: 'Mon 11', dueDate: 'Nov' },
];

export function ApprovalsAuditTrailPreview() {
  return (
    <div className="relative w-full bg-gradient-to-br from-[#F8F8F4] to-white p-4 sm:p-6 md:p-8 overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Approvals & Audit Trail
          </h1>
          <p className="text-sm sm:text-base text-gray-700 mt-1">
            Assign reviewers, track changes, stay compliant.
          </p>
        </div>
        <span className="flex-shrink-0 bg-[#E6F4F0] text-[#008F6B] text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full">
          Policy compliant
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Section Table */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Section</h2>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-gray-900">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="py-3 px-2 text-left font-bold">Section</th>
                  <th className="py-3 px-2 text-left font-bold">Owner</th>
                  <th className="py-3 px-2 text-left font-bold">Due</th>
                  <th className="py-3 px-2 text-left font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section, index) => (
                  <tr key={section.name} className={index < sections.length - 1 ? 'border-b border-gray-200' : ''}>
                    <td className="py-4 px-2 font-medium">{section.name}</td>
                    <td className="py-4 px-2">{section.owner}</td>
                    <td className="py-4 px-2">{section.due}</td>
                    <td className="py-4 px-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          section.status === 'Reviewed'
                            ? 'bg-[#E6F4F0] text-[#008F6B]'
                            : 'bg-[#FFFBEB] text-[#B45309]'
                        }`}
                      >
                        {section.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-4 lg:hidden">
            {sections.map((section) => (
              <div key={section.name} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-gray-900">{section.name}</span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      section.status === 'Reviewed'
                        ? 'bg-[#E6F4F0] text-[#008F6B]'
                        : 'bg-[#FFFBEB] text-[#B45309]'
                    }`}
                  >
                    {section.status}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <p>
                    <span className="text-gray-400 w-16 inline-block">Owner:</span> {section.owner}
                  </p>
                  <p>
                    <span className="text-gray-400 w-16 inline-block">Due:</span> {section.due}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Audit Trail */}
        <div className="lg:col-span-1">
          <div className="relative pl-12 mt-6 lg:mt-10">
            {/* Dotted Vertical Line */}
            <div className="absolute left-5 top-2 bottom-2 w-0 border-l-2 border-dotted border-gray-300"></div>

            {/* Timeline Items */}
            <div className="space-y-8 relative">
              {timeline.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="absolute -left-12 top-0 bg-white p-0.5 rounded-full">
                    <span
                      className="w-10 h-10 flex items-center justify-center text-white font-bold rounded-full text-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.initials}
                    </span>
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{item.role}</p>
                      <p className="text-sm text-gray-600">Due</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{item.dueDay}</p>
                      <p className="text-sm text-gray-500">{item.dueDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#008F6B]" />
          <span className="font-bold text-gray-700">TenderCreator</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>v.1.0</span>
          <span>v.1.2</span>
          <span>by Sarah, 9:15am</span>
        </div>
        <div>
          <span>v.1.3 by Michael, 2:30pm</span>
        </div>
      </div>
    </div>
  );
}
