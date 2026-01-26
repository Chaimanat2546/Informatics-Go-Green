'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, Leaf, Save } from "lucide-react"; // เพิ่ม Save icon
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"; 

export default function CarbonSummaryPage() {
    const router = useRouter();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); 

    // Mock Data 
    const summaryData = {
        name: 'ขวดพลาสติกใส (PET)',
        image: 'https://placehold.co/400/png?text=PET+Bottle',
        points: 100,
        category: 'พลาสติก',
        weight: 1.2,
        date: '23 ม.ค. 2026',
        time: '14:20 น.',
        co2Saved: 1.21
    };

    const handleConfirmSave = () => {
        setIsConfirmOpen(false); 
        
        toast.success("บันทึกข้อมูลเรียบร้อย", {
            description: "ข้อมูลถูกบันทึกลงในระบบแล้ว",
        });
        router.push('/wasteTracking/home');
    };

    return (
        <div className="min-h-screen bg-[#EAF6F1] font-sans relative">

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

            <div className="bg-green-600 h-34.5 rounded-b-[50px] px-6 pt-8 pb-4 relative z-0">
                <div className="flex justify-between items-center text-white">
                    <button onClick={() => router.back()} className="p-1">
                        <ChevronLeft size={32} />
                    </button>
                    <h1 className="text-2xl font-bold">คัดแยกขยะ</h1>
                    <div className="bg-white h-12.5 w-12.5 rounded-2xl flex justify-center items-center">
                        <Leaf className="text-green-700" size={40} strokeWidth={4} />
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-10 pb-6">
                <div className="bg-white rounded-[30px] p-6 shadow-xl min-h-150 flex flex-col">

                    <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-5 shadow-inner">
                        <img
                            src={summaryData.image}
                            alt={summaryData.name}
                            className="w-full h-full object-cover mix-blend-multiply"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            {summaryData.name}
                        </h2>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                            {summaryData.points} points
                        </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span>ประเภทขยะ</span>
                            <span className="bg-green-200 text-green-700 text-xs font-bold px-3 py-0.5 rounded-full ">
                                {summaryData.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>ปริมาณ</span>
                            <span className="text-black font-bold text-base">{summaryData.weight} กก.</span>
                        </div>
                        <div className="text-gray-500 text-xs">
                            {summaryData.date} • {summaryData.time}
                        </div>
                    </div>

                    <div className="bg-[#E6F9EE] rounded-2xl p-6 text-left shadow-md border border-green-100 mb-6">
                        <p className="text-black text-sm mb-1">ปริมาณก๊าซเรือนกระจกที่ลดลง</p>
                        <p className="text-[#1E8546] text-5xl font-extrabold tracking-tight">
                            {summaryData.co2Saved} <span className="text-4xl font-semibold">KgCO2e</span>
                        </p>
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

                </div>
            </div>
        </div>
    );
}