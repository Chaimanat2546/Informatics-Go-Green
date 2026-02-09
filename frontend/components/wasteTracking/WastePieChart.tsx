'use client'

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from 'recharts';

// ข้อมูลจำลอง (Mock Data)
const data = [
    { name: 'พลาสติก', value: 50, color: '#4ADE80' }, 
    { name: 'กระดาษ', value: 20, color: '#FDE047' },
    { name: 'แก้ว', value: 15, color: '#93C5FD' },   
    { name: 'อื่นๆ', value: 10, color: '#D8B4FE' },   
    { name: 'เหล็ก', value: 2.5, color: '#EF4444' },  
    { name: 'โลหะ', value: 2.5, color: '#CBD5E1' },   
];

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
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

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></span>
                <span className="text-gray-800 font-medium text-sm">
                    {data.name} <span className="font-bold text-black">{data.value}%</span>
                </span>
            </div>
        );
    }
    return null;
};

export default function WastePieChart() {
    const [activeIndex, setActiveIndex] = useState(0); 

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className="bg-white rounded-[30px] p-6 shadow-lg border border-gray-50 relative w-full max-w-sm mx-auto">
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
                    <span className="text-4xl font-bold text-black">10</span>
                    <span className="text-sm text-gray-500 font-medium">กิโลกรัม</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            {...({ activeIndex } as any)}
                            activeShape={renderActiveShape}
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            stroke="none"

                            style={{ outline: 'none' }}
                        >
                            {data.map((entry, index) => (
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
            <div className="grid grid-cols-3 gap-y-2 gap-x-1 justify-items-center">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 w-full justify-center">
                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-600 text-sm whitespace-nowrap">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>

    );

}