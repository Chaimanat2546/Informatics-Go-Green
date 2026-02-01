'use client';

import { Card } from "@/components/ui/card";
import MenuBar from "@/components/wasteTracking/MenuBar";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Leaf, Loader2, } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WasteData} from "@/interfaces/Waste";


export default function WasteHistoryDetail() {
    const params = useParams();
    const wasteId = Number(params.id);
    const [waste, setWaste] = useState<WasteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(Boolean(false));
    const router = useRouter();

    const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

    useEffect(() => {
        const fetchData = async () => {
            if (!wasteId) return;
            try {
                const res = await fetch(`${API_URL}/waste/history/detail/${wasteId}`);
                if (!res.ok) throw new Error("Not Found");
                const data: WasteData = await res.json();
                setWaste(data);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [wasteId]);

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (error || !waste) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50 gap-4">
                <p className="text-xl text-gray-700">ไม่พบข้อมูลประวัติขยะนี้</p>
                <Button variant="outline" onClick={() => router.back()}>ย้อนกลับ</Button>
                <div className="fixed bottom-0 w-full"><MenuBar activeTab="wasteHistory" /></div>
            </div>
        );
    }

    return (
        <>
            <Card className=" px-4 mx-6 gap-1 -mt-10 z-10 relative rounded-[24px] shadow-sm border-none bg-white">
                <div className=" w-62.5 h-62.5 mx-auto text-center  flex justify-center contain-content items-center bg-gray-100 rounded-xl overflow-hidden  ">
                    {waste.waste_image ? (
                        <Image src={waste.waste_image} alt={waste.name} className="w-full h-full object-contain rounded-2xl" />
                    ) : (
                        <span className="text-gray-400">No Image</span>
                    )}
                </div>

                <div className="flex flex-col items-center mt-1 mb-4">
                    <h2 className="text-2xl font-semibold text-black ">{waste.name}</h2>
                    <span className="bg-green-100 text-green-700 text-md font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Leaf size={20} /> {waste.waste_categoriesid.map(cat => cat.name)}
                    </span>
                </div>

                <div className="relative pl-2">
                    <h3 className="text-green-800 text-xl font-semibold mb-4 border-l-4 border-green-700 pl-3">
                        ขั้นตอนการทิ้ง
                    </h3>

                    <div className="absolute left-6.25 top-16 bottom-4 w-1 bg-green-700"></div>

                    <div className="space-y-4">
                        {waste.waste_sorting.map((step, index) => (
                            <div key={index} className="flex items-start gap-3 relative z-10 w-full">
                                <CheckCircle2 className="text-green-700  rounded-full shrink-0" size={38} fill="#fff" />

                                <p className="text-gray-800 text-lg mt-0.5 flex-1 wrap-break-word">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
            {waste.material_guides.length > 0 && (
                <Card className="px-4 mx-6 mt-4 mb-24  rounded-[24px] shadow-sm  bg-white">
                    <h3 className="text-green-800 font-semibold text-2xl   border-l-4 border-green-700 pl-3">
                        วิธีการแยกขยะ
                    </h3>

                    <div className="flex flex-col gap-2 -mt-2 ">
                        {waste.material_guides.map((comp, index) => (
                            <div key={index} className="border border-green-200 rounded-xl p-3">
                                <div className="flex justify-between items-center mb-3 px-2">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                        {waste.waste_image && (
                                            <Image
                                                src={waste.waste_image}
                                                alt="Original"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    <span className="text-green-700 font-bold text-xl">=</span>

                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                        {comp.guide_image ? (
                                            <Image
                                                src={comp.guide_image}
                                                alt="Component"
                                                className="w-full h-full object-cover"
                                            />
                                        ):(
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">?</div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center border-t border-gray-100 pt-2">
                                    <p className="font-bold text-gray-800 text-xl">{comp.waste_meterial_name}</p>
                                    <p className="text-md text-gray-500 flex-1 wrap-break-word ">{comp.recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
            <MenuBar activeTab="wasteHistory" />
        </>
    );
}