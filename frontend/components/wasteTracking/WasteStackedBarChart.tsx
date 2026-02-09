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

const chartData = [
  { month: "Jan", plastic: 80, paper: 30, glass: 20, metal: 10, steel: 15, other: 15 },
  { month: "Feb", plastic: 75, paper: 25, glass: 15, metal: 5, steel: 10, other: 15 },
  { month: "Mar", plastic: 70, paper: 20, glass: 10, metal: 10, steel: 0, other: 0 },
  { month: "Apr", plastic: 40, paper: 0, glass: 0, metal: 0, steel: 0, other: 0 },
  { month: "May", plastic: 85, paper: 35, glass: 25, metal: 0, steel: 15, other: 0 },
  { month: "Jun", plastic: 120, paper: 0, glass: 0, metal: 10, steel: 10, other: 30 },
]

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
  useEffect(() => setIsMounted(true), [])

  return (
    <Card className="w-full h-full shadow-sm border border-gray-100 rounded-[20px] p-6">
      <CardHeader className="p-0 pb-6">
        <CardTitle className="text-xl font-bold text-gray-900">
          รายงานปริมาณขยะที่คัดแยก (6 เดือนล่าสุด)
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {!isMounted ? (
            <div className="h-[350px] w-full bg-gray-50 rounded-xl animate-pulse" />
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

                    <Bar dataKey="plastic" stackId="a" fill="var(--color-plastic)" radius={[0, 0, 4, 4]} barSize={150}  />
                    <Bar dataKey="paper" stackId="a" fill="var(--color-paper)" />
                    <Bar dataKey="glass" stackId="a" fill="var(--color-glass)" />
                    <Bar dataKey="metal" stackId="a" fill="var(--color-metal)" />
                    <Bar dataKey="steel" stackId="a" fill="var(--color-steel)" />
                    
                    <Bar dataKey="other" stackId="a" fill="var(--color-other)" radius={[4, 4, 0, 0]} />
                    
                </BarChart>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}