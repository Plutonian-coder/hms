"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, LogIn, LogOut, Users } from "lucide-react";

export default function WardenStudentsPage() {
  const { token } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res: any = await api.get("/warden/students", token!);
        setStudents(res.data || []);
      } catch {}
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  const handleCheckIn = async (allocationId: string) => {
    try {
      await api.post("/warden/check-in", { allocation_id: allocationId }, token!);
      toast.success("Student checked in");
      const res: any = await api.get("/warden/students", token!);
      setStudents(res.data || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCheckOut = async (allocationId: string) => {
    try {
      await api.post("/warden/check-out", { allocation_id: allocationId }, token!);
      toast.success("Student checked out");
      const res: any = await api.get("/warden/students", token!);
      setStudents(res.data || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = students.filter((s: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.matric_number?.toLowerCase().includes(q) || s.first_name?.toLowerCase().includes(q) || s.last_name?.toLowerCase().includes(q);
  });

  if (loading) return <PageLoading />;

  return (
    <div>
      <Topbar title="Students" subtitle="Manage student check-in and check-out" />

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
        </div>
      </Card>

      <Card hover={false}>
        <Table>
          <Thead>
            <Tr>
              <Th>Student</Th>
              <Th>Matric No.</Th>
              <Th>Room</Th>
              <Th>Bed</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((s: any) => (
              <Tr key={s.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center text-lime-700 font-bold text-xs">
                      {s.first_name?.[0]}{s.last_name?.[0]}
                    </div>
                    <span className="font-medium">{s.first_name} {s.last_name}</span>
                  </div>
                </Td>
                <Td className="font-mono text-xs">{s.matric_number}</Td>
                <Td>{s.room_number || "—"}</Td>
                <Td>{s.bed_space_number || "—"}</Td>
                <Td><StatusBadge status={s.allocation_status || "active"} /></Td>
                <Td>
                  <div className="flex gap-2">
                    {s.allocation_status === "active" && (
                      <button
                        onClick={() => handleCheckIn(s.allocation_id)}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"
                        title="Check In"
                      >
                        <LogIn className="w-4 h-4" />
                      </button>
                    )}
                    {s.allocation_status === "checked_in" && (
                      <button
                        onClick={() => handleCheckOut(s.allocation_id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        title="Check Out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500 text-sm">No students found</p>}
      </Card>
    </div>
  );
}
