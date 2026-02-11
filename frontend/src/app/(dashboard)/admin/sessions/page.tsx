"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, CalendarDays, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SessionsPage() {
  const { token } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    application_start_date: "",
    application_end_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSessions = async () => {
    try {
      const res: any = await api.get("/admin/sessions", token!);
      setSessions(res.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (token) fetchSessions(); }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/sessions", form, token!);
      toast.success("Session created");
      setShowModal(false);
      fetchSessions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await api.patch(`/admin/sessions/${id}`, { is_active: true }, token!);
      toast.success("Session activated");
      fetchSessions();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <Topbar title="Academic Sessions" subtitle="Manage academic sessions and application periods" />

      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session, i) => (
          <Card key={session.id} delay={i * 0.05}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-lime-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{session.name}</h3>
                  {session.is_active && <Badge variant="success">Active</Badge>}
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Session Period</span>
                <span className="text-gray-700">{formatDate(session.start_date)} - {formatDate(session.end_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Application Period</span>
                <span className="text-gray-700">{formatDate(session.application_start_date)} - {formatDate(session.application_end_date)}</span>
              </div>
            </div>
            {!session.is_active && (
              <Button onClick={() => toggleActive(session.id)} variant="outline" size="sm" className="mt-4 w-full">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Set as Active
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Academic Session">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="2024/2025"
              className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App. Start</label>
              <input type="date" value={form.application_start_date} onChange={(e) => setForm(f => ({ ...f, application_start_date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App. End</label>
              <input type="date" value={form.application_end_date} onChange={(e) => setForm(f => ({ ...f, application_end_date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" required />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border-2 border-lime-300 text-lime-700 font-medium rounded-xl hover:bg-lime-50">Cancel</button>
            <Button type="submit" isLoading={submitting} className="flex-1">Create Session</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
