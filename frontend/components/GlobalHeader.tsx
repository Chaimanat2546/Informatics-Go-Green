"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Leaf,
  History,
  User,
  LucideIcon,
  BarChart3,
  ScanLine,
} from "lucide-react";

const pageConfig: Record<
  string,
  { title: string; icon?: LucideIcon; showBack?: boolean }
> = {
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
  "/wasteTracking/wasteSorting/carbonSummary": {
    title: "การคัดแยก",
    icon: undefined,
    showBack: true,
  },
  "/wasteTracking/wasteStats": {
    title: "สถิติ",
    icon: BarChart3,
    showBack: false,
  },
  "/auth/edit-profile": { title: "แก้ไขโปรไฟล์", icon: User },
  "/auth/dashboard": { title: "โปรไฟล์", icon: User },
};

export default function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();

  let currentPage = pageConfig[pathname];

  if (!currentPage) {
    if (pathname.startsWith("/wasteTracking/wasteHistory/")) {
      currentPage = {
        title: "ประวัติการคัดแยก", 
        showBack: false,     
        icon: History,
      };
    } 
    if (pathname.startsWith("/wasteTracking/wasteScaner/")) {
      currentPage = {
        title: "สแกนบาร์โค้ดขยะ", 
        showBack: false,     
        icon: ScanLine,
      };
    } 
  }

  if (!currentPage) {
    return null; 
  }
  
  const Icon = currentPage.icon;

  if (
    pathname === "/auth/login" ||
    pathname === "/wasteTracking/home" ||
    pathname === "/wasteTracking/wasteScaner" 

  )
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