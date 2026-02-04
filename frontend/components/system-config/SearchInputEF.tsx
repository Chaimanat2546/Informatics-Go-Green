import { Search } from 'lucide-react';

export const SearchInput = ({ placeholder }: { placeholder: string }) => (
  <div className="relative w-full max-w-sm">
    {/* เพิ่มไอคอน Search ไว้ด้านซ้าย */}
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-4 w-4 text-gray-400" />
    </div>
    <input
      type="text"
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
    />
  </div>
);