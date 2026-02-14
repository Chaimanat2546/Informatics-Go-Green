'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MenuBar from "@/components/wasteTracking/MenuBar"
import WasteBarChart from "@/components/wasteTracking/WasteBarChart"
import WastePieChart from "@/components/wasteTracking/WastePieChart"
import { BarChart3, Leaf, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
interface ChartData {
  time_label: string;
  carbon_value: number;
}
interface ApiDataItem {
    categoryName: string;
    totalWeight: number | string; 
}

interface DashboardStats {
    carbonCredit: string | number; 
    treesSaved: number;
    carbonGraph: ChartData[];
    wastePieChart: ApiDataItem[];
}

export default function WasteStatsPage() {
    const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("daily");
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const today = new Date().toISOString().split('T')[0];
                const response = await fetch(`http://localhost:3001/api/waste/dashboard-stats?type=${period}&date=${today}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [period]); 

    const formatNumber = (num: number | string) => {
        return Number(num).toLocaleString('th-TH', { maximumFractionDigits: 2 });
    };
    return (
        <>
            <main className="min-h-screen bg-[#EAF6F1] overflow-y-auto overflow-x-hidden font-sans">
                <header className="bg-green-600 px-6 pt-10 pb-24 rounded-b-[50px] relative z-0">
                    <div className="flex justify-between items-center">
                        <BarChart3 className="text-white" size={40} strokeWidth={2.5} />
                        <div className=" leading-9 font text-3xl font-semibold text-white">สถิติ</div>
                        <div className="bg-white h-12.5 w-12.5 rounded-2xl flex justify-center items-center">
                            <Leaf className="text-green-700" size={40} strokeWidth={4} />
                        </div>
                    </div>
                    <div className="mt-4 h-11 bg-white rounded-[10px] flex items-center gap-2 px-1 shadow-sm border">
                        <Select value={period} onValueChange={(val: "daily" | "monthly" | "yearly") => setPeriod(val)}>
                            <SelectTrigger className="w-full border-0 focus:ring-0 text-gray-700">
                                <SelectValue placeholder="เลือกช่วงเวลา" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">รายวัน</SelectItem>
                                <SelectItem value="monthly">รายเดือน</SelectItem>
                                <SelectItem value="yearly">รายปี</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </header>
                <div className="px-6 -mt-19 relative z-10">
                    <div className="bg-white rounded-2xl py-6 px-4 shadow-lg w-full border border-gray-100">

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center">

                            <div className="flex flex-col items-center justify-center gap-1">
                                <p className="text-gray-600 font-semibold text-md sm:text-sm whitespace-nowrap">
                                    Carbon Footprint ลดลง
                                </p>
                                {loading ? (
                                    <Loader2 className="animate-spin text-green-500 my-2" />
                                ) : (
                                    <span className="text-[#5EA500] text-3xl sm:text-4xl font-bold leading-tight">
                                        {stats?.carbonCredit ? formatNumber(stats.carbonCredit) : '0'}
                                    </span>
                                )}
                                <span className="text-gray-500 text-sm font-medium">kgCO2e</span>
                            </div>

                            <div className="w-px bg-gray-200 h-full min-h-[60px] mx-2"></div>

                            <div className="flex flex-col items-center justify-center gap-1">
                                <p className="text-gray-600 font-semibold text-md sm:text-sm whitespace-nowrap">
                                    เทียบเท่าปลูกต้นไม้
                                </p>
                                {loading ? (
                                    <Loader2 className="animate-spin text-green-500 my-2" />
                                ) : (
                                    <span className="text-[#5EA500] text-3xl sm:text-4xl font-bold leading-tight">
                                        {stats?.treesSaved ? formatNumber(stats.treesSaved) : '0'}
                                    </span>
                                )}
                                <span className="text-gray-500 text-sm font-medium">ต้น</span>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="mt-6 px-6 w-full flex justify-between items-center gap-3">
                    <WastePieChart data={stats?.wastePieChart || []} />
                </div>
                <WasteBarChart
                    data={stats?.carbonGraph || []}
                    type={period}
                />
                <MenuBar activeTab="wasteStats" />
            </main>
        </>
    )
}