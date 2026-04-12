"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface WasteCategory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface WasteMaterial {
  id: number;
  name: string;
  emissionFactor: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  materialImage?: string;
  wasteCategoryId: number;
  wasteCategory: WasteCategory;
}

interface Props {
  materialId: number;
}

export default function ViewWasteMaterial({ materialId }: Props) {
  const router = useRouter();
  const [material, setMaterial] = useState<WasteMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
        const response = await fetch(`${API_URL}/admin/waste-materials/${materialId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setMaterial(data);
        } else if (response.status === 401) {
          toast.error("Session หมดอายุ");
          localStorage.removeItem("token");
          router.push("/auth/login");
        } else if (response.status === 404) {
          toast.error("ไม่พบข้อมูล");
          router.push("/systemConfig/emission-factor");
        } else {
          toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialData();
  }, [API_URL, materialId, router]); // ✅ ใส่ dependencies ครบ

  // Helper: จัดการ URL รูปภาพ
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    // ถ้าเป็น absolute URL (http...) ใช้ตรงๆ
    if (url.startsWith('http')) return url;
    // ถ้าเป็น relative path (/uploads/...) เติม API_URL แต่เอา /api ออก
    if (url.startsWith('/')) {
      const baseUrl = API_URL.replace('/api', '');
      return `${baseUrl}${url}`;
    }
    return url;
  };


  const handleDelete = async () => {
    setIsDeleting(true);
    

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      router.push("/auth/login");
      setIsDeleting(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/waste-materials/${materialId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("ลบข้อมูลสำเร็จ");
        setIsDeleteModalOpen(false); 
        router.push("/systemConfig/emission-factor");
      } else if (response.status === 401) {
        toast.error("Session หมดอายุ");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์ลบข้อมูล");
      } else if (response.status === 409) {
        const errorData = await response.json();
        toast.error(errorData.message || "ไม่สามารถลบได้เนื่องจากมีการใช้งานข้อมูลนี้อยู่");
      } else {
        toast.error("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEdit = () => {
    router.push(`/systemConfig/emission-factor/${materialId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
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
            onClick={() => router.push("/systemConfig/emission-factor")}
            className="mt-4 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-200"
          >
            กลับหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto ">
        {/* Header */}
        <div className="mb-6 animate-fade-up">
          <button
            onClick={() => router.push("/systemConfig/emission-factor")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">กลับ</span>
          </button>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            รายละเอียดค่าสัมประสิทธิ์
          </h1>
          <p className="text-slate-600">ข้อมูลค่าสัมประสิทธิ์การปล่อยมลพิษ</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white/60 overflow-hidden animate-scale">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8">
            {/* Left Section - Image */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">รูปภาพ</h3>

              <div className="relative border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl overflow-hidden">
                {material.materialImage ? (
                  <div className="aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(material.materialImage)}
                      alt={material.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
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
                <h3 className="text-2xl font-bold text-slate-800 mb-2">รายละเอียด</h3>
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
                      {material.emissionFactor.toFixed(4)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      หน่วย
                    </label>
                    <div className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800">
                      {material.unit}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setIsDeleteModalOpen(true)} // เปลี่ยนตรงนี้
                  className="flex-1 bg-white border-2 border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 font-medium py-3.5 px-6 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบ
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  แก้ไข
                </button>

              </div>

            </div>
          </div>
        </div>
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40  p-4 transition-all">
          {/* Modal Box */}
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">

            {/* Icon */}
            <div className="mb-5">
              <Trash2
                className="w-16 h-16 text-slate-800"
                strokeWidth={1.5}
              />
            </div>

            {/* Texts */}
            <h3 className="text-[22px] font-semibold text-slate-800 mb-2">
              ยืนยันการลบข้อมูล
            </h3>
            <p className="text-slate-500 mb-8 text-[15px]">
              เมื่อยืนยันแล้วข้อมูลจะลบในระบบ
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-[#ef4444] hover:bg-red-600 rounded-xl text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? "กำลังลบ..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
