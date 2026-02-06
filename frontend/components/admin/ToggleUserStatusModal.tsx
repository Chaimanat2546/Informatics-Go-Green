"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface ToggleUserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isCurrentlyActive: boolean;
  loading?: boolean;
}

export default function ToggleUserStatusModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isCurrentlyActive,
  loading = false,
}: ToggleUserStatusModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isCurrentlyActive ? (
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            ) : (
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            )}
            <DialogTitle>
              {isCurrentlyActive ? "ระงับบัญชีผู้ใช้" : "ปลดระงับบัญชีผู้ใช้"}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {isCurrentlyActive ? (
              <>
                คุณต้องการระงับบัญชีของ <strong>{userName}</strong> ใช่หรือไม่?
                <br />
                <span className="text-orange-600">
                  ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะปลดระงับ
                </span>
              </>
            ) : (
              <>
                คุณต้องการปลดระงับบัญชีของ <strong>{userName}</strong>{" "}
                ใช่หรือไม่?
                <br />
                <span className="text-green-600">
                  ผู้ใช้จะสามารถเข้าสู่ระบบได้ตามปกติ
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            ยกเลิก
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant={isCurrentlyActive ? "destructive" : "default"}
            className={
              isCurrentlyActive ? "" : "bg-green-600 hover:bg-green-700"
            }
          >
            {loading
              ? "กำลังดำเนินการ..."
              : isCurrentlyActive
                ? "ระงับบัญชี"
                : "ปลดระงับบัญชี"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
