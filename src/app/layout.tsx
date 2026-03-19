import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EvalTech - Plataforma de Evaluaciones Técnicas",
  description:
    "Plataforma de evaluaciones técnicas para recursos humanos. Administra evaluaciones, gestiona candidatos y visualiza resultados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-[var(--font-outfit)]">
        {children}
      </body>
    </html>
  );
}
