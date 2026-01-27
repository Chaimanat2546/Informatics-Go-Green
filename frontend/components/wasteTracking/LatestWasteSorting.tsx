"use client";
import Image from "next/image";
import { useRef } from "react";

export default function LatestWasteSorting() {
    // Mock Data
    const recentItems = [
        {
            id: 1,
            title: "ขวดน้ำดื่มคริสตัล ",
            user: "@username1",
            image: null,
            bgColor: "bg-blue-50"
        },
        {
            id: 2,
            title: "ซองมาม่า",
            user: "@username2",
            image: null,
            bgColor: "bg-orange-50"
        },
        {
            id: 3,
            title: "กล่องพัสดุ",
            user: "@username3",
            image: null,
            bgColor: "bg-brown-50"
        }
    ];

    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="mt-2 relative group">
            <div className="px-6 flex justify-end mb-2">
                <button className="text-gray-600 text-sm hover:text-green-800">
                    ดูเพิ่มเติม
                </button>
            </div>

            <div className="relative">
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto px-6 pb-4 gap-4 no-scrollbar items-stretch scroll-smooth"
                >
                    {recentItems.map((item) => (
                        <div
                            key={item.id}
                            className="min-w-[calc(50%-0.5rem)] bg-white rounded-lg shadow-sm overflow-hidden flex flex-col snap-start"
                        >
                            <div className="h-32 bg-white p-4 flex justify-center items-center">
                                {item.image == null ? (<></>) : (
                                    <Image
                                        src={item.image || `/images/waste_placeholder.png`}
                                        alt={item.title}
                                        fill
                                        sizes="192px"
                                        className="object-cover"
                                    />
                                )}

                            </div>

                            <div className="px-3 pb-2 text-center">
                                <p className="text-gray-900 text-sm font-bold line-clamp-2 leading-6">
                                    {item.title}
                                </p>
                            </div>

                            <div className="bg-green-100 px-3 py-2 mt-auto">
                                <p className="text-gray-700 text-xs font-medium">
                                    {item.user}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}