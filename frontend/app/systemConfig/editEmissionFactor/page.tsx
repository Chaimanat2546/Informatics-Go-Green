"use client";

import React from "react";
import {
  FormInput,
  FormSelect,
} from "@/components/system-config/FormEmissionFactor";
import { ImageUploadSection } from "@/components/system-config/ImageUploadSection";

export default function EditEmissionFactor() {
  const data = {
    name: "ขวดน้ำพลาสติก PET (ใส)",
    category: "พลาสติก",
    factor: "2.15",
    unit: "kg CO2e / kg",
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-8 text-black">แก้ไขค่าแฟคเตอร์</h1>

        <form className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <ImageUploadSection />

          <div className="md:col-span-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">รายละเอียด</h2>
              <p className="text-sm text-gray-400 mt-1">
                กรอกรายละเอียดสำหรับวัสดุปล่อยพิษใหม่
              </p>
            </div>

            <div className="space-y-5">
              <FormInput
                label="ชื่อประเภทขยะ"
                value={data.name}
                placeholder="กรอกชื่อขยะ"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="หมวดหมู่"
                  options={["พลาสติก", "แก้ว", "กระดาษ", "โลหะ"]}
                  value={data.category}
                />
                <FormInput
                  label="ค่าแฟคเตอร์ (EmissionFactor)"
                  value={data.factor}
                />
                <FormInput label="หน่วย (Unit)" value={data.unit} />
              </div>

              <div className="flex justify-end gap-3 pt-8">
                <button
                  type="button"
                  className="px-10 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-bold"
              >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-10 py-2.5 bg-[#66a300] text-white rounded-xl hover:bg-[#558800] transition-all font-bold shadow-sm"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
