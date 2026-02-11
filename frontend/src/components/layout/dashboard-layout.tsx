"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { useAuthStore } from "@/stores/auth";
import type { UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (role && !roles.includes(role)) {
        router.push(`/${role}`);
      }
    }
  }, [isAuthenticated, role, requiredRole, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
