"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  province?: string;
  profilePicture?: string;
  isActive: boolean;
  role: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/admin/users/${resolvedParams.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else if (response.status === 404) {
          toast.error("ไม่พบผู้ใช้งาน");
          router.push("/admin/users");
        } else if (response.status === 403) {
          router.push("/auth/dashboard");
        }
      } catch {
        toast.error("เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [resolvedParams.id, router, API_URL]);

  const handleToggleStatus = async () => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${user.id}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setUser((prev) =>
          prev ? { ...prev, isActive: !prev.isActive } : null,
        );
      } else {
        toast.error("ไม่สามารถเปลี่ยนสถานะได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/users")}
          className="h-9"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับ
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์ผู้ใช้</h1>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-100">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.profilePicture} alt={user.firstName} />
            <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              {user.isActive ? (
                <Badge
                  variant="outline"
                  className="border-green-500 text-green-600 bg-green-50"
                >
                  ใช้งานอยู่
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-orange-500 text-orange-600 bg-orange-50"
                >
                  ระงับการใช้งาน
                </Badge>
              )}
            </div>
            <p className="text-gray-500 mb-4">{user.email}</p>
            <Button
              onClick={handleToggleStatus}
              variant={user.isActive ? "destructive" : "default"}
              size="sm"
              className={user.isActive ? "" : "bg-green-600 hover:bg-green-700"}
            >
              {user.isActive ? "ระงับบัญชี" : "ปลดระงับบัญชี"}
            </Button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">อีเมล</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                <p className="text-gray-900">{user.phoneNumber || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">จังหวัด</p>
                <p className="text-gray-900">{user.province || "-"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">ผู้ให้บริการ</p>
                <p className="text-gray-900 capitalize">{user.provider}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">บทบาท</p>
                <p className="text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">สมาชิกตั้งแต่</p>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
