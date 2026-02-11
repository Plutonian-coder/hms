"use client";

import { Bell, Search, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuthStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mb-6 px-6 py-4 flex items-center justify-between"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 text-sm rounded-xl border border-lime-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 w-64 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-white/50 border border-lime-200 hover:bg-lime-50 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
