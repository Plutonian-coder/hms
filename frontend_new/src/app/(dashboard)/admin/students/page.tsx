"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { Search, Users } from "lucide-react";

export default function StudentsPage() {
  const { token } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res: any = await api.get("/admin/students", token!);
        setStudents(res.data || []);
      } catch { }
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.matric_number?.toLowerCase().includes(q) || s.first_name?.toLowerCase().includes(q) || s.last_name?.toLowerCase().includes(q);
  });

  if (loading) return <PageLoading />;

  return (
    <div>
      <Topbar title="Students" subtitle="View all registered students" />

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or matric number..."
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
              <Th>Gender</Th>
              <Th>Level</Th>
              <Th>Department</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((s) => (
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
                <Td><Badge variant={s.gender === "male" ? "info" : "danger"}>{s.gender}</Badge></Td>
                <Td>{s.level}L</Td>
                <Td>{s.department}</Td>
                <Td>
                  <Badge variant={s.is_eligible ? "success" : "danger"}>
                    {s.is_eligible ? "Eligible" : "Ineligible"}
                  </Badge>
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
