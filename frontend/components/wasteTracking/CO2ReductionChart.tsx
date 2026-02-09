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

const chartData = [
  { month: "Jan", co2: 90 },
  { month: "Feb", co2: 330 },
  { month: "Mar", co2: 150 },
  { month: "Apr", co2: 350 },
  { month: "May", co2: 110 },
  { month: "Jun", co2: 100 },
  { month: "Jul", co2: 360 },
  { month: "Aug", co2: 270 },
  { month: "Sep", co2: 60 },
  { month: "Oct", co2: 220 },
  { month: "Nov", co2: 110 },
  { month: "Dec", co2: 360 },
]

const chartConfig = {
  co2: {
    label: "CO2 (kg)",
    color: "#5EA500", 
  },
} satisfies ChartConfig

export default function CO2ReductionChart() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  return (
    <Card className="w-full h-full shadow-sm border border-gray-100 rounded-[20px] p-6">
      <CardHeader className="p-0 pb-6">
        <CardTitle className="text-xl font-bold text-gray-900">การลด CO2 รายเดือน</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!isMounted ? (
            <div className="h-[300px] w-full  bg-gray-50 rounded-xl animate-pulse" />
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