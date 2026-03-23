"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Component that uses useSearchParams - must be wrapped in Suspense
function RouteGuardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!isPublicPath) {
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
    const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (!isPublicPath) {
      return <div className="min-h-screen bg-green-50 flex items-center justify-center"></div>;
    }
  }

  return <>{children}</>;
}

// Main RouteGuard component wrapped in Suspense
export default function RouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-green-50 flex items-center justify-center"></div>}>
      <RouteGuardContent>{children}</RouteGuardContent>
    </Suspense>
  );
}
