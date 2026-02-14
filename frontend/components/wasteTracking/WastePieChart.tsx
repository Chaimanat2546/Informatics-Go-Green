'use client'

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';

interface ApiDataItem {
    categoryName: string;
    totalWeight: number | string; 
}

interface ChartDataItem {
    name: string;
    value: number;
    color: string;
}

interface WastePieChartProps {
    data: ApiDataItem[];
}

const getCategoryColor = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('พลาสติก')) return '#4ADE80'; 
    if (name.includes('กระดาษ')) return '#FDE047';  
    if (name.includes('แก้ว')) return '#93C5FD';   
    if (name.includes('เหล็ก')) return '#EF4444';  
    if (name.includes('โลหะ') || name.includes('อลูมิเนียม')) return '#CBD5E1'; 
    if (name.includes('อินทรีย์') || name.includes('อาหาร')) return '#A3E635'; 
    if (name.includes('อันตราย')) return '#F87171'; 
    return '#D8B4FE'; 
};

interface ActiveShapeProps extends PieSectorDataItem {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
    payload?: ChartDataItem;
}

const renderActiveShape = (props: unknown) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props as ActiveShapeProps;
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                className="drop-shadow-md transition-all duration-300 outline-none focus:outline-none ring-0 focus:ring-0"
                style={{ outline: 'none', boxShadow: 'none' }}
                tabIndex={-1}
            />
        </g>
    );
};
interface CustomTooltipProps {
    active?: boolean;
    payload?: {
        payload: ChartDataItem;
    }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></span>
                <span className="text-gray-800 font-medium text-sm">
                    {data.name} <span className="font-bold text-black">{data.value.toLocaleString()} kg</span>
                </span>
            </div>
        );
    }
    return null;
};

export default function WastePieChart({ data = [] }: WastePieChartProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const chartData: ChartDataItem[] = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        return data.map((item) => ({
            name: item.categoryName,
            value: Number(item.totalWeight), 
            color: getCategoryColor(item.categoryName),
        })).filter(item => item.value > 0); 
    }, [data]);

    const totalWeight = useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.value, 0);
    }, [chartData]);

    const onPieEnter = (_: unknown, index: number) => {
        setActiveIndex(index);
    };

    if (chartData.length === 0) {
        return (
            <div className="bg-white rounded-[16px] p-6 shadow-lg border border-gray-50 w-full flex flex-col items-center justify-center min-h-[300px]">
                <h2 className="text-xl font-bold mb-4 text-gray-900 self-start">ขยะที่คัดแยกทั้งหมด</h2>
                <div className="text-gray-400 text-sm">ไม่มีข้อมูลในช่วงเวลานี้</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[16px] p-6 shadow-lg border border-gray-50 relative w-full ">
            <style>{`
                .recharts-wrapper:focus,
                .recharts-surface:focus,
                .recharts-layer:focus {
                    outline: none !important;
                }
            `}</style>
            <h2 className="text-xl font-bold mb-4 text-gray-900">ขยะที่คัดแยกทั้งหมด</h2>

            <div className="h-64 relative w-full">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <span className="text-4xl font-bold text-black">
                        {totalWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">กิโลกรัม</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={chartData} 
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            stroke="none"
                            style={{ outline: 'none' }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                            ))}
                        </Pie>

                        <Tooltip
                            content={<CustomTooltip />}
                            offset={20}
                            wrapperStyle={{ outline: 'none' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-y-2 gap-x-1 justify-items-center mt-2">
                {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 w-full justify-center">
                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-600 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}