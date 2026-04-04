"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  {
    href: "/admin/clients",
    label: "Clients",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 14c0-3 2-5 5-5h0c3 0 5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 2c1.5.5 2.5 1.8 2.5 3.5 0 1.3-.7 2.5-1.8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 11c1.5.5 3 1.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/documents/new",
    label: "New Document",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 7v4M6 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-[#D8D6D1] bg-[#111111] h-screen sticky top-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <p
            className="text-lg tracking-tight text-[#FFFFF0]"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Quiet Dissent
          </p>
          <p
            className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Admin
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
                      ? "bg-[#5F8575]/20 text-[#5F8575]"
                      : "text-white/60 hover:bg-white/5 hover:text-[#FFFFF0]"
                  }
                `}
              >
                <span
                  className={isActive ? "text-[#5F8575]" : "text-white/40"}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/10">
          <UserButton
            appearance={{
              variables: { colorPrimary: "#5F8575" },
              elements: {
                userButtonTrigger: "focus:shadow-none",
                userButtonBox: "flex-row-reverse gap-2",
                userButtonOuterIdentifier:
                  "text-white text-sm font-normal truncate max-w-[120px]",
                userButtonAvatarBox:
                  "ring-1 ring-white/30 rounded-full shrink-0",
              },
            }}
            showName
          />
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-[#D8D6D1] bg-[#111111]">
        <span
          className="text-[#FFFFF0]"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Admin
        </span>
        <div className="flex items-center gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white/60 hover:text-[#FFFFF0] transition-colors"
            >
              {item.icon}
            </Link>
          ))}
          <UserButton appearance={{ variables: { colorPrimary: "#5F8575" } }} />
        </div>
      </header>
    </>
  );
}
