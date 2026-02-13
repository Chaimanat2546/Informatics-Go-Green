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

// 1. กำหนด Interface ของข้อมูลที่จะรับเข้ามา
interface ChartData {
  time_label: string;
  carbon_value: number;
}

interface WasteBarChartProps {
  data: ChartData[];
  type: string; 
}

const chartConfig = {
  carbon_value: {
    label: "Carbon Footprint",
    color: "#5EA500",
  },
} satisfies ChartConfig

export default function WasteBarChart({ data, type }: WasteBarChartProps) {
  
  const getTitle = () => {
    if (type === 'daily') return 'ช่วยลด Carbon Footprint (รายวัน)';
    if (type === 'monthly') return 'ช่วยลด Carbon Footprint (รายเดือน)';
    return 'ช่วยลด Carbon Footprint (รายปี)';
  };

  return (
    <Card className="flex flex-col shadow-lg m-6 border-gray-50 rounded-[16px]">
      <CardHeader className="items-center">
        <CardTitle className="text-xl font-bold text-gray-900">
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {data && data.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={data} 
              margin={{
                top: 35,
                left: 0,
                right: 0,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
              
              <XAxis
                dataKey="time_label" 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => {
                   return value; 
                }}
                className="text-gray-400 font-medium text-sm"
                padding={{ left: 10, right: 10 }}
              />
              
              <ChartTooltip
                cursor={{ fill: 'transparent' }}
                content={<ChartTooltipContent hideLabel />}
              />
              
              <Bar 
                dataKey="carbon_value" 
                fill="var(--color-carbon_value)" 
                radius={[8, 8, 8, 8]} 
                barSize={40} 
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-gray-700 font-medium text-sm"
                  fontSize={12}
                  formatter={(value: number) => value > 0 ? value.toFixed(1) : ''} 
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-400">
            ไม่มีข้อมูลในช่วงเวลานี้
          </div>
        )}
      </CardContent>
    </Card>
  )
}