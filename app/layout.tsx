import type { Metadata } from "next";
import { FluentStyleRegistry } from "./FluentStyleRegistry";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABB | Asistente de reservas",
  description: "POC de asistente de reservas con interfaz rica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <FluentStyleRegistry>{children}</FluentStyleRegistry>
      </body>
    </html>
  );
}
