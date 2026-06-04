import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HC Advogados - Sistema de Gestão",
  description: "Sistema de gestão jurídica - HENRIQUE CHAHINE ADVOGADOS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
