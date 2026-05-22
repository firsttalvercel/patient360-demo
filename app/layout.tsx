import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patient 360 — MuleSoft AI Demo for DocPlanner",
  description: "Appointments + Referrals unified in one AI-powered view. Powered by MuleSoft A2A Agent and MCP Referral Server.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0e1a]">
        {children}
      </body>
    </html>
  );
}
