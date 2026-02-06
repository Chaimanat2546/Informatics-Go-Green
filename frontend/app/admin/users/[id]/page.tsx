"use client";

import { use } from "react";
import AdminUserProfile from "@/components/admin/AdminUserProfile";

export default function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return <AdminUserProfile userId={resolvedParams.id} />;
}
