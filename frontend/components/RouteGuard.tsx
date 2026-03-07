"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const publicPaths = ["/auth/login", "/auth/register", "/auth/forgot-password"];
    
    // Check if current path is a public path
    const isPublicPath = publicPaths.some(p => pathname.startsWith(p));
    
    if (!isPublicPath) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return; // Don't set ready to avoid flash of content
      }
    }
    const authCheckTimer = setTimeout(() => {
      setIsReady(true);
    }, 0);

    return () => clearTimeout(authCheckTimer);
  }, [pathname, router]);

  // Optionally hide content until auth check completes, but returning children directly is smoother
  // Just returning children allows server-rendered HTML to be visible if desired,
  // but we hide it for protected routes if not ready to prevent flashing unauthorized content.
  if (!isReady) {
    const isPublicPath = ["/auth/login", "/auth/register", "/auth/forgot-password"].some(p => pathname.startsWith(p));
    if (!isPublicPath) {
        return <div className="min-h-screen bg-green-50 flex items-center justify-center"></div>;
    }
  }

  return <>{children}</>;
}
