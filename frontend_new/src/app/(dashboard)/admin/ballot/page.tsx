"use client";

import { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Vote, Play, AlertTriangle, CalendarDays, Users, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function BallotPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [ballotRuns, setBallotRuns] = useState<any[]>([]);
  const [pendingApps, setPendingApps] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  const loadData = useCallback(async (sessionId: string) => {
    try {
      // 1. Load history
      const historyRes: any = await api.get(`/admin/ballot/history?session_id=${sessionId}`, token!);
      setBallotRuns(historyRes.data || []);

      // 2. Load pending students (Payment Verified but not yet allocated)
      const appsRes: any = await api.get(`/admin/applications?session_id=${sessionId}&status=payment_verified&payment_verified=true&limit=1000`, token!);
      setPendingApps(appsRes.data?.data || []);
    } catch (err: any) {
      console.error("Failed to load ballot data:", err);
    }
  }, [token]);

  useEffect(() => {
    async function init() {
      try {
        const sessionsRes: any = await api.get("/admin/sessions", token!);
        const active = sessionsRes.data?.find((s: any) => s.is_active);
        if (active) {
          setActiveSession(active);
          await loadData(active.id);
        } else {
          toast.error("No active session found. Please activate a session first.");
        }
      } catch (err: any) {
        toast.error("Failed to initialize ballot system");
      } finally {
        setLoading(false);
      }
    }
    if (token) init();
  }, [token, loadData]);

  const handleRunBallot = async () => {
    if (!activeSession) return toast.error("No active session found");
    if (pendingApps.length === 0) return toast.info("No pending applications to ballot.");

    if (!confirm(`Are you sure you want to run the ballot for ${pendingApps.length} students? This will instantly allocate and approve their spaces.`)) return;

    setRunning(true);
    try {
      const res: any = await api.post("/admin/ballot/run", {
        session_id: activeSession.id,
        confirm: true
      }, token!);
      toast.success(`Ballot completed! ${res.data?.total_allocated || 0} students allocated and approved.`);
      await loadData(activeSession.id);
    } catch (err: any) {
      toast.error(err.message || "Ballot run failed");
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <PageLoading />;

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-mono">NO ACTIVE SESSION</h2>
        <Link href="/admin/sessions">
          <Button>Manage Sessions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Topbar
        title="BALLOT SYSTEM"
        subtitle={`Instantly allocate confirmed students for ${activeSession.name}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Students List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                PENDING ALLOCATIONS
              </h3>
              <div className="px-3 py-1 bg-lime-100 border-2 border-black text-xs font-bold rounded-lg">
                {pendingApps.length} WAITING
              </div>
            </div>

            {pendingApps.length === 0 ? (
              <div className="py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">All verified students have been allocated.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                      <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Matric No.</th>
                      <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preference</th>
                      <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pendingApps.map((app) => (
                      <tr key={app.id} className="group hover:bg-lime-50/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold">
                              {app.student?.first_name?.[0]}{app.student?.last_name?.[0]}
                            </div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">
                              {app.student?.first_name} {app.student?.last_name}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 text-xs font-mono text-gray-500">{app.student?.matric_number}</td>
                        <td className="py-3 text-xs font-medium text-gray-600">
                          {app.first_choice?.name || "No preference"}
                        </td>
                        <td className="py-3 text-right">
                          <span className="px-2 py-0.5 bg-amber-100 text-[10px] font-bold text-amber-600 border border-amber-200 rounded">
                            PENDING
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Actions and History */}
        <div className="space-y-6">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-lime-50">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Vote className="w-5 h-5" />
              BALLOT ACTION
            </h3>

            <div className="space-y-4">
              <div className="bg-white/80 border-2 border-black p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Target</span>
                  <span className="text-xs font-bold text-gray-900">Verified Appplications</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase">Count</span>
                  <span className="text-xl font-black text-black">{pendingApps.length}</span>
                </div>
              </div>

              <Button
                onClick={handleRunBallot}
                isLoading={running}
                disabled={pendingApps.length === 0}
                size="lg"
                className="w-full flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-500 text-black border-2 border-b-6 border-black active:translate-y-1 active:border-b-2 disabled:opacity-50 disabled:grayscale"
              >
                <Play className="w-5 h-5" />
                {running ? "PROCESSING..." : "RUN BALLOT NOW"}
              </Button>

              <p className="text-[10px] text-gray-500 text-center font-medium px-4 leading-relaxed">
                Clicking the button will automatically assign rooms based on availability and mark them as <strong>ALLOCATED</strong> immediately.
              </p>
            </div>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-tighter mb-6 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              RECENT BALLOT RUNS
            </h3>
            {ballotRuns.length === 0 ? (
              <p className="text-xs text-gray-400 font-medium text-center py-4">No runs yet.</p>
            ) : (
              <div className="space-y-3">
                {ballotRuns.slice(0, 5).map((run, i) => (
                  <div key={i} className="group p-3 border-2 border-slate-100 rounded-xl hover:border-black transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{run.total_allocated} Allocations</span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        AUTO-APPROVED
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">{formatDate(run.run_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
