"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MenuBar from "@/components/wasteTracking/MenuBar";
import { AlertCircle, CheckCircle2, Leaf, Loader2, Save } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { WasteData } from "@/interfaces/Waste";

export default function WasteDetailPage() {
    const params = useParams();
    const rawId = decodeURIComponent(params.id as string);
    const barcode = rawId.replace('id=', '');

    console.log('Barcode ID:', barcode);
    const router = useRouter();
    const [waste, setWaste] = useState<WasteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUserId(parsed.id);
            } catch (e) { console.error("User parse error", e); }
        }

        const fetchWasteData = async () => {
            if (!barcode) return;
            try {
                setLoading(true);
                setError("");
                const res = await fetch(`${API_URL}/waste/scan/${barcode.trim()}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("NOT_FOUND"); 
                    }
                    throw new Error("SERVER_ERROR");
                }
                const data = await res.json();
                setWaste(data);
            } catch (err: any) {
                if (err.message === "NOT_FOUND") {
                    setError("ขออภัย ไม่พบข้อมูลสินค้านี้ในระบบ");
                } else {
                    setError("ระบบขัดข้อง กรุณาลองใหม่อีกครั้งภายหลัง");
                }
                setWaste(null);
            } finally {
                setLoading(false);
            }
        };
        fetchWasteData();
    }, [barcode]);

    const handleConfirmSave = async () => {
        if (!userId) {
            toast.error("กรุณาเข้าสู่ระบบก่อนบันทึก");
            return;
        }
        if (!waste) return;
        setIsSaving(true);
        try {
            await fetch(`${API_URL}/waste/record`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    wasteId: Number(waste.id),
                    source: 'scan'
                }),
            });
            setIsConfirmOpen(false);
            toast.success("บันทึกข้อมูลเรียบร้อย", {
                description: "ข้อมูลถูกบันทึกลงในระบบแล้ว",
            });
            setTimeout(() => {
                router.push('/wasteTracking/home');
            }, 1000);

        } catch (err: any) {
            console.error("Error Details:", err.response?.data?.message || err);
            const serverMessage = Array.isArray(err.response?.data?.message)
                ? err.response?.data?.message.join(', ')
                : "เกิดข้อผิดพลาดในการบันทึก";
            toast.error("บันทึกไม่สำเร็จ", { description: serverMessage });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">กำลังค้นหาข้อมูล...</p>
            </div>
        );
    }
    if (error || !waste) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-10 bg-gray-50">
                <AlertCircle size={60} className="text-red-400 mb-4" />
                <p className="text-xl font-bold text-gray-700 mb-2">ไม่พบข้อมูลสินค้า</p>
                <p className="text-sm text-gray-400 mb-6">Barcode: {barcode}</p>
                <Button onClick={() => router.push('/wasteTracking/wasteScaner')} variant="outline">ลองสแกนใหม่</Button>
                <div className="fixed bottom-0 w-full"><MenuBar activeTab="recycle" /></div>
            </div>
        );
    }

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
                            disabled={isSaving}
                            className="flex-1 bg-[#5EA500] hover:bg-green-700 text-white h-11"
                        >
                            {isSaving ? <Loader2 className="animate-spin" /> : "ยืนยัน"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

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
                        <Leaf size={20} /> {waste.waste_categoriesid?.map(cat => cat.name) || "ไม่ระบุหมวดหมู่"}
                    </span>
                </div>
                <div className="relative pl-2">
                    <h3 className="text-green-800 text-xl font-semibold mb-4 border-l-4 border-green-700 pl-3">
                        ขั้นตอนการทิ้ง
                    </h3>
                    <div className="absolute left-6.25 top-16 bottom-4 w-1 bg-green-700"></div>
                    <div className="space-y-4">
                        {waste.waste_sorting?.map((step, index) => (
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
                        {waste.material_guides?.map((comp, index) => (
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
                                        ) : (
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
    );
}