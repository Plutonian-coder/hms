"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Zap, Filter, Search, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ApplicationDetailsDialog } from "@/components/admin/ApplicationDetailsDialog";

export default function ApplicationsPage() {
  const { token } = useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [allocating, setAllocating] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [activeSessionId, setActiveSessionId] = useState<string>("");

  const fetchApplications = useCallback(async (sessionId?: string) => {
    try {
      const url = sessionId
        ? `/admin/applications?session_id=${sessionId}&limit=1000`
        : "/admin/applications?limit=1000";
      const res: any = await api.get(url, token!);
      // API returns { success: true, data: { data: [...], total: N } }
      setApplications(res.data?.data || []);
    } catch { }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    async function init() {
      if (!token) return;
      try {
        const res: any = await api.get("/admin/sessions", token);
        const active = res.data?.find((s: any) => s.is_active);
        if (active) {
          setActiveSessionId(active.id);
          fetchApplications(active.id);
        } else {
          fetchApplications();
        }
      } catch {
        fetchApplications();
      }
    }
    init();
  }, [token, fetchApplications]);

  const filteredApps = applications.filter((app) => {
    if (filter !== "all" && app.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        app.student?.matric_number?.toLowerCase().includes(q) ||
        app.student?.first_name?.toLowerCase().includes(q) ||
        app.student?.last_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(filteredApps.filter(a => a.payment_verified).map(a => a.student_id));
    } else {
      setSelected([]);
    }
  };

  const toggleSelect = (studentId: string) => {
    setSelected(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const verifyPayment = async (appId: string) => {
    try {
      await api.patch(`/admin/applications/${appId}/verify`, {
        application_id: appId,
        verified: true
      }, token!);
      toast.success("Payment verified");
      fetchApplications(activeSessionId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBulkAutoAssign = async () => {
    if (selected.length === 0) return;
    setAllocating(true);
    try {
      const res: any = await api.post("/admin/allocations/bulk-auto-assign", {
        student_ids: selected,
        allocation_mode: "priority_based",
      }, token!);
      toast.success(`${res.data?.allocated_count || 0} students allocated successfully`);
      if (res.data?.failed_count > 0) {
        toast.warning(`${res.data.failed_count} students could not be allocated`);
      }
      setSelected([]);
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message || "Allocation failed");
    } finally {
      setAllocating(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <Topbar title="Applications" subtitle="Manage student applications and payments" />

      {/* Toolbar */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="pl-10 pr-4 py-2 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 w-64"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="payment_verified">Payment Verified</option>
              <option value="balloted">Balloted</option>
              <option value="allocated">Allocated</option>
              <option value="not_allocated">Not Allocated</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            {selected.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  onClick={handleBulkAutoAssign}
                  isLoading={allocating}
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Auto Assign ({selected.length})
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card hover={false}>
        <Table>
          <Thead>
            <Tr>
              <Th>
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={selected.length > 0 && selected.length === filteredApps.filter(a => a.payment_verified).length}
                  className="rounded border-lime-300 text-lime-600 focus:ring-lime-400"
                />
              </Th>
              <Th>Student</Th>
              <Th>Matric No.</Th>
              <Th>Level</Th>
              <Th>Status</Th>
              <Th>Priority</Th>
              <Th>Applied</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredApps.map((app) => (
              <Tr key={app.id}>
                <Td>
                  {app.payment_verified && (
                    <input
                      type="checkbox"
                      checked={selected.includes(app.student_id)}
                      onChange={() => toggleSelect(app.student_id)}
                      className="rounded border-lime-300 text-lime-600 focus:ring-lime-400"
                    />
                  )}
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center text-lime-700 font-bold text-xs">
                      {app.student?.first_name?.[0]}{app.student?.last_name?.[0]}
                    </div>
                    <span className="font-medium">
                      {app.student?.first_name} {app.student?.last_name}
                    </span>
                  </div>
                </Td>
                <Td className="font-mono text-xs">{app.student?.matric_number}</Td>
                <Td>{app.student?.level}L</Td>
                <Td><StatusBadge status={app.status} /></Td>
                <Td className="font-mono">{app.priority_score?.toFixed(2) || "—"}</Td>
                <Td className="text-xs text-gray-500">{formatDate(app.application_date)}</Td>
                <Td>
                  {!app.payment_verified && (
                    <button
                      onClick={() => verifyPayment(app.id)}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"
                      title="Verify Payment"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => { setSelectedApp(app); setShowDetails(true); }}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 ml-1"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {filteredApps.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">No applications found</div>
        )}

      </Card>

      <ApplicationDetailsDialog
        application={selectedApp}
        open={showDetails}
        onOpenChange={setShowDetails}
        onAllocated={() => {
          fetchApplications();
          setShowDetails(false);
        }}
      />
    </div>
  );
}
