import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FloatingThemeToggle } from "@/components/FloatingThemeToggle";
import { CursorGlow } from "@/components/CursorGlow";
import { ClickSound } from "@/components/ClickSound";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NoCarry — Fair grading for group projects",
  description: "Track contributions, eliminate freeloaders, and grade group projects fairly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('nc-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
      </head>
      <body className={`${sora.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <FloatingThemeToggle />
          <CursorGlow />
          <ClickSound />
        </ThemeProvider>
      </body>
    </html>
  );
}
