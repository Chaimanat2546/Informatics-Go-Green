"use client";

import { useState } from "react";
import { InputField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthForgotPasswordFormProps {
  onNavigate: (view: "login" | "register" | "forgot-password") => void;
  showMessage: (text: string, error?: boolean) => void;
}

export default function AuthForgotPasswordForm({
  onNavigate,
  showMessage,
}: AuthForgotPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          data.message ||
            "หากอีเมลของคุณลงทะเบียนไว้ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่าน",
        );
        setEmail("");
      } else {
        showMessage(data.message || "ไม่สามารถส่งอีเมลได้", true);
      }
    } catch {
      showMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-center mb-6">ลืมรหัสผ่าน</h1>

      <p className="text-gray-600 text-center mb-6 text-sm">
        กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้คุณ
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <InputField
            label="อีเมล"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full disabled:opacity-50"
        >
          {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
        </Button>
      </form>

      <p className="text-center mt-6 text-sm">
        <button
          onClick={() => onNavigate("login")}
          className="text-primary hover:underline hover:cursor-pointer"
        >
          ← กลับไปหน้าเข้าสู่ระบบ
        </button>
      </p>
    </div>
  );
}
