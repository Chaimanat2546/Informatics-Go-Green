"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { THAI_PROVINCES } from "@/app/auth/edit-profile/thai-provinces";
import { InputField } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, ButtonWithIcon } from "@/components/ui/button";
import { IconUser } from "@tabler/icons-react";
import { toast } from "sonner";

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

interface EditProfileFormProps {
  user: User;
  onUpdate?: (updatedUser: User) => void;
  onCancel?: () => void;
}

export default function EditProfileForm({
  user,
  onUpdate,
  onCancel,
}: EditProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [province, setProvince] = useState(user.province || "");
  const [profilePicture, setProfilePicture] = useState(
    user.profilePicture || "",
  );

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  useEffect(() => {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhoneNumber(user.phoneNumber || "");
    setProvince(user.province || "");
    setProfilePicture(user.profilePicture || "");
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      setError("กรุณาเลือกไฟล์รูปภาพ (JPEG, PNG, GIF, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/upload/profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setProfilePicture(data.url);
        setMessage("อัปโหลดรูปโปรไฟล์สำเร็จ");
      } else {
        setError(data.message || "ไม่สามารถอัปโหลดรูปได้");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
  };

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      setError("กรุณากรอกชื่อ");
      return false;
    }
    if (!lastName.trim()) {
      setError("กรุณากรอกนามสกุล");
      return false;
    }
    if (phoneNumber && !/^[0-9]{9,10}$/.test(phoneNumber)) {
      setError("เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber || undefined,
          province: province || undefined,
          profilePicture: profilePicture || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (onUpdate) {
          onUpdate(data);
        }
        toast.success("บันทึกข้อมูลสำเร็จ!");
        router.push("/auth/dashboard");
      } else {
        if (Array.isArray(data.message)) {
          setError(data.message.join(", "));
        } else {
          setError(data.message || "ไม่สามารถบันทึกข้อมูลได้");
        }
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/auth/dashboard");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Profile Picture Section */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="relative w-28 h-28 rounded-full overflow-hidden cursor-pointer border-4"
          onClick={handleImageClick}
        >
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-background flex justify-center items-center">
              <IconUser size={48} className="text-white" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/60 flex justify-center items-center">
            <span>📷</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />
        <p className="mt-2 text-sm text-gray-500">
          {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่อเปลี่ยนรูปโปรไฟล์"}
        </p>
      </div>
      <hr className="my-6" />

      {/* Messages */}
      {message && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-center">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            type="text"
            label="ชื่อ"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="ชื่อ"
            required
          />
          <InputField
            type="text"
            label="นามสกุล"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="นามสกุล"
            required
          />
        </div>
        <div>
          <Field>
            <FieldLabel htmlFor="email">อีเมล</FieldLabel>
            <input
              type="email"
              value={user?.email || ""}
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">ไม่สามารถแก้ไขอีเมลได้</p>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="province">จังหวัด</FieldLabel>
          <Select value={province} onValueChange={setProvince}>
            <SelectTrigger id="province">
              <SelectValue placeholder="เลือกจังหวัด" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-[300px]">
              {THAI_PROVINCES.map((prov) => (
                <SelectItem key={prov} value={prov}>
                  {prov}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <InputField
          type="tel"
          label="เบอร์โทรศัพท์"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="0xxxxxxxxx"
          maxLength={10}
        />

        <div className="flex gap-4 pt-4">
          <ButtonWithIcon
            type="button"
            onClick={handleCancel}
            className="flex-1"
          >
            ยกเลิก
          </ButtonWithIcon>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </form>
    </div>
  );
}
