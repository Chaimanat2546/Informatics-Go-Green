"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

const chartConfig = {
  plastic: { label: "พลาสติก", color: "#4ADE80" }, 
  paper: { label: "กระดาษ", color: "#FDE047" },   
  glass: { label: "แก้ว", color: "#93C5FD" },      
  metal: { label: "โลหะ", color: "#D1D5DB" },     
  steel: { label: "เหล็ก", color: "#EF4444" },     
  other: { label: "อื่นๆ", color: "#D8B4FE" },      
} satisfies ChartConfig

export default function WasteStackedBarChart() {
  const [isMounted, setIsMounted] = useState(false)
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsMounted(true)

    const fetchChartData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/waste/waste-weight-categories");
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching waste chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [])

  return (
    <Card className="w-full h-full shadow-sm border border-gray-100 rounded-[20px] p-6">
      <CardHeader className="p-0 pb-6">
        <CardTitle className="text-xl font-bold text-gray-900">
          รายงานปริมาณขยะที่คัดแยก (6 เดือนล่าสุด)
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {!isMounted || isLoading ? (
            <div className="h-[350px] w-full bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400">
                กำลังโหลดข้อมูล...
            </div>
        ) : (
            <ChartContainer config={chartConfig} className="min-h-[350px] text-md w-full">
                <BarChart 
                    accessibilityLayer 
                    data={chartData}  
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                    
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value}
                        className="text-gray-400 text-sm font-medium"
                    />
                    
                    <ChartTooltip 
                        cursor={false} 
                        content={<ChartTooltipContent indicator="dashed" />} 
                    />

                    <ChartLegend content={<ChartLegendContent />} className="mt-4" />

                    <Bar dataKey="plastic" stackId="a" fill="var(--color-plastic)" radius={[0, 0, 4, 4]} barSize={60}  />
                    <Bar dataKey="paper" stackId="a" fill="var(--color-paper)" barSize={60} />
                    <Bar dataKey="glass" stackId="a" fill="var(--color-glass)" barSize={60} />
                    <Bar dataKey="metal" stackId="a" fill="var(--color-metal)" barSize={60} />
                    <Bar dataKey="steel" stackId="a" fill="var(--color-steel)" barSize={60} />
                    
                    <Bar dataKey="other" stackId="a" fill="var(--color-other)" radius={[4, 4, 0, 0]} barSize={60} />
                    
                </BarChart>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}