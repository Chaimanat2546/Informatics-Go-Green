"use client";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";

interface WasteSystemItem {
    id: number;
    name: string;
    waste_image: string | null;
    category_name: string;
}

interface PaginationInfo {
    total_items: number;
    total_pages: number;
    current_page: number;
}

export default function LatestWasteSorting() {
    const router = useRouter();
    const [items, setItems] = useState<WasteSystemItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaging, setIsPaging] = useState(false); 
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [page, setPage] = useState(1);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    
    const LIMIT = 4; 

    const getCategoryBadge = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('พลาสติก') || cat.includes('plastic')) return "bg-yellow-100 text-yellow-700";
        if (cat.includes('แก้ว') || cat.includes('glass')) return "bg-blue-100 text-blue-700";
        if (cat.includes('กระดาษ') || cat.includes('paper')) return "bg-amber-100 text-amber-700";
        if (cat.includes('โลหะ') || cat.includes('metal')) return "bg-red-100 text-red-700";
        return "bg-green-100 text-green-700";
    };

    const fetchItems = useCallback(async (pageNum: number, search: string = "") => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        try {
            if (pageNum === 1 && !isPaging) {
                setLoading(true); 
            } else {
                setIsPaging(true); 
            }

            const url = new URL(`${API_URL}/waste/items`);
            url.searchParams.append("page", pageNum.toString());
            url.searchParams.append("limit", LIMIT.toString());
            if (search) {
                url.searchParams.append("search", search);
            }

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Failed");
            const json = await res.json();
            
            setItems(json.data);
            setPagination(json.pagination);
            setPage(pageNum); 
        } catch (err) {
            console.error("Error fetching waste items:", err);
        } finally {
            setLoading(false);
            setIsPaging(false);
        }
    }, [isPaging]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchItems(page, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearchQuery]);

    useEffect(() => {
        if (debouncedSearchQuery !== undefined) {
            setPage(1);
        }
    }, [debouncedSearchQuery]);


    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1); 
    };

    const handleNextPage = () => {
        if (pagination && page < pagination.total_pages) setPage(page + 1);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setDebouncedSearchQuery("");
        setPage(1);
    };

    if (loading && items.length === 0) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="mt-2 px-6 pb-20">
            <div className="mt-2 mb-4 h-11 bg-white rounded-[10px] flex items-center gap-2 px-1 shadow-sm border relative">
                <InputGroup className="w-full flex-1 border-none ">
                    <InputGroupInput
                        placeholder="ค้นหาขยะ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full border-none outline-none focus:ring-0 bg-transparent shadow-none pr-8"
                    />
                    <InputGroupAddon>
                        {searchQuery ? (
                            <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                                <X size={18} />
                            </button>
                        ) : (
                            <Search className="text-gray-400" size={18} />
                        )}
                    </InputGroupAddon>
                </InputGroup>
            </div>
            
            {items.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-10 bg-white rounded-xl border border-gray-100">
                    ไม่พบข้อมูลขยะที่ค้นหา
                </div>
            ) : (
                <div className={`grid grid-cols-2 gap-3 transition-opacity duration-200 ${isPaging ? 'opacity-50' : 'opacity-100'}`}>
                    {items.map((item) => (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => router.push(`/wasteTracking/viewWaste/${item.id}`)}
                            className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col cursor-pointer active:scale-95 transition-transform"
                        >
                            <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                                {item.waste_image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.waste_image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-gray-300 text-sm">No Image</div>
                                )}
                            </div>

                            <div className="px-3 py-2 flex flex-col gap-1">
                                <p className="text-gray-900 text-sm font-bold line-clamp-2 leading-5">
                                    {item.name}
                                </p>
                                <span className={`${getCategoryBadge(item.category_name)} text-xs font-bold px-2 py-0.5 rounded-full w-fit`}>
                                    {item.category_name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {pagination && pagination.total_items > 0 && (
                <div className="flex items-center justify-between mt-6 px-1">
                    <button
                        onClick={handlePrevPage}
                        disabled={page === 1 || isPaging}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 disabled:opacity-40 disabled:bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-700 transition-colors"
                    >
                        {isPaging && page > 1 ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronLeft size={20} />}
                    </button>

                    <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-gray-800">
                            หน้า {page} <span className="text-gray-400 font-normal mx-1">จาก</span> {pagination.total_pages}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                            ทั้งหมด {pagination.total_items} รายการ
                        </span>
                    </div>

                    <button
                        onClick={handleNextPage}
                        disabled={page === pagination.total_pages || isPaging}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 disabled:opacity-40 disabled:bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-700 transition-colors"
                    >
                        {isPaging && page < pagination.total_pages ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight size={20} />}
                    </button>
                </div>
            )}
        </div>
    );
}