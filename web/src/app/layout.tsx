import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext"; // Importe o contexto de autenticação

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "INEOF",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> 
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
