'use client';

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MenuBar from "@/components/wasteTracking/MenuBar";
import { MoveUpRight, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { wasteHistoryData } from "@/data/wasteHistoryData"; 


export default function WasteHistoryPage() {
    const router = useRouter();
    return (
        <>
            <Card className="mx-6 p-6 -mt-10 z-10 relative flex flex-row content-center items-center gap-4 shadow-lg border-none">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex justify-center text-center items-center shrink-0">
                    <TrendingUp size={32} className="text-green-700" strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-gray-500 text-md font-bold uppercase tracking-wider">CARBON CREDIT สะสม</p>
                    <p className="text-3xl font-bold text-green-700 mt-1">141 <span className="text-base font-semibold text-green-700">แต้ม</span></p>
                </div>
            </Card>

            <div className="mt-8 mx-6 pb-26">
                <p className="text-lg font-bold text-gray-800 mb-4">รายการล่าสุด</p>
                
                <div className="flex flex-col gap-3">
                    {wasteHistoryData.slice(0, 3).map((item) => (
                        <Card key={item.id} className="p-4 w-full relative flex flex-col gap-3 border-none shadow-md ring-1 ring-gray-100">
                            
                            <div className="flex flex-row justify-between w-full items-start">
                                <span className={`${item.badgeColor} ${item.textColor} text-sm font-bold px-3 py-1 rounded-full`}>
                                    {item.category}
                                </span>
                                <div className="flex flex-row gap-1 items-center text-lg text-green-600 font-bold">
                                    <p>+{item.points}</p>
                                    <MoveUpRight size={16} strokeWidth={3} />
                                </div>
                            </div>

                            <div>
                                <p className="text-xl font-semibold text-gray-900 leading-tight">{item.title}</p>
                                <p className="text-sm text-gray-700 mt-1">{item.date}</p>
                            </div>

                            <Separator className="bg-gray-100" />

                            <div className="flex flex-row justify-between items-center w-full">
                                <div className="flex flex-row items-baseline gap-2">
                                    <p className="text-md text-gray-800">ปริมาณ</p>
                                    <p className="text-md font-bold text-gray-900">{item.amount}</p>
                                </div>
                                <button onClick={()=>{router.push(`/wasteTracking/wasteHistory/${item.id}`)}} className="text-md text-green-700 font-bold hover:underline cursor-pointer">
                                    ดูรายละเอียด
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
            <MenuBar activeTab="wasteHistory" />
        </>
    );
}