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
import { Button } from "@/components/ui/button";

export default function AllocationPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [allocation, setAllocation] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res: any = await api.get("/student/allocation", token!);
        setAllocation(res.data);
      } catch { }
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  if (loading) return <PageLoading />;

  if (!allocation) {
    return (
      <div>
        <Topbar title="MY ALLOCATION" subtitle="VIEW YOUR HOSTEL ALLOCATION DETAILS" />
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <EmptyState
            title="NO ALLOCATION YET"
            description="You haven't been allocated a hostel room yet. Please apply and wait for the ballot process."
            icon={<Home className="w-10 h-10 text-black" />}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="MY ALLOCATION" subtitle="YOUR HOSTEL ACCOMMODATION DETAILS" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start justify-between mb-8 border-b-2 border-black pb-4">
              <div>
                <h3 className="text-3xl font-display font-black uppercase tracking-tighter text-black">{allocation.hostel_name}</h3>
                <p className="text-sm font-mono font-bold text-gray-500 uppercase mt-1">ROOM {allocation.room_number}</p>
              </div>
              <StatusBadge status={allocation.status || "active"} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "BED SPACE", value: `BED ${allocation.bed_space_number}`, icon: <BedDouble className="w-5 h-5" /> },
                { label: "FLOOR", value: (allocation.floor_number || "GROUND").toUpperCase(), icon: <MapPin className="w-5 h-5" /> },
                { label: "OCCUPANTS", value: `${allocation.current_occupants || 0}/${allocation.room_capacity || 4}`, icon: <Users className="w-5 h-5" /> },
                { label: "ALLOCATED", value: formatDate(allocation.allocation_date).toUpperCase(), icon: <Clock className="w-5 h-5" /> },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-white border-2 border-black p-4 text-center hover:bg-[#CCFF00] transition-colors group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="text-black flex justify-center mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 group-hover:text-black">{item.label}</p>
                  <p className="font-display font-black text-lg text-black leading-none">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Roommates */}
          <Card delay={0.2} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-6 flex items-center gap-3 border-b-2 border-black pb-4">
              <div className="w-8 h-8 bg-[#CCFF00] border-2 border-black flex items-center justify-center">
                <Users className="w-4 h-4 text-black" />
              </div>
              ROOMMATES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allocation.roommates?.map((mate: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-4 p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 transition-transform"
                >
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-display font-black text-lg border-2 border-black">
                    {mate.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-black uppercase">{mate.name}</p>
                    <p className="text-xs font-mono font-bold text-gray-500">{mate.matric_number}</p>
                    {mate.department && (
                      <p className="text-[10px] font-bold uppercase text-gray-400 mt-1">{mate.department} - {mate.level}L</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {(!allocation.roommates || allocation.roommates.length === 0) && (
                <div className="col-span-2 text-center py-8 border-2 border-dashed border-gray-300 bg-gray-50">
                  <p className="text-sm font-mono font-bold uppercase text-gray-500">NO ROOMMATES ASSIGNED YET</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card delay={0.3} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#CCFF00]">
            <h3 className="text-lg font-display font-black uppercase tracking-tighter text-black mb-4">QUICK ACTIONS</h3>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-white hover:bg-black hover:text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Download className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-bold uppercase">DOWNLOAD LETTER</p>
                  <p className="text-[10px] font-mono">GET ALLOCATION PDF</p>
                </div>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
