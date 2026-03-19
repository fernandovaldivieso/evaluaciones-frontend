"use client";

import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import ProtectedRoute from "@/components/protected-route";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["Candidato"]}>
      <div className="flex h-screen bg-surface-alt">
        <Sidebar />
        <div className="flex flex-1 flex-col gap-2 overflow-hidden pr-2 pt-2 pb-2">
          <Navbar />
          <main className="flex-1 overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
