import { Badge } from "@/components/ui/badge"
import { HistoryItem } from "@/interfaces/HistoryItem";
import { useEffect, useState } from "react";


export default function RecentWasteList() {

  const [activities, setActivities] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchRecentWaste = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/waste/history/all?page=1&limit=5');
        const json = await res.json();

        if (json.data) {
          setActivities(json.data);
        }
      } catch (error) {
        console.error("Error fetching recent waste:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentWaste();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'พลาสติก': return "bg-green-100 text-green-700";
      case 'โลหะ':
      case 'เหล็ก': return "bg-gray-100 text-gray-700";
      case 'กระดาษ': return "bg-yellow-100 text-yellow-700";
      case 'แก้ว': return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const formatThaiDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-full overflow-hidden flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-gray-900">รายการคัดแยกล่าสุด</h2>

      <div className="space-y-6  pr-2">
        {loading ? (
          <p className="text-center text-gray-500 text-sm py-4 animate-pulse">กำลังโหลดข้อมูล...</p>
        ) : activities.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">ยังไม่มีรายการคัดแยก</p>
        ) : (
          activities.map((item) => (
            <div key={item.id} className="flex justify-between items-start border-b border-gray-50 last:border-0 last:pb-0">
              <div>
                <p className="font-semibold text-gray-900 text-md ">{item.name_waste}</p>
                <p className="text-gray-500 text-md truncate max-w-[150px]">
                  {item.user_name || 'ไม่ทราบชื่อผู้ใช้'}
                </p>
                <p className="text-gray-400 text-sm">{formatThaiDate(item.create_at)}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge className={`${getCategoryColor(item.waste_category)} border-none font-normal px-2 py-0.5 text-sm font-semibold`}>
                  {item.waste_category}
                </Badge>
                <span className="text-md font-semibold text-gray-900">
                  {item.amount} กิโลกรัม
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}