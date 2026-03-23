"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p));

    if (!isPublicPath) {
      // Allow through if there is a token in the URL — the page will store it before making API calls
      const tokenFromUrl = searchParams.get("token");
      const tokenFromStorage = localStorage.getItem("token");
      if (!tokenFromUrl && !tokenFromStorage) {
        router.push("/auth/login");
        return;
      }
    }

    const authCheckTimer = setTimeout(() => {
      setIsReady(true);
    }, 0);

    return () => clearTimeout(authCheckTimer);
  }, [pathname, router, searchParams]);

  if (!isReady) {
    const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p));
    if (!isPublicPath) {
      return <div className="min-h-screen bg-green-50 flex items-center justify-center"></div>;
    }
  }

  return <>{children}</>;
}
