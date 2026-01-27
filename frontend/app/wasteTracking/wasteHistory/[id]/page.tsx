'use client';

import { Card } from "@/components/ui/card";
import MenuBar from "@/components/wasteTracking/MenuBar";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Leaf, } from "lucide-react";
import { wasteHistoryData } from "@/data/wasteHistoryData"; 
import Image from "next/image";

export default function WasteHistoryDetail() {
    const params = useParams();
    const router = useRouter();

    const wasteId = Number(params.id);
    const wasteItem = wasteHistoryData.find(item => item.id === wasteId);

    if (!wasteItem) {
        return <div className="p-10 text-center">ไม่พบข้อมูลประวัติขยะนี้</div>;
    }

    const details = wasteItem.details || {
        mainImage: "",
        carbonCredit: "0.00 kco2e",
        disposalSteps: ["ไม่มีข้อมูล"],
        separationComponents: []
    };

    return (

        <>
            <Card className=" px-4 mx-6 gap-1 -mt-10 z-10 relative rounded-[24px] shadow-sm border-none bg-white">
                <div className=" w-62.5 h-62.5 mx-auto text-center  flex justify-center contain-content items-center bg-gray-100 rounded-xl overflow-hidden  ">
                    {details.mainImage ? (
                        <Image src={details.mainImage} alt={wasteItem.title} className="w-full h-full object-contain rounded-2xl" />
                    ) : (
                        <span className="text-gray-400">No Image</span>
                    )}
                </div>

                <div className="flex flex-col items-center mt-1 mb-4">
                    <h2 className="text-2xl font-semibold text-black ">{wasteItem.title}</h2>
                    <span className="bg-green-100 text-green-700 text-md font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Leaf size={20} /> {details.carbonCredit}
                    </span>
                </div>

                <div className="relative pl-2">
                    <h3 className="text-green-800 text-xl font-semibold mb-4 border-l-4 border-green-700 pl-3">
                        ขั้นตอนการทิ้ง
                    </h3>

                    <div className="absolute left-6.25 top-16 bottom-4 w-1 bg-green-700"></div>

                    <div className="space-y-4">
                        {details.disposalSteps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3 relative z-10 w-full">
                                <CheckCircle2 className="text-green-700  rounded-full shrink-0" size={38} fill="#fff" />

                                <p className="text-gray-800 text-lg mt-0.5 flex-1 wrap-break-word">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
            {details.separationComponents.length > 0 && (
                <Card className="px-4 mx-6 mt-4 mb-24  rounded-[24px] shadow-sm  bg-white">
                    <h3 className="text-green-800 font-semibold text-2xl   border-l-4 border-green-700 pl-3">
                        วิธีการแยกขยะ
                    </h3>

                    <div className="flex flex-col gap-2 -mt-2 ">
                        {details.separationComponents.map((comp, index) => (
                            <div key={index} className="border border-green-200 rounded-xl p-3">
                                <div className="flex justify-between items-center mb-3 px-2">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                        {comp.originalImage == "" ? (<></>) : (
                                            <Image
                                                src={comp.originalImage}
                                                alt="Original"
                                                className="w-full h-full object-cover"
                                            />

                                        )}
                                    </div>

                                    <span className="text-green-700 font-bold text-xl">=</span>

                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                        {comp.componentImage == "" ? (<></>) : (
                                            <Image
                                                src={comp.componentImage}
                                                alt="Component"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="text-center border-t border-gray-100 pt-2">
                                    <p className="font-bold text-gray-800 text-xl">{comp.materialName}</p>
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