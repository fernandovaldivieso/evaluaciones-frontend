"use client";

import Link from "next/link";
import { Mail, Lock, User, UserPlus } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Crear cuenta</h1>
        <p className="mt-2 text-sm text-gray-500">
          Regístrate en la plataforma de evaluaciones
        </p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
            Nombre completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1b4965] focus:outline-none focus:ring-1 focus:ring-[#1b4965]"
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
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1b4965] focus:outline-none focus:ring-1 focus:ring-[#1b4965]"
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
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1b4965] focus:outline-none focus:ring-1 focus:ring-[#1b4965]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1b4965] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#153e56]"
        >
          <UserPlus className="h-4 w-4" />
          Crear cuenta
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-[#1b4965] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
