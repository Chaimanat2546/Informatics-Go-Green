"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MenuBar from "@/components/wasteTracking/MenuBar";
import { wasteHistoryData } from "@/data/wasteHistoryData";
import { CheckCircle2, Leaf, Save } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog"; 
export default function wasteDetailPage() {
    const params = useParams();

    const rawId = decodeURIComponent(params.id as string);
    const wasteId = rawId.replace('id=', '');

    console.log('Barcode ID:', wasteId);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const router = useRouter();
    const handleConfirmSave = () => {
        setIsConfirmOpen(false);

        toast.success("บันทึกข้อมูลเรียบร้อย", {
            description: "ข้อมูลถูกบันทึกลงในระบบแล้ว",
        });
        router.push('/wasteTracking/home');
    };
    const wasteItem = wasteHistoryData.find(item => item.barcode === Number(wasteId));

    if (!wasteItem) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-10">
                <p className="text-xl text-gray-500 mb-2">ไม่พบข้อมูลประวัติขยะนี้</p>
                <p className="text-sm text-gray-400">Barcode: {wasteId}</p>
            </div>
        );
    }

    const details = wasteItem.details || {
        mainImage: "",
        carbonCredit: "0.00 kco2e",
        disposalSteps: ["ไม่มีข้อมูล"],
        separationComponents: []
    };
    return (
        <>
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[320px] rounded-xl p-6 bg-white flex flex-col items-center [&>button]:hidden">
                    <div className="mb-2">
                        <Save size={70} strokeWidth={1} className="text-gray-800" />
                    </div>
                    <DialogHeader className="mb-2 flex flex-col items-center text-center">
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            ยืนยันการบันทึกข้อมูล
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-md mt-1">
                            เมื่อยืนยันแล้วข้อมูลจะถูกบันทึกลงในระบบ
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-3 w-full">
                        <DialogClose asChild>
                            <Button variant="outline" className="flex-1 border-gray-200 text-gray-600 h-11  hover:bg-gray-50">
                                ยกเลิก
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleConfirmSave}
                            className="flex-1 bg-[#5EA500] hover:bg-green-700 text-white h-11 "
                        >
                            ยืนยัน
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

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
                    <div className="mt-auto flex gap-3 w-full ">
                        <Button variant="outline"
                            onClick={() => router.back()}
                            className="flex-1 py-3 border border-gray-300 h-10 text-gray-600  hover:bg-gray-50 transition-colors"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={() => setIsConfirmOpen(true)}
                            className="flex-1 py-3 bg-[#5EA500] hover:bg-green-700 h-10 text-white shadow-green-200 transition-colors"
                        >
                            บันทึกการคัดแยกขยะ
                        </Button>
                    </div>

                </Card>

            )}



            <MenuBar activeTab="wasteHistory" />

        </>
        // <div>
        //     Waste Scaner Detail Page
        // </div>
    );
}