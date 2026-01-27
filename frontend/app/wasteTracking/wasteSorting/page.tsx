'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Filter, Leaf, Search, Check } from "lucide-react";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { CardContentLarge } from "@/components/ui/card";

interface WasteItem {
    id: number;
    name: string;
    category: string;
    src: string;
}

export default function WasteSortingPage() {
    const router = useRouter();

    // Mock Data
    const wasteTypes = [
        { id: 1, name: 'กระดาษกล่อง', category: 'กระดาษ', src: "" },
        { id: 2, name: 'หนังสือเก่า', category: 'กระดาษ', src: "" },
        { id: 3, name: 'ขวดพลาสติกใส (PET)', category: 'พลาสติก', src: "" },
        { id: 4, name: 'ฝาพลาสติกรวม', category: 'พลาสติก', src: "" },
        { id: 5, name: 'หลอดพลาสติก', category: 'พลาสติก', src: "" },
        { id: 6, name: 'กระป๋องอลูมิเนียม', category: 'โลหะ', src: "" },
        { id: 7, name: 'แก้วพลาสติก (PET)', category: 'พลาสติก', src: "" },
        { id: 8, name: 'โฟม', category: 'อื่นๆ', src: "" },
        { id: 9, name: 'แก้วน้ำ', category: 'แก้ว', src: "" },
        { id: 10, name: 'เศษเหล็ก', category: 'เหล็ก', src: "" },
    ];

    const categories = ["ทั้งหมด", "พลาสติก", "กระดาษ", "โลหะ", "แก้ว", "เหล็ก", "อื่นๆ"];

    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
    const [weightInput, setWeightInput] = useState("");

    const itemsPerPage = 6;

    const filteredItems = wasteTypes.filter((item: WasteItem) => {
        if (selectedCategory === "ทั้งหมด") return true;
        return item.category === selectedCategory;
    });

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

    const handleSelectCategory = (category: string) => {
        setSelectedCategory(category);
        setIsFilterOpen(false);
        setCurrentPage(1);
    };

    const handleCardClick = (item: WasteItem) => {
        setSelectedItem(item);
        setWeightInput("");
        setIsDialogOpen(true);
    };

    const handleConfirm = () => {
        if (!weightInput) {
            toast.warning("เกิดข้อผิดพลาด", {
                description: "กรุณากรอกน้ำหนักก่อนกดยืนยัน",
            })
            return;
        }
        console.log(`บันทึก: ${selectedItem?.name}, น้ำหนัก: ${weightInput} กก.`);
        setIsDialogOpen(false);
        router.push('/wasteTracking/wasteSorting/carbonSummary')
    };
    return (
        < >

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xs rounded-2xl p-6 bg-white [&>button]:hidden">

                    <DialogHeader className="flex flex-col items-center gap-4">
                        {selectedItem && (
                            <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                                {selectedItem.src === "" ? (<></>) : (
                                    <Image
                                        src={selectedItem.src}
                                        alt={selectedItem.name}
                                        fill
                                        sizes="192px"
                                        className="object-cover"
                                    />)}
                            </div>
                        )}
                        <DialogTitle className="text-lg font-bold text-gray-800 text-center">
                            {selectedItem?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center gap-3 justify-center py-2">
                        <Label htmlFor="weight" className="text-gray-600 text-sm font-medium">
                            น้ำหนัก
                        </Label>
                        <Input
                            id="weight"
                            type="number"
                            value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            className="w-24 text-center text-lg h-10 border-gray-300"
                            placeholder="0.0"
                            autoFocus
                        />
                        <span className="text-gray-600 text-sm font-medium">กิโลกรัม</span>
                    </div>

                    <DialogFooter className="flex flex-row  gap-2 sm:justify-between w-full mt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="flex-1 h-10 border-gray-300 text-gray-600">
                                ยกเลิก
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            onClick={handleConfirm}
                            className="flex-1 bg-[#5EA500] hover:bg-green-700 h-10 text-white"
                        >
                            ยืนยัน
                        </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>




            <CardContentLarge className="">
                <div className="flex gap-3 mb-6 relative z-20">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="กรุณาระบุ" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 transition-colors" />
                    </div>
                    <div className="relative">
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-2.5 border rounded-xl transition-colors ${isFilterOpen ? 'bg-green-50 border-green-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <Filter size={20} className={isFilterOpen ? "text-green-600" : "text-gray-600"} />
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <div className="py-1">
                                    {categories.map((cat) => (
                                        <button key={cat} onClick={() => handleSelectCategory(cat)} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center justify-between">
                                            {cat} {selectedCategory === cat && <Check size={16} className="text-green-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {currentItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleCardClick(item)}
                            className="bg-[#E6F9EE] rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all active:scale-95"
                        >
                            <div className="w-full aspect-square bg-white rounded-lg overflow-hidden relative pointer-events-none">
                                {item.src === "" ? (<></>) : (
                                    <Image
                                        src={item.src}
                                        alt={item.name}
                                        fill
                                        width={200}
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                                        className="object-cover"
                                    />)}
                            </div>
                            <span className="text-xs font-semibold text-green-900 text-center pointer-events-none">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="text-gray-600 disabled:text-gray-300"
                    >
                        หน้าก่อนหน้า
                    </Button>
                    <span className="text-xs text-gray-400">หน้า {currentPage} จาก {totalPages}</span>
                    <Button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`bg-[#5EA500] hover:bg-green-700 text-white ${currentPage === totalPages ? 'opacity-50' : ''}`}
                    >
                        หน้าถัดไป
                    </Button>
                </div>

            </CardContentLarge>
        </>
    );
}