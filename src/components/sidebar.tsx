"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Trophy,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Users,
  Cpu,
  FolderKanban,
  BookOpen,
} from "lucide-react";
import { useState, useRef, useCallback, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import { staggerList } from "@/lib/animations";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Usuarios", href: "/usuarios", icon: Users, roles: ["Admin"] },
  { label: "Tecnologías", href: "/tecnologias", icon: Cpu, roles: ["Admin", "Evaluador"] },
  { label: "Evaluaciones", href: "/evaluations", icon: ClipboardList },
  { label: "Procesos", href: "/procesos", icon: FolderKanban, roles: ["Admin", "Evaluador"] },
  { label: "Ranking", href: "/ranking", icon: Trophy, roles: ["Admin", "Evaluador"] },
  { label: "Mis Sesiones", href: "/mis-sesiones", icon: BookOpen, roles: ["Candidato"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { user, logout } = useAuth();

  const navItems = useMemo(() => {
    if (!user) return [];
    return allNavItems.filter(
      (item) => !item.roles || item.roles.includes(user.rol)
    );
  }, [user]);

  useGSAP(
    () => {
      if (navRef.current) {
        staggerList(navRef.current.querySelectorAll("a"));
      }
    },
    { scope: navRef }
  );

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const initials = user?.nombre
    ? user.nombre
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header — gradient brand area */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary to-primary-dark px-4 py-5">
        {/* Decorative circles */}
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/5" />
        <div className="absolute -bottom-2 -left-3 h-14 w-14 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between">
          {!collapsed && (
            <Link
              href="/"
              className="flex items-center gap-2.5 text-white"
              onClick={closeMobile}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-sm font-bold backdrop-blur-sm">
                E
              </div>
              <span className="text-lg font-bold tracking-tight">
                EvalSystem
              </span>
            </Link>
          )}
          {collapsed && (
            <Link
              href="/"
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-sm font-bold text-white backdrop-blur-sm"
              onClick={closeMobile}
            >
              E
            </Link>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white md:inline-flex"
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 space-y-1 px-3 py-4">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Menú
          </p>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-gray-500 hover:bg-primary-50 hover:text-primary"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-white" : ""
                }`}
              />
              {(!collapsed || mobileOpen) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout footer */}
      <div className="border-t border-border-light px-3 pb-4 pt-3">
        {!collapsed && user && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-surface-alt px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {user.nombre}
              </p>
              <p className="text-[11px] text-gray-400">{user.rol}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-accent-light hover:text-accent"
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {(!collapsed || mobileOpen) && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-xl border border-border bg-surface p-2 shadow-sm transition-colors hover:bg-primary-50 md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer — floating rounded card */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="m-2 flex h-[calc(100%-16px)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-elevated)]">
          {sidebarContent}
        </div>
      </aside>

      {/* Desktop sidebar — floating rounded card */}
      <aside
        className={`hidden md:block transition-all duration-300 ${
          collapsed ? "w-[calc(4rem+16px)]" : "w-[calc(16rem+16px)]"
        }`}
      >
        <div
          className={`m-2 flex h-[calc(100vh-16px)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-elevated)] transition-all duration-300 ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
