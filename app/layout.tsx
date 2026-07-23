import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { FluentStyleRegistry } from "./FluentStyleRegistry";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "ABB | Punto de contacto",
  description: "Interfaz para adjuntar imagenes y PDFs para el equipo ABB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={sora.variable}>
        <FluentStyleRegistry>{children}</FluentStyleRegistry>
      </body>
    </html>
  );
}
