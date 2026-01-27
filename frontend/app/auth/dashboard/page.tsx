"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import MenuBar from "@/components/wasteTracking/MenuBar";

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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
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

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/email`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setShowEmailModal(false);
        setNewEmail("");
        setPassword("");
        showMessageFn("เปลี่ยนอีเมลสำเร็จ!");
      } else {
        showMessageFn(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "เปลี่ยนอีเมลไม่สำเร็จ",
          true,
        );
      }
    } catch {
      showMessageFn("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setActionLoading(false);
    }
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
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        {message && (
          <div
            className={`p-3 rounded mb-4 text-center ${isError ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
          >
            {message}
          </div>
        )}
        <Card className="bg-background rounded-lg shadow p-6">
          {user && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-2xl text-white font-bold">
                      {user.firstName?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">
                    สวัสดี, {user.firstName} {user.lastName}!
                  </h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">ชื่อ</span>
                  <span className="font-medium">{user.firstName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">นามสกุล</span>
                  <span className="font-medium">{user.lastName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">อีเมล</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.email}</span>
                    {user.provider === "local" && (
                      <button
                        onClick={() => setShowEmailModal(true)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        เปลี่ยน
                      </button>
                    )}
                  </div>
                </div>
                {user.phoneNumber && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">เบอร์โทรศัพท์</span>
                    <span className="font-medium">{user.phoneNumber}</span>
                  </div>
                )}
                {user.province && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">จังหวัด</span>
                    <span className="font-medium">{user.province}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">ล็อกอินด้วย</span>
                  <span className="font-medium">
                    {user.provider || "local"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">สมัครสมาชิกเมื่อ</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString("th-TH")}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => router.push("/auth/edit-profile")}
                  className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  แก้ไขโปรไฟล์
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 p-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                >
                  ออกจากระบบ
                </button>
              </div>

              {user.provider === "local" && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full p-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm"
                  >
                    เปลี่ยนรหัสผ่าน
                  </button>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full p-2 text-red-500 hover:bg-red-50 rounded text-sm"
                >
                  ลบบัญชี
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Change Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">เปลี่ยนอีเมล</h2>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  อีเมลใหม่
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="example@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  รหัสผ่านปัจจุบัน
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setNewEmail("");
                    setPassword("");
                  }}
                  className="flex-1 p-2 border rounded hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {actionLoading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">เปลี่ยนรหัสผ่าน</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  รหัสผ่านปัจจุบัน
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
                  className="flex-1 p-2 border rounded hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {actionLoading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">ลบบัญชี</h2>
            <p className="text-gray-600 mb-4">
              การลบบัญชีจะไม่สามารถกู้คืนได้ ข้อมูลทั้งหมดจะถูกลบออกจากระบบ
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {user?.provider === "local"
                    ? "กรอกรหัสผ่านเพื่อยืนยัน"
                    : 'พิมพ์ "DELETE" เพื่อยืนยัน'}
                </label>
                <input
                  type={user?.provider === "local" ? "password" : "text"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder={
                    user?.provider === "local" ? "••••••••" : "DELETE"
                  }
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPassword("");
                  }}
                  className="flex-1 p-2 border rounded hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={
                    actionLoading ||
                    (user?.provider !== "local" && password !== "DELETE")
                  }
                  className="flex-1 p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {actionLoading ? "กำลังลบ..." : "ลบบัญชี"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
