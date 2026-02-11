"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
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
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

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
      } catch {}
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  if (loading) return <PageLoading />;

  return (
    <div>
      <Topbar
        title={`Hello, ${user?.first_name || "Student"}`}
        subtitle="Your hostel accommodation status at a glance"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Application Status"
          value={application?.status ? application.status.replace(/_/g, " ") : "Not Applied"}
          icon={<FileText className="w-6 h-6" />}
          color="lime"
          delay={0}
        />
        <StatCard
          title="Payment"
          value={application?.payment_verified ? "Verified" : "Pending"}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color={application?.payment_verified ? "emerald" : "amber"}
          delay={0.1}
        />
        <StatCard
          title="Priority Score"
          value={application?.priority_score?.toFixed(2) || "N/A"}
          icon={<Clock className="w-6 h-6" />}
          color="blue"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Details */}
        <Card delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Allocation</h3>
            {allocation && (
              <Link href="/student/allocation" className="text-lime-600 text-sm font-medium hover:text-lime-700 flex items-center gap-1">
                View Details <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {allocation ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-lime-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-lime-700 mb-1">
                    <Home className="w-4 h-4" />
                    <span className="text-xs font-medium">Hostel</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{allocation.hostel_name}</p>
                </div>
                <div className="bg-lime-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-lime-700 mb-1">
                    <BedDouble className="w-4 h-4" />
                    <span className="text-xs font-medium">Room & Bed</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {allocation.room_number} - Bed {allocation.bed_space_number}
                  </p>
                </div>
              </div>

              {allocation.roommates?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Roommates</span>
                  </div>
                  <div className="space-y-2">
                    {allocation.roommates.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <div className="w-8 h-8 rounded-full bg-lime-200 flex items-center justify-center text-lime-700 font-bold text-xs">
                          {r.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{r.name}</p>
                          <p className="text-xs text-gray-500">{r.matric_number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-lime-100 flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-lime-500" />
              </div>
              <p className="text-gray-500 mb-4">No allocation yet</p>
              <Link
                href="/student/apply"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-lime-600 text-white rounded-xl text-sm font-medium hover:bg-lime-700 transition-colors"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Info */}
        <Card delay={0.4}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
          <div className="space-y-3">
            {[
              { label: "Matric Number", value: user?.matric_number },
              { label: "Department", value: user?.department },
              { label: "Level", value: `${user?.level} Level` },
              { label: "Gender", value: user?.gender?.charAt(0).toUpperCase() + (user?.gender?.slice(1) || "") },
              { label: "Email", value: user?.email },
              { label: "Phone", value: user?.phone || "Not set" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-lime-100 last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
