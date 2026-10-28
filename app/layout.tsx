import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Vignan EventHub",
  description:
    "College ID login, registration, and campus event workspace for Vignan university with event workflows, attendance scanner, and certificate verification.",
  openGraph: {
    title: "Vignan EventHub",
    description:
      "College ID login, registration, and campus event workspace for Vignan university with event workflows, attendance scanner, and certificate verification.",
    siteName: "Vignan EventHub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <AppProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AppProvider>
      </body>
    </html>
  );
}
