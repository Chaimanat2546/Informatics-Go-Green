"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Search, Plus, Trash2, ChevronDown, Check, X, Loader2, AlertCircle } from "lucide-react";

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
    unit: "kg CO₂e/kg",
  });

  // Category Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        const response = await fetch(`${API_URL}/admin/waste-categories`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else if (response.status === 401) {
          toast.error("Session หมดอายุ");
          localStorage.removeItem("token");
          router.push("/auth/login");
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

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (file.size > 10 * 1024 * 1024) { // Updated to 10MB
      toast.error("ไฟล์ใหญ่เกิน 10MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.error("รองรับเฉพาะไฟล์ JPG และ PNG");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_URL}/admin/upload/waste-material-picture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
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

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      router.push("/auth/login");
      return;
    }

    if (!formData.name.trim()) return toast.error("กรุณากรอกชื่อขยะ");
    if (!formData.categoryId) return toast.error("กรุณาเลือกหมวดหมู่");
    if (formData.emissionFactor === "") return toast.error("กรุณากรอกค่าสัมประสิทธิ์");

    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const dataToSend = {
        name: formData.name.trim(),
        emissionFactor: parseFloat(formData.emissionFactor),
        unit: formData.unit.trim(),
        wasteCategoryId: parseInt(formData.categoryId),
        ...(imageUrl && { materialImage: imageUrl }),
      };

      const response = await fetch(`${API_URL}/admin/waste-materials`, {
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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return toast.error("กรุณากรอกชื่อหมวดหมู่");
    const token = localStorage.getItem("token");
    if (!token) return;

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
        const newCat = await response.json();
        setCategories([...categories, newCat]);
        setFormData({ ...formData, categoryId: newCat.id.toString() });
        setNewCategory("");
        setShowAddCategory(false);
        setCategorySearch("");
        toast.success("เพิ่มหมวดหมู่สำเร็จ");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "ไม่สามารถเพิ่มหมวดหมู่ได้");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, categoryId: number, categoryName: string) => {
    e.stopPropagation();
    if (!confirm(`คุณต้องการลบหมวดหมู่ "${categoryName}" ใช่หรือไม่?`)) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setIsDeletingCategory(categoryId);
    try {
      const response = await fetch(`${API_URL}/admin/waste-categories/${categoryId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== categoryId));
        if (formData.categoryId === categoryId.toString()) {
          setFormData({ ...formData, categoryId: "" });
        }
        toast.success("ลบหมวดหมู่สำเร็จ");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "ไม่สามารถลบหมวดหมู่ได้");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsDeletingCategory(null);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const selectedCategoryName = categories.find(c => c.id.toString() === formData.categoryId)?.name;

  return (
    <div className="font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">เพิ่มค่าสัมประสิทธิ์</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white/60 overflow-hidden animate-scale">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8">
            {/* Left Section - File Upload */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">รูปภาพ</h3>
              <div
                className={`relative border-3 border-dashed rounded-2xl transition-all duration-300 overflow-hidden ${dragActive
                    ? "border-emerald-500 bg-emerald-50/50 scale-[1.02]"
                    : "border-slate-300 bg-slate-50/50 hover:border-emerald-400"
                  }`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                {previewUrl ? (
                  <div className="relative aspect-square group">
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    <button
                      onClick={() => { setSelectedFile(null); setPreviewUrl(""); }}
                      className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center p-8 text-center">
                    <Plus className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-slate-600 font-medium mb-1">ลากไฟล์มาวางที่นี่ หรือ</p>
                    <p className="text-sm text-slate-400">รองรับ JPG, PNG (ไม่เกิน 10MB)</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                เลือกไฟล์จากเครื่อง
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Right Section - Form Details */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">รายละเอียด</h3>
                <p className="text-slate-500">กรอกรายละเอียดค่าสัมประสิทธิ์การปล่อยมลพิษ</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">ชื่อขยะ <span className="text-red-500">*</span></label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleInputChange}
                    placeholder="เช่น ขวดน้ำพลาสติก PET (ใส)"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 focus:bg-white outline-none transition-all duration-200 bg-slate-50"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2" ref={dropdownRef}>
                  <label className="block text-sm font-bold text-slate-700">หมวดหมู่ <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => !isSubmitting && setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 bg-slate-50 ${isDropdownOpen ? 'border-emerald-500 ring-4 ring-emerald-50 bg-white' : 'border-slate-100 hover:border-slate-200'}`}
                      disabled={isSubmitting}
                    >
                      <span className={selectedCategoryName ? "text-slate-800 font-medium" : "text-slate-400"}>
                        {isLoading ? "กำลังโหลดข้อมูล..." : (selectedCategoryName || "เลือกหมวดหมู่")}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Search in Dropdown */}
                        <div className="p-3 border-b border-slate-50 flex items-center gap-2">
                          <Search className="w-4 h-4 text-slate-400 ml-2" />
                          <input
                            type="text"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            placeholder="ค้นหาหมวดหมู่..."
                            className="w-full py-1 text-sm outline-none placeholder:text-slate-400"
                            autoFocus
                          />
                          <button 
                            type="button"
                            onClick={() => setShowAddCategory(true)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                            title="เพิ่มหมวดหมู่ใหม่"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                          {showAddCategory ? (
                            <div className="p-3 bg-emerald-50/50">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newCategory}
                                  onChange={(e) => setNewCategory(e.target.value)}
                                  placeholder="ชื่อหมวดหมู่ใหม่"
                                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button
                                  type="button" onClick={handleAddCategory}
                                  className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold"
                                >
                                  บันทึก
                                </button>
                                <button
                                  type="button" onClick={() => {setShowAddCategory(false); setNewCategory("");}}
                                  className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => (
                              <div
                                key={cat.id}
                                onClick={() => {
                                  setFormData({ ...formData, categoryId: cat.id.toString() });
                                  setIsDropdownOpen(false);
                                  setCategorySearch("");
                                }}
                                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors group ${formData.categoryId === cat.id.toString() ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'}`}
                              >
                                <div className="flex items-center gap-3">
                                  {formData.categoryId === cat.id.toString() && <Check className="w-4 h-4" />}
                                  <span className="text-sm font-medium">{cat.name}</span>
                                </div>
                                <button
                                  onClick={(e) => handleDeleteCategory(e, cat.id, cat.name)}
                                  className={`p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${isDeletingCategory === cat.id ? 'opacity-100' : ''}`}
                                  disabled={isDeletingCategory === cat.id}
                                >
                                  {isDeletingCategory === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <p className="text-sm text-slate-400">ไม่พบหมวดหมู่ที่ค้นหา</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">ค่า Emission Factor <span className="text-red-500">*</span></label>
                    <input
                      type="number" step="0.0001" name="emissionFactor" value={formData.emissionFactor} onChange={handleInputChange}
                      placeholder="เช่น 2.1500"
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 focus:bg-white outline-none transition-all duration-200 bg-slate-50 font-mono"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">หน่วย</label>
                    <input
                      type="text" value="kg CO₂e/kg" disabled
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button" onClick={() => router.back()} disabled={isSubmitting}
                  className="flex-1 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 font-bold py-4 px-6 rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button" onClick={handleSubmit} disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "บันทึกข้อมูล"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
