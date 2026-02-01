'use client';

import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { CardContentLarge } from "@/components/ui/card";
import { WasteMaterial } from "@/interfaces/Waste";

export default function CarbonSummaryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [materialData, setMaterialData] = useState<WasteMaterial | null>(null);
    const materialId = searchParams.get('materialId');
    const weight = parseFloat(searchParams.get('weight') || "0");



    useEffect(() => {
        const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const fetchDetail = async () => {
            if (!materialId) return;
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/waste/material/${materialId}`);
                if (!res.ok && res.status !== 304) throw new Error("Fetch failed");
                const data = await res.json();
                if (data) {
                    setMaterialData(data);
                }
            } catch (err) {
                console.error("Error:", err);
                toast.error("ไม่สามารถโหลดข้อมูลวัสดุได้");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [materialId]);

    // Mock 
    const co2Saved = (weight * (materialData?.emission_factor || 1.01)).toFixed(2);
    const points = weight * 100;

    const handleConfirmSave = async () => {
        const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('user');
            const user = storedUser ? JSON.parse(storedUser) : null;

            const res = await fetch(`${API_URL}/waste/sorting/record`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meterialId: Number(materialId),
                    weight: weight,
                    userId: user?.id
                })
            });

            if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

            setIsConfirmOpen(false);
            toast.success("บันทึกข้อมูลเรียบร้อย", {
                description: "ข้อมูลถูกบันทึกลงในระบบแล้ว",
            });
            router.push('/wasteTracking/home');
        } catch (err) {
            console.error("Error saving data:", err);
            toast.error("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setLoading(false);
        }
    };

    const now = new Date();
    const formattedDate = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

    return (
        <>
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[320px] rounded-xl p-6 bg-white flex flex-col items-center [&>button]:hidden">
                    <div className="mb-2">
                        {loading ? <Loader2 size={70} className="animate-spin text-green-600" /> : <Save size={70} strokeWidth={1} className="text-gray-800" />}
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
                            <Button disabled={loading} variant="outline" className="flex-1 border-gray-200 text-gray-600 h-11 hover:bg-gray-50">
                                ยกเลิก
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={loading}
                            onClick={handleConfirmSave}
                            className="flex-1 bg-[#5EA500] hover:bg-green-700 text-white h-11 "
                        >
                            {loading ? "กำลังบันทึก..." : "ยืนยัน"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <CardContentLarge className="">
                <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-5 shadow-inner relative">
                    {materialData?.meterial_image && materialData.meterial_image.trim() !== "" ? (
                        <Image
                            src={materialData.meterial_image}
                            alt={materialData.material_name || "waste"}
                            fill
                            className="object-cover mix-blend-multiply"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {loading ? "กำลังโหลด..." : (materialData?.material_name || "ไม่พบชื่อวัสดุ")}
                    </h2>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                        {points} points
                    </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span>ประเภทขยะ</span>
                        <span className="bg-green-200 text-green-700 text-xs font-bold px-3 py-0.5 rounded-full ">
                            {materialData?.waste_category?.[0]?.name || "พลาสติก"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>ปริมาณ</span>
                        <span className="text-black font-bold text-base">{weight} กก.</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                        {formattedDate} • {formattedTime}
                    </div>
                </div>

                <div className="bg-[#E6F9EE] rounded-2xl p-6 text-left shadow-md border border-green-100 mb-6">
                    <p className="text-black text-sm mb-1">ปริมาณก๊าซเรือนกระจกที่ลดลง</p>
                    <p className="text-[#1E8546] text-5xl font-extrabold tracking-tight">
                        {co2Saved} <span className="text-4xl font-semibold">KgCO2e</span>
                    </p>
                </div>

                <div className="mt-auto flex gap-3 w-full ">
                    <Button variant="outline"
                        onClick={() => router.back()}
                        className="flex-1 py-3 border border-gray-300 h-10 text-gray-600 hover:bg-gray-50 transition-colors"
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
            </CardContentLarge>
        </>
    );
}