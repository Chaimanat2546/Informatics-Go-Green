import React from "react";
import { Button } from "../ui/button";
import { InputField } from "../ui/input";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  provider?: string;
  errorMessage?: string;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onSubmit,
  password,
  setPassword,
  loading,
  provider,
  errorMessage,
}: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-red-600">ลบบัญชี</h2>
        <p className="text-gray-600 mb-4">
          การลบบัญชีจะไม่สามารถกู้คืนได้ ข้อมูลทั้งหมดจะถูกลบออกจากระบบ
        </p>

        {errorMessage && (
          <div className="p-3 rounded mb-4 text-center bg-red-100 text-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <InputField
              label={
                provider === "local"
                  ? "กรอกรหัสผ่านเพื่อยืนยัน"
                  : "พิมพ์ DELETE เพื่อยืนยัน"
              }
              type={provider === "local" ? "password" : "text"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={provider === "local" ? "••••••••" : "DELETE"}
              required
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
              disabled={
                loading || (provider !== "local" && password !== "DELETE")
              }
              className="flex-1 p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? "กำลังลบ..." : "ลบบัญชี"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
