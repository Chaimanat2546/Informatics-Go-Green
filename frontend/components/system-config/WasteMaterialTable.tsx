"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface WasteMaterial {
  id: number;
  name: string;
  emissionFactor: number;
  unit: string;
  materialImage?: string;
  wasteCategory: {
    id: number;
    name: string;
  };
}

interface WasteMaterialResponse {
  data: WasteMaterial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function WasteMaterialTable() {
  const router = useRouter();

  const [wasteMaterials, setWasteMaterials] = useState<WasteMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: number; name: string } | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  // Ref to track search timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWasteMaterials = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      router.push("/auth/login");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await fetch(`${API_URL}/admin/waste-materials?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: WasteMaterialResponse = await response.json();
        setWasteMaterials(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else if (response.status === 401) {
        toast.error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (response.status === 403) {
        const msg = "คุณไม่มีสิทธิ์เข้าถึงข้อมูลส่วนนี้";
        toast.error(msg);
        setError(msg);
      } else {
        const msg = "ไม่สามารถโหลดข้อมูลได้";
        toast.error(msg);
        setError(msg);
        console.error("API Error:", response.status);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      const msg = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, limit, searchTerm, router]);

  // Effect to fetch on mount and when dependencies change
  useEffect(() => {
    fetchWasteMaterials();
  }, [fetchWasteMaterials]);

  // Auto-search logic (Debounce)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Skip initial load fetch if searchTerm is empty (handled by the main effect)
    // But we need to handle searchTerm changes
    searchTimeoutRef.current = setTimeout(() => {
      // Only trigger if searchTerm changed and is not handled by direct submit
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWasteMaterials();
  };

  const handleViewProfile = (wasteMaterialId: number) => {
    router.push(`/systemConfig/emission-factor/${wasteMaterialId}`);
  };

  const handleAddNew = () => {
    router.push("/systemConfig/emission-factor/add");
  };

  const handleEdit = (wasteMaterialId: number) => {
    router.push(`/systemConfig/emission-factor/${wasteMaterialId}/edit`);
  };

  const openDeleteModal = (wasteMaterialId: number, name: string) => {
    setDeletingItem({ id: wasteMaterialId, name });
    setIsDeleteModalOpen(true);
  };


  const executeDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      router.push("/auth/login");
      setIsDeleting(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/waste-materials/${deletingItem.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("ลบข้อมูลสำเร็จ");
        setIsDeleteModalOpen(false);
        fetchWasteMaterials();
      } else if (response.status === 401) {
        toast.error("Session หมดอายุ");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (response.status === 409) {
        const errorData = await response.json();
        toast.error(errorData.message || "ไม่สามารถลบได้เนื่องจากมีการใช้งานข้อมูลนี้อยู่");
      } else if (response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์ลบข้อมูล");
      } else {
        toast.error("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryColorClasses = (categoryName: string): string => {
    if (!categoryName) return 'bg-purple-50 text-purple-700';

    const name = categoryName.toLowerCase();

    if (name.includes('พลาสติก')) return 'bg-green-50 text-green-700';
    if (name.includes('กระดาษ')) return 'bg-yellow-50 text-yellow-700';
    if (name.includes('แก้ว')) return 'bg-blue-50 text-blue-700';
    if (name.includes('เหล็ก')) return 'bg-red-50 text-red-700';
    if (name.includes('โลหะ') || name.includes('อลูมิเนียม')) return 'bg-slate-50 text-slate-700';
    if (name.includes('อินทรีย์') || name.includes('อาหาร')) return 'bg-lime-50 text-lime-700';
    if (name.includes('อันตราย')) return 'bg-rose-50 text-rose-700';

    return 'bg-purple-50 text-purple-700';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 mt-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center gap-3">
            <RefreshCw className={`w-8 h-8 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            รายการค่าสัมประสิทธิ์
          </h1>
          <p className="text-slate-500 mt-1">จัดการข้อมูล Emission Factor สำหรับคำนวณคาร์บอนฟุตพริ้นท์</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAddNew}
            className="bg-[#72B01D] hover:bg-[#5f9318] text-white rounded-xl px-6 py-6 flex gap-2 shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> เพิ่มค่าสัมประสิทธิ์
          </Button>
        </div>
      </div>


      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <form onSubmit={handleSearch} className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="ค้นหาชื่อ หมวดหมู่ หรือหน่วย..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-emerald-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-12 text-center mb-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">พบข้อผิดพลาด</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button
            onClick={() => fetchWasteMaterials()}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> ลองใหม่อีกครั้ง
          </Button>
        </div>
      )}

      {/* Table Section */}
      {!error && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 border-b border-slate-100">
                  <TableHead className="font-bold text-slate-700 h-14">ชื่อวัสดุ</TableHead>
                  <TableHead className="font-bold text-slate-700 h-14">หมวดหมู่</TableHead>
                  <TableHead className="font-bold text-slate-700 h-14">ค่าสัมประสิทธิ์ (Emission Factor)</TableHead>
                  <TableHead className="w-16 h-14"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-5 bg-slate-100 rounded w-3/4"></div></TableCell>
                      <TableCell><div className="h-5 bg-slate-100 rounded w-1/2"></div></TableCell>
                      <TableCell><div className="h-5 bg-slate-100 rounded w-2/3"></div></TableCell>
                      <TableCell><div className="h-8 bg-slate-100 rounded-full w-8"></div></TableCell>
                    </TableRow>
                  ))
                ) : wasteMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-slate-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-lg font-medium">ไม่พบข้อมูลค่าสัมประสิทธิ์</p>
                      <p className="text-sm">ลองเปลี่ยนคำค้นหาหรือเพิ่มข้อมูลใหม่</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  wasteMaterials.map((wasteMaterial) => (
                    <TableRow key={wasteMaterial.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                      <TableCell className="font-medium text-slate-700 py-4">
                        {wasteMaterial.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColorClasses(wasteMaterial.wasteCategory.name)}`}
                        >
                          {wasteMaterial.wasteCategory.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 font-mono">
                        <span className="font-bold text-slate-800">{wasteMaterial.emissionFactor?.toFixed(4)}</span>
                        <span className="ml-2 text-slate-400 text-xs">{wasteMaterial.unit}</span>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-slate-100 rounded-full"
                            >
                              <MoreHorizontal className="h-5 w-5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
                            <DropdownMenuItem
                              onClick={() => handleViewProfile(wasteMaterial.id)}
                              className="text-slate-700 cursor-pointer py-2.5 px-4 focus:bg-emerald-50 focus:text-emerald-700"
                            >
                              ดูข้อมูลรายละเอียด
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(wasteMaterial.id)}
                              className="text-slate-700 cursor-pointer py-2.5 px-4 focus:bg-emerald-50 focus:text-emerald-700"
                            >
                              แก้ไขข้อมูล
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteModal(wasteMaterial.id, wasteMaterial.name)}
                              className="text-red-500 cursor-pointer py-2.5 px-4 focus:bg-red-50 focus:text-red-600 font-medium"
                            >
                              ลบข้อมูล
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!error && total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <p className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-full font-medium">
            แสดง {((page - 1) * limit) + 1} ถึง {Math.min(page * limit, total)} จากทั้งหมด {total} รายการ
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-xl border-slate-200 hover:bg-slate-50 h-10 px-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> ก่อนหน้า
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                // Simple logic for showing pages around current
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === pageNum
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                      : 'text-slate-400 hover:bg-slate-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-xl border-slate-200 hover:bg-slate-50 h-10 px-4"
            >
              ถัดไป <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] transition-all">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-6 w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <Trash2 className="w-10 h-10 text-red-500" strokeWidth={1.5} />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              ยืนยันการลบข้อมูล
            </h3>
            <p className="text-slate-500 mb-8 text-base">
              คุณต้องการลบ <span className="font-bold text-slate-700">&quot;{deletingItem?.name}&quot;</span> ใช่หรือไม่?<br />
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3.5 px-4 bg-slate-100 rounded-2xl text-slate-600 font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="flex-1 py-3.5 px-4 bg-red-500 hover:bg-red-600 rounded-2xl text-white font-bold shadow-lg shadow-red-100 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? <RefreshCw className="animate-spin w-5 h-5" /> : "ยืนยันการลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
