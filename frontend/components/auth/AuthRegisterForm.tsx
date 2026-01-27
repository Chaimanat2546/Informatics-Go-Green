"use client";

import { useState } from "react";
import { InputField } from "@/components/ui/input";
import { Button, ButtonWithIcon } from "@/components/ui/button";

interface AuthRegisterFormProps {
  onNavigate: (view: "login" | "register" | "forgot-password") => void;
  showMessage: (text: string, error?: boolean) => void;
  handleGoogleLogin: () => void;
}

export default function AuthRegisterForm({
  onNavigate,
  showMessage,
  handleGoogleLogin,
}: AuthRegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      showMessage("รหัสผ่านไม่ตรงกัน", true);
      return false;
    }
    if (formData.password.length < 6) {
      showMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", true);
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password)) {
      showMessage("รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข", true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("สมัครสมาชิกสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...");
        setTimeout(() => onNavigate("login"), 2000);
      } else {
        showMessage(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "สมัครสมาชิกไม่สำเร็จ",
          true,
        );
      }
    } catch {
      showMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-center mb-6">สมัครสมาชิก</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <InputField
              label="ชื่อ"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="ชื่อ"
              required
              className="w-full"
            />
          </div>
          <div>
            <InputField
              label="นามสกุล"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="นามสกุล"
              required
              className="w-full"
            />
          </div>
        </div>

        <div>
          <InputField
            label="อีเมล"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
            className="w-full"
          />
        </div>

        <div>
          <InputField
            label="รหัสผ่าน"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข
          </p>
        </div>

        <div>
          <InputField
            label="ยืนยันรหัสผ่าน"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full disabled:opacity-50"
        >
          {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
        </Button>
      </form>

      <div className="my-6 flex items-center">
        <hr className="flex-1" />
        <span className="px-4 text-gray-500 text-sm">หรือ</span>
        <hr className="flex-1" />
      </div>

      <ButtonWithIcon
        className="btn bg-white text-foreground w-full border border-gray-200"
        onClick={handleGoogleLogin}
      >
        <svg
          aria-label="Google logo"
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <g>
            <path d="m0 0H512V512H0" fill="#fff"></path>
            <path
              fill="#34a853"
              d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
            ></path>
            <path
              fill="#4285f4"
              d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
            ></path>
            <path
              fill="#fbbc02"
              d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
            ></path>
            <path
              fill="#ea4335"
              d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
            ></path>
          </g>
        </svg>
        สมัครด้วยบัญชี Google
      </ButtonWithIcon>

      <p className="text-center mt-6 text-sm">
        มีบัญชีอยู่แล้ว?{" "}
        <button
          onClick={() => onNavigate("login")}
          className="text-primary hover:underline hover:cursor-pointer"
        >
          เข้าสู่ระบบ
        </button>
      </p>
    </div>
  );
}
