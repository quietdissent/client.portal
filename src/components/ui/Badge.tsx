"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "muted" | "warning" | "error";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default:
    "bg-[#E5E3DE] text-[#4A4A4A] border border-[#D8D6D1]",
  accent:
    "bg-[#5F8575]/10 text-[#5F8575] border border-[#5F8575]/20",
  muted:
    "bg-[#EDECEA] text-[#7A7875] border border-[#D8D6D1]",
  warning:
    "bg-amber-50 text-amber-700 border border-amber-200",
  error:
    "bg-red-50 text-red-700 border border-red-200",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md ${variantStyles[variant]} ${className}`}
      style={{ fontFamily: "var(--font-dm-mono), monospace" }}
    >
      {children}
    </span>
  );
}
