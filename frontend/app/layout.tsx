import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClienteLayout";

export const metadata: Metadata = {
  title: "IXC Frontend",
  description: "Frontend para o backend Nest/Mongo/NATS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-neutral-900 text-white min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
