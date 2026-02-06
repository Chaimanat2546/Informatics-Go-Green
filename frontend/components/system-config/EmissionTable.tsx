import { MoreHorizontal } from 'lucide-react';

interface RowData {
  name: string;
  category: string;
  emissionFactor: string;
}

export const EmissionTable = ({ data }: { data: RowData[] }) => (
  <div className="overflow-x-auto border border-gray-100 rounded-lg">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
          <th className="py-4 px-6 font-medium cursor-pointer hover:text-gray-600">Name ↑↓</th>
          <th className="py-4 px-6 font-medium cursor-pointer hover:text-gray-600">Category ↑↓</th>
          <th className="py-4 px-6 font-medium text-center cursor-pointer hover:text-gray-600">Emission Factors ↑↓</th>
          <th className="py-4 px-6"></th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <td className="py-4 px-6 text-gray-700 text-sm">{item.name}</td>
            <td className="py-4 px-6 text-gray-600 text-sm">{item.category}</td>
            <td className="py-4 px-6 text-center font-bold text-gray-800">{item.emissionFactor}</td>
            <td className="py-4 px-6 text-right">
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreHorizontal size={20} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);