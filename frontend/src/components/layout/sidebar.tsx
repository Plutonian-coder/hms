"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  FileText,
  Vote,
  CalendarDays,
  Shield,
  ChevronLeft,
  LogOut,
  Home,
  ClipboardList,
  UserCheck,
  BedDouble,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Hostels", href: "/admin/hostels", icon: <Building2 className="w-5 h-5" /> },
    { label: "Rooms", href: "/admin/rooms", icon: <DoorOpen className="w-5 h-5" /> },
    { label: "Students", href: "/admin/students", icon: <Users className="w-5 h-5" /> },
    { label: "Applications", href: "/admin/applications", icon: <FileText className="w-5 h-5" /> },
    { label: "Ballot", href: "/admin/ballot", icon: <Vote className="w-5 h-5" /> },
    { label: "Sessions", href: "/admin/sessions", icon: <CalendarDays className="w-5 h-5" /> },
    { label: "Wardens", href: "/admin/wardens", icon: <Shield className="w-5 h-5" /> },
  ],
  warden: [
    { label: "Dashboard", href: "/warden", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Rooms", href: "/warden/rooms", icon: <BedDouble className="w-5 h-5" /> },
    { label: "Students", href: "/warden/students", icon: <Users className="w-5 h-5" /> },
  ],
  student: [
    { label: "Dashboard", href: "/student", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Apply", href: "/student/apply", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "My Allocation", href: "/student/allocation", icon: <Home className="w-5 h-5" /> },
  ],
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { role, user, clearAuth } = useAuthStore();

  const items = role ? navItems[role] || [] : [];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-0 h-screen sidebar-gradient flex flex-col z-40 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-lime-800/30">
        <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-lime-900" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-lg font-bold text-lime-100">YABATECH</h1>
              <p className="text-xs text-lime-400">HMS Portal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-lime-400/20 text-lime-300 shadow-lg shadow-lime-900/20"
                    : "text-lime-200/70 hover:text-lime-100 hover:bg-lime-800/30"
                )}
              >
                <div className={cn("flex-shrink-0", isActive && "text-lime-400")}>
                  {item.icon}
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-8 bg-lime-400 rounded-r-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User & Collapse */}
      <div className="p-3 border-t border-lime-800/30 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-lime-100 truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-lime-400/70 capitalize">{role}</p>
          </div>
        )}
        <button
          onClick={() => { clearAuth(); window.location.href = "/login"; }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300/80 hover:text-red-300 hover:bg-red-900/20 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-lime-400/70 hover:text-lime-300 hover:bg-lime-800/30 transition-colors"
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
    </motion.aside>
  );
}
