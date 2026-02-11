"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Building2, Upload, FileCheck, Send } from "lucide-react";

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
        const res: any = await api.get("/admin/hostels", token!);
        setHostels(res.data || []);
      } catch {}
      setLoading(false);
    }
    if (token) loadHostels();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_choice_hostel_id) {
      toast.error("Please select at least your first choice hostel");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/student/apply", form, token!);
      toast.success("Application submitted successfully!");

      if (receiptFile) {
        const fd = new FormData();
        fd.append("receipt", receiptFile);
        await api.upload("/student/upload-receipt", fd, token!);
        toast.success("Payment receipt uploaded!");
      }

      router.push("/student");
    } catch (err: any) {
      toast.error(err.message || "Application failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Topbar title="Apply for Hostel" subtitle="Submit your accommodation application" />

      <div className="max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-lime-600" />
                Hostel Preferences
              </h3>
              <p className="text-sm text-gray-500 mb-4">Select your preferred hostels in order of priority</p>

              {[
                { label: "1st Choice (Required)", field: "first_choice_hostel_id" },
                { label: "2nd Choice (Optional)", field: "second_choice_hostel_id" },
                { label: "3rd Choice (Optional)", field: "third_choice_hostel_id" },
              ].map((choice) => (
                <div key={choice.field} className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{choice.label}</label>
                  <select
                    value={(form as any)[choice.field]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [choice.field]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <option value="">Select hostel</option>
                    {hostels
                      .filter((h) => h.is_active)
                      .map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.gender}) - {h.total_capacity - h.current_occupancy} spaces left
                        </option>
                      ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="border-t border-lime-100 pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Upload className="w-5 h-5 text-lime-600" />
                Payment Receipt (Optional)
              </h3>
              <p className="text-sm text-gray-500 mb-4">Upload your payment receipt for faster verification</p>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-lime-300 rounded-xl cursor-pointer bg-lime-50/50 hover:bg-lime-50 transition-colors">
                <div className="text-center">
                  {receiptFile ? (
                    <>
                      <FileCheck className="w-8 h-8 text-lime-600 mx-auto mb-2" />
                      <p className="text-sm text-lime-700 font-medium">{receiptFile.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-lime-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload receipt</p>
                      <p className="text-xs text-gray-400">JPEG, PNG or PDF (max 5MB)</p>
                    </>
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

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-xl shadow-lg shadow-lime-600/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </motion.button>
          </form>
        </Card>
      </div>
    </div>
  );
}
