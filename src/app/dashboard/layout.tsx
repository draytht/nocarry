import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) redirect("/login");

  return (
    <div
      style={{ background: "var(--th-bg)", color: "var(--th-text)" }}
      className="min-h-screen flex flex-col md:flex-row"
    >
      {/* Mobile top bar */}
      <header
        style={{ background: "var(--th-card)", borderBottom: "1px solid var(--th-border)" }}
        className="md:hidden flex items-center justify-between px-4 py-3 shrink-0"
      >
        <Link href="/" className="nc-brand">
          <span className="nc-brand-dot" />
          <span className="nc-brand-text">
            No<span style={{ color: "var(--th-accent)" }}>Carry</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {dbUser.role === "STUDENT" && (
            <Link href="/dashboard/projects" style={{ color: "var(--th-text-2)" }} className="text-xs hover:opacity-70 transition">Projects</Link>
          )}
          {dbUser.role === "PROFESSOR" && (
            <Link href="/dashboard/courses" style={{ color: "var(--th-text-2)" }} className="text-xs hover:opacity-70 transition">Courses</Link>
          )}
          <form action="/api/auth/logout" method="POST">
            <button style={{ color: "var(--th-text-2)" }} className="text-xs hover:opacity-70 transition cursor-pointer">
              Log out
            </button>
          </form>
        </nav>
      </header>

      {/* Desktop sidebar */}
      <aside
        style={{
          background: "var(--th-card)",
          borderRight: "1px solid var(--th-border)",
        }}
        className="hidden md:flex w-52 shrink-0 px-3 py-6 flex-col gap-1"
      >
        <Link href="/" className="nc-brand px-3 mb-6">
          <span className="nc-brand-dot" />
          <span className="nc-brand-text">
            No<span style={{ color: "var(--th-accent)" }}>Carry</span>
          </span>
        </Link>

        <Link href="/dashboard" className="nc-nav-link">Dashboard</Link>

        {dbUser.role === "STUDENT" && (
          <Link href="/dashboard/projects" className="nc-nav-link">My Projects</Link>
        )}

        {dbUser.role === "PROFESSOR" && (
          <Link href="/dashboard/courses" className="nc-nav-link">My Courses</Link>
        )}

        <div
          style={{ borderTop: "1px solid var(--th-border)" }}
          className="mt-auto pt-4 space-y-3 px-3"
        >
          <div>
            <p style={{ color: "var(--th-text)" }} className="text-xs">{dbUser.name}</p>
            <p style={{ color: "var(--th-text-2)" }} className="text-xs capitalize">{dbUser.role.toLowerCase()}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              style={{ color: "var(--th-text-2)" }}
              className="text-xs hover:opacity-70 transition cursor-pointer"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
