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
} from "@/components/ui/chart"

const chartConfig = {
  co2: {
    label: "CO2 (kg)",
    color: "#5EA500", 
  },
} satisfies ChartConfig

interface CO2ReductionChartProps {
  year?: number; 
}

export default function CO2ReductionChart({ year = new Date().getFullYear() }: CO2ReductionChartProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [chartData, setChartData] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/api/waste/monthly-co2?year=${year}`);
        const data = await res.json();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching CO2 chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [year]);

  return (
    <Card className="w-full h-full shadow-sm border border-gray-100 rounded-[20px] p-6">
      <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-gray-900">
          สรุปการลดการปล่อย CO₂ ตลอดปี {year + 543} 
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {!isMounted || loading ? (
            <div className="h-[300px] w-full bg-gray-50 rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-gray-400">กำลังโหลดข้อมูล...</span>
            </div>
        ) : (
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                    className="text-gray-400 text-sm font-medium"
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="co2" fill="var(--color-co2)" radius={[4, 4, 4, 4]} barSize={42} />
            </BarChart>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}