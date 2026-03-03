"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const fetchWasteMaterials = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    // ✅ ถ้าไม่มี token ให้ redirect ไป login เท่านั้น
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      router.push("/auth/login");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      // ✅ แก้ไข: เรียก waste-materials (ไม่ใช่ users)
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
        // ✅ Session หมดอายุ → ไป login
        toast.error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else {
        // ✅ ลบการ redirect ไป dashboard ออก
        // ไม่ redirect ไปไหน แค่แสดง error
        toast.error("ไม่สามารถโหลดข้อมูลได้");
        console.error("API Error:", response.status);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, limit, searchTerm, router]);

  useEffect(() => {
    fetchWasteMaterials();
  }, [fetchWasteMaterials]);

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

  const handleDelete = async (wasteMaterialId: number, name: string) => {
    if (!confirm(`ต้องการลบ "${name}" ใช่หรือไม่?`)) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      router.push("/auth/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/waste-materials/${wasteMaterialId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        toast.success("ลบข้อมูลสำเร็จ");
        fetchWasteMaterials();
      } else if (response.status === 401) {
        toast.error("Session หมดอายุ");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else {
        toast.error("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        รายการค่าสัมประสิทธิ์ (EmissionFactor)
      </h1>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={handleAddNew}
          className="bg-[#72B01D] hover:bg-[#5f9318] text-white rounded-md px-4 py-2 flex gap-2"
        >
          <Plus className="w-4 h-4" /> เพิ่มค่าสัมประสิทธิ์
        </Button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหาชื่อ หมวดหมู่ หรือหน่วย..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">ชื่อ</TableHead>
              <TableHead className="font-semibold">หมวดหมู่</TableHead>
              <TableHead className="font-semibold">Emission Factor</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : wasteMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  ไม่พบข้อมูลค่าสัมประสิทธิ์
                </TableCell>
              </TableRow>
            ) : (
              wasteMaterials.map((wasteMaterial) => (
                <TableRow key={wasteMaterial.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {wasteMaterial.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {wasteMaterial.wasteCategory.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {wasteMaterial.emissionFactor?.toFixed(4)}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewProfile(wasteMaterial.id)}
                          className="text-gray-700 cursor-pointer"
                        >
                          ดูข้อมูล
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(wasteMaterial.id)}
                          className="text-gray-700 cursor-pointer"
                        >
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleDelete(wasteMaterial.id, wasteMaterial.name)
                          }
                          className="text-red-500 cursor-pointer"
                        >
                          ลบ
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">
          {total > 0
            ? `${(page - 1) * limit + 1} ถึง ${Math.min(page * limit, total)} จาก ${total} รายการ`
            : "0 รายการ"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> หน้าก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            หน้าถัดไป <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}