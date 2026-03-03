"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
}

export default function CreateWasteMaterial() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",           
    emissionFactor: "",
    unit: "",
  });

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบ");
        router.push("/auth/login");
        return;
      }

      try {
        setIsLoading(true);
        
        const url = `${API_URL}/admin/waste-categories`;
        
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else if (response.status === 401) {
          toast.error("Session หมดอายุ");
          localStorage.removeItem("token");
          router.push("/auth/login");
        } else if (response.status === 403) {
          toast.error("คุณไม่มีสิทธิ์เข้าถึง");
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("ไม่สามารถโหลดหมวดหมู่ได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [API_URL, router]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์ใหญ่เกิน 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.error("รองรับเฉพาะไฟล์ JPG และ PNG");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Upload Image
  const uploadImage = async (file: File): Promise<string | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/upload/waste-material-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
      
      return null;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  // ✅ Submit Form
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      router.push("/auth/login");
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      toast.error("กรุณากรอกชื่อขยะ");
      return;
    }
    if (!formData.categoryId) {
      toast.error("กรุณาเลือกหมวดหมู่");
      return;
    }
    if (!formData.emissionFactor) {
      toast.error("กรุณากรอกค่าสัมประสิทธิ์");
      return;
    }
    if (!formData.unit.trim()) {
      toast.error("กรุณากรอกหน่วย");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = '';
      
      // Upload image ถ้ามี
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const dataToSend = {
        name: formData.name.trim(),
        emissionFactor: parseFloat(formData.emissionFactor),
        unit: formData.unit.trim(),
        wasteCategoriesId: parseInt(formData.categoryId),
        ...(imageUrl && { meterialImage: imageUrl }),
      };

      const response = await fetch(`${API_URL}/admin/waste-materials/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success("บันทึกข้อมูลสำเร็จ!");
        router.push("/systemConfig/emission-factor");
      } else if (response.status === 401) {
        toast.error("Session หมดอายุ");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์เพิ่มข้อมูล");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // ✅ Add Category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/waste-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (response.ok) {
        const newCategoryData = await response.json();
        setCategories([...categories, newCategoryData]);
        setFormData({ ...formData, categoryId: newCategoryData.id.toString() });
        setNewCategory("");
        setShowAddCategory(false);
        toast.success("เพิ่มหมวดหมู่สำเร็จ");
      } else {
        toast.error("ไม่สามารถเพิ่มหมวดหมู่ได้");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-up">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            เพิ่มค่าสัมประสิทธิ์
          </h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white/60 overflow-hidden animate-scale">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8">
            {/* Left Section - File Upload */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">
                รูปภาพ
              </h3>

              <div
                className={`relative border-3 border-dashed rounded-2xl transition-all duration-300 overflow-hidden ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-50/50 scale-[1.02]"
                    : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-slate-100/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <div className="relative aspect-square group">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                      }}
                      className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center p-8 text-center">
                    <svg
                      className="w-16 h-16 text-slate-400 mb-4 animate-bounce"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-slate-600 font-medium mb-1">
                      ลากไฟล์มาวางที่นี่ หรือ
                    </p>
                    <p className="text-sm text-slate-500">
                      รองรับ JPG, PNG (ไม่เกิน 5MB)
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-300 flex items-center justify-center gap-2 disabled:from-slate-300 disabled:to-slate-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                เพิ่มรูปภาพ
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Right Section - Form Details */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  รายละเอียด
                </h3>
                <p className="text-slate-600">
                  กรอกรายละเอียดค่าพารามิเตอร์ของสินค้าใหม่
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    ชื่อขยะ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="เช่น ขวดน้ำพลาสติก PET (ใส)"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 bg-white/50 hover:bg-white"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    หมวดหมู่ <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      disabled={isLoading || isSubmitting}
                      className="flex-1 px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 bg-white/50 hover:bg-white appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem center",
                        backgroundSize: "1.5em 1.5em",
                      }}
                    >
                      <option value="">
                        {isLoading ? "กำลังโหลดข้อมูล..." : "เลือกหมวดหมู่"}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowAddCategory(!showAddCategory)}
                      disabled={isSubmitting}
                      className="px-4 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center disabled:bg-slate-300"
                      title="เพิ่มหมวดหมู่"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>

                  {showAddCategory && (
                    <div className="flex gap-2 animate-fade-up">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddCategory()
                        }
                        placeholder="พิมพ์หมวดหมู่ใหม่"
                        className="flex-1 px-4 py-2.5 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 bg-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg text-sm font-medium"
                      >
                        เพิ่ม
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategory("");
                        }}
                        className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      ค่าปัจจัยการปล่อยมลพิษ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      name="emissionFactor"
                      value={formData.emissionFactor}
                      onChange={handleInputChange}
                      placeholder="เช่น 2.1500"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 bg-white/50 hover:bg-white"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      หน่วย <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="เช่น PET, kg, ตัน"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 bg-white/50 hover:bg-white"
                      disabled={isSubmitting}
                    />
                  </div>
                </div> 
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-3.5 px-6 rounded-xl transition-all duration-300 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-xl active:scale-95 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                >
                  {isSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}