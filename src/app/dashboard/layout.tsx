import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MobileNavLinks } from "./_components/NavLinks";
import { Sidebar } from "./_components/Sidebar";

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
          <MobileNavLinks role={dbUser.role} />
          <form action="/api/auth/logout" method="POST">
            <button style={{ color: "var(--th-text-2)" }} className="text-xs hover:opacity-70 transition cursor-pointer">
              Log out
            </button>
          </form>
        </nav>
      </header>

      {/* Desktop sidebar */}
      <Sidebar role={dbUser.role} name={dbUser.preferredName || dbUser.name} avatarUrl={dbUser.avatarUrl ?? null} />

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
