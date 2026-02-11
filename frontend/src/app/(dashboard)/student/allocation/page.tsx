"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { Home, BedDouble, Users, Download, MapPin, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AllocationPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [allocation, setAllocation] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res: any = await api.get("/student/allocation", token!);
        setAllocation(res.data);
      } catch {}
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  if (loading) return <PageLoading />;

  if (!allocation) {
    return (
      <div>
        <Topbar title="My Allocation" subtitle="View your hostel allocation details" />
        <Card>
          <EmptyState
            title="No Allocation Yet"
            description="You haven't been allocated a hostel room yet. Please apply and wait for the ballot process."
            icon={<Home className="w-10 h-10" />}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="My Allocation" subtitle="Your hostel accommodation details" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{allocation.hostel_name}</h3>
                <p className="text-gray-500 mt-1">Room {allocation.room_number}</p>
              </div>
              <StatusBadge status={allocation.status || "active"} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Bed Space", value: `Bed ${allocation.bed_space_number}`, icon: <BedDouble className="w-5 h-5" /> },
                { label: "Floor", value: allocation.floor_number || "Ground", icon: <MapPin className="w-5 h-5" /> },
                { label: "Occupants", value: `${allocation.current_occupants || 0}/${allocation.room_capacity || 4}`, icon: <Users className="w-5 h-5" /> },
                { label: "Allocated", value: formatDate(allocation.allocation_date), icon: <Clock className="w-5 h-5" /> },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-lime-50 rounded-xl p-4 text-center"
                >
                  <div className="text-lime-600 flex justify-center mb-2">{item.icon}</div>
                  <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                  <p className="font-bold text-gray-900">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Roommates */}
          <Card delay={0.2}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-lime-600" />
              Roommates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allocation.roommates?.map((mate: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                    {mate.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{mate.name}</p>
                    <p className="text-xs text-gray-500">{mate.matric_number}</p>
                    {mate.department && (
                      <p className="text-xs text-gray-400">{mate.department} - {mate.level}L</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {(!allocation.roommates || allocation.roommates.length === 0) && (
                <p className="text-sm text-gray-500 col-span-2 text-center py-4">No roommates assigned yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card delay={0.3}>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-lime-50 hover:bg-lime-100 transition-colors text-left">
                <Download className="w-5 h-5 text-lime-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Download Letter</p>
                  <p className="text-xs text-gray-500">Get allocation letter PDF</p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
