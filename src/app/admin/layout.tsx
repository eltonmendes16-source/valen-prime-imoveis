import type { Metadata, Viewport } from "next";
import { RegistraApp } from "@/components/admin/RegistraApp";
export const metadata: Metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
  manifest: "/crm/manifest.webmanifest",
  icons: { apple: "/crm/icon-192.png" },
  appleWebApp: { capable: true, title: "Valen CRM", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#171513" };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-snow"><RegistraApp />{children}</div>;
}
