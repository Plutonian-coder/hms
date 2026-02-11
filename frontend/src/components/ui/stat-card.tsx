"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "lime" | "emerald" | "blue" | "amber" | "red";
  delay?: number;
}

const colorMap = {
  lime: { bg: "bg-lime-100", text: "text-lime-700", icon: "bg-lime-200 text-lime-700" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "bg-emerald-200 text-emerald-700" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", icon: "bg-blue-200 text-blue-700" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", icon: "bg-amber-200 text-amber-700" },
  red: { bg: "bg-red-100", text: "text-red-700", icon: "bg-red-200 text-red-700" },
};

export function StatCard({ title, value, subtitle, icon, trend, color = "lime", delay = 0 }: StatCardProps) {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.1)" }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <motion.p
            className={cn("text-3xl font-bold mt-2 stat-number", c.text)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn("p-3 rounded-xl", c.icon)}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={cn("text-xs font-semibold", trend.value >= 0 ? "text-emerald-600" : "text-red-600")}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-gray-400">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}
