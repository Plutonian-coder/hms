"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Building2, Upload, FileCheck, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApplyPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_choice_hostel_id: "",
    second_choice_hostel_id: "",
    third_choice_hostel_id: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadHostels() {
      try {
        // Use public endpoint — no admin auth required
        const res: any = await api.get("/public/hostels", token!);
        setHostels(res.data || []);
      } catch { }
      setLoading(false);
    }
    if (token) loadHostels();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_choice_hostel_id) {
      toast.error("PLEASE SELECT AT LEAST YOUR FIRST CHOICE HOSTEL");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/student/apply", form, token!);
      toast.success("APPLICATION SUBMITTED SUCCESSFULLY!");

      if (receiptFile) {
        const fd = new FormData();
        fd.append("receipt", receiptFile);
        await api.upload("/student/upload-receipt", fd, token!);
        toast.success("PAYMENT RECEIPT UPLOADED!");
      }

      router.push("/student");
    } catch (err: any) {
      toast.error(err.message || "APPLICATION FAILED");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Topbar title="APPLY FOR HOSTEL" subtitle="SUBMIT YOUR ACCOMMODATION APPLICATION" />

      <div className="max-w-3xl">
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-[#CCFF00] p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-display font-black uppercase tracking-tighter text-black mb-6 flex items-center gap-3 border-b-2 border-black pb-2">
                <div className="w-8 h-8 bg-black flex items-center justify-center text-[#CCFF00]">
                  <Building2 className="w-5 h-5" />
                </div>
                HOSTEL PREFERENCES
              </h3>

              <div className="space-y-4">
                {[
                  { label: "1ST CHOICE (REQUIRED)", field: "first_choice_hostel_id", required: true },
                  { label: "2ND CHOICE (OPTIONAL)", field: "second_choice_hostel_id" },
                  { label: "3RD CHOICE (OPTIONAL)", field: "third_choice_hostel_id" },
                ].map((choice) => (
                  <div key={choice.field} className="relative">
                    <label className="block text-xs font-bold uppercase tracking-widest text-black mb-1">
                      {choice.label}
                    </label>
                    <select
                      value={(form as any)[choice.field]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [choice.field]: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-black bg-white text-sm font-bold uppercase focus:outline-none focus:ring-0 focus:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer appearance-none rounded-none"
                    >
                      <option value="">SELECT HOSTEL PREFERENCE</option>
                      {hostels
                        .filter((h) => h.is_active)
                        .map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} ({h.gender}) - {h.total_capacity - h.current_occupancy} SPACES
                          </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black font-bold mt-6">
                      ▼
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-display font-black uppercase tracking-tighter text-black mb-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-black flex items-center justify-center text-white">
                  <Upload className="w-4 h-4" />
                </div>
                PAYMENT EVIDENCE
              </h3>
              <p className="text-xs font-bold uppercase text-gray-500 mb-6">UPLOAD RECEIPT FOR VERIFICATION</p>

              <label className="flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-black cursor-pointer bg-gray-50 hover:bg-[#CCFF00]/20 transition-colors group relative overflow-hidden">
                <div className="text-center relative z-10">
                  {receiptFile ? (
                    <div className="flex flex-col items-center">
                      <FileCheck className="w-8 h-8 text-black mb-2" />
                      <p className="text-sm font-bold uppercase text-black bg-white px-2 border border-black">{receiptFile.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-black mb-2" />
                      <p className="text-sm font-bold uppercase text-gray-500 group-hover:text-black">CLICK TO UPLOAD RECEIPT</p>
                      <p className="text-[10px] font-mono text-gray-400">JPEG, PNG OR PDF</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <Button
              type="submit"
              variant="brutal"
              size="xl"
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                "SUBMITTING REQUEST..."
              ) : (
                <>
                  SUBMIT APPLICATION <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
