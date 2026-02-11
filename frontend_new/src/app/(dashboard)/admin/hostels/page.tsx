"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Building2, Users, Edit2, Trash2 } from "lucide-react";

export default function HostelsPage() {
  const { token } = useAuthStore();
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHostel, setEditingHostel] = useState<any>(null);
  const [form, setForm] = useState({ name: "", gender: "male", total_capacity: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchHostels = async () => {
    try {
      const res: any = await api.get("/admin/hostels", token!);
      setHostels(res.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (token) fetchHostels(); }, [token]);

  const openCreate = () => {
    setEditingHostel(null);
    setForm({ name: "", gender: "male", total_capacity: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (hostel: any) => {
    setEditingHostel(hostel);
    setForm({
      name: hostel.name,
      gender: hostel.gender,
      total_capacity: String(hostel.total_capacity),
      description: hostel.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, total_capacity: parseInt(form.total_capacity) };
      if (editingHostel) {
        await api.patch(`/admin/hostels/${editingHostel.id}`, payload, token!);
        toast.success("Hostel updated");
      } else {
        await api.post("/admin/hostels", payload, token!);
        toast.success("Hostel created");
      }
      setShowModal(false);
      fetchHostels();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hostel?")) return;
    try {
      await api.delete(`/admin/hostels/${id}`, token!);
      toast.success("Hostel deleted");
      fetchHostels();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <Topbar title="Hostels" subtitle="Manage hostel buildings" />

      <div className="flex justify-end mb-6">
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Hostel
        </Button>
      </div>

      {hostels.length === 0 ? (
        <Card>
          <EmptyState
            title="No Hostels"
            description="Create your first hostel building to get started"
            icon={<Building2 className="w-10 h-10" />}
            action={<Button onClick={openCreate}>Add Hostel</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((hostel, i) => {
            const pct = hostel.total_capacity > 0
              ? ((hostel.current_occupancy / hostel.total_capacity) * 100)
              : 0;
            return (
              <motion.div
                key={hostel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      hostel.gender === "male" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"
                    }`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{hostel.name}</h3>
                      <Badge variant={hostel.gender === "male" ? "info" : "danger"}>
                        {hostel.gender}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(hostel)} className="p-1.5 rounded-lg hover:bg-lime-50 text-gray-400 hover:text-lime-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(hostel.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Users className="w-4 h-4" />
                  <span>{hostel.current_occupancy} / {hostel.total_capacity} occupied</span>
                </div>

                <div className="w-full h-2 bg-lime-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 + 0.3 }}
                    className={`h-full rounded-full ${
                      pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-lime-500"
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% occupancy</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingHostel ? "Edit Hostel" : "Add New Hostel"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity</label>
              <input
                type="number"
                value={form.total_capacity}
                onChange={(e) => setForm(f => ({ ...f, total_capacity: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                required min={1}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 h-24 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border-2 border-lime-300 text-lime-700 font-medium rounded-xl hover:bg-lime-50">
              Cancel
            </button>
            <Button type="submit" isLoading={submitting} className="flex-1">
              {editingHostel ? "Update" : "Create"} Hostel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
