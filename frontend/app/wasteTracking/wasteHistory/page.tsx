'use client';

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MenuBar from "@/components/wasteTracking/MenuBar";
import { HistoryItem } from "@/interfaces/HistoryItem";
import { MoveUpRight, TrendingUp, Loader2, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WasteHistoryPage() {
    const router = useRouter();
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPoints, setTotalPoints] = useState(0);
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Bangkok'
        });
    };

    const getCategoryStyle = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('พลาสติก') || cat.includes('plastic')) return "bg-yellow-100 text-yellow-700";
        if (cat.includes('แก้ว') || cat.includes('glass')) return "bg-blue-100 text-blue-700";
        if (cat.includes('กระดาษ') || cat.includes('paper')) return "bg-gray-100 text-gray-700";
        if (cat.includes('โลหะ') || cat.includes('metal')) return "bg-red-100 text-red-700";
        return "bg-green-100 text-green-700";
    };

    // mock calculation points
    const calculatePoints = (amount: number, record_type: string) => {
        if (record_type === 'weight_entry' || record_type === 'kg') {
            return Math.floor(amount * 100);
        }
        return Math.floor(amount * 100);
    };

    const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

    useEffect(() => {
        const fetchHistory = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                setLoading(false);
                return;
            }

            try {
                const user = JSON.parse(storedUser);
                const res = await fetch(`${API_URL}/waste/history/user/${user.id}`);

                if (!res.ok) throw new Error("Failed to fetch");

                const data: HistoryItem[] = await res.json();
                setHistoryData(data);

                // คำนวณแต้ม mock
                const total = data.reduce((sum, item) => sum + calculatePoints(item.amount, item.record_type), 0);
                setTotalPoints(total);

            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">กำลังโหลดข้อมูลประวัติ...</p>
                <div className="fixed bottom-0 w-full"><MenuBar activeTab="wasteHistory" /></div>
            </div>
        );
    }

    return (
        <>
            <Card className="mx-6 p-6 -mt-10 z-10 relative flex flex-row content-center items-center gap-4 shadow-lg border-none">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex justify-center text-center items-center shrink-0">
                    <TrendingUp size={32} className="text-green-700" strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-gray-500 text-md font-bold uppercase tracking-wider">CARBON CREDIT สะสม</p>
                    <p className="text-3xl font-bold text-green-700 mt-1">
                        {totalPoints.toLocaleString()} <span className="text-base font-semibold text-green-700">แต้ม</span>
                    </p>
                </div>
            </Card>
            <div className="mt-8 mx-6 pb-26">
                <p className="text-lg font-bold text-gray-800 mb-4">รายการล่าสุด</p>

                {historyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <Inbox size={48} className="text-gray-400 mb-2" />
                        <p>ยังไม่มีประวัติการทิ้งขยะ</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {historyData.slice(0, 3).map((item) => {
                            const points = calculatePoints(item.amount, item.record_type);
                            if (item.wastesid === null) {
                                return (
                                    <Card key={item.id} className="p-4 w-full bg-slate-50 border-dashed border-2 border-slate-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>

                                        <div className="flex flex-row justify-between w-full items-start">
                                            <span className="bg-slate-200 text-slate-600 text-sm font-bold px-2 py-1 rounded">
                                                บันทึกน้ำหนัก
                                            </span>
                                            <div className="flex flex-row gap-1 items-center text-lg text-green-600 font-bold">
                                                <p>+{points}</p>
                                                <MoveUpRight size={16} strokeWidth={3} />
                                            </div>
                                        </div>

                                        <div className="-mt-3">
                                            <p className="text-xl font-bold text-slate-700">{item.material_name}</p>
                                            <p className="text-xs text-gray-400">{formatDate(item.create_at)}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-sm text-gray-600">ปริมาณ:</p>
                                                <p className="text-sm font-bold text-slate-800">{item.amount} กก.</p>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            }

                            return (
                                <Card key={item.id} className="p-4 w-full relative flex flex-col gap-3 border-none shadow-md ring-1 ring-gray-100">
                                    <div className="flex flex-row justify-between w-full items-start">
                                        <span className={`${getCategoryStyle(item.waste_category)} text-sm font-bold px-3 py-1 rounded-full`}>
                                            {item.waste_category}
                                        </span>
                                        <div className="flex flex-row gap-1 items-center text-lg text-green-600 font-bold">
                                            <p>+{points}</p>
                                            <MoveUpRight size={16} strokeWidth={3} />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xl font-semibold text-gray-900 leading-tight">{item.name_waste}</p>
                                        <p className="text-sm text-gray-700 mt-1">{formatDate(item.create_at)}</p>
                                    </div>

                                    <Separator className="bg-gray-100" />

                                    <div className="flex flex-row justify-between items-center w-full">
                                        <div className="flex flex-row items-baseline gap-2">
                                            <p className="text-md text-gray-800">ปริมาณ</p>
                                            <p className="text-md font-bold text-gray-900">
                                                {item.amount} กก. / ชิ้น
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => { router.push(`/wasteTracking/wasteHistory/${item.id}`) }}
                                            className="text-md text-green-700 font-bold hover:underline cursor-pointer"
                                        >
                                            ดูรายละเอียด
                                        </button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
            <MenuBar activeTab="wasteHistory" />
        </>
    );
}