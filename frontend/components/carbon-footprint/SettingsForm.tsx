"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2 } from "lucide-react";
import { ManagementMethod } from "./ManagementMethodsTable";

export interface SchedulerSetting {
  key: string;
  value: string;
  label: string;
  description: string;
  type: string;
}

interface SettingsFormProps {
  settings: SchedulerSetting[];
  editedSettings: Record<string, string>;
  managementMethods: ManagementMethod[];
  saving: boolean;
  onSettingChange: (key: string, value: string) => void;
  onSave: () => void;
}

export function SettingsForm({
  settings,
  editedSettings,
  managementMethods,
  saving,
  onSettingChange,
  onSave,
}: SettingsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          ตั้งค่า Scheduler
        </CardTitle>
        <CardDescription>
          กำหนดค่าการคำนวณ Carbon Footprint อัตโนมัติ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.map((setting) => (
            <div key={setting.key} className="space-y-2">
              <Label htmlFor={setting.key}>{setting.label}</Label>
              {setting.type === "boolean" ? (
                <select
                  id={setting.key}
                  value={editedSettings[setting.key] || "false"}
                  onChange={(e) => onSettingChange(setting.key, e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="true">เปิดใช้งาน</option>
                  <option value="false">ปิดใช้งาน</option>
                </select>
              ) : setting.type === "time" ? (
                <Input
                  id={setting.key}
                  type="time"
                  value={editedSettings[setting.key] || "02:00"}
                  onChange={(e) => onSettingChange(setting.key, e.target.value)}
                />
              ) : setting.type === "select" &&
                setting.key === "default_management_method_id" ? (
                <select
                  id={setting.key}
                  value={editedSettings[setting.key] || ""}
                  onChange={(e) => onSettingChange(setting.key, e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">-- เลือกวิธีการ (ใช้ค่าเริ่มต้น) --</option>
                  {managementMethods.map((method) => (
                    <option key={method.id} value={method.id.toString()}>
                      {method.name} ({method.transport_km ?? 0} km,{" "}
                      {method.transport_co2e_per_km ?? 0} CO2e/km)
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={setting.key}
                  type={setting.type === "number" ? "number" : "text"}
                  value={editedSettings[setting.key] || ""}
                  onChange={(e) => onSettingChange(setting.key, e.target.value)}
                />
              )}
              <p className="text-xs text-gray-500">{setting.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={onSave}
            disabled={saving}
            className="gap-2 bg-primary hover:bg-primary/80"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            บันทึกการตั้งค่า
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
