"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardContentLarge } from "@/components/ui/card";
import EditProfileForm from "@/components/auth/EditProfileForm";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  province?: string;
  profilePicture?: string;
  provider?: string;
  createdAt: string;
}

function EditProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  useEffect(() => {
    let ignore = false;

    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, document.title, "/auth/edit-profile");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (ignore) return;

        if (response.ok) {
          setUser(data);
          setLoading(false);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/auth/login");
        }
      } catch {
        if (!ignore) {
          setError("Network error. Please try again.");
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      ignore = true;
    };
  }, [router, searchParams, API_URL]);

  const handleUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleCancel = () => {
    router.push("/auth/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <CardContentLarge className="p-6">
        {user && (
          <EditProfileForm
            user={user}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
          />
        )}
      </CardContentLarge>
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col justify-center items-center">
          <p>กำลังโหลด...</p>
        </div>
      }
    >
      <EditProfileContent />
    </Suspense>
  );
}
