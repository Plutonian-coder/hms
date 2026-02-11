"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Shield, Building2 } from "lucide-react";

export default function WardensPage() {
  const { token } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ warden_id: "", hostel_id: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/wardens/assign", form, token!);
      toast.success("Warden assigned to hostel");
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Topbar title="Wardens" subtitle="Manage warden assignments" />

      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Assign Warden
        </Button>
      </div>

      <Card>
        <EmptyState
          title="Warden Assignments"
          description="Assign wardens to hostels for management. Use the button above to create new assignments."
          icon={<Shield className="w-10 h-10" />}
        />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Assign Warden to Hostel">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warden ID</label>
            <input
              type="text"
              value={form.warden_id}
              onChange={(e) => setForm(f => ({ ...f, warden_id: e.target.value }))}
              placeholder="Enter warden user ID"
              className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hostel ID</label>
            <input
              type="text"
              value={form.hostel_id}
              onChange={(e) => setForm(f => ({ ...f, hostel_id: e.target.value }))}
              placeholder="Enter hostel ID"
              className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border-2 border-lime-300 text-lime-700 font-medium rounded-xl hover:bg-lime-50">Cancel</button>
            <Button type="submit" isLoading={submitting} className="flex-1">Assign</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
