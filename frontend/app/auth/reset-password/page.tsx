"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import AuthResetPasswordForm from "@/components/auth/AuthResetPasswordForm";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-green-700 flex-col">
      <Card className="max-w-md w-full p-6">
        <AuthResetPasswordForm token={token} />
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>กำลังโหลด...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
