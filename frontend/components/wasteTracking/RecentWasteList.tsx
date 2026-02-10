import { Badge } from "@/components/ui/badge"

const recentActivities = [
  {
    type: "ขวดพลาสติกใส (PET)",
    user: "Amonpan Noicharoen",
    date: "04/02/2569 12:30:22",
    weight: "10 กิโลกรัม",
    category: "พลาสติก",
    color: "bg-green-100 text-green-700",
  },
  {
    type: "ขวดพลาสติกใส (PET)",
    user: "Wipa Suksan",
    date: "04/02/2569 12:30:22",
    weight: "0.02 กิโลกรัม",
    category: "พลาสติก",
    color: "bg-green-100 text-green-700",
  },
  {
    type: "กระป๋องโค้ก",
    user: "Sudarat Thongdee",
    date: "04/02/2569 12:30:22",
    weight: "0.04 กิโลกรัม",
    category: "โลหะ",
    color: "bg-gray-100 text-gray-700",
  },
  {
    type: "ขวดพลาสติกใส (PET)",
    user: "Ratchanon",
    date: "04/02/2569 12:30:22",
    weight: "0.03 กิโลกรัม",
    category: "พลาสติก",
    color: "bg-green-100 text-green-700",
  },
   {
    type: "ขวดพลาสติกใส (PET)",
    user: "Ratchanon",
    date: "02/02/2569 12:30:22",
    weight: "0.03 กิโลกรัม",
    category: "พลาสติก",
    color: "bg-green-100 text-green-700",
  },
]

export default function RecentWasteList() {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-full">
      <h2 className="text-xl font-bold mb-6 text-gray-900">รายการคัดแยกล่าสุด</h2>
      <div className="space-y-6">
        {recentActivities.map((item, index) => (
          <div key={index} className="flex justify-between items-start border-b border-gray-50  last:border-0 last:pb-0">
            <div>
              <p className="font-semibold text-gray-900 text-md ">{item.type}</p>
              <p className="text-gray-500 text-md ">{item.user}</p>
              <p className="text-gray-400 text-sm">{item.date}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={`${item.color} border-none font-normal px-2 py-0.5 text-sm font-semibold`}>
                {item.category}
              </Badge>
              <span className="text-md font-semibold text-gray-900">{item.weight}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}