import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Zap, CreditCard, Building2, CheckCircle2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

interface ApplicationDetailsDialogProps {
    application: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAllocated: () => void;
}

export function ApplicationDetailsDialog({
    application,
    open,
    onOpenChange,
    onAllocated,
}: ApplicationDetailsDialogProps) {
    const [loading, setLoading] = useState(false);
    const { token } = useAuthStore();

    if (!application) return null;

    const handleAutoBallot = async () => {
        setLoading(true);
        try {
            const res: any = await api.post("/admin/allocations/bulk-auto-assign", {
                student_ids: [application.student_id],
                allocation_mode: "random", // Switched to random as per user request
            }, token!);

            if (res.data?.allocated_count > 0) {
                toast.success(`Allocated successfully`);
                onAllocated();
                onOpenChange(false);
            } else if (res.data?.failed_count > 0) {
                const reason = res.data.failed_students[0]?.reason || "Allocation failed";
                toast.error(`Allocation failed: ${reason}`);
            } else {
                toast.warning("No allocation made. Check room availability.");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to run auto-ballot");
        } finally {
            setLoading(false);
        }
    };

    const isEligible = application.payment_verified && (application.status === 'pending' || application.status === 'payment_verified' || application.status === 'not_allocated' || application.status === 'balloted');

    return (
        <Modal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title="APPLICATION DETAILS"
            size="lg"
        >
            <div className="space-y-6">
                {/* Header Status */}
                <div className="flex justify-end -mt-12 mb-4 pointer-events-none">
                    <StatusBadge status={application.status} />
                </div>

                {/* Student Info */}
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-lime-200 border-2 border-black flex items-center justify-center text-2xl font-bold">
                        {application.student?.first_name?.[0]}{application.student?.last_name?.[0]}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">
                            {application.student?.first_name} {application.student?.last_name}
                        </h3>
                        <p className="font-mono text-gray-500">{application.student?.matric_number}</p>
                        <div className="flex gap-2 mt-2 text-sm text-gray-600">
                            <span className="bg-white px-2 py-1 rounded border border-gray-200">
                                {application.student?.level}L
                            </span>
                            <span className="bg-white px-2 py-1 rounded border border-gray-200">
                                {application.student?.gender}
                            </span>
                            <span className="bg-white px-2 py-1 rounded border border-gray-200">
                                {application.student?.department}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Payment Info */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between">
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-3">
                                <CreditCard className="w-4 h-4" /> PAYMENT
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <span className={application.payment_verified ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                        {application.payment_verified ? "VERIFIED" : "PENDING"}
                                    </span>
                                </div>
                                {application.payment_verified_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Verified On</span>
                                        <span>{formatDate(application.payment_verified_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {application.payment_receipt_url && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Receipt</p>
                                <div className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                    <img
                                        src={application.payment_receipt_url}
                                        alt="Payment Receipt"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    <a
                                        href={application.payment_receipt_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                    >
                                        <ExternalLink className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Application Info */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-3">
                            <Building2 className="w-4 h-4" /> PREFERENCES
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between">
                                <span className="text-gray-500">1st Choice</span>
                                <span className="font-medium">{application.first_choice?.name || "—"}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500">2nd Choice</span>
                                <span className="font-medium">{application.second_choice?.name || "—"}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500">3rd Choice</span>
                                <span className="font-medium">{application.third_choice?.name || "—"}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Allocation Info if Allocated */}
                {application.status === 'allocated' && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-3">
                            <CheckCircle2 className="w-4 h-4" /> ALLOCATION SUCCESSFUL
                        </h4>
                        <p className="text-sm text-emerald-700">
                            Student has been allocated. Check the full allocation list for room details.
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    {isEligible && (
                        <Button
                            onClick={handleAutoBallot}
                            disabled={loading}
                            className="bg-lime-400 hover:bg-lime-500 text-black border-2 border-b-4 border-black active:border-b-2"
                        >
                            {loading ? "Processing..." : (
                                <>
                                    <Zap className="w-4 h-4 mr-2" />
                                    Auto-Ballot Student
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
