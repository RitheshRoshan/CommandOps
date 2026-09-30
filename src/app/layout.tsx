import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommandOps — Discord Command Operations Center",
  description: "Discord is the interface. CommandOps is the control plane.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
