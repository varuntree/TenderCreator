'use client';

import { AlertTriangle, Banknote, ChevronDown, Menu } from 'lucide-react';

type TableRow = {
  id: string;
  item: string;
  description: string;
  qty: number | string;
  unit: string;
  unitRate: number | string;
  amount: number | string;
  warning?: string;
  error?: string;
};

const rows: TableRow[] = [
  {
    id: '1',
    item: '1.1',
    description: 'Project management services',
    qty: 12,
    unit: 'months',
    unitRate: 18500,
    amount: '222,000',
  },
  {
    id: '2',
    item: '1.2',
    description: 'Technical consultant (senior)',
    qty: 240,
    unit: 'hours',
    unitRate: '',
    amount: '',
    warning: 'Missing unit rate',
  },
  {
    id: '3',
    item: '1.3',
    description: 'Site safety equipment',
    qty: 45,
    unit: 'set',
    unitRate: 'Invalid unit',
    amount: 8250,
    error: 'Invalid unit',
  },
  {
    id: '4',
    item: '1.4',
    description: 'Contingency allowance',
    qty: '—',
    unit: '',
    unitRate: '',
    amount: '35,000',
  },
];

export function PricingScheduleAssistantPreview() {
  return (
    <div className="relative w-full bg-gradient-to-br from-[#F8F8F4] to-white p-6 sm:p-8 md:p-10">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-gray-200">
        {/* Formula Input */}
        <div className="w-full md:w-auto bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 shadow-sm">
          <span className="text-gray-400 font-mono">=</span>
          <span className="font-mono ml-2 text-sm">Qty = Qty * Unit rate</span>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
            <span>Template: BOQ (Govt)</span>
            <Banknote className="w-5 h-5 text-gray-500" />
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-gray-900">
          <thead className="border-b-2 border-gray-200">
            <tr>
              <th className="py-3 px-2 text-left font-bold">Item</th>
              <th className="py-3 px-2 text-left font-bold">Description</th>
              <th className="py-3 px-2 text-right font-bold">Qty</th>
              <th className="py-3 px-2 text-left font-bold">Unit</th>
              <th className="py-3 px-2 text-right font-bold">Unit rate</th>
              <th className="py-3 px-2 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-200">
                <td className="py-4 px-2">{row.item}</td>
                <td className="py-4 px-2 font-medium">{row.description}</td>
                <td className="py-4 px-2 text-right">{row.qty}</td>
                <td className="py-4 px-2">
                  {row.unit && (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: row.unit.replace('³', '<sup>3</sup>'),
                      }}
                    />
                  )}
                </td>
                <td className="py-4 px-2 text-right">
                  {row.warning ? (
                    <span className="flex items-center justify-end gap-2 text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                      {row.warning}
                    </span>
                  ) : row.error ? (
                    <span className="text-red-600">{row.error}</span>
                  ) : (
                    row.unitRate
                  )}
                </td>
                <td className="py-4 px-2 text-right">
                  {row.warning ? (
                    <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                      Resolve
                    </span>
                  ) : (
                    row.amount
                  )}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="border-t-2 border-gray-200">
              <td className="py-4 px-2 font-bold text-lg">Total</td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2 text-right font-bold text-lg">$465,250</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile List View (Hidden on md and up) */}
      <div className="space-y-4 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`bg-white rounded-lg shadow-sm p-4 border ${
              row.warning ? 'border-yellow-300' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-gray-900">
                {row.item} {row.description}
              </span>
              {row.warning ? (
                <span className="text-blue-600 font-medium cursor-pointer hover:underline text-sm">
                  Resolve
                </span>
              ) : (
                <span className="font-bold text-gray-900">{row.amount}</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-gray-400">Qty</div>
                <div className="text-gray-700">{row.qty}</div>
              </div>
              <div>
                <div className="text-gray-400">Unit</div>
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: row.unit.replace('³', '<sup>3</sup>'),
                  }}
                />
              </div>
              <div>
                <div className="text-gray-400">Unit rate</div>
                {row.warning ? (
                  <div className="text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Missing
                  </div>
                ) : row.error ? (
                  <div className="text-red-600">Invalid</div>
                ) : (
                  <div className="text-gray-700">{row.unitRate}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Total Card */}
        <div className="bg-white rounded-lg p-4 mt-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-gray-900">Total</span>
            <span className="font-bold text-lg text-gray-900">$465,250</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
        <span className="text-sm text-gray-500 text-center md:text-left">
          Changes auto-saved; validations run in real-time.
        </span>
        <button className="w-full md:w-auto bg-[#008F6B] text-white font-medium px-5 py-2.5 rounded-lg hover:bg-[#0F5C4B] transition-colors">
          Export XLSX
        </button>
      </div>
    </div>
  );
}
