"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { Building2, BedDouble, Users, UserCheck, DoorOpen } from "lucide-react";

export default function WardenDashboard() {
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res: any = await api.get("/warden/hostels", token!);
        setHostels(res.data || []);
      } catch {}
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  if (loading) return <PageLoading />;

  const totalCapacity = hostels.reduce((sum: number, h: any) => sum + (h.total_capacity || 0), 0);
  const totalOccupancy = hostels.reduce((sum: number, h: any) => sum + (h.current_occupancy || 0), 0);
  const occupancyRate = totalCapacity > 0 ? ((totalOccupancy / totalCapacity) * 100).toFixed(1) : "0";

  return (
    <div>
      <Topbar
        title={`Welcome, ${user?.first_name || "Warden"}`}
        subtitle="Your assigned hostel overview"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Assigned Hostels"
          value={hostels.length}
          icon={<Building2 className="w-6 h-6" />}
          color="lime"
          delay={0}
        />
        <StatCard
          title="Total Capacity"
          value={totalCapacity}
          icon={<BedDouble className="w-6 h-6" />}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Current Occupancy"
          value={totalOccupancy}
          icon={<Users className="w-6 h-6" />}
          color="emerald"
          delay={0.2}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={<UserCheck className="w-6 h-6" />}
          color="amber"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostels.map((hostel: any, i: number) => {
          const pct = hostel.total_capacity > 0
            ? ((hostel.current_occupancy / hostel.total_capacity) * 100)
            : 0;
          return (
            <Card key={hostel.id} delay={0.4 + i * 0.1}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  hostel.gender === "male" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"
                }`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{hostel.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{hostel.gender} hostel</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Occupancy</span>
                  <span className="font-medium">{hostel.current_occupancy} / {hostel.total_capacity}</span>
                </div>
                <div className="w-full h-3 bg-lime-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className={`h-full rounded-full ${
                      pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-lime-500"
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-400 text-right">{pct.toFixed(0)}% full</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-lime-100">
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <p className="text-lg font-bold text-emerald-700">{hostel.total_capacity - hostel.current_occupancy}</p>
                  <p className="text-xs text-emerald-600">Available</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-700">{hostel.total_rooms || "—"}</p>
                  <p className="text-xs text-blue-600">Rooms</p>
                </div>
              </div>
            </Card>
          );
        })}

        {hostels.length === 0 && (
          <Card className="col-span-full">
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-lime-300" />
              <p className="font-medium">No hostels assigned</p>
              <p className="text-sm mt-1">Contact admin to get assigned to a hostel</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
