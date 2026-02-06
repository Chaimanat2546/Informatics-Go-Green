"use client";

import { Plus } from 'lucide-react';
import { SearchInput } from '@/components/system-config/SearchInputEF';
import { EmissionTable } from '@/components/system-config/EmissionTable';

export default function EmissionFactorPage() {
  const mockData = Array(9).fill({
    name: 'ขวดพลาสติก PET ใส',
    category: 'PET',
    emissionFactor: '2.1500',
  });

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">รายการค่าสัมประสิทธิ์</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <SearchInput placeholder="ค้นหาชื่อค่าสัมประสิทธิ์" />
        
        <button className="bg-[#68a005] hover:bg-[#5a8a04] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm active:scale-95">
          <Plus size={20} />
          เพิ่มค่าสัมประสิทธิ์
        </button>
      </div>

      <EmissionTable data={mockData} />

      {/* Footer / Pagination */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-500 border-t pt-4">
        <p>0 of 9 row(s) of ... entries</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50">Previous</button>
          <button className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}