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
  BedDouble,
  Menu,
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
        "fixed left-0 top-0 h-screen bg-black border-r-2 border-black flex flex-col z-40 transition-all duration-300",
        collapsed ? "w-[80px]" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b-2 border-white/10 bg-black text-white">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-2xl font-display font-bold tracking-tighter text-brand-lime">
                HMS<span className="text-white">.OS</span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:text-brand-lime transition-colors"
        >
          {collapsed ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-0 space-y-1 overflow-y-auto no-scrollbar">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="block group">
              <div
                className={cn(
                  "relative flex items-center gap-4 px-6 py-4 transition-all duration-200 border-l-[6px]",
                  isActive
                    ? "bg-brand-lime border-black text-black"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-brand-lime"
                )}
              >
                <div className={cn("flex-shrink-0", isActive ? "text-black" : "text-gray-500 group-hover:text-brand-lime")}>
                  {item.icon}
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-display font-bold uppercase tracking-wider text-sm truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User & Footer */}
      <div className="p-6 border-t-2 border-white/10 bg-black">
        {!collapsed && user && (
          <div className="mb-4">
            <p className="text-sm font-bold text-white uppercase truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-brand-lime font-mono uppercase">{role}</p>
          </div>
        )}
        <button
          onClick={() => { clearAuth(); window.location.href = "/login"; }}
          className={cn(
            "flex items-center gap-3 w-full py-3 text-sm font-bold uppercase tracking-wider transition-colors",
            collapsed ? "justify-center" : "justify-start",
            "text-brand-rose hover:text-red-400 hover:bg-brand-rose/10"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
