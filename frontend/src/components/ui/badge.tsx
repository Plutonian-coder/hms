import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

const variants = {
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
};

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    pending: { label: "Pending", variant: "warning" },
    payment_verified: { label: "Payment Verified", variant: "info" },
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
