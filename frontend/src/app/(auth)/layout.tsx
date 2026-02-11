"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left - Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 sidebar-gradient relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative circles */}
        <div className="absolute top-20 -left-20 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-lime-300/10 rounded-full blur-3xl" />

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-16"
          >
            <div className="w-12 h-12 rounded-xl bg-lime-400 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-lime-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-lime-100">YABATECH</h1>
              <p className="text-xs text-lime-400">Hostel Management System</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Smart Hostel<br />
              <span className="text-lime-400">Management</span>
            </h2>
            <p className="text-lime-200/70 text-lg max-w-md">
              Streamlined accommodation management for YABATECH students. Apply, track, and manage hostel allocations effortlessly.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-8 text-lime-300/50 text-sm"
        >
          <span>Fair Ballot System</span>
          <span>Real-time Tracking</span>
          <span>Secure Platform</span>
        </motion.div>
      </div>

      {/* Right - Form area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
