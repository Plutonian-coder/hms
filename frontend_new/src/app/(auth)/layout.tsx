"use client";

import { motion } from "framer-motion";
import { Building2, Command } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex font-sans">
      {/* Left - Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F0F0F] relative overflow-hidden flex-col justify-between p-12 border-r-4 border-black">

        {/* Abstract shapes/Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#CCFF00 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] rounded-bl-full z-0 opacity-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 border-t-4 border-r-4 border-[#CCFF00] z-0 opacity-20" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-20"
          >
            <div className="w-16 h-16 bg-[#CCFF00] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <Building2 className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-black text-white uppercase tracking-tighter">YABATECH</h1>
              <div className="bg-white text-black px-2 py-0.5 text-xs font-bold uppercase inline-block border border-black">
                Hostel Portal
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-6xl font-display font-black text-white leading-[0.85] mb-8 uppercase">
              Secure<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CCFF00] to-white">Access</span><br />
              Point
            </h2>
            <div className="bg-[#2A2A2A] border-l-4 border-[#CCFF00] p-6 max-w-md">
              <p className="text-gray-300 font-mono text-sm leading-relaxed">
                /SYSTEM_STATUS: ONLINE
                <br />
                /ALLOCATION_GRID: ACTIVE
                <br />
                <br />
                Manage your accommodation status through the centralized efficient allocation matrix.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 border-t-2 border-[#333] pt-6 flex justify-between items-end"
        >
          <div className="flex gap-8">
            <div className="group cursor-pointer">
              <p className="text-[#CCFF00] text-xs font-bold uppercase mb-1">Version</p>
              <p className="text-white font-mono text-sm">v2.4.0-BETA</p>
            </div>
            <div className="group cursor-pointer">
              <p className="text-[#CCFF00] text-xs font-bold uppercase mb-1">Support</p>
              <p className="text-white font-mono text-sm">help@yabatech.edu.ng</p>
            </div>
          </div>
          <Command className="text-[#333] w-24 h-24 absolute -bottom-8 -right-8" />
        </motion.div>
      </div>

      {/* Right - Form area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F4F4F0]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
