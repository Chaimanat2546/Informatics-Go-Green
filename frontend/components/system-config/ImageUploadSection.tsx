"use client";

import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

export const ImageUploadSection = () => (
  <div className="md:col-span-4 flex flex-col gap-4">
    <label className="text-sm font-medium text-gray-700">รูปภาพ</label>
    <div className="border-2 border-dashed border-gray-200 rounded-xl aspect-square flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
      <Upload className="w-10 h-10 text-gray-300 group-hover:text-green-600 mb-2 transition-colors" />
      <div className="text-center px-4">
        <p className="text-xs text-gray-500">ลากไฟล์มาวางที่นี่ หรือ</p>
        <p className="text-xs text-gray-400">รองรับ JPG, PNG (ไม่เกิน 5MB)</p>
      </div>
    </div>
    <button 
      type="button" 
      className="flex items-center justify-center gap-2 border border-green-600 text-green-600 py-2.5 rounded-lg hover:bg-green-50 transition-colors font-medium"
    >
      <ImageIcon size={18} />
      เพิ่มรูปภาพ
    </button>
  </div>
);