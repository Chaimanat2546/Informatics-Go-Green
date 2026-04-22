"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardContentLarge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, UserCog, Leaf } from "lucide-react";
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

  // ... (rest of states and effects)

  return (
    <main className="min-h-screen bg-[#EAF6F1] overflow-y-auto overflow-x-hidden font-sans">
      <header className="bg-green-600 px-6 pt-10 pb-24 rounded-b-[50px] relative z-0">
        <div className="flex justify-between items-center">
          <div className=" leading-9 font text-3xl font-semibold text-white">
            {user ? `สวัสดี ${user.firstName}` : "โปรไฟล์"}
          </div>
          <div className="bg-white h-12.5 w-12.5 rounded-2xl flex justify-center items-center">
            <Leaf className="text-green-700" size={40} strokeWidth={4} />
          </div>
        </div>
      </header>

      <div className="px-6 -mt-16 relative z-10 pb-24">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center min-h-[300px] flex items-center justify-center">
            <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
          </div>
        ) : (
          <>
            {message && (
              <div
                className={`p-3 rounded mb-4 text-center ${isError ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
              >
                {message}
              </div>
            )}
            <CardContentLarge className="min-h-100 mb-6">
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
          </>
        )}
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          setPasswordError("");
        }}
        onSubmit={handleChangePassword}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmNewPassword={confirmNewPassword}
        setConfirmNewPassword={setConfirmNewPassword}
        loading={actionLoading}
        errorMessage={passwordError}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPassword("");
          setDeleteError("");
        }}
        onSubmit={handleDeleteAccount}
        password={password}
        setPassword={setPassword}
        loading={actionLoading}
        provider={user?.provider}
        errorMessage={deleteError}
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
