import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/layout/NextAuthProvider";
import Header from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Moscar Garage",
  description: "Your trusted partner in auto care.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <NextAuthProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Header />
          <main>{children}</main>
        </NextAuthProvider>
      </body>
    </html>
  );
}
