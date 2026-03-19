import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-family-outfit",
});

export const metadata: Metadata = {
  title: "EvalSystem - Plataforma de Evaluaciones Técnicas",
  description:
    "Plataforma de evaluaciones técnicas para recursos humanos. Administra evaluaciones, gestiona candidatos y visualiza resultados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`h-full antialiased ${outfit.variable}`}>
      <body className={`flex min-h-full flex-col ${outfit.className}`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
