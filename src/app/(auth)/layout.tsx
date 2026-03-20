"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { revealContent } from "@/lib/animations";
import { Users, ClipboardCheck, TrendingUp, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (cardRef.current) {
        revealContent(cardRef.current, { duration: 0.7, y: 30 });
      }
    },
    { scope: cardRef }
  );

  useGSAP(
    () => {
      if (panelRef.current) {
        const items = panelRef.current.querySelectorAll("[data-anim]");
        const { gsap } = require("gsap");
        gsap.fromTo(
          items,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out", delay: 0.3 }
        );
      }
    },
    { scope: panelRef }
  );

  const features = [
    { icon: Users, label: "Gestión de candidatos", desc: "Administra perfiles y asignaciones" },
    { icon: ClipboardCheck, label: "Evaluaciones técnicas", desc: "Múltiples tipos de preguntas" },
    { icon: TrendingUp, label: "Ranking inteligente", desc: "Análisis con IA y comparativas" },
    { icon: ShieldCheck, label: "Proceso seguro", desc: "Control de tiempo y anti-fraude" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand + HR illustration */}
      <div
        ref={panelRef}
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex"
      >
        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/[0.03]" />
          <div className="absolute right-12 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/[0.04]" />
          {/* Dot grid pattern */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Top: Logo */}
        <div className="relative z-10" data-anim>
          <Link href="/" className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            EvalSystem
          </Link>
        </div>

        {/* Middle: Hero text + illustration */}
        <div className="relative z-10 space-y-8">
          <div data-anim>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Plataforma de Recursos Humanos</p>
            <h2 className="text-3xl font-bold leading-tight">
              Evalúa talento <br />
              con precisión
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              Simplifica tu proceso de selección con evaluaciones técnicas automatizadas, rankings inteligentes y análisis con IA.
            </p>
          </div>

          {/* HR-themed illustration: People silhouettes */}
          <div data-anim className="flex items-end gap-3">
            {[
              { h: "h-24", score: "92%", color: "bg-emerald-400/80" },
              { h: "h-16", score: "78%", color: "bg-sky-400/80" },
              { h: "h-20", score: "85%", color: "bg-violet-400/80" },
              { h: "h-12", score: "65%", color: "bg-amber-400/80" },
              { h: "h-28", score: "96%", color: "bg-emerald-300/80" },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-white/70">{bar.score}</span>
                <div className={`w-10 ${bar.h} rounded-t-lg ${bar.color} transition-all`} />
                {/* Person icon */}
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-white/40" />
                  <div className="mt-0.5 h-4 w-5 rounded-t-md bg-white/20" />
                </div>
              </div>
            ))}
          </div>

          {/* Feature chips */}
          <div data-anim className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-3 rounded-xl bg-white/[0.08] p-3.5 backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <f.icon className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/90">{f.label}</p>
                  <p className="mt-0.5 text-[11px] text-white/45">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center justify-between" data-anim>
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} EvalSystem. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sistema activo
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-surface-alt px-4">
        <div ref={cardRef} className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
              <ClipboardCheck className="h-6 w-6" />
              EvalSystem
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
