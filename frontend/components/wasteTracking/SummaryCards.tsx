'use client'

import { useState, useEffect } from 'react';
import { Recycle, Leaf, CreditCard, Trees } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
    weight: <Recycle size={20} className="text-black" />,
    carbon: <Leaf size={20} className="text-black" />,
    cost: <CreditCard size={20} className="text-black" />,
    trees: <Trees size={20} className="text-black" />,
};

interface CardData {
    id: string;
    title: string;
    value: string;
    unit: string;
    desc: string;
}

interface SummaryCardsProps {
    type: 'daily' | 'monthly' | 'yearly';
    date: string;
}

export default function SummaryCards({ type, date }: SummaryCardsProps) {
    const [cards, setCards] = useState<CardData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCardsData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/api/waste/cards-summary?type=${type}&date=${date}`);
                if (!response.ok) throw new Error('Failed to fetch data');
                
                const data = await response.json();
                setCards(data);
            } catch (error) {
                console.error("Error fetching summary cards:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCardsData();
    }, [type, date]); 

    if (loading) {
        return <div className="text-center py-4 text-gray-500 text-sm animate-pulse">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="w-full py-2 overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 min-w-max">
                {cards.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 w-full flex flex-col justify-between min-w-[250px]"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-900 font-medium text-sm">{item.title}</span>
                                {iconMap[item.id]} 
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-3xl font-bold text-black tracking-tight">{item.value}</span>
                                <span className="text-gray-500 text-xs font-medium ml-1">{item.unit}</span>
                            </div>
                        </div>

                        <p className={`text-sm mt-3 ${item.desc.includes('ลดลง') ? 'text-red-500' : 'text-emerald-500'}`}>
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}