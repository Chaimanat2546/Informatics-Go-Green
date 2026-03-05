"use client";
import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

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
    const [items, setItems] = useState<WasteSystemItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [page, setPage] = useState(1);
    const LIMIT = 6;

    const getCategoryBadge = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('พลาสติก') || cat.includes('plastic')) return "bg-yellow-100 text-yellow-700";
        if (cat.includes('แก้ว') || cat.includes('glass')) return "bg-blue-100 text-blue-700";
        if (cat.includes('กระดาษ') || cat.includes('paper')) return "bg-amber-100 text-amber-700";
        if (cat.includes('โลหะ') || cat.includes('metal')) return "bg-red-100 text-red-700";
        return "bg-green-100 text-green-700";
    };

    const fetchItems = async (pageNum: number, append: boolean = false) => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        try {
            if (append) setLoadingMore(true); else setLoading(true);
            const res = await fetch(`${API_URL}/waste/items?page=${pageNum}&limit=${LIMIT}`);
            if (!res.ok) throw new Error("Failed");
            const json = await res.json();
            if (append) {
                setItems(prev => [...prev, ...json.data]);
            } else {
                setItems(json.data);
            }
            setPagination(json.pagination);
        } catch (err) {
            console.error("Error fetching waste items:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchItems(1);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchItems(nextPage, true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center text-gray-400 text-sm py-6">
                ยังไม่มีข้อมูลขยะในระบบ
            </div>
        );
    }

    const hasMore = pagination && pagination.current_page < pagination.total_pages;

    return (
        <div className="mt-2 px-6 pb-24">
            <div className="grid grid-cols-2 gap-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
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
                    </div>
                ))}
            </div>

            {hasMore && (
                <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-green-700 font-semibold text-sm bg-green-50 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                    {loadingMore ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <ChevronDown size={16} />
                            โหลดเพิ่มเติม
                        </>
                    )}
                </button>
            )}
        </div>
    );
}