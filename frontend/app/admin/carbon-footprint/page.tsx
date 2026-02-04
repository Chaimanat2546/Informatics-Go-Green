"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RefreshCcw, Loader2, Calculator } from "lucide-react";

import {
  StatsCards,
  SettingsForm,
  PendingWasteTable,
  ManagementMethodsTable,
  type CalculationStats,
  type SchedulerSetting,
  type PendingWaste,
  type ManagementMethod,
} from "../../../components/carbon-footprint";

interface TriggerResult {
  processed: number;
  success: number;
  failed: number;
}

export default function CarbonFootprintAdminPage() {
  const [stats, setStats] = useState<CalculationStats | null>(null);
  const [pendingWastes, setPendingWastes] = useState<PendingWaste[]>([]);
  const [settings, setSettings] = useState<SchedulerSetting[]>([]);
  const [managementMethods, setManagementMethods] = useState<
    ManagementMethod[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastResult, setLastResult] = useState<TriggerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Settings form state
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>(
    {},
  );

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  // Fetch functions
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/scheduler/carbon-footprint/stats`,
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, [API_URL]);

  const fetchPendingWastes = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/scheduler/carbon-footprint/pending`,
      );
      const data = await response.json();
      if (data.success) {
        setPendingWastes(data.data);
      }
    } catch (err) {
      console.error("Error fetching pending wastes:", err);
    }
  }, [API_URL]);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/scheduler/settings`);
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        const initial: Record<string, string> = {};
        data.data.forEach((s: SchedulerSetting) => {
          initial[s.key] = s.value;
        });
        setEditedSettings(initial);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  }, [API_URL]);

  const fetchManagementMethods = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/scheduler/management-methods`);
      const data = await response.json();
      if (data.success) {
        setManagementMethods(data.data);
      }
    } catch (err) {
      console.error("Error fetching management methods:", err);
    }
  }, [API_URL]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchPendingWastes(),
        fetchSettings(),
        fetchManagementMethods(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchPendingWastes, fetchSettings, fetchManagementMethods]);

  // Actions
  const triggerCalculation = async () => {
    setTriggering(true);
    setError(null);
    setLastResult(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `${API_URL}/scheduler/trigger-carbon-footprint`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await response.json();

      if (data.success) {
        setLastResult(data.data);
        await fetchStats();
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการคำนวณ");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อ API ได้");
      console.error("Error triggering calculation:", err);
    } finally {
      setTriggering(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updates = Object.entries(editedSettings).map(([key, value]) => ({
        key,
        value,
      }));

      const response = await fetch(`${API_URL}/scheduler/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await response.json();

      if (data.success) {
        setSuccessMessage("บันทึกการตั้งค่าสำเร็จ");
        await fetchSettings();
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อ API ได้");
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
  };

  // No longer needed - removed handleUpdateMaterial

  // Management Method handlers
  const handleCreateMethod = async (data: {
    name: string;
    transport_km?: number | null;
    transport_co2e_per_km?: number | null;
  }): Promise<boolean> => {
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_URL}/scheduler/management-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        setSuccessMessage("เพิ่มวิธีการจัดการขยะสำเร็จ");
        await fetchManagementMethods();
        return true;
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการเพิ่ม");
        return false;
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อ API ได้");
      console.error("Error creating method:", err);
      return false;
    }
  };

  const handleUpdateMethod = async (
    id: number,
    data: {
      name?: string;
      transport_km?: number | null;
      transport_co2e_per_km?: number | null;
    },
  ): Promise<boolean> => {
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `${API_URL}/scheduler/management-methods/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const result = await response.json();

      if (result.success) {
        setSuccessMessage("อัพเดตวิธีการจัดการขยะสำเร็จ");
        await fetchManagementMethods();
        return true;
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการอัพเดต");
        return false;
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อ API ได้");
      console.error("Error updating method:", err);
      return false;
    }
  };

  const handleDeleteMethod = async (id: number): Promise<boolean> => {
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `${API_URL}/scheduler/management-methods/${id}`,
        { method: "DELETE" },
      );
      const result = await response.json();

      if (result.success) {
        setSuccessMessage("ลบวิธีการจัดการขยะสำเร็จ");
        await fetchManagementMethods();
        return true;
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการลบ");
        return false;
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อ API ได้");
      console.error("Error deleting method:", err);
      return false;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchPendingWastes(),
      fetchSettings(),
      fetchManagementMethods(),
    ]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-7 h-7 text-green-600" />
            Carbon Footprint Scheduler
          </h1>
          <p className="text-gray-500 mt-1">
            จัดการการคำนวณ Carbon Footprint อัตโนมัติ
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            รีเฟรช
          </Button>
          <Button
            onClick={triggerCalculation}
            disabled={triggering}
            className="gap-2 bg-primary"
          >
            {triggering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            คำนวณทันที
          </Button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {lastResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-700 text-lg">
              ผลการคำนวณล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div>
                <span className="text-gray-600">ประมวลผล:</span>
                <span className="ml-2 font-bold">{lastResult.processed}</span>
              </div>
              <div>
                <span className="text-gray-600">สำเร็จ:</span>
                <span className="ml-2 font-bold text-green-600">
                  {lastResult.success}
                </span>
              </div>
              <div>
                <span className="text-gray-600">ล้มเหลว:</span>
                <span className="ml-2 font-bold text-red-600">
                  {lastResult.failed}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">⚠️ {error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards stats={stats} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Management Methods Table */}
        <ManagementMethodsTable
          methods={managementMethods}
          itemsPerPage={5}
          onCreateMethod={handleCreateMethod}
          onUpdateMethod={handleUpdateMethod}
          onDeleteMethod={handleDeleteMethod}
        />

        {/* Settings Form */}
        <SettingsForm
          settings={settings}
          editedSettings={editedSettings}
          managementMethods={managementMethods}
          saving={saving}
          onSettingChange={handleSettingChange}
          onSave={saveSettings}
        />
      </div>

      {/* Pending Waste Table */}
      <PendingWasteTable pendingWastes={pendingWastes} />
    </div>
  );
}
