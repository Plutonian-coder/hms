"use client";

import { motion } from "framer-motion";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className={`${s[size]} bg-[#CCFF00] border-2 border-black`}
        animate={{
          scale: [1, 0.8, 1],
          rotate: [0, 180, 360],
          borderRadius: ["0%", "50%", "0%"],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
      />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <motion.div
        className="w-16 h-16 bg-[#CCFF00] border-2 border-black"
        animate={{
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
      />
      <motion.p
        className="text-lg font-display font-black uppercase tracking-wider text-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Initializing...
      </motion.p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 border-2 border-transparent ${className || "h-4 w-full"}`} />
  );
}
