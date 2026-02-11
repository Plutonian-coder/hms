"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, DoorOpen, Users, BedDouble, Search } from "lucide-react";

export default function RoomsPage() {
  const { token } = useAuthStore();
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [occupants, setOccupants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ room_number: "", floor_number: "1", capacity: "4", room_type: "standard" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadHostels() {
      try {
        const res: any = await api.get("/admin/hostels", token!);
        setHostels(res.data || []);
        if (res.data?.length > 0) {
          setSelectedHostel(res.data[0].id);
        }
      } catch { }
      setLoading(false);
    }
    if (token) loadHostels();
  }, [token]);

  useEffect(() => {
    async function loadRooms() {
      if (!selectedHostel) return;
      try {
        const res: any = await api.get(`/admin/hostels/${selectedHostel}/rooms`, token!);
        setRooms(res.data || []);
      } catch { }
    }
    if (token && selectedHostel) loadRooms();
  }, [token, selectedHostel]);

  const viewRoomOccupants = async (room: any) => {
    setSelectedRoom(room);
    setOccupants([]);
    try {
      const res: any = await api.get(`/admin/rooms/${room.id}/occupants`, token!);
      setSelectedRoom({ ...room, occupants: res.data || [] });
    } catch {
      toast.error("Failed to load occupants");
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/admin/hostels/${selectedHostel}/rooms`, {
        room_number: form.room_number,
        floor_number: parseInt(form.floor_number),
        capacity: parseInt(form.capacity),
        room_type: form.room_type,
      }, token!);
      toast.success("Room created");
      setShowCreateModal(false);
      setForm({ room_number: "", floor_number: "1", capacity: "4", room_type: "standard" });
      // Refresh
      const res: any = await api.get(`/admin/hostels/${selectedHostel}/rooms`, token!);
      setRooms(res.data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <Topbar title="Room Management" subtitle="Manage rooms and view occupancy" />

      {/* Hostel selector + actions */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <select
            value={selectedHostel}
            onChange={(e) => { setSelectedHostel(e.target.value); setSelectedRoom(null); }}
            className="px-4 py-2 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name} ({h.gender})</option>
            ))}
          </select>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Room
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Room List */}
        <div className="col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          {rooms.map((room, i) => {
            const pct = room.capacity > 0 ? (room.current_occupancy / room.capacity) * 100 : 0;
            const status = pct === 0 ? "empty" : pct >= 100 ? "full" : "partial";
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => viewRoomOccupants(room)}
                className={`glass-card p-4 cursor-pointer transition-all ${selectedRoom?.id === room.id ? "ring-2 ring-lime-400 bg-lime-50/80" : ""
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{room.room_number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status === "full" ? "bg-red-100 text-red-700" :
                      status === "empty" ? "bg-gray-100 text-gray-600" :
                        "bg-amber-100 text-amber-700"
                    }`}>
                    {room.current_occupancy}/{room.capacity}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-lime-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${status === "full" ? "bg-red-500" : status === "empty" ? "bg-gray-300" : "bg-lime-500"
                      }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Floor {room.floor_number} - {room.room_type}</p>
              </motion.div>
            );
          })}
          {rooms.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">No rooms in this hostel</div>
          )}
        </div>

        {/* Room Details */}
        <div className="col-span-2">
          {selectedRoom ? (
            <Card hover={false}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Room {selectedRoom.room_number}</h2>
                <p className="text-gray-500">
                  Floor {selectedRoom.floor_number} - Capacity: {selectedRoom.capacity} beds - {selectedRoom.room_type}
                </p>
              </div>

              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-lime-600" />
                Occupants ({selectedRoom.current_occupancy})
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Occupied beds */}
                {(selectedRoom.occupants || []).map((student: any, i: number) => (
                  <div key={i} className="border border-lime-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {student.full_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{student.full_name}</h4>
                        <p className="text-xs text-gray-500">{student.matric_number}</p>
                        <p className="text-xs text-gray-400">{student.department}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="info">Bed {student.bed_number}</Badge>
                          <Badge variant="neutral">Level {student.level}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty beds */}
                {Array.from({ length: Math.max(0, selectedRoom.capacity - (selectedRoom.occupants?.length || selectedRoom.current_occupancy)) }).map((_, i) => (
                  <div key={`empty-${i}`} className="border-2 border-dashed border-lime-200 rounded-xl p-4 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BedDouble className="w-8 h-8 mx-auto mb-1 text-lime-300" />
                      <p className="text-sm font-medium">Available</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedRoom.notes && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl text-sm text-amber-800">
                  <strong>Notes:</strong> {selectedRoom.notes}
                </div>
              )}
            </Card>
          ) : (
            <Card hover={false}>
              <div className="text-center py-16 text-gray-500">
                <DoorOpen className="w-12 h-12 mx-auto mb-3 text-lime-300" />
                <p>Select a room to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Room">
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <input
              type="text"
              value={form.room_number}
              onChange={(e) => setForm(f => ({ ...f, room_number: e.target.value }))}
              placeholder="e.g. A-101"
              className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <input
                type="number"
                value={form.floor_number}
                onChange={(e) => setForm(f => ({ ...f, floor_number: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.room_type}
                onChange={(e) => setForm(f => ({ ...f, room_type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="standard">Standard</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border-2 border-lime-300 text-lime-700 font-medium rounded-xl hover:bg-lime-50">
              Cancel
            </button>
            <Button type="submit" isLoading={submitting} className="flex-1">Create Room</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
