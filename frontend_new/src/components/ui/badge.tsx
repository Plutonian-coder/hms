import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

const variants = {
  success: "bg-emerald-300 text-black border-black",
  warning: "bg-amber-300 text-black border-black",
  danger: "bg-[#FF3366] text-white border-black",
  info: "bg-[#0047FF] text-white border-black",
  neutral: "bg-gray-200 text-black border-black",
};

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2",
        variants[variant],
        className
      )}
      style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    pending: { label: "Pending", variant: "warning" },
    payment_verified: { label: "Verified", variant: "info" },
    balloted: { label: "Balloted", variant: "info" },
    allocated: { label: "Allocated", variant: "success" },
    not_allocated: { label: "Not Allocated", variant: "danger" },
    rejected: { label: "Rejected", variant: "danger" },
    active: { label: "Active", variant: "success" },
    checked_in: { label: "Checked In", variant: "success" },
    checked_out: { label: "Checked Out", variant: "neutral" },
    revoked: { label: "Revoked", variant: "danger" },
    running: { label: "Running", variant: "warning" },
    completed: { label: "Completed", variant: "info" },
    approved: { label: "Approved", variant: "success" },
  };

  const config = map[status] || { label: status, variant: "neutral" as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
