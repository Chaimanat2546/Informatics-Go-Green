"use client";

import React from "react";
import {
  FormInput,
  FormSelect,
} from "@/components/systemConfig/FormEmissionFactor";
import { ImageUploadSection } from "@/components/systemConfig/ImageUploadSection";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AddEmissionFactor() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // จำลองข้อมูล User สำหรับ Sidebar
  const mockUser = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. เรียกใช้ Sidebar ไว้ด้านซ้าย */}
      <AdminSidebar user={mockUser} />

      {/* 2. ส่วนเนื้อหาหลัก ต้องมี ml-64 (หรือความกว้างของ Sidebar) เพื่อไม่ให้โดนทับ */}
      <main className="flex-1 ml-64 p-4 md:p-8 flex justify-center items-start">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <h1 className="text-2xl font-bold mb-8 text-black">เพิ่มค่าแฟคเตอร์</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <ImageUploadSection />

            <div className="md:col-span-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">รายละเอียด</h2>
                <p className="text-sm text-gray-400 mt-1">กรอกรายละเอียดสำหรับวัสดุปล่อยพิษใหม่</p>
              </div>

              <div className="space-y-5">
                <FormInput label="ชื่อประเภทขยะ" placeholder="เช่น ขวดน้ำพลาสติก PET (ใส)" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect label="หมวดหมู่" options={["พลาสติก", "แก้ว", "กระดาษ", "โลหะ"]} />
                  <FormInput label="ค่าแฟคเตอร์ (Emission Factor)" placeholder="ค่าปัจจัยการปล่อยมลพิษ" />
                </div>

                <FormInput label="หน่วย (Unit)" placeholder="เช่น kg CO2e / kg" />
              </div>

              <div className="flex justify-end gap-3 pt-8">
                <button type="button" className="px-10 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-bold">
                  ยกเลิก
                </button>
                <button type="submit" className="px-10 py-2.5 bg-[#66a300] text-white rounded-xl hover:bg-[#558800] transition-all font-bold shadow-sm">
                  ยืนยัน
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}