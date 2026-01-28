'use client';

import { useState } from 'react';
import { Home, BarChart2, Recycle, History, User, Camera, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation';

type props = {
   activeTab?: string;
};
export default function MenuBar({ activeTab: initialActiveTab }: props) {
    const [activeTab, setActiveTab] = useState(initialActiveTab || 'home');
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const router = useRouter();
    const menuItems = [
        { id: 'home', label: 'หน้าหลัก', icon: Home },
        { id: 'stats', label: 'สถิติ', icon: BarChart2 },
        { id: 'recycle', label: 'คัดแยก', icon: Recycle },
        { id: 'wasteHistory', label: 'ประวัติ', icon: History },
        { id: 'profile', label: 'โปรไฟล์', icon: User },
    ];

    const handleMenuClick = (id: string) => {
        setActiveTab(id);
        if (id === 'recycle') {
            setIsMenuOpen(!isMenuOpen);
        } else if (id === 'profile') {
            setIsMenuOpen(false);
            router.push('/auth/dashboard');
        } else {
            setIsMenuOpen(false);
            router.push(`/wasteTracking/${id}`);
        }
    };
    return (
        <>
            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-gray-900/60 z-40 transition-opacity"
                        onClick={() => setIsMenuOpen(false)} 
                    ></div>

                    
                    <div className="fixed bottom-20 left-0 right-0 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
                        <div className="bg-white rounded-t-[30px] p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] flex flex-col gap-3">
                            <Button onClick={() => router.push('/wasteTracking/wasteScaner')} className="w-full h-12 bg-green-700 hover:bg-green-800 active:scale-95 transition-all text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold">
                                <Camera size={20} />
                                สแกนบาร์โค้ดขยะ

                            </Button>

                            
                            <Button onClick={() => router.push('/wasteTracking/wasteSorting')} className="w-full h-12 bg-green-700 hover:bg-green-800 active:scale-95 transition-all text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold">
                                <ClipboardList size={20} />
                                บันทึกการคัดแยกขยะ (กิโลกรัม)
                            </Button>

                        </div>
                    </div>
                </>
            )}

            <div className="fixed bottom-0 left-0 h-20 w-full bg-green-100 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between content-center items-center align-middle px-6 pb-6 pt-8 h-full">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleMenuClick(item.id)

                                }
                                className={`flex flex-col items-center gap-1 pt-2 px-3 w-full rounded-xl transition-all duration-300
                                    ${isActive ? 'bg-white shadow-sm mt-2 -translate-y-2' : 'bg-transparent'} 
                                `}
                            >
                                <Icon
                                    size={24}
                                    className={`${isActive ? 'text-green-700' : 'text-gray-500'} `}
                                    strokeWidth={2.5}
                                />

                                <span className={`text-xs font-bold ${isActive ? 'text-green-700' : 'text-gray-500'}`}>
                                    {item.label}
                                </span>

                                {isActive ? (
                                    <div className="w-8 h-1 bg-[#5EA500] rounded-full mt-1"></div>
                                ) : (
                                    <div className="w-8 bg-transparent mt-1"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}