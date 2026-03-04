"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface WasteCategory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface WasteMaterial {
  id: number;
  name: string;
  emissionFactor?: number;
  emission_factor?: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  materialImage?: string;
  material_image?: string;
  image?: string;
  wasteCategoriesId?: number;
  wasteCategory: WasteCategory;
}

interface Props {
  materialId: number;
}

export default function ViewWasteMaterial({ materialId }: Props) {
  const router = useRouter();
  const [material, setMaterial] = useState<WasteMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  useEffect(() => {
    const fetchMaterialData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบ");
        router.push("/auth/login");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/admin/waste-materials/${materialId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.ok) {
          const data = await response.json();
          console.log("materialData:", data); // ✅ debug ดู field จริง
          setMaterial(data);
        } else if (response.status === 401) {
          toast.error("Session หมดอายุ");
          localStorage.removeItem("token");
          router.push("/auth/login");
        } else if (response.status === 404) {
          toast.error("ไม่พบข้อมูล");
          router.push("/admin/emission-factor");
        } else {
          toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        const isNetworkError =
          error instanceof TypeError &&
          (error as TypeError).message === "Failed to fetch";
        if (isNetworkError) {
          toast.error(
            "ไม่สามารถเชื่อมต่อ Server ได้ กรุณาตรวจสอบว่า Backend รันอยู่ที่ port 3001",
          );
        } else {
          toast.error(`เกิดข้อผิดพลาด: ${(error as Error).message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialData();
  }, [API_URL, materialId, router]);

  const handleDeleteClick = () => setDeleteDialogOpen(true);

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      router.push("/auth/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/waste-materials/${materialId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.success("ลบข้อมูลสำเร็จ");
        router.push("/admin/emission-factor");
      } else if (response.status === 401) {
        toast.error("Session หมดอายุ");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์ลบข้อมูล");
      } else {
        toast.error("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleEdit = () => {
    router.push(`/admin/emission-factor/${materialId}/edit`);
  };

  // ✅ helper รองรับหลาย field name
  const getEmissionFactor = () => {
    const val = material?.emissionFactor ?? material?.emission_factor;
    return val !== undefined && val !== null ? Number(val).toFixed(4) : "-";
  };

  const getImageUrl = () => {
    return (
      material?.materialImage ??
      material?.material_image ??
      material?.image ??
      ""
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#72B01D]"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 text-lg">ไม่พบข้อมูล</p>
          <button
            onClick={() => router.push("/admin/emission-factor")}
            className="mt-4 px-6 py-2.5 bg-[#72B01D] hover:bg-[#5f9318] text-white rounded-xl transition-all duration-200"
          >
            กลับหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl();

  return (
    <div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            รายละเอียดค่าสัมประสิทธิ์
          </h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white/60 overflow-hidden animate-scale">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8">
            {/* Left Section - Image */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">
                รูปภาพ
              </h3>

              <div className="relative border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl overflow-hidden">
                {imageUrl ? (
                  <div className="relative aspect-square">
                    <Image
                      src={imageUrl}
                      alt={material.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center p-8 text-center">
                    <svg
                      className="w-16 h-16 text-slate-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-slate-400 text-sm">ไม่มีรูปภาพ</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Details */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  รายละเอียด
                </h3>
                <p className="text-slate-600">ข้อมูลค่าพารามิเตอร์</p>
              </div>

              <div className="space-y-5">
                {/* ชื่อขยะ */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    ชื่อขยะ
                  </label>
                  <div className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800">
                    {material.name}
                  </div>
                </div>

                {/* หมวดหมู่ */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    หมวดหมู่
                  </label>
                  <div className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800">
                    {material.wasteCategory?.name ?? "-"}
                  </div>
                </div>

                {/* Emission Factor + Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      ค่าปัจจัยการปล่อยมลพิษ
                    </label>
                    <div className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800">
                      {getEmissionFactor()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      หน่วย
                    </label>
                    <div className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800">
                      {material.unit ?? "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                {/* ✅ ปุ่มยกเลิก/ย้อนกลับ */}
                <button
                  onClick={() => router.back()}
                  className="flex-1 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-3.5 px-6 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-[#72B01D] hover:bg-[#5f9318] text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  แก้ไข
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="flex-1 bg-white border-2 border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 font-medium py-3.5 px-6 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl">ยืนยันการลบข้อมูล</DialogTitle>
            <DialogDescription className="text-gray-500">
              ต้องการลบ{" "}
              <span className="font-semibold text-gray-800">
                &quot;{material?.name}&quot;
              </span>{" "}
              ใช่หรือไม่?
              <br />
              เมื่อยืนยันแล้วข้อมูลจะถูกลบออกจากระบบ
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-center mt-2">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 px-6 py-2.5 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-xl transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200"
            >
              ยืนยัน
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
