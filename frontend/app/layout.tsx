import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClienteLayout";

export const metadata: Metadata = {
  title: "IXC Frontend",
  description: "Frontend para o backend Nest/Mongo/NATS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-black-100 text-white min-h-screen" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}