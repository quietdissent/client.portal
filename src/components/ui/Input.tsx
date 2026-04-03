"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children?: React.ReactNode;
}

const baseInputClass = `
  w-full px-3 py-2 text-sm rounded-md
  bg-[#F5F4EF] border border-[#D8D6D1]
  text-[#1A1A1A] placeholder-[#7A7875]
  focus:outline-none focus:border-[#5F8575] focus:ring-1 focus:ring-[#5F8575]/30
  transition-colors duration-150
  disabled:opacity-50 disabled:cursor-not-allowed
`;

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          className="text-xs font-medium text-[#4A4A4A]"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          {label}
        </label>
      )}
      <input className={`${baseInputClass} ${className}`} {...props} />
      {error && (
        <p className="text-xs text-[#b35a44]">{error}</p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          className="text-xs font-medium text-[#4A4A4A]"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          {label}
        </label>
      )}
      <textarea
        className={`${baseInputClass} resize-none ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-[#b35a44]">{error}</p>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          className="text-xs font-medium text-[#4A4A4A]"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          {label}
        </label>
      )}
      <select
        className={`${baseInputClass} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-[#b35a44]">{error}</p>
      )}
    </div>
  );
}
