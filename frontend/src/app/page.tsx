"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Search, Users, Shield, Vote, ArrowRight, CheckCircle2, Home, GraduationCap } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function LandingPage() {
  const [matricNumber, setMatricNumber] = useState("");
  const [allocation, setAllocation] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNumber.trim()) return;
    setIsSearching(true);
    setSearched(true);
    setAllocation(null);
    try {
      const res: any = await api.get(`/public/allocation/${encodeURIComponent(matricNumber)}`);
      setAllocation(res.data);
    } catch {
      setAllocation(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-lime-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">YABATECH HMS</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">Hostel Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-medium text-lime-700 hover:bg-lime-50 rounded-xl transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-medium bg-lime-600 text-white rounded-xl hover:bg-lime-700 transition-colors shadow-lg shadow-lime-600/20"
            >
              Register
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-lime-100 text-lime-700 rounded-full text-sm font-medium mb-6"
          >
            <CheckCircle2 className="w-4 h-4" />
            2024/2025 Session Now Open
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
          >
            Smart Hostel
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-600">
              Management
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto"
          >
            Apply for hostel accommodation, track your allocation status, and manage your stay - all in one place.
          </motion.p>

          {/* Allocation Lookup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-8 max-w-xl mx-auto"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Check Your Allocation</h3>
            <p className="text-sm text-gray-500 mb-4">Enter your matric number to view your hostel allocation</p>

            <form onSubmit={handleLookup} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  placeholder="YABATECH/2024/ND/CSC/001"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all"
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSearching}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-lime-600 text-white font-semibold rounded-xl hover:bg-lime-700 transition-colors shadow-lg shadow-lime-600/20 disabled:opacity-50"
              >
                {isSearching ? "..." : "Search"}
              </motion.button>
            </form>

            {/* Results */}
            {searched && !isSearching && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6"
              >
                {allocation ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">Allocation Found</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Student</span>
                        <p className="font-medium">{allocation.student_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Hostel</span>
                        <p className="font-medium">{allocation.hostel_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Room</span>
                        <p className="font-medium">{allocation.room_number}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Bed Space</span>
                        <p className="font-medium">Bed {allocation.bed_space_number}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Roommates ({allocation.roommates?.length || 0})</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {allocation.roommates?.map((r: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-white rounded-lg text-xs font-medium">
                              {r.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                    <p className="text-amber-800 font-medium">No allocation found for this matric number</p>
                    <p className="text-amber-600 text-sm mt-1">Please check your matric number or contact admin</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <GraduationCap className="w-7 h-7" />,
              title: "Easy Application",
              desc: "Apply for hostel accommodation in minutes. Select your preferences and track your status.",
              color: "bg-lime-100 text-lime-700",
            },
            {
              icon: <Vote className="w-7 h-7" />,
              title: "Fair Ballot System",
              desc: "Priority-based allocation ensuring fairness. Earlier payment means higher priority.",
              color: "bg-emerald-100 text-emerald-700",
            },
            {
              icon: <Home className="w-7 h-7" />,
              title: "Real-time Tracking",
              desc: "View your allocation details, roommates, and check-in status in real time.",
              color: "bg-blue-100 text-blue-700",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card p-6"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-lime-200/50 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">YABATECH Hostel Management System</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/login" className="hover:text-lime-600">Student Portal</Link>
            <Link href="/login" className="hover:text-lime-600">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
