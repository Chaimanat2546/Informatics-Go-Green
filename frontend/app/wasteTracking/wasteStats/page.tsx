'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MenuBar from "@/components/wasteTracking/MenuBar"
import WasteBarChart from "@/components/wasteTracking/WasteBarChart"
import WastePieChart from "@/components/wasteTracking/WastePieChart"
import { BarChart3, Leaf } from "lucide-react"

export default function wasteStatsPage() {
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
                </header>
                <div className="px-6 -mt-16 relative z-10">
                    <div className="bg-white rounded-3xl py-6 px-4 shadow-lg w-full border border-gray-100">

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center">

                            <div className="flex flex-col items-center justify-center gap-1">
                                <p className="text-gray-600 font-semibold text-md sm:text-sm">
                                    Carbon Credit สะสม
                                </p>
                                <span className="text-[#5EA500] text-4xl sm:text-5xl font-bold leading-tight">
                                    101,000
                                </span>
                                <span className="text-gray-500 text-sm font-medium">
                                    แต้ม
                                </span>
                            </div>

                            <div className="w-px bg-gray-200 h-full min-h-[60px] mx-2"></div>

                            <div className="flex flex-col items-center justify-center gap-1">
                                <p className="text-gray-600 font-semibold text-md sm:text-sm">
                                    เทียบเท่าปลูกต้นไม้
                                </p>
                                <span className="text-[#5EA500] text-4xl sm:text-5xl font-bold leading-tight">
                                    234,000
                                </span>
                                <span className="text-gray-500 text-sm font-medium">
                                    ต้น
                                </span>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="mt-6 px-6 w-full flex justify-between items-center gap-3">
                    <WastePieChart/>
                </div>
                    <WasteBarChart/>
                <MenuBar activeTab="wasteStats" />
            </main>
        </>
    )
}