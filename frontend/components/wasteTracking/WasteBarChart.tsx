"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
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
  { month: "Jan", amount: 186 },
  { month: "Feb", amount: 305 },
  { month: "Mar", amount: 237 },
  { month: "Apr", amount: 73 },
  { month: "May", amount: 209 },
  { month: "Jun", amount: 214 },
]

const chartConfig = {
  amount: {
    label: "Carbon Footprint",
    color: "#5EA500",
  },
} satisfies ChartConfig

export default function WasteBarChart() {
  return (
    <Card className="flex flex-col shadow-lg m-6 border-gray-50 rounded-[30px]">
      <CardHeader className="items-center">
        <CardTitle className="text-xl font-bold text-gray-900">
          ช่วยลด Carbon Footprint
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            
            margin={{
              top: 35, 
              left: 0,
              right: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
            
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              className="text-gray-400 font-medium text-sm"
              
              padding={{ left: 0, right: 0 }} 
            />
            
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            
            <Bar 
              dataKey="amount" 
              fill="var(--color-amount)" 
              radius={[8, 8, 8, 8]} 
              barSize={40} 
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-gray-700 font-medium text-sm"
                fontSize={14}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}