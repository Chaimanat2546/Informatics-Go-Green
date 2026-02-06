"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock } from "lucide-react";

export interface PendingWaste {
  id: number;
  amount: number;
  materialName: string;
  status: string;
  created_at: string;
  retryCount: number;
}

interface PendingWasteTableProps {
  pendingWastes: PendingWaste[];
}

export function PendingWasteTable({ pendingWastes }: PendingWasteTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string, retryCount: number) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">รอคำนวณ</Badge>;
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700">
            ล้มเหลว ({retryCount} ครั้ง)
          </Badge>
        );
      case "error":
        return <Badge className="bg-orange-100 text-orange-700">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          ขยะที่รอคำนวณ Carbon Footprint
        </CardTitle>
        <CardDescription>
          รายการ Waste History ที่ยังไม่ได้คำนวณ Carbon Footprint
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingWastes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>ประเภทวัสดุ</TableHead>
                <TableHead>ปริมาณ</TableHead>
                <TableHead>วันที่บันทึก</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingWastes.map((waste) => (
                <TableRow key={waste.id}>
                  <TableCell className="font-medium">{waste.id}</TableCell>
                  <TableCell>{waste.materialName}</TableCell>
                  <TableCell>{waste.amount}</TableCell>
                  <TableCell>{formatDate(waste.created_at)}</TableCell>
                  <TableCell>
                    {getStatusBadge(waste.status, waste.retryCount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 text-center py-8">ไม่มีขยะที่รอคำนวณ</p>
        )}
      </CardContent>
    </Card>
  );
}
