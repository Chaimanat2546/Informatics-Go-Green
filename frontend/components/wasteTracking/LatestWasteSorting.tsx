"use client";
import { useRef } from "react";

export default function LatestWasteSorting() {
    // Mock Data
    const recentItems = [
        {
            id: 1,
            title: "ขวดน้ำดื่มคริสตัล ",
            user: "@username1",
            image: "https://scontent.fbkk13-2.fna.fbcdn.net/v/t39.30808-6/359204339_782717720526118_3433726526620288873_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=_GAUHulNTIYQ7kNvwEDHk8S&_nc_oc=AdkfNY3RDiDN1YW22rTvP6_TdL_qy7o89_majBbyLpGJIVmKqhL9RI2XHmlT3tnpM4fuIKzGseq-eX11a1J2K1vP&_nc_zt=23&_nc_ht=scontent.fbkk13-2.fna&_nc_gid=xAzU7nHgpAiEOUJQ7oijdw&oh=00_Afo7T0cP-g5tWBPxuVpjo2T-WbROalH3wFOU4PFx166V6A&oe=697CEA9C",
            bgColor: "bg-blue-50"
        },
        {
            id: 2,
            title: "ซองมาม่า",
            user: "@username2",
            image: "https://scontent.fbkk8-4.fna.fbcdn.net/v/t39.30808-6/616825951_122181822116433263_3863962481692268851_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=cNTgKlpFOWYQ7kNvwFIQUB9&_nc_oc=AdnFQ468TJ5BxWCVUP62ns0rxaK5JwjWR7VyeBdKYORJuIrsKC4qT-uUh-JCx7_-zVxLizIYtjBwwPCoWMpZUuHH&_nc_zt=23&_nc_ht=scontent.fbkk8-4.fna&_nc_gid=MHkJU1eN3vKtIqNxlzjCSQ&oh=00_AfpmEgZ5Hu37wEORvLDeUaodw4rkAoofIAyn2h51RYcriA&oe=697D196F",
            bgColor: "bg-orange-50"
        },
        {
            id: 3,
            title: "กล่องพัสดุ",
            user: "@username3",
            image: "https://scontent.fbkk13-1.fna.fbcdn.net/v/t1.6435-9/185551559_2923869441212992_9181076018666796210_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=2285d6&_nc_ohc=ubsaBXd2A1MQ7kNvwEu1zlW&_nc_oc=Adnkse_51ne5fM_ALQ58crizeo_WkmMWISHxKk6v-tMvAfq_-ZfDW4gRx4qzKAxp2Y9wFrulGwjR1uH01AUP2xZZ&_nc_zt=23&_nc_ht=scontent.fbkk13-1.fna&_nc_gid=Oy_FRbJcOrnqumSlPttg8g&oh=00_Afr8tV-CzIWjNInJoRXZp-4Jlmrga0IlOnr6iFfmOiUtKQ&oe=699EB231", // ตัวอย่างรูปที่ 3
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
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full object-contain"
                                />
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