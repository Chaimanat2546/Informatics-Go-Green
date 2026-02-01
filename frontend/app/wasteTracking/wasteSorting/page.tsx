'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Filter, Search, Check, Loader2, SearchX } from "lucide-react";
import { toast } from "sonner";
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
import { Categories, WasteMaterial } from "@/interfaces/Waste";

export default function WasteSortingPage() {
    const router = useRouter();
    const [wasteMaterials, setWasteMaterials] = useState<WasteMaterial[]>([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_items: 0
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WasteMaterial | null>(null);
    const [weightInput, setWeightInput] = useState("");
    const [categories, setCategory] = useState<string[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";


    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/waste/categories`);
            if (!res.ok) throw new Error("Failed to fetch categories");
            const data = await res.json();
            const categoryNames = data.data.map((cat: Categories) => cat.name);
            setCategory(["ทั้งหมด", ...categoryNames]);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
        }
    }, [API_URL]);


    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const categoryParam = selectedCategory === "ทั้งหมด" ? "" : `&category_name=${selectedCategory}`;
            const searchParam = searchQuery ? `&material_name=${searchQuery}` : "";
            const res = await fetch(
                `${API_URL}/waste/waste-materials?page=${currentPage}${categoryParam}${searchParam}`
            );
            if (!res.ok) throw new Error("Failed to fetch");
            const result = await res.json();
            setWasteMaterials(result.data);
            setPagination(result.pagination);
        } catch (error) {
            console.error("Error:", error);
            toast.error("ไม่สามารถโหลดข้อมูลวัสดุได้");
        } finally {
            setLoading(false);
        }
    }, [API_URL, currentPage, selectedCategory, searchQuery]);

   
    useEffect(() => {
        if (searchQuery) {
            const debounce = setTimeout(() => {
                fetchMaterials();
            }, 300);
            return () => clearTimeout(debounce);
        } else {
            fetchMaterials();
        }
    }, [fetchMaterials,searchQuery]);

    const handleSelectCategory = (category: string) => {
        setSelectedCategory(category);
        setIsFilterOpen(false);
        setCurrentPage(1);
    };

    const handleConfirm = () => {
        if (!weightInput || parseFloat(weightInput) <= 0) {
            toast.warning("ข้อมูลไม่ครบถ้วน", {
                description: "กรุณากรอกน้ำหนักที่ถูกต้องก่อนกดยืนยัน",
            });
            return;
        }
        setIsDialogOpen(false);
        router.push(`/wasteTracking/wasteSorting/carbonSummary?materialId=${selectedItem?.id}&weight=${weightInput}`);
    };

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xs rounded-2xl p-6 bg-white [&>button]:hidden">
                    <DialogHeader className="flex flex-col items-center gap-4">
                        <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden relative shadow-sm">
                            <Image
                                src={selectedItem?.meterial_image || ""}
                                alt={selectedItem?.name || "waste"}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <DialogTitle className="text-lg font-bold text-gray-800 text-center">
                            {selectedItem?.name}

                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center gap-3 justify-center py-2">
                        <Label htmlFor="weight" className="text-gray-600 text-sm font-medium">น้ำหนัก</Label>
                        <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            className="w-24 text-center text-lg h-10 border-gray-300"
                            placeholder="0.0"
                        />
                        <span className="text-gray-600 text-sm font-medium">กิโลกรัม</span>
                    </div>

                    <DialogFooter className="flex flex-row gap-2 sm:justify-between w-full mt-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="flex-1 h-10 border-gray-300 text-gray-600">ยกเลิก</Button>
                        </DialogClose>
                        <Button onClick={handleConfirm} className="flex-1 bg-[#5EA500] hover:bg-green-700 h-10 text-white">
                            ยืนยัน
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CardContentLarge >
                <div className="flex gap-3 mb-6 relative z-20">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหาวัสดุ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
                        />
                    </div>
                    <div className="relative">
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-2.5 border rounded-xl ${isFilterOpen ? 'bg-green-50 border-green-500' : 'border-gray-200'}`}>
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

                <div className="flex flex-col min-h-158 h-full">

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-full min-h-75">
                                <Loader2 className="animate-spin text-green-600" size={40} />
                            </div>
                        ) : pagination.total_items > 0 ? (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {wasteMaterials.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setWeightInput("");
                                            setIsDialogOpen(true);
                                        }}
                                        className="bg-[#E6F9EE] rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all active:scale-95"
                                    >
                                        <div className="w-full aspect-square bg-white rounded-lg overflow-hidden relative">
                                            <Image
                                                src={item.meterial_image || ""}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-semibold text-green-900 text-center line-clamp-1">
                                                {item.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-75 text-gray-500">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <SearchX size={48} className="text-gray-400" />
                                </div>
                                <p className="text-lg font-medium">ไม่พบข้อมูลในระบบ</p>
                                <p className="text-sm opacity-70">กรุณาลองระบุคำค้นหาใหม่อีกครั้ง</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto border-t border-gray-100 pt-4 pb-2">
                        <div className="flex justify-between items-center">
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1 || loading}
                                className="text-sm"
                            >
                                หน้าก่อนหน้า
                            </Button>

                            <span className="text-xs text-gray-400">
                                {pagination.total_items === 0 ? 0 : pagination.current_page} / {pagination.total_pages}
                            </span>
                            <Button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.total_pages))}
                                disabled={currentPage >= pagination.total_pages || pagination.total_pages === 0 || loading}
                                className="text-sm text-white"
                            >
                                หน้าถัดไป
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContentLarge>
        </>
    );
}