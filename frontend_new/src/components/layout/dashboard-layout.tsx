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
    <div className="flex min-h-screen bg-brand-paper">
      <Sidebar />
      <main className="flex-1 ml-[72px] lg:ml-72 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
