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
  lime: {
    bg: "bg-[#CCFF00]",
    border: "border-black",
    text: "text-black",
  },
  emerald: {
    bg: "bg-emerald-400",
    border: "border-black",
    text: "text-black",
  },
  blue: {
    bg: "bg-[#0047FF]",
    border: "border-black",
    text: "text-white",
  },
  amber: {
    bg: "bg-amber-400",
    border: "border-black",
    text: "text-black",
  },
  red: {
    bg: "bg-[#FF3366]",
    border: "border-black",
    text: "text-white",
  },
};

export function StatCard({ title, value, subtitle, icon, trend, color = "lime", delay = 0 }: StatCardProps) {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "circOut" }}
      whileHover={{ translate: "4px 4px", boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
      className="bg-white border-2 border-black p-5 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", c.bg)}>
          <div className={c.text}>{icon}</div>
        </div>
        {trend && (
          <div className="flex flex-col items-end">
            <span className={cn("text-lg font-bold font-display", trend.value >= 0 ? "text-[#0047FF]" : "text-[#FF3366]")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{title}</h3>
        <p className="text-3xl font-display font-black uppercase tracking-tighter text-black leading-none">
          {value}
        </p>
        {subtitle && <p className="text-xs font-mono text-gray-400 mt-2 border-t-2 border-dashed border-gray-200 pt-2">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
