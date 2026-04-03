"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-[#5F8575] text-white hover:bg-[#4e7062] border border-[#5F8575] hover:border-[#4e7062]",
  secondary:
    "bg-[#EDECEA] text-[#1A1A1A] hover:bg-[#E5E3DE] border border-[#D8D6D1]",
  ghost:
    "bg-transparent text-[#4A4A4A] hover:bg-[#EDECEA] border border-transparent",
  danger:
    "bg-transparent text-[#b35a44] hover:bg-red-50 border border-[#b35a44]/30 hover:border-[#b35a44]",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md font-medium
        transition-colors duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
