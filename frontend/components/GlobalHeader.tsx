"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Leaf,
  History,
  User,
  LucideIcon,
  Recycle,
} from "lucide-react";

const pageConfig: Record<
  string,
  { title: string; icon?: LucideIcon; showBack?: boolean }
> = {
  "/wasteTracking/wasteScaner": {
    title: "คัดแยก",
    icon: Recycle,
    showBack: true,
  },
  "/wasteTracking/wasteSorting": {
    title: "การคัดแยก",
    icon: undefined,
    showBack: true,
  },
  "/wasteTracking/wasteHistory": {
    title: "ประวัติการคัดแยก",
    icon: History,
    showBack: false,
  },
  "/auth/edit-profile": { title: "แก้ไขโปรไฟล์", icon: User },
  "/auth/dashboard": { title: "โปรไฟล์", icon: User },
};

export default function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = pageConfig[pathname] || {
    title: "Waste Tracking",
    showBack: true,
  };
  const Icon = currentPage.icon;

  if (pathname === "/auth/login" || pathname === "/wasteTracking/home")
    return null;

  return (
    <div
      className={`bg-green-600 h-34.5 rounded-b-[50px] px-6 pt-8 pb-4 relative z-0`}
    >
      <div className="flex justify-between items-center text-white">
        {currentPage.showBack ? (
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-green-700/50 rounded-full transition-colors"
          >
            <ChevronLeft size={32} strokeWidth={3} />
          </button>
        ) : Icon ? (
          <Icon size={40} strokeWidth={2.5} />
        ) : (
          <div className="w-8" />
        )}

        <h1 className="text-3xl font-bold">{currentPage.title}</h1>
        <div className="bg-white h-12.5 w-12.5 rounded-2xl flex justify-center items-center">
          <Leaf className="text-green-700" size={40} strokeWidth={4} />
        </div>
      </div>
    </div>
  );
}
