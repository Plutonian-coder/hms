"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import {
  Home,
  FileText,
  Clock,
  CheckCircle2,
  BedDouble,
  Users,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [allocation, setAllocation] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [statusRes, allocRes]: any[] = await Promise.allSettled([
          api.get("/student/status", token!),
          api.get("/student/allocation", token!),
        ]);
        if (statusRes.status === "fulfilled") setApplication(statusRes.value?.data);
        if (allocRes.status === "fulfilled") setAllocation(allocRes.value?.data);
      } catch { }
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <Topbar
          title={`HELLO, ${user?.first_name || "STUDENT"}`}
          subtitle="YOUR ACCOMMODATION STATUS GRID"
        />
        {application?.session && (
          <Badge variant="info" className="px-4 py-2 text-sm font-bold border-2 border-black">
            CURRENT SESSION: {application.session.name}
          </Badge>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="APPLICATION STATUS"
          value={application?.status ? application.status.replace(/_/g, " ") : "NOT APPLIED"}
          icon={<FileText className="w-6 h-6" />}
          color="lime"
          delay={0}
        />
        <StatCard
          title="PAYMENT VERIFICATION"
          value={application?.payment_verified ? "VERIFIED" : "PENDING"}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color={application?.payment_verified ? "emerald" : "amber"}
          delay={0.1}
        />
        <StatCard
          title="PRIORITY SCORE"
          value={application?.priority_score?.toFixed(2) || "N/A"}
          icon={<Clock className="w-6 h-6" />}
          color="blue"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Details */}
        <Card delay={0.3} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-4">
            <h3 className="text-xl font-display font-black uppercase tracking-tighter">ALLOCATION MATRIX</h3>
            {allocation && (
              <Link href="/student/allocation">
                <Button variant="brutal" size="sm">
                  VIEW DETAILS <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          {allocation ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#CCFF00] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 text-black mb-2 border-b border-black pb-1">
                    <Home className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">HOSTEL BLOCK</span>
                  </div>
                  <p className="text-2xl font-display font-black uppercase text-black leading-none">{allocation.hostel_name}</p>
                </div>
                <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 text-black mb-2 border-b border-black pb-1">
                    <BedDouble className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">ROOM & BED</span>
                  </div>
                  <p className="text-2xl font-display font-black uppercase text-black leading-none">
                    {allocation.room_number} <span className="text-lg text-gray-500">/</span> {allocation.bed_space_number}
                  </p>
                </div>
              </div>

              {allocation.roommates?.length > 0 && (
                <div className="border-2 border-black p-4 bg-gray-50">
                  <div className="flex items-center gap-2 text-black mb-4 border-b-2 border-dashed border-gray-300 pb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase">ROOMMATES DETECTED</span>
                  </div>
                  <div className="space-y-3">
                    {allocation.roommates.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-white border border-black p-2 hover:translate-x-1 transition-transform">
                        <div className="w-8 h-8 bg-black text-[#CCFF00] flex items-center justify-center font-bold text-xs border border-black">
                          {r.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase">{r.name}</p>
                          <p className="text-xs font-mono text-gray-500">{r.matric_number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 mx-auto bg-gray-200 border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <AlertCircle className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-xl font-bold uppercase mb-2">NO ALLOCATION FOUND</p>
              <p className="text-sm font-mono text-gray-500 mb-6">System waiting for application submission.</p>
              <Link href="/student/apply">
                <Button variant="brutal" size="lg" className="w-full">
                  INITIATE APPLICATION <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Info */}
        <Card delay={0.4} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-6 border-b-2 border-black pb-4">PROFILE SUMMARY</h3>
          <div className="space-y-0">
            {[
              { label: "MATRIC NUMBER", value: user?.matric_number },
              { label: "DEPARTMENT", value: user?.department },
              { label: "LEVEL", value: `${user?.level} LEVEL` },
              { label: "GENDER", value: user?.gender?.toUpperCase() },
              { label: "EMAIL", value: user?.email?.toUpperCase() },
              { label: "PHONE", value: user?.phone || "NOT SET" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-black last:border-0 hover:bg-[#CCFF00]/20 transition-colors px-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                <span className="text-sm font-bold text-black font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
