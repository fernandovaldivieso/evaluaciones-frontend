"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { revealContent } from "@/lib/animations";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (cardRef.current) {
        revealContent(cardRef.current, { duration: 0.7, y: 30 });
      }
    },
    { scope: cardRef }
  );

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-white lg:flex">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          EvalTech
        </Link>
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Plataforma de evaluaciones técnicas
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Administra evaluaciones, gestiona candidatos y visualiza resultados
            en tiempo real.
          </p>
        </div>
        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} EvalTech. Todos los derechos reservados.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-surface-alt px-4">
        <div ref={cardRef} className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="text-2xl font-bold text-primary">
              EvalTech
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
