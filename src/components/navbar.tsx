"use client";

import { useRef } from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { revealContent } from "@/lib/animations";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const { user, logout } = useAuth();

  useGSAP(
    () => {
      if (headerRef.current) {
        revealContent(headerRef.current, { y: -12, duration: 0.4 });
      }
    },
    { scope: headerRef }
  );

  const initials = user?.nombre
    ? user.nombre
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header
      ref={headerRef}
      className="hidden items-center justify-between rounded-2xl border border-border bg-surface px-5 py-3 shadow-[var(--shadow-card)] md:flex"
    >
      {/* Search */}
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar evaluaciones, candidatos..."
            className="w-full rounded-xl border border-border bg-surface-alt py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="relative rounded-xl p-2 text-gray-400 transition-all duration-200 hover:bg-primary-50 hover:text-primary">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
        </button>
        <div className="mx-1 h-6 w-px bg-border-light" />
        <div className="flex items-center gap-2.5 rounded-xl bg-surface-alt px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-[11px] font-semibold text-white">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight text-gray-700">
              {user?.nombre || "Usuario"}
            </span>
            <span className="text-[11px] leading-tight text-gray-400">{user?.rol || ""}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="rounded-xl p-2 text-gray-400 transition-all duration-200 hover:bg-accent-light hover:text-accent"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
