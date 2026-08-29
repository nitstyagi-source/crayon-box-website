import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AppShellWrapper from "@/components/layout/AppShellWrapper";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "Crayon Box School | Excellence in Education",
  description: "Nurturing curious minds and building future leaders through innovative education.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen flex flex-col`}>
        <AppShellWrapper
          headerNode={<Header />}
          footerNode={<Footer />}
        >
          {children}
        </AppShellWrapper>
      </body>
    </html>
  );
}
