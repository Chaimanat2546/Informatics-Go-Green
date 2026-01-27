"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import AuthLoginForm from "@/components/auth/AuthLoginForm";
import AuthRegisterForm from "@/components/auth/AuthRegisterForm";
import AuthForgotPasswordForm from "@/components/auth/AuthForgotPasswordForm";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<"login" | "register" | "forgot-password">(
    "login",
  );
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const showMessage = (text: string, error = false): void => {
    setMessage(text);
    setIsError(error);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/auth/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-green-700 flex-col gap-6">
      <Card className="max-w-md w-full p-6">
        {message && (
          <div
            className={`p-3 rounded mb-4 text-center ${
              isError
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {message}
          </div>
        )}

        {view === "login" && (
          <AuthLoginForm
            onNavigate={setView}
            showMessage={showMessage}
            handleGoogleLogin={handleGoogleLogin}
          />
        )}
        {view === "register" && (
          <AuthRegisterForm
            onNavigate={setView}
            showMessage={showMessage}
            handleGoogleLogin={handleGoogleLogin}
          />
        )}
        {view === "forgot-password" && (
          <AuthForgotPasswordForm
            onNavigate={setView}
            showMessage={showMessage}
          />
        )}
      </Card>
      <p className="text-center text-sm text-primary-foreground">
        เมื่อคลิกดำเนินการต่อ คุณยอมรับ <br />
        <u>ข้อกำหนดในการให้บริการ</u> และ <br />
        <u>นโยบายความเป็นส่วนตัวของเรา</u>
      </p>
    </div>
  );
}
