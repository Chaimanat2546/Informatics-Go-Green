"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  BarChart3,
  Users,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

interface AdminSidebarProps {
  user?: User | null;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: { id: string; label: string; path: string }[];
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "waste-tracking",
  ]);

  const menuItems: MenuItem[] = [
    {
      id: "waste-tracking",
      label: "การติดตามขยะ",
      icon: BarChart3,
      children: [
        { id: "overview", label: "ภาพรวมทั้งหมด", path: "/admin/overview" },
        {
          id: "emission-factor",
          label: "ตั้งค่า Emission Factor",
          path: "/admin/emission-factor",
        },
        {
          id: "carbon-footprint",
          label: "คำนวณ Carbon Footprint",
          path: "/admin/carbon-footprint",
        },
      ],
    },
    {
      id: "manage-users",
      label: "จัดการผู้ใช้",
      icon: Users,
      path: "/admin/users",
    },
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const isActive = (path: string) => pathname === path;

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">IG</span>
          </div>
          <div>
            <h1 className="font-semibold text-green-700 text-sm">
              Informatics Go Green
            </h1>
            <p className="text-xs text-gray-500">Enterprise</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
          รายการ
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.includes(item.id);
            const isItemActive = item.path ? isActive(item.path) : false;

            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleMenu(item.id);
                    } else if (item.path) {
                      handleNavigation(item.path);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                    isItemActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {hasChildren && (
                    <span className="text-gray-400">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </button>

                {/* Submenu */}
                {hasChildren && isExpanded && (
                  <ul className="mt-1 ml-8 space-y-1">
                    {item.children?.map((child) => (
                      <li key={child.id}>
                        <button
                          onClick={() => handleNavigation(child.path)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(child.path)
                              ? "bg-green-50 text-green-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {child.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Avatar className="w-9 h-9">
                <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
                <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
