"use client";

import React from "react";
import Image from "next/image"; // นำเข้า Image component
import {
  FormInput,
  FormSelect,
} from "@/components/systemConfig/FormEmissionFactor";
import { useRouter } from "next/navigation";

export default function ViewEmissionFactor() {
  const router = useRouter();

  // ข้อมูลจำลองสำหรับแสดงผล
  const data = {
    name: "ขวดน้ำพลาสติก PET (ใส)",
    category: "พลาสติก",
    factor: "2.15",
    unit: "kg CO2e / kg",
    imageUrl: "/path-to-image.jpg" // ควรเปลี่ยนเป็น URL จริงจากฐานข้อมูล
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-8">ดูข้อมูลค่าสัมประสิทธิ์</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* ส่วนแสดงรูปภาพ */}
          <div className="md:col-span-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              รูปภาพ
            </label>
            <div className="relative border border-gray-100 rounded-xl aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
              {/* ใช้ Next.js Image เพื่อลด Warning และเพิ่มประสิทธิภาพ */}
              <Image
                src={data.imageUrl}
                alt="waste profile"
                fill
                className="object-cover"
                priority // ช่วยให้โหลดรูปที่เป็นส่วนสำคัญของหน้าได้เร็วขึ้น
              />
            </div>
          </div>

          {/* ส่วนแสดงรายละเอียด */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">รายละเอียด</h2>
              <p className="text-sm text-gray-400 mt-1 font-medium">
                ข้อมูลปัจจุบันของวัสดุในระบบ
              </p>
            </div>

            <div className="space-y-5">
              <FormInput 
                label="ชื่อขยะ" 
                value={data.name} 
                isReadOnly={true} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="หมวดหมู่"
                  options={["พลาสติก", "แก้ว", "กระดาษ"]}
                  value={data.category}
                  isReadOnly={true}
                />
                <FormInput
                  label="ค่าแฟคเตอร์ (Emission Factor)"
                  value={data.factor}
                  isReadOnly={true}
                />
              </div>
              
              <FormInput 
                label="หน่วย (Unit)" 
                value={data.unit} 
                isReadOnly={true} 
              />
            </div>

            {/* ปุ่มดำเนินการ */}
            <div className="flex justify-end gap-3 pt-8 border-t border-gray-50">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-10 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-bold"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={() => router.push("/systemConfig/editEmissionFactor/1")} // แก้ path ให้ตรงกับโครงสร้างคุณ
                className="px-10 py-2.5 bg-[#66a300] text-white rounded-xl hover:bg-[#558800] transition-all font-bold shadow-sm"
              >
                แก้ไข
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}