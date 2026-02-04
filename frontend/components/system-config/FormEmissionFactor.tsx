"use client";

import React from 'react';

export const FormInput = ({ 
  label, value, placeholder, isReadOnly = false 
}: { 
  label: string; value?: string; placeholder?: string; isReadOnly?: boolean 
}) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-bold text-gray-800">{label}</label>
    <input 
      readOnly={isReadOnly}
      defaultValue={value}
      placeholder={placeholder}
      className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
        isReadOnly 
          ? "bg-gray-50 border-gray-100 text-gray-500 cursor-default" 
          : "border-gray-200 focus:ring-2 focus:ring-green-500"
      }`}
    />
  </div>
);

export const FormSelect = ({ 
  label, options, value, isReadOnly = false 
}: { 
  label: string; options: string[]; value?: string; isReadOnly?: boolean 
}) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-bold text-gray-800">{label}</label>
    <div className="relative">
      <select 
        disabled={isReadOnly}
        defaultValue={value || ""} 
        className={`w-full p-2.5 border rounded-lg appearance-none outline-none transition-all ${
          isReadOnly 
            ? "bg-gray-50 border-gray-100 text-gray-500 cursor-default" 
            : "bg-white border-gray-200 focus:ring-2 focus:ring-green-500"
        }`}
      >
        <option value="" disabled>เลือก{label}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {!isReadOnly && (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      )}
    </div>
  </div>
);