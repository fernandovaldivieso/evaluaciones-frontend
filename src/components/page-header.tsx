"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  /** Breadcrumb path segments */
  breadcrumbs: BreadcrumbItem[];
  /** Page title (h1) */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional action button or element on the right side */
  action?: React.ReactNode;
  /** Optional back button — navigates to this href */
  backHref?: string;
  /** Optional metadata badges below the title */
  children?: React.ReactNode;
}

export default function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  action,
  backHref,
  children,
}: PageHeaderProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
      {/* Decorative background elements */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/[0.03]" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/[0.03]" />
      <div className="absolute right-24 top-8 h-16 w-16 rounded-full bg-accent/[0.03]" />

      <div className="relative px-6 py-5">
        {/* Breadcrumb trail */}
        <nav className="mb-3 flex items-center gap-1 text-xs text-gray-400">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 text-gray-300" />}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-primary"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-medium text-gray-600" : ""}>
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>

        {/* Back button + Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {backHref && (
              <Link
                href={backHref}
                className="mb-2 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver
              </Link>
            )}
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
            {children && <div className="mt-2.5">{children}</div>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}
