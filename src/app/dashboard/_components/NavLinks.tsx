"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ role }: { role: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function navLink(href: string, label: string) {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className="nc-nav-link"
        style={
          active
            ? {
                color: "var(--th-accent)",
                background: "color-mix(in srgb, var(--th-accent) 12%, transparent)",
              }
            : {}
        }
      >
        {label}
      </Link>
    );
  }

  return (
    <>
      {navLink("/dashboard", "Dashboard")}
      {navLink("/dashboard/profile", "Profile")}
      {role === "STUDENT" && navLink("/dashboard/projects", "My Projects")}
      {role === "PROFESSOR" && navLink("/dashboard/courses", "My Courses")}
      {role === "TEAM_LEADER" && navLink("/dashboard/projects", "My Projects")}
    </>
  );
}

export function MobileNavLinks({ role }: { role: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function mobileLink(href: string, label: string) {
    const active = isActive(href);
    return (
      <Link
        href={href}
        style={{ color: active ? "var(--th-accent)" : "var(--th-text-2)" }}
        className="text-xs hover:opacity-70 transition"
      >
        {label}
      </Link>
    );
  }

  return (
    <>
      {role === "STUDENT" && mobileLink("/dashboard/projects", "Projects")}
      {role === "PROFESSOR" && mobileLink("/dashboard/courses", "Courses")}
      {role === "TEAM_LEADER" && mobileLink("/dashboard/projects", "Projects")}
      {mobileLink("/dashboard/profile", "Profile")}
    </>
  );
}
