"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export interface CalculationStats {
  pending: number;
  calculated: number;
  failed: number;
  error: number;
}

interface StatsCardsProps {
  stats: CalculationStats | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            รอคำนวณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">
            {stats?.pending || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">records</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            คำนวณแล้ว
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {stats?.calculated || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">records</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            ล้มเหลว
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            {stats?.failed || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">records</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Error
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {stats?.error || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">records</p>
        </CardContent>
      </Card>
    </div>
  );
}
