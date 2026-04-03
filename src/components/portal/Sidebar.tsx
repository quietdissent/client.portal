"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/portal/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/portal/documents",
    label: "Documents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/portal/messages",
    label: "Messages",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 3h12v9H9l-3 2v-2H2V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/portal/schedule",
    label: "Schedule",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 1v4M11 1v4M1 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 border-r border-[#D8D6D1] bg-[#EDECEA] h-screen sticky top-0"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#D8D6D1]">
          <p
            className="text-lg tracking-tight text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Quiet Dissent
          </p>
          <p
            className="text-[10px] text-[#7A7875] uppercase tracking-widest mt-0.5"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Client Portal
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-100
                  ${
                    isActive
                      ? "bg-[#5F8575]/10 text-[#5F8575] font-medium"
                      : "text-[#4A4A4A] hover:bg-[#E5E3DE] hover:text-[#1A1A1A]"
                  }
                `}
              >
                <span className={isActive ? "text-[#5F8575]" : "text-[#7A7875]"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-[#D8D6D1]">
          <UserButton
            appearance={{
              variables: { colorPrimary: "#5F8575" },
              elements: { userButtonBox: "w-full justify-start" },
            }}
            showName
          />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 border-t border-[#D8D6D1] bg-[#EDECEA]"
      >
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-[10px] transition-colors ${
                isActive
                  ? "text-[#5F8575]"
                  : "text-[#7A7875]"
              }`}
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
