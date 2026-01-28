"use client";

import React from "react";
import Image from "next/image";
import { Button } from "../ui/button";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  province?: string;
  profilePicture?: string;
  provider?: string;
  createdAt?: string;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export default function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        {user.profilePicture ? (
          <Image
            src={user.profilePicture}
            alt="Profile"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-2xl text-white font-bold">
              {user.firstName?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold">
            สวัสดี {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">ชื่อ</span>
          <span className="font-medium">{user.firstName}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">นามสกุล</span>
          <span className="font-medium">{user.lastName}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">อีเมล</span>
          <span className="font-medium">{user.email}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">เบอร์โทรศัพท์</span>
          <span
            className={`font-medium ${!user.phoneNumber ? "text-gray-400" : ""}`}
          >
            {user.phoneNumber || "ไม่มีข้อมูล"}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">จังหวัด</span>
          <span
            className={`font-medium ${!user.province ? "text-gray-400" : ""}`}
          >
            {user.province || "ไม่มีข้อมูล"}
          </span>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Button
          onClick={onLogout}
          className="flex-1 p-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 bg-white"
        >
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}
