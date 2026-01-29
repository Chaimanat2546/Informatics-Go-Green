"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InputField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthResetPasswordFormProps {
  token: string | null;
  showMessage?: (text: string, error?: boolean) => void;
}

export default function AuthResetPasswordForm({
  token,
  showMessage,
}: AuthResetPasswordFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState(
    !token ? "ลิงก์ไม่ถูกต้อง ไม่พบ token" : "",
  );
  const [isError, setIsError] = useState(!token);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const handleShowMessage = (text: string, error = false) => {
    if (showMessage) {
      showMessage(text, error);
    } else {
      setLocalMessage(text);
      setIsError(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      handleShowMessage("รหัสผ่านไม่ตรงกัน", true);
      return false;
    }
    if (formData.password.length < 6) {
      handleShowMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", true);
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password)) {
      handleShowMessage(
        "รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข",
        true,
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        handleShowMessage("รีเซ็ตรหัสผ่านสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...");
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        handleShowMessage(data.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ", true);
      }
    } catch {
      handleShowMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full">
      <h1 className="text-2xl font-bold text-center mb-6">รีเซ็ตรหัสผ่าน</h1>

      {localMessage && !showMessage && (
        <div
          className={`p-3 rounded mb-4 text-center ${isError ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
        >
          {localMessage}
        </div>
      )}

      {token && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputField
              label="รหัสผ่านใหม่"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
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
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-50"
          >
            {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
          </Button>
        </form>
      )}

      <p className="text-center mt-6 text-sm">
        <a
          href="/auth/login"
          className="text-primary hover:underline hover:cursor-pointer"
        >
          ← กลับไปหน้าเข้าสู่ระบบ
        </a>
      </p>
    </div>
  );
}
