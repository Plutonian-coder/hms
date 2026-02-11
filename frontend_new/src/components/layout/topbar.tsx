"use client";

import { Bell, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import { Input } from "@/components/ui/input";

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
      className="mb-8 flex items-end justify-between border-b-2 border-black pb-6"
    >
      <div>
        <h1 className="text-4xl font-display font-black text-black uppercase tracking-tighter leading-none">{title}</h1>
        {subtitle && <p className="text-base font-medium text-gray-500 mt-2 uppercase tracking-wide">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Input
            placeholder="SEARCH..."
            className="bg-transparent border-black focus:bg-white"
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Notifications */}
        <button className="relative w-12 h-12 flex items-center justify-center border-2 border-black bg-white hover:bg-brand-lime hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
          <Bell className="w-5 h-5 text-black" />
          <span className="absolute top-1 right-1 w-3 h-3 bg-brand-rose border border-black text-white text-[8px] font-bold flex items-center justify-center">

          </span>
        </button>

        {/* Avatar - Simplified */}
        <div className="flex items-center gap-3 pl-6 border-l-2 border-black">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-black leading-none uppercase">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 font-mono uppercase mt-1">{user?.role}</p>
          </div>
          <div className="w-10 h-10 border-2 border-black bg-brand-lime flex items-center justify-center text-black font-bold text-sm">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
