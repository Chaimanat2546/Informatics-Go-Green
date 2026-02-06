"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { InputField } from "@/components/ui/input";
import { Button, ButtonWithIcon } from "@/components/ui/button";

interface AuthLoginFormProps {
  onNavigate: (view: "login" | "register" | "forgot-password") => void;
  showMessage: (text: string, error?: boolean) => void;
  handleGoogleLogin: () => void;
}

export default function AuthLoginForm({
  onNavigate,
  showMessage,
  handleGoogleLogin,
}: AuthLoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (Invalid JSON response)");
      }

      if (response.ok) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        showMessage("เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนหน้า...");

        // Redirect based on user role
        const redirectPath =
          data.user.role === "admin" ? "/admin/users" : "/wasteTracking/home";
        setTimeout(() => router.push(redirectPath), 1000);
      } else {
        if (response.status === 401) {
          showMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง", true);
        } else if (response.status === 400) {
          const errorMessage = Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message;
          showMessage(errorMessage || "ข้อมูลไม่ถูกต้อง", true);
        } else {
          showMessage(data.message || "เข้าสู่ระบบไม่สำเร็จ", true);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full animate-in fade-in duration-500">
      <Image
        src="/leaf.png"
        alt="Logo"
        width={64}
        height={64}
        className="mx-auto mb-6"
      />
      <h1 className="text-2xl font-semibold text-center mb-2">ยินดีต้อนรับ</h1>
      <p className="text-sm font-regular text-center mb-6 text-muted-foreground">
        เข้าสู่ระบบด้วยบัญชีของคุณ
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
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
            className="mb-4 w-full"
            label="รหัสผ่าน"
            labelExtra={
              <button
                type="button"
                onClick={() => onNavigate("forgot-password")}
                className="text-primary hover:underline text-sm font-regular"
              >
                ลืมรหัสผ่าน
              </button>
            }
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full disabled:opacity-50"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
      </form>

      <div className="my-4 flex items-center">
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
        เข้าสู่ระบบด้วยบัญชี Google
      </ButtonWithIcon>

      <p className="text-center mt-4 text-sm">
        ยังไม่มีบัญชี?{" "}
        <button
          onClick={() => onNavigate("register")}
          className="text-primary hover:underline hover:cursor-pointer"
        >
          สมัครสมาชิก
        </button>
      </p>
    </div>
  );
}
