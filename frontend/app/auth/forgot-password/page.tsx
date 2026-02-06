"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page which includes the forgot password form
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>กำลังนำทาง...</p>
    </div>
  );
}
