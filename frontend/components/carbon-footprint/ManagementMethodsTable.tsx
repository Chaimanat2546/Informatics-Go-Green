"use client";

import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface ManagementMethod {
  id: number;
  name: string;
  process_type: number | null;
  transport_km: number | null;
  transport_co2e_per_km: number | null;
}

interface ManagementMethodsTableProps {
  methods: ManagementMethod[];
  onCreateMethod: (data: {
    name: string;
    transport_km?: number | null;
    transport_co2e_per_km?: number | null;
  }) => Promise<boolean>;
  onUpdateMethod: (
    id: number,
    data: {
      name?: string;
      transport_km?: number | null;
      transport_co2e_per_km?: number | null;
    },
  ) => Promise<boolean>;
  onDeleteMethod: (id: number) => Promise<boolean>;
  itemsPerPage?: number;
}

export function ManagementMethodsTable({
  methods,
  onCreateMethod,
  onUpdateMethod,
  onDeleteMethod,
  itemsPerPage = 5,
}: ManagementMethodsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ManagementMethod | null>(
    null,
  );
  const [methodName, setMethodName] = useState("");
  const [transportKm, setTransportKm] = useState("");
  const [co2ePerKm, setCo2ePerKm] = useState("");
  const [saving, setSaving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(methods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMethods = methods.slice(startIndex, endIndex);

  const openDialog = (method?: ManagementMethod) => {
    if (method) {
      setEditingMethod(method);
      setMethodName(method.name);
      setTransportKm(method.transport_km?.toString() || "");
      setCo2ePerKm(method.transport_co2e_per_km?.toString() || "");
    } else {
      setEditingMethod(null);
      setMethodName("");
      setTransportKm("");
      setCo2ePerKm("");
    }
    setDialogOpen(true);
  };

  const saveMethod = async () => {
    if (!methodName) return;

    setSaving(true);

    const data = {
      name: methodName,
      transport_km: transportKm ? parseFloat(transportKm) : null,
      transport_co2e_per_km: co2ePerKm ? parseFloat(co2ePerKm) : null,
    };

    const success = editingMethod
      ? await onUpdateMethod(editingMethod.id, data)
      : await onCreateMethod(data);

    setSaving(false);

    if (success) {
      setDialogOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบวิธีการจัดการขยะนี้ใช่หรือไม่?")) return;
    const success = await onDeleteMethod(id);
    // Adjust page if needed after deletion
    if (success && paginatedMethods.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              วิธีการจัดการขยะ (Waste Management Methods)
            </CardTitle>
            <CardDescription>
              กำหนดวิธีการขนส่งและจัดการขยะเพื่อคำนวณ Transport Emission
            </CardDescription>
          </div>
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            เพิ่มวิธีการ
          </Button>
        </CardHeader>
        <CardContent>
          {methods.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>ชื่อวิธีการ</TableHead>
                    <TableHead>ระยะทาง (km)</TableHead>
                    <TableHead>CO2e / km</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">{method.id}</TableCell>
                      <TableCell>{method.name}</TableCell>
                      <TableCell>{method.transport_km ?? "-"}</TableCell>
                      <TableCell>
                        {method.transport_co2e_per_km ?? "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(method)}
                            className="gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            แก้ไข
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(method.id)}
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            ลบ
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end mt-4 pt-4 border-t gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    หน้าก่อนหน้า
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    หน้าถัดไป
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">
              ไม่พบข้อมูลวิธีการจัดการขยะ
            </p>
          )}
        </CardContent>
      </Card>

      {/* Management Method Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMethod
                ? "แก้ไขวิธีการจัดการขยะ"
                : "เพิ่มวิธีการจัดการขยะ"}
            </DialogTitle>
            <DialogDescription>
              กำหนดชื่อและค่า Emission จากการขนส่ง
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="methodName">
                ชื่อวิธีการ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="methodName"
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
                placeholder="เช่น รถขนขยะเทศบาล"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transportKm">ระยะทาง (km)</Label>
                <Input
                  id="transportKm"
                  type="number"
                  step="0.1"
                  value={transportKm}
                  onChange={(e) => setTransportKm(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co2ePerKm">CO2e / km</Label>
                <Input
                  id="co2ePerKm"
                  type="number"
                  step="0.001"
                  value={co2ePerKm}
                  onChange={(e) => setCo2ePerKm(e.target.value)}
                  placeholder="0.000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={saveMethod}
              disabled={saving || !methodName}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
