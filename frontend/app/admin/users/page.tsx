"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  profilePicture?: string;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await fetch(`${API_URL}/admin/users?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else if (response.status === 403) {
        router.push("/auth/dashboard");
      } else {
        toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, limit, searchTerm, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${userId}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        // Update local state
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, isActive: !currentStatus } : user,
          ),
        );
      } else {
        toast.error("ไม่สามารถเปลี่ยนสถานะได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">จัดการผู้ใช้งาน</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหาชื่อ นามสกุล หรืออีเมล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">ชื่อ-นามสกุล</TableHead>
              <TableHead className="font-semibold">สถานะ</TableHead>
              <TableHead className="font-semibold">อีเมล</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  ไม่พบข้อมูลผู้ใช้
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge
                        variant="outline"
                        className="border-green-500 text-green-600 bg-green-50"
                      >
                        ใช้งานอยู่
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-orange-500 text-orange-600 bg-orange-50"
                      >
                        ระงับการใช้งาน
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewProfile(user.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          ดูโปรไฟล์
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleToggleStatus(user.id, user.isActive)
                          }
                          className={
                            user.isActive ? "text-orange-600" : "text-green-600"
                          }
                        >
                          {user.isActive ? (
                            <>
                              <Ban className="w-4 h-4 mr-2" />
                              ระงับบัญชี
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              ปลดระงับบัญชี
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">
          {total > 0
            ? `${(page - 1) * limit + 1} ถึง ${Math.min(page * limit, total)} จาก ${total} รายการ`
            : "0 รายการ"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            หน้าก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            หน้าถัดไป
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
