import React from "react";
import { Button } from "../ui/button";
import { InputField } from "../ui/input";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (value: string) => void;
  loading: boolean;
  errorMessage?: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  loading,
  errorMessage,
}: ChangePasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">เปลี่ยนรหัสผ่าน</h2>

        {errorMessage && (
          <div className="p-3 rounded mb-4 text-center bg-red-100 text-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <InputField
              label="รหัสผ่านปัจจุบัน"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <InputField
              label="รหัสผ่านใหม่"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข
            </p>
          </div>
          <div>
            <InputField
              label="ยืนยันรหัสผ่านใหม่"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 p-2 border rounded hover:bg-gray-50 bg-white text-foreground"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 p-2 text-white rounded disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
