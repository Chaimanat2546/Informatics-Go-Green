'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CO2ReductionChart from "@/components/wasteTracking/CO2ReductionChart"
import RecentWasteList from "@/components/wasteTracking/RecentWasteList"
import SummaryCards from "@/components/wasteTracking/SummaryCards"
import WasteStackedBarChart from "@/components/wasteTracking/WasteStackedBarChart"

export default function DashboardOverviewPage() {
    return <>
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold flex items-center gap-2">
                        ภาพรวมทั้งหมด
                    </h1>
                </div>
                <div className="flex gap-2 w-[30%] h-full bg-white">
                    <Select>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="วัน/เดือน/ปี" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">รายวัน</SelectItem>
                            <SelectItem value="dark">รายเดือน</SelectItem>
                            <SelectItem value="system">รายปี</SelectItem>
                        </SelectContent>
                    </Select>

                </div>
            </div>
            <div className="w-full">
                <SummaryCards />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
                <div className="lg:col-span-5 h-full">
                    <CO2ReductionChart />
                </div>
                <div className="lg:col-span-3 h-full">
                    <RecentWasteList />
                </div>
            </div>
            <WasteStackedBarChart/>
        </div>
    </>
}