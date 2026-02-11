"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { DoorOpen, Users, BedDouble, MessageSquare, Save } from "lucide-react";

export default function WardenRoomsPage() {
  const { token } = useAuthStore();
  const [hostels, setHostels] = useState<any[]>([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res: any = await api.get("/warden/hostels", token!);
        setHostels(res.data || []);
        if (res.data?.length > 0) setSelectedHostel(res.data[0].id);
      } catch {}
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  useEffect(() => {
    async function loadRooms() {
      if (!selectedHostel) return;
      try {
        const res: any = await api.get(`/warden/hostels/${selectedHostel}/rooms`, token!);
        setRooms(res.data || []);
      } catch {}
    }
    if (token && selectedHostel) loadRooms();
  }, [token, selectedHostel]);

  const selectRoom = (room: any) => {
    setSelectedRoom(room);
    setNotes(room.notes || "");
  };

  const saveNotes = async () => {
    if (!selectedRoom) return;
    setSavingNotes(true);
    try {
      await api.patch(`/warden/rooms/${selectedRoom.id}/notes`, { notes }, token!);
      toast.success("Notes saved");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <Topbar title="Room Management" subtitle="View rooms and manage occupancy" />

      <Card className="mb-6">
        <select
          value={selectedHostel}
          onChange={(e) => { setSelectedHostel(e.target.value); setSelectedRoom(null); }}
          className="px-4 py-2 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          {hostels.map((h: any) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Room list */}
        <div className="col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          {rooms.map((room: any, i: number) => {
            const pct = room.capacity > 0 ? (room.current_occupancy / room.capacity) * 100 : 0;
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => selectRoom(room)}
                className={`glass-card p-4 cursor-pointer ${
                  selectedRoom?.id === room.id ? "ring-2 ring-lime-400 bg-lime-50/80" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">{room.room_number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    pct >= 100 ? "bg-red-100 text-red-700" :
                    pct === 0 ? "bg-gray-100 text-gray-600" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {room.current_occupancy}/{room.capacity}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-lime-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct === 0 ? "bg-gray-300" : "bg-lime-500"}`} style={{ width: `${pct}%` }} />
                </div>
              </motion.div>
            );
          })}
          {rooms.length === 0 && <p className="text-center py-8 text-gray-500 text-sm">No rooms found</p>}
        </div>

        {/* Room detail */}
        <div className="col-span-2">
          {selectedRoom ? (
            <Card hover={false}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Room {selectedRoom.room_number}</h2>
                <p className="text-gray-500">Floor {selectedRoom.floor_number} - {selectedRoom.room_type} - {selectedRoom.current_occupancy}/{selectedRoom.capacity} occupied</p>
              </div>

              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-lime-600" /> Occupants
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {(selectedRoom.occupants || []).map((s: any, i: number) => (
                  <div key={i} className="border border-lime-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center text-lime-700 font-bold text-sm">
                      {s.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.full_name}</p>
                      <p className="text-xs text-gray-500">{s.matric_number}</p>
                    </div>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, selectedRoom.capacity - (selectedRoom.occupants?.length || selectedRoom.current_occupancy)) }).map((_, i) => (
                  <div key={`e-${i}`} className="border-2 border-dashed border-lime-200 rounded-xl p-3 flex items-center justify-center text-gray-400 text-sm">
                    <BedDouble className="w-5 h-5 mr-2 text-lime-300" /> Available
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-lime-600" /> Room Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this room..."
                  className="w-full px-4 py-3 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 h-24 resize-none"
                />
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="mt-2 px-4 py-2 bg-lime-600 text-white text-sm rounded-xl hover:bg-lime-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
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
    </div>
  );
}
