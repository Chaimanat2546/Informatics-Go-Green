"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardContentLarge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, UserCog } from "lucide-react";
import MenuBar from "@/components/wasteTracking/MenuBar";
import UserProfile from "@/components/auth/UserProfile";
import ChangePasswordModal from "@/components/auth/ChangePasswordModal";
import DeleteAccountModal from "@/components/auth/DeleteAccountModal";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  province?: string;
  profilePicture?: string;
  provider?: string;
  createdAt: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Modal states

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const showMessageFn = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
    setTimeout(() => setMessage(""), 5000);
  };

  useEffect(() => {
    let ignore = false;

    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      // Remove token from URL

      // *****edit route and return *****
      // window.history.replaceState({}, document.title, '/auth/dashboard');
      router.push("/wasteTracking/home");
      return;
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
          showMessageFn("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", true);
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      ignore = true;
    };
  }, [router, searchParams, API_URL]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      showMessageFn("รหัสผ่านใหม่ไม่ตรงกัน", true);
      return;
    }

    if (newPassword.length < 6) {
      showMessageFn("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร", true);
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword)) {
      showMessageFn(
        "รหัสผ่านใหม่ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข",
        true,
      );
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        showMessageFn("เปลี่ยนรหัสผ่านสำเร็จ!");
      } else {
        showMessageFn(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ",
          true,
        );
      }
    } catch {
      showMessageFn("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
      } else {
        showMessageFn(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "ลบบัญชีไม่สำเร็จ",
          true,
        );
      }
    } catch {
      showMessageFn("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        {message && (
          <div
            className={`p-3 rounded mb-4 text-center ${isError ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
          >
            {message}
          </div>
        )}
        <CardContentLarge className="min-h-100">
          {user && <UserProfile user={user} onLogout={handleLogout} />}
        </CardContentLarge>
        {user && (
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push("/auth/edit-profile")}
              className="bg-green-50 text-secondary-foreground hover:bg-green-200 shadow-xl flex flex-col items-center h-28 w-28"
            >
              <div className="flex flex-col items-center gap-2">
                <UserCog className="size-10" />
                <p className="text-lg">แก้ไขโปรไฟล์</p>
              </div>
            </Button>
            {user.provider === "local" && (
              <Button
                onClick={() => setShowPasswordModal(true)}
                className="bg-green-50 text-secondary-foreground hover:bg-green-200 shadow-xl flex flex-col items-center h-28 w-28"
              >
                <div className="flex flex-col items-center gap-2">
                  <Settings className="size-10" />
                  <p className="text-lg">แก้ไขรหัสผ่าน</p>
                </div>
              </Button>
            )}
            <Button
              onClick={() => setShowDeleteModal(true)}
              className="bg-green-50 text-secondary-foreground hover:bg-red-200 shadow-xl flex flex-col items-center h-28 w-28"
            >
              <div className="flex flex-col items-center gap-2">
                <Trash2 className="size-10 text-red-700" />
                <p className="text-lg">ลบบัญชี</p>
              </div>
            </Button>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
        }}
        onSubmit={handleChangePassword}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmNewPassword={confirmNewPassword}
        setConfirmNewPassword={setConfirmNewPassword}
        loading={actionLoading}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPassword("");
        }}
        onSubmit={handleDeleteAccount}
        password={password}
        setPassword={setPassword}
        loading={actionLoading}
        provider={user?.provider}
      />
      <MenuBar activeTab="profile" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>กำลังโหลด...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
