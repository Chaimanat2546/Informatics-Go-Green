"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/users");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">กำลังโหลด...</p>
    </div>
  );
}
