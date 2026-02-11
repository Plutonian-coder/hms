"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Vote, Play, CheckCircle2, Settings2, AlertTriangle } from "lucide-react";

export default function BallotPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [ballotRuns, setBallotRuns] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [configForm, setConfigForm] = useState({
    payment_weight: "0.50",
    category_weight: "0.30",
    level_weight: "0.20",
    fresh_student_score: "100",
    final_year_score: "90",
    level_300_score: "70",
    level_200_score: "60",
  });
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    async function load() {
      // Load existing config and ballot history
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await api.post("/admin/ballot/config", {
        payment_weight: parseFloat(configForm.payment_weight),
        category_weight: parseFloat(configForm.category_weight),
        level_weight: parseFloat(configForm.level_weight),
        fresh_student_score: parseInt(configForm.fresh_student_score),
        final_year_score: parseInt(configForm.final_year_score),
        level_300_score: parseInt(configForm.level_300_score),
        level_200_score: parseInt(configForm.level_200_score),
      }, token!);
      toast.success("Ballot configuration saved");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleRunBallot = async () => {
    if (!confirm("Are you sure you want to run the ballot? This will allocate rooms to all verified students.")) return;
    setRunning(true);
    try {
      const res: any = await api.post("/admin/ballot/run", {}, token!);
      toast.success(`Ballot completed! ${res.data?.total_allocated || 0} students allocated`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <Topbar title="Ballot System" subtitle="Configure and run the allocation ballot" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-lime-600" />
            Ballot Configuration
          </h3>
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-3">Priority Weights (must sum to 1.0)</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Payment", field: "payment_weight" },
                  { label: "Category", field: "category_weight" },
                  { label: "Level", field: "level_weight" },
                ].map((w) => (
                  <div key={w.field}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{w.label}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={(configForm as any)[w.field]}
                      onChange={(e) => setConfigForm(f => ({ ...f, [w.field]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-lime-200 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-3">Category Scores</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Fresh (100L)", field: "fresh_student_score" },
                  { label: "Final Year", field: "final_year_score" },
                  { label: "300 Level", field: "level_300_score" },
                  { label: "200 Level", field: "level_200_score" },
                ].map((s) => (
                  <div key={s.field}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{s.label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={(configForm as any)[s.field]}
                      onChange={(e) => setConfigForm(f => ({ ...f, [s.field]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-lime-200 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" isLoading={savingConfig} variant="secondary" className="w-full">
              Save Configuration
            </Button>
          </form>
        </Card>

        {/* Run Ballot */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Vote className="w-5 h-5 text-lime-600" />
              Run Ballot
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Important</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Running the ballot will allocate rooms to all students with verified payments based on priority scores.
                    Ensure all configurations are correct before proceeding.
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleRunBallot}
              isLoading={running}
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              {running ? "Running Ballot..." : "Run Ballot Now"}
            </Button>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ballot History</h3>
            {ballotRuns.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No ballot runs yet</p>
            ) : (
              <div className="space-y-3">
                {ballotRuns.map((run, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium">{run.total_allocated} allocated</p>
                      <p className="text-xs text-gray-500">{run.run_at}</p>
                    </div>
                    <StatusBadge status={run.status} />
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
