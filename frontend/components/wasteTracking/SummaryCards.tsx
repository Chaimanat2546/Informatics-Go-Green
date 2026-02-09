'use client'

import { Recycle, Leaf, CreditCard, Trees } from 'lucide-react';

export default function SummaryCards() {
    const cards = [
        {
            title: "จำนวนขยะทั้งหมดที่คัดแยก",
            value: "5,000.45",
            unit: "กิโลกรัม",
            desc: "คัดแยกได้มากขึ้น 20.1% จากเดือนที่ผ่านมา",
            icon: <Recycle size={20} className="text-black" />,
        },
        {
            title: "ลดการปล่อยก๊าซ CO2 ได้",
            value: "45,231.89",
            unit: "kgCO2e",
            desc: "ลดได้มากขึ้น 180.1% จากเดือนที่ผ่านมา",
            icon: <Leaf size={20} className="text-black" />,
        },
        {
            title: "Carbon Credit สะสม",
            value: "40,000",
            unit: "แต้ม",
            desc: "ได้รับเพิ่มขึ้น 19% จากเดือนที่ผ่านมา",
            icon: <CreditCard size={20} className="text-black" />,
        },
        {
            title: "เทียบเท่าการปลูกต้นไม้",
            value: "45,231.89",
            unit: "ต้น",
            desc: "ช่วยปลูกต้นไม้เพิ่มขึ้น 19% จากเดือนที่แล้ว",
            icon: <Trees size={20} className="text-black" />,
        },
    ];

    return (
        <div className="w-full py-2 overflow-x-auto  scrollbar-hide">
            <div className="flex gap-4 min-w-max">
                {cards.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 w-full flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-900 font-medium text-sm">{item.title}</span>
                                {item.icon}
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-3xl font-bold text-black tracking-tight">{item.value}</span>
                                <span className="text-gray-500 text-xs font-medium">{item.unit}</span>
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm mt-3">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}