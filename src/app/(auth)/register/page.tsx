"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, UserPlus, Loader2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { staggerList } from "@/lib/animations";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ROLES } from "@/utils/constants";

export default function RegisterPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState(3);

  useGSAP(
    () => {
      if (formRef.current) {
        staggerList(formRef.current.querySelectorAll(":scope > div, :scope > button"), {
          stagger: 0.08,
          y: 12,
        });
      }
    },
    { scope: formRef }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password) {
      toast.error("Completa todos los campos");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      await register({ nombre, email, password, rol });
    } catch {
      // error already toasted in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Crear cuenta</h1>
        <p className="mt-2 text-sm text-gray-500">
          Regístrate en la plataforma de evaluaciones
        </p>
      </div>

      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
            Nombre completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="name"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              required
              maxLength={200}
              className="w-full rounded-lg border border-border bg-surface-alt py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              maxLength={256}
              className="w-full rounded-lg border border-border bg-surface-alt py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              maxLength={128}
              className="w-full rounded-lg border border-border bg-surface-alt py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="rol" className="mb-1.5 block text-sm font-medium text-gray-700">
            Tipo de cuenta
          </label>
          <select
            id="rol"
            value={rol}
            onChange={(e) => setRol(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-surface-alt py-2.5 px-4 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {Object.entries(ROLES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-dark hover:scale-[1.01] active:scale-100 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
