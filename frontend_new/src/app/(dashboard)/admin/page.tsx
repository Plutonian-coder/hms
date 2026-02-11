"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import {
  Users,
  Building2,
  DoorOpen,
  BedDouble,
  FileText,
  CheckCircle2,
  TrendingUp,
  PieChart,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    async function load() {
      try {
        const res: any = await api.get("/admin/dashboard", token!);
        setStats(res.data || {});
      } catch {}
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  if (loading) return <PageLoading />;

  return (
    <div>
      <Topbar
        title={`Welcome, ${user?.first_name || "Admin"}`}
        subtitle="Hostel management overview"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats.total_students || 0}
          icon={<Users className="w-6 h-6" />}
          color="lime"
          delay={0}
        />
        <StatCard
          title="Applications"
          value={stats.total_applications || 0}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Allocated"
          value={stats.total_allocated || 0}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="emerald"
          delay={0.2}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${(stats.occupancy_rate || 0).toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="amber"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Hostels"
          value={stats.total_hostels || 0}
          icon={<Building2 className="w-6 h-6" />}
          color="lime"
          delay={0.4}
        />
        <StatCard
          title="Total Rooms"
          value={stats.total_rooms || 0}
          icon={<DoorOpen className="w-6 h-6" />}
          color="blue"
          delay={0.5}
        />
        <StatCard
          title="Total Capacity"
          value={stats.total_capacity || 0}
          icon={<BedDouble className="w-6 h-6" />}
          color="emerald"
          delay={0.6}
        />
        <StatCard
          title="Payments Verified"
          value={stats.payment_verified_count || 0}
          subtitle={`${stats.pending_payment_count || 0} pending`}
          icon={<PieChart className="w-6 h-6" />}
          color="amber"
          delay={0.7}
        />
      </div>

      {/* Hostel Occupancy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card delay={0.8}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Overview</h3>
          <div className="space-y-4">
            {(stats.hostels || []).slice(0, 5).map((hostel: any, i: number) => {
              const pct = hostel.total_capacity > 0
                ? ((hostel.current_occupancy / hostel.total_capacity) * 100).toFixed(0)
                : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{hostel.name}</span>
                    <span className="text-sm text-gray-500">
                      {hostel.current_occupancy}/{hostel.total_capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-lime-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.9 + i * 0.1 }}
                      className={`h-full rounded-full ${
                        Number(pct) > 90 ? "bg-red-500" : Number(pct) > 70 ? "bg-amber-500" : "bg-lime-500"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
            {(!stats.hostels || stats.hostels.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No hostels configured yet</p>
            )}
          </div>
        </Card>

        <Card delay={0.9}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Male Hostels", value: stats.male_hostels || 0, color: "bg-blue-100 text-blue-700" },
              { label: "Female Hostels", value: stats.female_hostels || 0, color: "bg-pink-100 text-pink-700" },
              { label: "Available Spaces", value: (stats.total_capacity || 0) - (stats.total_occupancy || 0), color: "bg-emerald-100 text-emerald-700" },
              { label: "Pending Payments", value: stats.pending_payment_count || 0, color: "bg-amber-100 text-amber-700" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                className={`${item.color} rounded-xl p-4 text-center`}
              >
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs font-medium mt-1">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
