import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CTAButton } from "@/components/CTAButton";

const problems = [
  {
    title: "One person does everything",
    desc: "The same student carries the whole team while others coast.",
  },
  {
    title: "Grades feel random",
    desc: "Professors can't see who actually did the work. Everyone gets the same grade.",
  },
  {
    title: "Peer reviews are biased",
    desc: "Friends rate friends highly. Real contributors go unrecognized.",
  },
];

const features = [
  {
    title: "Contribution Scoring",
    desc: "Every task created, completed, and assigned is tracked. Scores are calculated automatically.",
  },
  {
    title: "Smart Peer Reviews",
    desc: "Students rate teammates on quality, communication, timeliness, and initiative. Anomalies are flagged.",
  },
  {
    title: "Freeloader Detection",
    desc: "Members with low activity, last-minute contributions, or mismatched peer ratings are flagged.",
  },
  {
    title: "AI Report Generator",
    desc: "Professors get an instant AI-written report with contribution analysis and grading suggestions.",
  },
  {
    title: "Kanban Task Board",
    desc: "Teams manage work in a clean board with To Do, In Progress, and Done columns.",
  },
  {
    title: "Professor Dashboard",
    desc: "Real-time visibility into every team's progress, contributions, and peer review scores.",
  },
];

export default function LandingPage() {
  return (
    <main
      style={{ background: "var(--th-bg)", color: "var(--th-text)" }}
      className="min-h-screen"
    >
      {/* Nav */}
      <nav
        style={{ borderBottom: "1px solid var(--th-border)" }}
        className="flex items-center justify-between px-8 py-4"
      >
        {/* Brand mark */}
        <Link href="/" className="nc-brand">
          <span className="nc-brand-dot" />
          <span className="nc-brand-text">
            No<span style={{ color: "var(--th-accent)" }}>Carry</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            style={{ color: "var(--th-text-2)" }}
            className="text-sm transition-opacity hover:opacity-70"
          >
            Log in
          </Link>
          <CTAButton
            href="/signup"
            style={{
              background: "var(--th-accent)",
              color: "var(--th-accent-fg)",
            }}
            className="text-sm px-4 py-2 rounded-md font-medium transition-[opacity,transform] hover:opacity-80 active:scale-95"
          >
            Get Started
          </CTAButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-28">
        <ScrollReveal className="w-full">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6 max-w-2xl mx-auto">
            Group projects,
            <br />
            finally fair.
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={120} className="w-full">
          <p
            style={{ color: "var(--th-text-2)" }}
            className="text-base max-w-md mx-auto mb-10 leading-relaxed"
          >
            Track real contributions, eliminate freeloaders, and give professors
            the data they need to grade fairly.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={240} className="w-full flex justify-center">
          <div className="flex flex-col sm:flex-row gap-3">
            <CTAButton
              href="/signup"
              style={{
                background: "var(--th-accent)",
                color: "var(--th-accent-fg)",
              }}
              className="text-sm font-medium px-7 py-3 rounded-md transition-[opacity,transform] hover:opacity-80 active:scale-95"
            >
              Start for free →
            </CTAButton>
            <CTAButton
              href="/login"
              style={{
                border: "1px solid var(--th-border)",
                color: "var(--th-text-2)",
              }}
              className="text-sm font-medium px-7 py-3 rounded-md transition-[opacity,transform] hover:opacity-70 active:scale-95"
            >
              Log in
            </CTAButton>
          </div>
        </ScrollReveal>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--th-border)" }} className="max-w-5xl mx-auto" />

      {/* Problem */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <ScrollReveal>
          <p style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest mb-12">
            The problem
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {problems.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 80}>
              <div>
                <div
                  style={{ background: "var(--th-accent)", width: "1.5rem", height: "2px" }}
                  className="mb-4"
                />
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p style={{ color: "var(--th-text-2)" }} className="text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--th-border)" }} className="max-w-5xl mx-auto" />

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <ScrollReveal>
          <p style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest mb-12">
            How NoCarry fixes it
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 60}>
              <div>
                <h3 className="font-bold text-base mb-1">{f.title}</h3>
                <p style={{ color: "var(--th-text-2)" }} className="text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--th-border)" }} className="max-w-5xl mx-auto" />

      {/* For Students / Professors */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <ScrollReveal>
            <div>
              <p style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest mb-8">
                For Students
              </p>
              <ul className="space-y-4">
                {[
                  "Protect yourself from carrying the team",
                  "Prove your contributions with real data",
                  "Rate teammates fairly and anonymously",
                  "Track your tasks and deadlines",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span style={{ color: "var(--th-accent)" }} className="font-bold shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div>
              <p style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest mb-8">
                For Professors
              </p>
              <ul className="space-y-4">
                {[
                  "See real engagement, not just final output",
                  "Get AI-generated grading reports instantly",
                  "Detect freeloaders with contribution flags",
                  "Monitor all teams from one dashboard",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span style={{ color: "var(--th-accent)" }} className="font-bold shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--th-border)" }} className="max-w-5xl mx-auto" />

      {/* CTA */}
      <section className="px-6 py-28 text-center">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Stop letting freeloaders win.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <p style={{ color: "var(--th-text-2)" }} className="text-base mb-10">
            Join NoCarry and make group work fair for everyone.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <CTAButton
            href="/signup"
            style={{
              background: "var(--th-accent)",
              color: "var(--th-accent-fg)",
            }}
            className="text-sm font-medium px-8 py-3 rounded-md transition-[opacity,transform] hover:opacity-80 active:scale-95 inline-block"
          >
            Create your free account →
          </CTAButton>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer
        style={{ borderTop: "1px solid var(--th-border)", color: "var(--th-text-2)" }}
        className="px-8 py-5 flex items-center justify-between text-xs"
      >
        <Link href="/" className="nc-brand">
          <span className="nc-brand-dot" style={{ width: "5px", height: "5px" }} />
          <span style={{ fontWeight: 600, fontSize: "0.75rem", color: "var(--th-text-2)" }}>
            NoCarry
          </span>
        </Link>
        <span>Built for students. Trusted by professors.</span>
      </footer>
    </main>
  );
}
